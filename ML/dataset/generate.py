import random
import pandas as pd

# -----------------------------
# BASIC OPTIONS
# -----------------------------

AGES = list(range(18, 50))

HOME_COUNTRIES = ["India", "Brazil", "Nigeria", "Philippines", "Mexico"]
DEST_COUNTRIES = ["USA", "Canada", "Germany", "UK", "Australia"]

EDUCATION = ["HighSchool", "Bachelors", "Masters"]
EMPLOYMENT = ["Unemployed", "Employed"]
PURPOSE = ["Study", "Work", "Tourist", "Business"]
ENGLISH = ["Low", "Medium", "High"]

# -----------------------------
# COUNTRY VISA DIFFICULTY
# (Higher = Harder)
# -----------------------------

COUNTRY_DIFFICULTY = {
    "USA": 0.85,        # Hard
    "Australia": 0.80, # Hard
    "UK": 0.70,        # Medium-Hard
    "Canada": 0.65,    # Medium
    "Germany": 0.60    # Medium
}

# -----------------------------
# SINGLE ROW GENERATOR
# -----------------------------

def generate_row():
    age = random.choice(AGES)
    home_country = random.choice(HOME_COUNTRIES)
    destination_country = random.choice(DEST_COUNTRIES)
    education = random.choice(EDUCATION)
    employment = random.choice(EMPLOYMENT)
    monthly_income = random.randint(5000, 100000)
    travel_purpose = random.choice(PURPOSE)
    travel_history = random.choice([0, 1, 2, 3])
    criminal_record = random.choices([0, 1], weights=[90, 10])[0]
    english_level = random.choice(ENGLISH)

    # -----------------------------
    # SCORING SYSTEM (EXPLAINABLE AI)
    # -----------------------------

    score = 0

    # Income scoring
    if monthly_income >= 50000:
        score += 3
    elif monthly_income >= 30000:
        score += 2
    elif monthly_income >= 15000:
        score += 1

    # Education scoring
    if education == "Masters":
        score += 3
    elif education == "Bachelors":
        score += 2
    else:
        score += 1

    # Employment
    if employment == "Employed":
        score += 2

    # Travel history
    score += travel_history

    # English proficiency
    if english_level == "High":
        score += 2
    elif english_level == "Medium":
        score += 1

    # Criminal record penalty
    if criminal_record == 1:
        score -= 5

    # -----------------------------
    # COUNTRY-AWARE DECISION
    # -----------------------------

    difficulty = COUNTRY_DIFFICULTY[destination_country]
    threshold = 7 + int(difficulty * 3)

    visa_approved = 1 if score >= threshold else 0

    return [
        age,
        home_country,
        destination_country,
        education,
        employment,
        monthly_income,
        travel_purpose,
        travel_history,
        criminal_record,
        english_level,
        visa_approved
    ]

# -----------------------------
# GENERATE DATASET (7500 ROWS)
# -----------------------------

rows = []

for _ in range(8761):   # ✅ FINAL ROW COUNT
    rows.append(generate_row())

columns = [
    "age",
    "home_country",
    "destination_country",
    "education",
    "employment",
    "monthly_income",
    "travel_purpose",
    "travel_history",
    "criminal_record",
    "english_level",
    "visa_approved"
]

df = pd.DataFrame(rows, columns=columns)
df.to_csv("visa_dataset.csv", index=False)

print("✅ 7500-row country-aware dataset generated successfully: visa_dataset.csv")
