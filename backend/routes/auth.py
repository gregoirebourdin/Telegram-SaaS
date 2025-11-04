"""Authentication routes"""
from fastapi import APIRouter, HTTPException, Depends
from typing import Optional

from models import PhoneRequest, SignInRequest, PasswordRequest
from services.telegram_service import telegram_service
from events import register_all_handlers
from storage import storage
from routes.dependencies import get_session_token
import asyncio

router = APIRouter(prefix="/api", tags=["auth"])

@router.post("/send-code")
async def send_code(request: PhoneRequest):
    """Send verification code to phone number"""
    try:
        phone_code_hash = await telegram_service.send_verification_code(request.phone)
        return {
            "phoneCodeHash": phone_code_hash,
            "success": True
        }
    except Exception as e:
        print(f"[v0] Error sending code: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/sign-in")
async def sign_in(request: SignInRequest):
    """Sign in with verification code"""
    try:
        session_token, needs_password = await telegram_service.sign_in_with_code(
            request.phone,
            request.code,
            request.phoneCodeHash
        )
        
        if needs_password:
            return {
                "needPassword": True,
                "success": False
            }
        
        # Start listening for events
        session = storage.get_session(session_token)
        if session:
            asyncio.create_task(register_all_handlers(session["client"], session_token))
        
        return {
            "sessionToken": session_token,
            "success": True
        }
            
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"[v0] Error signing in: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/sign-in-password")
async def sign_in_password(
    request: PasswordRequest,
    session_token: str = Depends(get_session_token)
):
    """Sign in with 2FA password"""
    try:
        await telegram_service.sign_in_with_password(session_token, request.password)
        
        # Start listening for events
        session = storage.get_session(session_token)
        if session:
            asyncio.create_task(register_all_handlers(session["client"], session_token))
        
        return {
            "sessionToken": session_token,
            "success": True
        }
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/logout")
async def logout(session_token: str = Depends(get_session_token)):
    """Logout and cleanup session"""
    try:
        await storage.cleanup_session(session_token)
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
