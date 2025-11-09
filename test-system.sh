#!/bin/bash

# =====================================================
# AUTOMATED PROFIT SYSTEM - COMPLETE TESTING SCRIPT
# =====================================================

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     TESTING AUTOMATED PROFIT SYSTEM - ALL COMPONENTS        ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
PASSED=0
FAILED=0

# Function to run test
run_test() {
    local test_name=$1
    local command=$2

    echo -e "${BLUE}Testing: ${test_name}${NC}"

    if eval $command > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASSED${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC}"
        ((FAILED++))
    fi
    echo ""
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 1: Checking Prerequisites"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

run_test "Node.js installed" "node --version"
run_test "npm installed" "npm --version"
run_test "Git installed" "git --version"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 2: Checking Project Files"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

run_test "package.json exists" "test -f package.json"
run_test "Frontend exists" "test -d frontend"
run_test "Server file exists" "test -f src/server.js"
run_test "Admin routes exist" "test -f src/routes/admin.js"
run_test "Marketing routes exist" "test -f src/routes/marketing.js"
run_test "Profit routes exist" "test -f src/routes/profits.js"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 3: Checking Setup Scripts"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

run_test "Admin setup script exists" "test -f setup-admin.js"
run_test "Marketing setup script exists" "test -f setup-marketing.js"
run_test "Profit tracking setup exists" "test -f setup-profit-tracking.js"
run_test "Profit generator exists" "test -f generate-profits.js"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 4: Checking Deployment Scripts"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

run_test "Deploy-MENU.ps1 exists" "test -f Deploy-MENU.ps1"
run_test "Deploy-OWNER.ps1 exists" "test -f Deploy-OWNER.ps1"
run_test "Deploy-TEAM.ps1 exists" "test -f Deploy-TEAM.ps1"
run_test "vercel.json exists" "test -f vercel.json"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 5: Checking Documentation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

run_test "README.md exists" "test -f README.md"
run_test "ADMIN-GUIDE.md exists" "test -f ADMIN-GUIDE.md"
run_test "MARKETING-AUTOMATION.md exists" "test -f MARKETING-AUTOMATION.md"
run_test "DEPLOYMENT.md exists" "test -f DEPLOYMENT.md"
run_test ".env.example exists" "test -f .env.example"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 6: Checking Dependencies"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓ Backend dependencies installed${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ Backend dependencies NOT installed${NC}"
    echo "  Run: npm install"
    ((FAILED++))
fi
echo ""

if [ -d "frontend/node_modules" ]; then
    echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ Frontend dependencies NOT installed${NC}"
    echo "  Run: cd frontend && npm install"
    ((FAILED++))
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║           ✓ ALL TESTS PASSED - SYSTEM READY!                ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Initialize databases:"
    echo "     node setup-admin.js"
    echo "     node setup-marketing.js"
    echo "     node setup-profit-tracking.js"
    echo ""
    echo "  2. Generate profits:"
    echo "     node generate-profits.js"
    echo ""
    echo "  3. Start the system:"
    echo "     npm start (backend)"
    echo "     cd frontend && npm run dev (frontend)"
    echo ""
else
    echo -e "${RED}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║      ✗ SOME TESTS FAILED - CHECK ABOVE FOR DETAILS          ║${NC}"
    echo -e "${RED}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
fi
