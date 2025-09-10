param(
  [Parameter(Mandatory = $true)][string]$ApiBase
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
function Ok([string]$m){ Write-Host "+ $m" -ForegroundColor Green }
function Fail([string]$m){ Write-Host "x $m" -ForegroundColor Red; exit 1 }

if ($ApiBase.EndsWith('/')) { $ApiBase = $ApiBase.TrimEnd('/') }
$r = Invoke-WebRequest -UseBasicParsing -Method Get -Uri "$ApiBase/products?q=test&sort=name&order=asc&page=1&pageSize=5"
if ($r.StatusCode -ne 200) { Fail "/products status $($r.StatusCode)" }
$o = $r.Content | ConvertFrom-Json
if ($null -eq $o.items -or $null -eq $o.total) { Fail "Shape invalid" }
Ok "/products ok (total=$($o.total); page=$($o.page); pageSize=$($o.pageSize))"
