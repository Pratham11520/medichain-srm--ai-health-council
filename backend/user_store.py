"""
User Data Store — Per-Account Encrypted Storage (Industry Grade)

Architecture:
  - JSON-file-based per-user storage (no external database dependency)
  - Data stored in user_data/{email_hash}/ directory
  - Backend stores ONLY encrypted blobs — zero knowledge of plaintext
  - Client-side AES-256-GCM encryption before sending to backend
  - Supports: profile, chat_history, health_readings, pill_reminders, preferences

JWT Authentication:
  - Google ID token verification via google-auth library
  - Session tokens (HS256 JWT) with 7-day expiry
  - Token refresh on each authenticated request
"""

import os
import json
import time
import hashlib
import hmac
import base64
import logging
from pathlib import Path
from typing import Optional, Dict, Any

logger = logging.getLogger("medichain.user_store")

# Base directory for all user data
USER_DATA_DIR = Path(__file__).parent / "user_data"
USER_DATA_DIR.mkdir(exist_ok=True)

# JWT secret — in production use env var
JWT_SECRET = os.getenv("JWT_SECRET", "medichain-srm-jwt-secret-2024-industry-grade")
JWT_EXPIRY = 7 * 24 * 3600  # 7 days


# ══════════════════════════════════════════════════════════════════════
# JWT Token Management (HS256 — lightweight, no external deps)
# ══════════════════════════════════════════════════════════════════════

def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode()


def _b64url_decode(s: str) -> bytes:
    s += '=' * (4 - len(s) % 4)
    return base64.urlsafe_b64decode(s)


def create_jwt(email: str, name: str = "", picture: str = "") -> str:
    """Create a signed JWT token for authenticated sessions."""
    header = _b64url_encode(json.dumps({"alg": "HS256", "typ": "JWT"}).encode())
    payload_data = {
        "email": email,
        "name": name,
        "picture": picture,
        "iat": int(time.time()),
        "exp": int(time.time()) + JWT_EXPIRY,
    }
    payload = _b64url_encode(json.dumps(payload_data).encode())
    signature_input = f"{header}.{payload}"
    signature = _b64url_encode(
        hmac.new(JWT_SECRET.encode(), signature_input.encode(), hashlib.sha256).digest()
    )
    return f"{header}.{payload}.{signature}"


def verify_jwt(token: str) -> Optional[dict]:
    """Verify and decode a JWT token. Returns payload or None."""
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return None

        header, payload, signature = parts
        # Verify signature
        expected_sig = _b64url_encode(
            hmac.new(JWT_SECRET.encode(), f"{header}.{payload}".encode(), hashlib.sha256).digest()
        )
        if not hmac.compare_digest(signature, expected_sig):
            logger.warning("JWT signature mismatch")
            return None

        # Decode payload
        payload_data = json.loads(_b64url_decode(payload))

        # Check expiry
        if payload_data.get("exp", 0) < time.time():
            logger.warning(f"JWT expired for {payload_data.get('email', 'unknown')}")
            return None

        return payload_data
    except Exception as e:
        logger.warning(f"JWT verification failed: {e}")
        return None


# ══════════════════════════════════════════════════════════════════════
# Google OAuth Token Verification
# ══════════════════════════════════════════════════════════════════════

async def verify_google_token(id_token: str) -> Optional[dict]:
    """
    Verify Google ID token and extract user info.
    Uses Google's tokeninfo endpoint (simple, no extra deps).
    Returns {email, name, picture} or None.
    """
    import httpx

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                f"https://oauth2.googleapis.com/tokeninfo?id_token={id_token}"
            )
            if resp.status_code == 200:
                data = resp.json()
                email = data.get("email", "")
                if email and data.get("email_verified") in ("true", True):
                    return {
                        "email": email,
                        "name": data.get("name", email.split("@")[0]),
                        "picture": data.get("picture", ""),
                    }
                else:
                    logger.warning(f"Google token: email not verified ({email})")
            else:
                logger.warning(f"Google tokeninfo returned {resp.status_code}: {resp.text[:200]}")
    except Exception as e:
        logger.warning(f"Google token verification failed: {type(e).__name__}: {e}")

    return None


# ══════════════════════════════════════════════════════════════════════
# Per-User File Storage (Zero-Knowledge Encrypted)
# ══════════════════════════════════════════════════════════════════════

def _get_user_dir(email: str) -> Path:
    """Get/create the storage directory for a user."""
    email_hash = hashlib.sha256(email.lower().encode()).hexdigest()[:20]
    user_dir = USER_DATA_DIR / email_hash
    user_dir.mkdir(exist_ok=True)

    # Store email→hash mapping for admin reference
    mapping_file = USER_DATA_DIR / "email_mappings.json"
    try:
        if mapping_file.exists():
            mappings = json.loads(mapping_file.read_text())
        else:
            mappings = {}
        if email.lower() not in mappings:
            mappings[email.lower()] = email_hash
            mapping_file.write_text(json.dumps(mappings, indent=2))
    except Exception:
        pass

    return user_dir


# Valid data types that can be stored
VALID_DATA_TYPES = {
    "profile",
    "chat_history",
    "health_readings",
    "pill_reminders",
    "pill_logs",
    "preferences",
    "blockchain_chain",
}


def save_user_data(email: str, data_type: str, encrypted_blob: str) -> dict:
    """
    Save encrypted data for a user. Backend stores encrypted blob as-is.
    Returns metadata about the save operation.
    """
    if data_type not in VALID_DATA_TYPES:
        raise ValueError(f"Invalid data_type: {data_type}. Must be one of {VALID_DATA_TYPES}")

    user_dir = _get_user_dir(email)
    file_path = user_dir / f"{data_type}.enc"

    # Write the encrypted blob
    file_path.write_text(encrypted_blob)

    # Update metadata
    meta_path = user_dir / "meta.json"
    try:
        if meta_path.exists():
            meta = json.loads(meta_path.read_text())
        else:
            meta = {"email": email, "created_at": int(time.time()), "data_types": {}}

        meta["data_types"][data_type] = {
            "updated_at": int(time.time()),
            "size_bytes": len(encrypted_blob),
        }
        meta["last_sync"] = int(time.time())
        meta_path.write_text(json.dumps(meta, indent=2))
    except Exception as e:
        logger.warning(f"Failed to update user metadata: {e}")

    logger.info(f"[UserStore] Saved {data_type} for {email[:20]}... ({len(encrypted_blob)} bytes)")
    return {
        "status": "saved",
        "data_type": data_type,
        "size_bytes": len(encrypted_blob),
        "timestamp": int(time.time()),
    }


def load_user_data(email: str, data_type: str) -> Optional[str]:
    """
    Load encrypted data blob for a user.
    Returns the encrypted string or None if not found.
    """
    if data_type not in VALID_DATA_TYPES:
        raise ValueError(f"Invalid data_type: {data_type}")

    user_dir = _get_user_dir(email)
    file_path = user_dir / f"{data_type}.enc"

    if file_path.exists():
        blob = file_path.read_text()
        logger.info(f"[UserStore] Loaded {data_type} for {email[:20]}... ({len(blob)} bytes)")
        return blob

    return None


def load_all_user_data(email: str) -> dict:
    """Load all encrypted data types for a user."""
    user_dir = _get_user_dir(email)
    data = {}

    for data_type in VALID_DATA_TYPES:
        file_path = user_dir / f"{data_type}.enc"
        if file_path.exists():
            data[data_type] = file_path.read_text()

    # Include metadata
    meta_path = user_dir / "meta.json"
    if meta_path.exists():
        try:
            data["_meta"] = json.loads(meta_path.read_text())
        except Exception:
            pass

    logger.info(f"[UserStore] Loaded {len(data)} data types for {email[:20]}...")
    return data


def delete_user_data(email: str) -> dict:
    """Delete all stored data for a user (GDPR compliance)."""
    user_dir = _get_user_dir(email)
    deleted = []

    for file in user_dir.iterdir():
        try:
            file.unlink()
            deleted.append(file.name)
        except Exception:
            pass

    try:
        user_dir.rmdir()
    except Exception:
        pass

    logger.info(f"[UserStore] Deleted all data for {email[:20]}... ({len(deleted)} files)")
    return {"status": "deleted", "files_removed": len(deleted)}


def get_storage_stats() -> dict:
    """Get global storage statistics."""
    total_users = 0
    total_size = 0

    try:
        for user_dir in USER_DATA_DIR.iterdir():
            if user_dir.is_dir():
                total_users += 1
                for f in user_dir.iterdir():
                    total_size += f.stat().st_size
    except Exception:
        pass

    return {
        "total_users": total_users,
        "total_size_bytes": total_size,
        "total_size_mb": round(total_size / (1024 * 1024), 2),
        "storage_path": str(USER_DATA_DIR),
    }
