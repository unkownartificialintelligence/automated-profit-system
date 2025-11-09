#!/bin/bash

# ========================================
# AUTOMATED PROFIT SYSTEM - QUICK START
# ========================================
# This script helps you start generating profits automatically
# with your Print-on-Demand business

echo "🚀 Starting Automated Profit System..."
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check if server is running
echo -e "${BLUE}[1/6] Checking server status...${NC}"
if curl -s http://localhost:3003/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Server is running${NC}"
else
    echo -e "${YELLOW}⚠️  Server not running. Starting server...${NC}"
    PORT=3003 npm start &
    sleep 5
    echo -e "${GREEN}✅ Server started on port 3003${NC}"
fi
echo ""

# Step 2: Get trending Christmas designs
echo -e "${BLUE}[2/6] Fetching trending Christmas designs...${NC}"
TRENDING=$(curl -s http://localhost:3003/api/christmas/trending)
echo "$TRENDING" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if data.get('success'):
    print('✅ Top 3 Trending Designs:')
    for design in data['trending'][:3]:
        print(f\"  • {design['name']} (Trend: {design['trendScore']}/100, Profit: \${design['estimatedProfit']})\" )
    print(f\"\\n💡 Days until Christmas: {data['urgency']['daysUntilChristmas']}\")
    print(f\"   {data['urgency']['currentStatus']}\")
" 2>/dev/null || echo "Could not parse trending data"
echo ""

# Step 3: Get best design recommendation
echo -e "${BLUE}[3/6] Getting design recommendation...${NC}"
DESIGN=$(curl -s http://localhost:3003/api/christmas/design/2)
echo "$DESIGN" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if data.get('success'):
    d = data['design']
    print(f\"📋 Recommended: {d['name']}\")
    print(f\"   Theme: {d['theme']}\")
    print(f\"   Profit Potential: {d['profitPotential']}\")
    print(f\"   Estimated Profit per T-shirt: \${d['pricing']['tshirt']['profit']}\")
    print(f\"\\n🎨 Quick Start Link:\")
    print(f\"   {data['quickStart']['canvaLink']}\")
" 2>/dev/null || echo "Could not parse design data"
echo ""

# Step 4: Check personal account status
echo -e "${BLUE}[4/6] Checking your personal account...${NC}"
PERSONAL=$(curl -s http://localhost:3003/api/personal/dashboard)
echo "$PERSONAL" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if data.get('success'):
    s = data['summary']
    print(f\"💰 Your Profit Dashboard:\")
    print(f\"   All-time profit: \${s['all_time']['profit']}\")
    print(f\"   Total sales: {s['all_time']['sales']}\")
    print(f\"   This month: {s['this_month']['sales']} sales, \${s['this_month']['profit']} profit\")
    print(f\"\\n🎯 Milestones:\")
    m = data['milestones']
    print(f\"   First Sale: {'✅' if m['first_sale'] else '⏳ Not yet'}\")
    print(f\"   \$100 Profit: {'✅' if m['hundred_dollars'] else '⏳ Not yet'}\")
    print(f\"   \$1000 Profit: {'✅' if m['thousand_dollars'] else '⏳ Not yet'}\")
" 2>/dev/null || echo "Could not parse dashboard data"
echo ""

# Step 5: Show automation workflow
echo -e "${BLUE}[5/6] Complete Automation Workflow:${NC}"
echo ""
echo -e "${GREEN}🎯 STEP-BY-STEP PROFIT GUIDE:${NC}"
echo ""
echo "1️⃣  DESIGN YOUR PRODUCT (15 minutes)"
echo "   → Get trending design: curl http://localhost:3003/api/christmas/random"
echo "   → Use the Canva link provided"
echo "   → Follow the color scheme and design tips"
echo "   → Download as PNG (transparent background)"
echo ""
echo "2️⃣  CREATE ON PRINTFUL (10 minutes)"
echo "   → Go to https://www.printful.com/dashboard"
echo "   → Add new product (T-shirt recommended)"
echo "   → Upload your design"
echo "   → Set retail price: \$24.99 (recommended)"
echo "   → Estimated profit: \$9.55 per sale"
echo ""
echo "3️⃣  LIST ON ETSY (15 minutes)"
echo "   → Connect Printful to Etsy"
echo "   → Sync your product"
echo "   → Add tags: christmas, funny christmas, christmas gift"
echo "   → Write compelling title and description"
echo ""
echo "4️⃣  PROMOTE & MARKET (ongoing)"
echo "   → Get marketing templates:"
echo "     curl -X POST http://localhost:3003/api/automation/outreach/email-template -H 'Content-Type: application/json' -d '{\"product_name\":\"Your Product\"}'
"
echo "   → Share on social media (Facebook, Instagram, TikTok)"
echo "   → Message friends and family"
echo "   → Post in relevant groups"
echo ""
echo "5️⃣  TRACK YOUR SALES"
echo "   → When you make a sale, record it:"
echo "     curl -X POST http://localhost:3003/api/personal/sales -H 'Content-Type: application/json' -d '{"
echo "       \"product_name\": \"Christmas T-Shirt\","
echo "       \"platform\": \"Etsy\","
echo "       \"sale_amount\": 24.99,"
echo "       \"printful_cost\": 15.44"
echo "     }'"
echo "   → View dashboard: curl http://localhost:3003/api/personal/dashboard"
echo ""

# Step 6: Next actions
echo -e "${BLUE}[6/6] Next Actions:${NC}"
echo ""
echo -e "${YELLOW}🎯 TO START MAKING MONEY NOW:${NC}"
echo ""
echo "Option 1: Quick Manual Start (Recommended for beginners)"
echo "  1. Open: http://localhost:3003/api/christmas/random"
echo "  2. Copy the Canva link and create your design"
echo "  3. Upload to Printful"
echo "  4. List on Etsy"
echo "  5. Start promoting!"
echo ""
echo "Option 2: Full Automation (Advanced)"
echo "  • Set up Printful API key (if not done):"
echo "    curl -X POST http://localhost:3003/api/automation/setup/printful-key -H 'Content-Type: application/json' -d '{\"api_key\":\"YOUR_KEY\"}'"
echo "  • Use auto-launch workflow:"
echo "    curl -X POST http://localhost:3003/api/automation/quick-launch -H 'Content-Type: application/json' -d '{\"niche\":\"christmas funny\",\"shop_url\":\"YOUR_SHOP_URL\"}'"
echo ""
echo -e "${GREEN}📊 Access your dashboard anytime:${NC}"
echo "  → http://localhost:3003/api/personal/dashboard"
echo ""
echo -e "${GREEN}🎄 Christmas is coming - Start NOW for maximum profits!${NC}"
echo ""
echo "========================================"
echo "System ready! Start creating and selling!"
echo "========================================"
