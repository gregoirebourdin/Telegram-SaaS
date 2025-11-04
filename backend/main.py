from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from telethon import TelegramClient, events
from telethon.sessions import StringSession
from telethon.errors import SessionPasswordNeededError, PhoneCodeInvalidError
from telethon.tl.functions.messages import GetDialogsRequest
from telethon.tl.types import InputPeerEmpty
import os
import asyncio
from datetime import datetime, timedelta
from typing import Optional, List
import secrets

app = FastAPI(title="Telegram Activity Monitor API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Telegram API credentials from environment variables
API_ID = int(os.getenv("TELEGRAM_API_ID"))
API_HASH = os.getenv("TELEGRAM_API_HASH")

if not API_ID or not API_HASH:
    raise ValueError("TELEGRAM_API_ID and TELEGRAM_API_HASH must be set")

# In-memory storage (use Redis/Database in production)
active_clients = {}
active_sessions = {}
activities_store = {}
string_sessions = {}

class PhoneRequest(BaseModel):
    phone: str

class SignInRequest(BaseModel):
    phone: str
    code: str
    phoneCodeHash: str

class PasswordRequest(BaseModel):
    password: str

def get_session_token(authorization: Optional[str] = Header(None)):
    """Extract and validate session token from Authorization header"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    return authorization.replace("Bearer ", "")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "ok", "message": "Telegram Activity Monitor API"}

@app.get("/health")
async def health_check():
    """Health check endpoint for Railway"""
    return {
        "status": "healthy",
        "api_configured": bool(API_ID and API_HASH),
        "active_sessions": len(active_sessions)
    }

@app.post("/api/send-code")
async def send_code(request: PhoneRequest):
    """Send verification code to phone number"""
    try:
        client = TelegramClient(StringSession(), API_ID, API_HASH)
        await client.connect()
        
        result = await client.send_code_request(request.phone)
        
        # Store client temporarily
        active_clients[request.phone] = client
        
        return {
            "phoneCodeHash": result.phone_code_hash,
            "success": True
        }
    except Exception as e:
        print(f"Error sending code: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/sign-in")
async def sign_in(request: SignInRequest):
    """Sign in with verification code"""
    try:
        client = active_clients.get(request.phone)
        if not client:
            raise HTTPException(status_code=400, detail="Session expired. Please request code again.")
        
        try:
            await client.sign_in(request.phone, request.code, phone_code_hash=request.phoneCodeHash)
            
            session_string = client.session.save()
            
            # Generate session token
            session_token = secrets.token_urlsafe(32)
            active_sessions[session_token] = {
                "phone": request.phone,
                "client": client
            }
            
            string_sessions[session_token] = session_string
            
            # Initialize activities store
            activities_store[session_token] = []
            
            # Start listening for events
            asyncio.create_task(listen_for_events(client, session_token))
            
            return {
                "sessionToken": session_token,
                "success": True
            }
        except SessionPasswordNeededError:
            return {
                "needPassword": True,
                "success": False
            }
        except PhoneCodeInvalidError:
            raise HTTPException(status_code=400, detail="Invalid verification code")
            
    except Exception as e:
        print(f"Error signing in: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/sign-in-password")
async def sign_in_password(request: PasswordRequest, session_token: str = Depends(get_session_token)):
    """Sign in with 2FA password"""
    try:
        session = active_sessions.get(session_token)
        if not session:
            raise HTTPException(status_code=401, detail="Session not found")
        
        client = session["client"]
        await client.sign_in(password=request.password)
        
        # Start listening for events
        asyncio.create_task(listen_for_events(client, session_token))
        
        return {
            "sessionToken": session_token,
            "success": True
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

async def listen_for_events(client: TelegramClient, session_token: str):
    """Listen for new messages and events"""
    @client.on(events.NewMessage)
    async def handle_new_message(event):
        try:
            sender = await event.get_sender()
            chat = await event.get_chat()
            
            activity = {
                "id": f"{event.id}_{datetime.now().timestamp()}",
                "type": "message",
                "chat": getattr(chat, 'title', getattr(chat, 'username', 'Unknown')),
                "sender": getattr(sender, 'username', getattr(sender, 'first_name', 'Unknown')),
                "content": event.text[:100] if event.text else "Media message",
                "timestamp": datetime.now().isoformat()
            }
            
            if session_token in activities_store:
                activities_store[session_token].insert(0, activity)
                # Keep only last 100 activities
                activities_store[session_token] = activities_store[session_token][:100]
        except Exception as e:
            print(f"Error handling message: {e}")

@app.get("/api/stats")
async def get_stats(session_token: str = Depends(get_session_token)):
    """Get account statistics"""
    try:
        session = active_sessions.get(session_token)
        if not session:
            raise HTTPException(status_code=401, detail="Session not found")
        
        client = session["client"]
        
        # Get dialogs (chats)
        dialogs = await client.get_dialogs(limit=100)
        
        # Count unread messages
        unread_count = sum(dialog.unread_count for dialog in dialogs)
        
        # Count messages from recent activities
        activities = activities_store.get(session_token, [])
        recent_messages = len([a for a in activities if a["type"] == "message"])
        
        return {
            "totalMessages": len(activities),
            "totalChats": len(dialogs),
            "unreadMessages": unread_count,
            "messagesChange": recent_messages,
            "activeNow": True
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/activities")
async def get_activities(session_token: str = Depends(get_session_token)):
    """Get recent activities"""
    try:
        session = active_sessions.get(session_token)
        if not session:
            raise HTTPException(status_code=401, detail="Session not found")
        
        activities = activities_store.get(session_token, [])
        return activities
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/activity-chart")
async def get_activity_chart(session_token: str = Depends(get_session_token)):
    """Get activity chart data for last 12 hours"""
    try:
        session = active_sessions.get(session_token)
        if not session:
            raise HTTPException(status_code=401, detail="Session not found")
        
        # Generate chart data for last 12 hours
        now = datetime.now()
        chart_data = []
        activities = activities_store.get(session_token, [])
        
        for i in range(12, 0, -1):
            time = now - timedelta(hours=i)
            hour_activities = [
                a for a in activities 
                if datetime.fromisoformat(a["timestamp"]) > time - timedelta(hours=1)
                and datetime.fromisoformat(a["timestamp"]) <= time
            ]
            
            chart_data.append({
                "time": time.strftime("%H:%M"),
                "messages": len(hour_activities)
            })
        
        return chart_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/logout")
async def logout(session_token: str = Depends(get_session_token)):
    """Logout and cleanup session"""
    try:
        session = active_sessions.get(session_token)
        if session:
            client = session["client"]
            await client.disconnect()
            del active_sessions[session_token]
            if session_token in activities_store:
                del activities_store[session_token]
            if session_token in string_sessions:
                del string_sessions[session_token]
        
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8080)))
