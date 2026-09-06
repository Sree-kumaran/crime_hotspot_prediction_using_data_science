from pydantic import BaseModel, Field
from datetime import date as Date, datetime as DateTime
from typing import List, Optional


class HotspotPredictionRequest(BaseModel):
    prediction_date: Optional[Date] = None
    # Incident-specific fields
    crime_type: Optional[str] = "theft"
    date: Optional[Date] = None
    time: Optional[str] = "12:00"
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    severity: Optional[str] = "Moderate"
    description: Optional[str] = None


class IncidentPredictionRequest(BaseModel):
    crime_type: str = Field(..., description="Crime category e.g. theft, assault, robbery, burglary")
    date: Date = Field(..., description="Date of crime incident YYYY-MM-DD")
    time: Optional[str] = Field("12:00", description="Time of crime incident HH:MM")
    latitude: float = Field(..., ge=40.496, le=40.916, description="NYC Latitude coordinates")
    longitude: float = Field(..., ge=-74.259, le=-73.695, description="NYC Longitude coordinates")
    severity: Optional[str] = Field("Moderate", description="Severity level High, Moderate, Low")
    description: Optional[str] = Field(None, description="Optional incident description notes")


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
    overall_risk_score: Optional[float] = None
    overall_risk_level: Optional[str] = None
    highest_risk_location: Optional[HighestRiskLocation] = None


class ModelInfo(BaseModel):
    name: str
    version: str


class HotspotPredictionResponse(BaseModel):
    prediction_date: Date
    generated_at: DateTime
    model: ModelInfo
    summary: HotspotSummary
    hotspots: List[HotspotItem]