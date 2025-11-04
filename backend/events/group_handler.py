"""Event handler for group member changes"""
from telethon import events
from telethon import TelegramClient
from telethon.tl.types import (
    MessageActionChatAddUser,
    MessageActionChatJoinedByLink,
    MessageActionChatDeleteUser
)
from datetime import datetime

from backend.storage import storage

class GroupHandler:
    """Handles group member join/leave events"""
    
    @staticmethod
    def register(client: TelegramClient, session_token: str):
        """Register group event handlers"""
        
        @client.on(events.ChatAction)
        async def handle_chat_action(event):
            """Handle chat actions (joins, leaves, etc.)"""
            try:
                chat = await event.get_chat()
                chat_name = getattr(chat, 'title', 'Unknown Group')
                
                # Member joined
                if isinstance(event.action, (MessageActionChatAddUser, MessageActionChatJoinedByLink)):
                    # Get user who joined
                    if event.action_message and event.action_message.from_id:
                        user = await client.get_entity(event.action_message.from_id)
                        user_name = getattr(user, 'username', getattr(user, 'first_name', 'Unknown'))
                    else:
                        user_name = "Someone"
                    
                    activity = {
                        "id": f"join_{event.id}_{datetime.now().timestamp()}",
                        "type": "member_joined",
                        "chat": chat_name,
                        "sender": user_name,
                        "content": f"👋 {user_name} joined the group",
                        "timestamp": datetime.now().isoformat()
                    }
                    
                    storage.add_activity(session_token, activity)
                    print(f"[v0] {user_name} joined {chat_name}")
                
                # Member left or was removed
                elif isinstance(event.action, MessageActionChatDeleteUser):
                    # Get user who left
                    if event.action_message and event.action_message.from_id:
                        user = await client.get_entity(event.action_message.from_id)
                        user_name = getattr(user, 'username', getattr(user, 'first_name', 'Unknown'))
                    else:
                        user_name = "Someone"
                    
                    activity = {
                        "id": f"leave_{event.id}_{datetime.now().timestamp()}",
                        "type": "member_left",
                        "chat": chat_name,
                        "sender": user_name,
                        "content": f"👋 {user_name} left the group",
                        "timestamp": datetime.now().isoformat()
                    }
                    
                    storage.add_activity(session_token, activity)
                    print(f"[v0] {user_name} left {chat_name}")
                    
            except Exception as e:
                print(f"[v0] Error handling chat action: {e}")
