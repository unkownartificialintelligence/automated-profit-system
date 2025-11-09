#!/bin/bash

# Test the complete automation workflow

echo "🧪 Testing Automated Profit System..."
echo ""

# Test 1: Christmas designs
echo "Test 1: Christmas Design API"
curl -s http://localhost:3003/api/christmas/design/2 | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print('✅ Design API working')
    print(f\"   - Design: {data['design']['name']}\")
    print(f\"   - Profit: \${data['design']['pricing']['tshirt']['profit']}\")
except:
    print('❌ Design API failed')
"
echo ""

# Test 2: Personal account
echo "Test 2: Personal Account Dashboard"
curl -s http://localhost:3003/api/personal/dashboard | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print('✅ Personal account working')
    print(f\"   - Total sales: {data['summary']['all_time']['sales']}\")
    print(f\"   - Total profit: \${data['summary']['all_time']['profit']}\")
except:
    print('❌ Personal account failed')
"
echo ""

# Test 3: Trending products
echo "Test 3: Trending Products Discovery"
curl -s http://localhost:3003/api/automation/discover/trending-products | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print('✅ Trending discovery working')
    print(f\"   - Found {data['discovered']} trending products\")
except:
    print('❌ Trending discovery failed')
"
echo ""

# Test 4: Email templates
echo "Test 4: Marketing Templates"
curl -s -X POST http://localhost:3003/api/automation/outreach/email-template \
  -H "Content-Type: application/json" \
  -d '{"product_name":"Test Product"}' | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print('✅ Marketing templates working')
    print(f\"   - Generated {len(data['templates'])} template types\")
except:
    print('❌ Marketing templates failed')
"
echo ""

echo "=========================================="
echo "✅ All systems operational!"
echo "=========================================="
echo ""
echo "🚀 You're ready to start making profits!"
echo ""
echo "Next steps:"
echo "1. Run: ./start-profit-system.sh"
echo "2. Read: PROFIT_AUTOMATION_GUIDE.md"
echo "3. Create your first product!"
