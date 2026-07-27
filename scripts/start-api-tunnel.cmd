@echo off
title KuberOne API Cloudflare Tunnel
cd /d "E:\Projects\kuberapp"

echo.
echo ========================================
echo   Cloudflare quick tunnel -^> :4000
echo   Keep this window OPEN while using
echo   https://kuberone.online
echo ========================================
echo.
echo After a NEW URL appears:
echo   1. Update apps/admin/vercel.json rewrite destinations
echo   2. git add + commit + push (Vercel redeploys)
echo.

where cloudflared >nul 2>&1
if errorlevel 1 (
  echo cloudflared not found. Install: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/
  pause
  exit /b 1
)

curl.exe -s -o NUL -w "" http://127.0.0.1:4000/health/live
if errorlevel 1 (
  echo Backend not reachable on :4000. Start Docker first:
  echo   docker compose up -d backend
  pause
  exit /b 1
)

cloudflared tunnel --url http://127.0.0.1:4000
pause
