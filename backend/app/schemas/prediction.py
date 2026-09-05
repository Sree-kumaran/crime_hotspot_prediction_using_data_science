from pydantic import BaseModel, Field


class PredictionRequest(BaseModel):
    location: str = Field(..., min_length=2)
    latitude: float
    longitude: float
    date: str
    time: str
    crime_type: str
    day_of_week: str


class PredictionResponse(BaseModel):
    prediction: str
    risk_score: float
    confidence: float
    risk_level: str
    timestamp: str