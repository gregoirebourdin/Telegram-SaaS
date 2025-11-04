"""Chatbase API integration service"""
import aiohttp
from typing import List, Dict, Optional
from config import settings

class ChatbaseService:
    """Service for interacting with Chatbase API"""
    
    BASE_URL = "https://www.chatbase.co/api/v1"
    
    @staticmethod
    async def send_message(
        messages: List[Dict[str, str]],
        conversation_id: Optional[str] = None
    ) -> Optional[str]:
        """
        Send message to Chatbase and get response
        
        Args:
            messages: List of message objects with 'role' and 'content'
            conversation_id: Optional conversation ID to track conversation
            
        Returns:
            Response text from Chatbase or None if error
        """
        if not settings.CHATBASE_API_KEY or not settings.CHATBASE_CHATBOT_ID:
            print("[v0] Chatbase not configured. Set CHATBASE_API_KEY and CHATBASE_CHATBOT_ID")
            return None
        
        try:
            payload = {
                "messages": messages,
                "chatbotId": settings.CHATBASE_CHATBOT_ID,
                "stream": False,
                "temperature": 0.7
            }
            
            if conversation_id:
                payload["conversationId"] = conversation_id
            
            headers = {
                "Authorization": f"Bearer {settings.CHATBASE_API_KEY}",
                "Content-Type": "application/json"
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{ChatbaseService.BASE_URL}/chat",
                    json=payload,
                    headers=headers,
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        return data.get("text")
                    else:
                        error_text = await response.text()
                        print(f"[v0] Chatbase API error ({response.status}): {error_text}")
                        return None
                        
        except Exception as e:
            print(f"[v0] Error calling Chatbase API: {e}")
            return None

chatbase_service = ChatbaseService()
