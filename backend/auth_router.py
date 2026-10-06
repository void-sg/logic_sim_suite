import os
import time
import json
import base64
import hmac
import hashlib
from fastapi import APIRouter, HTTPException, Depends, Header
from auth_schemas import (
    RegisterRequest,
    VerifyOtpRequest,
    ResendOtpRequest,
    LoginRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    ChangePasswordRequest,
    TokenResponse,
    UserResponse,
    MessageResponse,
)
import database
import otp_service

# Load environment variables if dotenv is available
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

JWT_SECRET = os.environ.get("JWT_SECRET", "logic_sim_suite_super_secret_jwt_key_2026")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_SECONDS = 60 * 60 * 24 * 7  # 7 days

router = APIRouter(prefix="/auth", tags=["auth"])

# --- Cryptographic Helpers ---
def hash_password(password: str) -> str:
    """Hash password using SHA256 with a unique random salt."""
    salt = os.urandom(16).hex()
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
    return f"{salt}${key.hex()}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify plain password against hashed password."""
    try:
        salt, key_hex = hashed_password.split('$')
        computed_key = hashlib.pbkdf2_hmac('sha256', plain_password.encode('utf-8'), salt.encode('utf-8'), 100000)
        return hmac.compare_digest(computed_key.hex(), key_hex)
    except Exception:
        return False

def create_jwt_token(payload: dict) -> str:
    """Create a standard JWT token (HS256) without hard dependency on external binary packages."""
    header = {"alg": "HS256", "typ": "JWT"}
    payload_copy = payload.copy()
    payload_copy["exp"] = int(time.time()) + JWT_EXPIRATION_SECONDS
    
    header_b64 = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip("=")
    payload_b64 = base64.urlsafe_b64encode(json.dumps(payload_copy).encode()).decode().rstrip("=")
    
    signature = hmac.new(
        JWT_SECRET.encode(),
        f"{header_b64}.{payload_b64}".encode(),
        hashlib.sha256
    ).digest()
    sig_b64 = base64.urlsafe_b64encode(signature).decode().rstrip("=")
    
    return f"{header_b64}.{payload_b64}.{sig_b64}"

def decode_jwt_token(token: str) -> dict:
    """Validate and decode JWT token."""
    try:
        parts = token.split(".")
        if len(parts) != 3:
            raise ValueError("Invalid token format")
        
        header_b64, payload_b64, sig_b64 = parts
        
        # Verify signature
        expected_sig = hmac.new(
            JWT_SECRET.encode(),
            f"{header_b64}.{payload_b64}".encode(),
            hashlib.sha256
        ).digest()
        expected_sig_b64 = base64.urlsafe_b64encode(expected_sig).decode().rstrip("=")
        
        if not hmac.compare_digest(sig_b64, expected_sig_b64):
            raise ValueError("Signature mismatch")
        
        # Decode payload
        padding = "=" * (4 - len(payload_b64) % 4)
        payload_json = base64.urlsafe_b64decode(payload_b64 + padding).decode()
        payload = json.loads(payload_json)
        
        if payload.get("exp", 0) < time.time():
            raise ValueError("Token expired")
            
        return payload
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")

def get_current_user(authorization: str = Header(None)) -> dict:
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    parts = authorization.split(" ")
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="Invalid authorization header format. Expected 'Bearer <token>'")
    
    token = parts[1]
    payload = decode_jwt_token(token)
    user = database.get_user_by_email(payload["email"])
    if not user:
        raise HTTPException(status_code=401, detail="User account not found")
    return user


# --- Routes ---

@router.post("/register", response_model=MessageResponse)
def register(req: RegisterRequest):
    email = req.email.strip().lower()
    existing_email = database.get_user_by_email(email)
    
    if existing_email:
        if existing_email["is_verified"]:
            raise HTTPException(status_code=400, detail="An account with this email already exists. Please log in.")
        else:
            # User previously attempted registration but didn't verify OTP - update password and resend OTP
            password_hash = hash_password(req.password)
            database.update_password(email, password_hash)
    else:
        existing_username = database.get_user_by_username(req.username)
        if existing_username:
            raise HTTPException(status_code=400, detail="Username is already taken. Please choose another.")
        
        password_hash = hash_password(req.password)
        database.create_user(req.username, email, password_hash)
    
    # Generate and send OTP
    otp = otp_service.generate_otp()
    expires_at = otp_service.get_expiry_iso(minutes=5)
    database.save_otp(email, otp, "register", expires_at)
    
    email_result = otp_service.send_otp_email(email, otp, "register")
    
    return MessageResponse(
        message="Registration initiated. A 6-digit verification code has been sent to your email.",
        details={"email": email, "simulated": email_result.get("simulated", False)}
    )

@router.post("/verify-otp", response_model=TokenResponse)
def verify_otp(req: VerifyOtpRequest):
    email = req.email.strip().lower()
    user = database.get_user_by_email(email)
    
    if not user:
        raise HTTPException(status_code=404, detail="No registered account found for this email.")
    
    is_valid = database.validate_and_consume_otp(email, req.otp, "register")
    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP code. Please try again or request a new code.")
    
    # Activate user account
    database.verify_user(email)
    
    # Issue JWT token
    token = create_jwt_token({"sub": str(user["id"]), "email": user["email"], "username": user["username"]})
    
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        username=user["username"],
        email=user["email"]
    )

@router.post("/resend-otp", response_model=MessageResponse)
def resend_otp(req: ResendOtpRequest):
    email = req.email.strip().lower()
    user = database.get_user_by_email(email)
    if not user:
        raise HTTPException(status_code=404, detail="No account found for this email.")
    
    otp = otp_service.generate_otp()
    expires_at = otp_service.get_expiry_iso(minutes=5)
    database.save_otp(email, otp, req.purpose, expires_at)
    
    email_result = otp_service.send_otp_email(email, otp, req.purpose)
    
    return MessageResponse(
        message="A new 6-digit OTP code has been sent to your email.",
        details={"email": email, "simulated": email_result.get("simulated", False)}
    )

@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest):
    email = req.email.strip().lower()
    user = database.get_user_by_email(email)
    
    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    
    if not user["is_verified"]:
        # Send OTP automatically so they can complete verification
        otp = otp_service.generate_otp()
        expires_at = otp_service.get_expiry_iso(minutes=5)
        database.save_otp(email, otp, "register", expires_at)
        otp_service.send_otp_email(email, otp, "register")
        raise HTTPException(
            status_code=403,
            detail="Account not verified. A new verification OTP code has been sent to your email. Please verify to proceed."
        )
    
    token = create_jwt_token({"sub": str(user["id"]), "email": user["email"], "username": user["username"]})
    
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        username=user["username"],
        email=user["email"]
    )

@router.get("/me", response_model=UserResponse)
def get_me(user: dict = Depends(get_current_user)):
    return UserResponse(
        id=user["id"],
        username=user["username"],
        email=user["email"],
        is_verified=bool(user["is_verified"])
    )

@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(req: ForgotPasswordRequest):
    email = req.email.strip().lower()
    user = database.get_user_by_email(email)
    
    if not user:
        # Don't leak existence of accounts, but inform user
        return MessageResponse(message="If an account with this email exists, a password reset code has been sent.")
    
    otp = otp_service.generate_otp()
    expires_at = otp_service.get_expiry_iso(minutes=5)
    database.save_otp(email, otp, "password_reset", expires_at)
    email_result = otp_service.send_otp_email(email, otp, "password_reset")
    
    return MessageResponse(
        message="A 6-digit password reset code has been sent to your email.",
        details={"email": email, "simulated": email_result.get("simulated", False)}
    )

@router.post("/reset-password", response_model=MessageResponse)
def reset_password(req: ResetPasswordRequest):
    email = req.email.strip().lower()
    user = database.get_user_by_email(email)
    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")
    
    is_valid = database.validate_and_consume_otp(email, req.otp, "password_reset")
    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP code for password reset.")
    
    new_hash = hash_password(req.new_password)
    database.update_password(email, new_hash)
    
    return MessageResponse(message="Password has been successfully updated. You can now log in with your new password.")

@router.post("/change-password", response_model=MessageResponse)
def change_password(req: ChangePasswordRequest, user: dict = Depends(get_current_user)):
    if not verify_password(req.old_password, user["password_hash"]):
        raise HTTPException(status_code=400, detail="The current password you entered is incorrect.")
    
    new_hash = hash_password(req.new_password)
    database.update_password(user["email"], new_hash)
    
    return MessageResponse(message="Your password has been changed successfully.")
