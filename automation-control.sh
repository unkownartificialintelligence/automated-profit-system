#!/bin/bash

# Automation Control Script
# Simple commands for team to manage automation

API_URL="http://localhost:3003"

case "$1" in

  "run")
    echo "🚀 Running full automation..."
    curl -X POST "$API_URL/api/canva/full-automation" \
      -H "Content-Type: application/json" \
      -d "{\"max_products\":${2:-3}}" | jq '.'
    ;;

  "dashboard")
    echo "📊 Fetching dashboard..."
    curl -s "$API_URL/api/canva/dashboard" | jq '.'
    ;;

  "status")
    echo "📈 Checking automation status..."
    curl -s "$API_URL/api/auto-launch/status" | jq '.'
    ;;

  "schedule")
    FREQ="${2:-weekly}"
    DAY="${3:-monday}"
    TIME="${4:-09:00}"
    PRODUCTS="${5:-3}"

    echo "⏰ Scheduling automation..."
    echo "  Frequency: $FREQ"
    echo "  Day: $DAY"
    echo "  Time: $TIME"
    echo "  Products per run: $PRODUCTS"

    curl -X POST "$API_URL/api/canva/schedule-automation" \
      -H "Content-Type: application/json" \
      -d "{\"frequency\":\"$FREQ\",\"day_of_week\":\"$DAY\",\"time\":\"$TIME\",\"max_products\":$PRODUCTS,\"enabled\":true}" | jq '.'
    ;;

  "discover")
    echo "🔍 Discovering trending products..."
    curl -s -X POST "$API_URL/api/auto-launch/discover-and-queue" \
      -H "Content-Type: application/json" \
      -d "{\"max_products\":${2:-5}}" | jq '.'
    ;;

  "profit")
    echo "💰 Checking personal profit..."
    curl -s "$API_URL/api/personal/total-profit" | jq '.'
    ;;

  "health")
    echo "🏥 Health check..."
    curl -s "$API_URL/api/health" | jq '.checks'
    ;;

  "help")
    cat <<EOF

Automation Control Commands
============================

./automation-control.sh run [num_products]
  Run full automation pipeline (default: 3 products)
  Example: ./automation-control.sh run 5

./automation-control.sh dashboard
  View real-time dashboard statistics

./automation-control.sh status
  Check automation and store status

./automation-control.sh schedule [frequency] [day] [time] [products]
  Schedule automated runs
  Example: ./automation-control.sh schedule weekly monday 09:00 3

./automation-control.sh discover [num]
  Discover trending products (default: 5)

./automation-control.sh profit
  Check total profit

./automation-control.sh health
  System health check

./automation-control.sh help
  Show this help message

Examples:
---------
# Run automation for 3 products now
./automation-control.sh run 3

# View dashboard
./automation-control.sh dashboard

# Schedule weekly automation every Monday at 9 AM
./automation-control.sh schedule weekly monday 09:00 3

# Check profit
./automation-control.sh profit

EOF
    ;;

  *)
    echo "❌ Unknown command: $1"
    echo "Run './automation-control.sh help' for usage"
    exit 1
    ;;
esac
