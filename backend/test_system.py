import asyncio
import sys
from datetime import date
from app.database.mongodb import connect_to_mongo, close_mongo_connection, get_database
from app.ml.model_loader import initialize_ml, get_model, get_metadata, get_grid_config
from app.database.seed_data import seed_crimes_if_empty
from app.services.prediction_hotspot_service import generate_hotspot_prediction


async def run_integration_tests():
    print("==================================================")
    print("STARTING FULL SYSTEM INTEGRATION TEST")
    print("==================================================")

    # 1. Connect MongoDB
    print("\n[TEST 1/5] Connecting to MongoDB...")
    await connect_to_mongo()
    db = get_database()
    await db.command("ping")
    print(" [PASS] MongoDB connected successfully.")

    # 2. Seed Crimes if needed
    print("\n[TEST 2/5] Checking and seeding incident records...")
    seeded_count = await seed_crimes_if_empty()
    total_crimes = await db.crimes.count_documents({})
    assert total_crimes > 0, "Crimes collection should not be empty"
    print(f" [PASS] Crimes collection ready. Total records: {total_crimes}")

    # 3. Initialize and test ML Model
    print("\n[TEST 3/5] Loading ConvLSTM ML model and metadata...")
    initialize_ml()
    model = get_model()
    metadata = get_metadata()
    grid_cfg = get_grid_config()
    assert model is not None, "Model should be loaded"
    assert metadata["model_name"] == "crime_hotspot_convlstm"
    print(f" [PASS] ConvLSTM model loaded successfully: {model.name}")
    print(f"   Input shape: {metadata['input_shape']}, Output shape: {metadata['output_shape']}")
    print(f"   Grid dimensions: {grid_cfg['grid_height']}x{grid_cfg['grid_width']}")

    # 4. Run real ConvLSTM Hotspot Prediction
    print("\n[TEST 4/5] Executing real ConvLSTM Hotspot Prediction for date 2024-03-25...")
    pred_res = await generate_hotspot_prediction("2024-03-25")
    assert pred_res is not None, "Prediction result should not be None"
    assert "summary" in pred_res, "Summary missing"
    assert "hotspots" in pred_res, "Hotspots list missing"
    assert len(pred_res["hotspots"]) == 20, f"Expected 20 hotspots, got {len(pred_res['hotspots'])}"

    sample = pred_res["hotspots"][0]
    assert 40.4 <= sample["latitude"] <= 41.0, f"Latitude out of NYC bounds: {sample['latitude']}"
    assert -74.3 <= sample["longitude"] <= -73.6, f"Longitude out of NYC bounds: {sample['longitude']}"
    assert 0.0 <= sample["risk_score"] <= 1.0, f"Risk score out of [0, 1]: {sample['risk_score']}"
    assert sample["risk_level"] in ["High", "Medium", "Low"], f"Invalid risk level: {sample['risk_level']}"
    print(f" [PASS] Prediction executed and verified! Top hotspot: {sample}")
    print(f"   Summary stats: {pred_res['summary']}")

    # 5. Verify MongoDB persistence
    print("\n[TEST 5/5] Verifying MongoDB prediction persistence and history...")
    latest = await db.predictions.find_one(sort=[("generated_at", -1)])
    assert latest is not None, "Prediction should be persisted in MongoDB"
    assert latest["prediction_date"] == "2024-03-25"
    assert "hotspots" in latest and len(latest["hotspots"]) == 20
    assert "timing_ms" in latest
    total_saved = await db.predictions.count_documents({})
    print(f" [PASS] Prediction successfully persisted in MongoDB! Total saved predictions: {total_saved}")
    print(f"   Inference timing metrics: {latest['timing_ms']}")

    # Cleanup
    await close_mongo_connection()
    print("\n==================================================")
    print("ALL 5 SYSTEM INTEGRATION TESTS PASSED WITH 100% SUCCESS! [PASS]")
    print("==================================================")


if __name__ == "__main__":
    asyncio.run(run_integration_tests())
