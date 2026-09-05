from datetime import datetime


def predict(payload: dict):
    # Placeholder logic for now (replace with ML model later)
    lat = payload.get("latitude", 0)
    lon = payload.get("longitude", 0)
    base = abs(lat + lon) % 1

    risk_score = round(0.55 + (base * 0.4), 2)
    risk_level = "High" if risk_score >= 0.75 else "Moderate"
    prediction = f"{risk_level} Risk"

    return {
        "prediction": prediction,
        "risk_score": risk_score,
        "confidence": round(min(0.95, risk_score + 0.08), 2),
        "risk_level": risk_level,
        "timestamp": datetime.utcnow().isoformat()
    }