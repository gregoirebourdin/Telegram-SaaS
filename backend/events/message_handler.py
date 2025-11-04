"""Event handler for new messages"""
from telethon import events
from telethon import TelegramClient
from datetime import datetime

from storage import storage

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
                
                # Determine chat name - for private chats, use sender's name
                chat_name = "Unknown"
                
                # Try to get chat title first (for groups/channels)
                if hasattr(chat, 'title') and chat.title:
                    chat_name = chat.title
                # For private chats, use the other person's name
                elif hasattr(sender, 'first_name'):
                    chat_name = sender.first_name
                    if hasattr(sender, 'last_name') and sender.last_name:
                        chat_name += f" {sender.last_name}"
                # Fallback to username
                elif hasattr(sender, 'username') and sender.username:
                    chat_name = f"@{sender.username}"
                elif hasattr(chat, 'username') and chat.username:
                    chat_name = f"@{chat.username}"
                
                # Determine sender name
                sender_name = "Unknown"
                if hasattr(sender, 'first_name') and sender.first_name:
                    sender_name = sender.first_name
                    if hasattr(sender, 'last_name') and sender.last_name:
                        sender_name += f" {sender.last_name}"
                elif hasattr(sender, 'username') and sender.username:
                    sender_name = f"@{sender.username}"
                
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
