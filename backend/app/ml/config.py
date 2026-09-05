import json
from app.config.settings import settings


def load_json(path: str):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def load_ml_configs():
    metadata = load_json(settings.ML_METADATA_PATH)
    grid_config = load_json(settings.ML_GRID_CONFIG_PATH)
    feature_config = load_json(settings.ML_FEATURE_CONFIG_PATH)
    return metadata, grid_config, feature_config