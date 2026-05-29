# Autonomous AI Company — Full Startup Script
# Run from project root: .\scripts\start_all.ps1

$BASE = "C:\Users\rajes\autonomous-ai-company"
$PYTHON = "$BASE\packages\shared-tools\.venv\Scripts\python.exe"

$env:DATABASE_URL  = "postgresql+asyncpg://postgres:password@localhost:5433/autonomous_company"
$env:REDIS_URL     = "redis://localhost:6380/0"
$env:MEMORY_SERVICE_URL = "http://localhost:8001"
$env:SANDBOX_ROOT  = "$env:USERPROFILE\aic-sandbox"
$env:ANTHROPIC_API_KEY = [System.Environment]::GetEnvironmentVariable("ANTHROPIC_API_KEY","User")

if (-not $env:ANTHROPIC_API_KEY) {
    Write-Host "ERROR: ANTHROPIC_API_KEY not set. Run:" -ForegroundColor Red
    Write-Host '  [System.Environment]::SetEnvironmentVariable("ANTHROPIC_API_KEY","sk-ant-...","User")'
    exit 1
}

Write-Host "=== Autonomous AI Company Startup ===" -ForegroundColor Cyan
Write-Host "  API Key: $($env:ANTHROPIC_API_KEY.Substring(0,15))..." -ForegroundColor Green

# 1. Docker
Write-Host "`n[1/4] Starting Docker containers..." -ForegroundColor Yellow
docker compose -f "$BASE\infrastructure\docker\docker-compose.yml" up -d
Start-Sleep -Seconds 5

# 2. Services
Write-Host "`n[2/4] Starting backend services..." -ForegroundColor Yellow

$svcEnv = @(
    "DATABASE_URL=$($env:DATABASE_URL)",
    "REDIS_URL=$($env:REDIS_URL)",
    "JWT_SECRET=dev-secret-aic",
    "ANTHROPIC_API_KEY=$($env:ANTHROPIC_API_KEY)"
)

# api-gateway :8000
$p1 = Start-Process -FilePath "$BASE\services\api-gateway\.venv\Scripts\uvicorn.exe" `
    -ArgumentList "app.main:app --host 0.0.0.0 --port 8000" `
    -WorkingDirectory "$BASE\services\api-gateway" `
    -WindowStyle Minimized -PassThru
Write-Host "  api-gateway started (pid $($p1.Id))"

# memory-service :8001
$p2 = Start-Process -FilePath "$BASE\services\memory-service\.venv\Scripts\uvicorn.exe" `
    -ArgumentList "app.main:app --host 0.0.0.0 --port 8001" `
    -WorkingDirectory "$BASE\services\memory-service" `
    -WindowStyle Minimized -PassThru
Write-Host "  memory-service started (pid $($p2.Id))"

# orchestrator :8002
$p3 = Start-Process -FilePath "$BASE\services\orchestrator-service\.venv\Scripts\uvicorn.exe" `
    -ArgumentList "app.main:app --host 0.0.0.0 --port 8002" `
    -WorkingDirectory "$BASE\services\orchestrator-service" `
    -WindowStyle Minimized -PassThru
Write-Host "  orchestrator started (pid $($p3.Id))"

Start-Sleep -Seconds 6

# 3. Agent Workers
Write-Host "`n[3/4] Starting agent workers..." -ForegroundColor Yellow

$agents = @("research-agent","pm-agent","architect-agent","backend-agent","frontend-agent","qa-agent","deployment-agent")
foreach ($agent in $agents) {
    $pw = Start-Process -FilePath $PYTHON `
        -ArgumentList "run_worker.py $agent" `
        -WorkingDirectory "$BASE\agents" `
        -WindowStyle Minimized -PassThru
    Write-Host "  $agent worker started (pid $($pw.Id))"
}

Start-Sleep -Seconds 4

# 4. Dashboard
Write-Host "`n[4/4] Starting dashboard..." -ForegroundColor Yellow
$pd = Start-Process -FilePath "$BASE\apps\dashboard\node_modules\.bin\next.cmd" `
    -ArgumentList "dev --port 3001" `
    -WorkingDirectory "$BASE\apps\dashboard" `
    -WindowStyle Minimized -PassThru
Write-Host "  dashboard started (pid $($pd.Id))"

Start-Sleep -Seconds 8

# Health check
Write-Host "`n=== Health Check ===" -ForegroundColor Cyan
@(
    @{name="api-gateway";    url="http://localhost:8000/health"},
    @{name="memory-service"; url="http://localhost:8001/health"},
    @{name="orchestrator";   url="http://localhost:8002/health"},
    @{name="dashboard";      url="http://localhost:3001"}
) | ForEach-Object {
    try {
        $r = Invoke-WebRequest $_.url -TimeoutSec 5 -ErrorAction Stop
        Write-Host "  $($_.name): UP ($($r.StatusCode))" -ForegroundColor Green
    } catch {
        Write-Host "  $($_.name): DOWN" -ForegroundColor Red
    }
}

Write-Host "`n=== READY ===" -ForegroundColor Green
Write-Host "  Dashboard:    http://localhost:3001" -ForegroundColor White
Write-Host "  Orchestrator: http://localhost:8002" -ForegroundColor White
Write-Host "`n  Open the dashboard and type a goal to start a real AI workflow!" -ForegroundColor Cyan
