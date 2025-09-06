@echo off
echo Starting SwimBuddy Pro Servers...

echo.
echo Starting Backend Server...
start "SwimBuddy Backend" cmd /k "cd /d c:\Users\ashar\SwimBuddyPro\backend && .\venv\Scripts\activate && uvicorn app.main:app --reload --host localhost --port 8000"

timeout /t 3

echo.
echo Starting Frontend Server...
start "SwimBuddy Frontend" cmd /k "cd /d c:\Users\ashar\SwimBuddyPro\frontend && npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo.
pause
