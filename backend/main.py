"""Main FastAPI application entry point"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from routes import register_routes

# Initialize FastAPI app
app = FastAPI(
    title="Telegram Activity Monitor API",
    description="Monitor your Telegram account activity in real-time",
    version="2.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routes
register_routes(app)

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "ok",
        "message": "Telegram Activity Monitor API",
        "version": "2.0.0"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint for Railway"""
    from storage import storage
    return {
        "status": "healthy",
        "api_configured": bool(settings.TELEGRAM_API_ID and settings.TELEGRAM_API_HASH),
        "active_sessions": len(storage.active_sessions)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host=settings.HOST,
        port=settings.PORT
    )
