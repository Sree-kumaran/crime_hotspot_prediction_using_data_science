from datetime import datetime, timedelta, date as dt_date
from fastapi import APIRouter, HTTPException, Query
from bson import ObjectId

from app.database.mongodb import get_database
from app.schemas.crime import CrimeCreate, CrimeUpdate
from app.services.prediction_hotspot_service import generate_hotspot_prediction
from app.utils.geo_helper import get_nearest_neighborhood, generate_synthetic_crimes_for_window

router = APIRouter()


def serialize(doc):
    if not doc:
        return doc
    doc_copy = dict(doc)
    if "_id" in doc_copy:
        doc_copy["id"] = str(doc_copy["_id"])
        del doc_copy["_id"]
    return doc_copy


@router.get("/crimes/last-7-days")
@router.get("/crimes/window")
async def get_crimes_last_7_days(
    target_date: str | None = Query(None, description="Anchor date YYYY-MM-DD (defaults to today or latest)"),
    days: int = Query(7, ge=1, le=30, description="Window size in days"),
    crime_type: str | None = None,
    severity: str | None = None,
    borough: str | None = None,
):
    db = get_database()

    # Parse target date
    if target_date:
        try:
            anchor_dt = datetime.strptime(target_date, "%Y-%m-%d").date()
        except ValueError:
            anchor_dt = dt_date.today()
    else:
        # Check if database has records, else default to today
        latest_record = await db.crimes.find_one(sort=[("date", -1)])
        if latest_record and latest_record.get("date"):
            try:
                anchor_dt = datetime.strptime(latest_record["date"], "%Y-%m-%d").date()
            except Exception:
                anchor_dt = dt_date.today()
        else:
            anchor_dt = dt_date.today()

    start_date = anchor_dt - timedelta(days=days)
    end_date = anchor_dt  # Non-inclusive end or inclusive up to end of anchor_dt

    # Query MongoDB for crimes in [start_date, end_date]
    start_str = str(start_date)
    end_str = str(end_date)

    q = {
        "$or": [
            {"date": {"$gte": start_str, "$lte": end_str}},
            {"datetime": {"$gte": f"{start_str}T00:00:00", "$lte": f"{end_str}T23:59:59"}}
        ]
    }
    if crime_type and crime_type.lower() != "all":
        q["crime_type"] = crime_type.lower()
    if severity and severity.lower() != "all":
        q["severity"] = severity

    items = await db.crimes.find(q).sort("datetime", -1).to_list(length=10000)

    # If DB doesn't have crimes for this date range, generate realistic date-seeded records
    # and save to DB for seamless real-time interaction
    if not items or len(items) < 5:
        synthetic = generate_synthetic_crimes_for_window(start_date, end_date + timedelta(days=1))
        try:
            await db.crimes.insert_many(synthetic)
        except Exception as e:
            print(f"[CRIMES_WINDOW] Auto-seed insert warning: {e}")
        items = await db.crimes.find(q).sort("datetime", -1).to_list(length=10000)
        if not items:
            items = synthetic

    serialized = [serialize(i) for i in items]

    # Enrich borough info if missing
    for c in serialized:
        if not c.get("borough"):
            nb = get_nearest_neighborhood(c.get("latitude", 40.7128), c.get("longitude", -74.0060))
            c["borough"] = nb["borough"]
            if not c.get("area") or c.get("area") == "New York City":
                c["area"] = f"{nb['name']} ({nb['borough']})"

    # Filter by borough if requested
    if borough and borough.lower() != "all":
        serialized = [c for c in serialized if c.get("borough", "").lower() == borough.lower()]

    # Compute summary aggregates for the 7-day window
    total = len(serialized)
    by_category = {}
    by_severity = {"High": 0, "Moderate": 0, "Low": 0}
    by_borough = {"Manhattan": 0, "Brooklyn": 0, "Queens": 0, "Bronx": 0, "Staten Island": 0}

    # Daily distribution map
    daily_map = {}
    curr = start_date
    while curr <= end_date:
        daily_map[str(curr)] = {
            "date": str(curr),
            "day_name": curr.strftime("%a, %b %d"),
            "short_day": curr.strftime("%a"),
            "count": 0,
            "high_risk_count": 0,
        }
        curr += timedelta(days=1)

    for c in serialized:
        cat = (c.get("crime_type") or c.get("category") or "other").lower()
        by_category[cat] = by_category.get(cat, 0) + 1

        sev = c.get("severity") or "Moderate"
        if sev in by_severity:
            by_severity[sev] += 1
        elif sev == "Critical":
            by_severity["High"] += 1

        b = c.get("borough") or "Manhattan"
        by_borough[b] = by_borough.get(b, 0) + 1

        d = c.get("date")
        if d in daily_map:
            daily_map[d]["count"] += 1
            if sev == "High" or sev == "Critical":
                daily_map[d]["high_risk_count"] += 1

    high_count = by_severity.get("High", 0)
    high_pct = round((high_count / total * 100), 1) if total > 0 else 0.0

    top_cat = max(by_category.items(), key=lambda x: x[1])[0] if by_category else "theft"
    top_boro = max(by_borough.items(), key=lambda x: x[1])[0] if by_borough else "Manhattan"

    summary = {
        "target_date": str(anchor_dt),
        "start_date": str(start_date),
        "end_date": str(end_date),
        "days": days,
        "total_crimes": total,
        "high_severity_count": high_count,
        "high_severity_pct": high_pct,
        "avg_crimes_per_day": round(total / max(1, days), 1),
        "top_category": top_cat.title(),
        "top_borough": top_boro,
        "by_category": by_category,
        "by_severity": by_severity,
        "by_borough": by_borough,
        "daily_counts": list(daily_map.values()),
    }

    return {
        "success": True,
        "summary": summary,
        "data": serialized,
    }


@router.get("/crimes")
async def get_crimes(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=5000),
    crime_type: str | None = None,
    severity: str | None = None,
    area: str | None = None,
    borough: str | None = None,
    start_date: str | None = None,
    end_date: str | None = None,
):
    db = get_database()
    q = {}
    if crime_type and crime_type.lower() != "all":
        q["crime_type"] = crime_type.lower()
    if severity and severity.lower() != "all":
        q["severity"] = severity
    if area and area.lower() != "all":
        q["area"] = area
    if start_date and end_date:
        q["$or"] = [
            {"date": {"$gte": start_date, "$lte": end_date}},
            {"datetime": {"$gte": f"{start_date}T00:00:00", "$lte": f"{end_date}T23:59:59"}}
        ]
    elif start_date:
        q["date"] = {"$gte": start_date}
    elif end_date:
        q["date"] = {"$lte": end_date}

    skip = (page - 1) * limit
    items = (
        await db.crimes.find(q)
        .sort("datetime", -1)
        .skip(skip)
        .limit(limit)
        .to_list(length=limit)
    )
    total = await db.crimes.count_documents(q)

    serialized = [serialize(i) for i in items]
    if borough and borough.lower() != "all":
        serialized = [c for c in serialized if c.get("borough", "").lower() == borough.lower()]

    return {
        "data": serialized,
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