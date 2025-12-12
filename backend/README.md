# VisaVerse FastAPI Service

Machine learning scoring API that returns visa approval likelihoods using a trained model plus rule-based adjustments.

## Setup
1. Install Python 3.10+ and required packages:
```
pip install -r requirements.txt
```
2. Ensure model artifacts exist:
- model/visa_model.pkl
- model/label_encoder.pkl

3. Run locally:
```
uvicorn main:app --reload --port 10000
```

## Environment
No required env vars for core serving. Override port via uvicorn flags. CORS is open (`allow_origins=["*"]`) by default.

## Endpoints
- `GET /` — health probe returns status JSON.
- `POST /predict` — accepts JSON body:
```
{
  "age": 30,
  "home_country": "India",
  "destination_country": "USA",
  "education": "Masters",          // HighSchool | Bachelors | Masters
  "employment": "Employed",        // Employed | Unemployed
  "monthly_income": 60000,
  "travel_purpose": "Work",        // Study | Work | Tourism | Business
  "travel_history": 2,               // integer count
  "criminal_record": 0,              // 0 | 1
  "english_level": "High"          // Low | Medium | High
}
```
Response (fields condensed):
```
{
  "visa_approved": 1,
  "approval_probability": 78.5,   // percent after difficulty + risk rules
  "status": "High",               // High | Medium | Low blending ML + rules
  "profile_strength_score": 72,
  "rejection_reasons": ["Low travel history ..."],
  "alternate_country_suggestions": [
    {"country": "Canada", "estimated_probability": 82.1}
  ]
}
```

## Logic Highlights
- Encodes categorical fields using saved `label_encoder.pkl`; unseen labels fall back to 0.
- Probability is adjusted by destination difficulty and criminal-record penalty.
- Rule-based profile strength determines final status alongside ML probability.
- Suggests up to two easier alternative countries.

## Deployment Notes
- `render.yaml` configured for Render; ensure model/ assets ship with the container.
- Keep the model and encoder paths relative to `backend/model/`.
