#!/bin/bash

##############################################################################
# ⚡ QUICK START - Top 1 Product Only
#
# Runs automation for the highest-profit product only.
# Perfect for testing or when you want to start small.
#
# Usage: ./quick-start.sh
##############################################################################

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ⚡ QUICK START - Top Product Automation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Processing: Top 1 highest-profit product"
echo "Started: $(date)"
echo ""

curl -X POST http://localhost:3003/api/full-automation/quick-start \
  -H "Content-Type: application/json" \
  | python3 -m json.tool

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ QUICK START COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Completed: $(date)"
echo ""
