import asyncio
import numpy as np
from app.database.mongodb import connect_to_mongo, close_mongo_connection, get_database
from app.ml.model_loader import initialize_ml
from app.ml.preprocessing import build_convlstm_input
from app.ml.predictor import predict_grid
from datetime import datetime

def extract_stratified_hotspots(pred_grid, top_k=20, low_thresh=0.45, high_thresh=0.75):
    h, w = pred_grid.shape
    flat = pred_grid.flatten()
    
    grid_min = float(np.min(flat))
    grid_max = float(np.max(flat))
    grid_range = grid_max - grid_min if grid_max > grid_min else 1.0
    
    norm_scores = (flat - grid_min) / grid_range
    
    # Citywide grid statistics
    grid_high = int(np.count_nonzero(norm_scores >= high_thresh))
    grid_med = int(np.count_nonzero((norm_scores >= low_thresh) & (norm_scores < high_thresh)))
    grid_low = int(np.count_nonzero(norm_scores < low_thresh))
    
    # Sort all 400 cells by intensity descending
    sorted_idxs = np.argsort(flat)[::-1]
    
    high_idxs = [i for i in sorted_idxs if norm_scores[i] >= high_thresh]
    med_idxs = [i for i in sorted_idxs if low_thresh <= norm_scores[i] < high_thresh]
    low_idxs = [i for i in sorted_idxs if norm_scores[i] < low_thresh]
    
    # Stratify top_k: e.g. for top_k=20 -> 10 High, 6 Medium, 4 Low
    n_high = min(len(high_idxs), max(1, int(top_k * 0.50)))
    n_med = min(len(med_idxs), max(1, int(top_k * 0.30)))
    n_low = min(len(low_idxs), top_k - n_high - n_med)
    
    # In case any tier has fewer, adjust remaining
    remaining = top_k - (n_high + n_med + n_low)
    if remaining > 0 and len(high_idxs) > n_high:
        n_high += remaining
        
    selected_idxs = high_idxs[:n_high] + med_idxs[:n_med] + low_idxs[:n_low]
    # Re-sort selected by intensity descending
    selected_idxs = sorted(selected_idxs, key=lambda i: flat[i], reverse=True)
    
    lat_min, lat_max = 40.49699056, 40.91533744
    lon_min, lon_max = -74.25823135737069, -73.69519705586761
    
    hotspots = []
    c_high = c_med = c_low = 0
    
    for idx in selected_idxs:
        r = idx // w
        c = idx % w
        intensity = float(flat[idx])
        score = float(norm_scores[idx])
        
        if score >= high_thresh:
            lvl = "High"
            c_high += 1
        elif score >= low_thresh:
            lvl = "Medium"
            c_med += 1
        else:
            lvl = "Low"
            c_low += 1
            
        lat = lat_min + ((r + 0.5) / h) * (lat_max - lat_min)
        lon = lon_min + ((c + 0.5) / w) * (lon_max - lon_min)
        
        hotspots.append({
            "latitude": round(lat, 6),
            "longitude": round(lon, 6),
            "predicted_intensity": round(intensity, 6),
            "risk_score": round(score, 4),
            "risk_level": lvl,
        })
        
    summary = {
        "total_hotspots": len(hotspots),
        "high_risk": c_high,
        "medium_risk": c_med,
        "low_risk": c_low,
        "grid_distribution": {
            "high": grid_high,
            "medium": grid_med,
            "low": grid_low,
            "total_cells": len(flat)
        },
        "highest_risk_location": hotspots[0] if hotspots else None
    }
    return hotspots, summary

async def test_stratified():
    await connect_to_mongo()
    initialize_ml()
    db = get_database()
    docs = await db.crimes.find().to_list(length=1000)
    
    target_dt = datetime(2024, 3, 25)
    x = build_convlstm_input(docs, target_dt)
    pred_grid = predict_grid(x)
    
    hotspots, summary = extract_stratified_hotspots(pred_grid, top_k=20, low_thresh=0.45, high_thresh=0.75)
    print("Summary:", summary)
    print("\nHotspots count by tier:")
    print("High:", [h["risk_score"] for h in hotspots if h["risk_level"] == "High"])
    print("Medium:", [h["risk_score"] for h in hotspots if h["risk_level"] == "Medium"])
    print("Low:", [h["risk_score"] for h in hotspots if h["risk_level"] == "Low"])
    
    await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(test_stratified())
