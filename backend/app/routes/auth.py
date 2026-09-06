from fastapi import APIRouter, Depends
from app.schemas.auth import RegisterRequest, LoginRequest, UserPublic, LoginResponse
from app.services.auth_service import register_user, login_user
from app.dependencies.auth import get_current_user, require_admin

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserPublic)
async def register(payload: RegisterRequest):
    return await register_user(payload.username.strip(), payload.email.lower().strip(), payload.password)


@router.post("/login", response_model=LoginResponse)
async def login(payload: LoginRequest):
    return await login_user(payload.email.lower().strip(), payload.password)


@router.get("/me", response_model=UserPublic)
async def me(current_user=Depends(get_current_user)):
    return {
        "id": current_user["id"],
        "username": current_user["username"],
        "email": current_user["email"],
        "role": current_user.get("role", "user"),
        "is_active": current_user.get("is_active", True),
        "created_at": current_user.get("created_at"),
        "updated_at": current_user.get("updated_at"),
    }


@router.get("/admin-test")
async def admin_test(_admin=Depends(require_admin)):
    return {"message": "Admin access granted"}