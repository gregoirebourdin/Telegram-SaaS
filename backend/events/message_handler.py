"""Event handler for new messages"""
from telethon import events
from telethon import TelegramClient
from datetime import datetime

from storage import storage
from services.chatbase_service import chatbase_service

class MessageHandler:
    """Handles new message events from Telegram"""
    
    @staticmethod
    def register(client: TelegramClient, session_token: str):
        """Register message event handler"""
        
        @client.on(events.NewMessage(incoming=True))
        async def handle_new_message(event):
            """Handle incoming messages"""
            try:
                sender = await event.get_sender()
                chat = await event.get_chat()
                
                # Get chat ID for conversation tracking
                chat_id = str(event.chat_id)
                
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
                
                message_text = event.text if event.text else "📎 Media message"
                
                # Create activity
                activity = {
                    "id": f"msg_{event.id}_{datetime.now().timestamp()}",
                    "type": "message",
                    "chat": chat_name,
                    "sender": sender_name,
                    "content": message_text[:100],
                    "timestamp": datetime.now().isoformat()
                }
                
                storage.add_activity(session_token, activity)
                print(f"[v0] New message from {sender_name} in {chat_name}: {message_text[:50]}")
                
                if event.text:  # Only process text messages
                    # Add user message to history
                    storage.add_message_to_history(session_token, chat_id, "user", event.text)
                    
                    # Get conversation history
                    history = storage.get_conversation_history(session_token, chat_id)
                    
                    # Call Chatbase API
                    print(f"[v0] Calling Chatbase with {len(history)} messages in history...")
                    response_text = await chatbase_service.send_message(
                        messages=history,
                        conversation_id=chat_id
                    )
                    
                    if response_text:
                        print(f"[v0] Chatbase response: {response_text[:100]}")
                        
                        # Add assistant response to history
                        storage.add_message_to_history(session_token, chat_id, "assistant", response_text)
                        
                        # Send response back to Telegram
                        await event.respond(response_text)
                        print(f"[v0] Sent response to {chat_name}")
                    else:
                        print("[v0] No response from Chatbase")
                
            except Exception as e:
                print(f"[v0] Error handling message: {e}")
                import traceback
                traceback.print_exc()
