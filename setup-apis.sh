#!/bin/bash

##############################################################################
# 🔑 API Configuration Helper
#
# This script helps you set up API keys for 100% automation
##############################################################################

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🔑 API CONFIGURATION HELPER"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Function to test API key
test_api() {
  local name=$1
  local key=$2
  local test_url=$3

  echo "Testing $name API..."
  if [ -z "$key" ] || [ "$key" = "your_${name,,}_api_key_here" ]; then
    echo "  ❌ NOT CONFIGURED"
    return 1
  fi

  # Test the API
  if [ "$name" = "PRINTFUL" ]; then
    status=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $key" "$test_url")
  elif [ "$name" = "CANVA" ]; then
    status=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $key" "$test_url")
  fi

  if [ "$status" = "200" ]; then
    echo "  ✅ WORKING ($status)"
    return 0
  else
    echo "  ❌ FAILED ($status)"
    return 1
  fi
}

# Check current .env configuration
echo "=== STEP 1: Checking Current Configuration ==="
echo ""

if [ ! -f ".env" ]; then
  echo "❌ .env file not found!"
  echo "   Creating from .env.example..."
  if [ -f ".env.example" ]; then
    cp .env.example .env
    echo "✅ Created .env file"
  else
    echo "❌ No .env.example found either!"
    exit 1
  fi
fi

# Load current values
source .env 2>/dev/null

echo "Current API Status:"
echo ""

# Test Printful API
echo "1. PRINTFUL API:"
if [ -n "$PRINTFUL_API_KEY" ] && [ "$PRINTFUL_API_KEY" != "your_printful_api_key_here" ]; then
  test_api "PRINTFUL" "$PRINTFUL_API_KEY" "https://api.printful.com/store"
  PRINTFUL_STATUS=$?
else
  echo "  ⚠️  NOT CONFIGURED"
  PRINTFUL_STATUS=1
fi
echo ""

# Test Canva API
echo "2. CANVA API:"
if [ -n "$CANVA_API_KEY" ] && [ "$CANVA_API_KEY" != "your_canva_api_key_here" ]; then
  test_api "CANVA" "$CANVA_API_KEY" "https://api.canva.com/v1/designs"
  CANVA_STATUS=$?
else
  echo "  ⚠️  NOT CONFIGURED"
  CANVA_STATUS=1
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Provide guidance based on status
if [ $PRINTFUL_STATUS -ne 0 ]; then
  echo "=== FIX PRINTFUL API (CRITICAL) ==="
  echo ""
  echo "Your Printful API token is either missing or returning 403 errors."
  echo "This is likely because you're using a Platform Integration store token."
  echo ""
  echo "📋 How to Fix (15 minutes):"
  echo ""
  echo "1. Go to Printful Dashboard"
  echo "   https://www.printful.com/dashboard"
  echo ""
  echo "2. Settings → Stores → Create New Store"
  echo "   Select: 'Manual Order Platform / API'"
  echo "   Name it: 'Automated Profit System API'"
  echo ""
  echo "3. Go to Developer Portal"
  echo "   https://developers.printful.com/"
  echo ""
  echo "4. Create API Client"
  echo "   - Click 'Create API Client'"
  echo "   - Name: 'Automation System'"
  echo "   - Select your Manual API store"
  echo ""
  echo "5. Generate Private Token"
  echo "   - Click 'Generate Private Token'"
  echo "   - Copy the token (starts with 'pful_...')"
  echo ""
  echo "6. Update .env file:"
  echo "   nano .env"
  echo "   Update: PRINTFUL_API_KEY=your_actual_token_here"
  echo ""
  echo "7. Test the token:"
  echo "   curl -H 'Authorization: Bearer YOUR_TOKEN' https://api.printful.com/store"
  echo ""
  echo "8. Restart server:"
  echo "   ./deploy.sh"
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
fi

if [ $CANVA_STATUS -ne 0 ]; then
  echo "=== ADD CANVA API (RECOMMENDED) ==="
  echo ""
  echo "Canva API enables automatic design creation (3-5 min → <30 sec)."
  echo ""
  echo "📋 How to Set Up (15 minutes):"
  echo ""
  echo "1. Visit Canva Developers"
  echo "   https://www.canva.com/developers/"
  echo ""
  echo "2. Create Developer Account"
  echo "   - Sign up with your Canva account"
  echo "   - Complete developer registration"
  echo ""
  echo "3. Create New App"
  echo "   - Click 'Create App'"
  echo "   - Name: 'Automated Profit System'"
  echo "   - Description: 'T-shirt design automation'"
  echo ""
  echo "4. Get API Key"
  echo "   - Go to app settings"
  echo "   - Copy 'API Key'"
  echo ""
  echo "5. Update .env file:"
  echo "   nano .env"
  echo "   Update: CANVA_API_KEY=your_actual_key_here"
  echo ""
  echo "6. Restart server:"
  echo "   ./deploy.sh"
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
fi

if [ $PRINTFUL_STATUS -eq 0 ] && [ $CANVA_STATUS -eq 0 ]; then
  echo "🎉 ALL APIs CONFIGURED AND WORKING!"
  echo ""
  echo "You now have 100% automation enabled!"
  echo ""
  echo "Next steps:"
  echo "  1. Run automation: ./run-automation.sh"
  echo "  2. Watch it auto-create designs and list products"
  echo "  3. Start earning!"
  echo ""
fi

# Calculate automation level
AUTOMATION_LEVEL=50
if [ $PRINTFUL_STATUS -eq 0 ]; then
  AUTOMATION_LEVEL=75
fi
if [ $CANVA_STATUS -eq 0 ]; then
  AUTOMATION_LEVEL=75
fi
if [ $PRINTFUL_STATUS -eq 0 ] && [ $CANVA_STATUS -eq 0 ]; then
  AUTOMATION_LEVEL=100
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Current Automation Level: $AUTOMATION_LEVEL%"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $AUTOMATION_LEVEL -lt 100 ]; then
  echo "💡 TIP: Get to 100% automation for 3-4x revenue increase!"
fi
