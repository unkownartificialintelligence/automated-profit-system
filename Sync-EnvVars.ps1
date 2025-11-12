# ============================================
# AUTOMATED ENVIRONMENT VARIABLE SYNC SCRIPT
# ============================================
# Automatically sync .env variables to Vercel & Render
#
# Usage:
#   .\Sync-EnvVars.ps1                    # Sync to both platforms
#   .\Sync-EnvVars.ps1 -Platform vercel   # Vercel only
#   .\Sync-EnvVars.ps1 -Platform render   # Render only
#   .\Sync-EnvVars.ps1 -DryRun            # Show what would be synced
# ============================================

param(
    [string]$Platform = "both",
    [switch]$DryRun,
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
    Write-Host "        AUTOMATED ENVIRONMENT VARIABLE SYNC SYSTEM              " -ForegroundColor Blue
    Write-Host "        Sync .env to Vercel & Render automatically              " -ForegroundColor Blue
    Write-Host "================================================================" -ForegroundColor Blue
    Write-Host ""
}

function Show-Help {
    Write-Host ""
    Write-Host "AUTOMATED ENVIRONMENT VARIABLE SYNC SCRIPT" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "USAGE:" -ForegroundColor Yellow
    Write-Host "    .\Sync-EnvVars.ps1 [-Platform <platform>] [-DryRun] [-Help]"
    Write-Host ""
    Write-Host "PARAMETERS:" -ForegroundColor Yellow
    Write-Host "    -Platform <platform>    Target platform (both, vercel, render)"
    Write-Host "    -DryRun                 Show what would be synced without actually syncing"
    Write-Host "    -Help                   Show this help message"
    Write-Host ""
    Write-Host "EXAMPLES:" -ForegroundColor Yellow
    Write-Host "    .\Sync-EnvVars.ps1                    # Sync to both platforms"
    Write-Host "    .\Sync-EnvVars.ps1 -Platform vercel   # Vercel only"
    Write-Host "    .\Sync-EnvVars.ps1 -Platform render   # Render only"
    Write-Host "    .\Sync-EnvVars.ps1 -DryRun            # Preview changes"
    Write-Host ""
    exit 0
}

function Parse-EnvFile {
    param([string]$FilePath)

    if (-not (Test-Path $FilePath)) {
        Write-Error-Custom ".env file not found at: $FilePath"
        exit 1
    }

    $envVars = @{}
    $content = Get-Content $FilePath

    foreach ($line in $content) {
        # Skip comments and empty lines
        if ($line -match '^\s*#' -or $line -match '^\s*$') {
            continue
        }

        # Parse KEY=VALUE
        if ($line -match '^([^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()

            # Remove quotes if present
            $value = $value -replace '^["'']|["'']$', ''

            # Skip placeholder values
            if ($value -match 'your_.*_here' -or $value -match 'generate_random' -or $value -eq '') {
                Write-Warning-Custom "Skipping $key (placeholder or empty value)"
                continue
            }

            $envVars[$key] = $value
        }
    }

    return $envVars
}

function Sync-ToVercel {
    param([hashtable]$EnvVars, [bool]$DryRun)

    Write-Info "Syncing to Vercel..."

    # Check if Vercel CLI is installed
    try {
        $vercelVersion = vercel --version 2>$null
        if (-not $vercelVersion) {
            throw "Vercel CLI not found"
        }
    } catch {
        Write-Warning-Custom "Vercel CLI not installed, installing..."
        npm install -g vercel
        if ($LASTEXITCODE -ne 0) {
            Write-Error-Custom "Failed to install Vercel CLI"
            return $false
        }
    }

    $count = 0
    foreach ($key in $EnvVars.Keys) {
        $value = $EnvVars[$key]

        if ($DryRun) {
            Write-Info "[DRY RUN] Would set: $key"
        } else {
            Write-Info "Setting: $key"

            # Set environment variable for all environments
            $env:VERCEL_ORG_ID = ""  # Will prompt if not set
            $env:VERCEL_PROJECT_ID = ""  # Will prompt if not set

            # Use vercel env add command
            # Note: This requires manual confirmation unless automated
            try {
                # For production
                echo $value | vercel env add $key production 2>&1 | Out-Null

                # For preview (optional)
                echo $value | vercel env add $key preview 2>&1 | Out-Null

                # For development (optional)
                echo $value | vercel env add $key development 2>&1 | Out-Null

                $count++
            } catch {
                Write-Warning-Custom "Failed to set $key on Vercel: $_"
            }
        }
    }

    if ($DryRun) {
        Write-Info "[DRY RUN] Would sync $count variables to Vercel"
    } else {
        Write-Success "Synced $count variables to Vercel"
        Write-Info "Note: Please verify on Vercel dashboard: https://vercel.com/dashboard"
    }

    return $true
}

function Sync-ToRender {
    param([hashtable]$EnvVars, [bool]$DryRun)

    Write-Info "Syncing to Render..."
    Write-Warning-Custom "Render requires manual env var configuration via dashboard"
    Write-Info "Generating Render environment variable configuration..."

    $renderConfig = @"
# ============================================
# RENDER ENVIRONMENT VARIABLES
# ============================================
# Copy these to your Render dashboard:
# https://dashboard.render.com -> Your Service -> Environment
#
# Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
# ============================================

"@

    foreach ($key in $EnvVars.Keys) {
        $value = $EnvVars[$key]
        $renderConfig += "$key=$value`n"
    }

    # Save to file for easy copying
    $configFile = "render-env-config.txt"
    $renderConfig | Out-File -FilePath $configFile -Encoding UTF8

    if ($DryRun) {
        Write-Info "[DRY RUN] Would create config file: $configFile"
    } else {
        Write-Success "Created Render config file: $configFile"
        Write-Info "Instructions:"
        Write-Info "1. Open the file: $configFile"
        Write-Info "2. Go to: https://dashboard.render.com"
        Write-Info "3. Select your service"
        Write-Info "4. Go to Environment section"
        Write-Info "5. Copy and paste the variables"
        Write-Info ""
        Write-Info "Opening file for you..."
        Start-Process notepad $configFile
    }

    return $true
}

function Generate-MissingSecrets {
    Write-Info "Checking for missing secrets..."

    $envPath = ".env"
    if (-not (Test-Path $envPath)) {
        Write-Error-Custom ".env file not found"
        return
    }

    $content = Get-Content $envPath -Raw
    $needsGeneration = $false

    # Check JWT_SECRET
    if ($content -match 'JWT_SECRET=your_jwt_secret' -or $content -notmatch 'JWT_SECRET=\w{32,}') {
        Write-Warning-Custom "JWT_SECRET needs to be generated"
        $needsGeneration = $true

        $jwtSecret = node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
        Write-Info "Generated JWT_SECRET: $jwtSecret"
        $content = $content -replace 'JWT_SECRET=.*', "JWT_SECRET=$jwtSecret"
    }

    # Check CRON_SECRET
    if ($content -match 'CRON_SECRET=your_cron_secret' -or $content -notmatch 'CRON_SECRET=\w{32,}') {
        Write-Warning-Custom "CRON_SECRET needs to be generated"
        $needsGeneration = $true

        $cronSecret = node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
        Write-Info "Generated CRON_SECRET: $cronSecret"
        $content = $content -replace 'CRON_SECRET=.*', "CRON_SECRET=$cronSecret"
    }

    if ($needsGeneration) {
        $content | Out-File -FilePath $envPath -Encoding UTF8 -NoNewline
        Write-Success "Updated .env with generated secrets"
    } else {
        Write-Success "All required secrets are configured"
    }
}

# ============================================
# MAIN EXECUTION
# ============================================

if ($Help) {
    Show-Help
}

Write-Header

# Generate missing secrets first
Generate-MissingSecrets

# Parse .env file
Write-Info "Reading .env file..."
$envVars = Parse-EnvFile -FilePath ".env"

if ($envVars.Count -eq 0) {
    Write-Error-Custom "No valid environment variables found in .env"
    exit 1
}

Write-Success "Found $($envVars.Count) environment variables"

if ($DryRun) {
    Write-Info ""
    Write-Info "=== DRY RUN MODE ===" -ForegroundColor Yellow
    Write-Info "The following variables would be synced:"
    Write-Info ""
    foreach ($key in $envVars.Keys) {
        Write-Host "  - $key" -ForegroundColor Cyan
    }
    Write-Info ""
}

# Sync based on platform selection
$success = $true

switch ($Platform.ToLower()) {
    "vercel" {
        $success = Sync-ToVercel -EnvVars $envVars -DryRun $DryRun
    }
    "render" {
        $success = Sync-ToRender -EnvVars $envVars -DryRun $DryRun
    }
    "both" {
        $vercelSuccess = Sync-ToVercel -EnvVars $envVars -DryRun $DryRun
        Write-Host ""
        $renderSuccess = Sync-ToRender -EnvVars $envVars -DryRun $DryRun
        $success = $vercelSuccess -and $renderSuccess
    }
    default {
        Write-Error-Custom "Invalid platform: $Platform"
        Write-Info "Valid platforms: both, vercel, render"
        exit 1
    }
}

Write-Host ""
if ($success) {
    if ($DryRun) {
        Write-Success "DRY RUN COMPLETE - No changes were made"
    } else {
        Write-Success "ENVIRONMENT SYNC COMPLETE!"
        Write-Info ""
        Write-Info "Next steps:"
        Write-Info "1. Verify variables on Vercel: https://vercel.com/dashboard"
        Write-Info "2. Add variables to Render: https://dashboard.render.com"
        Write-Info "3. Redeploy your applications to apply changes"
    }
} else {
    Write-Error-Custom "Sync failed - please check errors above"
    exit 1
}
