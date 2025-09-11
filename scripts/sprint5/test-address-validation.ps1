<#
.SYNOPSIS
  Validates address DTO enforcement for checkout init (expects 400 on missing required fields).

.PARAMETER ApiBase
  API base URL

.EXAMPLE
  pwsh scripts/sprint5/test-address-validation.ps1 -ApiBase http://localhost:3001
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
  # Ensure cart exists
  $null = $client.PostAsync("$ApiBase/cart", $null).GetAwaiter().GetResult()

  $idem = [Guid]::NewGuid().ToString('n')
  $req = New-Object System.Net.Http.HttpRequestMessage 'Post', "$ApiBase/checkout/init"
  $req.Headers.Add('Idempotency-Key', $idem)
  $payload = @{ method = 'cod'; address = @{ name='A'; city=''; country=''; line1='' } } | ConvertTo-Json
  $req.Content = New-JsonContent $payload
  $res = $client.SendAsync($req).GetAwaiter().GetResult()
  if ([int]$res.StatusCode -eq 400) { Ok "Validation error returned as expected (400)" }
  else { $fails++; Fail "Expected 400, got $([int]$res.StatusCode)" }
} catch { $fails++; Fail $_ } finally { $client.Dispose() }

if ($fails -gt 0) { Write-Host "Address validation test FAILED" -ForegroundColor Red; exit 1 } else { Write-Host "Address validation test PASSED" -ForegroundColor Green }

