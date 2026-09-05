from fastapi import APIRouter
from app.schemas.prediction_hotspot import HotspotPredictionRequest, HotspotPredictionResponse
from app.services.prediction_hotspot_service import generate_hotspot_prediction

router = APIRouter()


@router.post("/predictions/hotspots", response_model=HotspotPredictionResponse)
async def predict_hotspots(payload: HotspotPredictionRequest):
    return await generate_hotspot_prediction(payload.prediction_date)