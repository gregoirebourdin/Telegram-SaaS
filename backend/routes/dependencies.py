"""Shared dependencies for routes"""
from fastapi import HTTPException, Header
from typing import Optional

def get_session_token(
    authorization: Optional[str] = Header(None),
    x_session_token: Optional[str] = Header(None, alias="X-Session-Token")
) -> str:
    """Extract and validate session token from Authorization or X-Session-Token header"""
    if x_session_token:
        return x_session_token
    
    if authorization and authorization.startswith("Bearer "):
        return authorization.replace("Bearer ", "")
    
    raise HTTPException(status_code=401, detail="Unauthorized: No session token provided")
