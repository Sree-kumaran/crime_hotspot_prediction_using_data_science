from fastapi import APIRouter
from app.schemas.prediction import PredictionRequest, PredictionResponse
from app.services.prediction_service import predict

router = APIRouter()


@router.post("/predictions/predict", response_model=PredictionResponse)
async def run_prediction(payload: PredictionRequest):
    return predict(payload.model_dump())