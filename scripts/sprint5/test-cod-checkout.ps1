<#
.SYNOPSIS
  COD checkout flow: add item, init checkout COD, verify order status.

.PARAMETER ApiBase
  API base URL

.EXAMPLE
  pwsh scripts/sprint5/test-cod-checkout.ps1 -ApiBase http://localhost:3001
#>

param(
  [Parameter(Mandatory = $true)][string]$ApiBase
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function New-HttpClient { [System.Net.Http.HttpClient]::new() }
function New-JsonContent([string]$s) { New-Object System.Net.Http.StringContent($s, [Text.Encoding]::UTF8, 'application/json') }
function Ok([string]$msg) { Write-Host "+ $msg" -ForegroundColor Green }
function Fail([string]$msg) { Write-Host "x $msg" -ForegroundColor Red }

if ($ApiBase.EndsWith('/')) { $ApiBase = $ApiBase.TrimEnd('/') }
$client = New-HttpClient
$fails = 0

try {
  $null = $client.PostAsync("$ApiBase/cart", $null).GetAwaiter().GetResult()
  $pr = $client.GetAsync("$ApiBase/products?page=1&pageSize=1").GetAwaiter().GetResult()
  if (-not $pr.IsSuccessStatusCode) { throw "/products failed: $([int]$pr.StatusCode)" }
  $prod = ($pr.Content.ReadAsStringAsync().Result | ConvertFrom-Json).items[0]
  $add = $client.PostAsync("$ApiBase/cart/items", (New-JsonContent (@{ productId = $prod.id; qty = 1 } | ConvertTo-Json))).GetAwaiter().GetResult()
  if (-not $add.IsSuccessStatusCode) { throw "add to cart failed: $([int]$add.StatusCode)" }
  Ok "Item added"

  $idem = [Guid]::NewGuid().ToString('n')
  $req = New-Object System.Net.Http.HttpRequestMessage 'Post', "$ApiBase/checkout/init"
  $req.Headers.Add('Idempotency-Key', $idem)
  $req.Content = New-JsonContent ((@{ method = 'cod' } | ConvertTo-Json))
  $res = $client.SendAsync($req).GetAwaiter().GetResult()
  if (-not $res.IsSuccessStatusCode) { throw "checkout init failed: $([int]$res.StatusCode)" }
  $json = $res.Content.ReadAsStringAsync().Result | ConvertFrom-Json
  $orderId = $json.orderId
  if (-not $orderId) { throw "missing orderId" }
  Ok "Order created: $orderId"

  $og = $client.GetAsync("$ApiBase/orders/$orderId").GetAwaiter().GetResult()
  if (-not $og.IsSuccessStatusCode) { throw "get order failed: $([int]$og.StatusCode)" }
  $order = ($og.Content.ReadAsStringAsync().Result | ConvertFrom-Json).order
  if ($order.status -notin @('pending_cod','pending')) { $fails++; Fail "Unexpected order status: $($order.status)" } else { Ok "Order status ok ($($order.status))" }
} catch { $fails++; Fail $_ } finally { $client.Dispose() }

if ($fails -gt 0) { Write-Host "COD checkout test FAILED" -ForegroundColor Red; exit 1 } else { Write-Host "COD checkout test PASSED" -ForegroundColor Green }

