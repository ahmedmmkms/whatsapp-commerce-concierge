param(
  [Parameter(Mandatory = $true)][string]$ApiBase,
  [switch]$ExpectData
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Ok([string]$m){ Write-Host "+ $m" -ForegroundColor Green }
function Fail([string]$m){ Write-Host "x $m" -ForegroundColor Red; exit 1 }
function Warn([string]$m){ Write-Host "~ $m" -ForegroundColor Yellow }

if ($ApiBase.EndsWith('/')) { $ApiBase = $ApiBase.TrimEnd('/') }
$h = Invoke-WebRequest -UseBasicParsing -Method Get -Uri "$ApiBase/catalog/health"
if ($h.StatusCode -ne 200) { Fail "/catalog/health status $($h.StatusCode)" }
$o = $h.Content | ConvertFrom-Json
if ($o.ok -ne $true) { Fail "/catalog/health ok=false" }
$p=[int]$o.counts.products; $c=[int]$o.counts.categories; $m=[int]$o.counts.media
Ok "/catalog/health ok (p=$p c=$c m=$m)"
if ($ExpectData -and ($p -le 0 -or $c -le 0)) { Fail "Expected non-zero counts" }
if (-not $ExpectData -and ($p -le 0 -or $c -le 0)) { Warn "Counts are zero — ingest catalog first" }
