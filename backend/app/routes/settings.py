from fastapi import APIRouter, HTTPException
from app.schemas.settings import AppSettings
from app.services.settings_service import (
    get_app_settings,
    update_app_settings,
    reset_app_settings,
)

router = APIRouter()


@router.get("/settings", response_model=AppSettings)
async def get_settings():
    try:
        return await get_app_settings()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load settings: {str(e)}")


@router.put("/settings", response_model=AppSettings)
async def update_settings(payload: AppSettings):
    try:
        return await update_app_settings(payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update settings: {str(e)}")


@router.post("/settings/reset", response_model=AppSettings)
async def reset_settings():
    try:
        return await reset_app_settings()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to reset settings: {str(e)}")
