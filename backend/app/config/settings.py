from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "Crime Hotspot Prediction API"
    APP_VERSION: str = "0.4.0"

    MONGODB_URI: str = "mongodb://localhost:27017/"
    MONGODB_DATABASE: str = "crime_hotspot_db"
    FRONTEND_ORIGIN: str = "http://localhost:5173"

    ML_MODEL_PATH: str = "models/crime_hotspot_convlstm.keras"
    ML_PREPROCESSING_PATH: str = "models/preprocessing.pkl"
    ML_GRID_CONFIG_PATH: str = "models/grid_config.json"
    ML_FEATURE_CONFIG_PATH: str = "models/feature_config.json"
    ML_METADATA_PATH: str = "models/model_metadata.json"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()