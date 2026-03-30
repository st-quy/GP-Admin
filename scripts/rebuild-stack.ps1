$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$workspaceRoot = Split-Path -Parent $repoRoot

Write-Host "Rebuilding Docker services from $workspaceRoot ..." -ForegroundColor Cyan
docker compose -f (Join-Path $workspaceRoot 'docker-compose.yml') up --build -d

Write-Host ""
Write-Host "Current container status:" -ForegroundColor Green
docker ps -a
