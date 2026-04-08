Param()

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$rootDir = Resolve-Path (Join-Path $PSScriptRoot "..")
$barosaDir = Join-Path $rootDir "krishi-barosa"

if (-not (Test-Path $barosaDir)) {
  throw "KrishiBarosa folder not found at $barosaDir"
}

Write-Host "Starting KrishiBarosa standalone app in its own folder/env..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-Command",
  "Set-Location `"$barosaDir`"; npm run dev"
)

Write-Host "Starting main landing_page dashboard on current terminal..." -ForegroundColor Green
Set-Location $rootDir
npm run dev
