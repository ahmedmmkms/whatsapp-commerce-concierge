param(
  [Parameter(Mandatory = $true)][string]$ApiBase
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
function Ok([string]$m){ Write-Host "+ $m" -ForegroundColor Green }
function Fail([string]$m){ Write-Host "x $m" -ForegroundColor Red; exit 1 }

if ($ApiBase.EndsWith('/')) { $ApiBase = $ApiBase.TrimEnd('/') }
$r = Invoke-WebRequest -UseBasicParsing -Method Get -Uri "$ApiBase/categories"
if ($r.StatusCode -ne 200) { Fail "/categories status $($r.StatusCode)" }
$o = $r.Content | ConvertFrom-Json
if ($o.ok -ne $true -or $null -eq $o.categories) { Fail "/categories invalid response" }
Ok "/categories ok (count=$($o.categories.Count))"
