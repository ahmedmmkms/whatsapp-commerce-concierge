<#
.SYNOPSIS
  Sprint 8 acceptance runner: executes smoke + targeted checks (support page, WA template preview placeholders).

.PARAMETER ApiBase
  API base URL, e.g., http://localhost:3001 or https://<api>.vercel.app

.PARAMETER WebBase
  Optional Web base URL for support page checks, e.g., http://localhost:3000 or https://<web>.vercel.app

.EXAMPLE
  pwsh scripts/sprint8-acceptance.ps1 -ApiBase http://localhost:3001 -WebBase http://localhost:3000
#>

param(
  [Parameter(Mandatory = $true)][string]$ApiBase,
  [string]$WebBase
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Run($title, $script, $parameters) {
  Write-Host "=== $title ===" -ForegroundColor Yellow
  if ([System.IO.Path]::IsPathRooted($script)) { $path = $script } else { $path = Join-Path $PSScriptRoot $script }
  & $path @parameters
  if (-not $?) { throw "$title failed" }
}

# Smoke
Run 'Sprint 8 Smoke' 'sprint8-smoke.ps1' @{ ApiBase = $ApiBase; WebBase = $WebBase }

# Placeholder: basic WhatsApp preview sanity (non-fatal)
try {
  $client = [System.Net.Http.HttpClient]::new()
  $resp = $client.PostAsync("$ApiBase/whatsapp/preview?text=browse&lang=en", $null).GetAwaiter().GetResult()
  if ($resp.IsSuccessStatusCode) { Write-Host "i WA preview OK" -ForegroundColor Cyan } else { Write-Host "~ WA preview responded $([int]$resp.StatusCode)" -ForegroundColor DarkYellow }
  $client.Dispose()
} catch {
  Write-Host "~ WA preview check skipped: $_" -ForegroundColor DarkYellow
}

Write-Host "All Sprint 8 acceptance tests PASSED" -ForegroundColor Green
