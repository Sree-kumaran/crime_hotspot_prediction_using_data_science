from pydantic import BaseModel, Field
from typing import Optional


class CrimeCreate(BaseModel):
    crime_type: str = Field(..., min_length=2)
    date: str
    time: str
    latitude: float
    longitude: float
    location: str
    area: Optional[str] = None
    district: Optional[str] = None
    severity: str = "Moderate"
    status: str = "Open"
    description: Optional[str] = None


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