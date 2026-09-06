from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from bson import ObjectId
from app.database.mongodb import get_database
from app.schemas.prediction_hotspot import HotspotPredictionRequest, HotspotPredictionResponse
from app.services.prediction_hotspot_service import generate_hotspot_prediction

router = APIRouter()


def serialize_prediction(doc):
    doc["id"] = str(doc["_id"])
    del doc["_id"]
    return doc


@router.post("/predictions", response_model=HotspotPredictionResponse)
async def create_prediction(payload: HotspotPredictionRequest):
    return await generate_hotspot_prediction(payload)


@router.post("/predictions/hotspots", response_model=HotspotPredictionResponse)
async def predict_hotspots(payload: HotspotPredictionRequest):
    return await generate_hotspot_prediction(payload)


@router.post("/predict", response_model=HotspotPredictionResponse)
async def predict_alias(payload: HotspotPredictionRequest):
    return await generate_hotspot_prediction(payload)


@router.get("/predictions")
async def get_prediction_history(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
):
    db = get_database()
    skip = (page - 1) * limit
    cursor = db.predictions.find().sort("generated_at", -1).skip(skip).limit(limit)
    items = await cursor.to_list(length=limit)
    total = await db.predictions.count_documents({})
    return {
        "data": [serialize_prediction(i) for i in items],
        "page": page,
        "limit": limit,
        "total": total,
    }


@router.get("/predictions/latest")
async def get_latest_prediction():
    db = get_database()
    doc = await db.predictions.find_one(sort=[("generated_at", -1)])
    if not doc:
        return {"data": None}
    return {"data": serialize_prediction(doc)}


@router.get("/predictions/{prediction_id}")
async def get_prediction_by_id(prediction_id: str):
    db = get_database()
    try:
        doc = await db.predictions.find_one({"_id": ObjectId(prediction_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid prediction ID format")

    if not doc:
        raise HTTPException(status_code=404, detail="Prediction record not found")
    return serialize_prediction(doc)