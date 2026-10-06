"""
backend/auth_schemas.py — Pydantic models for authentication, OTP verification, and password management.
"""
from pydantic import BaseModel, Field

EMAIL_PATTERN = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"

class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: str = Field(..., pattern=EMAIL_PATTERN)
    password: str = Field(..., min_length=6)

class VerifyOtpRequest(BaseModel):
    email: str = Field(..., pattern=EMAIL_PATTERN)
    otp: str = Field(..., min_length=6, max_length=6)

class ResendOtpRequest(BaseModel):
    email: str = Field(..., pattern=EMAIL_PATTERN)
    purpose: str = "register"

class LoginRequest(BaseModel):
    email: str = Field(..., pattern=EMAIL_PATTERN)
    password: str

class ForgotPasswordRequest(BaseModel):
    email: str = Field(..., pattern=EMAIL_PATTERN)

class ResetPasswordRequest(BaseModel):
    email: str = Field(..., pattern=EMAIL_PATTERN)
    otp: str = Field(..., min_length=6, max_length=6)
    new_password: str = Field(..., min_length=6)

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str = Field(..., min_length=6)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str
    email: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    is_verified: bool

class MessageResponse(BaseModel):
    message: str
    details: dict | None = None
