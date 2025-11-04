"""Routes initialization"""
from routes.auth import router as auth_router
from routes.stats import router as stats_router

def register_routes(app):
    """Register all routes to the FastAPI app"""
    app.include_router(auth_router)
    app.include_router(stats_router)
