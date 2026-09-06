from fastapi import APIRouter
from app.ml.model_loader import get_model
from app.database.mongodb import get_database

router = APIRouter()


@router.get("/health")
async def health_check():
    model_loaded = False
    try:
        model = get_model()
        model_loaded = model is not None
    except Exception:
        model_loaded = False

    db_status = "disconnected"
    try:
        db = get_database()
        await db.command("ping")
        db_status = "connected"
    except Exception:
        db_status = "disconnected"

    return {
        "status": "ok",
        "model_loaded": model_loaded,
        "database": db_status,
        "message": "Crime Hotspot Prediction API is running",
    }