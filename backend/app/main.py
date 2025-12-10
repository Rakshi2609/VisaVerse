from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import joblib
import pandas as pd

# ======================================================
# LOAD MODEL + ENCODER
# ======================================================

model = joblib.load("../model/visa_model.pkl")
encoder = joblib.load("../model/label_encoder.pkl")

# ======================================================
# FASTAPI APP CONFIG
# ======================================================

app = FastAPI(title="AI Visa Approval Predictor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ======================================================
# INPUT SCHEMA
# ======================================================

class VisaInput(BaseModel):
    age: int
    home_country: str
    destination_country: str
    education: str
    employment: str
    monthly_income: int
    travel_purpose: str
    travel_history: int
    criminal_record: int
    english_level: str


# ======================================================
# COUNTRY DIFFICULTY SCORES
# ======================================================

COUNTRY_DIFFICULTY = {
    "USA": 0.90,
    "Australia": 0.85,
    "UK": 0.75,
    "Canada": 0.65,
    "Germany": 0.60,
}

# ======================================================
# PROFILE STRENGTH SCORING
# ======================================================

def calculate_profile_strength(data):
    score = 0

    if data["monthly_income"] >= 80000:
        score += 30
    elif data["monthly_income"] >= 50000:
        score += 25
    elif data["monthly_income"] >= 30000:
        score += 18
    elif data["monthly_income"] >= 15000:
        score += 10

    if data["education"] == "Masters":
        score += 20
    elif data["education"] == "Bachelors":
        score += 15
    else:
        score += 5

    if data["employment"] == "Employed":
        score += 15

    score += data["travel_history"] * 5

    if data["english_level"] == "High":
        score += 10
    elif data["english_level"] == "Medium":
        score += 5

    if data["criminal_record"] == 1:
        score -= 40

    return max(0, min(100, score))


# ======================================================
# REJECTION REASONS SYSTEM
# ======================================================

def generate_rejection_reasons(data):
    reasons = []

    if data["monthly_income"] < 20000:
        reasons.append("Low monthly income compared to destination requirements.")

    if data["education"] == "HighSchool":
        reasons.append("Lower education level reduces visa strength.")

    if data["employment"] == "Unemployed":
        reasons.append("Unemployed applicants are considered high risk.")

    if data["travel_history"] == 0:
        reasons.append("No international travel history.")

    if data["english_level"] == "Low":
        reasons.append("Low English proficiency affects visa credibility.")

    if data["criminal_record"] == 1:
        reasons.append("Criminal record significantly reduces approval chances.")

    return reasons


# ======================================================
# ALTERNATE COUNTRY SUGGESTOR (WITH %)
# ======================================================

def suggest_alternate_countries(profile_strength, chosen, base_probability):
    suggestions = []
    chosen_diff = COUNTRY_DIFFICULTY[chosen]

    for country, diff in COUNTRY_DIFFICULTY.items():
        if diff < chosen_diff:

            adj_prob = base_probability

            if diff <= 0.60:
                adj_prob *= 1.15
            elif diff <= 0.65:
                adj_prob *= 1.10
            elif diff <= 0.75:
                adj_prob *= 1.05

            adj_prob = max(0, min(adj_prob, 1))

            suggestions.append({
                "country": country,
                "estimated_probability": round(adj_prob * 100, 2)
            })

    suggestions = sorted(
        suggestions,
        key=lambda x: x["estimated_probability"],
        reverse=True,
    )

    return suggestions[:2]


# ======================================================
# ROOT CHECK
# ======================================================

@app.get("/")
def root():
    return {"status": "Visa AI Backend is running 🚀"}


# ======================================================
# MAIN PREDICTION ENDPOINT
# ======================================================

@app.post("/predict")
def predict_visa(data: VisaInput):

    input_dict = data.dict()

    # --------------------------
    # HARD VALIDATIONS
    # --------------------------

    if data.age < 18:
        return {
            "visa_approved": 0,
            "approval_probability": 0.0,
            "status": "Low",
            "profile_strength_score": 0,
            "rejection_reasons": ["Applicant must be at least 18 years old."],
            "alternate_country_suggestions": [],
        }

    if data.monthly_income < 10000:
        return {
            "visa_approved": 0,
            "approval_probability": 5.0,
            "status": "Low",
            "profile_strength_score": 10,
            "rejection_reasons": ["Income too low for minimum visa requirements."],
            "alternate_country_suggestions": [],
        }

    # --------------------------
    # ✅ ML PREDICTION (FIXED)
    # --------------------------

    df = pd.DataFrame([input_dict])

    categorical_cols = [
        "home_country",
        "destination_country",
        "education",
        "employment",
        "travel_purpose",
        "english_level",
    ]

    # ✅ FIX 1: NEVER use fit_transform here
    for col in categorical_cols:
        try:
            df[col] = encoder.transform(df[col])
        except:
            df[col] = 0  # fallback for unseen labels (safe for demo)

    prediction = model.predict(df)[0]

    # ✅ FIX 2: Correct probability of APPROVED class only
    prob_array = model.predict_proba(df)[0]
    probability = float(prob_array[1])

    # --------------------------
    # COUNTRY DIFFICULTY ADJUSTMENT
    # --------------------------

    difficulty = COUNTRY_DIFFICULTY[input_dict["destination_country"]]

    if difficulty >= 0.85:
        probability *= 0.82
    elif difficulty >= 0.75:
        probability *= 0.90
    else:
        probability *= 0.97

    probability = max(0, min(probability, 1))

    # --------------------------
    # CRIMINAL RECORD PENALTY
    # --------------------------

    if input_dict["criminal_record"] == 1:
        probability *= 0.40

    probability = max(0, min(probability, 1))

    # --------------------------
    # PROFILE STRENGTH
    # --------------------------

    profile_strength = calculate_profile_strength(input_dict)
    rejection_reasons = generate_rejection_reasons(input_dict)

    if profile_strength >= 75:
        rule_status = "High"
    elif profile_strength >= 45:
        rule_status = "Medium"
    else:
        rule_status = "Low"

    if probability > 0.75:
        ml_status = "High"
    elif probability > 0.50:
        ml_status = "Medium"
    else:
        ml_status = "Low"

    if ml_status == "High" and rule_status == "High":
        status = "High"
    elif ml_status in ["High", "Medium"] and rule_status in ["High", "Medium"]:
        status = "Medium"
    else:
        status = "Low"

    # --------------------------
    # ALTERNATE COUNTRIES WITH %
    # --------------------------

    alternate_countries = []

    if status in ["Low", "Medium", "High"]:
        alternate_countries = suggest_alternate_countries(
            profile_strength,
            input_dict["destination_country"],
            probability
        )

    # --------------------------
    # RESPONSE
    # --------------------------

    return {
        "visa_approved": int(prediction),
        "approval_probability": round(probability * 100, 2),
        "status": status,
        "profile_strength_score": profile_strength,
        "rejection_reasons": rejection_reasons,
        "alternate_country_suggestions": alternate_countries,
    }
