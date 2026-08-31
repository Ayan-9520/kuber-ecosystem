# KuberOne local stack + Cloudflare tunnel (run from repo root)
# If Docker service is Stopped: open Docker Desktop manually or run this script as Administrator.

$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

function Test-DockerEngine {
  docker info 2>$null | Out-Null
  return $LASTEXITCODE -eq 0
}

if (-not (Test-DockerEngine)) {
  $svc = Get-Service com.docker.service -ErrorAction SilentlyContinue
  if ($svc -and $svc.Status -ne 'Running') {
    Write-Host "Docker Desktop Service is Stopped. Starting Docker Desktop..."
    Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    $deadline = (Get-Date).AddMinutes(4)
    while ((Get-Date) -lt $deadline) {
      if (Test-DockerEngine) { break }
      Start-Sleep -Seconds 5
    }
  }
}

if (-not (Test-DockerEngine)) {
  Write-Host ""
  Write-Host "Docker engine not ready. Do ONE of:" -ForegroundColor Red
  Write-Host "  1. Open Docker Desktop from Start menu and wait for Engine running (green)"
  Write-Host "  2. Right-click PowerShell -> Run as Administrator, then:"
  Write-Host "       Start-Service com.docker.service"
  Write-Host ""
  exit 1
}

Write-Host "Starting MySQL + Redis..." -ForegroundColor Cyan
docker compose up -d mysql redis
Write-Host "Waiting for MySQL healthy (up to 3 min)..."
$deadline = (Get-Date).AddMinutes(3)
do {
  $h = docker inspect -f '{{.State.Health.Status}}' kuberone-mysql 2>$null
  if ($h -eq 'healthy') { break }
  Start-Sleep -Seconds 5
} while ((Get-Date) -lt $deadline)

Write-Host "Building + starting backend, worker, admin, nginx..." -ForegroundColor Cyan
docker compose build backend admin
docker compose up -d backend worker admin nginx

Write-Host ""
Write-Host "Stack status:" -ForegroundColor Green
docker compose ps

Write-Host ""
Write-Host "Local URLs:" -ForegroundColor Green
Write-Host "  API:   http://localhost:4000"
Write-Host "  Admin: http://localhost:5173"
Write-Host "  Gateway: http://localhost:8080"
Write-Host ""
Write-Host "Next: in a NEW terminal run:" -ForegroundColor Yellow
Write-Host "  cloudflared tunnel --url http://127.0.0.1:4000"
Write-Host "Copy the https://....trycloudflare.com URL and run scripts/update-tunnel-url.ps1 if it changed."
