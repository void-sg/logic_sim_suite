import sqlite3
import os
from datetime import datetime, timezone

DB_PATH = os.path.join(os.path.dirname(__file__), "users.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    
    # Users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        is_verified INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
    )
    """)
    
    # OTP codes table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS otp_codes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        otp TEXT NOT NULL,
        purpose TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        used INTEGER DEFAULT 0
    )
    """)
    
    conn.commit()
    conn.close()

def create_user(username: str, email: str, password_hash: str):
    conn = get_connection()
    cursor = conn.cursor()
    now_iso = datetime.now(timezone.utc).isoformat()
    try:
        cursor.execute(
            "INSERT INTO users (username, email, password_hash, is_verified, created_at) VALUES (?, ?, ?, ?, ?)",
            (username.strip(), email.strip().lower(), password_hash, 0, now_iso)
        )
        conn.commit()
        user_id = cursor.lastrowid
        return {"id": user_id, "username": username, "email": email, "is_verified": 0}
    finally:
        conn.close()

def get_user_by_email(email: str):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM users WHERE lower(email) = ?", (email.strip().lower(),))
        row = cursor.fetchone()
        if row:
            return dict(row)
        return None
    finally:
        conn.close()

def get_user_by_username(username: str):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM users WHERE lower(username) = ?", (username.strip().lower(),))
        row = cursor.fetchone()
        if row:
            return dict(row)
        return None
    finally:
        conn.close()

def verify_user(email: str):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE users SET is_verified = 1 WHERE lower(email) = ?", (email.strip().lower(),))
        conn.commit()
    finally:
        conn.close()

def update_password(email: str, new_password_hash: str):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE users SET password_hash = ? WHERE lower(email) = ?", (new_password_hash, email.strip().lower()))
        conn.commit()
    finally:
        conn.close()

def save_otp(email: str, otp: str, purpose: str, expires_at_iso: str):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        # Invalidate previous unused OTPs for the same email and purpose
        cursor.execute("UPDATE otp_codes SET used = 1 WHERE lower(email) = ? AND purpose = ?", (email.strip().lower(), purpose))
        cursor.execute(
            "INSERT INTO otp_codes (email, otp, purpose, expires_at, used) VALUES (?, ?, ?, ?, 0)",
            (email.strip().lower(), otp.strip(), purpose, expires_at_iso)
        )
        conn.commit()
    finally:
        conn.close()

def validate_and_consume_otp(email: str, otp: str, purpose: str) -> bool:
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "SELECT id, expires_at, used FROM otp_codes WHERE lower(email) = ? AND otp = ? AND purpose = ? AND used = 0 ORDER BY id DESC LIMIT 1",
            (email.strip().lower(), otp.strip(), purpose)
        )
        row = cursor.fetchone()
        if not row:
            return False
        
        # Check expiration
        expires_at = datetime.fromisoformat(row["expires_at"])
        if datetime.now(timezone.utc) > expires_at:
            return False
        
        # Mark as used
        cursor.execute("UPDATE otp_codes SET used = 1 WHERE id = ?", (row["id"],))
        conn.commit()
        return True
    finally:
        conn.close()
