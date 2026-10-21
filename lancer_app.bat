@echo off
title Passeport Financier PME - Agent IA Amadou
echo ========================================================
echo  🚀 DEMARRAGE DU PASSEPORT FINANCIER PME ET AGENT IA
echo ========================================================
echo.
echo [1/2] Lancement du Backend FastAPI / LangGraph sur le port 8000...
start "Backend Agent LangGraph" cmd /k "cd backend && .venv\Scripts\python.exe run.py"

echo [2/2] Lancement du Frontend React Vite sur le port 5173...
start "Frontend Vite" cmd /k "npm run dev"

timeout /t 3 /nobreak >nul
echo.
echo Application en cours d'execution !
echo Interface Web : http://localhost:5173
echo Backend Agent  : http://localhost:8000
echo Documentation API : http://localhost:8000/docs
echo.
start http://localhost:5173
pause
