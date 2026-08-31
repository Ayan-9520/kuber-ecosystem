# Wipe KuberOne Docker state (containers, volumes, local images) and rebuild fresh.
# Run from repo root: .\scripts\reset-docker-kuberone.ps1

$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

function Test-DockerEngine {
  docker info 2>$null | Out-Null
  return $LASTEXITCODE -eq 0
}

if (-not (Test-DockerEngine)) {
  Write-Host 'Docker engine not ready. Open Docker Desktop and wait for Engine running (green).' -ForegroundColor Red
  exit 1
}

Write-Host 'Stopping and removing KuberOne containers, volumes, and local images...' -ForegroundColor Cyan
docker compose down -v --remove-orphans --rmi local

Write-Host 'Removing leftover kuberone volumes (if any)...' -ForegroundColor Cyan
docker volume ls -q --filter name=kuberone | ForEach-Object {
  docker volume rm $_ 2>$null
}

Write-Host 'Building and starting full stack (first run may take 15-25 min)...' -ForegroundColor Cyan
docker compose up -d --build

Write-Host ''
Write-Host 'Stack status:' -ForegroundColor Green
docker compose ps

Write-Host ''
Write-Host 'Local URLs:' -ForegroundColor Green
Write-Host '  API:     http://localhost:4000'
Write-Host '  Admin:   http://localhost:5173'
Write-Host '  Gateway: http://localhost:8080'
Write-Host ''
Write-Host 'For live sites, start tunnel in a new terminal:' -ForegroundColor Yellow
Write-Host '  cloudflared tunnel --url http://localhost:4000'
Write-Host 'Then: .\scripts\update-tunnel-url.ps1 -Url "https://YOUR-URL.trycloudflare.com"'
