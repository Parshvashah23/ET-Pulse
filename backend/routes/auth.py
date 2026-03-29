"""
Authentication routes — powered by Supabase Auth.
Handles signup, login, OAuth (Google/GitHub), token refresh, and user profile.
All auth state is managed by Supabase — no local SQLite or custom JWTs.
"""
import os
from typing import Optional

from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, EmailStr

from backend.db.supabase_client import get_supabase
from backend.middleware.auth import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")


# ─────────────────────────────────────────────────────────────────────────────
# Request / Response Models
# ─────────────────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: dict


class RefreshRequest(BaseModel):
    refresh_token: str


class UpdateProfileRequest(BaseModel):
    display_name: Optional[str] = None
    role: Optional[str] = None
    interests: Optional[list] = None
    portfolio_tags: Optional[list] = None


class UserResponse(BaseModel):
    user: dict


# ─────────────────────────────────────────────────────────────────────────────
# Helper: sync the Supabase Auth user to our public.users table
# ─────────────────────────────────────────────────────────────────────────────

def _sync_user_profile(user_id: str, email: str, display_name: str = None):
    """
    Upsert a row in public.users to keep it in sync with auth.users.
    Called after signup and login.
    """
    sb = get_supabase()
    payload = {
        "user_id": user_id,
        "email": email,
        "display_name": display_name or email.split("@")[0],
    }
    try:
        sb.table("users").upsert(payload, on_conflict="user_id").execute()
    except Exception as e:
        # Non-fatal: profile sync failure shouldn't block authentication
        print(f"[auth] Profile sync warning: {e}")


def _format_user(user, metadata: dict = None) -> dict:
    """Format a Supabase user object into a clean dict for the frontend."""
    meta = metadata or {}
    return {
        "id": str(user.id) if hasattr(user, "id") else str(user.get("id", "")),
        "email": user.email if hasattr(user, "email") else user.get("email", ""),
        "name": meta.get("name") or meta.get("display_name") or (
            user.email.split("@")[0] if hasattr(user, "email") else ""
        ),
        "avatar_url": meta.get("avatar_url"),
        "provider": user.app_metadata.get("provider", "email") if hasattr(user, "app_metadata") else "email",
    }


# ─────────────────────────────────────────────────────────────────────────────
# Auth Routes
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/register", response_model=TokenResponse)
async def register(req: RegisterRequest):
    """
    Register a new user with email and password via Supabase Auth.
    Also creates a profile row in public.users.
    """
    if len(req.password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters",
        )

    sb = get_supabase()
    try:
        result = sb.auth.sign_up({
            "email": req.email,
            "password": req.password,
            "options": {
                "data": {
                    "name": req.name,
                    "display_name": req.name,
                }
            }
        })

        if not result.user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Registration failed — the email may already be in use.",
            )

        # Sync to public.users table
        _sync_user_profile(
            user_id=str(result.user.id),
            email=req.email,
            display_name=req.name,
        )

        # If email confirmation is disabled, we get a session immediately
        if result.session:
            return TokenResponse(
                access_token=result.session.access_token,
                refresh_token=result.session.refresh_token,
                expires_in=result.session.expires_in or 3600,
                user=_format_user(result.user, result.user.user_metadata),
            )

        # If email confirmation is enabled, no session yet
        return TokenResponse(
            access_token="",
            refresh_token="",
            expires_in=0,
            user=_format_user(result.user, result.user.user_metadata),
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Registration failed: {str(e)}",
        )


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest):
    """
    Login with email and password via Supabase Auth.
    Returns access_token + refresh_token.
    """
    sb = get_supabase()
    try:
        result = sb.auth.sign_in_with_password({
            "email": req.email,
            "password": req.password,
        })

        if not result.session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        # Sync profile to public.users
        _sync_user_profile(
            user_id=str(result.user.id),
            email=req.email,
            display_name=result.user.user_metadata.get("name"),
        )

        # Update last_active_at
        try:
            sb.table("users").update({
                "last_active_at": "now()",
            }).eq("user_id", str(result.user.id)).execute()
        except Exception:
            pass  # Non-fatal

        return TokenResponse(
            access_token=result.session.access_token,
            refresh_token=result.session.refresh_token,
            expires_in=result.session.expires_in or 3600,
            user=_format_user(result.user, result.user.user_metadata),
        )

    except HTTPException:
        raise
    except Exception as e:
        error_msg = str(e).lower()
        if "invalid" in error_msg or "credentials" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Login failed: {str(e)}",
        )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(req: RefreshRequest):
    """Refresh an expired access token using the refresh token."""
    sb = get_supabase()
    try:
        result = sb.auth.refresh_session(req.refresh_token)

        if not result.session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
            )

        return TokenResponse(
            access_token=result.session.access_token,
            refresh_token=result.session.refresh_token,
            expires_in=result.session.expires_in or 3600,
            user=_format_user(result.user, result.user.user_metadata),
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token refresh failed: {str(e)}",
        )


@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    """Sign out the current user (invalidates the Supabase session)."""
    try:
        sb = get_supabase()
        sb.auth.sign_out()
        return {"message": "Logged out successfully"}
    except Exception:
        return {"message": "Logged out"}


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    """
    Get the current authenticated user's profile.
    Combines Supabase Auth identity with the public.users profile.
    """
    user_id = current_user["sub"]
    sb = get_supabase()

    # Fetch from public.users table
    try:
        result = sb.table("users").select("*").eq("user_id", user_id).single().execute()
        profile = result.data
    except Exception:
        profile = None

    user_data = {
        "id": user_id,
        "email": current_user.get("email", ""),
        "name": current_user.get("user_metadata", {}).get("name", ""),
        "provider": "supabase",
    }

    if profile:
        user_data.update({
            "name": profile.get("display_name") or user_data["name"],
            "role": profile.get("role"),
            "interests": profile.get("interests", []),
            "portfolio_tags": profile.get("portfolio_tags", []),
            "created_at": profile.get("created_at"),
            "last_active_at": profile.get("last_active_at"),
        })

    return UserResponse(user=user_data)


@router.patch("/profile")
async def update_profile(
    req: UpdateProfileRequest,
    current_user: dict = Depends(get_current_user),
):
    """Update the current user's profile in public.users."""
    user_id = current_user["sub"]
    sb = get_supabase()

    payload = {}
    if req.display_name is not None:
        payload["display_name"] = req.display_name
    if req.role is not None:
        payload["role"] = req.role
    if req.interests is not None:
        payload["interests"] = req.interests
    if req.portfolio_tags is not None:
        payload["portfolio_tags"] = req.portfolio_tags

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update",
        )

    try:
        result = sb.table("users").update(payload).eq("user_id", user_id).execute()
        return {"message": "Profile updated", "updated": payload}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Profile update failed: {str(e)}",
        )


# ─────────────────────────────────────────────────────────────────────────────
# OAuth — Supabase handles the full OAuth flow
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/google")
async def google_login():
    """
    Get the Google OAuth URL from Supabase.
    The frontend redirects the user to this URL.
    After auth, Supabase redirects back to your frontend callback.
    """
    sb = get_supabase()
    try:
        result = sb.auth.sign_in_with_oauth({
            "provider": "google",
            "options": {
                "redirect_to": f"{FRONTEND_URL}/auth/callback",
            }
        })
        return {"url": result.url}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail=f"Google OAuth not configured in Supabase: {str(e)}",
        )


@router.get("/github")
async def github_login():
    """
    Get the GitHub OAuth URL from Supabase.
    The frontend redirects the user to this URL.
    """
    sb = get_supabase()
    try:
        result = sb.auth.sign_in_with_oauth({
            "provider": "github",
            "options": {
                "redirect_to": f"{FRONTEND_URL}/auth/callback",
            }
        })
        return {"url": result.url}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail=f"GitHub OAuth not configured in Supabase: {str(e)}",
        )
