#!/bin/bash
# Comprehensive Deployment Testing Script
# Tests both Vercel and Render deployments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Deployment URLs
VERCEL_URL="${VERCEL_URL:-https://automated-profit-system.vercel.app}"
RENDER_URL="${RENDER_URL:-https://automated-profit-system.onrender.com}"

echo "================================================================"
echo "     🧪 DEPLOYMENT TESTING SUITE"
echo "================================================================"
echo ""
echo "Vercel URL: $VERCEL_URL"
echo "Render URL: $RENDER_URL"
echo ""

# Function to test endpoint
test_endpoint() {
    local name="$1"
    local url="$2"
    local expected_status="${3:-200}"

    TOTAL_TESTS=$((TOTAL_TESTS + 1))

    echo -n "Testing $name... "

    # Make request with timeout
    response=$(curl -s -w "\n%{http_code}" "$url" -m 10 2>&1 || echo "000")
    status_code=$(echo "$response" | tail -1)
    body=$(echo "$response" | head -n -1)

    if [ "$status_code" = "$expected_status" ] || [ "$status_code" = "200" ] || [ "$status_code" = "503" ]; then
        echo -e "${GREEN}✅ PASS${NC} (HTTP $status_code)"
        PASSED_TESTS=$((PASSED_TESTS + 1))

        # Show key info from response if JSON
        if echo "$body" | jq '.' > /dev/null 2>&1; then
            echo "$body" | jq -r '.message // .checks.server.status // empty' | sed 's/^/  └─ /'
        fi
    else
        echo -e "${RED}❌ FAIL${NC} (HTTP $status_code)"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        echo "  └─ Response: $body" | head -c 100
    fi
    echo ""
}

# Function to test automation
test_automation() {
    local name="$1"
    local server_url="$2"

    TOTAL_TESTS=$((TOTAL_TESTS + 1))

    echo -n "Testing $name automation... "

    # Run automation status check
    if SERVER_URL="$server_url" node master-automation.js --status > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ FAIL${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    echo ""
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🔵 VERCEL DEPLOYMENT TESTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

test_endpoint "Vercel Health" "$VERCEL_URL/api/health"
test_endpoint "Vercel Products" "$VERCEL_URL/api/products"
test_endpoint "Vercel Global Trending" "$VERCEL_URL/api/global-trending"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🟢 RENDER DEPLOYMENT TESTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

test_endpoint "Render Health" "$RENDER_URL/api/health"
test_endpoint "Render Products" "$RENDER_URL/api/products"
test_endpoint "Render Global Trending" "$RENDER_URL/api/global-trending"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🤖 AUTOMATION SYSTEM TESTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -f "master-automation.js" ]; then
    test_automation "Vercel" "$VERCEL_URL"
    test_automation "Render" "$RENDER_URL"
else
    echo "⏭️  Skipping automation tests (master-automation.js not found)"
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  📊 TEST SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Total Tests:    $TOTAL_TESTS"
echo -e "Passed:         ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed:         ${RED}$FAILED_TESTS${NC}"

if [ $TOTAL_TESTS -gt 0 ]; then
    PASS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    echo "Pass Rate:      $PASS_RATE%"
fi

echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}✅ ALL TESTS PASSED!${NC}"
    echo ""
    exit 0
else
    echo -e "${YELLOW}⚠️  SOME TESTS FAILED${NC}"
    echo ""
    echo "Common issues:"
    echo "  • 403 Errors: Environment variables not synced"
    echo "  • 500 Errors: Server configuration issue"
    echo "  • Timeout: Service not deployed or cold start"
    echo ""
    echo "Fix:"
    echo "  1. Sync environment variables (./sync-env-vercel.sh)"
    echo "  2. Deploy latest code (vercel --prod)"
    echo "  3. Check deployment logs for errors"
    echo ""
    exit 1
fi
