<#
.SYNOPSIS
  Sprint 5 smoke: COD checkout and optional Stripe init.

.PARAMETER ApiBase
  API base URL, e.g. http://localhost:3001 or https://<api>.vercel.app

.PARAMETER DoStripe
  Include Stripe init check (expects STRIPE configured to pass).

.EXAMPLE
  pwsh scripts/sprint5-smoke.ps1 -ApiBase http://localhost:3001 -DoStripe
#>

param(
  [Parameter(Mandatory = $true)][string]$ApiBase,
  [switch]$DoStripe
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
  # Ensure cart and pick first product
  $null = $client.PostAsync("$ApiBase/cart", $null).GetAwaiter().GetResult()
  $pr = $client.GetAsync("$ApiBase/products?page=1&pageSize=1").GetAwaiter().GetResult()
  if (-not $pr.IsSuccessStatusCode) { throw "/products failed: $([int]$pr.StatusCode)" }
  $prod = ($pr.Content.ReadAsStringAsync().Result | ConvertFrom-Json).items[0]
  if (-not $prod) { throw "no products available" }
  $add = $client.PostAsync("$ApiBase/cart/items", (New-JsonContent (@{ productId = $prod.id; qty = 1 } | ConvertTo-Json))).GetAwaiter().GetResult()
  if (-not $add.IsSuccessStatusCode) { throw "add to cart failed: $([int]$add.StatusCode)" }
  Ok "Added product $($prod.id) to cart"

  # COD init
  $idem = [Guid]::NewGuid().ToString('n')
  $req = New-Object System.Net.Http.HttpRequestMessage 'Post', "$ApiBase/checkout/init"
  $req.Headers.Add('Idempotency-Key', $idem)
  $req.Content = New-JsonContent ((@{ method = 'cod' } | ConvertTo-Json))
  $res = $client.SendAsync($req).GetAwaiter().GetResult()
  if (-not $res.IsSuccessStatusCode) { throw "checkout init (COD) failed: $([int]$res.StatusCode)" }
  $cod = $res.Content.ReadAsStringAsync().Result | ConvertFrom-Json
  if (-not $cod.ok) { throw "COD response not ok" }
  $orderId = $cod.orderId
  if (-not $orderId) { throw "missing orderId in COD response" }
  Ok "COD checkout initiated (order $orderId)"

  # Verify order status
  $og = $client.GetAsync("$ApiBase/orders/$orderId").GetAwaiter().GetResult()
  if (-not $og.IsSuccessStatusCode) { throw "get order failed: $([int]$og.StatusCode)" }
  $order = ($og.Content.ReadAsStringAsync().Result | ConvertFrom-Json).order
  if ($order.status -ne 'pending_cod' -and $order.status -ne 'pending') { Fail "Unexpected order status: $($order.status)"; $fail++ } else { Ok "Order status OK: $($order.status)" }

  if ($DoStripe) {
    $idem2 = [Guid]::NewGuid().ToString('n')
    $req2 = New-Object System.Net.Http.HttpRequestMessage 'Post', "$ApiBase/checkout/init"
    $req2.Headers.Add('Idempotency-Key', $idem2)
    $req2.Content = New-JsonContent ((@{ method = 'stripe' } | ConvertTo-Json))
    $res2 = $client.SendAsync($req2).GetAwaiter().GetResult()
    if ($res2.IsSuccessStatusCode) {
      $st = $res2.Content.ReadAsStringAsync().Result | ConvertFrom-Json
      if ($st.checkoutUrl) { Ok "Stripe checkout URL received: $($st.checkoutUrl)" } else { Fail "Stripe init succeeded but no checkoutUrl"; $fail++ }
    } else {
      Info "Stripe init not successful (status $([int]$res2.StatusCode)). Ensure STRIPE env is configured if required."
    }
  }

} catch {
  $fail++
  Fail $_
} finally {
  $client.Dispose()
}

if ($fail -gt 0) { Write-Host "Sprint 5 smoke FAILED with $fail error(s)." -ForegroundColor Red; exit 1 } else { Write-Host "Sprint 5 smoke PASSED." -ForegroundColor Green }

