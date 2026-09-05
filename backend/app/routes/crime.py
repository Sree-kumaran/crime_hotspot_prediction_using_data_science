from fastapi import APIRouter, HTTPException, Query
from bson import ObjectId

from app.database.mongodb import get_database
from app.schemas.crime import CrimeCreate, CrimeUpdate

router = APIRouter()


def serialize(doc):
    doc["id"] = str(doc["_id"])
    del doc["_id"]
    return doc


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
        q["crime_type"] = crime_type
    if severity:
        q["severity"] = severity
    if area:
        q["area"] = area

    skip = (page - 1) * limit
    items = await db.crimes.find(q).skip(skip).limit(limit).to_list(length=limit)
    total = await db.crimes.count_documents(q)

    return {
        "data": [serialize(i) for i in items],
        "page": page,
        "limit": limit,
        "total": total
    }


@router.get("/crimes/{crime_id}")
async def get_crime(crime_id: str):
    db = get_database()
    doc = await db.crimes.find_one({"_id": ObjectId(crime_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Crime not found")
    return serialize(doc)


@router.post("/crimes", status_code=201)
async def create_crime(payload: CrimeCreate):
    db = get_database()
    data = payload.model_dump()
    result = await db.crimes.insert_one(data)
    doc = await db.crimes.find_one({"_id": result.inserted_id})
    return serialize(doc)


@router.put("/crimes/{crime_id}")
async def update_crime(crime_id: str, payload: CrimeUpdate):
    db = get_database()
    data = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not data:
        raise HTTPException(status_code=400, detail="No fields to update")

    result = await db.crimes.update_one({"_id": ObjectId(crime_id)}, {"$set": data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Crime not found")

    doc = await db.crimes.find_one({"_id": ObjectId(crime_id)})
    return serialize(doc)


@router.delete("/crimes/{crime_id}")
async def delete_crime(crime_id: str):
    db = get_database()
    result = await db.crimes.delete_one({"_id": ObjectId(crime_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Crime not found")
    return {"message": "Crime deleted successfully"}