"""Event handlers initialization"""
from events.message_handler import MessageHandler
from events.group_handler import GroupHandler
from telethon import TelegramClient
import asyncio

async def register_all_handlers(client: TelegramClient, session_token: str):
    """Register all event handlers for a client"""
    MessageHandler.register(client, session_token)
    GroupHandler.register(client, session_token)
    print(f"[v0] Event handlers registered for session {session_token[:8]}...")
