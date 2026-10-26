import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

MODEL_PATH = os.path.join(os.path.dirname(__file__), "attrition_model.joblib")
FEATURES = ["salary", "years_at_company", "satisfaction", "overtime_hours", "years_since_promotion", "performance"]


def make_training_data(n=2000, seed=42):
    """Synthetic HR data. Replace with a real dataset (e.g. IBM HR Attrition CSV) if you have one."""
    rng = np.random.default_rng(seed)
    df = pd.DataFrame({
        "salary": rng.normal(60000, 20000, n).clip(20000, 150000),
        "years_at_company": rng.uniform(0, 15, n),
        "satisfaction": rng.uniform(1, 5, n),
        "overtime_hours": rng.uniform(0, 60, n),
        "years_since_promotion": rng.uniform(0, 8, n),
        "performance": rng.uniform(1, 5, n),
    })
    # Attrition is more likely with low satisfaction, heavy overtime, no promotion, low pay
    score = (
        (5 - df.satisfaction) * 0.5
        + df.overtime_hours / 60 * 1.2
        + df.years_since_promotion / 8 * 1.0
        + (80000 - df.salary) / 60000 * 0.8
        + rng.normal(0, 0.4, n)
    )
    df["left"] = (score > score.quantile(0.75)).astype(int)
    return df


def train_model():
    df = make_training_data()
    X_train, X_test, y_train, y_test = train_test_split(df[FEATURES], df["left"], test_size=0.2, random_state=1)
    model = RandomForestClassifier(n_estimators=150, max_depth=8, random_state=1)
    model.fit(X_train, y_train)
    accuracy = accuracy_score(y_test, model.predict(X_test))
    joblib.dump(model, MODEL_PATH)
    return accuracy


def predict_risk(values: dict) -> float:
    if not os.path.exists(MODEL_PATH):
        train_model()
    model = joblib.load(MODEL_PATH)
    row = pd.DataFrame([[values[f] for f in FEATURES]], columns=FEATURES)
    return float(model.predict_proba(row)[0][1])


def risk_level(score: float) -> str:
    if score >= 0.7:
        return "High"
    if score >= 0.4:
        return "Medium"
    return "Low"
