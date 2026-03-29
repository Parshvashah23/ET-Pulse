"""
Supabase JWT authentication middleware for FastAPI.
Validates tokens issued by Supabase Auth and extracts the user identity.
Replaces the old custom JWT system with Supabase-native auth.
"""
import os
from typing import Optional

from fastapi import Header, HTTPException, status
from jose import JWTError, jwt

from backend.db.supabase_client import get_supabase

# Supabase JWT Configuration
# The JWT secret is found in: Supabase Dashboard → Settings → API → JWT Secret
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "")
ALGORITHM = "HS256"


async def get_current_user(authorization: str = Header(None)) -> dict:
    """
    FastAPI dependency: extracts and validates the Supabase JWT from the
    Authorization header. Returns a dict with user info.

    The token is issued by Supabase Auth (sign-up, login, OAuth).
    The 'sub' field in the JWT payload is the user's UUID (= auth.users.id).

    Returns:
        dict with keys: sub (user_id UUID), email, role, etc.
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication scheme",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = authorization.split(" ", 1)[1]

    # Strategy 1: Verify locally using JWT secret (fast, no network call)
    if SUPABASE_JWT_SECRET:
        try:
            payload = jwt.decode(
                token,
                SUPABASE_JWT_SECRET,
                algorithms=[ALGORITHM],
                options={"verify_aud": False},  # Supabase tokens may not have aud
            )
            return {
                "sub": payload.get("sub"),              # UUID of the user
                "email": payload.get("email", ""),
                "role": payload.get("role", "authenticated"),
                "user_metadata": payload.get("user_metadata", {}),
            }
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
                headers={"WWW-Authenticate": "Bearer"},
            )

    # Strategy 2: Fallback — verify via Supabase API call (slower but works without JWT secret)
    try:
        sb = get_supabase()
        user_response = sb.auth.get_user(token)
        if user_response and user_response.user:
            user = user_response.user
            return {
                "sub": str(user.id),
                "email": user.email or "",
                "role": "authenticated",
                "user_metadata": user.user_metadata or {},
            }
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_optional_user(authorization: str = Header(None)) -> Optional[dict]:
    """
    FastAPI dependency: optionally get the current user.
    Returns None if no valid token is provided (no error raised).
    """
    if not authorization or not authorization.startswith("Bearer "):
        return None

    try:
        return await get_current_user(authorization)
    except HTTPException:
        return None
