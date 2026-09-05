from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "Crime Hotspot Prediction API"
    APP_VERSION: str = "0.1.0"

    MONGODB_URI: str = "mongodb://localhost:27017/"
    MONGODB_DATABASE: str = "crime_hotspot_db"

    FRONTEND_ORIGIN: str = "http://localhost:5173"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()