<#
.SYNOPSIS
  Test WhatsApp webhook POST with HMAC signature from PowerShell.

.DESCRIPTION
  Builds a minimal WhatsApp Cloud-style JSON payload, computes X-Hub-Signature-256
  using your App Secret, and sends it to the deployed API webhook.

.PARAMETER Url
  The webhook URL, e.g. https://<api-project>.vercel.app/webhook/whatsapp

.PARAMETER Secret
  WhatsApp App Secret (used to compute the signature). If omitted and -SkipSignature is not set,
  the script will prompt. If your API does not enforce signatures, use -SkipSignature to send without.

.PARAMETER From
  Sender phone (international). Default: 15551234567

.PARAMETER Text
  Message body text. Default: "hello"

.PARAMETER MessageId
  Message id. Default: "wamid.123"

.PARAMETER BodyPath
  Optional path to a file containing the exact JSON body to send. When provided, the script
  will read the file (no newline added), compute signature over the string contents, and send it.

.PARAMETER SkipSignature
  Send request without X-Hub-Signature-256 header (useful if API does not enforce signature yet).

.EXAMPLE
  pwsh -NoProfile -File scripts/test-whatsapp-webhook.ps1 `
    -Url https://whatsapp-commerce-concierge-api.vercel.app/webhook/whatsapp `
    -Secret '<YOUR_WHATSAPP_APP_SECRET>' `
    -From 15551234567 `
    -Text 'hello from PS'

.EXAMPLE
  # Using a custom JSON body from file (must be valid JSON string)
  pwsh -NoProfile -File scripts/test-whatsapp-webhook.ps1 `
    -Url https://whatsapp-commerce-concierge-api.vercel.app/webhook/whatsapp `
    -Secret '<YOUR_WHATSAPP_APP_SECRET>' `
    -BodyPath ./sample-wa-body.json
#>

param(
  [Parameter(Mandatory = $true)]
  [string]$Url,

  [Parameter()]
  [string]$Secret,

  [Parameter()]
  [string]$From = '15551234567',

  [Parameter()]
  [string]$Text = 'hello',

  [Parameter()]
  [string]$MessageId = 'wamid.123',

  [Parameter()]
  [string]$BodyPath,

  [switch]$SkipSignature
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function New-BodyJson {
  param(
    [string]$From,
    [string]$Text,
    [string]$MessageId
  )
  # Build a minimal WA-style body; ConvertTo-Json ensures proper escaping
  $payload = [ordered]@{
    object = 'whatsapp_business_account'
    entry  = @(
      @{ changes = @(
          @{ value = @{
                messages = @(
                  @{ from = $From; id = $MessageId; text = @{ body = $Text } }
                )
              }
           }
        )
      }
    )
  }
  return ($payload | ConvertTo-Json -Compress -Depth 6)
}

function Get-HmacSignature {
  param(
    [Parameter(Mandatory = $true)][string]$Secret,
    [Parameter(Mandatory = $true)][string]$Body
  )
  $key = [Text.Encoding]::UTF8.GetBytes($Secret)
  $bytes = [Text.Encoding]::UTF8.GetBytes($Body)
  $hmac = [System.Security.Cryptography.HMACSHA256]::new($key)
  $hash = $hmac.ComputeHash($bytes)
  $hex = -join ($hash | ForEach-Object { $_.ToString('x2') })
  return "sha256=$hex"
}

if (-not $BodyPath) {
  $body = New-BodyJson -From $From -Text $Text -MessageId $MessageId
} else {
  if (-not (Test-Path -LiteralPath $BodyPath)) {
    throw "BodyPath not found: $BodyPath"
  }
  $body = Get-Content -Raw -LiteralPath $BodyPath
}

if (-not $SkipSignature) {
  if (-not $Secret) {
    $Secret = Read-Host -AsSecureString -Prompt 'Enter WhatsApp App Secret' | ForEach-Object { $_ } | ForEach-Object { [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($_)) }
  }
  if (-not $Secret) { throw 'Secret is required unless -SkipSignature is used.' }
  $sig = Get-HmacSignature -Secret $Secret -Body $body
}

# Build and send HTTP request with explicit UTF-8 JSON content
$client = [System.Net.Http.HttpClient]::new()
try {
  $content = New-Object System.Net.Http.StringContent($body, [Text.Encoding]::UTF8, 'application/json')
  $req = New-Object System.Net.Http.HttpRequestMessage 'Post', $Url
  if (-not $SkipSignature) {
    $req.Headers.Add('X-Hub-Signature-256', $sig)
  }
  $req.Content = $content

  Write-Host "POST $Url" -ForegroundColor Cyan
  if (-not $SkipSignature) { Write-Host "X-Hub-Signature-256: $sig" -ForegroundColor DarkGray }
  Write-Host "Body: $body" -ForegroundColor DarkGray

  $resp = $client.SendAsync($req).GetAwaiter().GetResult()
  $status = [int]$resp.StatusCode
  $rid = if ($resp.Headers.Contains('x-request-id')) { ($resp.Headers.GetValues('x-request-id') | Select-Object -First 1) } else { '' }
  $respBody = $resp.Content.ReadAsStringAsync().Result

  Write-Host ("Status: {0}  x-request-id: {1}" -f $status, $rid) -ForegroundColor Yellow
  Write-Output $respBody
} finally {
  $client.Dispose()
}

