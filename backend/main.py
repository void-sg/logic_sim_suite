from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

import config
import convert, arithmetic, compare, mux_router, circuit_router, auth_router, user_circuits_router
import database

# Initialize database schema (PostgreSQL or SQLite)
database.init_db()

app = FastAPI(
    title="Digital Logic Simulation Suite API",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Layer 10: CORS Middleware with Configurable Allowed Origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True if config.CORS_ORIGINS != ["*"] else False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def security_and_cors_headers(request: Request, call_next):
    # Handle preflight OPTIONS requests cleanly
    if request.method == "OPTIONS":
        response = Response()
        origin = request.headers.get("origin", "*")
        if "*" in config.CORS_ORIGINS or origin in config.CORS_ORIGINS:
            response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        response.headers["Access-Control-Allow-Private-Network"] = "true"
        return response

    response = await call_next(request)
    
    # Layer 10: Security Headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Access-Control-Allow-Private-Network"] = "true"
    
    return response

# Include all modular routers
app.include_router(convert.router)
app.include_router(arithmetic.router)
app.include_router(compare.router)
app.include_router(mux_router.router)
app.include_router(circuit_router.router)
app.include_router(auth_router.router)
app.include_router(user_circuits_router.router)

# Layer 14: Comprehensive Health Check Endpoint
@app.get("/api/health", tags=["system"])
def health_check():
    """System health check verifying API readiness and database connectivity."""
    db_status = database.ping_db()
    return {
        "status": "healthy",
        "environment": config.ENVIRONMENT,
        "database": db_status
    }

@app.get("/", tags=["system"])
def root():
    return {
        "status": "ok",
        "product": "Digital Logic Simulation Suite API",
        "health": "/api/health",
        "docs": "/docs",
        "endpoints": [
            "/convert",
            "/add-subtract",
            "/compare",
            "/mux",
            "/circuit/mux-8to1",
            "/circuit/mux-4to1",
            "/circuit/comparator-4bit",
            "/circuit/adder-subtractor-4bit",
            "/api/circuits",
            "/auth/login",
            "/auth/register",
        ],
    }

# Serve frontend files if directory exists — MUST be last so API routes take priority
frontend_dir = Path(__file__).resolve().parent.parent / "frontend"
if frontend_dir.is_dir():
    app.mount("/", StaticFiles(directory=str(frontend_dir), html=True), name="frontend")
