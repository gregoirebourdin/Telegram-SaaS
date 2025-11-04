"""Routes initialization"""
from backend.routes.auth import router as auth_router
from backend.routes.stats import router as stats_router

def register_routes(app):
    """Register all routes to the FastAPI app"""
    app.include_router(auth_router)
    app.include_router(stats_router)
