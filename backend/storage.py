"""In-memory storage management (use Redis/Database in production)"""
from typing import Dict, List, Optional
from telethon import TelegramClient

class Storage:
    """Manages in-memory storage for active sessions and activities"""
    
    def __init__(self):
        self.active_clients: Dict[str, TelegramClient] = {}
        self.active_sessions: Dict[str, dict] = {}
        self.activities_store: Dict[str, List[dict]] = {}
        self.string_sessions: Dict[str, str] = {}
    
    def store_client(self, phone: str, client: TelegramClient):
        """Store a temporary client during authentication"""
        self.active_clients[phone] = client
    
    def get_client(self, phone: str) -> Optional[TelegramClient]:
        """Retrieve a temporary client"""
        return self.active_clients.get(phone)
    
    def remove_client(self, phone: str):
        """Remove a temporary client"""
        if phone in self.active_clients:
            del self.active_clients[phone]
    
    def store_session(self, token: str, phone: str, client: TelegramClient, session_string: str):
        """Store an active session"""
        self.active_sessions[token] = {
            "phone": phone,
            "client": client
        }
        self.string_sessions[token] = session_string
        self.activities_store[token] = []
    
    def get_session(self, token: str) -> Optional[dict]:
        """Retrieve an active session"""
        return self.active_sessions.get(token)
    
    def add_activity(self, token: str, activity: dict):
        """Add an activity to the store"""
        if token in self.activities_store:
            self.activities_store[token].insert(0, activity)
            # Keep only last 100 activities
            self.activities_store[token] = self.activities_store[token][:100]
    
    def get_activities(self, token: str) -> List[dict]:
        """Get activities for a session"""
        return self.activities_store.get(token, [])
    
    async def cleanup_session(self, token: str):
        """Cleanup a session and disconnect client"""
        session = self.active_sessions.get(token)
        if session:
            client = session["client"]
            await client.disconnect()
            del self.active_sessions[token]
            if token in self.activities_store:
                del self.activities_store[token]
            if token in self.string_sessions:
                del self.string_sessions[token]

# Global storage instance
storage = Storage()
