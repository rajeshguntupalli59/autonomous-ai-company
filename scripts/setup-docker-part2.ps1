# Run this AFTER restart, as Administrator
# This sets WSL2 as default and boots the project containers

Write-Host "=== Docker Setup Part 2 ===" -ForegroundColor Cyan

# Set WSL2 as default
Write-Host "`n[1/3] Setting WSL2 as default..." -ForegroundColor Yellow
wsl --set-default-version 2
Write-Host "  Done" -ForegroundColor Green

# Start Docker Desktop
Write-Host "`n[2/3] Starting Docker Desktop..." -ForegroundColor Yellow
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"

# Wait for Docker engine
Write-Host "`n[3/3] Waiting for Docker engine (up to 90s)..." -ForegroundColor Yellow
$timeout = 90; $elapsed = 0
while ($elapsed -lt $timeout) {
    $result = docker info 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  Docker engine is up!" -ForegroundColor Green
        break
    }
    Start-Sleep -Seconds 5; $elapsed += 5
    Write-Host "  ...${elapsed}s"
}

if ($elapsed -ge $timeout) {
    Write-Host "Docker did not start in time. Open Docker Desktop manually, wait for it to show 'Engine running', then run:" -ForegroundColor Red
    Write-Host "  docker compose -f infrastructure/docker/docker-compose.yml up -d" -ForegroundColor Cyan
    exit 1
}

# Boot project containers
Write-Host "`nStarting PostgreSQL + Redis containers..." -ForegroundColor Yellow
Set-Location "C:\Users\rajes\autonomous-ai-company"
docker compose -f infrastructure/docker/docker-compose.yml up -d

# Verify
Start-Sleep -Seconds 8
docker compose -f infrastructure/docker/docker-compose.yml ps

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Layer 0 COMPLETE. PostgreSQL + Redis are up." -ForegroundColor Green
Write-Host "Next: start Layer 1 (data layer migrations)" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan
