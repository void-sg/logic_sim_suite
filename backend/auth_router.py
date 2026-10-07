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
    UpdateProfileRequest,
    TokenResponse,
    UserResponse,
    MessageResponse,
)
import database
import otp_service

from config import JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRATION_SECONDS
from rate_limiter import check_auth_rate_limit

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

@router.post("/register", response_model=MessageResponse, dependencies=[Depends(check_auth_rate_limit)])
def register(req: RegisterRequest):
    email = req.email.strip().lower()
    roll_number = req.roll_number.strip().upper() if req.roll_number and str(req.roll_number).strip() else None
    branch = req.branch.strip().upper() if req.branch else "CSE"
    semester = req.semester if req.semester else 3
    role = req.role.strip().lower() if req.role else "student"
    
    # Check roll number uniqueness if provided
    if roll_number:
        existing_roll_user = database.get_user_by_roll_number(roll_number)
        if existing_roll_user and existing_roll_user["email"].lower() != email:
            raise HTTPException(status_code=400, detail=f"Roll number '{roll_number}' is already registered to another student.")

    existing_email = database.get_user_by_email(email)
    
    if existing_email:
        # Update password, academic profile, and ensure user is verified
        password_hash = hash_password(req.password)
        database.update_password(email, password_hash)
        database.update_user_profile(
            existing_email["id"],
            roll_number=roll_number,
            branch=branch,
            semester=semester,
            role=role
        )
        database.verify_user(email)
    else:
        existing_username = database.get_user_by_username(req.username)
        if existing_username:
            raise HTTPException(status_code=400, detail="Username is already taken. Please choose another.")
        
        password_hash = hash_password(req.password)
        database.create_user(
            username=req.username,
            email=email,
            password_hash=password_hash,
            roll_number=roll_number,
            branch=branch,
            semester=semester,
            role=role
        )
        database.verify_user(email)
    
    # Generate OTP for reference and testing
    otp = otp_service.generate_otp()
    expires_at = otp_service.get_expiry_iso(minutes=15)
    database.save_otp(email, otp, "register", expires_at)
    
    # Attempt email dispatch non-blocking
    email_result = {"sent": False, "simulated": True, "otp": otp}
    try:
        email_result = otp_service.send_otp_email(email, otp, "register")
    except Exception as e:
        print(f"Non-fatal error in send_otp_email: {e}")
    
    return MessageResponse(
        message="Registration successful! Your account is active and you can enter the laboratory.",
        details={
            "email": email,
            "roll_number": roll_number,
            "otp": otp,
            "simulated": email_result.get("simulated", False),
            "auto_verified": True
        }
    )

@router.post("/verify-otp", response_model=TokenResponse)
def verify_otp(req: VerifyOtpRequest):
    identifier = req.email.strip()
    user = database.get_user_by_identifier(identifier)
    
    if not user:
        raise HTTPException(status_code=404, detail="No registered account found for this email or roll number.")
    
    email = user["email"]
    is_valid = database.validate_and_consume_otp(email, req.otp, "register")
    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP code. Please try 123456 or request a new code.")
    
    # Activate user account
    database.verify_user(email)
    
    token = create_jwt_token({
        "sub": str(user["id"]),
        "email": user["email"],
        "username": user["username"],
        "roll_number": user.get("roll_number"),
        "role": user.get("role", "student")
    })
    
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        username=user["username"],
        email=user["email"],
        roll_number=user.get("roll_number"),
        branch=user.get("branch", "CSE"),
        semester=user.get("semester", 3),
        role=user.get("role", "student")
    )

@router.post("/resend-otp", response_model=MessageResponse, dependencies=[Depends(check_auth_rate_limit)])
def resend_otp(req: ResendOtpRequest):
    identifier = req.email.strip()
    user = database.get_user_by_identifier(identifier)
    if not user:
        raise HTTPException(status_code=404, detail="No account found for this email or roll number.")
    
    email = user["email"]
    otp = otp_service.generate_otp()
    expires_at = otp_service.get_expiry_iso(minutes=15)
    database.save_otp(email, otp, req.purpose, expires_at)
    
    email_result = {"sent": False, "simulated": True, "otp": otp}
    try:
        email_result = otp_service.send_otp_email(email, otp, req.purpose)
    except Exception as e:
        print(f"Non-fatal error in send_otp_email: {e}")
    
    return MessageResponse(
        message="A 6-digit OTP code has been generated.",
        details={"email": email, "otp": otp, "simulated": email_result.get("simulated", False)}
    )

@router.post("/login", response_model=TokenResponse, dependencies=[Depends(check_auth_rate_limit)])
def login(req: LoginRequest):
    identifier = req.email.strip()
    # Support sign in via institutional email, roll number (e.g. 23CS012), or username
    user = database.get_user_by_identifier(identifier)
    
    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email/roll number or password.")
    
    # Auto-verify account upon successful password verification (no OTP blocking)
    if not user.get("is_verified"):
        database.verify_user(user["email"])
        user["is_verified"] = 1
    
    token = create_jwt_token({
        "sub": str(user["id"]),
        "email": user["email"],
        "username": user["username"],
        "roll_number": user.get("roll_number"),
        "role": user.get("role", "student")
    })
    
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        username=user["username"],
        email=user["email"],
        roll_number=user.get("roll_number"),
        branch=user.get("branch", "CSE"),
        semester=user.get("semester", 3),
        role=user.get("role", "student")
    )

@router.post("/guest", response_model=TokenResponse)
def guest_login():
    guest_email = "student.guest@logicsim.edu"
    guest_user = database.get_user_by_email(guest_email)
    if not guest_user:
        guest_hash = hash_password("guest123")
        database.create_user(
            username="Guest Student",
            email=guest_email,
            password_hash=guest_hash,
            roll_number="GUEST001",
            branch="CSE",
            semester=3,
            role="student"
        )
        database.verify_user(guest_email)
        guest_user = database.get_user_by_email(guest_email)
    elif not guest_user.get("roll_number"):
        database.update_user_profile(guest_user["id"], roll_number="GUEST001", branch="CSE", semester=3, role="student")
        guest_user = database.get_user_by_email(guest_email)
    
    token = create_jwt_token({
        "sub": str(guest_user["id"]),
        "email": guest_user["email"],
        "username": guest_user["username"],
        "roll_number": guest_user.get("roll_number", "GUEST001"),
        "role": guest_user.get("role", "student")
    })
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        username=guest_user["username"],
        email=guest_user["email"],
        roll_number=guest_user.get("roll_number", "GUEST001"),
        branch=guest_user.get("branch", "CSE"),
        semester=guest_user.get("semester", 3),
        role=guest_user.get("role", "student")
    )

@router.get("/me", response_model=UserResponse)
def get_me(user: dict = Depends(get_current_user)):
    return UserResponse(
        id=user["id"],
        roll_number=user.get("roll_number"),
        username=user["username"],
        email=user["email"],
        branch=user.get("branch", "CSE"),
        semester=user.get("semester", 3),
        role=user.get("role", "student"),
        is_verified=bool(user["is_verified"])
    )

@router.put("/profile", response_model=UserResponse)
def update_profile(req: UpdateProfileRequest, user: dict = Depends(get_current_user)):
    if req.roll_number is not None and str(req.roll_number).strip():
        clean_roll = req.roll_number.strip().upper()
        existing_roll_user = database.get_user_by_roll_number(clean_roll)
        if existing_roll_user and existing_roll_user["id"] != user["id"]:
            raise HTTPException(status_code=400, detail=f"Roll number '{clean_roll}' is already assigned to another student.")
        database.update_user_profile(user["id"], roll_number=clean_roll)

    if req.branch is not None or req.semester is not None:
        database.update_user_profile(
            user["id"],
            branch=req.branch,
            semester=req.semester
        )
    
    updated = database.get_user_by_email(user["email"])
    return UserResponse(
        id=updated["id"],
        roll_number=updated.get("roll_number"),
        username=updated["username"],
        email=updated["email"],
        branch=updated.get("branch", "CSE"),
        semester=updated.get("semester", 3),
        role=updated.get("role", "student"),
        is_verified=bool(updated["is_verified"])
    )

@router.get("/roster")
def get_roster(role: str = None, branch: str = None, semester: int = None, user: dict = Depends(get_current_user)):
    """Academic roster view for faculty and testing."""
    return database.list_users(role=role, branch=branch, semester=semester)

@router.post("/forgot-password", response_model=MessageResponse, dependencies=[Depends(check_auth_rate_limit)])
def forgot_password(req: ForgotPasswordRequest):
    identifier = req.email.strip()
    user = database.get_user_by_identifier(identifier)
    
    if not user:
        return MessageResponse(message="If an account with this identifier exists, a password reset code has been sent.")
    
    email = user["email"]
    otp = otp_service.generate_otp()
    expires_at = otp_service.get_expiry_iso(minutes=15)
    database.save_otp(email, otp, "password_reset", expires_at)
    
    email_result = {"sent": False, "simulated": True, "otp": otp}
    try:
        email_result = otp_service.send_otp_email(email, otp, "password_reset")
    except Exception as e:
        print(f"Non-fatal error in send_otp_email: {e}")
    
    return MessageResponse(
        message="A 6-digit password reset code has been generated. Use code or check email.",
        details={"email": email, "otp": otp, "simulated": email_result.get("simulated", False)}
    )

@router.post("/reset-password", response_model=MessageResponse)
def reset_password(req: ResetPasswordRequest):
    identifier = req.email.strip()
    user = database.get_user_by_identifier(identifier)
    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")
    
    email = user["email"]
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
