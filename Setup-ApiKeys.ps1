# ====================================================
# 🔑 API Key Setup Script for Deployment
# ====================================================
# Automatically loads your encrypted API keys and
# creates/updates your .env file for deployment
# ====================================================

$apiFile = "C:\Users\jerzi\automated-profit-system\automated-profit-system\api-keys.json"
$envFile = ".env"

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "║           🔑  API KEY SETUP FOR DEPLOYMENT  🔑             ║" -ForegroundColor Cyan
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Function to load & decrypt a key
function Load-ApiKey($name) {
    if (-not (Test-Path $apiFile)) {
        Write-Host "⚠️  API keys file not found: $apiFile" -ForegroundColor Yellow
        return $null
    }
    $data = Get-Content $apiFile | ConvertFrom-Json
    if ($data.$name) {
        $secure = $data.$name | ConvertTo-SecureString
        return [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure))
    }
    return $null
}

# Load all API keys
Write-Host "📥 Loading API keys from encrypted storage..." -ForegroundColor Cyan
$printfulKey = Load-ApiKey "PRINTFUL_API_KEY"
$stripeKey   = Load-ApiKey "STRIPE_API_KEY"
$openAIKey   = Load-ApiKey "OPENAI_API_KEY"
$canvaKey    = Load-ApiKey "CANVA_API_KEY"

# Show which keys were loaded
Write-Host ""
if ($printfulKey) { Write-Host "✅ Printful API Key loaded" -ForegroundColor Green } else { Write-Host "⚠️  Printful API Key not found" -ForegroundColor Yellow }
if ($stripeKey)   { Write-Host "✅ Stripe API Key loaded" -ForegroundColor Green } else { Write-Host "⚠️  Stripe API Key not found" -ForegroundColor Yellow }
if ($openAIKey)   { Write-Host "✅ OpenAI API Key loaded" -ForegroundColor Green } else { Write-Host "⚠️  OpenAI API Key not found" -ForegroundColor Yellow }
if ($canvaKey)    { Write-Host "✅ Canva API Key loaded" -ForegroundColor Green } else { Write-Host "⚠️  Canva API Key not found" -ForegroundColor Yellow }
Write-Host ""

# Generate JWT_SECRET and CRON_SECRET if needed
Write-Host "🔐 Generating security secrets..." -ForegroundColor Cyan
$jwtSecret = node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
$cronSecret = node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
Write-Host "✅ Security secrets generated" -ForegroundColor Green
Write-Host ""

# Create .env file
Write-Host "📝 Creating .env file..." -ForegroundColor Cyan

$envContent = @"
# ============================================
# AUTOMATED PROFIT SYSTEM - ENVIRONMENT CONFIG
# ============================================
# Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

# Server Configuration
NODE_ENV=production
PORT=3000

# ============================================
# SECURITY (REQUIRED)
# ============================================
JWT_SECRET=$jwtSecret
CRON_SECRET=$cronSecret

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# ============================================
# API KEYS
# ============================================
$(if ($printfulKey) { "PRINTFUL_API_KEY=$printfulKey" } else { "# PRINTFUL_API_KEY=your_printful_api_key_here" })
$(if ($canvaKey) { "CANVA_API_KEY=$canvaKey" } else { "# CANVA_API_KEY=your_canva_api_key_here" })
$(if ($stripeKey) { "STRIPE_API_KEY=$stripeKey" } else { "# STRIPE_API_KEY=your_stripe_api_key_here" })
$(if ($openAIKey) { "OPENAI_API_KEY=$openAIKey" } else { "# OPENAI_API_KEY=your_openai_api_key_here" })

# ============================================
# MASTER AUTOMATION CONFIGURATION
# ============================================

# Server URL (will be auto-detected on Vercel/Render)
SERVER_URL=http://localhost:3000

# Automation Settings
MAX_PRODUCTS=5
GENERATE_DESIGNS=true
CREATE_LISTINGS=true
GENERATE_MARKETING=true
GLOBAL_TRENDING=true

# Global Trending Regions
TRENDING_REGIONS=US,GB,CA,AU,DE,FR,JP,BR,IN,MX

# Automation Schedule (cron format)
# Default: Every Monday at 9:00 AM
AUTOMATION_SCHEDULE=0 9 * * 1

# ============================================
# OPTIONAL INTEGRATIONS
# ============================================

# Error Monitoring (Sentry)
# SENTRY_DSN=your_sentry_dsn_here

# Email Service
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_USER=your_email@gmail.com
# EMAIL_PASSWORD=your_email_password
"@

# Write to .env file
$envContent | Out-File -FilePath $envFile -Encoding UTF8

Write-Host "✅ .env file created successfully!" -ForegroundColor Green
Write-Host ""

# Show summary
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                    ✅ SETUP COMPLETE!                       ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Configuration Summary:" -ForegroundColor Cyan
Write-Host "   • .env file: Created ✅" -ForegroundColor White
Write-Host "   • JWT Secret: Generated ✅" -ForegroundColor White
Write-Host "   • Cron Secret: Generated ✅" -ForegroundColor White
if ($printfulKey) { Write-Host "   • Printful API: Loaded ✅" -ForegroundColor White }
if ($stripeKey)   { Write-Host "   • Stripe API: Loaded ✅" -ForegroundColor White }
if ($openAIKey)   { Write-Host "   • OpenAI API: Loaded ✅" -ForegroundColor White }
if ($canvaKey)    { Write-Host "   • Canva API: Loaded ✅" -ForegroundColor White }
Write-Host ""

# Copy keys to clipboard for Vercel/Render setup
Write-Host "📋 Clipboard Helper:" -ForegroundColor Cyan
Write-Host ""
Write-Host "I'll copy each key to your clipboard for easy setup in Vercel/Render dashboards:" -ForegroundColor Yellow
Write-Host ""

function Copy-KeyToClipboard($name, $value) {
    if ($value) {
        Write-Host "Press Enter to copy $name to clipboard..." -ForegroundColor Yellow
        Read-Host
        $value | Set-Clipboard
        Write-Host "✅ $name copied to clipboard!" -ForegroundColor Green
        Write-Host ""
    }
}

Write-Host "For Vercel & Render dashboards, you'll need these:" -ForegroundColor Cyan
Write-Host ""

Copy-KeyToClipboard "JWT_SECRET" $jwtSecret
Copy-KeyToClipboard "CRON_SECRET" $cronSecret
Copy-KeyToClipboard "PRINTFUL_API_KEY" $printfulKey
Copy-KeyToClipboard "STRIPE_API_KEY" $stripeKey
Copy-KeyToClipboard "OPENAI_API_KEY" $openAIKey
Copy-KeyToClipboard "CANVA_API_KEY" $canvaKey

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                   🚀 READY TO DEPLOY!                      ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Test locally (optional):" -ForegroundColor White
Write-Host "   node master-automation.js --status" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Deploy to Vercel & Render:" -ForegroundColor White
Write-Host "   .\deploy-unified.ps1" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Add environment variables to platform dashboards:" -ForegroundColor White
Write-Host "   • Vercel: https://vercel.com/dashboard → Settings → Environment Variables" -ForegroundColor Cyan
Write-Host "   • Render: https://dashboard.render.com → Environment tab" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Required variables for both platforms:" -ForegroundColor White
Write-Host "   - JWT_SECRET" -ForegroundColor Gray
Write-Host "   - CRON_SECRET" -ForegroundColor Gray
Write-Host "   - NODE_ENV=production" -ForegroundColor Gray
Write-Host "   - PRINTFUL_API_KEY (if you have it)" -ForegroundColor Gray
Write-Host ""
Write-Host "Press Enter to finish setup..." -ForegroundColor Yellow
Read-Host
Write-Host ""
Write-Host "Happy automating! 🎉💰" -ForegroundColor Green
Write-Host ""
