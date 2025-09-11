<#
.SYNOPSIS
  Validate Orders lookup by id and phone (if implemented).

.PARAMETER ApiBase
  API base URL.
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
  # Create an order via COD to obtain orderId
  $null = $client.PostAsync("$ApiBase/cart", $null).GetAwaiter().GetResult()
  $p = $client.GetAsync("$ApiBase/products?page=1&pageSize=1").GetAwaiter().GetResult()
  if (-not $p.IsSuccessStatusCode) { throw "/products failed: $([int]$p.StatusCode)" }
  $prod = ($p.Content.ReadAsStringAsync().Result | ConvertFrom-Json).items[0]
  $null = $client.PostAsync("$ApiBase/cart/items", (New-JsonContent (@{ productId = $prod.id; qty = 1 } | ConvertTo-Json))).GetAwaiter().GetResult()
  $idem = [Guid]::NewGuid().ToString('n')
  $req = New-Object System.Net.Http.HttpRequestMessage 'Post', "$ApiBase/checkout/init"
  $req.Headers.Add('Idempotency-Key', $idem)
  $req.Content = New-JsonContent ((@{ method = 'cod' } | ConvertTo-Json))
  $res = $client.SendAsync($req).GetAwaiter().GetResult()
  if (-not $res.IsSuccessStatusCode) { throw "checkout init failed: $([int]$res.StatusCode)" }
  $cod = $res.Content.ReadAsStringAsync().Result | ConvertFrom-Json
  $orderId = $cod.orderId
  if (-not $orderId) { throw "missing orderId" }

  # Lookup by id
  $og = $client.GetAsync("$ApiBase/orders/$orderId").GetAwaiter().GetResult()
  if ($og.IsSuccessStatusCode) {
    $order = ($og.Content.ReadAsStringAsync().Result | ConvertFrom-Json).order
    if (-not $order.id) { Fail "order payload missing id"; $fail++ } else { Ok "Order lookup by id OK" }
  } else { Fail "GET /orders/:id $([int]$og.StatusCode)"; $fail++ }

  # Optional: by phone query (should be rate-limited and redacted). We cannot know phone here; expect 400 or 200.
  $qp = $client.GetAsync("$ApiBase/orders?phone=+10000000000").GetAwaiter().GetResult()
  if ($qp.StatusCode -eq 404) { Info "GET /orders?phone not implemented yet (404)" }
  elseif ($qp.IsSuccessStatusCode) { Ok "Order lookup by phone available" }
  else { Info "GET /orders?phone returned $([int]$qp.StatusCode) (acceptable if not ready)" }

} catch {
  $fail++
  Fail $_
} finally {
  $client.Dispose()
}

if ($fail -gt 0) { Write-Host "Orders lookup test FAILED with $fail error(s)." -ForegroundColor Red; exit 1 } else { Write-Host "Orders lookup test PASSED." -ForegroundColor Green }

