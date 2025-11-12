# ============================================
# UNIFIED DEPLOYMENT SCRIPT (PowerShell)
# ============================================
# Deploy to BOTH Vercel AND Render with ONE command
#
# Usage:
#   .\deploy-unified-simple.ps1              # Deploy to both platforms
#   .\deploy-unified-simple.ps1 -Platform vercel    # Deploy to Vercel only
#   .\deploy-unified-simple.ps1 -Platform render    # Deploy to Render only
#   .\deploy-unified-simple.ps1 -Help               # Show help
# ============================================

param(
    [string]$Platform = "both",
    [switch]$Help
)

# Colors for output
function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Write-Warning-Custom {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Cyan
}

function Write-Header {
    Write-Host ""
    Write-Host "================================================================" -ForegroundColor Blue
    Write-Host "                                                                " -ForegroundColor Blue
    Write-Host "          UNIFIED DEPLOYMENT SYSTEM                            " -ForegroundColor Blue
    Write-Host "                                                                " -ForegroundColor Blue
    Write-Host "          Deploy to Vercel & Render with ONE command           " -ForegroundColor Blue
    Write-Host "                                                                " -ForegroundColor Blue
    Write-Host "================================================================" -ForegroundColor Blue
    Write-Host ""
}

function Show-Help {
    Write-Host ""
    Write-Host "UNIFIED DEPLOYMENT SCRIPT (PowerShell)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "USAGE:" -ForegroundColor Yellow
    Write-Host "    .\deploy-unified-simple.ps1 [-Platform <platform>] [-Help]"
    Write-Host ""
    Write-Host "PARAMETERS:" -ForegroundColor Yellow
    Write-Host "    -Platform <platform>    Deployment target (both, vercel, render)"
    Write-Host "    -Help                   Show this help message"
    Write-Host ""
    Write-Host "EXAMPLES:" -ForegroundColor Yellow
    Write-Host "    .\deploy-unified-simple.ps1                      # Deploy to both platforms"
    Write-Host "    .\deploy-unified-simple.ps1 -Platform vercel     # Deploy to Vercel only"
    Write-Host "    .\deploy-unified-simple.ps1 -Platform render     # Deploy to Render only"
    Write-Host ""
    exit 0
}

function Test-Requirements {
    Write-Info "Checking requirements..."

    # Check Git
    try {
        $gitVersion = git --version 2>$null
        if (-not $gitVersion) {
            throw "Git not found"
        }
    } catch {
        Write-Error-Custom "Git is not installed. Please install from: https://git-scm.com/download/win"
        exit 1
    }

    # Check Node
    try {
        $nodeVersion = node --version 2>$null
        if (-not $nodeVersion) {
            throw "Node not found"
        }
    } catch {
        Write-Error-Custom "Node.js is not installed. Please install from: https://nodejs.org"
        exit 1
    }

    # Check npm
    try {
        $npmVersion = npm --version 2>$null
        if (-not $npmVersion) {
            throw "npm not found"
        }
    } catch {
        Write-Error-Custom "npm is not installed. Please install Node.js from: https://nodejs.org"
        exit 1
    }

    Write-Success "All requirements met"
}

function Setup-Environment {
    Write-Info "Setting up environment..."

    # Check for .env file
    if (-not (Test-Path .env)) {
        Write-Warning-Custom ".env file not found"
        if (Test-Path .env.example) {
            Copy-Item .env.example .env
            Write-Success ".env file created from template"
            Write-Warning-Custom "Please edit .env with your actual API keys before deploying!"
            Write-Host ""
            Write-Host "Opening .env file for editing..." -ForegroundColor Yellow
            Start-Sleep -Seconds 2
            notepad .env
            Write-Host ""
            Write-Host "Press Enter when you're done editing .env..." -ForegroundColor Yellow
            Read-Host
        } else {
            Write-Error-Custom ".env.example not found"
            exit 1
        }
    } else {
        Write-Success ".env file exists"
    }

    # Install dependencies
    Write-Info "Installing dependencies..."
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "Failed to install dependencies"
        exit 1
    }
    Write-Success "Dependencies installed"
}

function Deploy-ToVercel {
    Write-Info "Deploying to Vercel..."

    # Check if Vercel CLI is installed
    try {
        $vercelVersion = vercel --version 2>$null
        if (-not $vercelVersion) {
            throw "Vercel not found"
        }
    } catch {
        Write-Warning-Custom "Vercel CLI not found, installing..."
        npm install -g vercel
        if ($LASTEXITCODE -ne 0) {
            Write-Error-Custom "Failed to install Vercel CLI"
            exit 1
        }
    }

    # Deploy to Vercel
    Write-Info "Running Vercel deployment..."
    vercel --prod
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "Vercel deployment failed"
        exit 1
    }

    Write-Success "Deployed to Vercel successfully!"

    # Get Vercel URL
    Write-Info "Getting Vercel URL..."
    try {
        $vercelUrl = vercel inspect --prod 2>$null | Select-String "url:" | ForEach-Object { $_.ToString().Split()[1] }
        if ($vercelUrl) {
            Write-Info "Vercel URL: $vercelUrl"
        } else {
            Write-Info "Check your Vercel dashboard for the deployment URL"
        }
    } catch {
        Write-Info "Check your Vercel dashboard for the deployment URL"
    }
}

function Deploy-ToRender {
    Write-Info "Deploying to Render..."

    # Get current branch
    $currentBranch = git branch --show-current
    Write-Info "Current branch: $currentBranch"

    # Check for uncommitted changes
    $gitStatus = git status --porcelain
    if ($gitStatus) {
        Write-Info "Committing changes..."
        git add -A
        $commitMessage = "Deploy: Unified deployment $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
        git commit -m $commitMessage
        if ($LASTEXITCODE -ne 0) {
            Write-Warning-Custom "No changes to commit or commit failed"
        }
    }

    # Push to GitHub
    Write-Info "Pushing to GitHub (Render will auto-deploy)..."
    git push origin $currentBranch
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "Failed to push to GitHub"
        exit 1
    }

    Write-Success "Pushed to GitHub - Render will auto-deploy"
    Write-Info "Check your Render dashboard: https://dashboard.render.com"
}

function Configure-Automation {
    Write-Info "Configuring automation..."

    # Verify master-automation.js exists
    if (-not (Test-Path master-automation.js)) {
        Write-Error-Custom "master-automation.js not found!"
        exit 1
    }

    Write-Success "Automation configured"
    Write-Info "Automation will run automatically on both platforms:"
    Write-Info "  - Vercel: Using cron jobs (see vercel.json)"
    Write-Info "  - Render: Using worker process (see render.yaml)"
}

function Deploy-Both {
    Write-Header
    Test-Requirements
    Setup-Environment
    Configure-Automation

    Write-Host ""
    Write-Info "Starting deployment to both platforms..."
    Write-Host ""

    # Deploy to Vercel
    Deploy-ToVercel
    Write-Host ""

    # Deploy to Render
    Deploy-ToRender
    Write-Host ""

    Write-Success "DEPLOYMENT COMPLETE!"
    Write-Host ""
    Write-Info "Next steps:"
    Write-Info "1. Check Vercel dashboard: https://vercel.com/dashboard"
    Write-Info "2. Check Render dashboard: https://dashboard.render.com"
    Write-Info "3. Add environment variables to both platforms"
    Write-Info "4. Verify automation is running"
    Write-Info "5. Monitor logs for any issues"
    Write-Host ""
}

# ============================================
# MAIN EXECUTION
# ============================================

if ($Help) {
    Show-Help
}

switch ($Platform.ToLower()) {
    "vercel" {
        Write-Header
        Test-Requirements
        Setup-Environment
        Configure-Automation
        Deploy-ToVercel
    }
    "render" {
        Write-Header
        Test-Requirements
        Setup-Environment
        Configure-Automation
        Deploy-ToRender
    }
    "both" {
        Deploy-Both
    }
    default {
        Write-Error-Custom "Invalid platform: $Platform"
        Write-Info "Valid platforms: both, vercel, render"
        Write-Info "Use -Help for more information"
        exit 1
    }
}
