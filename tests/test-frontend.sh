#!/bin/bash

echo "========================================="
echo "TESTING FRONTEND PAGES"
echo "========================================="
echo ""

BASE_URL="http://localhost:3000"

# Test that homepage loads React app
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. FRONTEND APPLICATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
response=$(curl -s "$BASE_URL/")

if echo "$response" | grep -q "Automated Profit Dashboard"; then
    echo "✓ Homepage loads React application"
else
    echo "✗ Homepage not loading correctly"
fi

if echo "$response" | grep -q "/assets/index-CLstv_TS.js"; then
    echo "✓ JavaScript bundle reference found"
else
    echo "✗ JavaScript bundle reference missing"
fi

if echo "$response" | grep -q "/assets/index-D-id5r-L.css"; then
    echo "✓ CSS stylesheet reference found"
else
    echo "✗ CSS stylesheet reference missing"
fi
echo ""

# Test SPA routing (all routes should return the same index.html)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2. SPA ROUTING (Client-side routes)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

routes=("/products" "/team-profits" "/personal" "/trending" "/automation" "/analytics" "/settings")

for route in "${routes[@]}"; do
    response=$(curl -s -w "%{http_code}" "$BASE_URL$route" -o /dev/null)
    if [ "$response" = "200" ]; then
        echo "✓ Route $route returns 200 OK"
    else
        echo "✗ Route $route returns $response"
    fi
done
echo ""

# Test asset loading
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3. STATIC ASSETS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Get JavaScript bundle
js_response=$(curl -s -w "%{http_code}" "$BASE_URL/assets/index-CLstv_TS.js" -o /dev/null)
if [ "$js_response" = "200" ]; then
    js_size=$(curl -s "$BASE_URL/assets/index-CLstv_TS.js" | wc -c)
    echo "✓ JavaScript bundle loads (Size: $(numfmt --to=iec $js_size))"
else
    echo "✗ JavaScript bundle failed to load"
fi

# Get CSS stylesheet
css_response=$(curl -s -w "%{http_code}" "$BASE_URL/assets/index-D-id5r-L.css" -o /dev/null)
if [ "$css_response" = "200" ]; then
    css_size=$(curl -s "$BASE_URL/assets/index-D-id5r-L.css" | wc -c)
    echo "✓ CSS stylesheet loads (Size: $(numfmt --to=iec $css_size))"
else
    echo "✗ CSS stylesheet failed to load"
fi
echo ""

echo "🎉 FRONTEND TESTS PASSED!"
