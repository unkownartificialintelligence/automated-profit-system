# ============================================
# 🚀 UNIFIED DEPLOYMENT SCRIPT WITH GUI
# ============================================
# Complete deployment solution with GUI API key management
#
# Features:
# - GUI form for secure API key entry
# - Encrypted credential storage
# - Automated tool installation
# - Backend/Frontend startup
# - Health check validation
# - One-click deployment to Vercel & Render
#
# Usage:
#   .\Deploy-Complete.ps1
# ============================================

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# Configuration
$apiFile = "$PSScriptRoot\api-keys.json"
$envPath = "$PSScriptRoot\.env"
$backendPort = 3000  # Changed from 3003 to match default
$frontendPort = 5173
$backendUrl = "http://localhost:$backendPort"
$frontendUrl = "http://localhost:$frontendPort"

# ============================================
# SECURE API KEY MANAGEMENT
# ============================================

function Save-ApiKey {
    param([string]$name, [string]$value)

    if ([string]::IsNullOrWhiteSpace($value)) {
        return
    }

    try {
        $secure = ConvertTo-SecureString $value -AsPlainText -Force
        $enc = $secure | ConvertFrom-SecureString

        $data = @{}
        if (Test-Path $apiFile) {
            $data = Get-Content $apiFile | ConvertFrom-Json -AsHashtable
        }

        $data[$name] = $enc
        $data | ConvertTo-Json | Set-Content $apiFile

        Write-Host "[INFO] Saved $name" -ForegroundColor Cyan
    } catch {
        Write-Host "[ERROR] Failed to save $name : $_" -ForegroundColor Red
    }
}

function Load-ApiKey {
    param([string]$name)

    try {
        if (-not (Test-Path $apiFile)) {
            return $null
        }

        $data = Get-Content $apiFile | ConvertFrom-Json
        if ($data.$name) {
            $secure = $data.$name | ConvertTo-SecureString
            $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
            $plainText = [Runtime.InteropServices.Marshal]::PtrToStringAuto($ptr)
            [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
            return $plainText
        }
    } catch {
        Write-Host "[WARNING] Failed to load $name : $_" -ForegroundColor Yellow
    }

    return $null
}

# ============================================
# GUI API KEY MANAGER
# ============================================

function Show-ApiKeyManager {
    Write-Host ""
    Write-Host "================================================================" -ForegroundColor Blue
    Write-Host "        API KEYS MANAGER - Secure Credential Setup              " -ForegroundColor Blue
    Write-Host "================================================================" -ForegroundColor Blue
    Write-Host ""

    $form = New-Object System.Windows.Forms.Form
    $form.Text = "Automated Profit System - API Keys Setup"
    $form.Size = New-Object System.Drawing.Size(500, 400)
    $form.StartPosition = "CenterScreen"
    $form.FormBorderStyle = "FixedDialog"
    $form.MaximizeBox = $false

    # Header
    $header = New-Object System.Windows.Forms.Label
    $header.Text = "Enter your API keys (leave optional fields empty)"
    $header.Location = New-Object System.Drawing.Point(10, 10)
    $header.Size = New-Object System.Drawing.Size(460, 20)
    $header.Font = New-Object System.Drawing.Font("Arial", 10, [System.Drawing.FontStyle]::Bold)
    $form.Controls.Add($header)

    # API Key fields
    $apiKeys = @(
        @{Name="PRINTFUL_API_KEY"; Label="Printful API Key (Required)"; Required=$true},
        @{Name="CANVA_API_KEY"; Label="Canva API Key (Optional)"; Required=$false},
        @{Name="STRIPE_API_KEY"; Label="Stripe API Key (Optional)"; Required=$false},
        @{Name="OPENAI_API_KEY"; Label="OpenAI API Key (Optional)"; Required=$false},
        @{Name="SENTRY_DSN"; Label="Sentry DSN (Optional)"; Required=$false}
    )

    $textboxes = @{}
    $yPos = 50

    foreach ($key in $apiKeys) {
        # Label
        $label = New-Object System.Windows.Forms.Label
        $label.Text = $key.Label
        $label.Location = New-Object System.Drawing.Point(10, $yPos)
        $label.Size = New-Object System.Drawing.Size(180, 20)
        if ($key.Required) {
            $label.ForeColor = [System.Drawing.Color]::Red
        }
        $form.Controls.Add($label)

        # Textbox
        $textbox = New-Object System.Windows.Forms.TextBox
        $textbox.Location = New-Object System.Drawing.Point(200, $yPos)
        $textbox.Size = New-Object System.Drawing.Size(270, 20)
        $textbox.UseSystemPasswordChar = $true

        # Load existing value if available
        $existingValue = Load-ApiKey $key.Name
        if ($existingValue) {
            $textbox.Text = $existingValue
        }

        $form.Controls.Add($textbox)
        $textboxes[$key.Name] = $textbox

        $yPos += 40
    }

    # Show/Hide passwords checkbox
    $showPasswords = New-Object System.Windows.Forms.CheckBox
    $showPasswords.Text = "Show API keys"
    $showPasswords.Location = New-Object System.Drawing.Point(200, $yPos)
    $showPasswords.Size = New-Object System.Drawing.Size(150, 20)
    $showPasswords.Add_CheckedChanged({
        foreach ($tb in $textboxes.Values) {
            $tb.UseSystemPasswordChar = -not $showPasswords.Checked
        }
    })
    $form.Controls.Add($showPasswords)

    $yPos += 40

    # Buttons
    $saveButton = New-Object System.Windows.Forms.Button
    $saveButton.Text = "Save & Continue"
    $saveButton.Location = New-Object System.Drawing.Point(120, $yPos)
    $saveButton.Size = New-Object System.Drawing.Size(120, 35)
    $saveButton.BackColor = [System.Drawing.Color]::LightGreen
    $saveButton.Add_Click({
        # Validate required fields
        $printfulKey = $textboxes["PRINTFUL_API_KEY"].Text
        if ([string]::IsNullOrWhiteSpace($printfulKey)) {
            [System.Windows.Forms.MessageBox]::Show(
                "Printful API Key is required for the automation to work!",
                "Missing Required Field",
                [System.Windows.Forms.MessageBoxButtons]::OK,
                [System.Windows.Forms.MessageBoxIcon]::Warning
            )
            return
        }

        # Save all keys
        foreach ($key in $apiKeys) {
            $value = $textboxes[$key.Name].Text
            if (-not [string]::IsNullOrWhiteSpace($value)) {
                Save-ApiKey $key.Name $value
            }
        }

        $form.DialogResult = [System.Windows.Forms.DialogResult]::OK
        $form.Close()
    })
    $form.Controls.Add($saveButton)

    $cancelButton = New-Object System.Windows.Forms.Button
    $cancelButton.Text = "Cancel"
    $cancelButton.Location = New-Object System.Drawing.Point(260, $yPos)
    $cancelButton.Size = New-Object System.Drawing.Size(120, 35)
    $cancelButton.Add_Click({
        $form.DialogResult = [System.Windows.Forms.DialogResult]::Cancel
        $form.Close()
    })
    $form.Controls.Add($cancelButton)

    # Show form
    $form.Add_Shown({$form.Activate()})
    $result = $form.ShowDialog()

    if ($result -eq [System.Windows.Forms.DialogResult]::OK) {
        Write-Host "[SUCCESS] API Keys saved successfully!" -ForegroundColor Green
        return $true
    } else {
        Write-Host "[WARNING] Setup cancelled" -ForegroundColor Yellow
        return $false
    }
}

# ============================================
# TOOL VALIDATION & INSTALLATION
# ============================================

function Test-Command {
    param([string]$Command)
    return $null -ne (Get-Command $Command -ErrorAction SilentlyContinue)
}

function Ensure-Requirements {
    Write-Host ""
    Write-Host "[INFO] Checking requirements..." -ForegroundColor Cyan

    # Check Git
    if (-not (Test-Command "git")) {
        Write-Host "[ERROR] Git is not installed!" -ForegroundColor Red
        Write-Host "Download from: https://git-scm.com/download/win" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "[OK] Git found" -ForegroundColor Green

    # Check Node.js
    if (-not (Test-Command "node")) {
        Write-Host "[ERROR] Node.js is not installed!" -ForegroundColor Red
        Write-Host "Download from: https://nodejs.org" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "[OK] Node.js found" -ForegroundColor Green

    # Check npm
    if (-not (Test-Command "npm")) {
        Write-Host "[ERROR] npm is not installed!" -ForegroundColor Red
        exit 1
    }
    Write-Host "[OK] npm found" -ForegroundColor Green

    # Check/Install Vercel CLI
    if (-not (Test-Command "vercel")) {
        Write-Host "[INFO] Installing Vercel CLI..." -ForegroundColor Cyan
        npm install -g vercel
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[ERROR] Failed to install Vercel CLI" -ForegroundColor Red
            exit 1
        }
    }
    Write-Host "[OK] Vercel CLI found" -ForegroundColor Green

    Write-Host "[SUCCESS] All requirements met!" -ForegroundColor Green
}

# ============================================
# ENVIRONMENT FILE MANAGEMENT
# ============================================

function Update-EnvFile {
    Write-Host ""
    Write-Host "[INFO] Updating .env file..." -ForegroundColor Cyan

    # Read existing .env or create new
    $envContent = @()
    if (Test-Path $envPath) {
        $envContent = Get-Content $envPath | Where-Object {
            $_ -notmatch "^PRINTFUL_API_KEY=" -and
            $_ -notmatch "^CANVA_API_KEY=" -and
            $_ -notmatch "^STRIPE_API_KEY=" -and
            $_ -notmatch "^OPENAI_API_KEY=" -and
            $_ -notmatch "^SENTRY_DSN="
        }
    }

    # Add API keys
    $keys = @("PRINTFUL_API_KEY", "CANVA_API_KEY", "STRIPE_API_KEY", "OPENAI_API_KEY", "SENTRY_DSN")
    foreach ($keyName in $keys) {
        $keyValue = Load-ApiKey $keyName
        if ($keyValue) {
            $envContent += "$keyName=$keyValue"
        }
    }

    # Generate secrets if missing
    $jwtSecret = ($envContent | Select-String "^JWT_SECRET=") -replace "JWT_SECRET=", ""
    if (-not $jwtSecret -or $jwtSecret -match "your_jwt_secret") {
        $jwtSecret = node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
        $envContent = $envContent | Where-Object { $_ -notmatch "^JWT_SECRET=" }
        $envContent += "JWT_SECRET=$jwtSecret"
        Write-Host "[INFO] Generated new JWT_SECRET" -ForegroundColor Cyan
    }

    $cronSecret = ($envContent | Select-String "^CRON_SECRET=") -replace "CRON_SECRET=", ""
    if (-not $cronSecret -or $cronSecret -match "your_cron_secret") {
        $cronSecret = node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
        $envContent = $envContent | Where-Object { $_ -notmatch "^CRON_SECRET=" }
        $envContent += "CRON_SECRET=$cronSecret"
        Write-Host "[INFO] Generated new CRON_SECRET" -ForegroundColor Cyan
    }

    # Write to file
    $envContent | Out-File -FilePath $envPath -Encoding UTF8

    Write-Host "[SUCCESS] .env file updated!" -ForegroundColor Green
}

# ============================================
# DEPENDENCY INSTALLATION
# ============================================

function Install-Dependencies {
    Write-Host ""
    Write-Host "[INFO] Installing dependencies..." -ForegroundColor Cyan

    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Failed to install dependencies" -ForegroundColor Red
        exit 1
    }

    # Install frontend dependencies if exists
    if (Test-Path "$PSScriptRoot\frontend\package.json") {
        Write-Host "[INFO] Installing frontend dependencies..." -ForegroundColor Cyan
        npm install --prefix frontend
    }

    Write-Host "[SUCCESS] Dependencies installed!" -ForegroundColor Green
}

# ============================================
# BACKEND STARTUP & HEALTH CHECK
# ============================================

function Start-Backend {
    Write-Host ""
    Write-Host "[INFO] Starting backend server..." -ForegroundColor Cyan

    # Kill any existing node processes on the port
    Stop-Process -Name node -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2

    # Start backend
    Start-Process powershell -ArgumentList "-Command cd '$PSScriptRoot'; npm run dev" -WindowStyle Minimized

    Write-Host "[INFO] Waiting for backend to start..." -ForegroundColor Cyan

    $maxAttempts = 30
    $attempt = 0
    $backendReady = $false

    while ($attempt -lt $maxAttempts -and -not $backendReady) {
        $attempt++
        Write-Host "Attempt $attempt/$maxAttempts..." -ForegroundColor Gray

        try {
            $response = Invoke-WebRequest -Uri "$backendUrl/api/health" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
            if ($response.StatusCode -eq 200) {
                $backendReady = $true
                break
            }
        } catch {
            # Backend not ready yet
        }

        Start-Sleep -Seconds 2
    }

    if (-not $backendReady) {
        Write-Host "[ERROR] Backend failed to start after $maxAttempts attempts" -ForegroundColor Red
        Write-Host "Check the backend console for errors" -ForegroundColor Yellow
        exit 1
    }

    # Get health status
    try {
        $health = Invoke-RestMethod -Uri "$backendUrl/api/health" -UseBasicParsing
        Write-Host "[SUCCESS] Backend is online!" -ForegroundColor Green
        Write-Host "Health Status:" -ForegroundColor Cyan
        Write-Host ($health | ConvertTo-Json -Depth 3)
    } catch {
        Write-Host "[WARNING] Backend started but health check failed" -ForegroundColor Yellow
    }
}

# ============================================
# FRONTEND STARTUP
# ============================================

function Start-Frontend {
    if (-not (Test-Path "$PSScriptRoot\frontend\package.json")) {
        Write-Host "[INFO] No frontend found, skipping..." -ForegroundColor Cyan
        return
    }

    Write-Host ""
    Write-Host "[INFO] Starting frontend..." -ForegroundColor Cyan

    Start-Process powershell -ArgumentList "-Command cd '$PSScriptRoot\frontend'; npm run dev" -WindowStyle Minimized
    Start-Sleep -Seconds 5

    Write-Host "[SUCCESS] Frontend starting at $frontendUrl" -ForegroundColor Green
    Write-Host "[INFO] Opening browser..." -ForegroundColor Cyan
    Start-Process $frontendUrl
}

# ============================================
# DEPLOYMENT
# ============================================

function Deploy-ToCloud {
    param([switch]$SkipVercel, [switch]$SkipRender)

    Write-Host ""
    Write-Host "================================================================" -ForegroundColor Blue
    Write-Host "        DEPLOYING TO CLOUD PLATFORMS                            " -ForegroundColor Blue
    Write-Host "================================================================" -ForegroundColor Blue
    Write-Host ""

    if (-not $SkipVercel) {
        Write-Host "[INFO] Deploying to Vercel..." -ForegroundColor Cyan
        vercel --prod

        if ($LASTEXITCODE -eq 0) {
            Write-Host "[SUCCESS] Vercel deployment complete!" -ForegroundColor Green
        } else {
            Write-Host "[ERROR] Vercel deployment failed" -ForegroundColor Red
        }
    }

    if (-not $SkipRender) {
        Write-Host ""
        Write-Host "[INFO] For Render deployment:" -ForegroundColor Cyan
        Write-Host "1. Push your code to GitHub" -ForegroundColor Yellow
        Write-Host "2. Render will auto-deploy from your repository" -ForegroundColor Yellow
        Write-Host "3. Configure environment variables in Render dashboard" -ForegroundColor Yellow
        Write-Host "   Dashboard: https://dashboard.render.com" -ForegroundColor Cyan
    }
}

# ============================================
# MAIN EXECUTION
# ============================================

Write-Host ""
Write-Host "================================================================" -ForegroundColor Blue
Write-Host "                                                                " -ForegroundColor Blue
Write-Host "        AUTOMATED PROFIT SYSTEM - COMPLETE SETUP                " -ForegroundColor Blue
Write-Host "                                                                " -ForegroundColor Blue
Write-Host "================================================================" -ForegroundColor Blue
Write-Host ""

# Step 1: API Key Management
$keysSaved = Show-ApiKeyManager
if (-not $keysSaved) {
    Write-Host "[ERROR] Setup cancelled by user" -ForegroundColor Red
    exit 1
}

# Step 2: Check Requirements
Ensure-Requirements

# Step 3: Update .env
Update-EnvFile

# Step 4: Install Dependencies
Install-Dependencies

# Step 5: Start Backend
Start-Backend

# Step 6: Start Frontend
Start-Frontend

# Step 7: Ask about deployment
Write-Host ""
$deploy = Read-Host "Would you like to deploy to Vercel now? (y/n)"
if ($deploy -eq 'y' -or $deploy -eq 'Y') {
    Deploy-ToCloud
}

Write-Host ""
Write-Host "================================================================" -ForegroundColor Green
Write-Host "                                                                " -ForegroundColor Green
Write-Host "        SETUP COMPLETE!                                         " -ForegroundColor Green
Write-Host "                                                                " -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend: $backendUrl" -ForegroundColor Cyan
Write-Host "Frontend: $frontendUrl" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Test the automation: node master-automation.js --immediate" -ForegroundColor White
Write-Host "2. View logs: Get-Content data\master-automation.log -Tail 50" -ForegroundColor White
Write-Host "3. Deploy updates: .\deploy-unified-simple.ps1" -ForegroundColor White
Write-Host ""
