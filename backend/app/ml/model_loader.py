import os
import joblib
import tensorflow as tf
from app.config.settings import settings
from app.ml.config import load_ml_configs

_model = None
_preprocessing = None
_metadata = None
_grid = None
_features = None


def initialize_ml():
    global _model, _preprocessing, _metadata, _grid, _features

    for p in [
        settings.ML_MODEL_PATH,
        settings.ML_PREPROCESSING_PATH,
        settings.ML_GRID_CONFIG_PATH,
        settings.ML_FEATURE_CONFIG_PATH,
        settings.ML_METADATA_PATH,
    ]:
        if not os.path.exists(p):
            raise FileNotFoundError(f"Missing ML artifact: {p}")

    _metadata, _grid, _features = load_ml_configs()
    _model = tf.keras.models.load_model(settings.ML_MODEL_PATH)
    _preprocessing = joblib.load(settings.ML_PREPROCESSING_PATH)


def get_model():
    if _model is None:
        raise RuntimeError("Model not initialized.")
    return _model


def get_preprocessing():
    if _preprocessing is None:
        raise RuntimeError("Preprocessing artifact not initialized.")
    return _preprocessing


def get_metadata():
    if _metadata is None:
        raise RuntimeError("Metadata not initialized.")
    return _metadata


def get_grid_config():
    if _grid is None:
        raise RuntimeError("Grid config not initialized.")
    return _grid


def get_feature_config():
    if _features is None:
        raise RuntimeError("Feature config not initialized.")
    return _features