# ET Pulse — All-in-One Startup Script

# 1. Start Backend in a new window
Write-Host "🚀 Starting Backend (FastAPI)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", ".\venv\Scripts\Activate; uvicorn backend.main:app --reload"

# 2. Start Frontend in a new window
Write-Host "🎨 Starting Frontend (Next.js)..." -ForegroundColor Magenta
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "`n✅ Both services are starting in separate windows!" -ForegroundColor Green
Write-Host "• Backend: http://localhost:8000"
Write-Host "• Frontend: http://localhost:3000"
