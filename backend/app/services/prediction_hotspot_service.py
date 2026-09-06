import time
from datetime import datetime, timedelta, time as dtime, date
from fastapi import HTTPException

from app.database.mongodb import get_database
from app.ml.preprocessing import build_convlstm_input
from app.ml.predictor import predict_grid
from app.ml.hotspot_extractor import extract_hotspots
from app.ml.model_loader import get_metadata


async def generate_hotspot_prediction(prediction_date_or_incident):
    overall_start = time.perf_counter()
    db = get_database()
    metadata = get_metadata()
    seq_len = metadata["sequence_length"]

    incident_record = None
    target_date = None

    # Handle if dict or object with incident fields passed
    if isinstance(prediction_date_or_incident, dict):
        inc = prediction_date_or_incident
        target_date = inc.get("date") or inc.get("prediction_date")
        if inc.get("latitude") is not None and inc.get("longitude") is not None:
            incident_record = {
                "crime_type": inc.get("crime_type", "theft").lower(),
                "category": inc.get("crime_type", "theft").lower(),
                "severity": inc.get("severity", "Moderate"),
                "area": "User Incident Location",
                "location": f"Reported Incident ({inc.get('latitude'):.4f}, {inc.get('longitude'):.4f})",
                "latitude": float(inc["latitude"]),
                "longitude": float(inc["longitude"]),
                "date": str(target_date),
                "time": str(inc.get("time") or "12:00"),
                "datetime": f"{target_date}T{inc.get('time') or '12:00'}:00",
                "status": "Reported",
                "description": inc.get("description") or "Incident submitted via Crime Prediction Interface",
            }
    elif hasattr(prediction_date_or_incident, "date") and hasattr(prediction_date_or_incident, "latitude"):
        inc = prediction_date_or_incident
        target_date = inc.date
        if inc.latitude is not None and inc.longitude is not None:
            incident_record = {
                "crime_type": (inc.crime_type or "theft").lower(),
                "category": (inc.crime_type or "theft").lower(),
                "severity": inc.severity or "Moderate",
                "area": "User Incident Location",
                "location": f"Reported Incident ({inc.latitude:.4f}, {inc.longitude:.4f})",
                "latitude": float(inc.latitude),
                "longitude": float(inc.longitude),
                "date": str(target_date),
                "time": str(inc.time or "12:00"),
                "datetime": f"{target_date}T{inc.time or '12:00'}:00",
                "status": "Reported",
                "description": inc.description or "Incident submitted via Crime Prediction Interface",
            }
    elif hasattr(prediction_date_or_incident, "prediction_date") and prediction_date_or_incident.prediction_date:
        target_date = prediction_date_or_incident.prediction_date
        if hasattr(prediction_date_or_incident, "latitude") and prediction_date_or_incident.latitude is not None:
            inc = prediction_date_or_incident
            incident_record = {
                "crime_type": (inc.crime_type or "theft").lower(),
                "category": (inc.crime_type or "theft").lower(),
                "severity": inc.severity or "Moderate",
                "area": "User Incident Location",
                "location": f"Reported Incident ({inc.latitude:.4f}, {inc.longitude:.4f})",
                "latitude": float(inc.latitude),
                "longitude": float(inc.longitude),
                "date": str(inc.date or target_date),
                "time": str(inc.time or "12:00"),
                "datetime": f"{inc.date or target_date}T{inc.time or '12:00'}:00",
                "status": "Reported",
                "description": inc.description or "Incident submitted via Crime Prediction Interface",
            }
    else:
        target_date = prediction_date_or_incident

    if isinstance(target_date, str):
        target_date = datetime.strptime(target_date, "%Y-%m-%d").date()
    elif not isinstance(target_date, date):
        target_date = date.today()

    try:
        # Step 1: Persist the new incident if submitted
        if incident_record:
            await db.crimes.insert_one(incident_record)

        # Step 2: Determine 7-day historical window & query MongoDB
        query_start = time.perf_counter()
        start_dt = datetime.combine(target_date - timedelta(days=seq_len), dtime.min)
        end_dt = datetime.combine(target_date, dtime.min)

        docs = await db.crimes.find({
            "$or": [
                {"datetime": {"$gte": start_dt.isoformat(), "$lt": end_dt.isoformat()}},
                {"date": {"$gte": str(start_dt.date()), "$lt": str(end_dt.date())}}
            ]
        }).to_list(length=200000)

        # Fallback: if exact window not populated, sample available crime records
        # and project them across the 7-day window to allow live inference for any user-selected date
        if not docs:
            all_crimes = await db.crimes.find().to_list(length=5000)
            if all_crimes:
                projected = []
                days = [start_dt.date() + timedelta(days=i) for i in range(seq_len)]
                for idx, c in enumerate(all_crimes):
                    assigned_day = days[idx % len(days)]
                    item = dict(c)
                    item["date"] = str(assigned_day)
                    item["datetime"] = f"{assigned_day}T12:00:00"
                    projected.append(item)
                docs = projected

        query_ms = (time.perf_counter() - query_start) * 1000

        if not docs:
            raise HTTPException(
                status_code=400,
                detail="Insufficient historical crime records in database. Please seed or add incident records."
            )

        # Step 3: Preprocess spatiotemporal tensor (1, 7, 20, 20, 5)
        prep_start = time.perf_counter()
        x = build_convlstm_input(docs, datetime.combine(target_date, dtime.min))
        prep_ms = (time.perf_counter() - prep_start) * 1000

        # Step 4: ConvLSTM neural inference
        inf_start = time.perf_counter()
        pred_grid = predict_grid(x)
        inf_ms = (time.perf_counter() - inf_start) * 1000

        # Step 5: Postprocess + top-20 hotspot extraction
        post_start = time.perf_counter()
        hotspots, summary = extract_hotspots(pred_grid, top_k=20)
        post_ms = (time.perf_counter() - post_start) * 1000

        # Compute overall risk score and level
        overall_score = 0.0
        if hotspots:
            overall_score = float(sum(h["risk_score"] for h in hotspots[:5]) / min(5, len(hotspots)))
        summary["overall_risk_score"] = round(overall_score, 4)
        summary["overall_risk_level"] = "High" if overall_score >= 0.75 else ("Medium" if overall_score >= 0.45 else "Low")

        response = {
            "prediction_date": target_date,
            "generated_at": datetime.utcnow(),
            "model": {"name": "ConvLSTM 2D", "version": "1.0"},
            "summary": summary,
            "hotspots": hotspots,
        }

        # Step 6: Store prediction in MongoDB predictions collection
        await db.predictions.insert_one({
            "prediction_date": str(target_date),
            "generated_at": datetime.utcnow().isoformat(),
            "model": response["model"],
            "summary": summary,
            "hotspots": hotspots,
            "submitted_incident": incident_record,
            "timing_ms": {
                "mongodb_query": round(query_ms, 2),
                "preprocessing": round(prep_ms, 2),
                "inference": round(inf_ms, 2),
                "postprocessing": round(post_ms, 2),
                "total": round((time.perf_counter() - overall_start) * 1000, 2),
            }
        })

        return response

    except HTTPException:
        raise
    except Exception as e:
        print(f"[PREDICT][ERROR] {e}")
        raise HTTPException(status_code=500, detail=f"Prediction service error: {str(e)}")