# ==========================================
# Jerzii AI Automated Profit System - All-in-One Startup Script
# ==========================================

\   = 3000
\    = "automated-profit-system"
\ = "src/server.js"
\  = "logs"
\    = ".env"

function Write-Log {
    param([string]\)
    \ = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
    \ = "\ - \"
    Write-Host \
    if (-not (Test-Path \)) { New-Item -ItemType Directory -Path \ | Out-Null }
    \ = "\\server-setup-\2025-11-03.log"
    Add-Content -Path \ -Value \
}

function Get-FreePort { param([int]\) \ = \; while (Get-NetTCPConnection -LocalPort \ -ErrorAction SilentlyContinue) { \++ }; return \ }

function Kill-PortProcess { 
    param([int]\) 
    \ = (Get-NetTCPConnection -LocalPort \ -ErrorAction SilentlyContinue).OwningProcess
    if (\) { Write-Log "??  Port \ in use — killing PID \..."; Stop-Process -Id \ -Force } 
    else { Write-Log "? Port \ is free." } 
}

function Get-PM2Json {
    \ = node -e "
        const { execSync } = require('child_process');
        const data = execSync('pm2 jlist --silent').toString();
        const list = JSON.parse(data).map(app => {
            if(app.pm2_env?.USERNAME && app.pm2_env?.username){ delete app.pm2_env.USERNAME; }
            return app;
        });
        console.log(JSON.stringify(list));
    "
    return \ | ConvertFrom-Json
}

function Show-PM2Dashboard {
    param([array]\)
    Write-Host '-------------------------------------------'
    foreach (\ in \) {
        \      = \.name
        \    = if (\.pid) { \.pid } elseif (\.pm2_env -and \.pm2_env.pid) { \.pm2_env.pid } else { "N/A" }
        \ = if (\.pm2_env -and \.pm2_env.status) { \.pm2_env.status } else { "N/A" }
        \       = if (\.monit -and \.monit.cpu) { \.monit.cpu } else { "0" }
        \       = if (\.monit -and \.monit.memory) { [math]::Round(\.monit.memory / 1MB, 2) } else { 0 }
        Write-Host "\ | Status: \ | PID: \ | CPU: \% | MEM: \ MB"
    }
    Write-Host '-------------------------------------------'
}

# -------- MAIN LOOP --------
while (\True) {
    Clear-Host
    \ = Get-PM2Json
    Write-Host "===== Jerzii AI Automated Profit System Status =====" -ForegroundColor Cyan
    Show-PM2Dashboard -pm2Json \
    Start-Sleep -Seconds 10
}
