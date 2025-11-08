# ===============================
# Deployment Menu Launcher
# ===============================

Write-Host "`n╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║        AUTOMATED PROFIT SYSTEM - DEPLOYMENT MENU            ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "Select deployment type:`n" -ForegroundColor Yellow

Write-Host "  [1] 👤 Personal Deployment (Owner)" -ForegroundColor Green
Write-Host "      • Your personal Vercel account" -ForegroundColor Gray
Write-Host "      • Full owner control" -ForegroundColor Gray
Write-Host "      • No team restrictions`n" -ForegroundColor Gray

Write-Host "  [2] 🏢 Team Deployment (Jerzii AI)" -ForegroundColor Magenta
Write-Host "      • Team account" -ForegroundColor Gray
Write-Host "      • Requires team permissions`n" -ForegroundColor Gray

Write-Host "  [3] 🚪 Exit`n" -ForegroundColor White

$choice = Read-Host "Enter your choice (1-3)"

switch ($choice) {
    "1" {
        Write-Host "`n🚀 Launching Personal (Owner) Deployment...`n" -ForegroundColor Green
        if (Test-Path ".\Deploy-OWNER.ps1") {
            & ".\Deploy-OWNER.ps1"
        } else {
            Write-Host "❌ Error: Deploy-OWNER.ps1 not found!" -ForegroundColor Red
        }
    }

    "2" {
        Write-Host "`n🚀 Launching Team Deployment...`n" -ForegroundColor Magenta
        if (Test-Path ".\Deploy-TEAM.ps1") {
            & ".\Deploy-TEAM.ps1"
        } else {
            Write-Host "❌ Error: Deploy-TEAM.ps1 not found!" -ForegroundColor Red
        }
    }

    "3" {
        Write-Host "`n👋 Goodbye!`n" -ForegroundColor Cyan
        exit 0
    }

    default {
        Write-Host "`n❌ Invalid choice`n" -ForegroundColor Red
    }
}
