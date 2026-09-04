# Legacy alias — prefer scripts/set-public-api-url.ps1 for production + tunnel.
# Usage: .\scripts\update-tunnel-url.ps1 -Url "https://your-subdomain.trycloudflare.com"

param(
  [Parameter(Mandatory = $true)]
  [string]$Url
)

& "$PSScriptRoot\set-public-api-url.ps1" -Url $Url
