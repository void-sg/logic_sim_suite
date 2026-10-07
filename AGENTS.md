# Project: Digital Logic Simulation Suite (SaaS)

## What this product does
An interactive, high-performance web application and Electronic Design Automation (EDA) simulation suite for digital electronics. Enables engineering students and designers to simulate standard TTL 74LSxx logic ICs, code converters, magnitude comparators, multiplexers, and 4-bit adders with real-time waveforms and cloud-backed circuit project persistence.

## Tech Stack
- **Frontend**: HTML5, Modern CSS3, Vanilla ES6+ JavaScript, SVG Interactive Canvas for IC Breadboard Workbench & KiCad Schematics.
- **Backend**: Python 3.10+ with FastAPI, Uvicorn, and Pydantic v2.
- **Database**: Dual-engine (`database.py`):
  - Local Development: SQLite (`backend/users.db`)
  - Production Cloud: PostgreSQL (Neon / Supabase / Render Postgres via `DATABASE_URL`)
- **Authentication**: JWT Bearer Tokens, Salted SHA-256 Hashing, OTP Verification, Institutional Roll Number & Email Identifiers.
- **Hosting Targets**: Vercel (Static Frontend & CDN) + Render / Railway (FastAPI Backend & Cloud PostgreSQL).

## Golden Rules
1. **Never commit secrets**: All secrets must be loaded from environment variables and documented in `.env.example`.
2. **Strict tenant & user scoping**: Every circuit query must filter by authenticated `user_id`. Never allow IDOR or cross-tenant project leakage.
3. **Dual database engine compatibility**: Ensure SQL syntax in `backend/database.py` executes cleanly on both SQLite and PostgreSQL.
4. **Input validation at boundary**: All API requests must be validated using Pydantic schemas.
5. **Never break test suites**: Run `backend/test_database.py` and `backend/test_cloud_circuits.py` before completing any backend changes.
6. **No unsolicited Git commits**: Leave working tree changes unstaged/staged unless explicitly asked to commit.

## Core Commands
- **Run Backend**: `.venv\Scripts\python.exe -m uvicorn main:app --app-dir backend --reload --port 8000`
- **Run Database Tests**: `.venv\Scripts\python.exe backend/test_database.py`
- **Run Cloud Circuits Tests**: `.venv\Scripts\python.exe backend/test_cloud_circuits.py`

## Architecture Decisions Log
- **ADR-0001 (Modular Monolith)**: FastAPI backend provides pure REST API; simulation logic executes client-side via JavaScript engine for real-time 60 FPS interactive wiring without server bottlenecks.
- **ADR-0002 (Dual-Tier Circuit Storage)**: Circuits persist in `localStorage` for offline caching and sync to the cloud database (`user_circuits`) when authenticated.
- **ADR-0003 (Academic Identifier First)**: Students authenticate via College Roll Number or Email; passwords hashed with PBKDF2/SHA-256 with cryptographically random per-user salt.
