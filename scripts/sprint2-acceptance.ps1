<#
.SYNOPSIS
  Sprint 2 acceptance runner: unit tests + API E2E + WA preview flows.

.PARAMETER ApiBase
  Base URL of deployed API, e.g. https://<api>.vercel.app

.PARAMETER CatalogSyncKey
  Optional key to trigger /catalog/sync

.PARAMETER Lang
  Language for WA preview tests (en|ar). Default: en

.PARAMETER ExpectData
  Require non-zero product/category counts in health.

.EXAMPLE
  pwsh scripts/sprint2-acceptance.ps1 -ApiBase https://api.example.com -CatalogSyncKey '<KEY>' -ExpectData
#>

param(
  [Parameter(Mandatory = $true)][string]$ApiBase,
  [string]$CatalogSyncKey,
  [ValidateSet('en','ar')][string]$Lang = 'en',
  [switch]$ExpectData
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Step([string]$m){ Write-Host "== $m" -ForegroundColor Cyan }
function Ok([string]$m){ Write-Host "+ $m" -ForegroundColor Green }
function Fail([string]$m){ Write-Host "x $m" -ForegroundColor Red; exit 1 }
function Run([string]$cmd){ Write-Host "$ $cmd" -ForegroundColor DarkGray }

if ($ApiBase.EndsWith('/')) { $ApiBase = $ApiBase.TrimEnd('/') }

try {
  Step 'Run unit tests (Jest)'
  Run 'pnpm -C packages/api test --silent'
  pnpm -C packages/api test --silent | Write-Host
  Ok 'Unit tests passed'

  if ($CatalogSyncKey) {
    Step 'Trigger catalog sync'
    pwsh scripts/sprint2/test-catalog-sync.ps1 -ApiBase $ApiBase -CatalogSyncKey $CatalogSyncKey
  }

  Step 'Catalog health'
  $args = @{ ApiBase = $ApiBase }
  if ($ExpectData) { $args.ExpectData = $true }
  pwsh scripts/sprint2/test-catalog-health.ps1 @args

  Step 'Products list/detail'
  pwsh scripts/sprint2/test-products.ps1 -ApiBase $ApiBase
  pwsh scripts/sprint2/test-product-detail.ps1 -ApiBase $ApiBase

  Step 'Categories list'
  pwsh scripts/sprint2/test-categories.ps1 -ApiBase $ApiBase

  Step 'WhatsApp preview: browse/show/more'
  pwsh scripts/sprint2/test-wa-preview.ps1 -ApiBase $ApiBase -Text 'browse' -Lang $Lang
  # Choose a valid top-level category from /categories
  $c = Invoke-WebRequest -UseBasicParsing -Method Get -Uri "$ApiBase/categories"
  $co = $c.Content | ConvertFrom-Json
  $firstTop = ($co.categories | Where-Object { -not $_.parentId } | Select-Object -First 1)
  if ($null -eq $firstTop) { $firstTop = $co.categories[0] }
  if ($firstTop) {
    $slug = $firstTop.slug
    pwsh scripts/sprint2/test-wa-preview.ps1 -ApiBase $ApiBase -Text "show $slug" -Lang $Lang
    pwsh scripts/sprint2/test-wa-preview.ps1 -ApiBase $ApiBase -Text "show $slug page 2" -Lang $Lang
  }

  Ok 'Sprint 2 acceptance PASSED'
} catch {
  Fail $_
}

