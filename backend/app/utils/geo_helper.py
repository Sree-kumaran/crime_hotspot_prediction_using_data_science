import math
import random
from datetime import datetime, timedelta

NYC_NEIGHBORHOODS = [
    {"name": "Midtown Manhattan / Times Square", "borough": "Manhattan", "lat": 40.7580, "lon": -73.9855, "risk": "High", "base_intensity": 1.4},
    {"name": "Harlem / 125th St Corridor", "borough": "Manhattan", "lat": 40.8116, "lon": -73.9465, "risk": "High", "base_intensity": 1.3},
    {"name": "Lower East Side / Chinatown", "borough": "Manhattan", "lat": 40.7150, "lon": -73.9843, "risk": "Moderate", "base_intensity": 0.9},
    {"name": "Upper East Side", "borough": "Manhattan", "lat": 40.7736, "lon": -73.9566, "risk": "Low", "base_intensity": 0.4},
    {"name": "Greenwich Village / SoHo", "borough": "Manhattan", "lat": 40.7336, "lon": -74.0027, "risk": "Moderate", "base_intensity": 0.8},
    {"name": "Downtown Brooklyn / MetroTech", "borough": "Brooklyn", "lat": 40.6932, "lon": -73.9858, "risk": "High", "base_intensity": 1.25},
    {"name": "Williamsburg / Bedford Ave", "borough": "Brooklyn", "lat": 40.7081, "lon": -73.9571, "risk": "Moderate", "base_intensity": 0.85},
    {"name": "Crown Heights / Atlantic Ave", "borough": "Brooklyn", "lat": 40.6694, "lon": -73.9422, "risk": "High", "base_intensity": 1.15},
    {"name": "Coney Island / Brighton Beach", "borough": "Brooklyn", "lat": 40.5755, "lon": -73.9707, "risk": "Moderate", "base_intensity": 0.75},
    {"name": "South Bronx / Grand Concourse", "borough": "Bronx", "lat": 40.8162, "lon": -73.9184, "risk": "High", "base_intensity": 1.35},
    {"name": "Fordham / Belmont", "borough": "Bronx", "lat": 40.8610, "lon": -73.8906, "risk": "High", "base_intensity": 1.2},
    {"name": "Riverdale", "borough": "Bronx", "lat": 40.8903, "lon": -73.9126, "risk": "Low", "base_intensity": 0.35},
    {"name": "Flushing / Main St", "borough": "Queens", "lat": 40.7675, "lon": -73.8331, "risk": "Moderate", "base_intensity": 0.9},
    {"name": "Astoria / Ditmars", "borough": "Queens", "lat": 40.7644, "lon": -73.9235, "risk": "Moderate", "base_intensity": 0.7},
    {"name": "Long Island City / Queens Plaza", "borough": "Queens", "lat": 40.7447, "lon": -73.9485, "risk": "Moderate", "base_intensity": 0.65},
    {"name": "Jamaica / Sutphin Blvd", "borough": "Queens", "lat": 40.7027, "lon": -73.8014, "risk": "High", "base_intensity": 1.1},
    {"name": "Staten Island North Shore / St. George", "borough": "Staten Island", "lat": 40.6409, "lon": -74.0760, "risk": "Low", "base_intensity": 0.45},
    {"name": "Tottenville", "borough": "Staten Island", "lat": 40.5126, "lon": -74.2519, "risk": "Low", "base_intensity": 0.25},
]

CRIME_CATEGORIES = [
    {"type": "theft", "category": "theft", "severity": "Moderate", "weight": 0.32, "peak_window": "14:00 - 20:00"},
    {"type": "assault", "category": "assault", "severity": "High", "weight": 0.22, "peak_window": "21:00 - 03:00"},
    {"type": "robbery", "category": "robbery", "severity": "High", "weight": 0.16, "peak_window": "20:00 - 02:00"},
    {"type": "burglary", "category": "felony", "severity": "Moderate", "weight": 0.14, "peak_window": "01:00 - 06:00"},
    {"type": "vandalism", "category": "vandalism", "severity": "Low", "weight": 0.08, "peak_window": "18:00 - 23:00"},
    {"type": "grand larceny", "category": "felony", "severity": "Moderate", "weight": 0.05, "peak_window": "12:00 - 18:00"},
    {"type": "misdemeanor", "category": "misdemeanor", "severity": "Low", "weight": 0.03, "peak_window": "10:00 - 16:00"},
]


def get_nearest_neighborhood(lat: float, lon: float):
    best_match = NYC_NEIGHBORHOODS[0]
    min_dist = float("inf")
    for nb in NYC_NEIGHBORHOODS:
        dist = math.hypot(lat - nb["lat"], lon - nb["lon"])
        if dist < min_dist:
            min_dist = dist
            best_match = nb
    return best_match


def generate_synthetic_crimes_for_window(start_date, end_date):
    """
    Generates realistic, date-seeded NYC crime records for a 7-day window.
    Seeding is deterministic based on the date so identical dates always produce identical data,
    while changing the date (e.g. today vs tomorrow) creates a distinct 7-day distribution.
    """
    records = []
    curr = start_date
    while curr < end_date:
        # Date-specific deterministic seed
        seed_val = int(curr.strftime("%Y%m%d"))
        rnd = random.Random(seed_val)

        day_of_week = curr.weekday() # 0 = Monday, 6 = Sunday
        # Weekend bump in crime volume
        multiplier = 1.35 if day_of_week in (4, 5, 6) else 1.0
        num_incidents = int(rnd.randint(18, 32) * multiplier)

        for _ in range(num_incidents):
            nb = rnd.choice(NYC_NEIGHBORHOODS)
            # Pick crime category with weighted distribution
            cat_pick = rnd.choices(CRIME_CATEGORIES, weights=[c["weight"] for c in CRIME_CATEGORIES])[0]

            lat_jitter = rnd.uniform(-0.015, 0.015)
            lon_jitter = rnd.uniform(-0.015, 0.015)
            hour = rnd.randint(0, 23)
            minute = rnd.randint(0, 59)
            dt = datetime.combine(curr, datetime.min.time()).replace(hour=hour, minute=minute)

            records.append({
                "crime_type": cat_pick["type"],
                "category": cat_pick["category"],
                "severity": cat_pick["severity"],
                "area": f"{nb['name']} ({nb['borough']})",
                "borough": nb["borough"],
                "location": f"{nb['name']} - Block {rnd.randint(100, 999)}",
                "latitude": round(nb["lat"] + lat_jitter, 6),
                "longitude": round(nb["lon"] + lon_jitter, 6),
                "date": str(curr),
                "time": f"{hour:02d}:{minute:02d}",
                "datetime": dt.isoformat(),
                "status": rnd.choice(["Open", "Closed", "Under Investigation", "Reported"]),
                "description": f"Incident of {cat_pick['type']} reported in {nb['name']}, {nb['borough']}.",
                "created_at": dt.isoformat(),
            })
        curr += timedelta(days=1)
    return records
