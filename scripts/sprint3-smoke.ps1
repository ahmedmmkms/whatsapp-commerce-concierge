<#
.SYNOPSIS
  Sprint 3 API smoke tests: cart lifecycle and shipping estimate.

.DESCRIPTION
  Verifies (once /cart endpoints land):
   1) POST /cart creates or returns an active cart
   2) GET /products returns at least one product (for add-to-cart)
   3) POST /cart/items adds an item (idempotency optional)
   4) GET /cart returns items and totals
   5) PATCH /cart/items/:itemId updates quantity
   6) DELETE /cart/items/:itemId removes the item
   7) GET /cart/estimate-shipping returns a stubbed estimate

.PARAMETER ApiBase
  API base URL, e.g. https://<api-project>.vercel.app

.PARAMETER IdempotencyKey
  Optional Idempotency-Key header value to test safe retries on add.

.PARAMETER SkipEstimate
  Skip shipping estimate check.

.EXAMPLE
  pwsh -NoProfile -File scripts/sprint3-smoke.ps1 -ApiBase https://api.example.com -IdempotencyKey test-key
#>

param(
  [Parameter(Mandatory = $true)][string]$ApiBase,
  [string]$IdempotencyKey,
  [switch]$SkipEstimate
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function New-HttpClient { [System.Net.Http.HttpClient]::new() }
function New-JsonContent([string]$s) { New-Object System.Net.Http.StringContent($s, [Text.Encoding]::UTF8, 'application/json') }
function Ok([string]$msg) { Write-Host "+ $msg" -ForegroundColor Green }
function Warn([string]$msg) { Write-Host "~ $msg" -ForegroundColor Yellow }
function Fail([string]$msg) { Write-Host "x $msg" -ForegroundColor Red }

if ($ApiBase.EndsWith('/')) { $ApiBase = $ApiBase.TrimEnd('/') }
$client = New-HttpClient
$failCount = 0

try {
  # 1) Create or fetch cart
  $cartReq = New-Object System.Net.Http.HttpRequestMessage 'Post', "$ApiBase/cart"
  $cartRes = $client.SendAsync($cartReq).GetAwaiter().GetResult()
  $cartTxt = $cartRes.Content.ReadAsStringAsync().Result
  if (-not $cartRes.IsSuccessStatusCode) { $failCount++; Fail "/cart POST status $([int]$cartRes.StatusCode) $cartTxt" }
  else {
    $cartObj = $cartTxt | ConvertFrom-Json
    $cartId = $cartObj.cart.id
    if (-not $cartObj.ok -or -not $cartId) { $failCount++; Fail "/cart POST response invalid" } else { Ok "/cart created ($cartId)" }
  }

  # 2) Pick a product to add
  $pr = $client.GetAsync("$ApiBase/products?page=1&pageSize=1").GetAwaiter().GetResult()
  $prTxt = $pr.Content.ReadAsStringAsync().Result
  if (-not $pr.IsSuccessStatusCode) { $failCount++; Fail "/products status $([int]$pr.StatusCode) $prTxt" }
  else {
    $prObj = $prTxt | ConvertFrom-Json
    if ($prObj.items.Count -lt 1) { $failCount++; Fail "No products available to add to cart" }
    else { $productId = $prObj.items[0].id; Ok "product chosen ($productId)" }
  }

  # 3) Add item to cart
  $addReq = New-Object System.Net.Http.HttpRequestMessage 'Post', "$ApiBase/cart/items"
  $addBody = @{ productId = $productId; qty = 1 } | ConvertTo-Json -Depth 5
  $addReq.Content = New-JsonContent $addBody
  if ($IdempotencyKey) { $addReq.Headers.Add('Idempotency-Key', $IdempotencyKey) }
  $addRes = $client.SendAsync($addReq).GetAwaiter().GetResult()
  $addTxt = $addRes.Content.ReadAsStringAsync().Result
  if (-not $addRes.IsSuccessStatusCode) { $failCount++; Fail "/cart/items POST status $([int]$addRes.StatusCode) $addTxt" }
  else { $addObj = $addTxt | ConvertFrom-Json; $itemId = $addObj.item.id; if ($itemId) { Ok "item added ($itemId)" } else { $failCount++; Fail "/cart/items response invalid" } }

  # 4) View cart
  $getCart = $client.GetAsync("$ApiBase/cart").GetAwaiter().GetResult()
  $gcTxt = $getCart.Content.ReadAsStringAsync().Result
  if (-not $getCart.IsSuccessStatusCode) { $failCount++; Fail "/cart GET status $([int]$getCart.StatusCode) $gcTxt" }
  else { $gcObj = $gcTxt | ConvertFrom-Json; if ($gcObj.cart.items.Count -ge 1) { Ok "/cart GET ok (items=$($gcObj.cart.items.Count))" } else { $failCount++; Fail "cart items missing" } }

  # 5) Update qty
  if ($itemId) {
    $patchReq = New-Object System.Net.Http.HttpRequestMessage 'Patch', "$ApiBase/cart/items/$itemId"
    $patchReq.Content = New-JsonContent (@{ qty = 2 } | ConvertTo-Json)
    $patchRes = $client.SendAsync($patchReq).GetAwaiter().GetResult()
    if ($patchRes.IsSuccessStatusCode) { Ok "/cart/items PATCH ok (qty=2)" } else { $failCount++; Fail "/cart/items PATCH status $([int]$patchRes.StatusCode)" }
  }

  # 6) Delete item
  if ($itemId) {
    $delRes = $client.DeleteAsync("$ApiBase/cart/items/$itemId").GetAwaiter().GetResult()
    if ($delRes.IsSuccessStatusCode) { Ok "/cart/items DELETE ok" } else { $failCount++; Fail "/cart/items DELETE status $([int]$delRes.StatusCode)" }
  }

  # 7) Estimate shipping (optional)
  if (-not $SkipEstimate) {
    $est = $client.GetAsync("$ApiBase/cart/estimate-shipping").GetAwaiter().GetResult()
    $estTxt = $est.Content.ReadAsStringAsync().Result
    if ($est.IsSuccessStatusCode) { Ok "/cart/estimate-shipping ok" } else { $failCount++; Fail "/cart/estimate-shipping status $([int]$est.StatusCode) $estTxt" }
  } else { Warn "Skip shipping estimate" }

} catch {
  $failCount++
  Fail $_
} finally {
  $client.Dispose()
}

if ($failCount -gt 0) {
  Write-Host "Sprint 3 smoke FAILED with $failCount error(s)." -ForegroundColor Red
  exit 1
} else {
  Write-Host "All Sprint 3 smoke tests PASSED." -ForegroundColor Green
}

