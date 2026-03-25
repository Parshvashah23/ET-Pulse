"""
Authentication routes for login, registration, and OAuth.
"""
import os
from datetime import timedelta
from typing import Optional

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, EmailStr

from backend.models.user import (
    create_user,
    get_user_by_email,
    get_user_by_id,
    get_user_by_provider,
    verify_password,
    update_last_login,
    user_to_public,
)
from backend.middleware.auth import (
    create_access_token,
    get_current_user,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)

router = APIRouter(prefix="/auth", tags=["auth"])

# OAuth configuration
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID", "")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET", "")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")


# Request/Response models
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: dict


class UserResponse(BaseModel):
    user: dict


@router.post("/register", response_model=TokenResponse)
async def register(req: RegisterRequest):
    """Register a new user with email and password."""
    # Validate password
    if len(req.password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters",
        )

    try:
        user = create_user(
            email=req.email,
            password=req.password,
            name=req.name,
            provider="email",
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    # Generate token
    access_token = create_access_token(
        data={"sub": str(user["id"]), "email": user["email"]},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    return TokenResponse(
        access_token=access_token,
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=user,
    )


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest):
    """Login with email and password."""
    user = get_user_by_email(req.email)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.get("password_hash"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="This account uses social login. Please sign in with Google or GitHub.",
        )

    if not verify_password(req.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Update last login
    update_last_login(user["id"])

    # Generate token
    access_token = create_access_token(
        data={"sub": str(user["id"]), "email": user["email"]},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    return TokenResponse(
        access_token=access_token,
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=user_to_public(user),
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get the current authenticated user."""
    user_id = int(current_user["sub"])
    user = get_user_by_id(user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return UserResponse(user=user_to_public(user))


# OAuth Routes - Simplified for demo (full implementation requires authlib)
@router.get("/google")
async def google_login():
    """Redirect to Google OAuth."""
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.",
        )

    # In production, use authlib for proper OAuth flow
    # For now, return a simple message
    return {
        "message": "Google OAuth requires configuration",
        "setup": "Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file",
    }


@router.get("/github")
async def github_login():
    """Redirect to GitHub OAuth."""
    if not GITHUB_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="GitHub OAuth is not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET.",
        )

    # In production, use authlib for proper OAuth flow
    return {
        "message": "GitHub OAuth requires configuration",
        "setup": "Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in your .env file",
    }


@router.get("/google/callback")
async def google_callback(code: Optional[str] = None, error: Optional[str] = None):
    """Handle Google OAuth callback."""
    if error:
        return RedirectResponse(f"{FRONTEND_URL}/login?error={error}")

    # In production, exchange code for tokens and create/login user
    return RedirectResponse(f"{FRONTEND_URL}/login?error=oauth_not_configured")


@router.get("/github/callback")
async def github_callback(code: Optional[str] = None, error: Optional[str] = None):
    """Handle GitHub OAuth callback."""
    if error:
        return RedirectResponse(f"{FRONTEND_URL}/login?error={error}")

    # In production, exchange code for tokens and create/login user
    return RedirectResponse(f"{FRONTEND_URL}/login?error=oauth_not_configured")
