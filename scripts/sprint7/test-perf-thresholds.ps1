<#
.SYNOPSIS
  Simple perf thresholds: measure median/P95 over N sequential requests per route.

.PARAMETER ApiBase
  API base URL.

.PARAMETER Iterations
  Number of requests per route (default 20).

.PARAMETER P95Products
  P95 threshold for /products in ms (default 200).

.PARAMETER P95Cart
  P95 threshold for /cart ops in ms (default 200).

.PARAMETER P95CheckoutInit
  P95 threshold for /checkout/init in ms (default 250).
#>

param(
  [Parameter(Mandatory = $true)][string]$ApiBase,
  [int]$Iterations = 20,
  [int]$P95Products = 200,
  [int]$P95Cart = 200,
  [int]$P95CheckoutInit = 250
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function New-HttpClient { [System.Net.Http.HttpClient]::new() }
function New-JsonContent([string]$s) { New-Object System.Net.Http.StringContent($s, [Text.Encoding]::UTF8, 'application/json') }
function p95($arr) { $sorted = $arr | Sort-Object; $idx = [Math]::Ceiling($sorted.Count * 0.95) - 1; if ($idx -lt 0) { $idx = 0 }; return [int]$sorted[$idx] }
function measure([ScriptBlock]$action) { $sw = [System.Diagnostics.Stopwatch]::StartNew(); & $action; $sw.Stop(); return [int]$sw.ElapsedMilliseconds }

if ($ApiBase.EndsWith('/')) { $ApiBase = $ApiBase.TrimEnd('/') }
$client = New-HttpClient

try {
  # Warmup
  $null = $client.GetAsync("$ApiBase/healthz").GetAwaiter().GetResult()

  # /products
  $p = @()
  for ($i=0; $i -lt $Iterations; $i++) {
    $ms = measure { $client.GetAsync("$ApiBase/products?page=1&pageSize=10").GetAwaiter().GetResult() | Out-Null }
    $p += $ms
  }
  $p95p = p95 $p
  Write-Host "Products P95: $p95p ms (threshold $P95Products)"
  if ($p95p -gt $P95Products) { throw "/products P95 $p95p > $P95Products" }

  # Cart create + add item
  $c = @()
  for ($i=0; $i -lt $Iterations; $i++) {
    $ms = measure {
      $null = $client.PostAsync("$ApiBase/cart", $null).GetAwaiter().GetResult()
    }
    $c += $ms
  }
  $p95c = p95 $c
  Write-Host "Cart P95: $p95c ms (threshold $P95Cart)"
  if ($p95c -gt $P95Cart) { throw "/cart P95 $p95c > $P95Cart" }

  # Checkout init COD
  $co = @()
  for ($i=0; $i -lt $Iterations; $i++) {
    $idem = [Guid]::NewGuid().ToString('n')
    $req = New-Object System.Net.Http.HttpRequestMessage 'Post', "$ApiBase/checkout/init"
    $req.Headers.Add('Idempotency-Key', $idem)
    $req.Content = New-JsonContent ((@{ method = 'cod' } | ConvertTo-Json))
    $ms = measure { $client.SendAsync($req).GetAwaiter().GetResult() | Out-Null }
    $co += $ms
  }
  $p95co = p95 $co
  Write-Host "Checkout init P95: $p95co ms (threshold $P95CheckoutInit)"
  if ($p95co -gt $P95CheckoutInit) { throw "/checkout/init P95 $p95co > $P95CheckoutInit" }

  Write-Host "Perf thresholds PASSED" -ForegroundColor Green
} finally {
  $client.Dispose()
}

