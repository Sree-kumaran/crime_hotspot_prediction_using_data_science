from datetime import datetime, timezone
from fastapi import HTTPException, status
from bson import ObjectId

from app.database.mongodb import get_database
from app.utils.security import hash_password, verify_password, create_access_token


def _to_user_public(user: dict):
    return {
        "id": str(user["_id"]),
        "username": user["username"],
        "email": user["email"],
        "role": user.get("role", "user"),
        "is_active": user.get("is_active", True),
        "created_at": user.get("created_at"),
        "updated_at": user.get("updated_at"),
    }


async def register_user(username: str, email: str, password: str):
    db = get_database()

    existing_username = await db.users.find_one({"username": username})
    if existing_username:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already exists.")

    existing_email = await db.users.find_one({"email": email})
    if existing_email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already exists.")

    now = datetime.now(timezone.utc)
    user_doc = {
        "username": username,
        "email": email,
        "hashed_password": hash_password(password),
        "role": "user",
        "is_active": True,
        "created_at": now,
        "updated_at": now,
    }

    result = await db.users.insert_one(user_doc)
    user = await db.users.find_one({"_id": ObjectId(result.inserted_id)})
    return _to_user_public(user)


async def login_user(email: str, password: str):
    db = get_database()
    user = await db.users.find_one({"email": email})

    if not user or not verify_password(password, user["hashed_password"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password.")

    if not user.get("is_active", True):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User is inactive.")

    token_payload = {
        "sub": str(user["_id"]),
        "email": user["email"],
        "username": user["username"],
        "role": user.get("role", "user"),
    }
    access_token = create_access_token(token_payload)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": _to_user_public(user),
    }