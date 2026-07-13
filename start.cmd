@echo off
title KuberOne Docker
cd /d "E:\Projects\kuberapp"
echo.
echo ========================================
echo   KuberOne Docker Stack
echo   Folder: E:\Projects\kuberapp
echo ========================================
echo.
echo IMPORTANT: Docker Desktop - Settings - Resources - Memory: 6 GB+
echo.
set COMPOSE_PARALLEL_LIMIT=1
set DOCKER_BUILDKIT=1
set "DOCKER=C:\Program Files\Docker\Docker\resources\bin\docker.exe"

echo [1/2] Starting containers...
"%DOCKER%" compose up -d --build
if errorlevel 1 (
  echo.
  echo FAILED. Try: "%DOCKER%" compose logs -f backend
  pause
  exit /b 1
)

echo.
echo [2/2] Waiting for backend (first run: 10-20 min for DB migrate+seed)...
:waitloop
timeout /t 15 /nobreak >nul
powershell -NoProfile -Command "try { $r = Invoke-WebRequest -Uri 'http://127.0.0.1:4000/health/live' -UseBasicParsing -TimeoutSec 5; if ($r.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }"
if errorlevel 1 goto waitloop

echo.
echo Starting frontend services...
"%DOCKER%" compose up -d
echo.
echo ========================================
echo   ALL RUNNING - open in browser:
echo   Gateway:  http://localhost:8080
echo   Admin:    http://localhost:5173
echo   API:      http://localhost:4000/health/live
echo   Public:   http://localhost:5174
echo   Customer: http://localhost:8081/login  (OTP 9876543210 / 123456)
echo   DSA:      http://localhost:8082/login  (OTP 8888777766 / 123456)
echo   Login:    admin@kuberone.com / Admin@123
echo ========================================
echo.
"%DOCKER%" compose ps
echo.
pause
