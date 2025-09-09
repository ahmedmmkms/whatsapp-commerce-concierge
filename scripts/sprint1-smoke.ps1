<#
.SYNOPSIS
  End-to-end Sprint 1 smoke tests against a deployed API (Vercel).

.DESCRIPTION
  Verifies:
   1) /healthz 200 and request id
   2) CORS header for your web origin
   3) WhatsApp GET verify echoes hub.challenge
   4) WhatsApp POST ingest (signed or unsigned) returns {status:'received'} with count
   5) Consent API POST/GET roundtrip
   6) Queue health (optional): /queue/health returns 200 or clear 503

.PARAMETER ApiBase
  API base URL, e.g. https://<api-project>.vercel.app

.PARAMETER WebOrigin
  Your web origin to validate CORS, e.g. https://<web-project>.vercel.app

.PARAMETER VerifyToken
  The exact verify token configured in Vercel (WHATSAPP_VERIFY_TOKEN)

.PARAMETER WaAppSecret
  WhatsApp App Secret for signing webhook POST. Use -SkipSignature to omit.

.PARAMETER TestPhone
  Phone (E.164) used in test payloads and consent. Default: 15551234567

.PARAMETER SkipSignature
  Skip X-Hub-Signature-256 header (only if API does not enforce signature)

.PARAMETER SkipQueue
  Skip /queue/health test

.EXAMPLE
  pwsh -NoProfile -File scripts/sprint1-smoke.ps1 `
    -ApiBase https://whatsapp-commerce-concierge-api.vercel.app `
    -WebOrigin https://whatsapp-commerce-concierge-web.vercel.app `
    -VerifyToken wa_token_123 `
    -WaAppSecret '<APP_SECRET>'
#>

param(
  [Parameter(Mandatory = $true)][string]$ApiBase,
  [Parameter(Mandatory = $true)][string]$WebOrigin,
  [Parameter(Mandatory = $true)][string]$VerifyToken,
  [string]$WaAppSecret,
  [string]$TestPhone = '15551791554',
  [switch]$SkipSignature,
  [switch]$SkipQueue
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function New-HttpClient { [System.Net.Http.HttpClient]::new() }
function New-JsonContent([string]$s) { New-Object System.Net.Http.StringContent($s, [Text.Encoding]::UTF8, 'application/json') }
function Compute-HmacSha256([string]$secret, [string]$body) {
  $key = [Text.Encoding]::UTF8.GetBytes($secret)
  $h = [System.Security.Cryptography.HMACSHA256]::new($key)
  $hex = -join ($h.ComputeHash([Text.Encoding]::UTF8.GetBytes($body)) | ForEach-Object { $_.ToString('x2') })
  "sha256=$hex"
}
function Ok([string]$msg) { Write-Host "+ $msg" -ForegroundColor Green }
function Warn([string]$msg) { Write-Host "~ $msg" -ForegroundColor Yellow }
function Fail([string]$msg) { Write-Host "x $msg" -ForegroundColor Red }

$client = New-HttpClient
$failCount = 0
try {
  if ($ApiBase.EndsWith('/')) { $ApiBase = $ApiBase.TrimEnd('/') }

  # 1) Health
  $u = "$ApiBase/healthz"
  $resp = $client.GetAsync($u).GetAwaiter().GetResult()
  $rid = ($resp.Headers.TryGetValues('x-request-id', [ref]([System.Collections.Generic.IEnumerable[string]]$null)))
  if ($resp.IsSuccessStatusCode) { Ok "healthz 200 (x-request-id present: $rid)" } else { $failCount++; Fail "healthz status $([int]$resp.StatusCode)" }

  # 2) CORS header for WebOrigin
  $req = New-Object System.Net.Http.HttpRequestMessage 'Get', $u
  $req.Headers.Add('Origin', $WebOrigin)
  $cresp = $client.SendAsync($req).GetAwaiter().GetResult()
  $allowed = if ($cresp.Headers.TryGetValues('Access-Control-Allow-Origin', [ref]([System.Collections.Generic.IEnumerable[string]]$null))) { $true } else { $false }
  if ($cresp.IsSuccessStatusCode -and $allowed) { Ok "CORS allows $WebOrigin" } else { $failCount++; Warn "CORS header missing or status $([int]$cresp.StatusCode)" }

  # 3) WhatsApp GET verify
  $verifyUrl = "$ApiBase/webhook/whatsapp?hub.mode=subscribe&hub.verify_token=$([Uri]::EscapeDataString($VerifyToken))&hub.challenge=123"
  $ver = $client.GetAsync($verifyUrl).GetAwaiter().GetResult()
  $txt = $ver.Content.ReadAsStringAsync().Result
  if ($ver.IsSuccessStatusCode -and $txt -eq '123') { Ok "GET verify echoed challenge" } else { $failCount++; Fail "GET verify failed: status $([int]$ver.StatusCode) body=$txt" }

  # 4) WhatsApp signed POST
  $body = '{"object":"whatsapp_business_account","entry":[{"changes":[{"value":{"messages":[{"from":"' + $TestPhone + '","id":"wamid.123","text":{"body":"hello"}}]}}]}]}'
  $post = New-Object System.Net.Http.HttpRequestMessage 'Post', "$ApiBase/webhook/whatsapp"
  $post.Content = (New-JsonContent $body)
  if (-not $SkipSignature) {
    if (-not $WaAppSecret) { throw 'WaAppSecret is required for signed POST; pass -SkipSignature to skip.' }
    $sig = Compute-HmacSha256 -secret $WaAppSecret -body $body
    $post.Headers.Add('X-Hub-Signature-256', $sig)
  }
  $pResp = $client.SendAsync($post).GetAwaiter().GetResult()
  $pTxt = $pResp.Content.ReadAsStringAsync().Result
  if ($pResp.IsSuccessStatusCode -and $pTxt -match '"status"\s*:\s*"received"') { Ok "POST webhook received (body: $pTxt)" } else { $failCount++; Fail "POST webhook failed: status $([int]$pResp.StatusCode) body=$pTxt" }

  # 5) Consent API roundtrip
  $consentBody = (@{ phone = $TestPhone; granted = $true; policyVersion = 'v1'; channel = 'whatsapp' } | ConvertTo-Json -Compress)
  $cReq = New-Object System.Net.Http.HttpRequestMessage 'Post', "$ApiBase/consents"
  $cReq.Content = (New-JsonContent $consentBody)
  $cRes = $client.SendAsync($cReq).GetAwaiter().GetResult()
  $cTxt = $cRes.Content.ReadAsStringAsync().Result
  if ($cRes.IsSuccessStatusCode -and $cTxt -match '"ok"\s*:\s*true') { Ok "POST /consents ok" } else { $failCount++; Fail "POST /consents failed: $([int]$cRes.StatusCode) $cTxt" }

  $gRes = $client.GetAsync("$ApiBase/consents/$TestPhone").GetAwaiter().GetResult()
  $gTxt = $gRes.Content.ReadAsStringAsync().Result
  if ($gRes.IsSuccessStatusCode -and $gTxt -match '"consents"\s*:\s*\[') { Ok "GET /consents/:phone ok" } else { $failCount++; Fail "GET /consents failed: $([int]$gRes.StatusCode) $gTxt" }

  # 6) Queue health (optional)
  if (-not $SkipQueue) {
    $qh = $client.GetAsync("$ApiBase/queue/health").GetAwaiter().GetResult()
    $qTxt = $qh.Content.ReadAsStringAsync().Result
    if ($qh.IsSuccessStatusCode) { Ok "queue/health ok ($qTxt)" }
    else { Warn "queue/health non-200 (expected if REDIS_URL unset or slow): $([int]$qh.StatusCode) $qTxt" }
  }

} catch {
  $failCount++
  Fail $_
} finally {
  $client.Dispose()
}

if ($failCount -gt 0) {
  Write-Host "Smoke FAILED with $failCount error(s)." -ForegroundColor Red
  exit 1
} else {
  Write-Host "All Sprint 1 smoke tests PASSED." -ForegroundColor Green
}

