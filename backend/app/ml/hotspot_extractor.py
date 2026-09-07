import numpy as np
from app.ml.model_loader import get_grid_config


def extract_hotspots(
    pred_grid,
    top_k: int = 20,
    low_threshold: float = 0.45,
    high_threshold: float = 0.75,
):
    grid_cfg = get_grid_config()
    h, w = pred_grid.shape
    flat = pred_grid.flatten()

    if flat.size == 0:
        return [], {
            "total_hotspots": 0,
            "high_risk": 0,
            "medium_risk": 0,
            "low_risk": 0,
            "grid_distribution": {
                "high": 0,
                "medium": 0,
                "low": 0,
                "total_cells": 0,
            },
            "highest_risk_location": None,
        }

    grid_min = float(np.min(flat))
    grid_max = float(np.max(flat))
    grid_range = grid_max - grid_min if grid_max > grid_min else 1.0

    # Min-max normalization across the full 20x20 NYC spatial matrix
    norm_scores = (flat - grid_min) / grid_range

    # Citywide spatial distribution across all 400 cells
    grid_high = int(np.count_nonzero(norm_scores >= high_threshold))
    grid_med = int(
        np.count_nonzero((norm_scores >= low_threshold) & (norm_scores < high_threshold))
    )
    grid_low = int(np.count_nonzero(norm_scores < low_threshold))

    # Sort all cells by intensity descending
    sorted_idxs = np.argsort(flat)[::-1]

    high_idxs = [int(i) for i in sorted_idxs if norm_scores[i] >= high_threshold]
    med_idxs = [
        int(i)
        for i in sorted_idxs
        if low_threshold <= norm_scores[i] < high_threshold
    ]
    low_idxs = [int(i) for i in sorted_idxs if norm_scores[i] < low_threshold]

    # Stratify top_k to provide representative clusters across risk tiers:
    # 50% High priority clusters, 30% Moderate risk zones, 20% Baseline low risk zones
    n_high = min(len(high_idxs), max(1, int(top_k * 0.50)))
    n_med = min(len(med_idxs), max(1, int(top_k * 0.30)))
    n_low = min(len(low_idxs), max(0, top_k - n_high - n_med))

    # Fill any remaining slots if one tier had fewer cells
    remaining = top_k - (n_high + n_med + n_low)
    if remaining > 0 and len(high_idxs) > n_high:
        additional = min(remaining, len(high_idxs) - n_high)
        n_high += additional
        remaining -= additional
    if remaining > 0 and len(med_idxs) > n_med:
        additional = min(remaining, len(med_idxs) - n_med)
        n_med += additional
        remaining -= additional
    if remaining > 0 and len(low_idxs) > n_low:
        n_low += min(remaining, len(low_idxs) - n_low)

    selected_idxs = high_idxs[:n_high] + med_idxs[:n_med] + low_idxs[:n_low]
    # Re-sort final extracted clusters by neural intensity descending
    selected_idxs = sorted(selected_idxs, key=lambda i: flat[i], reverse=True)

    lat_min, lat_max = grid_cfg["lat_min"], grid_cfg["lat_max"]
    lon_min, lon_max = grid_cfg["lon_min"], grid_cfg["lon_max"]

    hotspots = []
    c_high = c_med = c_low = 0

    for idx in selected_idxs:
        r = idx // w
        c = idx % w
        intensity = float(flat[idx])
        score = float(norm_scores[idx])

        if score >= high_threshold:
            level = "High"
            c_high += 1
        elif score >= low_threshold:
            level = "Medium"
            c_med += 1
        else:
            level = "Low"
            c_low += 1

        lat = lat_min + ((r + 0.5) / h) * (lat_max - lat_min)
        lon = lon_min + ((c + 0.5) / w) * (lon_max - lon_min)

        hotspots.append({
            "latitude": round(lat, 6),
            "longitude": round(lon, 6),
            "predicted_intensity": round(intensity, 6),
            "risk_score": round(score, 4),
            "risk_level": level,
        })

    highest = hotspots[0] if hotspots else None
    summary = {
        "total_hotspots": len(hotspots),
        "high_risk": c_high,
        "medium_risk": c_med,
        "low_risk": c_low,
        "grid_distribution": {
            "high": grid_high,
            "medium": grid_med,
            "low": grid_low,
            "total_cells": len(flat),
        },
        "highest_risk_location": highest,
    }
    return hotspots, summary