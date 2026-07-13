@echo off
title KuberOne Mobile Apps (Docker)
cd /d "E:\Projects\kuberapp"
echo.
echo ========================================
echo   KuberOne Customer + DSA (Docker only)
echo   No pnpm / Node needed on your PC
echo ========================================
echo.
set COMPOSE_PARALLEL_LIMIT=1
set DOCKER_BUILDKIT=1
set "DOCKER=C:\Program Files\Docker\Docker\resources\bin\docker.exe"

echo [1/3] Rebuilding mobile apps (first time: 15-20 min)...
"%DOCKER%" compose build mobile-customer mobile-dsa
if errorlevel 1 (
  echo BUILD FAILED. Check Docker Desktop memory is 6 GB+
  pause
  exit /b 1
)

echo.
echo [2/3] Starting containers...
"%DOCKER%" compose up -d --force-recreate mobile-customer mobile-dsa backend mysql redis
if errorlevel 1 (
  echo START FAILED.
  pause
  exit /b 1
)

echo.
echo [3/3] Waiting for apps...
:wait8081
timeout /t 5 /nobreak >nul
powershell -NoProfile -Command "try { (Invoke-WebRequest -Uri 'http://127.0.0.1:8081/health' -UseBasicParsing -TimeoutSec 3).StatusCode | Out-Null; exit 0 } catch { exit 1 }"
if errorlevel 1 goto wait8081

:wait8082
timeout /t 2 /nobreak >nul
powershell -NoProfile -Command "try { (Invoke-WebRequest -Uri 'http://127.0.0.1:8082/health' -UseBasicParsing -TimeoutSec 3).StatusCode | Out-Null; exit 0 } catch { exit 1 }"
if errorlevel 1 goto wait8082

echo.
echo ========================================
echo   READY - open in Chrome:
echo.
echo   Customer:  http://localhost:8081/login
echo   OTP:       9876543210  /  123456
echo.
echo   DSA:       http://localhost:8082/login
echo   OTP:       8888777766  /  123456
echo.
echo   If blank page: Ctrl+Shift+R or clear site data
echo ========================================
echo.
start http://localhost:8081/login
start http://localhost:8082/login
pause
