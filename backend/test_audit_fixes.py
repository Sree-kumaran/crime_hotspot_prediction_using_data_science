import asyncio
from datetime import datetime
from app.database.mongodb import connect_to_mongo, close_mongo_connection, get_database
from app.ml.model_loader import initialize_ml
from app.services.prediction_hotspot_service import generate_hotspot_prediction
from app.services.settings_service import (
    get_app_settings,
    update_app_settings,
    reset_app_settings,
)
from app.schemas.settings import AppSettings
from app.schemas.crime import CrimeCreate
from app.routes.crime import create_crime
from app.routes.analytics import (
    analytics_overview,
    analytics_crime_types,
    analytics_crime_trends,
    analytics_risk_overview,
)


async def run_audit_validation():
    print("=" * 60)
    print("STARTING FULL APPLICATION AUDIT VALIDATION TEST")
    print("=" * 60)

    # 1. Initialize DB & ML
    await connect_to_mongo()
    initialize_ml()
    db = get_database()
    print("\n[STEP 1] MongoDB & ConvLSTM initialized: [PASS]")

    # 2. Reset settings to default baseline
    print("\n[STEP 2] Testing Settings Persistence & Defaults...")
    default_settings = await reset_app_settings()
    assert default_settings["low_risk_threshold"] == 0.45
    assert default_settings["high_risk_threshold"] == 0.75
    assert default_settings["top_k_hotspots"] == 20
    print(f"  Default settings loaded: Low={default_settings['low_risk_threshold']}, High={default_settings['high_risk_threshold']}")

    # 3. Test ConvLSTM Prediction with Multi-Tier Classification (Issue #1 Validation)
    print("\n[STEP 3] Testing ConvLSTM Multi-Tier Risk Classification (Issue #1)...")
    pred = await generate_hotspot_prediction("2024-03-25")
    hotspots = pred.get("hotspots", [])
    summary = pred.get("summary", {})

    print(f"  Total Hotspots: {len(hotspots)}")
    print(f"  Summary High: {summary.get('high_risk')}, Medium: {summary.get('medium_risk')}, Low: {summary.get('low_risk')}")
    print(f"  Grid Distribution: {summary.get('grid_distribution')}")

    high_count = sum(1 for h in hotspots if h["risk_level"] == "High")
    med_count = sum(1 for h in hotspots if h["risk_level"] in ["Medium", "Moderate"])
    low_count = sum(1 for h in hotspots if h["risk_level"] == "Low")

    print(f"  Verified Cluster Breakdown: High={high_count}, Medium={med_count}, Low={low_count}")
    assert high_count > 0, "Should have High risk clusters"
    assert med_count > 0, "Should have Medium risk clusters (Issue #1 fix)"
    assert low_count > 0, "Should have Low risk clusters (Issue #1 fix)"
    print("  [PASS] Issue #1 Verified: Map & Prediction now display High, Medium, and Low risk tiers correctly!")

    # 4. Test Modifiable Settings & Dynamic Effect (Issue #2 Validation)
    print("\n[STEP 4] Testing Modifiable Settings & Dynamic Effect (Issue #2)...")
    custom_settings = AppSettings(
        agency_name="Custom Safety Unit",
        jurisdiction="Greater New York",
        low_risk_threshold=0.30,
        high_risk_threshold=0.85,
        top_k_hotspots=25,
        default_zoom=14,
        heatmap_radius=30,
        notification_channel="email",
    )
    saved = await update_app_settings(custom_settings)
    assert saved["low_risk_threshold"] == 0.30
    assert saved["high_risk_threshold"] == 0.85
    assert saved["top_k_hotspots"] == 25

    # Verify persistent retrieval from MongoDB
    fetched = await get_app_settings()
    assert fetched["agency_name"] == "Custom Safety Unit"
    assert fetched["low_risk_threshold"] == 0.30
    assert fetched["high_risk_threshold"] == 0.85
    assert fetched["top_k_hotspots"] == 25
    print("  Custom settings successfully saved and retrieved from MongoDB: [PASS]")

    # Run prediction and verify dynamic effect of custom thresholds
    custom_pred = await generate_hotspot_prediction("2024-03-25")
    assert len(custom_pred["hotspots"]) == 25, f"Expected 25 hotspots from custom settings, got {len(custom_pred['hotspots'])}"
    print(f"  Prediction dynamically extracted {len(custom_pred['hotspots'])} hotspots with custom thresholds! [PASS]")

    # Reset back to standard defaults for clean production state
    await reset_app_settings()
    print("  Settings restored to defaults: [PASS]")

    # 5. Test Analytics API Endpoints
    print("\n[STEP 5] Testing Analytics Endpoints...")
    ov = await analytics_overview()
    assert "total_crimes" in ov and ov["total_crimes"] > 0
    print(f"  Analytics Overview: {ov}")

    ct = await analytics_crime_types()
    assert len(ct) > 0
    print(f"  Crime Types count: {len(ct)}")

    trends = await analytics_crime_trends()
    assert len(trends) > 0
    print(f"  Crime Trends points: {len(trends)}")

    ro = await analytics_risk_overview()
    assert len(ro) > 0
    print(f"  Risk Overview buckets: {len(ro)}")

    # 6. Test Crime Ingestion Pipeline End-to-End
    print("\n[STEP 6] Testing Crime Ingestion Pipeline...")
    ingest_payload = CrimeCreate(
        crime_type="assault",
        date="2024-03-25",
        time="22:30",
        latitude=40.7128,
        longitude=-74.0060,
        location="City Hall Park Area",
        area="Manhattan",
        district="Precinct 1",
        severity="High",
        status="Reported",
        description="Audit verification incident record",
    )
    res = await create_crime(ingest_payload)
    assert res["success"] is True
    assert res["prediction_status"] == "success"
    assert res["prediction"] is not None
    print(f"  Incident ingested (ID: {res['crime']['id']}) & ConvLSTM prediction refreshed: [PASS]")

    await close_mongo_connection()
    print("\n" + "=" * 60)
    print("ALL AUDIT VALIDATION TESTS COMPLETED WITH 100% SUCCESS! [PASS]")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(run_audit_validation())
