param(
  [string]$StartDate = (Get-Date).ToString('yyyy-MM-dd'),
  [string]$Owner,
  [string]$Repo,
  [string]$Token = $env:GITHUB_TOKEN,
  [switch]$DryRun,
  [switch]$Offline,
  [int]$OnlySprint
)

$ErrorActionPreference = 'Stop'

function Get-RepoFromGitRemote {
  $remote = (git remote get-url origin).Trim()
  if ($remote -match '^https://github.com/([^/]+)/([^/.]+)') {
    return @{ Owner = $Matches[1]; Repo = $Matches[2] }
  } elseif ($remote -match '^git@github.com:([^/]+)/([^/.]+)') {
    return @{ Owner = $Matches[1]; Repo = $Matches[2] }
  } else {
    throw "Unsupported remote URL format: $remote"
  }
}

if (-not $Offline) {
  if (-not $Owner -or -not $Repo) {
    $r = Get-RepoFromGitRemote
    $Owner = $r.Owner
    $Repo = $r.Repo
  }
  if (-not $Token) {
    throw 'GITHUB_TOKEN not set. Provide -Token or set env var.'
  }
  $base = "https://api.github.com/repos/$Owner/$Repo"
  $headers = @{ Authorization = "Bearer $Token"; 'User-Agent' = 'mvp-bootstrap-script'; Accept = 'application/vnd.github+json' }
} else {
  if (-not $Owner) { $Owner = 'offline' }
  if (-not $Repo) { $Repo = 'offline' }
  $base = "https://api.github.com/repos/$Owner/$Repo"
  $headers = @{}
}

function Ensure-Label([string]$name, [string]$color, [string]$description) {
  if ($Offline) {
    Write-Host "[OFFLINE][DRYRUN] Ensure label: $name ($color)"; return @{ name = $name }
  }
  $existing = Invoke-RestMethod -Method GET -Uri "$base/labels?per_page=100" -Headers $headers
  $match = $existing | Where-Object { $_.name -eq $name }
  if ($match) { return $match }
  $payload = @{ name = $name; color = $color; description = $description } | ConvertTo-Json
  if ($DryRun) { Write-Host "[DRYRUN] Create label: $name ($color)"; return @{ name = $name } }
  return Invoke-RestMethod -Method POST -Uri "$base/labels" -Headers $headers -Body $payload
}

function Get-OrCreateMilestone([string]$title, [string]$description, [datetime]$dueOn) {
  if ($Offline) {
    Write-Host "[OFFLINE][DRYRUN] Ensure milestone: $title (due $($dueOn.ToShortDateString()))"; return @{ number = -1; title = $title }
  }
  $existing = Invoke-RestMethod -Method GET -Uri "$base/milestones?state=all&per_page=100" -Headers $headers
  $match = $existing | Where-Object { $_.title -eq $title }
  if ($match) { return $match }
  # GitHub expects RFC3339 timestamp with Z (UTC), e.g., 2025-10-12T00:00:00Z
  $dueUtc = $dueOn.ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ')
  $body = @{ title = $title; state = 'open'; description = $description; due_on = $dueUtc } | ConvertTo-Json
  if ($DryRun) { Write-Host "[DRYRUN] Create milestone: $title (due $($dueOn.ToShortDateString()))"; return @{ number = -1; title = $title } }
  return Invoke-RestMethod -Method POST -Uri "$base/milestones" -Headers $headers -Body $body -ContentType 'application/json'
}

function Ensure-Issue([string]$title, [string]$body, [string[]]$labels, [int]$milestoneNumber) {
  if ($Offline) {
    Write-Host "[OFFLINE][DRYRUN] Create/ensure issue: $title (milestone #$milestoneNumber) [labels: $($labels -join ', ')]"
    return $null
  }
  $queryTitle = [System.Web.HttpUtility]::UrlEncode($title)
  $existing = Invoke-RestMethod -Method GET -Uri "$base/issues?state=all&per_page=100" -Headers $headers | Where-Object { $_.title -eq $title }
  if ($existing) {
    $existingLabelNames = @($existing.labels | ForEach-Object { $_.name })
    $union = ($existingLabelNames + $labels) | Sort-Object -Unique
    if (@(Compare-Object -ReferenceObject $existingLabelNames -DifferenceObject $union).Length -gt 0) {
      if ($DryRun) { Write-Host "[DRYRUN] Update labels for existing issue: $title -> [$($union -join ', ')]"; return $existing }
      $patch = @{ labels = $union } | ConvertTo-Json
      $null = Invoke-RestMethod -Method PATCH -Uri "$base/issues/$($existing.number)" -Headers $headers -Body $patch
      Write-Host "Updated labels for existing issue: $title"
    } else {
      Write-Host "Skip existing issue (labels up-to-date): $title"
    }
    return $existing
  }
  $payload = @{ title = $title; body = $body; labels = $labels; milestone = $milestoneNumber } | ConvertTo-Json -Depth 5
  if ($DryRun) { Write-Host "[DRYRUN] Create issue: $title (milestone #$milestoneNumber)"; return $null }
  return Invoke-RestMethod -Method POST -Uri "$base/issues" -Headers $headers -Body $payload
}

# Label definitions
$labelSpec = @(
  @{ name='sprint';        color='0366d6'; description='Sprint-scoped work item' },
  @{ name='backend';       color='1f6feb'; description='Server-side/API work' },
  @{ name='frontend';      color='0e8a16'; description='Web app/UI work' },
  @{ name='infra';         color='5319e7'; description='CI/CD, hosting, ops' },
  @{ name='qa';            color='fbca04'; description='Testing and quality' },
  @{ name='docs';          color='006b75'; description='Documentation' },
  @{ name='whatsapp';      color='c2e0c6'; description='WhatsApp Cloud API integration' },
  @{ name='catalog';       color='bfd4f2'; description='Product catalog and search' },
  @{ name='cart';          color='fef2c0'; description='Cart and pricing' },
  @{ name='checkout';      color='f9d0c4'; description='Checkout flow' },
  @{ name='payments';      color='d73a4a'; description='Payment gateways and adapters' },
  @{ name='orders';        color='d4c5f9'; description='Orders and tracking' },
  @{ name='returns';       color='e99695'; description='Returns and RMA' },
  @{ name='cms';           color='bfe5bf'; description='Content templates and CMS' },
  @{ name='observability'; color='b2f2bb'; description='Logging, metrics, alerts' },
  @{ name='performance';   color='a2eeef'; description='Performance and scalability' },
  @{ name='security';      color='7057ff'; description='Security and compliance' },
  @{ name='i18n';          color='c5def5'; description='Localization and RTL' }
)

function Get-LabelsForWorkItem([string]$title, [string]$body) {
  $t = "$title `n $body"
  $labels = New-Object System.Collections.Generic.List[string]
  if ($t -match '(?i)whatsapp|webhook|meta') { $labels.Add('whatsapp'); $labels.Add('backend') }
  if ($t -match '(?i)catalog|product') { $labels.Add('catalog') }
  if ($t -match '(?i)cart') { $labels.Add('cart') }
  if ($t -match '(?i)checkout') { $labels.Add('checkout') }
  if ($t -match '(?i)stripe|payment|mada|tabby|tamara') { $labels.Add('payments') }
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

# Plan: create milestones. If -OnlySprint set, limit to that sprint; else create 6.
$start = Get-Date $StartDate
$milestones = @{}
if ($OnlySprint) {
  $i = [int]$OnlySprint
  $sprintStart = $start.AddDays(14 * ($i - 1))
  $sprintEnd = $sprintStart.AddDays(13)
  $title = "Sprint $i"
  $desc = "P1 WhatsApp Commerce Concierge - $title ($($sprintStart.ToString('yyyy-MM-dd')) to $($sprintEnd.ToString('yyyy-MM-dd')))"
  $ms = Get-OrCreateMilestone -title $title -description $desc -dueOn $sprintEnd
  $milestones[$i] = $ms
} else {
  for ($i = 1; $i -le 6; $i++) {
    $sprintStart = $start.AddDays(14 * ($i - 1))
    $sprintEnd = $sprintStart.AddDays(13)
    $title = "Sprint $i"
    $desc = "P1 WhatsApp Commerce Concierge - $title ($($sprintStart.ToString('yyyy-MM-dd')) to $($sprintEnd.ToString('yyyy-MM-dd')))"
    $ms = Get-OrCreateMilestone -title $title -description $desc -dueOn $sprintEnd
    $milestones[$i] = $ms
  }
}

# Parse docs/backlog.md
$backlogPath = Join-Path (Get-Location) 'docs/backlog.md'
if (-not (Test-Path $backlogPath)) { throw "Missing backlog file at $backlogPath" }
$content = Get-Content -Raw -Path $backlogPath -Encoding UTF8
$lines = $content -split "`n"
$currentSprint = $null
$currentIssue = $null
$issues = @()

for ($idx = 0; $idx -lt $lines.Length; $idx++) {
  $line = $lines[$idx].TrimEnd()
  if ($line -match '^##\s+Sprint\s+(\d+)') {
    $currentSprint = [int]$Matches[1]
    continue
  }
  if ($line -match '^- \[Sprint\s+(\d+)\]\s+(.*)$') {
    $sInTitle = [int]$Matches[1]
    $title = $Matches[2].Trim()
    # collect following indented/sub-bullets as body until next top-level bullet or header
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

# Ensure labels exist
foreach ($ls in $labelSpec) { Ensure-Label -name $ls.name -color $ls.color -description $ls.description | Out-Null }

# Create issues under their respective milestones (filter if OnlySprint)
foreach ($it in $issues) {
  if ($OnlySprint -and ([int]$it.Sprint -ne [int]$OnlySprint)) { continue }
  $s = [int]$it.Sprint
  if (-not $milestones.ContainsKey($s)) { Write-Warning "No milestone for sprint $s"; continue }
  $msNum = $milestones[$s].number
  $auto = Get-LabelsForWorkItem -title $it.Title -body $it.Body
  $labels = @('sprint') + $auto
  Ensure-Issue -title $it.Title -body $it.Body -labels $labels -milestoneNumber $msNum | Out-Null
}

if ($OnlySprint) {
  $count = ($issues | Where-Object { [int]$_.Sprint -eq [int]$OnlySprint }).Count
  Write-Host "Done. Created/verified $count issues for Sprint $OnlySprint in $Owner/$Repo"
} else {
  Write-Host "Done. Created/verified $($issues.Count) issues across 6 milestones for $Owner/$Repo"
}
