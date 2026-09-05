from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.settings import settings
from app.database.mongodb import connect_to_mongo, close_mongo_connection
from app.routes.health import router as health_router
from app.routes.crime import router as crime_router
from app.routes.analytics import router as analytics_router
from app.routes.prediction import router as prediction_router
from app.ml.model_loader import initialize_ml


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    initialize_ml()
    yield
    await close_mongo_connection()


app = FastAPI(title=settings.APP_NAME, version=settings.APP_VERSION, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix="/api", tags=["Health"])
app.include_router(crime_router, prefix="/api", tags=["Crimes"])
app.include_router(analytics_router, prefix="/api", tags=["Analytics"])
app.include_router(prediction_router, prefix="/api", tags=["Predictions"])