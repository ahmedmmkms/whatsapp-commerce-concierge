<#
.SYNOPSIS
  Aggregated acceptance runner for Sprints 1–6.

.PARAMETER ApiBase
  API base URL, e.g., http://localhost:3001 or https://<api>.vercel.app

.PARAMETER DoStripe
  Include Stripe tests where available (Sprint 5).

.PARAMETER Lang
  Language for WA preview tests where applicable (default: en).

.PARAMETER CatalogSyncKey
  Optional key to trigger /catalog/sync in Sprint 2 acceptance.

.EXAMPLE
  pwsh scripts/acceptance-all.ps1 -ApiBase https://whatsapp-commerce-concierge-api.vercel.app -DoStripe
#>

param(
  [Parameter(Mandatory = $true)][string]$ApiBase,
  [switch]$DoStripe,
  [ValidateSet('en','ar')][string]$Lang = 'en',
  [string]$CatalogSyncKey,
  [string]$WebOrigin,
  [string]$VerifyToken,
  [string]$WaAppSecret,
  [switch]$SkipSignature,
  [switch]$SkipQueue
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Run($title, $relPath, [hashtable]$parameters) {
  Write-Host "=== $title ===" -ForegroundColor Yellow
  $path = Join-Path $PSScriptRoot $relPath
  if (-not (Test-Path $path)) {
    Write-Host "~ Skipping: $relPath not found" -ForegroundColor DarkYellow
    return
  }
  # Invoke the script directly so splatted named params bind correctly
  & $path @parameters
  if (-not $?) { throw "$title failed" }
}

if ($ApiBase.EndsWith('/')) { $ApiBase = $ApiBase.TrimEnd('/') }

try {
  # Sprint 1 (requires WebOrigin and VerifyToken)
  if ($WebOrigin -and $VerifyToken) {
    $s1 = @{ ApiBase = $ApiBase; WebOrigin = $WebOrigin; VerifyToken = $VerifyToken }
    if ($WaAppSecret) { $s1.WaAppSecret = $WaAppSecret }
    if ($SkipSignature) { $s1.SkipSignature = $true }
    if ($SkipQueue) { $s1.SkipQueue = $true }
    Run 'Sprint 1 Smoke' 'sprint1-smoke.ps1' $s1
  } else {
    Write-Host "~ Skipping Sprint 1 (WebOrigin/VerifyToken not provided)" -ForegroundColor DarkYellow
  }

  # Sprint 2
  $s2Args = @{ ApiBase = $ApiBase; Lang = $Lang }
  if ($CatalogSyncKey) { $s2Args.CatalogSyncKey = $CatalogSyncKey; $s2Args.ExpectData = $true }
  Run 'Sprint 2 Acceptance' 'sprint2-acceptance.ps1' $s2Args

  # Sprint 3
  Run 'Sprint 3 Smoke' 'sprint3-smoke.ps1' @{ ApiBase = $ApiBase }

  # Sprint 4 (no dedicated acceptance scripts) – skip gracefully
  Write-Host "=== Sprint 4 Web MVP ===" -ForegroundColor Yellow
  Write-Host "~ No scripted acceptance; verify web pages render (home, products)." -ForegroundColor DarkYellow

  # Sprint 5
  $s5Args = @{ ApiBase = $ApiBase }
  if ($DoStripe) { $s5Args.DoStripe = $true }
  Run 'Sprint 5 Acceptance' 'sprint5-acceptance.ps1' $s5Args

  # Sprint 6
  Run 'Sprint 6 Acceptance' 'sprint6-acceptance.ps1' @{ ApiBase = $ApiBase }

  Write-Host "All Sprints (1–6) acceptance PASSED" -ForegroundColor Green
} catch {
  Write-Host $_ -ForegroundColor Red
  Write-Host "Aggregated acceptance FAILED" -ForegroundColor Red
  exit 1
}
