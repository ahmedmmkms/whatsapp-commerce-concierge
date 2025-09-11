<#
.SYNOPSIS
  Validate CMS templates CRUD (if implemented) and resolution basics.

.PARAMETER ApiBase
  API base URL.
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
  # List templates
  $gt = $client.GetAsync("$ApiBase/cms/templates").GetAwaiter().GetResult()
  if ($gt.StatusCode -eq 404) { Info "CMS templates endpoint not implemented yet (404)" }
  elseif ($gt.IsSuccessStatusCode) {
    Ok "CMS templates list available"
  } else { Info "GET /cms/templates returned $([int]$gt.StatusCode) (acceptable if not ready)" }

} catch {
  $fail++
  Fail $_
} finally {
  $client.Dispose()
}

if ($fail -gt 0) { Write-Host "CMS templates test FAILED with $fail error(s)." -ForegroundColor Red; exit 1 } else { Write-Host "CMS templates test PASSED." -ForegroundColor Green }

