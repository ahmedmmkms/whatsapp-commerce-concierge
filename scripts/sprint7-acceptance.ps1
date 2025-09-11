<#
.SYNOPSIS
  Sprint 7 acceptance runner: executes smoke + targeted checks (perf/compliance placeholders).

.PARAMETER ApiBase
  API base URL, e.g., http://localhost:3001 or https://<api>.vercel.app

.EXAMPLE
  pwsh scripts/sprint7-acceptance.ps1 -ApiBase http://localhost:3001
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

Run 'Sprint 7 Smoke' 'sprint7-smoke.ps1' @{ ApiBase = $ApiBase }

# Basic PDPL status/export test (export requires ADMIN_TOKEN set in env)
$adminToken = $env:ADMIN_TOKEN
$pdplParams = @{ ApiBase = $ApiBase }
if ($adminToken) { $pdplParams.AdminToken = $adminToken }
Run 'PDPL Status/Export' 'sprint7/test-pdpl.ps1' $pdplParams

Write-Host "All Sprint 7 acceptance tests PASSED" -ForegroundColor Green
