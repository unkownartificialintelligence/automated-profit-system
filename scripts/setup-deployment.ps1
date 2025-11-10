# Automated Deployment Script for Windows
# Run this in PowerShell to generate your deployment configuration

Write-Host "🚀 Automated Deployment Setup" -ForegroundColor Green
Write-Host "==============================" -ForegroundColor Green
Write-Host ""

# Generate JWT_SECRET
Write-Host "🔐 Generating secure JWT_SECRET..." -ForegroundColor Yellow
$JWT_SECRET = node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
$JWT_TRUNCATED = $JWT_SECRET.Substring(0,20)
Write-Host "✅ JWT_SECRET generated: $JWT_TRUNCATED... (truncated for security)" -ForegroundColor Green
Write-Host ""

# Create deployment environment file
$envContent = @"
# 🔐 REQUIRED ENVIRONMENT VARIABLES FOR RENDER
# Copy these values into Render Dashboard → Environment

# ===== REQUIRED (Copy these to Render) =====
JWT_SECRET=$JWT_SECRET
NODE_ENV=production
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# ===== RECOMMENDED =====
SENTRY_DSN=your_sentry_dsn_here
LOG_LEVEL=info

# ===== OPTIONAL API KEYS =====
PRINTFUL_API_KEY=your_printful_api_key_here
STRIPE_API_KEY=your_stripe_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
CANVA_API_KEY=your_canva_api_key_here
"@

# Save to file
$envContent | Out-File -FilePath ".env.render" -Encoding UTF8

Write-Host "✅ Created .env.render file with your generated secrets" -ForegroundColor Green
Write-Host ""
Write-Host "📋 DEPLOYMENT CHECKLIST:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. ✅ JWT_SECRET generated" -ForegroundColor Green
Write-Host "2. ⏳ Go to: https://dashboard.render.com" -ForegroundColor Yellow
Write-Host "3. ⏳ Click: automated-profit-system" -ForegroundColor Yellow
Write-Host "4. ⏳ Settings → Branch → Set to: claude/launch-deployment-readiness-011CUxoxibbwV9VVqhA7kHVX" -ForegroundColor Yellow
Write-Host "5. ⏳ Environment → Add variables from .env.render file" -ForegroundColor Yellow
Write-Host "6. ⏳ Manual Deploy → Deploy latest commit" -ForegroundColor Yellow
Write-Host ""
Write-Host "📄 Your environment variables saved to: .env.render" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎯 NEXT STEPS:" -ForegroundColor Green
Write-Host "   1. Open .env.render file (in this directory)" -ForegroundColor White
Write-Host "   2. Copy values to Render dashboard" -ForegroundColor White
Write-Host "   3. Deploy!" -ForegroundColor White
Write-Host ""
Write-Host "🚀 READY TO DEPLOY!" -ForegroundColor Green

# Also display the JWT_SECRET for easy copying
Write-Host ""
Write-Host "=== COPY THIS JWT_SECRET ===" -ForegroundColor Magenta
Write-Host $JWT_SECRET -ForegroundColor Yellow
Write-Host "=============================" -ForegroundColor Magenta
