#!/bin/bash
# Automated Deployment Script for Render
# This generates your .env file ready for deployment

echo "🚀 Automated Deployment Setup"
echo "=============================="
echo ""

# Generate JWT_SECRET
echo "🔐 Generating secure JWT_SECRET..."
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
echo "✅ JWT_SECRET generated: ${JWT_SECRET:0:20}... (truncated for security)"
echo ""

# Create deployment .env template
cat > .env.render << EOF
# 🔐 REQUIRED ENVIRONMENT VARIABLES FOR RENDER
# Copy these values into Render Dashboard → Environment

# ===== REQUIRED =====
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
EOF

echo "✅ Created .env.render file with your generated secrets"
echo ""
echo "📋 DEPLOYMENT CHECKLIST:"
echo ""
echo "1. ✅ JWT_SECRET generated"
echo "2. ⏳ Go to: https://dashboard.render.com"
echo "3. ⏳ Click: automated-profit-system"
echo "4. ⏳ Settings → Branch → Set to: claude/launch-deployment-readiness-011CUxoxibbwV9VVqhA7kHVX"
echo "5. ⏳ Environment → Add variables from .env.render file"
echo "6. ⏳ Manual Deploy → Deploy latest commit"
echo ""
echo "📄 Your environment variables are in: .env.render"
echo "📖 Full guide: RENDER_DEPLOYMENT_AUTOMATION.md"
echo ""
echo "🎯 READY TO DEPLOY!"
