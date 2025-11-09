#!/bin/bash

# ========================================
# AUTOMATED PRINTFUL ACCOUNT TESTING
# ========================================

set -e  # Exit on error

echo "🧪 AUTOMATED PRINTFUL ACCOUNT TEST"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test results
TESTS_PASSED=0
TESTS_FAILED=0
TOTAL_TESTS=7

# Function to print test result
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ PASSED${NC}: $2"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAILED${NC}: $2"
        ((TESTS_FAILED++))
    fi
    echo ""
}

# Function to check JSON response
check_success() {
    echo "$1" | python3 -c "import sys, json; data=json.load(sys.stdin); sys.exit(0 if data.get('success') else 1)" 2>/dev/null
    return $?
}

# Check if API key is provided as argument
if [ -z "$1" ]; then
    echo -e "${YELLOW}🔑 Printful API Key Required${NC}"
    echo ""
    echo "Usage: $0 YOUR_PRINTFUL_API_KEY"
    echo ""
    echo "To get your API key:"
    echo "1. Go to https://www.printful.com/dashboard/settings"
    echo "2. Click 'API' in the sidebar"
    echo "3. Click 'Enable API Access'"
    echo "4. Copy your API key"
    echo ""
    echo "Then run:"
    echo "  ./test-printful-account.sh pk_your_api_key_here"
    echo ""
    exit 1
fi

PRINTFUL_API_KEY="$1"

echo -e "${BLUE}Testing with API key:${NC} ${PRINTFUL_API_KEY:0:10}...${PRINTFUL_API_KEY: -4}"
echo ""

# ========================================
# TEST 1: Configure API Key
# ========================================
echo -e "${BLUE}[1/7] Configuring Printful API Key...${NC}"

RESPONSE=$(curl -s -X POST http://localhost:3003/api/automation/setup/printful-key \
  -H "Content-Type: application/json" \
  -d "{\"api_key\": \"$PRINTFUL_API_KEY\"}")

if check_success "$RESPONSE"; then
    print_result 0 "API Key configured successfully"
    echo "$RESPONSE" | python3 -m json.tool 2>/dev/null | head -20
else
    print_result 1 "API Key configuration failed"
    echo "$RESPONSE" | python3 -m json.tool 2>/dev/null
    echo ""
    echo "Please check your API key and try again."
    exit 1
fi

sleep 2

# ========================================
# TEST 2: Verify API Connection
# ========================================
echo -e "${BLUE}[2/7] Verifying Printful API Connection...${NC}"

RESPONSE=$(curl -s http://localhost:3003/api/automation/setup/test)

if check_success "$RESPONSE"; then
    print_result 0 "Printful API connection verified"

    # Extract connection details
    echo "$RESPONSE" | python3 -c "
import sys, json
data = json.load(sys.stdin)
tests = data.get('tests', {})
print(f\"  Printful Connection: {tests.get('printful_connection', 'Unknown')}\")
print(f\"  Automation Ready: {data.get('automation_ready', False)}\")
" 2>/dev/null
else
    print_result 1 "Printful API connection verification failed"
    echo "$RESPONSE" | python3 -m json.tool 2>/dev/null
fi

sleep 2

# ========================================
# TEST 3: Design Generation
# ========================================
echo -e "${BLUE}[3/7] Testing Design Generation...${NC}"

RESPONSE=$(curl -s -X POST http://localhost:3003/api/full-automation/generate-design \
  -H "Content-Type: application/json" \
  -d '{"design_id": 2, "custom_text": "TEST - Automated Printful Test"}')

if check_success "$RESPONSE"; then
    print_result 0 "Design generation working"

    # Save design for later use
    echo "$RESPONSE" > /tmp/test_design.json

    # Show design details
    echo "$RESPONSE" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(f\"  Template: {data['template_name']}\")
print(f\"  Text: {data['text_design']['main_text']}\")
print(f\"  Colors: {', '.join(data['text_design']['text_color'].split()[:2])}\")
print(f\"  Canva Link: {data['canva_link'][:50]}...\")
" 2>/dev/null
else
    print_result 1 "Design generation failed"
fi

sleep 2

# ========================================
# TEST 4: Trending Products Discovery
# ========================================
echo -e "${BLUE}[4/7] Testing Trending Products Discovery...${NC}"

RESPONSE=$(curl -s http://localhost:3003/api/automation/discover/trending-products)

if check_success "$RESPONSE"; then
    print_result 0 "Trending products discovery working"

    echo "$RESPONSE" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(f\"  Discovered: {data.get('discovered', 0)} trending products\")
top = data.get('top_opportunities', [])
if top:
    print(f\"  Top Opportunity: {top[0]['keyword']} (Trend: {top[0]['trend_score']}/100)\")
" 2>/dev/null
else
    print_result 1 "Trending products discovery failed"
fi

sleep 2

# ========================================
# TEST 5: Promotion Campaign Generation
# ========================================
echo -e "${BLUE}[5/7] Testing Promotion Campaign Generation...${NC}"

RESPONSE=$(curl -s -X POST http://localhost:3003/api/full-automation/auto-promote \
  -H "Content-Type: application/json" \
  -d '{"product_name": "TEST Product", "shop_url": "https://test-shop.com", "design_id": 2}')

if check_success "$RESPONSE"; then
    print_result 0 "Promotion campaign generation working"

    echo "$RESPONSE" | python3 -c "
import sys, json
data = json.load(sys.stdin)
campaign = data.get('campaign', {})
print(f\"  Product: {campaign.get('product', 'N/A')}\")
print(f\"  Duration: {campaign.get('duration', 'N/A')}\")
print(f\"  Target Reach: {campaign.get('target_reach', 'N/A')}\")
schedule = data.get('daily_schedule', [])
print(f\"  Campaign Days: {len(schedule)}\")
" 2>/dev/null
else
    print_result 1 "Promotion campaign generation failed"
fi

sleep 2

# ========================================
# TEST 6: Profit Tracking
# ========================================
echo -e "${BLUE}[6/7] Testing Profit Tracking...${NC}"

# Record a test sale
RESPONSE=$(curl -s -X POST http://localhost:3003/api/personal/sales \
  -H "Content-Type: application/json" \
  -d '{
    "product_name": "AUTOMATED TEST - Delete This",
    "platform": "Printful Test",
    "sale_amount": 24.99,
    "printful_cost": 15.44,
    "platform_fees": 1.50,
    "transaction_fees": 0.80,
    "notes": "Automated test sale - can be deleted"
  }')

if check_success "$RESPONSE"; then
    print_result 0 "Profit tracking working"

    echo "$RESPONSE" | python3 -c "
import sys, json
data = json.load(sys.stdin)
sale = data.get('sale', {})
print(f\"  Sale Amount: \${sale.get('sale_amount', '0.00')}\")
print(f\"  Profit: \${sale.get('profit', '0.00')}\")
print(f\"  Margin: {sale.get('profit_margin', '0%')}\")
" 2>/dev/null
else
    print_result 1 "Profit tracking failed"
fi

# Verify dashboard
echo ""
echo "  Checking dashboard..."
DASHBOARD=$(curl -s http://localhost:3003/api/personal/dashboard)

echo "$DASHBOARD" | python3 -c "
import sys, json
data = json.load(sys.stdin)
summary = data.get('summary', {}).get('all_time', {})
print(f\"  Total Sales: {summary.get('sales', 0)}\")
print(f\"  Total Profit: \${summary.get('profit', '0.00')}\")
" 2>/dev/null

sleep 2

# ========================================
# TEST 7: Complete Automation Workflow
# ========================================
echo -e "${BLUE}[7/7] Testing Complete Automation Workflow...${NC}"

RESPONSE=$(curl -s -X POST http://localhost:3003/api/full-automation/profit-in-one-click \
  -H "Content-Type: application/json" \
  -d "{\"design_id\": 2, \"printful_api_key\": \"$PRINTFUL_API_KEY\"}")

if check_success "$RESPONSE"; then
    print_result 0 "Complete automation workflow working"

    echo "$RESPONSE" | python3 -c "
import sys, json
data = json.load(sys.stdin)
steps = data.get('steps', [])
print(f\"  Workflow Steps: {len(steps)}\")
for step in steps:
    status = '✅' if '✅' in step.get('status', '') else '⏳'
    print(f\"    {status} {step.get('name', 'Unknown')}\")
" 2>/dev/null
else
    print_result 1 "Complete automation workflow failed"
fi

echo ""
echo "========================================"
echo -e "${BLUE}TEST SUMMARY${NC}"
echo "========================================"
echo ""
echo -e "Total Tests: ${TOTAL_TESTS}"
echo -e "${GREEN}Passed: ${TESTS_PASSED}${NC}"
echo -e "${RED}Failed: ${TESTS_FAILED}${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED!${NC}"
    echo ""
    echo "Your Printful account is fully configured and working!"
    echo ""
    echo "✅ Next Steps:"
    echo "1. Create a real design (not test)"
    echo "2. Upload design to Imgur or cloud storage"
    echo "3. Run: curl -X POST http://localhost:3003/api/full-automation/auto-list \\"
    echo "     -H 'Content-Type: application/json' \\"
    echo "     -d '{\"design_url\":\"YOUR_IMAGE_URL\",\"printful_api_key\":\"$PRINTFUL_API_KEY\"}'"
    echo "4. Check Printful dashboard for your product"
    echo "5. Start selling!"
    echo ""
    echo "🚀 System Status: READY FOR PRODUCTION"
else
    echo -e "${RED}⚠️  SOME TESTS FAILED${NC}"
    echo ""
    echo "Please review the errors above and:"
    echo "1. Verify your Printful API key is correct"
    echo "2. Check that the server is running (http://localhost:3003)"
    echo "3. Review PRINTFUL_TESTING_GUIDE.md for troubleshooting"
    echo ""
    echo "For help: Check logs or contact support"
fi

echo ""
echo "Test completed at: $(date)"
echo "========================================"

exit $TESTS_FAILED
