<#
.SYNOPSIS
  Sprint 8 smoke: support page polish and basic API sanity.

.PARAMETER ApiBase
  API base URL, e.g., http://localhost:3001 or https://<api>.vercel.app

.PARAMETER WebBase
  Optional Web base URL for support page checks, e.g., http://localhost:3000 or https://<web>.vercel.app

.EXAMPLE
  pwsh scripts/sprint8-smoke.ps1 -ApiBase http://localhost:3001 -WebBase http://localhost:3000
#>

param(
  [Parameter(Mandatory = $true)][string]$ApiBase,
  [string]$WebBase
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function New-HttpClient { [System.Net.Http.HttpClient]::new() }
function New-JsonContent([string]$s) { New-Object System.Net.Http.StringContent($s, [Text.Encoding]::UTF8, 'application/json') }
function Ok([string]$msg) { Write-Host "+ $msg" -ForegroundColor Green }
function Info([string]$msg) { Write-Host "i $msg" -ForegroundColor Cyan }
function Warn([string]$msg) { Write-Host "~ $msg" -ForegroundColor DarkYellow }
function Fail([string]$msg) { Write-Host "x $msg" -ForegroundColor Red }

if ($ApiBase.EndsWith('/')) { $ApiBase = $ApiBase.TrimEnd('/') }
if ($WebBase -and $WebBase.EndsWith('/')) { $WebBase = $WebBase.TrimEnd('/') }

$client = New-HttpClient
$fail = 0

try {
  # Health endpoint must succeed
  $hz = $client.GetAsync("$ApiBase/healthz").GetAwaiter().GetResult()
  if (-not $hz.IsSuccessStatusCode) { throw "/healthz failed: $([int]$hz.StatusCode)" }
  Ok "/healthz OK"

  # Orders lookup: expect success or empty when unknown phone
  $ol = $client.GetAsync("$ApiBase/orders?phone=+00000000000").GetAwaiter().GetResult()
  if ($ol.IsSuccessStatusCode) { Ok "/orders?phone OK (redacted list)" } else { Info "/orders?phone not available ($([int]$ol.StatusCode))" }

  # Optional: support web page smoke
  if ($WebBase) {
    $sp = $client.GetAsync("$WebBase/support/order-lookup").GetAwaiter().GetResult()
    if ($sp.IsSuccessStatusCode) { Ok "Support page renders" } else { Warn "Support page responded $([int]$sp.StatusCode)" }
  } else {
    Info "WebBase not provided; skipping support page check"
  }

} catch {
  $fail++
  Fail $_
} finally {
  $client.Dispose()
}

if ($fail -gt 0) { Write-Host "Sprint 8 smoke FAILED with $fail error(s)." -ForegroundColor Red; exit 1 } else { Write-Host "Sprint 8 smoke PASSED." -ForegroundColor Green }

