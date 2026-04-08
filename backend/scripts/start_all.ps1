Param(
    [string]$BindHost = "0.0.0.0",
    [int]$Port = 9000
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Set-Location (Join-Path $PSScriptRoot "..")

if (-not (Test-Path ".\venv\Scripts\python.exe")) {
    Write-Error "Virtual environment not found at .\\venv. Create or activate your existing venv first."
}

$pythonExe = Resolve-Path ".\venv\Scripts\python.exe"
& $pythonExe -m uvicorn app.main_gateway:app --host $BindHost --port $Port --reload
