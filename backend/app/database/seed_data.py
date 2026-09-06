import random
from datetime import datetime, timedelta
from app.database.mongodb import get_database

NYC_AREAS = [
    {"name": "Midtown Manhattan", "lat": 40.7549, "lon": -73.9840, "base_risk": "High"},
    {"name": "Downtown Brooklyn", "lat": 40.6932, "lon": -73.9858, "base_risk": "High"},
    {"name": "Harlem", "lat": 40.8116, "lon": -73.9465, "base_risk": "High"},
    {"name": "South Bronx", "lat": 40.8162, "lon": -73.9184, "base_risk": "High"},
    {"name": "Flushing Queens", "lat": 40.7675, "lon": -73.8331, "base_risk": "Moderate"},
    {"name": "Astoria", "lat": 40.7644, "lon": -73.9235, "base_risk": "Moderate"},
    {"name": "Williamsburg", "lat": 40.7081, "lon": -73.9571, "base_risk": "Moderate"},
    {"name": "Crown Heights", "lat": 40.6694, "lon": -73.9422, "base_risk": "Moderate"},
    {"name": "Lower East Side", "lat": 40.7150, "lon": -73.9843, "base_risk": "Moderate"},
    {"name": "Upper East Side", "lat": 40.7736, "lon": -73.9566, "base_risk": "Low"},
    {"name": "Greenwich Village", "lat": 40.7336, "lon": -74.0027, "base_risk": "Low"},
    {"name": "Staten Island North", "lat": 40.6409, "lon": -74.0760, "base_risk": "Low"},
    {"name": "Long Island City", "lat": 40.7447, "lon": -73.9485, "base_risk": "Low"},
]

CRIME_TYPES = [
    {"type": "theft", "category": "theft", "severity": "Moderate"},
    {"type": "assault", "category": "assault", "severity": "High"},
    {"type": "robbery", "category": "robbery", "severity": "High"},
    {"type": "burglary", "category": "felony", "severity": "Moderate"},
    {"type": "vandalism", "category": "vandalism", "severity": "Low"},
    {"type": "grand larceny", "category": "felony", "severity": "Moderate"},
    {"type": "misdemeanor", "category": "misdemeanor", "severity": "Low"},
]


async def seed_crimes_if_empty():
    db = get_database()
    count = await db.crimes.count_documents({})
    if count > 0:
        return count

    print("[SEED] Seeding initial NYC crime incident dataset...")
    random.seed(42)
    records = []

    # Generate dates across past 90 days
    base_date = datetime(2024, 3, 31)
    for day_offset in range(90):
        current_day = base_date - timedelta(days=day_offset)
        num_incidents = random.randint(15, 35)

        for _ in range(num_incidents):
            area = random.choice(NYC_AREAS)
            crime = random.choice(CRIME_TYPES)
            lat_jitter = random.uniform(-0.02, 0.02)
            lon_jitter = random.uniform(-0.02, 0.02)

            hour = random.randint(0, 23)
            minute = random.randint(0, 59)
            dt = current_day.replace(hour=hour, minute=minute)

            records.append({
                "crime_type": crime["type"],
                "category": crime["category"],
                "severity": crime["severity"],
                "area": area["name"],
                "location": f"{area['name']} - Block {random.randint(100, 999)}",
                "latitude": round(area["lat"] + lat_jitter, 6),
                "longitude": round(area["lon"] + lon_jitter, 6),
                "date": str(current_day.date()),
                "time": f"{hour:02d}:{minute:02d}",
                "datetime": dt.isoformat(),
                "status": random.choice(["Open", "Closed", "Under Investigation"]),
                "description": f"Reported {crime['type']} incident in {area['name']}.",
            })

    if records:
        await db.crimes.insert_many(records)
        print(f"[SEED] Successfully seeded {len(records)} crime records.")

    return len(records)
