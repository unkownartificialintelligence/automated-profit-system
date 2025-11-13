#!/bin/bash

echo "========================================="
echo "TESTING DATA OPERATIONS (CRUD)"
echo "========================================="
echo ""

BASE_URL="http://localhost:3000"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. CREATE PRODUCT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Creating test product..."
response=$(curl -s -X POST "$BASE_URL/api/products" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test T-Shirt",
    "sku": "TEST-001",
    "price": 24.99,
    "status": "active",
    "description": "Test product for API validation"
  }')

product_id=$(echo "$response" | jq -r '.id')

if [ "$product_id" != "null" ] && [ -n "$product_id" ]; then
    echo "✓ Product created successfully (ID: $product_id)"
else
    echo "✗ Failed to create product"
    echo "Response: $response"
    exit 1
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2. READ PRODUCT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Fetching product ID $product_id..."
response=$(curl -s "$BASE_URL/api/products/$product_id")
product_name=$(echo "$response" | jq -r '.name')

if [ "$product_name" = "Test T-Shirt" ]; then
    echo "✓ Product fetched successfully: $product_name"
else
    echo "✗ Failed to fetch product"
    exit 1
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3. UPDATE PRODUCT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Updating product ID $product_id..."
response=$(curl -s -X PUT "$BASE_URL/api/products/$product_id" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated T-Shirt",
    "sku": "TEST-001",
    "price": 29.99,
    "status": "active",
    "description": "Updated description"
  }')

updated_name=$(echo "$response" | jq -r '.name')
updated_price=$(echo "$response" | jq -r '.price')

if [ "$updated_name" = "Updated T-Shirt" ] && [ "$updated_price" = "29.99" ]; then
    echo "✓ Product updated successfully: $updated_name @ \$$updated_price"
else
    echo "✗ Failed to update product"
    exit 1
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4. LIST PRODUCTS (verify it appears)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
response=$(curl -s "$BASE_URL/api/products")
total=$(echo "$response" | jq -r '.stats.total')

if [ "$total" -ge 1 ]; then
    echo "✓ Products list contains $total product(s)"
else
    echo "✗ Failed to list products"
    exit 1
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5. DELETE PRODUCT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Deleting product ID $product_id..."
response=$(curl -s -X DELETE "$BASE_URL/api/products/$product_id")
message=$(echo "$response" | jq -r '.message')

if [ "$message" = "Product deleted successfully" ]; then
    echo "✓ Product deleted successfully"
else
    echo "✗ Failed to delete product"
    exit 1
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6. START/STOP AUTOMATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Starting automation..."
response=$(curl -s -X POST "$BASE_URL/api/automation/start")
active=$(echo "$response" | jq -r '.status.active')

if [ "$active" = "1" ]; then
    echo "✓ Automation started successfully"
else
    echo "✗ Failed to start automation"
    exit 1
fi

echo "Stopping automation..."
response=$(curl -s -X POST "$BASE_URL/api/automation/stop")
active=$(echo "$response" | jq -r '.status.active')

if [ "$active" = "0" ]; then
    echo "✓ Automation stopped successfully"
else
    echo "✗ Failed to stop automation"
    exit 1
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "7. UPDATE SETTINGS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Updating user settings..."
response=$(curl -s -X PUT "$BASE_URL/api/settings" \
  -H "Content-Type: application/json" \
  -d '{
    "profile": {
      "name": "Test User",
      "email": "test@example.com",
      "company": "Test Company",
      "phone": "+1234567890"
    },
    "preferences": {
      "emailNotifications": false,
      "automationAlerts": true,
      "weeklyReports": true,
      "theme": "dark",
      "language": "en"
    }
  }')

updated_name=$(echo "$response" | jq -r '.settings.profile.name')
updated_theme=$(echo "$response" | jq -r '.settings.preferences.theme')

if [ "$updated_name" = "Test User" ] && [ "$updated_theme" = "dark" ]; then
    echo "✓ Settings updated successfully: $updated_name, theme: $updated_theme"
else
    echo "✗ Failed to update settings"
    exit 1
fi
echo ""

echo "🎉 ALL DATA OPERATIONS PASSED!"
