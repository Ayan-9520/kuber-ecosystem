# Update Cloudflare quick-tunnel URL across Vercel + api-config files.
# Usage: .\scripts\update-tunnel-url.ps1 -Url "https://your-subdomain.trycloudflare.com"

param(
  [Parameter(Mandatory = $true)]
  [string]$Url
)

$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$tunnelHost = ($Url -replace '^https?://', '' -replace '/.*$', '').Trim()

if (-not $tunnelHost.EndsWith('.trycloudflare.com')) {
  throw "Expected a trycloudflare.com URL, got: $Url"
}

$files = @(
  'apps\admin\vercel.json',
  'apps\mobile-dsa\vercel.json',
  'apps\web-public\vercel.json',
  'apps\admin\src\lib\api-config.ts',
  'apps\mobile-dsa\src\lib\api-config.ts',
  '..\kuberfinserve\deploy\config.php'
)

$pattern = '[a-z0-9-]+\.trycloudflare\.com'
$replacement = $tunnelHost

foreach ($rel in $files) {
  $path = Join-Path $Root $rel
  if (-not (Test-Path $path)) {
    Write-Host "Skip (missing): $rel"
    continue
  }
  $text = Get-Content $path -Raw
  $newText = [regex]::Replace($text, $pattern, $replacement)
  if ($newText -ne $text) {
    Set-Content -Path $path -Value $newText -NoNewline
    Write-Host "Updated: $rel"
  } else {
    Write-Host "No change: $rel"
  }
}

Write-Host ""
Write-Host "Rebuild admin dist:" -ForegroundColor Yellow
Write-Host "  cd apps\admin; npm run build"
Write-Host "Then commit + push for Vercel (kuberone.online + partner.kuberone.online)."
