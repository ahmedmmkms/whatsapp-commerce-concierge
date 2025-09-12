<#
.SYNOPSIS
  Basic accessibility checks using pa11y via npx.

.PARAMETER WebBase
  Web base URL (e.g., https://your-web.vercel.app)

.EXAMPLE
  pwsh scripts/sprint8/test-axe.ps1 -WebBase https://whatsapp-commerce-concierge-web.vercel.app
#>

param(
  [Parameter(Mandatory = $true)][string]$WebBase
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Run-Pa11y([string]$url) {
  Write-Host "[axe] Checking $url" -ForegroundColor Cyan
  # Use npx to fetch pa11y on demand; tolerate install noise
  $proc = Start-Process -FilePath "npx" -ArgumentList @('-y','pa11y', $url, '--wait', '500', '--timeout', '30000') -NoNewWindow -PassThru -Wait
  if ($proc.ExitCode -ne 0) { throw "pa11y failed for $url (exit $($proc.ExitCode))" }
}

if ($WebBase.EndsWith('/')) { $WebBase = $WebBase.TrimEnd('/') }

try {
  Run-Pa11y "$WebBase/"
  Run-Pa11y "$WebBase/products"
  Run-Pa11y "$WebBase/support/order-lookup"
  Write-Host "Axe checks PASSED" -ForegroundColor Green
} catch {
  Write-Host $_ -ForegroundColor Red
  Write-Host "Axe checks FAILED" -ForegroundColor Red
  exit 1
}

