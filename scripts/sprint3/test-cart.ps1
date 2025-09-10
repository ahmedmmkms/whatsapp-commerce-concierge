<#
.SYNOPSIS
  Focused cart CRUD + idempotency tests for Sprint 3.

.DESCRIPTION
  Runs a precise set of assertions against /cart and /cart/items.

.PARAMETER ApiBase
  API base URL, e.g. https://<api-project>.vercel.app

.PARAMETER IdempotencyKey
  Idempotency-Key value to use for the first add request.

.PARAMETER ProductId
  Optional productId to add (if not supplied, picks first product).

.EXAMPLE
  pwsh scripts/sprint3/test-cart.ps1 -ApiBase https://api.example.com -IdempotencyKey demo-1
#>

param(
  [Parameter(Mandatory = $true)][string]$ApiBase,
  [Parameter(Mandatory = $true)][string]$IdempotencyKey,
  [string]$ProductId
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function New-HttpClient { [System.Net.Http.HttpClient]::new() }
function New-JsonContent([string]$s) { New-Object System.Net.Http.StringContent($s, [Text.Encoding]::UTF8, 'application/json') }
function Ok([string]$msg) { Write-Host "+ $msg" -ForegroundColor Green }
function Fail([string]$msg) { Write-Host "x $msg" -ForegroundColor Red }

if ($ApiBase.EndsWith('/')) { $ApiBase = $ApiBase.TrimEnd('/') }
$client = New-HttpClient
$failCount = 0

try {
  # Ensure cart exists
  $cRes = $client.PostAsync("$ApiBase/cart", $null).GetAwaiter().GetResult()
  if (-not $cRes.IsSuccessStatusCode) { $failCount++; Fail "/cart POST status $([int]$cRes.StatusCode)" }

  # Resolve product
  if (-not $ProductId) {
    $pr = $client.GetAsync("$ApiBase/products?page=1&pageSize=1").GetAwaiter().GetResult()
    if (-not $pr.IsSuccessStatusCode) { $failCount++; Fail "/products status $([int]$pr.StatusCode)" } else { $ProductId = ( ($pr.Content.ReadAsStringAsync().Result | ConvertFrom-Json).items[0].id ) }
  }

  # Add with Idempotency-Key
  $req1 = New-Object System.Net.Http.HttpRequestMessage 'Post', "$ApiBase/cart/items"
  $req1.Headers.Add('Idempotency-Key', $IdempotencyKey)
  $req1.Content = New-JsonContent (@{ productId = $ProductId; qty = 1 } | ConvertTo-Json)
  $res1 = $client.SendAsync($req1).GetAwaiter().GetResult()
  if (-not $res1.IsSuccessStatusCode) { $failCount++; Fail "First add failed: $([int]$res1.StatusCode)" }
  $itemId = (($res1.Content.ReadAsStringAsync().Result | ConvertFrom-Json).item.id)

  # Retry same request (should be idempotent, not duplicate)
  $req2 = New-Object System.Net.Http.HttpRequestMessage 'Post', "$ApiBase/cart/items"
  $req2.Headers.Add('Idempotency-Key', $IdempotencyKey)
  $req2.Content = New-JsonContent (@{ productId = $ProductId; qty = 1 } | ConvertTo-Json)
  $res2 = $client.SendAsync($req2).GetAwaiter().GetResult()
  if (-not $res2.IsSuccessStatusCode) { $failCount++; Fail "Retry add failed: $([int]$res2.StatusCode)" }

  # Validate single item present and qty=1
  $gc = $client.GetAsync("$ApiBase/cart").GetAwaiter().GetResult()
  if (-not $gc.IsSuccessStatusCode) { $failCount++; Fail "/cart GET status $([int]$gc.StatusCode)" }
  else {
    $cart = $gc.Content.ReadAsStringAsync().Result | ConvertFrom-Json
    $items = $cart.cart.items
    if ($items.Count -ne 1) { $failCount++; Fail "Expected 1 item, found $($items.Count)" }
    elseif ($items[0].qty -ne 1) { $failCount++; Fail "Expected qty=1, found $($items[0].qty)" } else { Ok "Idempotent add verified (no duplicate, qty=1)" }
  }

  # Cleanup: delete item
  if ($itemId) { $del = $client.DeleteAsync("$ApiBase/cart/items/$itemId").GetAwaiter().GetResult(); if (-not $del.IsSuccessStatusCode) { $failCount++; Fail "Cleanup delete failed: $([int]$del.StatusCode)" } }

} catch {
  $failCount++
  Fail $_
} finally {
  $client.Dispose()
}

if ($failCount -gt 0) { Write-Host "Cart tests FAILED with $failCount error(s)." -ForegroundColor Red; exit 1 } else { Write-Host "Cart tests PASSED." -ForegroundColor Green }

