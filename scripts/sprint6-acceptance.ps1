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

function Run($title, $script, $parameters) {
  Write-Host "=== $title ===" -ForegroundColor Yellow
  if ([System.IO.Path]::IsPathRooted($script)) { $path = $script } else { $path = Join-Path $PSScriptRoot $script }
  & $path @parameters
  if (-not $?) { throw "$title failed" }
}

Run 'Sprint 6 Smoke' 'sprint6-smoke.ps1' @{ ApiBase = $ApiBase }
Run 'Orders Lookup' 'sprint6/test-orders-lookup.ps1' @{ ApiBase = $ApiBase }
Run 'Returns Create' 'sprint6/test-returns-create.ps1' @{ ApiBase = $ApiBase }
Run 'CMS Templates' 'sprint6/test-cms-templates.ps1' @{ ApiBase = $ApiBase }

Write-Host "All Sprint 6 acceptance tests PASSED" -ForegroundColor Green
