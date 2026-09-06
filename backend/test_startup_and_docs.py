import json
from app.main import app


def test_app_and_docs():
    print("=" * 50)
    print("TESTING FASTAPI STARTUP & OPENAPI SCHEMA GENERATION")
    print("=" * 50)

    # 1. Generate OpenAPI schema
    openapi = app.openapi()
    assert openapi is not None, "OpenAPI schema should not be None"
    print(f"[TEST 1] OpenAPI Title: {openapi.get('info', {}).get('title')} v{openapi.get('info', {}).get('version')}")

    # 2. Check registered routes in OpenAPI paths
    paths = openapi.get("paths", {})
    print(f"[TEST 2] Total registered API path entries: {len(paths)}")
    for p in paths.keys():
        print(f"   -> {p}")

    assert "/api/crimes" in paths, "Route /api/crimes missing in OpenAPI"
    assert "/api/predictions" in paths, "Route /api/predictions missing in OpenAPI"
    assert "/api/health" in paths or "/api/health/ping" in paths or any("/health" in p for p in paths), "Health route missing"

    # 3. Check Schemas in components
    schemas = openapi.get("components", {}).get("schemas", {})
    print(f"\n[TEST 3] Registered Pydantic component schemas: {len(schemas)}")
    for s in schemas.keys():
        print(f"   -> {s}")

    assert "HotspotPredictionRequest" in schemas, "HotspotPredictionRequest missing in schemas"
    assert "HotspotPredictionResponse" in schemas, "HotspotPredictionResponse missing in schemas"
    assert "CrimeCreate" in schemas, "CrimeCreate missing in schemas"

    print("\n" + "=" * 50)
    print("FASTAPI STARTUP & OPENAPI VERIFICATION: 100% SUCCESS! [PASS]")
    print("=" * 50)


if __name__ == "__main__":
    test_app_and_docs()
