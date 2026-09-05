from motor.motor_asyncio import AsyncIOMotorClient
from app.config.settings import settings

client: AsyncIOMotorClient | None = None
db = None


async def connect_to_mongo():
    global client, db
    client = AsyncIOMotorClient(settings.MONGODB_URI)
    db = client[settings.MONGODB_DATABASE]
    await db.command("ping")


async def close_mongo_connection():
    global client
    if client:
        client.close()


def get_database():
    if db is None:
        raise RuntimeError("Database not initialized")
    return db