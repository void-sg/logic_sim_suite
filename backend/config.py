"""
backend/config.py — Centralized Configuration & Environment Validation (Layer 9 & 10)
Validates required environment variables at application startup.
"""
import os
import sys
from pathlib import Path

# Load .env file from project root or backend directory
try:
    from dotenv import load_dotenv
    root_env = Path(__file__).resolve().parent.parent / ".env"
    backend_env = Path(__file__).resolve().parent / ".env"
    if root_env.is_file():
        load_dotenv(dotenv_path=root_env)
    elif backend_env.is_file():
        load_dotenv(dotenv_path=backend_env)
    else:
        load_dotenv()
except ImportError:
    pass

ENVIRONMENT = os.environ.get("ENVIRONMENT", "development").lower().strip()
PORT = int(os.environ.get("PORT", 8000))

# JWT Authentication Config
DEFAULT_JWT_SECRET = "logic_sim_suite_super_secret_jwt_key_2026"
JWT_SECRET = os.environ.get("JWT_SECRET", DEFAULT_JWT_SECRET).strip()
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_SECONDS = 60 * 60 * 24 * 7  # 7 days

# Database Configuration (PostgreSQL / SQLite Dual Engine)
DATABASE_URL = os.environ.get("DATABASE_URL", "").strip()

# CORS Allowed Origins
raw_cors = os.environ.get("CORS_ORIGINS", "*").strip()
if raw_cors == "*" or not raw_cors:
    CORS_ORIGINS = ["*"]
else:
    CORS_ORIGINS = [origin.strip() for origin in raw_cors.split(",") if origin.strip()]

def validate_config_at_startup():
    """Fail loudly at startup if critical production requirements are violated."""
    if ENVIRONMENT == "production":
        if JWT_SECRET == DEFAULT_JWT_SECRET or len(JWT_SECRET) < 16:
            raise RuntimeError(
                "FATAL: In production mode, 'JWT_SECRET' must be set to a strong, high-entropy secret key! "
                "Do not use default or short keys."
            )
        if not DATABASE_URL:
            print(
                "\n[WARNING] 'DATABASE_URL' is not set in production! "
                "Running SQLite on serverless/ephemeral hosts (Vercel/Render) will cause data loss upon server restart. "
                "Set a managed PostgreSQL DATABASE_URL (e.g., Neon or Supabase).\n",
                file=sys.stderr
            )

# Execute startup check
validate_config_at_startup()
