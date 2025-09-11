param(
  [int]$OnlySprint = 5
)

$ErrorActionPreference = 'Stop'

function Get-LabelsForWorkItem([string]$title, [string]$body) {
  $t = "$title `n $body"
  $labels = New-Object System.Collections.Generic.List[string]
  if ($t -match '(?i)whatsapp|webhook|meta') { $labels.Add('whatsapp'); $labels.Add('backend') }
  if ($t -match '(?i)catalog|product') { $labels.Add('catalog') }
  if ($t -match '(?i)cart') { $labels.Add('cart') }
  if ($t -match '(?i)checkout') { $labels.Add('checkout') }
  if ($t -match '(?i)stripe|payment|mada|tabby|tamara|cod') { $labels.Add('payments') }
  if ($t -match '(?i)order') { $labels.Add('orders') }
  if ($t -match '(?i)return|rma') { $labels.Add('returns') }
  if ($t -match '(?i)cms|template') { $labels.Add('cms') }
  if ($t -match '(?i)observability|logging|metrics|alert|sentry|trace') { $labels.Add('observability') }
  if ($t -match '(?i)perf|performance|p95|load|index|ttl|cache') { $labels.Add('performance') }
  if ($t -match '(?i)security|pdpl|consent|privacy|compliance|pci') { $labels.Add('security') }
  if ($t -match '(?i)redis|bullmq|infra|deploy|ci|docker|nginx') { $labels.Add('infra') }
  if ($t -match '(?i)rtl|arabic|i18n|localization') { $labels.Add('i18n') }
  if ($t -match '(?i)web\b|next\.js|page|ui') { $labels.Add('frontend') }
  if (-not ($labels -contains 'frontend')) { $labels.Add('backend') }
  return ($labels | Sort-Object -Unique)
}

# Parse docs/backlog.md
$backlogPath = Join-Path (Get-Location) 'docs/backlog.md'
if (-not (Test-Path $backlogPath)) { throw "Missing backlog file at $backlogPath" }
$content = Get-Content -Raw -Path $backlogPath -Encoding UTF8
$lines = $content -split "`n"

$issues = @()
for ($idx = 0; $idx -lt $lines.Length; $idx++) {
  $line = $lines[$idx].TrimEnd()
  if ($line -match '^- \[Sprint\s+(\d+)\]\s+(.*)$') {
    $sInTitle = [int]$Matches[1]
    $title = $Matches[2].Trim()
    $bodyBuilder = New-Object System.Text.StringBuilder
    $j = $idx + 1
    while ($j -lt $lines.Length) {
      $next = $lines[$j]
      if ($next -match '^##\s+Sprint' -or $next -match '^- \[Sprint\s+') { break }
      $null = $bodyBuilder.AppendLine($next)
      $j++
    }
    $body = $bodyBuilder.ToString().Trim()
    $issues += @{ Sprint = $sInTitle; Title = $title; Body = $body }
  }
}

$filtered = $issues | Where-Object { $_.Sprint -eq $OnlySprint }
foreach ($it in $filtered) {
  $labels = Get-LabelsForWorkItem -title $it.Title -body $it.Body
  Write-Host "[DRYRUN] Create issue: $($it.Title) (milestone #$($it.Sprint))"
  Write-Host "          Labels: sprint, $($labels -join ', ')"
}

Write-Host "Done. Planned $($filtered.Count) issues for Sprint $OnlySprint (offline preview)"

