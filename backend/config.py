"""Configuration management for the Telegram Activity Monitor API"""
import os
from typing import Optional

class Settings:
    """Application settings loaded from environment variables"""
    
    # Telegram API credentials
    TELEGRAM_API_ID: int
    TELEGRAM_API_HASH: str
    
    # Server configuration
    PORT: int = 8080
    HOST: str = "0.0.0.0"
    
    # CORS configuration
    CORS_ORIGINS: list = ["*"]  # Configure with your frontend URL in production
    
    def __init__(self):
        """Initialize settings from environment variables"""
        api_id = os.getenv("TELEGRAM_API_ID")
        api_hash = os.getenv("TELEGRAM_API_HASH")
        
        if not api_id or not api_hash:
            raise ValueError("TELEGRAM_API_ID and TELEGRAM_API_HASH must be set")
        
        self.TELEGRAM_API_ID = int(api_id)
        self.TELEGRAM_API_HASH = api_hash
        self.PORT = int(os.getenv("PORT", 8080))

# Global settings instance
settings = Settings()
