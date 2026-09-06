from datetime import datetime
from fastapi import APIRouter, HTTPException, Query
from bson import ObjectId

from app.database.mongodb import get_database
from app.schemas.crime import CrimeCreate, CrimeUpdate
from app.services.prediction_hotspot_service import generate_hotspot_prediction

router = APIRouter()


def serialize(doc):
    if not doc:
        return doc
    doc_copy = dict(doc)
    doc_copy["id"] = str(doc_copy["_id"])
    del doc_copy["_id"]
    return doc_copy


@router.get("/crimes")
async def get_crimes(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    crime_type: str | None = None,
    severity: str | None = None,
    area: str | None = None,
):
    db = get_database()
    q = {}
    if crime_type:
        q["crime_type"] = crime_type.lower()
    if severity:
        q["severity"] = severity
    if area:
        q["area"] = area

    skip = (page - 1) * limit
    items = (
        await db.crimes.find(q)
        .sort("created_at", -1)
        .skip(skip)
        .limit(limit)
        .to_list(length=limit)
    )
    total = await db.crimes.count_documents(q)

    return {
        "data": [serialize(i) for i in items],
        "page": page,
        "limit": limit,
        "total": total,
    }


@router.get("/crimes/{crime_id}")
async def get_crime(crime_id: str):
    db = get_database()
    try:
        doc = await db.crimes.find_one({"_id": ObjectId(crime_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Crime ID format")
    if not doc:
        raise HTTPException(status_code=404, detail="Crime record not found")
    return serialize(doc)


@router.post("/crimes", status_code=201)
async def create_crime(payload: CrimeCreate):
    db = get_database()
    data = payload.model_dump()

    # Normalize fields for ML spatiotemporal pipeline
    time_val = data.get("time") or "12:00"
    data["datetime"] = f"{data['date']}T{time_val}:00"
    data["created_at"] = datetime.utcnow().isoformat()
    if not data.get("location"):
        data["location"] = f"Incident Area ({data['latitude']:.4f}, {data['longitude']:.4f})"
    if not data.get("area"):
        data["area"] = "New York City"

    # Step 1: Save crime record in MongoDB
    try:
        result = await db.crimes.insert_one(data)
        doc = await db.crimes.find_one({"_id": result.inserted_id})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database insertion failed: {str(e)}")

    # Step 2: Trigger ConvLSTM prediction pipeline on accumulated dataset
    prediction_status = "success"
    prediction_result = None
    prediction_error = None

    try:
        prediction_result = await generate_hotspot_prediction(data["date"])
    except Exception as e:
        print(f"[PREDICTION_TRIGGER][WARNING] ConvLSTM update failed: {e}")
        prediction_status = "failed"
        prediction_error = str(e)

    return {
        "success": True,
        "crime": serialize(doc),
        "prediction_status": prediction_status,
        "prediction": prediction_result,
        "prediction_error": prediction_error,
        "message": (
            "Crime record saved and hotspot prediction updated."
            if prediction_status == "success"
            else "Crime record saved, but hotspot prediction update encountered an error."
        ),
    }


@router.put("/crimes/{crime_id}")
async def update_crime(crime_id: str, payload: CrimeUpdate):
    db = get_database()
    data = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not data:
        raise HTTPException(status_code=400, detail="No fields to update")

    try:
        result = await db.crimes.update_one({"_id": ObjectId(crime_id)}, {"$set": data})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Crime ID format")

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Crime not found")

    doc = await db.crimes.find_one({"_id": ObjectId(crime_id)})
    return serialize(doc)


@router.delete("/crimes/{crime_id}")
async def delete_crime(crime_id: str):
    db = get_database()
    try:
        result = await db.crimes.delete_one({"_id": ObjectId(crime_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Crime ID format")

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Crime not found")
    return {"message": "Crime deleted successfully"}