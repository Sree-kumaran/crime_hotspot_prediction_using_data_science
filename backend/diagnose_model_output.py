import asyncio
import numpy as np
from app.database.mongodb import connect_to_mongo, close_mongo_connection, get_database
from app.ml.model_loader import initialize_ml
from app.ml.preprocessing import build_convlstm_input
from app.ml.predictor import predict_grid
from datetime import datetime

async def diagnose():
    await connect_to_mongo()
    initialize_ml()
    db = get_database()
    docs = await db.crimes.find().to_list(length=1000)
    
    target_dt = datetime(2024, 3, 25)
    x = build_convlstm_input(docs, target_dt)
    pred_grid = predict_grid(x)
    
    flat = pred_grid.flatten()
    print("=== FULL CONVLSTM GRID (20x20 = 400 cells) ===")
    print(f"Shape: {pred_grid.shape}")
    print(f"Min: {np.min(flat):.6f}")
    print(f"Max: {np.max(flat):.6f}")
    print(f"Mean: {np.mean(flat):.6f}")
    print(f"Median: {np.median(flat):.6f}")
    print(f"Std Dev: {np.std(flat):.6f}")
    print(f"Zero count: {np.count_nonzero(flat == 0)} / {len(flat)}")
    print(f"Non-zero count: {np.count_nonzero(flat > 0)} / {len(flat)}")
    print(f"Percentiles:")
    for p in [0, 25, 50, 75, 90, 95, 99, 100]:
        print(f"  P{p}: {np.percentile(flat, p):.6f}")
        
    top_20 = np.sort(flat)[::-1][:20]
    print("\n=== TOP 20 CELLS ===")
    print(f"Top 20 values: {[round(v, 6) for v in top_20]}")
    print(f"Top 20 Min: {np.min(top_20):.6f}, Max: {np.max(top_20):.6f}, Mean: {np.mean(top_20):.6f}, Std: {np.std(top_20):.6f}")
    print(f"Ratio top_20 min / max: {np.min(top_20) / np.max(top_20):.4f}")
    
    await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(diagnose())
