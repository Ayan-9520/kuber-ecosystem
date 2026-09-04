# Set public API origin across Vercel rewrites, api-config fallbacks, and Hostinger bridge.
# Production:  .\scripts\set-public-api-url.ps1 -Url "https://api.kuberone.online"
# Local tunnel: .\scripts\set-public-api-url.ps1 -Url "https://xxxx.trycloudflare.com"

param(
  [Parameter(Mandatory = $true)]
  [string]$Url
)

$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$apiHost = ($Url -replace '^https?://', '' -replace '/.*$', '').Trim().ToLowerInvariant()

if (-not $apiHost) {
  throw "Invalid URL: $Url"
}

$origin = "https://$apiHost"

$files = @(
  'apps\admin\vercel.json',
  'apps\mobile-dsa\vercel.json',
  'apps\mobile-customer\vercel.json',
  'apps\web-public\vercel.json',
  'apps\admin\src\lib\api-config.ts',
  'apps\mobile-dsa\src\lib\api-config.ts',
  'apps\mobile-customer\src\lib\api-config.ts',
  '..\kuberfinserve\deploy\config.php',
  '..\kuberfinserve\HOSTINGER-UPLOAD\public_html\api\config.php'
)

# Replace previous known API hosts (permanent + any trycloudflare subdomain)
$hostPattern = '(?:api\.kuberone\.online|[a-z0-9-]+\.trycloudflare\.com)'

foreach ($rel in $files) {
  $path = Join-Path $Root $rel
  if (-not (Test-Path $path)) {
    Write-Host "Skip (missing): $rel"
    continue
  }
  $text = Get-Content $path -Raw
  $newText = [regex]::Replace($text, $hostPattern, $apiHost)
  if ($newText -ne $text) {
    Set-Content -Path $path -Value $newText -NoNewline
    Write-Host "Updated: $rel"
  } else {
    Write-Host "No change: $rel"
  }
}

Write-Host ""
Write-Host "API origin set to: $origin" -ForegroundColor Green
Write-Host "Next:" -ForegroundColor Yellow
Write-Host "  1) Point DNS A/CNAME for api.kuberone.online -> your VPS (if production)"
Write-Host "  2) Rebuild: admin, mobile-dsa, mobile-customer dist"
Write-Host "  3) Push Vercel + upload Hostinger public_html/api/config.php"
