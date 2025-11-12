# ============================================
# 🧪 COMPREHENSIVE SERVER TEST SUITE
# ============================================
# Tests all server endpoints, automation, and deployments
#
# Usage:
#   .\Test-Server.ps1           # Test everything
#   .\Test-Server.ps1 -Local    # Test local server only
#   .\Test-Server.ps1 -Prod     # Test production only
# ============================================

param(
    [switch]$Local,
    [switch]$Prod,
    [switch]$Quick
)

$ErrorActionPreference = "Continue"

# Test results tracking
$script:TestResults = @{
    Passed = 0
    Failed = 0
    Skipped = 0
    Tests = @()
}

function Write-TestHeader {
    param([string]$Title)
    Write-Host ""
    Write-Host "================================================================" -ForegroundColor Blue
    Write-Host "  $Title" -ForegroundColor Blue
    Write-Host "================================================================" -ForegroundColor Blue
    Write-Host ""
}

function Write-TestResult {
    param(
        [string]$TestName,
        [bool]$Passed,
        [string]$Message = ""
    )

    $result = @{
        Name = $TestName
        Passed = $Passed
        Message = $Message
        Timestamp = Get-Date
    }

    $script:TestResults.Tests += $result

    if ($Passed) {
        $script:TestResults.Passed++
        Write-Host "[PASS] $TestName" -ForegroundColor Green
        if ($Message) { Write-Host "       $Message" -ForegroundColor Gray }
    } else {
        $script:TestResults.Failed++
        Write-Host "[FAIL] $TestName" -ForegroundColor Red
        if ($Message) { Write-Host "       $Message" -ForegroundColor Yellow }
    }
}

function Test-Endpoint {
    param(
        [string]$Url,
        [string]$Name,
        [string]$ExpectedStatus = "200"
    )

    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop

        if ($response.StatusCode -eq $ExpectedStatus) {
            Write-TestResult -TestName $Name -Passed $true -Message "Status: $($response.StatusCode)"
            return $true
        } else {
            Write-TestResult -TestName $Name -Passed $false -Message "Expected $ExpectedStatus, got $($response.StatusCode)"
            return $false
        }
    } catch {
        Write-TestResult -TestName $Name -Passed $false -Message $_.Exception.Message
        return $false
    }
}

function Test-JsonEndpoint {
    param(
        [string]$Url,
        [string]$Name,
        [string]$ExpectedProperty
    )

    try {
        $response = Invoke-RestMethod -Uri $Url -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop

        if ($ExpectedProperty) {
            if ($response.PSObject.Properties.Name -contains $ExpectedProperty) {
                Write-TestResult -TestName $Name -Passed $true -Message "Property '$ExpectedProperty' found"
                return $true
            } else {
                Write-TestResult -TestName $Name -Passed $false -Message "Property '$ExpectedProperty' not found"
                return $false
            }
        } else {
            Write-TestResult -TestName $Name -Passed $true -Message "Response received"
            return $true
        }
    } catch {
        Write-TestResult -TestName $Name -Passed $false -Message $_.Exception.Message
        return $false
    }
}

function Test-LocalServer {
    Write-TestHeader "LOCAL SERVER TESTS"

    $localUrl = "http://localhost:3000"

    # Check if server is running
    Write-Host "Checking if server is running..." -ForegroundColor Cyan

    try {
        $health = Invoke-RestMethod -Uri "$localUrl/api/health" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        Write-TestResult -TestName "Server is running" -Passed $true

        # Display health info
        Write-Host ""
        Write-Host "Server Health Info:" -ForegroundColor Cyan
        Write-Host ($health | ConvertTo-Json -Depth 3)
        Write-Host ""
    } catch {
        Write-TestResult -TestName "Server is running" -Passed $false -Message "Server not responding. Start with: npm run dev"
        return $false
    }

    # Test core endpoints
    Write-Host "Testing core endpoints..." -ForegroundColor Cyan
    Test-JsonEndpoint -Url "$localUrl/api/health" -Name "Health endpoint" -ExpectedProperty "success"

    if (-not $Quick) {
        Test-Endpoint -Url "$localUrl/api/products" -Name "Products endpoint"
        Test-Endpoint -Url "$localUrl/api/personal" -Name "Personal endpoint"
        Test-Endpoint -Url "$localUrl/api/team-profits" -Name "Team profits endpoint"
        Test-Endpoint -Url "$localUrl/api-docs" -Name "API documentation"
    }

    return $true
}

function Test-ProductionServer {
    param([string]$ProdUrl)

    Write-TestHeader "PRODUCTION SERVER TESTS"

    Write-Host "Testing production URL: $ProdUrl" -ForegroundColor Cyan
    Write-Host ""

    # Test health endpoint
    Test-JsonEndpoint -Url "$ProdUrl/api/health" -Name "Production health endpoint" -ExpectedProperty "success"

    if (-not $Quick) {
        Test-Endpoint -Url "$ProdUrl/api/products" -Name "Production products endpoint"
        Test-Endpoint -Url "$ProdUrl/api/personal" -Name "Production personal endpoint"
    }
}

function Test-Automation {
    Write-TestHeader "AUTOMATION SYSTEM TESTS"

    # Check if master-automation.js exists
    if (-not (Test-Path "master-automation.js")) {
        Write-TestResult -TestName "Automation script exists" -Passed $false -Message "master-automation.js not found"
        return
    }
    Write-TestResult -TestName "Automation script exists" -Passed $true

    # Test --help
    Write-Host "Testing automation --help..." -ForegroundColor Cyan
    try {
        $helpOutput = node master-automation.js --help 2>&1
        if ($helpOutput -match "USAGE") {
            Write-TestResult -TestName "Automation --help" -Passed $true
        } else {
            Write-TestResult -TestName "Automation --help" -Passed $false
        }
    } catch {
        Write-TestResult -TestName "Automation --help" -Passed $false -Message $_.Exception.Message
    }

    # Test --status
    Write-Host "Testing automation --status..." -ForegroundColor Cyan
    try {
        $statusOutput = node master-automation.js --status 2>&1 | Out-String
        if ($statusOutput -match "AUTOMATION STATUS") {
            Write-TestResult -TestName "Automation --status" -Passed $true

            # Display status
            Write-Host ""
            Write-Host "Current Status:" -ForegroundColor Cyan
            Write-Host $statusOutput
        } else {
            Write-TestResult -TestName "Automation --status" -Passed $false
        }
    } catch {
        Write-TestResult -TestName "Automation --status" -Passed $false -Message $_.Exception.Message
    }
}

function Test-EnvironmentVariables {
    Write-TestHeader "ENVIRONMENT VARIABLES TEST"

    $envPath = ".env"

    if (-not (Test-Path $envPath)) {
        Write-TestResult -TestName ".env file exists" -Passed $false -Message "Run .\Setup-ApiKeys.ps1 first"
        return
    }
    Write-TestResult -TestName ".env file exists" -Passed $true

    $envContent = Get-Content $envPath -Raw

    # Check critical variables
    $requiredVars = @(
        "NODE_ENV",
        "JWT_SECRET",
        "PRINTFUL_API_KEY"
    )

    foreach ($var in $requiredVars) {
        if ($envContent -match "$var=.+") {
            $value = ($envContent | Select-String "$var=(.+)" | ForEach-Object { $_.Matches.Groups[1].Value })
            if ($value -notmatch "your_.*_here" -and $value.Length -gt 0) {
                Write-TestResult -TestName "Variable: $var" -Passed $true
            } else {
                Write-TestResult -TestName "Variable: $var" -Passed $false -Message "Placeholder value detected"
            }
        } else {
            Write-TestResult -TestName "Variable: $var" -Passed $false -Message "Not found in .env"
        }
    }
}

function Test-Dependencies {
    Write-TestHeader "DEPENDENCIES TEST"

    # Check if node_modules exists
    if (Test-Path "node_modules") {
        Write-TestResult -TestName "node_modules exists" -Passed $true
    } else {
        Write-TestResult -TestName "node_modules exists" -Passed $false -Message "Run: npm install"
        return
    }

    # Check package.json
    if (Test-Path "package.json") {
        Write-TestResult -TestName "package.json exists" -Passed $true

        try {
            $pkg = Get-Content "package.json" | ConvertFrom-Json
            Write-TestResult -TestName "package.json is valid JSON" -Passed $true

            # Check key dependencies
            $keyDeps = @("express", "axios", "dotenv")
            foreach ($dep in $keyDeps) {
                if ($pkg.dependencies.PSObject.Properties.Name -contains $dep) {
                    Write-TestResult -TestName "Dependency: $dep" -Passed $true
                } else {
                    Write-TestResult -TestName "Dependency: $dep" -Passed $false
                }
            }
        } catch {
            Write-TestResult -TestName "package.json is valid JSON" -Passed $false
        }
    } else {
        Write-TestResult -TestName "package.json exists" -Passed $false
    }
}

function Show-TestSummary {
    Write-Host ""
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host "  TEST SUMMARY" -ForegroundColor Cyan
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host ""

    $total = $script:TestResults.Passed + $script:TestResults.Failed
    $passRate = if ($total -gt 0) { [math]::Round(($script:TestResults.Passed / $total) * 100, 2) } else { 0 }

    Write-Host "Total Tests:  $total" -ForegroundColor White
    Write-Host "Passed:       $($script:TestResults.Passed)" -ForegroundColor Green
    Write-Host "Failed:       $($script:TestResults.Failed)" -ForegroundColor Red
    Write-Host "Pass Rate:    $passRate%" -ForegroundColor $(if ($passRate -ge 80) { "Green" } elseif ($passRate -ge 50) { "Yellow" } else { "Red" })
    Write-Host ""

    if ($script:TestResults.Failed -gt 0) {
        Write-Host "Failed Tests:" -ForegroundColor Red
        $script:TestResults.Tests | Where-Object { -not $_.Passed } | ForEach-Object {
            Write-Host "  - $($_.Name): $($_.Message)" -ForegroundColor Yellow
        }
        Write-Host ""
    }

    # Overall result
    if ($script:TestResults.Failed -eq 0) {
        Write-Host "✅ ALL TESTS PASSED!" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ SOME TESTS FAILED" -ForegroundColor Red
        return $false
    }
}

# ============================================
# MAIN EXECUTION
# ============================================

Write-Host ""
Write-Host "================================================================" -ForegroundColor Blue
Write-Host "          🧪 AUTOMATED PROFIT SYSTEM - TEST SUITE" -ForegroundColor Blue
Write-Host "================================================================" -ForegroundColor Blue
Write-Host ""

$startTime = Get-Date

# Run tests based on parameters
if (-not $Prod) {
    Test-Dependencies
    Test-EnvironmentVariables
    Test-LocalServer
    Test-Automation
}

if ($Prod -or (-not $Local -and -not $Prod)) {
    # Get production URL
    Write-Host "Getting production URL from Vercel..." -ForegroundColor Cyan
    try {
        $vercelList = vercel ls 2>&1 | Out-String
        if ($vercelList -match "https://(automated-profit-system-[a-z0-9]+-jerzii-ais-projects\.vercel\.app)") {
            $prodUrl = "https://$($matches[1])"
            Write-Host "Found: $prodUrl" -ForegroundColor Green
            Write-Host ""
            Test-ProductionServer -ProdUrl $prodUrl
        } else {
            Write-Host "Could not find production URL. Deploy first with: vercel --prod" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "Could not get Vercel deployments: $_" -ForegroundColor Yellow
    }
}

# Show summary
$endTime = Get-Date
$duration = $endTime - $startTime

Write-Host ""
Write-Host "Test Duration: $($duration.TotalSeconds) seconds" -ForegroundColor Cyan

$allPassed = Show-TestSummary

# Exit code
if ($allPassed) {
    exit 0
} else {
    exit 1
}
