"""
User model with SQLite persistence and password hashing.
"""
import sqlite3
import json
from datetime import datetime
from pathlib import Path
from typing import Optional
from passlib.context import CryptContext

# Database path
DB_PATH = Path(__file__).parent.parent.parent / "data" / "users.db"
DB_PATH.parent.mkdir(exist_ok=True)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _get_connection():
    """Get SQLite connection with WAL mode for better concurrency."""
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def _init_db():
    """Initialize the users table."""
    conn = _get_connection()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT,
            name TEXT,
            avatar_url TEXT,
            provider TEXT DEFAULT 'email',
            provider_id TEXT,
            created_at TEXT NOT NULL,
            last_login TEXT,
            preferences TEXT
        )
    """)
    conn.commit()
    conn.close()


# Initialize database on module import
_init_db()


def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)


def create_user(
    email: str,
    password: Optional[str] = None,
    name: Optional[str] = None,
    provider: str = "email",
    provider_id: Optional[str] = None,
    avatar_url: Optional[str] = None,
) -> dict:
    """Create a new user and return the user dict."""
    conn = _get_connection()
    try:
        password_hash = hash_password(password) if password else None
        now = datetime.utcnow().isoformat()

        cursor = conn.execute(
            """
            INSERT INTO users (email, password_hash, name, avatar_url, provider, provider_id, created_at, preferences)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (email, password_hash, name, avatar_url, provider, provider_id, now, json.dumps({})),
        )
        conn.commit()

        user_id = cursor.lastrowid
        return {
            "id": user_id,
            "email": email,
            "name": name,
            "avatar_url": avatar_url,
            "provider": provider,
            "preferences": {},
        }
    except sqlite3.IntegrityError:
        raise ValueError("Email already exists")
    finally:
        conn.close()


def get_user_by_email(email: str) -> Optional[dict]:
    """Get a user by email."""
    conn = _get_connection()
    try:
        row = conn.execute(
            "SELECT * FROM users WHERE email = ?", (email,)
        ).fetchone()

        if row:
            return dict(row)
        return None
    finally:
        conn.close()


def get_user_by_id(user_id: int) -> Optional[dict]:
    """Get a user by ID."""
    conn = _get_connection()
    try:
        row = conn.execute(
            "SELECT * FROM users WHERE id = ?", (user_id,)
        ).fetchone()

        if row:
            return dict(row)
        return None
    finally:
        conn.close()


def get_user_by_provider(provider: str, provider_id: str) -> Optional[dict]:
    """Get a user by OAuth provider and provider ID."""
    conn = _get_connection()
    try:
        row = conn.execute(
            "SELECT * FROM users WHERE provider = ? AND provider_id = ?",
            (provider, provider_id),
        ).fetchone()

        if row:
            return dict(row)
        return None
    finally:
        conn.close()


def update_last_login(user_id: int):
    """Update the last login timestamp."""
    conn = _get_connection()
    try:
        now = datetime.utcnow().isoformat()
        conn.execute(
            "UPDATE users SET last_login = ? WHERE id = ?",
            (now, user_id),
        )
        conn.commit()
    finally:
        conn.close()


def update_user_preferences(user_id: int, preferences: dict):
    """Update user preferences."""
    conn = _get_connection()
    try:
        conn.execute(
            "UPDATE users SET preferences = ? WHERE id = ?",
            (json.dumps(preferences), user_id),
        )
        conn.commit()
    finally:
        conn.close()


def user_to_public(user: dict) -> dict:
    """Convert a user dict to a public-safe format (no password hash)."""
    preferences = user.get("preferences")
    if isinstance(preferences, str):
        try:
            preferences = json.loads(preferences)
        except:
            preferences = {}

    return {
        "id": user["id"],
        "email": user["email"],
        "name": user.get("name"),
        "avatar_url": user.get("avatar_url"),
        "provider": user.get("provider", "email"),
        "preferences": preferences or {},
    }
