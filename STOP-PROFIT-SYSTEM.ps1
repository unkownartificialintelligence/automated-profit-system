#Requires -Version 5.1

<#
.SYNOPSIS
    Stops the Automated Profit System server
.DESCRIPTION
    Safely stops all server processes running on port 3000
#>

param(
    [int]$Port = 3000
)

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Yellow
Write-Host "║                                                           ║" -ForegroundColor Yellow
Write-Host "║       🛑 STOPPING AUTOMATED PROFIT SYSTEM 🛑             ║" -ForegroundColor Yellow
Write-Host "║                                                           ║" -ForegroundColor Yellow
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Yellow
Write-Host ""

Write-Host "🔍 Looking for processes on port $Port..." -ForegroundColor Cyan

try {
    $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue

    if ($connections) {
        $pids = $connections.OwningProcess | Select-Object -Unique
        $processCount = ($pids | Measure-Object).Count

        Write-Host "   Found $processCount process(es) to stop" -ForegroundColor Yellow
        Write-Host ""

        foreach ($pid in $pids) {
            if ($pid -gt 0) {
                try {
                    $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
                    if ($process) {
                        Write-Host "   Stopping: $($process.ProcessName) (PID: $pid)" -ForegroundColor Yellow
                        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                        Start-Sleep -Milliseconds 500
                        Write-Host "   ✅ Stopped PID: $pid" -ForegroundColor Green
                    }
                } catch {
                    Write-Host "   ⚠️  Could not stop PID: $pid" -ForegroundColor Yellow
                }
            }
        }

        Write-Host ""
        Write-Host "✅ All server processes stopped" -ForegroundColor Green
    } else {
        Write-Host "   ℹ️  No processes found on port $Port" -ForegroundColor Cyan
        Write-Host "   Server is not running" -ForegroundColor White
    }
} catch {
    Write-Host "   ⚠️  Error checking port: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                           ║" -ForegroundColor Green
Write-Host "║         ✅ AUTOMATED PROFIT SYSTEM STOPPED ✅            ║" -ForegroundColor Green
Write-Host "║                                                           ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "ℹ️  To restart the server:" -ForegroundColor Cyan
Write-Host "   Run: .\START-PROFIT-SYSTEM.ps1" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
