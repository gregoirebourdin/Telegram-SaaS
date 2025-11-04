"""Statistics and activity routes"""
from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timedelta

from backend.services.telegram_service import telegram_service
from backend.storage import storage
from backend.routes.dependencies import get_session_token

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
