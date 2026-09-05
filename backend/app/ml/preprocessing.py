import numpy as np
from datetime import datetime, timedelta
from app.ml.model_loader import get_metadata, get_grid_config, get_feature_config, get_preprocessing


def _parse_doc_datetime(doc: dict):
    if doc.get("datetime"):
        return datetime.fromisoformat(str(doc["datetime"]))
    if doc.get("date"):
        d = str(doc["date"])
        t = str(doc.get("time") or "00:00")
        return datetime.fromisoformat(f"{d}T{t}")
    return None


def _doc_category(doc: dict):
    return (doc.get("crime_type") or doc.get("category") or doc.get("offense") or "other").lower()


def _to_cell(lat, lon, grid):
    lat_min, lat_max = grid["lat_min"], grid["lat_max"]
    lon_min, lon_max = grid["lon_min"], grid["lon_max"]
    gh, gw = grid["grid_height"], grid["grid_width"]

    if lat < lat_min or lat > lat_max or lon < lon_min or lon > lon_max:
        return None

    r = int((lat - lat_min) / (lat_max - lat_min + 1e-12) * gh)
    c = int((lon - lon_min) / (lon_max - lon_min + 1e-12) * gw)
    r = min(max(r, 0), gh - 1)
    c = min(max(c, 0), gw - 1)
    return r, c


def _is_felony(cat):
    return cat in {"felony", "robbery", "assault", "homicide", "rape"}


def _is_violent_felony(cat):
    return cat in {"assault", "homicide", "rape", "violent felony"}


def _is_misdemeanor(cat):
    return cat in {"misdemeanor", "theft", "vandalism"}


def build_convlstm_input(crime_docs, prediction_date):
    metadata = get_metadata()
    grid = get_grid_config()
    feature_cfg = get_feature_config()
    preproc = get_preprocessing()

    seq_len = metadata["sequence_length"]        # 7
    gh = metadata["grid_height"]                 # 20
    gw = metadata["grid_width"]                  # 20
    channels = feature_cfg["channel_names"]      # 5 channels

    start_date = (prediction_date - timedelta(days=seq_len)).date()
    sequence_days = [start_date + timedelta(days=i) for i in range(seq_len)]
    day_idx = {d: i for i, d in enumerate(sequence_days)}

    x = np.zeros((seq_len, gh, gw, len(channels)), dtype=np.float32)

    for doc in crime_docs:
        dt = _parse_doc_datetime(doc)
        if not dt:
            continue
        d = dt.date()
        if d not in day_idx:
            continue

        lat = doc.get("latitude")
        lon = doc.get("longitude")
        if lat is None or lon is None:
            continue

        cell = _to_cell(float(lat), float(lon), grid)
        if cell is None:
            continue

        t = day_idx[d]
        r, c = cell
        cat = _doc_category(doc)

        # channels order from feature_config:
        # total_count, felony_count, violent_felony_count, misdemeanor_count, other_count
        x[t, r, c, 0] += 1.0
        if _is_felony(cat):
            x[t, r, c, 1] += 1.0
        if _is_violent_felony(cat):
            x[t, r, c, 2] += 1.0
        if _is_misdemeanor(cat):
            x[t, r, c, 3] += 1.0
        if not (_is_felony(cat) or _is_violent_felony(cat) or _is_misdemeanor(cat)):
            x[t, r, c, 4] += 1.0

    # apply saved preprocessing/scaler if supported
    if hasattr(preproc, "transform"):
        flat = x.reshape(-1, x.shape[-1])
        flat_scaled = preproc.transform(flat)
        x = flat_scaled.reshape(x.shape).astype(np.float32)

    # ConvLSTM input: (batch, time, h, w, c)
    x = np.expand_dims(x, axis=0)

    expected = tuple(metadata["input_shape"])  # [7,20,20,5]
    actual = x.shape[1:]
    if actual != expected:
        raise ValueError(f"Input shape mismatch. expected={expected}, got={actual}")

    return x