"""Telegram client service for managing connections and operations"""
from telethon import TelegramClient
from telethon.sessions import StringSession
from telethon.errors import SessionPasswordNeededError, PhoneCodeInvalidError
from typing import Tuple, Optional
import secrets

from backend.config import settings
from backend.storage import storage

class TelegramService:
    """Service for managing Telegram client operations"""
    
    @staticmethod
    async def send_verification_code(phone: str) -> str:
        """Send verification code to phone number"""
        client = TelegramClient(StringSession(), settings.TELEGRAM_API_ID, settings.TELEGRAM_API_HASH)
        await client.connect()
        
        result = await client.send_code_request(phone)
        
        # Store client temporarily
        storage.store_client(phone, client)
        
        return result.phone_code_hash
    
    @staticmethod
    async def sign_in_with_code(phone: str, code: str, phone_code_hash: str) -> Tuple[Optional[str], bool]:
        """
        Sign in with verification code
        Returns: (session_token, needs_password)
        """
        client = storage.get_client(phone)
        if not client:
            raise ValueError("Session expired. Please request code again.")
        
        try:
            await client.sign_in(phone, code, phone_code_hash=phone_code_hash)
            
            session_string = client.session.save()
            
            # Generate session token
            session_token = secrets.token_urlsafe(32)
            storage.store_session(session_token, phone, client, session_string)
            
            return session_token, False
            
        except SessionPasswordNeededError:
            return None, True
        except PhoneCodeInvalidError:
            raise ValueError("Invalid verification code")
    
    @staticmethod
    async def sign_in_with_password(session_token: str, password: str):
        """Sign in with 2FA password"""
        session = storage.get_session(session_token)
        if not session:
            raise ValueError("Session not found")
        
        client = session["client"]
        await client.sign_in(password=password)
    
    @staticmethod
    async def get_account_stats(session_token: str) -> dict:
        """Get account statistics"""
        session = storage.get_session(session_token)
        if not session:
            raise ValueError("Session not found")
        
        client = session["client"]
        
        # Get dialogs (chats)
        dialogs = await client.get_dialogs(limit=100)
        
        # Count unread messages
        unread_count = sum(dialog.unread_count for dialog in dialogs)
        
        # Count messages from recent activities
        activities = storage.get_activities(session_token)
        recent_messages = len([a for a in activities if a["type"] == "message"])
        
        return {
            "totalMessages": len(activities),
            "totalChats": len(dialogs),
            "unreadMessages": unread_count,
            "messagesChange": recent_messages,
            "activeNow": True
        }

telegram_service = TelegramService()
