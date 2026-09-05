from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import List, Optional


class HotspotPredictionRequest(BaseModel):
    prediction_date: date


class HotspotItem(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    predicted_intensity: float
    risk_score: float = Field(..., ge=0, le=1)
    risk_level: str


class HighestRiskLocation(BaseModel):
    latitude: float
    longitude: float
    predicted_intensity: float
    risk_score: float
    risk_level: str


class HotspotSummary(BaseModel):
    total_hotspots: int
    high_risk: int
    medium_risk: int
    low_risk: int
    highest_risk_location: Optional[HighestRiskLocation] = None


class ModelInfo(BaseModel):
    name: str
    version: str


class HotspotPredictionResponse(BaseModel):
    prediction_date: date
    generated_at: datetime
    model: ModelInfo
    summary: HotspotSummary
    hotspots: List[HotspotItem]