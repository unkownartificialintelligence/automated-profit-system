#!/bin/bash

##############################################################################
# 🔑 Quick API Key Updater
#
# Usage: ./update-api-key.sh PRINTFUL your_token_here
#        ./update-api-key.sh CANVA your_key_here
##############################################################################

if [ $# -ne 2 ]; then
  echo "Usage: $0 <API_NAME> <API_KEY>"
  echo ""
  echo "Examples:"
  echo "  $0 PRINTFUL pful_abc123..."
  echo "  $0 CANVA canva_xyz789..."
  echo ""
  exit 1
fi

API_NAME=$1
API_KEY=$2

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🔑 Updating ${API_NAME} API Key"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Backup .env
cp .env .env.backup
echo "✅ Backed up .env to .env.backup"

# Update the key
if grep -q "${API_NAME}_API_KEY=" .env; then
  # Key exists, update it
  sed -i "s|${API_NAME}_API_KEY=.*|${API_NAME}_API_KEY=${API_KEY}|g" .env
  echo "✅ Updated ${API_NAME}_API_KEY in .env"
else
  # Key doesn't exist, add it
  echo "${API_NAME}_API_KEY=${API_KEY}" >> .env
  echo "✅ Added ${API_NAME}_API_KEY to .env"
fi

echo ""
echo "Testing ${API_NAME} API..."

# Test the API
if [ "$API_NAME" = "PRINTFUL" ]; then
  response=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer ${API_KEY}" https://api.printful.com/store)
  if [ "$response" = "200" ]; then
    echo "✅ Printful API is working! ($response)"
  else
    echo "❌ Printful API test failed ($response)"
    echo "   Make sure this is a token from 'Manual API' store"
  fi
elif [ "$API_NAME" = "CANVA" ]; then
  echo "⚠️  Canva API test requires full restart to verify"
  echo "   Run ./deploy.sh to test"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Next Steps:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Restart server:"
echo "   ./deploy.sh"
echo ""
echo "2. Test automation:"
echo "   ./run-automation.sh"
echo ""
echo "3. Check status:"
echo "   ./setup-apis.sh"
echo ""
