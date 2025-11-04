"""Event handler for new messages"""
from telethon import events
from telethon import TelegramClient
from datetime import datetime

from backend.storage import storage

class MessageHandler:
    """Handles new message events from Telegram"""
    
    @staticmethod
    def register(client: TelegramClient, session_token: str):
        """Register message event handler"""
        
        @client.on(events.NewMessage)
        async def handle_new_message(event):
            """Handle incoming messages"""
            try:
                sender = await event.get_sender()
                chat = await event.get_chat()
                
                # Determine sender name
                sender_name = "Unknown"
                if hasattr(sender, 'username') and sender.username:
                    sender_name = sender.username
                elif hasattr(sender, 'first_name') and sender.first_name:
                    sender_name = sender.first_name
                
                # Determine chat name
                chat_name = "Unknown"
                if hasattr(chat, 'title') and chat.title:
                    chat_name = chat.title
                elif hasattr(chat, 'username') and chat.username:
                    chat_name = chat.username
                
                # Create activity
                activity = {
                    "id": f"msg_{event.id}_{datetime.now().timestamp()}",
                    "type": "message",
                    "chat": chat_name,
                    "sender": sender_name,
                    "content": event.text[:100] if event.text else "📎 Media message",
                    "timestamp": datetime.now().isoformat()
                }
                
                storage.add_activity(session_token, activity)
                print(f"[v0] New message from {sender_name} in {chat_name}")
                
            except Exception as e:
                print(f"[v0] Error handling message: {e}")
