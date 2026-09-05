import numpy as np
from app.ml.model_loader import get_grid_config


def _risk_label(score):
    if score >= 0.75:
        return "High"
    if score >= 0.45:
        return "Medium"
    return "Low"


def extract_hotspots(pred_grid, top_k=20):
    grid_cfg = get_grid_config()
    h, w = pred_grid.shape
    flat = pred_grid.flatten()

    if flat.size == 0:
        return [], {
            "total_hotspots": 0,
            "high_risk": 0,
            "medium_risk": 0,
            "low_risk": 0,
            "highest_risk_location": None
        }

    top_idxs = np.argsort(flat)[::-1][:top_k]
    max_val = float(np.max(flat)) if np.max(flat) != 0 else 1.0

    lat_min, lat_max = grid_cfg["lat_min"], grid_cfg["lat_max"]
    lon_min, lon_max = grid_cfg["lon_min"], grid_cfg["lon_max"]

    hotspots = []
    high = med = low = 0

    for idx in top_idxs:
        r = idx // w
        c = idx % w
        intensity = float(flat[idx])

        risk_score = max(0.0, min(1.0, intensity / max_val))
        level = _risk_label(risk_score)

        lat = lat_min + ((r + 0.5) / h) * (lat_max - lat_min)
        lon = lon_min + ((c + 0.5) / w) * (lon_max - lon_min)

        if level == "High":
            high += 1
        elif level == "Medium":
            med += 1
        else:
            low += 1

        hotspots.append({
            "latitude": round(lat, 6),
            "longitude": round(lon, 6),
            "predicted_intensity": round(intensity, 6),
            "risk_score": round(risk_score, 4),
            "risk_level": level,
        })

    highest = hotspots[0] if hotspots else None
    summary = {
        "total_hotspots": len(hotspots),
        "high_risk": high,
        "medium_risk": med,
        "low_risk": low,
        "highest_risk_location": highest,
    }
    return hotspots, summary