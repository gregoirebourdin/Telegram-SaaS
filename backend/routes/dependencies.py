"""Shared dependencies for routes"""
from fastapi import HTTPException, Header
from typing import Optional

def get_session_token(authorization: Optional[str] = Header(None)) -> str:
    """Extract and validate session token from Authorization header"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    return authorization.replace("Bearer ", "")
