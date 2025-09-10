<#
.SYNOPSIS
  Sprint 2 API smoke tests: products, categories, catalog health/sync.

.DESCRIPTION
  Verifies:
   1) /catalog/health returns ok with counts
   2) /products returns paging shape; query params work
   3) /products/:id returns product when at least one item exists
   4) /categories returns ok with array
   5) (Optional) POST /catalog/sync succeeds when key provided

.PARAMETER ApiBase
  API base URL, e.g. https://<api-project>.vercel.app

.PARAMETER CatalogSyncKey
  Key for POST /catalog/sync (sent in X-Catalog-Sync-Key)

.PARAMETER ExpectData
  Assert that counts/products/categories are > 0 (otherwise warn).

.EXAMPLE
  pwsh -NoProfile -File scripts/sprint2-smoke.ps1 -ApiBase https://api.example.com -CatalogSyncKey '<KEY>' -ExpectData
#>

param(
  [Parameter(Mandatory = $true)][string]$ApiBase,
  [string]$CatalogSyncKey,
  [switch]$ExpectData
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
  # 1) Catalog health
  $h = $client.GetAsync("$ApiBase/catalog/health").GetAwaiter().GetResult()
  $hTxt = $h.Content.ReadAsStringAsync().Result
  if (-not $h.IsSuccessStatusCode) { $failCount++; Fail "/catalog/health status $([int]$h.StatusCode) $hTxt" }
  else {
    $hObj = $hTxt | ConvertFrom-Json
    if ($hObj.ok -ne $true) { $failCount++; Fail "/catalog/health ok=false" }
    else {
      $p = [int]$hObj.counts.products
      $c = [int]$hObj.counts.categories
      $m = [int]$hObj.counts.media
      Ok "/catalog/health ok (p=$p c=$c m=$m)"
      if ($ExpectData -and ($p -le 0 -or $c -le 0)) { $failCount++; Fail "Expected non-zero counts" }
      elseif (-not $ExpectData -and ($p -le 0 -or $c -le 0)) { Warn "Counts are zero — did you ingest the catalog?" }
    }
  }

  # 2) GET /products basic
  $pr = $client.GetAsync("$ApiBase/products").GetAwaiter().GetResult()
  $prTxt = $pr.Content.ReadAsStringAsync().Result
  if (-not $pr.IsSuccessStatusCode) { $failCount++; Fail "/products status $([int]$pr.StatusCode) $prTxt" }
  else {
    $prObj = $prTxt | ConvertFrom-Json
    if ($null -eq $prObj.items -or $null -eq $prObj.total) { $failCount++; Fail "/products response shape invalid" }
    else { Ok "/products ok (total=$($prObj.total))" }
  }

  # 3) GET /products with query (q & sort)
  $pr2 = $client.GetAsync("$ApiBase/products?q=test&sort=name&order=asc&page=1&pageSize=5").GetAwaiter().GetResult()
  if ($pr2.IsSuccessStatusCode) { Ok "/products query params accepted" } else { $failCount++; Fail "/products query status $([int]$pr2.StatusCode)" }

  # 4) GET /products/:id when available
  try {
    $obj = $prTxt | ConvertFrom-Json
    if ($obj.items.Count -gt 0) {
      $id = $obj.items[0].id
      $gd = $client.GetAsync("$ApiBase/products/$id").GetAwaiter().GetResult()
      $gdTxt = $gd.Content.ReadAsStringAsync().Result
      if ($gd.IsSuccessStatusCode -and ($gdTxt | ConvertFrom-Json).ok -eq $true) { Ok "/products/:id ok ($id)" } else { $failCount++; Fail "/products/:id failed: $([int]$gd.StatusCode) $gdTxt" }
    } else {
      Warn "No products to test /products/:id"
    }
  } catch {
    Warn "Could not parse /products response to fetch id"
  }

  # 5) GET /categories
  $cat = $client.GetAsync("$ApiBase/categories").GetAwaiter().GetResult()
  $catTxt = $cat.Content.ReadAsStringAsync().Result
  if (-not $cat.IsSuccessStatusCode) { $failCount++; Fail "/categories status $([int]$cat.StatusCode) $catTxt" }
  else {
    $catObj = $catTxt | ConvertFrom-Json
    if ($catObj.ok -ne $true -or $null -eq $catObj.categories) { $failCount++; Fail "/categories response invalid" }
    else { Ok "/categories ok (count=$($catObj.categories.Count))" }
  }

  # 6) Optional: POST /catalog/sync when key provided
  if ($CatalogSyncKey) {
    $req = New-Object System.Net.Http.HttpRequestMessage 'Post', "$ApiBase/catalog/sync"
    $req.Headers.Add('X-Catalog-Sync-Key', $CatalogSyncKey)
    $syncRes = $client.SendAsync($req).GetAwaiter().GetResult()
    $syncTxt = $syncRes.Content.ReadAsStringAsync().Result
    if ($syncRes.IsSuccessStatusCode -and ($syncTxt | ConvertFrom-Json).ok -eq $true) { Ok "/catalog/sync accepted" } else { $failCount++; Fail "/catalog/sync failed: $([int]$syncRes.StatusCode) $syncTxt" }
  } else {
    Warn "Skip /catalog/sync (no CatalogSyncKey provided)"
  }

} catch {
  $failCount++
  Fail $_
} finally {
  $client.Dispose()
}

if ($failCount -gt 0) {
  Write-Host "Sprint 2 smoke FAILED with $failCount error(s)." -ForegroundColor Red
  exit 1
} else {
  Write-Host "All Sprint 2 smoke tests PASSED." -ForegroundColor Green
}

