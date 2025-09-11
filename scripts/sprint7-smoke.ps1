<#
.SYNOPSIS
  Sprint 7 smoke: health/perf sanity and optional compliance checks (non-fatal if unimplemented).

.PARAMETER ApiBase
  API base URL, e.g., http://localhost:3001 or https://<api>.vercel.app

.EXAMPLE
  pwsh scripts/sprint7-smoke.ps1 -ApiBase http://localhost:3001
#>

param(
  [Parameter(Mandatory = $true)][string]$ApiBase
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function New-HttpClient { [System.Net.Http.HttpClient]::new() }
function New-JsonContent([string]$s) { New-Object System.Net.Http.StringContent($s, [Text.Encoding]::UTF8, 'application/json') }
function Ok([string]$msg) { Write-Host "+ $msg" -ForegroundColor Green }
function Info([string]$msg) { Write-Host "i $msg" -ForegroundColor Cyan }
function Fail([string]$msg) { Write-Host "x $msg" -ForegroundColor Red }

if ($ApiBase.EndsWith('/')) { $ApiBase = $ApiBase.TrimEnd('/') }
$client = New-HttpClient
$fail = 0

try {
  # Health endpoint must succeed
  $hz = $client.GetAsync("$ApiBase/healthz").GetAwaiter().GetResult()
  if (-not $hz.IsSuccessStatusCode) { throw "/healthz failed: $([int]$hz.StatusCode)" }
  Ok "/healthz OK"

  # Basic product request sanity
  $pr = $client.GetAsync("$ApiBase/products?page=1&pageSize=1").GetAwaiter().GetResult()
  if ($pr.IsSuccessStatusCode) { Ok "/products OK (basic sanity)" } else { Info "/products not available ($([int]$pr.StatusCode))" }

  # Optional: OpenAPI docs presence
  $docs = $client.GetAsync("$ApiBase/docs").GetAwaiter().GetResult()
  if ($docs.IsSuccessStatusCode) { Info "Swagger docs present" } else { Info "Swagger docs endpoint not found (acceptable)" }

  # Optional: compliance endpoints (non-fatal if 404)
  $ce = $client.GetAsync("$ApiBase/compliance/pdpl/status").GetAwaiter().GetResult()
  if ($ce.StatusCode -eq 404) { Info "PDPL status endpoint not implemented (acceptable)" }
  elseif ($ce.IsSuccessStatusCode) { Info "PDPL status available" } else { Info "PDPL status responded $([int]$ce.StatusCode)" }

} catch {
  $fail++
  Fail $_
} finally {
  $client.Dispose()
}

if ($fail -gt 0) { Write-Host "Sprint 7 smoke FAILED with $fail error(s)." -ForegroundColor Red; exit 1 } else { Write-Host "Sprint 7 smoke PASSED." -ForegroundColor Green }

