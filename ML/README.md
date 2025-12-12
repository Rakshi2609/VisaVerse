# VisaVerse ML Workspace

Resources for data preparation and model training that feed the FastAPI scorer.

## Contents
- `visa_model_training.ipynb` — notebook to explore data, train the classifier, and export `visa_model.pkl` plus `label_encoder.pkl` to backend/model/.
- `dataset/visa_dataset.csv` — sample dataset.
- `dataset/generate.py` — synthetic data generator.
- `requirements.txt` — packages for experimentation (pandas, scikit-learn, matplotlib, google-generativeai, FastAPI).

## Quick Start
```
python -m venv .venv
source .venv/bin/activate   # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
jupyter notebook visa_model_training.ipynb
```

## Exporting Artifacts
- Train in the notebook, then save `visa_model.pkl` and `label_encoder.pkl`.
- Copy the artifacts into `backend/model/` before starting the FastAPI service.

## Notes
- Keep features consistent with backend/main.py (age, home_country, destination_country, education, employment, monthly_income, travel_purpose, travel_history, criminal_record, english_level).
- Ensure categorical encoders are persisted to handle consistent label mapping at inference.
