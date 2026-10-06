"""
backend/auth_schemas.py — Pydantic models for authentication, student academic profiles, OTP verification, and password management.
"""
from pydantic import BaseModel, Field

EMAIL_PATTERN = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"

class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=100, description="Student/Faculty display name")
    email: str = Field(..., pattern=EMAIL_PATTERN, description="Student institutional or personal email")
    password: str = Field(..., min_length=6, description="Account password")
    roll_number: str | None = Field(default=None, max_length=50, description="College Roll No (e.g., 23CS012)")
    branch: str = Field(default="CSE", max_length=50, description="Academic Branch (CSE, ECE, EEE, IT)")
    semester: int = Field(default=3, ge=1, le=8, description="Current academic semester (1..8)")
    role: str = Field(default="student", description="Role: 'student' or 'faculty'")

class VerifyOtpRequest(BaseModel):
    email: str = Field(..., min_length=2, description="Email address or Roll number")
    otp: str = Field(..., min_length=6, max_length=6)

class ResendOtpRequest(BaseModel):
    email: str = Field(..., min_length=2, description="Email address or Roll number")
    purpose: str = "register"

class LoginRequest(BaseModel):
    # Allows sign in via email address, college roll number (e.g. 23CS012), or username
    email: str = Field(..., min_length=2, description="Email address, College Roll Number, or Username")
    password: str

class ForgotPasswordRequest(BaseModel):
    email: str = Field(..., min_length=2, description="Registered email address or Roll number")

class ResetPasswordRequest(BaseModel):
    email: str = Field(..., min_length=2, description="Registered email address or Roll number")
    otp: str = Field(..., min_length=6, max_length=6)
    new_password: str = Field(..., min_length=6)

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str = Field(..., min_length=6)

class UpdateProfileRequest(BaseModel):
    roll_number: str | None = Field(default=None, max_length=50)
    branch: str | None = Field(default=None, max_length=50)
    semester: int | None = Field(default=None, ge=1, le=8)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str
    email: str
    roll_number: str | None = None
    branch: str = "CSE"
    semester: int = 3
    role: str = "student"

class UserResponse(BaseModel):
    id: int
    roll_number: str | None = None
    username: str
    email: str
    branch: str = "CSE"
    semester: int = 3
    role: str = "student"
    is_verified: bool

class MessageResponse(BaseModel):
    message: str
    details: dict | None = None
