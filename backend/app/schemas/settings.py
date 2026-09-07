from pydantic import BaseModel, Field, field_validator
from typing import Optional


class AppSettings(BaseModel):
    agency_name: str = Field(default="NYC Geospatial Intelligence Unit", min_length=2)
    jurisdiction: str = Field(default="New York City, NY", min_length=2)
    low_risk_threshold: float = Field(
        default=0.45,
        ge=0.05,
        le=0.55,
        description="Cutoff score below which zones are classified as Low Risk (<45%)",
    )
    high_risk_threshold: float = Field(
        default=0.75,
        ge=0.55,
        le=0.95,
        description="Cutoff score above which zones are classified as High Risk (>75%)",
    )
    top_k_hotspots: int = Field(
        default=20,
        ge=5,
        le=50,
        description="Total top hotspot clusters extracted from neural grid",
    )
    default_zoom: int = Field(
        default=12,
        ge=8,
        le=18,
        description="Default viewport zoom level for the geospatial map",
    )
    heatmap_radius: int = Field(
        default=25,
        ge=10,
        le=60,
        description="Radius size in pixels for spatial hotspot halos",
    )
    notification_channel: str = Field(
        default="inapp",
        description="Primary alert dispatch channel (inapp, email)",
    )
    updated_at: Optional[str] = None

    @field_validator("high_risk_threshold")
    @classmethod
    def validate_thresholds(cls, v: float, info) -> float:
        low = info.data.get("low_risk_threshold", 0.45)
        if v <= low:
            raise ValueError("High risk threshold must be strictly greater than low risk threshold.")
        return v
