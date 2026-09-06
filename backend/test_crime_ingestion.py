import asyncio
from datetime import datetime
from app.database.mongodb import connect_to_mongo, close_mongo_connection, get_database
from app.ml.model_loader import initialize_ml
from app.schemas.crime import CrimeCreate
from app.routes.crime import create_crime, get_crimes


async def run_ingestion_test():
    print("=" * 50)
    print("TESTING CRIME DATA INGESTION & CONVLSTM PREDICTION PIPELINE")
    print("=" * 50)

    # 1. Initialize MongoDB & ML
    await connect_to_mongo()
    initialize_ml()
    db = get_database()

    initial_crimes_count = await db.crimes.count_documents({})
    initial_preds_count = await db.predictions.count_documents({})
    print(f"[TEST 1] Initial state -> Crimes: {initial_crimes_count}, Saved Predictions: {initial_preds_count}")

    # 2. Ingest a new crime record via create_crime
    payload = CrimeCreate(
        crime_type="robbery",
        date="2024-03-25",
        time="20:15",
        latitude=40.7580,
        longitude=-73.9855,
        location="Times Square Plaza",
        area="Manhattan",
        district="Precinct 14",
        severity="High",
        status="Reported",
        description="Ingestion test verification incident",
    )

    print("\n[TEST 2] Executing create_crime(payload)...")
    res = await create_crime(payload)

    print(f"  Result Success: {res.get('success')}")
    print(f"  Inserted ID: {res.get('crime', {}).get('id')}")
    print(f"  Prediction Status: {res.get('prediction_status')}")
    print(f"  Message: {res.get('message')}")

    assert res["success"] is True, "Expected success to be True"
    assert res["prediction_status"] == "success", f"Prediction status should be success, got {res.get('prediction_status')}"
    assert res["prediction"] is not None, "Prediction result should not be None"
    assert len(res["prediction"]["hotspots"]) == 20, f"Expected 20 hotspots, got {len(res['prediction']['hotspots'])}"

    # 3. Check MongoDB crime record persistence
    doc = await db.crimes.find_one({"date": "2024-03-25", "crime_type": "robbery", "location": "Times Square Plaza"})
    assert doc is not None, "Crime document not found in MongoDB"
    print("\n[TEST 3] Crime record verified in MongoDB 'crimes' collection: [PASS]")

    # 4. Check MongoDB prediction persistence
    new_preds_count = await db.predictions.count_documents({})
    assert new_preds_count > initial_preds_count, "Prediction not saved in MongoDB 'predictions' collection"
    print(f"[TEST 4] Prediction saved in MongoDB 'predictions' collection (Total: {new_preds_count}): [PASS]")

    # 5. Query recent crimes
    recent = await get_crimes(page=1, limit=5)
    assert recent["total"] >= initial_crimes_count + 1
    assert len(recent["data"]) > 0
    top = recent["data"][0]
    print(f"\n[TEST 5] get_crimes() retrieved {len(recent['data'])} records. Top: {top['crime_type']} at {top.get('location')} [PASS]")

    await close_mongo_connection()
    print("\n" + "=" * 50)
    print("ALL CRIME DATA INGESTION TESTS PASSED WITH 100% SUCCESS! [PASS]")
    print("=" * 50)


if __name__ == "__main__":
    asyncio.run(run_ingestion_test())
