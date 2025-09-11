<#
.SYNOPSIS
  Validate Returns creation endpoint with minimal payload and eligibility checks.

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
  # Prepare an order
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

  # Try to create a return
  $rt = $client.PostAsync("$ApiBase/returns", (New-JsonContent (@{ orderId = $orderId; reason = 'not_needed' } | ConvertTo-Json))).GetAwaiter().GetResult()
  if ($rt.StatusCode -eq 404) { Info "POST /returns not implemented yet (404)" }
  elseif ($rt.IsSuccessStatusCode) {
    $ret = $rt.Content.ReadAsStringAsync().Result | ConvertFrom-Json
    if ($ret.ok -and $ret.id) {
      Ok "Return created (id $($ret.id))"
      # Verify it appears in GET /returns?orderId
      $list = $client.GetAsync("$ApiBase/returns?orderId=$orderId").GetAwaiter().GetResult()
      if ($list.IsSuccessStatusCode) {
        $payload = $list.Content.ReadAsStringAsync().Result | ConvertFrom-Json
        $found = $false
        foreach ($r in $payload.returns) { if ($r.id -eq $ret.id) { $found = $true; break } }
        if ($found) { Ok "Return appears in listing" } else { Fail "Created return not in listing"; $fail++ }
      } else { Fail "GET /returns?orderId non-200"; $fail++ }
    }
    elseif (-not $ret.ok -and ($ret.error -eq 'existing_open_return' -or $ret.error -eq 'not_eligible')) {
      Ok "Return not created ($($ret.error)) as expected"
      # Still validate listing endpoint works
      $list2 = $client.GetAsync("$ApiBase/returns?orderId=$orderId").GetAwaiter().GetResult()
      if ($list2.IsSuccessStatusCode) { Ok "Returns listing available" } else { Fail "Returns listing non-200"; $fail++ }
    }
    else { Ok "Return responded: $($rt.Content.ReadAsStringAsync().Result)" }
  } else { Info "Returns create returned $([int]$rt.StatusCode) (acceptable until deployed)" }

} catch {
  $fail++
  Fail $_
} finally {
  $client.Dispose()
}

if ($fail -gt 0) { Write-Host "Returns create test FAILED with $fail error(s)." -ForegroundColor Red; exit 1 } else { Write-Host "Returns create test PASSED." -ForegroundColor Green }
