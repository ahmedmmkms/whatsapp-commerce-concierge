<#
.SYNOPSIS
  Compare smoke/acceptance between current and rollback API bases.

.PARAMETER Current
  Current API base URL.

.PARAMETER Rollback
  Rollback (previous tag) API base URL.

.PARAMETER AdminToken
  Optional admin token to pass to PDPL tests via environment.
#>

param(
  [Parameter(Mandatory = $true)][string]$Current,
  [Parameter(Mandatory = $true)][string]$Rollback,
  [Parameter(Mandatory = $false)][string]$AdminToken
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

if ($AdminToken) { $env:ADMIN_TOKEN = $AdminToken }

Write-Host "=== Current environment ===" -ForegroundColor Yellow
& (Join-Path $PSScriptRoot 'sprint7-acceptance.ps1') -ApiBase $Current

Write-Host "=== Rollback environment ===" -ForegroundColor Yellow
& (Join-Path $PSScriptRoot 'sprint7-acceptance.ps1') -ApiBase $Rollback

Write-Host "Rollback validation completed for current and rollback targets." -ForegroundColor Green

