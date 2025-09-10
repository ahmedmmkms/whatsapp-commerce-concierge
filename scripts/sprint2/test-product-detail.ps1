param(
  [Parameter(Mandatory = $true)][string]$ApiBase,
  [string]$ProductId
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
function Ok([string]$m){ Write-Host "+ $m" -ForegroundColor Green }
function Fail([string]$m){ Write-Host "x $m" -ForegroundColor Red; exit 1 }

if ($ApiBase.EndsWith('/')) { $ApiBase = $ApiBase.TrimEnd('/') }
if (-not $ProductId) {
  $list = Invoke-WebRequest -UseBasicParsing -Method Get -Uri "$ApiBase/products?page=1&pageSize=1"
  if ($list.StatusCode -ne 200) { Fail "/products status $($list.StatusCode)" }
  $obj = $list.Content | ConvertFrom-Json
  if ($null -eq $obj.items -or $obj.items.Count -lt 1) {
    Fail "No products returned from /products — seed or sync the catalog first."
  }
  $ProductId = ($obj.items | Select-Object -First 1).id
}
if (-not $ProductId) { Fail "No product id available" }
$g = Invoke-WebRequest -UseBasicParsing -Method Get -Uri "$ApiBase/products/$ProductId"
if ($g.StatusCode -ne 200) { Fail "/products/:id status $($g.StatusCode)" }
$o = $g.Content | ConvertFrom-Json
if ($o.ok -ne $true -or $null -eq $o.product) { Fail "Invalid product detail response" }
Ok "/products/:id ok ($ProductId)"
