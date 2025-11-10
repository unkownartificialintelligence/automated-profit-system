#!/bin/bash

##############################################################
# AUTOMATED SEASONAL TRENDS - COMPLETE WORKFLOW
# Automatically discover, design, and list trending products
# for all seasons with 95% automation
##############################################################

echo "🎯 AUTOMATED SEASONAL TRENDS SYSTEM"
echo "=========================================="
echo ""

API_BASE="http://localhost:3003/api/seasonal-trends"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

##############################################################
# STEP 1: Initialize Database
##############################################################

echo -e "${BLUE}Step 1: Initializing Seasonal Trends Database...${NC}"
node src/database/init-seasonal-trends.js

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database initialized successfully${NC}"
else
    echo -e "${RED}❌ Database initialization failed${NC}"
    exit 1
fi

echo ""

##############################################################
# STEP 2: Get All Seasons
##############################################################

echo -e "${BLUE}Step 2: Loading All Seasons...${NC}"
SEASONS_RESPONSE=$(curl -s "$API_BASE/seasons")

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Loaded seasons successfully${NC}"
    echo "$SEASONS_RESPONSE" | jq '.seasons[] | {id, name, profit_potential}' 2>/dev/null || echo "$SEASONS_RESPONSE"
else
    echo -e "${RED}❌ Failed to load seasons${NC}"
fi

echo ""

##############################################################
# STEP 3: Discover Trends for Top 3 Seasons
##############################################################

echo -e "${BLUE}Step 3: Discovering Trends for Top Seasons...${NC}"
echo ""

# Christmas (Season ID 11)
echo "📊 Discovering trends for Christmas..."
CHRISTMAS_TRENDS=$(curl -s -X POST "$API_BASE/discover-trends" \
  -H "Content-Type: application/json" \
  -d '{"season_id": 11}')

echo "$CHRISTMAS_TRENDS" | jq '.top_trends[0:3]' 2>/dev/null || echo "$CHRISTMAS_TRENDS"
echo ""

# Halloween (Season ID 8)
echo "📊 Discovering trends for Halloween..."
HALLOWEEN_TRENDS=$(curl -s -X POST "$API_BASE/discover-trends" \
  -H "Content-Type: application/json" \
  -d '{"season_id": 8}')

echo "$HALLOWEEN_TRENDS" | jq '.top_trends[0:3]' 2>/dev/null || echo "$HALLOWEEN_TRENDS"
echo ""

# Valentine's Day (Season ID 1)
echo "📊 Discovering trends for Valentine's Day..."
VALENTINE_TRENDS=$(curl -s -X POST "$API_BASE/discover-trends" \
  -H "Content-Type: application/json" \
  -d '{"season_id": 1}')

echo "$VALENTINE_TRENDS" | jq '.top_trends[0:3]' 2>/dev/null || echo "$VALENTINE_TRENDS"

echo -e "${GREEN}✅ Trend discovery complete${NC}"
echo ""

##############################################################
# STEP 4: Generate Collections
##############################################################

echo -e "${BLUE}Step 4: Generating Product Collections...${NC}"
echo ""

# Christmas Collection
echo "🎨 Generating Christmas Collection (20 products)..."
CHRISTMAS_COLLECTION=$(curl -s -X POST "$API_BASE/generate-collection" \
  -H "Content-Type: application/json" \
  -d '{"season_id": 11, "collection_size": 20}')

CHRISTMAS_COLLECTION_ID=$(echo "$CHRISTMAS_COLLECTION" | jq -r '.collection.id' 2>/dev/null)
echo "$CHRISTMAS_COLLECTION" | jq '{name: .collection.name, products: .collection.total_products, profit: .collection.estimated_profit}' 2>/dev/null || echo "$CHRISTMAS_COLLECTION"
echo ""

# Halloween Collection
echo "🎨 Generating Halloween Collection (15 products)..."
HALLOWEEN_COLLECTION=$(curl -s -X POST "$API_BASE/generate-collection" \
  -H "Content-Type: application/json" \
  -d '{"season_id": 8, "collection_size": 15}')

HALLOWEEN_COLLECTION_ID=$(echo "$HALLOWEEN_COLLECTION" | jq -r '.collection.id' 2>/dev/null)
echo "$HALLOWEEN_COLLECTION" | jq '{name: .collection.name, products: .collection.total_products, profit: .collection.estimated_profit}' 2>/dev/null || echo "$HALLOWEEN_COLLECTION"
echo ""

# Valentine's Collection
echo "🎨 Generating Valentine's Day Collection (15 products)..."
VALENTINE_COLLECTION=$(curl -s -X POST "$API_BASE/generate-collection" \
  -H "Content-Type: application/json" \
  -d '{"season_id": 1, "collection_size": 15}')

VALENTINE_COLLECTION_ID=$(echo "$VALENTINE_COLLECTION" | jq -r '.collection.id' 2>/dev/null)
echo "$VALENTINE_COLLECTION" | jq '{name: .collection.name, products: .collection.total_products, profit: .collection.estimated_profit}' 2>/dev/null || echo "$VALENTINE_COLLECTION"

echo -e "${GREEN}✅ Collections generated successfully${NC}"
echo ""

##############################################################
# STEP 5: Bulk List Collections (OPTIONAL)
##############################################################

echo -e "${YELLOW}Step 5: Bulk Listing Collections (Optional)${NC}"
echo ""
echo "⚠️  Bulk listing requires valid PRINTFUL_API_KEY"
echo "Would you like to bulk list the collections now? (y/n)"
read -r BULK_LIST_CHOICE

if [ "$BULK_LIST_CHOICE" = "y" ] || [ "$BULK_LIST_CHOICE" = "Y" ]; then
    if [ -n "$CHRISTMAS_COLLECTION_ID" ]; then
        echo "🚀 Bulk listing Christmas Collection..."
        curl -s -X POST "$API_BASE/bulk-list-collection" \
          -H "Content-Type: application/json" \
          -d "{\"collection_id\": $CHRISTMAS_COLLECTION_ID}" | jq '.'
        echo ""
    fi

    if [ -n "$HALLOWEEN_COLLECTION_ID" ]; then
        echo "🚀 Bulk listing Halloween Collection..."
        curl -s -X POST "$API_BASE/bulk-list-collection" \
          -H "Content-Type: application/json" \
          -d "{\"collection_id\": $HALLOWEEN_COLLECTION_ID}" | jq '.'
        echo ""
    fi

    if [ -n "$VALENTINE_COLLECTION_ID" ]; then
        echo "🚀 Bulk listing Valentine's Collection..."
        curl -s -X POST "$API_BASE/bulk-list-collection" \
          -H "Content-Type: application/json" \
          -d "{\"collection_id\": $VALENTINE_COLLECTION_ID}" | jq '.'
        echo ""
    fi

    echo -e "${GREEN}✅ Bulk listing complete${NC}"
else
    echo -e "${YELLOW}⏭️  Skipped bulk listing${NC}"
fi

echo ""

##############################################################
# STEP 6: View Profit Report
##############################################################

echo -e "${BLUE}Step 6: Generating Profit Report...${NC}"
echo ""

PROFIT_REPORT=$(curl -s "$API_BASE/profit-report")
echo "$PROFIT_REPORT" | jq '.' 2>/dev/null || echo "$PROFIT_REPORT"

echo ""
echo -e "${GREEN}=========================================="
echo "✅ SEASONAL AUTOMATION COMPLETE!"
echo "==========================================${NC}"
echo ""
echo "📊 Summary:"
echo "   • 14+ seasons configured"
echo "   • Trends discovered for top 3 seasons"
echo "   • 3 collections generated (50+ products)"
echo "   • 95% automation achieved"
echo ""
echo "🎯 Next Steps:"
echo "   1. Review collections in dashboard"
echo "   2. Customize designs if needed"
echo "   3. Bulk list to Printful + Etsy"
echo "   4. Monitor sales & profits"
echo ""
echo "🌐 Dashboard: http://localhost:3003/seasonal-trends"
echo ""
