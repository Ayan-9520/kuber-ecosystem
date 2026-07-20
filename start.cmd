@echo off
title KuberOne Docker
cd /d "%~dp0"
echo.
echo ========================================
echo   KuberOne Docker Stack
echo   Folder: %CD%
echo ========================================
echo.
echo IMPORTANT: Docker Desktop - Settings - Resources - Memory: 6 GB+
echo.
set COMPOSE_PARALLEL_LIMIT=1
set DOCKER_BUILDKIT=1
set "DOCKER=C:\Program Files\Docker\Docker\resources\bin\docker.exe"
if not exist "%DOCKER%" set "DOCKER=docker"

echo [1/2] Building images sequentially (avoids Windows OOM)...
"%DOCKER%" compose build backend
if errorlevel 1 goto fail
"%DOCKER%" compose build admin
if errorlevel 1 goto fail
"%DOCKER%" compose build web-public
if errorlevel 1 goto fail
"%DOCKER%" compose build mobile-customer
if errorlevel 1 goto fail
"%DOCKER%" compose build mobile-dsa
if errorlevel 1 goto fail
"%DOCKER%" compose build nginx
if errorlevel 1 goto fail

echo.
echo [2/2] Starting containers...
"%DOCKER%" compose up -d
if errorlevel 1 goto fail

echo.
echo Waiting for backend (first run: migrate + seed can take several minutes)...
:waitloop
timeout /t 15 /nobreak >nul
powershell -NoProfile -Command "try { $r = Invoke-WebRequest -Uri 'http://127.0.0.1:4000/health/live' -UseBasicParsing -TimeoutSec 5; if ($r.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }"
if errorlevel 1 goto waitloop

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
exit /b 0

:fail
echo.
echo FAILED. Try: "%DOCKER%" compose logs -f backend
pause
exit /b 1
