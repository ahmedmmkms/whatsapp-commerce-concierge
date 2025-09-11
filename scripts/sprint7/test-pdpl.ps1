<#
.SYNOPSIS
  Test PDPL endpoints: status and export (export requires ADMIN_TOKEN).

.PARAMETER ApiBase
  API base URL, e.g., http://localhost:3001

.PARAMETER AdminToken
  Admin token for protected endpoints (x-admin-token). If not provided, export is skipped.

.PARAMETER Phone
  Customer phone (E.164) to export.
#>

param(
  [Parameter(Mandatory = $true)][string]$ApiBase,
  [Parameter(Mandatory = $false)][string]$AdminToken,
  [Parameter(Mandatory = $false)][string]$Phone
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
  $st = $client.GetAsync("$ApiBase/compliance/pdpl/status").GetAwaiter().GetResult()
  if (-not $st.IsSuccessStatusCode) { throw "status failed: $([int]$st.StatusCode)" }
  $body = $st.Content.ReadAsStringAsync().Result | ConvertFrom-Json
  if (-not $body.ok) { throw "status returned not ok" }
  Ok "PDPL status OK (exportSupported=$($body.pdpl.exportSupported), deleteSupported=$($body.pdpl.deleteSupported))"

  if ($AdminToken) {
    $req = New-Object System.Net.Http.HttpRequestMessage 'Post', "$ApiBase/compliance/pdpl/export"
    $req.Headers.Add('x-admin-token', $AdminToken)
    $payload = @{}
    if ($Phone) { $payload.phone = $Phone }
    $req.Content = New-JsonContent (($payload | ConvertTo-Json))
    $ex = $client.SendAsync($req).GetAwaiter().GetResult()
    if ($ex.IsSuccessStatusCode) {
      $data = $ex.Content.ReadAsStringAsync().Result | ConvertFrom-Json
      if ($data.ok -and $data.data) { Ok "PDPL export returned data for phone=$Phone" } else { Info "PDPL export responded: $($ex.Content.ReadAsStringAsync().Result)" }
    } else {
      Info "PDPL export failed $([int]$ex.StatusCode). Provide a valid AdminToken to test."
    }
  } else {
    Info "AdminToken not provided; skipping export test."
  }

} catch {
  $fail++
  Fail $_
} finally {
  $client.Dispose()
}

if ($fail -gt 0) { Write-Host "PDPL tests FAILED with $fail error(s)." -ForegroundColor Red; exit 1 } else { Write-Host "PDPL tests PASSED." -ForegroundColor Green }

