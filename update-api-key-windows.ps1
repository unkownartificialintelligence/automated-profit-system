# PowerShell API Key Update Script for Windows
# Usage: .\update-api-key-windows.ps1 <API_NAME> <API_KEY>
# Example: .\update-api-key-windows.ps1 PRINTFUL pful_abc123...

param(
    [Parameter(Mandatory=$true)]
    [string]$ApiName,

    [Parameter(Mandatory=$true)]
    [string]$ApiKey
)

Write-Host "=================================" -ForegroundColor Cyan
Write-Host "  API KEY UPDATER" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

$envFile = ".\.env"

# Backup .env
if (Test-Path $envFile) {
    Copy-Item $envFile "$envFile.backup"
    Write-Host "✅ Backed up .env to .env.backup" -ForegroundColor Green
} else {
    Write-Host "⚠️  .env file not found, creating new one" -ForegroundColor Yellow
    New-Item -Path $envFile -ItemType File | Out-Null
}

# Read current .env content
$envContent = @()
if (Test-Path $envFile) {
    $envContent = Get-Content $envFile
}

# Update or add the key
$keyName = "${ApiName}_API_KEY"
$keyExists = $false

$newContent = $envContent | ForEach-Object {
    if ($_ -match "^${keyName}=") {
        $keyExists = $true
        "${keyName}=${ApiKey}"
    } else {
        $_
    }
}

if (-not $keyExists) {
    $newContent += "${keyName}=${ApiKey}"
}

# Write back to file
$newContent | Set-Content $envFile

if ($keyExists) {
    Write-Host "✅ Updated ${keyName} in .env" -ForegroundColor Green
} else {
    Write-Host "✅ Added ${keyName} to .env" -ForegroundColor Green
}

Write-Host ""

# Test the API
if ($ApiName -eq "PRINTFUL") {
    Write-Host "Testing Printful API..." -ForegroundColor Yellow
    try {
        $headers = @{
            "Authorization" = "Bearer $ApiKey"
        }
        $response = Invoke-WebRequest -Uri "https://api.printful.com/store" -Headers $headers -Method Get -UseBasicParsing

        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Printful API is working! (200)" -ForegroundColor Green
        } else {
            Write-Host "❌ Printful API test returned: $($response.StatusCode)" -ForegroundColor Red
        }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "❌ Printful API test failed ($statusCode)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Restart server: .\deploy.sh" -ForegroundColor White
Write-Host "2. Test automation: .\run-automation-windows.ps1" -ForegroundColor White
Write-Host "3. Check status: .\test-apis.ps1" -ForegroundColor White
Write-Host ""
