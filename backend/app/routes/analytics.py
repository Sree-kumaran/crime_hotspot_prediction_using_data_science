from fastapi import APIRouter
from app.database.mongodb import get_database

router = APIRouter()


@router.get("/analytics/overview")
async def analytics_overview():
    db = get_database()
    total = await db.crimes.count_documents({})
    high = await db.crimes.count_documents({"severity": {"$in": ["High", "Critical"]}})
    open_cases = await db.crimes.count_documents({"status": "Open"})
    return {
        "total_crimes": total,
        "high_risk_count": high,
        "open_cases": open_cases
    }


@router.get("/analytics/crime-types")
async def analytics_crime_types():
    db = get_database()
    pipeline = [{"$group": {"_id": "$crime_type", "count": {"$sum": 1}}}]
    data = await db.crimes.aggregate(pipeline).to_list(length=100)
    return [{"label": i["_id"], "value": i["count"]} for i in data]