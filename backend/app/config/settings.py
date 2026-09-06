from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Crime Hotspot Prediction API"
    APP_VERSION: str = "0.5.0"

    # MongoDB
    MONGODB_URI: str = "mongodb://localhost:27017/"
    MONGODB_DATABASE: str = "crime_hotspot_db"

    # CORS
    FRONTEND_ORIGIN: str = "http://localhost:5173"

    # ML artifact paths (Phase 4)
    ML_MODEL_PATH: str = "models/crime_hotspot_convlstm.keras"
    ML_PREPROCESSING_PATH: str = "models/preprocessing.pkl"
    ML_GRID_CONFIG_PATH: str = "models/grid_config.json"
    ML_FEATURE_CONFIG_PATH: str = "models/feature_config.json"
    ML_METADATA_PATH: str = "models/model_metadata.json"

    # JWT auth (Phase 5)
    JWT_SECRET_KEY: str = "CHANGE_THIS_IN_ENV"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()