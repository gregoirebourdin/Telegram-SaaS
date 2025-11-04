"""Pydantic models for request/response validation"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class PhoneRequest(BaseModel):
    """Request model for sending verification code"""
    phone: str

class SignInRequest(BaseModel):
    """Request model for signing in with verification code"""
    phone: str
    code: str
    phoneCodeHash: str

class PasswordRequest(BaseModel):
    """Request model for 2FA password authentication"""
    password: str

class Activity(BaseModel):
    """Activity model for tracking Telegram events"""
    id: str
    type: str  # "message", "member_joined", "member_left"
    chat: str
    sender: str
    content: str
    timestamp: str

class StatsResponse(BaseModel):
    """Response model for account statistics"""
    totalMessages: int
    totalChats: int
    unreadMessages: int
    messagesChange: int
    activeNow: bool

class ChartDataPoint(BaseModel):
    """Data point for activity chart"""
    time: str
    messages: int
