param(
  [Parameter(Mandatory = $true)][string]$ApiBase,
  [string]$Text = 'browse',
  [ValidateSet('en','ar')][string]$Lang = 'en'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
function Ok([string]$m){ Write-Host "+ $m" -ForegroundColor Green }
function Fail([string]$m){ Write-Host "x $m" -ForegroundColor Red; exit 1 }

if ($ApiBase.EndsWith('/')) { $ApiBase = $ApiBase.TrimEnd('/') }
$body = @{ text = $Text; lang = $Lang } | ConvertTo-Json -Compress
$res = Invoke-WebRequest -UseBasicParsing -Method Post -Uri "$ApiBase/whatsapp/preview" -ContentType 'application/json' -Body $body
if ($res.StatusCode -ne 200) { Fail "/whatsapp/preview status $($res.StatusCode)" }
$o = $res.Content | ConvertFrom-Json
if ($o.ok -ne $true -or $null -eq $o.messages) { Fail "/whatsapp/preview invalid response" }
Ok "/whatsapp/preview ok (messages=$($o.messages.Count))"

# Additional checks for show/more flows
if ($Text -match 'show\s+\S+' -or $Text -match 'more\s+\S+') {
  $hasReplies = $false
  foreach ($m in $o.messages) { if ($m.type -eq 'quick_replies') { $hasReplies = $true; break } }
  if (-not $hasReplies) { Fail "Expected quick replies in response" }
  Ok "quick replies present"
}
