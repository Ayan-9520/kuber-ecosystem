# Run in elevated PowerShell so phones on the same WiFi can reach the API (port 4000).
# Usage: Right-click PowerShell -> Run as administrator -> .\scripts\open-dev-firewall.ps1

$ruleName = 'KuberOne API Dev'
$existing = netsh advfirewall firewall show rule name="$ruleName" 2>$null
if ($LASTEXITCODE -eq 0) {
  Write-Host "Firewall rule '$ruleName' already exists."
  exit 0
}

netsh advfirewall firewall add rule name="$ruleName" dir=in action=allow protocol=TCP localport=4000
if ($LASTEXITCODE -eq 0) {
  Write-Host "Added inbound firewall rule for TCP port 4000."
  Write-Host "Phones on the same WiFi can use http://<your-pc-ip>:4000/api/v1"
} else {
  Write-Host "Failed to add firewall rule. Run this script as Administrator."
  exit 1
}
