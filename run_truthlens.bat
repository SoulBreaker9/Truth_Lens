@echo off
TITLE TruthLens Launcher

echo ==================================================
echo       TRUTHLENS - MILITARY GRADE FORENSICS
echo ==================================================
echo.

echo [1/2] Launching Backend Server (Python/FastAPI)...
start "TruthLens Backend" cmd /k "cd backend && venv\Scripts\python.exe main.py"

echo [2/2] Launching Frontend Interface (Next.js)...
start "TruthLens Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ==================================================
echo       SYSTEM STARTING UP...
echo ==================================================
echo.
echo 1. Wait for the Backend window to say "Uvicorn running on http://0.0.0.0:8000"
echo 2. Wait for the Frontend window to say "Ready"
echo 3. Open your browser to: http://localhost:3000
echo.
pause
