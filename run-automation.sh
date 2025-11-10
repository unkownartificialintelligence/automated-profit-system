#!/bin/bash

##############################################################################
# 🚀 ONE-COMMAND FULL AUTOMATION
#
# This script runs the complete automation pipeline:
# - Discovers trending products
# - Creates design specifications (or auto-creates with API)
# - Generates listing instructions (or auto-lists with API)
# - Creates marketing campaigns
#
# Usage: ./run-automation.sh [number_of_products]
# Example: ./run-automation.sh 3
##############################################################################

# Default to 3 products if no argument provided
MAX_PRODUCTS=${1:-3}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🚀 RUNNING FULL AUTOMATION PIPELINE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Processing: $MAX_PRODUCTS products"
echo "Started: $(date)"
echo ""

# Run the automation
curl -X POST http://localhost:3003/api/full-automation/run \
  -H "Content-Type: application/json" \
  -d "{\"use_todays_products\":true,\"max_products\":$MAX_PRODUCTS}" \
  | python3 -m json.tool

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ AUTOMATION COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Completed: $(date)"
echo ""
echo "📋 Check the output above for:"
echo "  • Products discovered"
echo "  • Designs created/instructions"
echo "  • Listings created/instructions"
echo "  • Marketing campaigns generated"
echo ""
echo "💡 Next steps shown in 'next_steps' field above"
echo ""
