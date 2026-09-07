from datetime import datetime
from app.database.mongodb import get_database
from app.schemas.settings import AppSettings

DEFAULT_SETTINGS = AppSettings().model_dump()


async def get_app_settings() -> dict:
    db = get_database()
    doc = await db.settings.find_one({"_id": "app_config"})
    if not doc:
        # Initialize default settings in database
        initial = dict(DEFAULT_SETTINGS)
        initial["_id"] = "app_config"
        initial["updated_at"] = datetime.utcnow().isoformat()
        await db.settings.insert_one(initial)
        return DEFAULT_SETTINGS

    doc.pop("_id", None)
    return doc


async def update_app_settings(settings_payload: AppSettings) -> dict:
    db = get_database()
    data = settings_payload.model_dump()
    data["updated_at"] = datetime.utcnow().isoformat()

    await db.settings.update_one(
        {"_id": "app_config"},
        {"$set": data},
        upsert=True,
    )
    return data


async def reset_app_settings() -> dict:
    db = get_database()
    data = dict(DEFAULT_SETTINGS)
    data["updated_at"] = datetime.utcnow().isoformat()

    await db.settings.update_one(
        {"_id": "app_config"},
        {"$set": data},
        upsert=True,
    )
    return data
