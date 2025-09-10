<#
.SYNOPSIS
  Test WhatsApp preview cart flows for Sprint 3.

.PARAMETER ApiBase
  API base URL, e.g. https://<api>.vercel.app

.PARAMETER From
  Simulated WhatsApp sender phone (binds cart context). Defaults to 971555000111.

.EXAMPLE
  pwsh scripts/sprint3/test-wa-cart.ps1 -ApiBase https://api.example.com -From 971555000111
#>

param(
  [Parameter(Mandatory = $true)][string]$ApiBase,
  [string]$From = '971555000111'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
function Ok([string]$m){ Write-Host "+ $m" -ForegroundColor Green }
function Fail([string]$m){ Write-Host "x $m" -ForegroundColor Red; exit 1 }

if ($ApiBase.EndsWith('/')) { $ApiBase = $ApiBase.TrimEnd('/') }

function Invoke-Preview([string]$text) {
  $body = @{ from = $From; text = $text; lang = 'en' } | ConvertTo-Json -Compress
  $res = Invoke-WebRequest -UseBasicParsing -Method Post -Uri "$ApiBase/whatsapp/preview" -ContentType 'application/json' -Body $body
  if ($res.StatusCode -ne 200) { Fail "/whatsapp/preview $text => $($res.StatusCode)" }
  (($res.Content | ConvertFrom-Json).messages)
}

# 1) Add first product by sku (take from /products)
$p = Invoke-WebRequest -UseBasicParsing -Method Get -Uri "$ApiBase/products?page=1&pageSize=1"
if ($p.StatusCode -ne 200) { Fail "/products failed" }
$sku = ((($p.Content | ConvertFrom-Json).items)[0].sku)
if (-not $sku) { Fail "No SKU found from /products" }
Invoke-Preview "add $sku" | Out-Null
Ok "add $sku"

# 2) View cart
Invoke-Preview 'cart' | Out-Null
Ok "cart view ok"

# 3) Update qty to 2
Invoke-Preview "qty $sku 2" | Out-Null
Ok "qty $sku 2"

# 4) Remove item
Invoke-Preview "remove $sku" | Out-Null
Ok "remove $sku"

Write-Host "WA cart preview tests PASSED." -ForegroundColor Green

