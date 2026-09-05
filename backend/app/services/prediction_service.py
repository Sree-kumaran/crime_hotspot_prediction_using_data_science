from datetime import datetime, timedelta, time
from fastapi import HTTPException
from app.database.mongodb import get_database
from app.ml.preprocessing import build_input_tensor
from app.ml.predictor import run_inference
from app.ml.hotspot_extractor import extract_hotspots
from app.ml.model_loader import get_metadata


async def generate_hotspot_prediction(prediction_date):
    db = get_database()
    metadata = get_metadata()
    seq_len = metadata["sequence_length"]

    start_dt = datetime.combine(prediction_date - timedelta(days=seq_len), time.min)
    end_dt = datetime.combine(prediction_date, time.min)

    # Adjust query field names if your collection differs
    docs = await db.crimes.find({
        "$or": [
            {"datetime": {"$gte": start_dt.isoformat(), "$lt": end_dt.isoformat()}},
            {"date": {"$gte": str(start_dt.date()), "$lt": str(end_dt.date())}}
        ]
    }).to_list(length=200000)

    if len(docs) == 0:
        raise HTTPException(status_code=400, detail="Insufficient historical data for prediction.")

    x = build_input_tensor(docs, datetime.combine(prediction_date, time.min))
    y_grid = run_inference(x)
    hotspots, summary = extract_hotspots(y_grid, top_k=20)

    result = {
        "prediction_date": prediction_date,
        "generated_at": datetime.utcnow(),
        "model": {"name": "ConvLSTM", "version": "1.0"},
        "summary": summary,
        "hotspots": hotspots
    }

    await db.predictions.insert_one({
        "prediction_date": str(prediction_date),
        "generated_at": datetime.utcnow().isoformat(),
        "model": result["model"],
        "summary": summary,
        "hotspots": hotspots
    })

    return result