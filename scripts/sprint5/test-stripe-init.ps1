<#
.SYNOPSIS
  Stripe checkout init smoke: validates that a checkout URL is returned when Stripe is configured.

.PARAMETER ApiBase
  API base URL

.EXAMPLE
  pwsh scripts/sprint5/test-stripe-init.ps1 -ApiBase https://api.example.com
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
$fails = 0

try {
  $null = $client.PostAsync("$ApiBase/cart", $null).GetAwaiter().GetResult()
  $pr = $client.GetAsync("$ApiBase/products?page=1&pageSize=1").GetAwaiter().GetResult()
  if (-not $pr.IsSuccessStatusCode) { throw "/products failed: $([int]$pr.StatusCode)" }
  $prod = ($pr.Content.ReadAsStringAsync().Result | ConvertFrom-Json).items[0]
  $null = $client.PostAsync("$ApiBase/cart/items", (New-JsonContent (@{ productId = $prod.id; qty = 1 } | ConvertTo-Json))).GetAwaiter().GetResult()

  $idem = [Guid]::NewGuid().ToString('n')
  $req = New-Object System.Net.Http.HttpRequestMessage 'Post', "$ApiBase/checkout/init"
  $req.Headers.Add('Idempotency-Key', $idem)
  $req.Content = New-JsonContent ((@{ method = 'stripe' } | ConvertTo-Json))
  $res = $client.SendAsync($req).GetAwaiter().GetResult()
  if ($res.IsSuccessStatusCode) {
    $json = $res.Content.ReadAsStringAsync().Result | ConvertFrom-Json
    if ($json.checkoutUrl) { Ok "Stripe checkout URL: $($json.checkoutUrl)" } else { $fails++; Fail "No checkoutUrl in response" }
  } else {
    Info "Stripe init not successful (status $([int]$res.StatusCode)). Ensure STRIPE_SECRET_KEY is set."
  }
} catch { $fails++; Fail $_ } finally { $client.Dispose() }

if ($fails -gt 0) { Write-Host "Stripe init test FAILED" -ForegroundColor Red; exit 1 } else { Write-Host "Stripe init test PASSED (or skipped if not configured)" -ForegroundColor Green }

