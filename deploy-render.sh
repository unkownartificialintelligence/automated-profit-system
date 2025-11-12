#!/bin/bash
# Render Deployment Helper Script
# This script generates environment variables and provides deployment instructions

echo "================================================"
echo "  Render Deployment Helper"
echo "================================================"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found"
    exit 1
fi

echo "✅ .env file found"
echo ""

# Create render-env-vars.txt with environment variables
echo "📝 Generating Render environment variables..."
echo ""
echo "# Render Environment Variables" > render-env-vars.txt
echo "# Copy these to Render Dashboard → Your Service → Environment" >> render-env-vars.txt
echo "# Generated: $(date)" >> render-env-vars.txt
echo "" >> render-env-vars.txt

# Parse .env and create Render format
while IFS='=' read -r key value; do
    # Skip comments and empty lines
    if [[ $key =~ ^#.* ]] || [ -z "$key" ]; then
        continue
    fi

    # Remove quotes from value if present
    value=$(echo "$value" | sed 's/^["'\'']//' | sed 's/["'\'']$//')

    # Skip empty or placeholder values
    if [ -z "$value" ] || [[ "$value" == "your_"* ]]; then
        echo "# $key=(not set - add manually if needed)" >> render-env-vars.txt
        continue
    fi

    # Add to render-env-vars.txt
    echo "$key=$value" >> render-env-vars.txt

done < .env

echo "✅ Created render-env-vars.txt"
echo ""

# Display instructions
cat << 'EOF'
================================================
📋 RENDER DEPLOYMENT INSTRUCTIONS
================================================

STEP 1: Create Render Account (if you haven't already)
-------------------------------------------------------
1. Go to https://render.com
2. Sign up (free account available)
3. Connect your GitHub account

STEP 2: Deploy the Service
-------------------------------------------------------
Option A - Blueprint Deployment (Recommended):
1. Go to Render Dashboard: https://dashboard.render.com
2. Click "New" → "Blueprint"
3. Connect repository: unkownartificialintelligence/automated-profit-system
4. Select branch: claude/fix-issue-011CV3EX4MhR5SzS5GViqTzi
5. Render will detect render.yaml automatically
6. Click "Apply"

Option B - Manual Web Service:
1. Click "New" → "Web Service"
2. Connect your GitHub repository
3. Select branch: claude/fix-issue-011CV3EX4MhR5SzS5GViqTzi
4. Configure:
   - Name: automated-profit-system
   - Runtime: Node
   - Build Command: npm install && npm rebuild sqlite3
   - Start Command: npm start
   - Plan: Starter ($7/month recommended)
5. Click "Create Web Service"

STEP 3: Set Environment Variables
-------------------------------------------------------
1. In Render Dashboard, go to your service
2. Click "Environment" tab
3. Copy variables from render-env-vars.txt
4. Add each variable (Key and Value)
5. Click "Save Changes"

Important Variables:
- JWT_SECRET (required for authentication)
- CRON_SECRET (required for cron jobs)
- PRINTFUL_API_KEY (required for Printful integration)
- NODE_ENV=production

STEP 4: Deploy and Verify
-------------------------------------------------------
1. Render will automatically build and deploy (3-5 minutes)
2. Once deployed, test the health endpoint:

   curl https://your-app.onrender.com/api/health

3. Check that all systems are operational

STEP 5: Test Automation
-------------------------------------------------------
1. Run automation test:

   export SERVER_URL=https://your-app.onrender.com
   node master-automation.js --immediate

2. Verify in Render logs (Dashboard → Logs tab)

================================================
📁 FILES GENERATED
================================================

✅ render-env-vars.txt - Copy to Render Dashboard

================================================
💰 RENDER PRICING
================================================

Free Tier:
- Good for testing
- ⚠️  Spins down after 15 min inactivity
- ⚠️  Cold starts on first request

Starter Plan ($7/month) - RECOMMENDED:
- Always on (no spin down)
- Fast response times
- 512 MB RAM
- Perfect for automation

================================================
🔗 USEFUL LINKS
================================================

- Render Dashboard: https://dashboard.render.com
- Render Docs: https://render.com/docs
- render.yaml reference: https://render.com/docs/yaml-spec

================================================
✅ NEXT STEPS
================================================

1. Go to https://dashboard.render.com
2. Follow the deployment steps above
3. Set environment variables from render-env-vars.txt
4. Wait for deployment to complete
5. Test your endpoints!

================================================
EOF

echo ""
echo "✅ Render deployment helper complete!"
echo "📄 Check render-env-vars.txt for your environment variables"
echo ""
