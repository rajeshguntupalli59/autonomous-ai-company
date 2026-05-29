# Run as Administrator. After completion: RESTART PC, then run setup-docker-part2.ps1

Write-Host "=== Autonomous AI Company - Docker Setup ===" -ForegroundColor Cyan

Write-Host "`n[1/3] Enabling WSL..." -ForegroundColor Yellow
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
Write-Host "  WSL step done" -ForegroundColor Green

Write-Host "`n[2/3] Enabling Virtual Machine Platform..." -ForegroundColor Yellow
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
Write-Host "  VirtualMachinePlatform step done" -ForegroundColor Green

Write-Host "`n[3/3] Downloading WSL2 kernel update..." -ForegroundColor Yellow
$wslKernel = "$env:TEMP\wsl_update.msi"
Invoke-WebRequest -Uri "https://wslstorestorage.blob.core.windows.net/wslblob/wsl_update_x64.msi" -OutFile $wslKernel
Start-Process msiexec.exe -ArgumentList "/i `"$wslKernel`" /quiet /norestart" -Wait
Write-Host "  WSL2 kernel installed" -ForegroundColor Green

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "DONE. Restart your PC now." -ForegroundColor Red
Write-Host "After restart, run: scripts\setup-docker-part2.ps1" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$restart = Read-Host "Restart now? (y/n)"
if ($restart -eq "y") { Restart-Computer -Force }
