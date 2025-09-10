<#
.SYNOPSIS
  Close Sprint N milestone, move open issues to Sprint N+1, and create a tag/release.

.PARAMETER Sprint
  Sprint number to close (e.g., 2)

.PARAMETER NextSprint
  Sprint number to move open issues to (e.g., 3)

.PARAMETER TagName
  Git tag name to create (no spaces). Default: sprint-<Sprint>-finished

.PARAMETER ReleaseTitle
  GitHub Release title. Default: "Sprint <Sprint> finished"

.EXAMPLE
  $env:GITHUB_TOKEN = '<PAT>'
  pwsh scripts/close-sprint.ps1 -Sprint 2 -NextSprint 3 -ReleaseTitle 'Sprint 2 fininshed'
#>

param(
  [Parameter(Mandatory = $true)][int]$Sprint,
  [Parameter(Mandatory = $true)][int]$NextSprint,
  [string]$TagName,
  [string]$ReleaseTitle
)

Set-StrictMode -Version Latest
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

if (-not $env:GITHUB_TOKEN) { throw 'GITHUB_TOKEN not set' }
$r = Get-RepoFromGitRemote
$Owner = $r.Owner; $Repo = $r.Repo
$base = "https://api.github.com/repos/$Owner/$Repo"
$headers = @{ Authorization = "Bearer $($env:GITHUB_TOKEN)"; 'User-Agent' = 'sprint-closer'; Accept = 'application/vnd.github+json' }

function Get-MilestoneByTitle([string]$title) {
  (Invoke-RestMethod -Method GET -Uri "$base/milestones?state=all&per_page=100" -Headers $headers) | Where-Object { $_.title -eq $title }
}

function Ensure-Milestone([string]$title) {
  $m = Get-MilestoneByTitle -title $title
  if ($m) { return $m }
  $body = @{ title = $title; state = 'open' } | ConvertTo-Json
  Invoke-RestMethod -Method POST -Uri "$base/milestones" -Headers $headers -Body $body
}

function Get-DefaultBranch() {
  (Invoke-RestMethod -Method GET -Uri "$base" -Headers $headers).default_branch
}

function Get-HeadSha([string]$branch) {
  (Invoke-RestMethod -Method GET -Uri "$base/git/ref/heads/$branch" -Headers $headers).object.sha
}

$sTitle = "Sprint $Sprint"
$nTitle = "Sprint $NextSprint"
$msClose = Get-MilestoneByTitle -title $sTitle
if (-not $msClose) { throw "Milestone not found: $sTitle" }
$msNext = Ensure-Milestone -title $nTitle

Write-Host "Moving open issues from '$sTitle' to '$nTitle'..." -ForegroundColor Cyan
$issues = Invoke-RestMethod -Method GET -Uri "$base/issues?state=open&milestone=$($msClose.number)&per_page=100" -Headers $headers
foreach ($it in $issues) {
  $patch = @{ milestone = $msNext.number } | ConvertTo-Json
  $null = Invoke-RestMethod -Method PATCH -Uri "$base/issues/$($it.number)" -Headers $headers -Body $patch
  Write-Host "- moved #$($it.number) $($it.title)" -ForegroundColor Green
}

Write-Host "Closing milestone '$sTitle'..." -ForegroundColor Cyan
$null = Invoke-RestMethod -Method PATCH -Uri "$base/milestones/$($msClose.number)" -Headers $headers -Body (@{ state = 'closed' } | ConvertTo-Json)

if (-not $TagName) { $TagName = "sprint-$Sprint-finished" }
if (-not $ReleaseTitle) { $ReleaseTitle = "Sprint $Sprint finished" }

Write-Host "Creating tag '$TagName' and release '$ReleaseTitle'..." -ForegroundColor Cyan
$branch = Get-DefaultBranch
$sha = Get-HeadSha -branch $branch
try {
  $body = @{ ref = "refs/tags/$TagName"; sha = $sha } | ConvertTo-Json
  $null = Invoke-RestMethod -Method POST -Uri "$base/git/refs" -Headers $headers -Body $body
} catch { Write-Host "Tag may already exist: $TagName" -ForegroundColor Yellow }

try {
  $rel = @{ tag_name = $TagName; name = $ReleaseTitle; draft = $false; prerelease = $false } | ConvertTo-Json
  $null = Invoke-RestMethod -Method POST -Uri "$base/releases" -Headers $headers -Body $rel
} catch { Write-Host "Release may already exist for tag: $TagName" -ForegroundColor Yellow }

Write-Host "Done. Closed '$sTitle', moved open issues to '$nTitle', created tag '$TagName'." -ForegroundColor Green

