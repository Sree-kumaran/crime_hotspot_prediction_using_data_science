from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.settings import settings
from app.database.mongodb import connect_to_mongo, close_mongo_connection
from app.ml.model_loader import initialize_ml

from app.routes.health import router as health_router
from app.routes.crime import router as crime_router
from app.routes.analytics import router as analytics_router
from app.routes.prediction import router as prediction_router
from app.routes.auth import router as auth_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    try:
        from app.database.seed_data import seed_crimes_if_empty
        await seed_crimes_if_empty()
    except Exception as e:
        print(f"[STARTUP] MongoDB seeding check warning: {e}")
    initialize_ml()
    yield
    await close_mongo_connection()



app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan,
)

allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# include env value too if set
if getattr(settings, "FRONTEND_ORIGIN", None) and settings.FRONTEND_ORIGIN not in allowed_origins:
    allowed_origins.append(settings.FRONTEND_ORIGIN)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix="/api", tags=["Health"])
app.include_router(crime_router, prefix="/api", tags=["Crimes"])
app.include_router(analytics_router, prefix="/api", tags=["Analytics"])
app.include_router(prediction_router, prefix="/api", tags=["Predictions"])
app.include_router(auth_router, prefix="/api", tags=["Authentication"])