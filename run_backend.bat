@echo off
title Digital Logic Simulation Suite API
echo =======================================================
echo Starting Digital Logic Simulation Suite Backend on port 8000...
echo API docs will be available at http://127.0.0.1:8000/docs
echo =======================================================
cd /d "%~dp0"
python -m uvicorn main:app --app-dir backend --host 0.0.0.0 --port 8000 --reload
pause
