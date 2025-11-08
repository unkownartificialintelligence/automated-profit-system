# ===============================
# Vercel Account Switcher
# Fix "must have access to team" errors
# ===============================

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("personal", "team", "status")]
    [string]$Mode = "status"
)

Write-Host "`n╔════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║      Vercel Account Configuration         ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Configuration
$PersonalEmail = "mj@jerzii.com"
$TeamName = "jerzii-ai"

# -------------------------------
# Function: Get Current Configuration
# -------------------------------
function Get-VercelConfig {
    if (Test-Path ".\.vercel\project.json") {
        try {
            $config = Get-Content ".\.vercel\project.json" | ConvertFrom-Json
            return $config
        }
        catch {
            return $null
        }
    }
    return $null
}

# -------------------------------
# Function: Show Current Status
# -------------------------------
function Show-Status {
    Write-Host "📊 Current Configuration Status`n" -ForegroundColor Cyan
    
    # Check Vercel login
    Write-Host "Vercel Authentication:" -ForegroundColor Yellow
    try {
        $whoami = vercel whoami 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✓ Logged in as: $whoami" -ForegroundColor Green
        }
        else {
            Write-Host "  ✗ Not logged in" -ForegroundColor Red
            Write-Host "    Run: vercel login" -ForegroundColor Gray
        }
    }
    catch {
        Write-Host "  ✗ Vercel CLI not found" -ForegroundColor Red
        Write-Host "    Run: npm install -g vercel" -ForegroundColor Gray
    }
    
    # Check Git configuration
    Write-Host "`nGit Configuration:" -ForegroundColor Yellow
    try {
        $gitEmail = git config user.email
        $gitName = git config user.name
        
        Write-Host "  • Name: $gitName" -ForegroundColor White
        Write-Host "  • Email: $gitEmail" -ForegroundColor White
        
        if ($gitEmail -eq $PersonalEmail) {
            Write-Host "  ✓ Email matches Vercel account" -ForegroundColor Green
        }
        else {
            Write-Host "  ⚠ Email mismatch (Expected: $PersonalEmail)" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host "  ✗ Git not configured" -ForegroundColor Red
    }
    
    # Check Vercel project link
    Write-Host "`nVercel Project Link:" -ForegroundColor Yellow
    $config = Get-VercelConfig
    
    if ($config) {
        Write-Host "  ✓ Project linked" -ForegroundColor Green
        Write-Host "    Project ID: $($config.projectId)" -ForegroundColor Gray
        Write-Host "    Org ID: $($config.orgId)" -ForegroundColor Gray
        
        # Try to determine if it's a team or personal project
        if ($config.orgId -match "team") {
            Write-Host "    Type: Team Account" -ForegroundColor Cyan
        }
        else {
            Write-Host "    Type: Personal Account" -ForegroundColor Cyan
        }
    }
    else {
        Write-Host "  ℹ Not linked to any project" -ForegroundColor Gray
        Write-Host "    (This is normal before first deployment)" -ForegroundColor DarkGray
    }
    
    Write-Host ""
}

# -------------------------------
# Function: Switch to Personal Account
# -------------------------------
function Switch-ToPersonal {
    Write-Host "🔄 Switching to Personal Account`n" -ForegroundColor Cyan
    
    # Step 1: Configure Git
    Write-Host "→ Configuring Git credentials..." -ForegroundColor Yellow
    git config user.name "MJ Jerzii"
    git config user.email $PersonalEmail
    Write-Host "  ✓ Git configured for personal account" -ForegroundColor Green
    
    # Step 2: Remove existing Vercel config
    if (Test-Path ".\.vercel") {
        Write-Host "`n→ Removing existing Vercel configuration..." -ForegroundColor Yellow
        Remove-Item -Recurse -Force .\.vercel
        Write-Host "  ✓ Old configuration removed" -ForegroundColor Green
    }
    
    # Step 3: Link to personal account
    Write-Host "`n→ Linking to your personal Vercel account..." -ForegroundColor Yellow
    $linkOutput = vercel link --yes 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Successfully linked to personal account" -ForegroundColor Green
        Write-Host "    $linkOutput" -ForegroundColor Gray
    }
    else {
        Write-Host "  ✗ Failed to link" -ForegroundColor Red
        Write-Host "    $linkOutput" -ForegroundColor Red
        return $false
    }
    
    Write-Host "`n✅ Configuration switched to Personal Account" -ForegroundColor Green
    Write-Host "   You can now deploy with: vercel --prod" -ForegroundColor Cyan
    return $true
}

# -------------------------------
# Function: Switch to Team Account
# -------------------------------
function Switch-ToTeam {
    Write-Host "🔄 Switching to Team Account ($TeamName)`n" -ForegroundColor Cyan
    
    # Step 1: Configure Git
    Write-Host "→ Configuring Git credentials..." -ForegroundColor Yellow
    git config user.name "MJ Jerzii"
    git config user.email $PersonalEmail
    Write-Host "  ✓ Git configured" -ForegroundColor Green
    
    # Step 2: Remove existing Vercel config
    if (Test-Path ".\.vercel") {
        Write-Host "`n→ Removing existing Vercel configuration..." -ForegroundColor Yellow
        Remove-Item -Recurse -Force .\.vercel
        Write-Host "  ✓ Old configuration removed" -ForegroundColor Green
    }
    
    # Step 3: Link to team account
    Write-Host "`n→ Linking to team account ($TeamName)..." -ForegroundColor Yellow
    $linkOutput = vercel link --yes --scope $TeamName 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Successfully linked to team account" -ForegroundColor Green
        Write-Host "    $linkOutput" -ForegroundColor Gray
    }
    else {
        Write-Host "  ✗ Failed to link to team" -ForegroundColor Red
        Write-Host "    $linkOutput" -ForegroundColor Red
        Write-Host "`n💡 Possible reasons:" -ForegroundColor Yellow
        Write-Host "   • $PersonalEmail is not a member of team '$TeamName'" -ForegroundColor White
        Write-Host "   • You don't have permission to deploy to this team" -ForegroundColor White
        Write-Host "`n🔧 Solutions:" -ForegroundColor Yellow
        Write-Host "   1. Add $PersonalEmail to team '$TeamName' in Vercel Dashboard" -ForegroundColor White
        Write-Host "   2. Or deploy to personal account: .\Vercel-AccountSwitcher.ps1 -Mode personal" -ForegroundColor White
        return $false
    }
    
    Write-Host "`n✅ Configuration switched to Team Account" -ForegroundColor Green
    Write-Host "   You can now deploy with: vercel --prod --scope $TeamName" -ForegroundColor Cyan
    return $true
}

# -------------------------------
# Main Script Logic
# -------------------------------

switch ($Mode) {
    "status" {
        Show-Status
        Write-Host "💡 To switch accounts:" -ForegroundColor Cyan
        Write-Host "   Personal: .\Vercel-AccountSwitcher.ps1 -Mode personal" -ForegroundColor White
        Write-Host "   Team:     .\Vercel-AccountSwitcher.ps1 -Mode team`n" -ForegroundColor White
    }
    
    "personal" {
        $success = Switch-ToPersonal
        if ($success) {
            Write-Host "`n🚀 Ready to deploy!" -ForegroundColor Green
            Write-Host "   Run: .\Deploy-AutomatedProfitSystem.ps1 -DeploymentType personal`n" -ForegroundColor Cyan
        }
    }
    
    "team" {
        $success = Switch-ToTeam
        if ($success) {
            Write-Host "`n🚀 Ready to deploy!" -ForegroundColor Green
            Write-Host "   Run: .\Deploy-AutomatedProfitSystem.ps1 -DeploymentType team`n" -ForegroundColor Cyan
        }
    }
}

Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
