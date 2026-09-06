from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime


class CrimeCreate(BaseModel):
    crime_type: str = Field(..., min_length=2, description="Crime category type")
    date: str = Field(..., description="Incident date in YYYY-MM-DD format")
    time: str = Field(default="12:00", description="Incident time in HH:MM format")
    latitude: float = Field(..., ge=-90.0, le=90.0, description="Latitude coordinate")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="Longitude coordinate")
    location: Optional[str] = None
    area: Optional[str] = None
    district: Optional[str] = None
    severity: str = Field(default="Moderate", description="Severity level: High, Moderate, Low")
    status: str = Field(default="Reported", description="Incident status: Reported, Open, Closed")
    description: Optional[str] = None

    @field_validator("crime_type")
    @classmethod
    def normalize_crime_type(cls, v: str) -> str:
        return v.strip().lower()

    @field_validator("date")
    @classmethod
    def validate_date(cls, v: str) -> str:
        try:
            datetime.strptime(v, "%Y-%m-%d")
            return v
        except ValueError:
            raise ValueError("Date must be in YYYY-MM-DD format.")


class CrimeUpdate(BaseModel):
    crime_type: Optional[str] = None
    date: Optional[str] = None
    time: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location: Optional[str] = None
    area: Optional[str] = None
    district: Optional[str] = None
    severity: Optional[str] = None
    status: Optional[str] = None
    description: Optional[str] = None