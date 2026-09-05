import time
from datetime import datetime, timedelta, time as dtime
from fastapi import HTTPException

from app.database.mongodb import get_database
from app.ml.preprocessing import build_convlstm_input
from app.ml.predictor import predict_grid
from app.ml.hotspot_extractor import extract_hotspots
from app.ml.model_loader import get_metadata


async def generate_hotspot_prediction(prediction_date):
    overall_start = time.perf_counter()
    db = get_database()
    metadata = get_metadata()
    seq_len = metadata["sequence_length"]

    try:
        # Step 1-3: determine historical window + query
        query_start = time.perf_counter()
        start_dt = datetime.combine(prediction_date - timedelta(days=seq_len), dtime.min)
        end_dt = datetime.combine(prediction_date, dtime.min)

        docs = await db.crimes.find({
            "$or": [
                {"datetime": {"$gte": start_dt.isoformat(), "$lt": end_dt.isoformat()}},
                {"date": {"$gte": str(start_dt.date()), "$lt": str(end_dt.date())}}
            ]
        }).to_list(length=200000)
        query_ms = (time.perf_counter() - query_start) * 1000

        if not docs:
            raise HTTPException(status_code=400, detail="Insufficient historical data for prediction.")

        # Step 4-7: preprocess + tensor
        prep_start = time.perf_counter()
        x = build_convlstm_input(docs, datetime.combine(prediction_date, dtime.min))
        prep_ms = (time.perf_counter() - prep_start) * 1000

        # Step 8: inference
        inf_start = time.perf_counter()
        pred_grid = predict_grid(x)
        inf_ms = (time.perf_counter() - inf_start) * 1000

        # Step 9-11: postprocess + hotspot extraction
        post_start = time.perf_counter()
        hotspots, summary = extract_hotspots(pred_grid, top_k=20)
        post_ms = (time.perf_counter() - post_start) * 1000

        response = {
            "prediction_date": prediction_date,
            "generated_at": datetime.utcnow(),
            "model": {"name": "ConvLSTM", "version": "1.0"},
            "summary": summary,
            "hotspots": hotspots,
        }

        # store prediction history summary + hotspots (not raw tensor)
        await db.predictions.insert_one({
            "prediction_date": str(prediction_date),
            "generated_at": datetime.utcnow().isoformat(),
            "model": response["model"],
            "summary": summary,
            "hotspots": hotspots,
            "timing_ms": {
                "mongodb_query": round(query_ms, 2),
                "preprocessing": round(prep_ms, 2),
                "inference": round(inf_ms, 2),
                "postprocessing": round(post_ms, 2),
                "total": round((time.perf_counter() - overall_start) * 1000, 2),
            }
        })

        print(
            f"[PREDICT] query={query_ms:.2f}ms prep={prep_ms:.2f}ms "
            f"infer={inf_ms:.2f}ms post={post_ms:.2f}ms "
            f"total={(time.perf_counter()-overall_start)*1000:.2f}ms"
        )

        return response

    except HTTPException:
        raise
    except Exception as e:
        print(f"[PREDICT][ERROR] {e}")
        raise HTTPException(status_code=500, detail="Prediction service unavailable.")