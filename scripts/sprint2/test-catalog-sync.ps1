param(
  [Parameter(Mandatory = $true)][string]$ApiBase,
  [Parameter(Mandatory = $true)][string]$CatalogSyncKey
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
function Ok([string]$m){ Write-Host "+ $m" -ForegroundColor Green }
function Fail([string]$m){ Write-Host "x $m" -ForegroundColor Red; exit 1 }

if ($ApiBase.EndsWith('/')) { $ApiBase = $ApiBase.TrimEnd('/') }
$req = [System.Net.Http.HttpRequestMessage]::new([System.Net.Http.HttpMethod]::Post, "$ApiBase/catalog/sync")
$req.Headers.Add('X-Catalog-Sync-Key', $CatalogSyncKey)
$client = [System.Net.Http.HttpClient]::new()
try {
  $res = $client.SendAsync($req).GetAwaiter().GetResult()
  $txt = $res.Content.ReadAsStringAsync().Result
  if (-not $res.IsSuccessStatusCode) { Fail "/catalog/sync status $([int]$res.StatusCode) $txt" }
  $obj = $txt | ConvertFrom-Json
  if ($obj.ok -ne $true -or $obj.scheduled -ne $true) { Fail "/catalog/sync did not return ok" }
  Ok "/catalog/sync accepted"
} finally {
  $client.Dispose()
}
