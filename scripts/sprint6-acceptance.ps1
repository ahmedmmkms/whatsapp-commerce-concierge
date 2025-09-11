<#
.SYNOPSIS
  Sprint 6 acceptance runner: executes smoke + focused tests (orders lookup, returns create, CMS templates).

.PARAMETER ApiBase
  API base URL, e.g., http://localhost:3001 or https://<api>.vercel.app

.EXAMPLE
  pwsh scripts/sprint6-acceptance.ps1 -ApiBase http://localhost:3001
#>

param(
  [Parameter(Mandatory = $true)][string]$ApiBase
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Run($title, $script, $args) {
  Write-Host "=== $title ===" -ForegroundColor Yellow
  & pwsh -NoProfile -File $script @args
  if ($LASTEXITCODE -ne 0) { throw "$title failed ($LASTEXITCODE)" }
}

Run 'Sprint 6 Smoke' 'scripts/sprint6-smoke.ps1' @{ ApiBase = $ApiBase }
Run 'Orders Lookup' 'scripts/sprint6/test-orders-lookup.ps1' @{ ApiBase = $ApiBase }
Run 'Returns Create' 'scripts/sprint6/test-returns-create.ps1' @{ ApiBase = $ApiBase }
Run 'CMS Templates' 'scripts/sprint6/test-cms-templates.ps1' @{ ApiBase = $ApiBase }

Write-Host "All Sprint 6 acceptance tests PASSED" -ForegroundColor Green

