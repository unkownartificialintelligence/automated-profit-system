#!/bin/bash

echo "========================================="
echo "AUTOMATED PROFIT SYSTEM - API TEST SUITE"
echo "========================================="
echo ""

BASE_URL="http://localhost:3000"
PASS=0
FAIL=0

# Function to test endpoint
test_endpoint() {
    local name=$1
    local url=$2
    local expected_code=${3:-200}

    echo -n "Testing $name... "

    response=$(curl -s -w "\n%{http_code}" "$BASE_URL$url")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)

    if [ "$http_code" = "$expected_code" ]; then
        echo "✓ PASS (HTTP $http_code)"
        ((PASS++))
        return 0
    else
        echo "✗ FAIL (Expected HTTP $expected_code, got $http_code)"
        ((FAIL++))
        return 1
    fi
}

# Function to test JSON response
test_json_field() {
    local name=$1
    local url=$2
    local field=$3

    echo -n "Testing $name... "

    response=$(curl -s "$BASE_URL$url")

    if echo "$response" | jq -e "$field" > /dev/null 2>&1; then
        value=$(echo "$response" | jq -r "$field")
        echo "✓ PASS ($field = $value)"
        ((PASS++))
        return 0
    else
        echo "✗ FAIL (Field $field not found)"
        ((FAIL++))
        return 1
    fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. HEALTH CHECK"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_endpoint "Health Endpoint" "/api/health" 200
test_json_field "Health Status" "/api/health" ".status"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2. DASHBOARD API"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_endpoint "Dashboard Endpoint" "/api/dashboard" 200
test_json_field "Dashboard Stats" "/api/dashboard" ".stats.totalRevenue"
test_json_field "Revenue Chart" "/api/dashboard" ".revenueChart[0].month"
test_json_field "Automation Status" "/api/dashboard" ".automationStatus.active"
test_json_field "Trending Products" "/api/dashboard" ".trendingProducts[0].keyword"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3. PRODUCTS API"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_endpoint "Products List" "/api/products" 200
test_json_field "Products Stats" "/api/products" ".stats.total"
test_json_field "Products Array" "/api/products" ".products"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4. ANALYTICS API"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_endpoint "Analytics Endpoint" "/api/analytics" 200
test_json_field "Analytics Summary" "/api/analytics" ".summary.totalRevenue"
test_json_field "Revenue by Month" "/api/analytics" ".revenueByMonth[0].month"
test_json_field "Revenue by Category" "/api/analytics" ".revenueByCategory[0].category"
test_json_field "Top Products" "/api/analytics" ".topProducts[0].name"
test_json_field "Daily Metrics" "/api/analytics" ".dailyMetrics[0].date"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5. TEAM PROFITS API"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_endpoint "Team Profits Endpoint" "/api/team-profits" 200
test_json_field "Team Stats" "/api/team-profits" ".stats.totalRevenue"
test_json_field "Team Members" "/api/team-profits" ".teamMembers[0].name"
test_json_field "Monthly Data" "/api/team-profits" ".monthlyData[0].month"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6. AUTOMATION API"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_endpoint "Automation Status" "/api/automation/status" 200
test_json_field "Automation Active" "/api/automation/status" ".active"
test_json_field "Total Runs" "/api/automation/status" ".total_runs"
test_endpoint "Automation Runs" "/api/automation/runs" 200
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "7. SETTINGS API"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_endpoint "Settings Endpoint" "/api/settings" 200
test_json_field "Profile Settings" "/api/settings" ".profile"
test_json_field "API Keys" "/api/settings" ".apiKeys"
test_json_field "Preferences" "/api/settings" ".preferences"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "8. FRONTEND SERVING"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_endpoint "Frontend Index" "/" 200
test_endpoint "JavaScript Bundle" "/assets/index-CLstv_TS.js" 200
test_endpoint "CSS Stylesheet" "/assets/index-D-id5r-L.css" 200
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✓ Passed: $PASS"
echo "✗ Failed: $FAIL"
echo "Total:   $((PASS + FAIL))"
echo ""

if [ $FAIL -eq 0 ]; then
    echo "🎉 ALL TESTS PASSED!"
    exit 0
else
    echo "⚠️  SOME TESTS FAILED"
    exit 1
fi
