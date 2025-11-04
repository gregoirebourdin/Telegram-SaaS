"""Statistics and activity routes"""
from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timedelta

from services.telegram_service import telegram_service
from storage import storage
from routes.dependencies import get_session_token

router = APIRouter(prefix="/api", tags=["stats"])

@router.get("/stats")
async def get_stats(session_token: str = Depends(get_session_token)):
    """Get account statistics"""
    try:
        stats = await telegram_service.get_account_stats(session_token)
        return stats
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/activities")
async def get_activities(session_token: str = Depends(get_session_token)):
    """Get recent activities"""
    try:
        activities = storage.get_activities(session_token)
        return activities
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/activity-chart")
async def get_activity_chart(session_token: str = Depends(get_session_token)):
    """Get activity chart data for last 12 hours"""
    try:
        # Generate chart data for last 12 hours
        now = datetime.now()
        chart_data = []
        activities = storage.get_activities(session_token)
        
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

@router.get("/dashboard")
async def get_dashboard_data(session_token: str = Depends(get_session_token)):
    """Get dashboard data with user info and recent activity"""
    try:
        session = storage.get_session(session_token)
        if not session:
            raise HTTPException(status_code=401, detail="Session not found")
        
        client = session["client"]
        
        # Get current user info
        me = await client.get_me()
        user_info = {
            "id": str(me.id),
            "firstName": me.first_name,
            "lastName": me.last_name,
            "username": me.username,
            "phone": me.phone
        }
        
        # Get recent dialogs (chats)
        dialogs = await client.get_dialogs(limit=20)
        
        activity = []
        for dialog in dialogs:
            # Get recent messages from this chat
            messages = await client.get_messages(dialog.entity, limit=5)
            
            # Determine chat type
            chat_type = "user"
            if hasattr(dialog.entity, 'broadcast'):
                chat_type = "channel" if dialog.entity.broadcast else "group"
            elif hasattr(dialog.entity, 'megagroup'):
                chat_type = "group"
            
            # Get chat name
            chat_name = dialog.name or "Unknown"
            
            # Format messages
            formatted_messages = []
            for msg in messages:
                if msg.text:  # Only include text messages
                    formatted_messages.append({
                        "id": msg.id,
                        "text": msg.text,
                        "date": int(msg.date.timestamp()),
                        "out": msg.out,
                        "fromId": str(msg.from_id) if msg.from_id else None
                    })
            
            if formatted_messages:  # Only include chats with messages
                activity.append({
                    "chatId": str(dialog.id),
                    "chatName": chat_name,
                    "chatType": chat_type,
                    "unreadCount": dialog.unread_count,
                    "messages": formatted_messages
                })
        
        return {
            "user": user_info,
            "activity": activity
        }
        
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        print(f"[v0] Dashboard error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
