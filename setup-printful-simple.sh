#!/bin/bash

echo ""
echo "🚀 PRINTFUL API SETUP - QUICK CONFIGURATION"
echo "═══════════════════════════════════════════════════"
echo ""
echo "📋 STEP 1: Get your Printful API Key"
echo ""
echo "   1. Open: https://www.printful.com/dashboard/settings"
echo "   2. Click 'API' in the left sidebar"
echo "   3. Click 'Enable API Access'"
echo "   4. Copy the API key shown"
echo ""
echo "───────────────────────────────────────────────────"
echo ""

# Prompt for API key
read -p "📝 Paste your Printful API key here: " PRINTFUL_API_KEY

if [ -z "$PRINTFUL_API_KEY" ]; then
  echo "❌ API key cannot be empty!"
  exit 1
fi

echo ""
echo "🔍 Validating API key..."

# Test the API key
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $PRINTFUL_API_KEY" \
  https://api.printful.com/store/products)

if [ "$HTTP_CODE" == "200" ]; then
  echo "✅ API key is VALID!"
elif [ "$HTTP_CODE" == "401" ]; then
  echo "❌ API key is INVALID!"
  echo "   Please check your key and try again"
  exit 1
else
  echo "⚠️  Could not validate (network issue), but saving anyway..."
fi

echo ""
echo "📋 STEP 2: Saving to .env file"
echo ""

# Create or update .env file
if [ -f .env ]; then
  # Backup existing .env
  cp .env .env.backup
  echo "✅ Backed up existing .env to .env.backup"

  # Check if PRINTFUL_API_KEY exists
  if grep -q "PRINTFUL_API_KEY=" .env; then
    # Replace existing key
    sed -i "s/PRINTFUL_API_KEY=.*/PRINTFUL_API_KEY=$PRINTFUL_API_KEY/" .env
    echo "✅ Updated PRINTFUL_API_KEY in .env"
  else
    # Append new key
    echo "" >> .env
    echo "# Printful API Configuration" >> .env
    echo "PRINTFUL_API_KEY=$PRINTFUL_API_KEY" >> .env
    echo "✅ Added PRINTFUL_API_KEY to .env"
  fi
else
  # Create new .env file
  cat > .env << EOF
# Server Configuration
PORT=3003
NODE_ENV=production

# Printful API Configuration
PRINTFUL_API_KEY=$PRINTFUL_API_KEY
EOF
  echo "✅ Created new .env file with API key"
fi

echo ""
echo "📋 STEP 3: Verifying configuration"
echo ""

# Show .env file (masked)
MASKED_KEY="${PRINTFUL_API_KEY:0:8}...${PRINTFUL_API_KEY: -4}"
echo "   PRINTFUL_API_KEY=$MASKED_KEY"
echo "   File location: $(pwd)/.env"

echo ""
echo "═══════════════════════════════════════════════════"
echo "✅ SETUP COMPLETE!"
echo ""
echo "Your Printful API key is configured and ready!"
echo ""
echo "Next steps:"
echo "  1. Restart server: npm start"
echo "  2. Test automation: curl http://localhost:3003/api/automation/discover/trending-products"
echo "  3. Read guide: cat AUTOMATION_GUIDE.md"
echo ""
echo "🚀 Happy automating!"
echo ""
