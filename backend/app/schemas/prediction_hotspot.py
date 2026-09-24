from pydantic import BaseModel, Field, ConfigDict
from datetime import date as Date, datetime as DateTime
from typing import List, Optional, Dict, Any


class HotspotPredictionRequest(BaseModel):
    model_config = ConfigDict(extra="allow")

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
    model_config = ConfigDict(extra="allow")

    crime_type: str = Field(..., description="Crime category e.g. theft, assault, robbery, burglary")
    date: Date = Field(..., description="Date of crime incident YYYY-MM-DD")
    time: Optional[str] = Field("12:00", description="Time of crime incident HH:MM")
    latitude: float = Field(..., ge=40.496, le=40.916, description="NYC Latitude coordinates")
    longitude: float = Field(..., ge=-74.259, le=-73.695, description="NYC Longitude coordinates")
    severity: Optional[str] = Field("Moderate", description="Severity level High, Moderate, Low")
    description: Optional[str] = Field(None, description="Optional incident description notes")


class HotspotItem(BaseModel):
    model_config = ConfigDict(extra="allow")

    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    predicted_intensity: float
    risk_score: float = Field(..., ge=0, le=1)
    risk_level: str
    rank: Optional[int] = None
    borough: Optional[str] = None
    location_name: Optional[str] = None
    predicted_crime_types: Optional[Dict[str, float]] = None
    peak_risk_hours: Optional[str] = None


class HighestRiskLocation(BaseModel):
    model_config = ConfigDict(extra="allow")

    latitude: float
    longitude: float
    predicted_intensity: float
    risk_score: float
    risk_level: str
    borough: Optional[str] = None
    location_name: Optional[str] = None
    predicted_crime_types: Optional[Dict[str, float]] = None


class MostLikelyNextCrime(BaseModel):
    model_config = ConfigDict(extra="allow")

    latitude: float
    longitude: float
    borough: str
    location_name: str
    risk_score: float
    risk_level: str
    top_predicted_type: str
    crime_type_probabilities: Dict[str, float]
    estimated_peak_window: str
    recommended_action: str
    basis_7day_trend: str


class HotspotSummary(BaseModel):
    model_config = ConfigDict(extra="allow")

    total_hotspots: int
    high_risk: int
    medium_risk: int
    low_risk: int
    overall_risk_score: Optional[float] = None
    overall_risk_level: Optional[str] = None
    highest_risk_location: Optional[HighestRiskLocation] = None
    most_likely_next_crime: Optional[MostLikelyNextCrime] = None
    grid_distribution: Optional[Dict[str, Any]] = None


class ModelInfo(BaseModel):
    model_config = ConfigDict(extra="allow")

    name: str
    version: str


class Historical7DaySummary(BaseModel):
    model_config = ConfigDict(extra="allow")

    start_date: str
    end_date: str
    total_crimes_analyzed: int
    by_category: Optional[Dict[str, int]] = None
    by_severity: Optional[Dict[str, int]] = None
    by_borough: Optional[Dict[str, int]] = None
    daily_trend: Optional[List[Dict[str, Any]]] = None


class HotspotPredictionResponse(BaseModel):
    model_config = ConfigDict(extra="allow")

    prediction_date: Date
    generated_at: DateTime
    model: ModelInfo
    summary: HotspotSummary
    hotspots: List[HotspotItem]
    most_likely_next_crime: Optional[MostLikelyNextCrime] = None
    historical_7day_summary: Optional[Historical7DaySummary] = None
    historical_crimes: Optional[List[Dict[str, Any]]] = None