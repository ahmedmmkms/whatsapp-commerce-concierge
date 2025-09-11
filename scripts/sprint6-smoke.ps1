<#
.SYNOPSIS
  Sprint 6 smoke: create a COD order, verify order lookup and (if available) returns behavior.

.PARAMETER ApiBase
  API base URL, e.g. http://localhost:3001 or https://<api>.vercel.app

.EXAMPLE
  pwsh scripts/sprint6-smoke.ps1 -ApiBase http://localhost:3001
#>

param(
  [Parameter(Mandatory = $true)][string]$ApiBase
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

  # COD init to get an order
  $idem = [Guid]::NewGuid().ToString('n')
  $req = New-Object System.Net.Http.HttpRequestMessage 'Post', "$ApiBase/checkout/init"
  $req.Headers.Add('Idempotency-Key', $idem)
  $req.Content = New-JsonContent ((@{ method = 'cod' } | ConvertTo-Json))
  $res = $client.SendAsync($req).GetAwaiter().GetResult()
  if (-not $res.IsSuccessStatusCode) { throw "checkout init (COD) failed: $([int]$res.StatusCode)" }
  $cod = $res.Content.ReadAsStringAsync().Result | ConvertFrom-Json
  $orderId = $cod.orderId
  if (-not $orderId) { throw "missing orderId in COD response" }
  Ok "COD checkout initiated (order $orderId)"

  # Verify order by id
  $og = $client.GetAsync("$ApiBase/orders/$orderId").GetAwaiter().GetResult()
  if ($og.IsSuccessStatusCode) {
    $order = ($og.Content.ReadAsStringAsync().Result | ConvertFrom-Json).order
    if (-not $order) { Fail "order payload missing"; $fail++ } else { Ok "Order lookup by id OK (status $($order.status))" }
  } else {
    Info "GET /orders/:id not available (status $([int]$og.StatusCode))."
  }

  # Try a minimal returns create (if endpoint exists)
  $rt = $client.PostAsync("$ApiBase/returns", (New-JsonContent (@{ orderId = $orderId; reason = 'test_smoke' } | ConvertTo-Json))).GetAwaiter().GetResult()
  if ($rt.StatusCode -eq 404) {
    Info "POST /returns not implemented yet (404)."
  } elseif ($rt.IsSuccessStatusCode) {
    $ret = $rt.Content.ReadAsStringAsync().Result | ConvertFrom-Json
    if ($ret.ok -and $ret.id) { Ok "Return created (id $($ret.id))" }
    elseif (-not $ret.ok -and ($ret.error -eq 'existing_open_return' -or $ret.error -eq 'not_eligible')) { Info "Return not created ($($ret.error))" }
    else { Info "Return create responded: $($rt.Content.ReadAsStringAsync().Result)" }
  } else {
    Info "Returns create responded $([int]$rt.StatusCode) (acceptable if not ready)."
  }

} catch {
  $fail++
  Fail $_
} finally {
  $client.Dispose()
}

if ($fail -gt 0) { Write-Host "Sprint 6 smoke FAILED with $fail error(s)." -ForegroundColor Red; exit 1 } else { Write-Host "Sprint 6 smoke PASSED." -ForegroundColor Green }
