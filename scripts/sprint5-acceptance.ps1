<#
.SYNOPSIS
  Sprint 5 acceptance runner: executes smoke + focused tests (COD, address validation, and optional Stripe init).

.PARAMETER ApiBase
  API base URL, e.g., http://localhost:3001 or https://<api>.vercel.app

.PARAMETER DoStripe
  Include Stripe init test.

.EXAMPLE
  pwsh scripts/sprint5-acceptance.ps1 -ApiBase http://localhost:3001 -DoStripe
#>

param(
  [Parameter(Mandatory = $true)][string]$ApiBase,
  [switch]$DoStripe
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Run($title, $script, $args) {
  Write-Host "=== $title ===" -ForegroundColor Yellow
  & pwsh -NoProfile -File $script @args
  if ($LASTEXITCODE -ne 0) { throw "$title failed ($LASTEXITCODE)" }
}

Run 'Sprint 5 Smoke' 'scripts/sprint5-smoke.ps1' @{ ApiBase = $ApiBase; DoStripe = $DoStripe }
Run 'Address Validation' 'scripts/sprint5/test-address-validation.ps1' @{ ApiBase = $ApiBase }
Run 'COD Checkout' 'scripts/sprint5/test-cod-checkout.ps1' @{ ApiBase = $ApiBase }
if ($DoStripe) { Run 'Stripe Init' 'scripts/sprint5/test-stripe-init.ps1' @{ ApiBase = $ApiBase } }

Write-Host "All Sprint 5 acceptance tests PASSED" -ForegroundColor Green

