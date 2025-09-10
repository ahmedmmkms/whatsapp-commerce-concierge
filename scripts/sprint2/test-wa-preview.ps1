param(
  [Parameter(Mandatory = $true)][string]$ApiBase,
  [string]$Text = 'browse',
  [ValidateSet('en','ar')][string]$Lang = 'en'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
function Ok([string]$m){ Write-Host "+ $m" -ForegroundColor Green }
function Fail([string]$m){ Write-Host "x $m" -ForegroundColor Red; exit 1 }
function Info([string]$m){ Write-Host "  $m" -ForegroundColor DarkGray }

if ($ApiBase.EndsWith('/')) { $ApiBase = $ApiBase.TrimEnd('/') }

# If asking to show a category that may not exist, map to a valid category from /categories
if ($Text -match '^(?i)show\s+(\S+)(?:\s+page\s+\d+)?$') {
  $cat = $Matches[1]
  try {
    $c = Invoke-WebRequest -UseBasicParsing -Method Get -Uri "$ApiBase/categories"
    if ($c.StatusCode -eq 200) {
      $co = $c.Content | ConvertFrom-Json
      $cats = @($co.categories)
      $exists = $false
      foreach ($x in $cats) { if ($x.slug -eq $cat -or $x.name -eq $cat) { $exists = $true; break } }
      if (-not $exists -and $cats.Count -gt 0) {
        $firstTop = $cats | Where-Object { -not $_.parentId } | Select-Object -First 1
        if ($null -eq $firstTop) { $firstTop = $cats[0] }
        if ($firstTop) { $Text = "show $($firstTop.slug)" }
      }
    }
  } catch {}
}
$body = @{ text = $Text; lang = $Lang } | ConvertTo-Json -Compress
$res = Invoke-WebRequest -UseBasicParsing -Method Post -Uri "$ApiBase/whatsapp/preview" -ContentType 'application/json' -Body $body
if ($res.StatusCode -ne 200) { Fail "/whatsapp/preview status $($res.StatusCode)" }
$o = $res.Content | ConvertFrom-Json
if ($o.ok -ne $true -or $null -eq $o.messages) { Fail "/whatsapp/preview invalid response" }
Ok "/whatsapp/preview ok (messages=$($o.messages.Count))"

# Summarize message types for easier debugging
$types = @()
foreach ($m in $o.messages) { $types += ($m.type ?? 'text') }
Info "types: $($types -join ', ')"

# Additional checks for show/more flows
if ($Text -match 'show\s+\S+' -or $Text -match 'more\s+\S+') {
  $hasReplies = $false
  foreach ($m in $o.messages) { if ($m.type -eq 'quick_replies') { $hasReplies = $true; break } }
  if (-not $hasReplies) {
    $sample = ''
    try {
      $first = $o.messages | Select-Object -First 1
      if ($first.type -eq 'text' -and $first.text) { $sample = $first.text }
    } catch {}
    Info "sample: $sample"
    Fail "Expected quick replies in response. Hint: category may be empty or API not updated. Try 'browse' or a category from /categories."
  }
  Ok "quick replies present"
}
