#!/bin/bash
# Sync Environment Variables to Vercel Production
# Run this script after authenticating with: vercel login

echo "================================================"
echo "  Syncing Environment Variables to Vercel"
echo "================================================"
echo ""

# Check if vercel CLI is available
if ! command -v vercel &> /dev/null; then
    echo "❌ Error: Vercel CLI not found"
    echo "Install with: npm install -g vercel"
    exit 1
fi

# Check if authenticated
if ! vercel whoami &> /dev/null; then
    echo "❌ Error: Not authenticated with Vercel"
    echo "Please run: vercel login"
    exit 1
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found"
    exit 1
fi

echo "✅ Vercel CLI ready"
echo "✅ .env file found"
echo ""

# Function to add environment variable
add_env_var() {
    local key=$1
    local value=$2

    if [ -z "$value" ] || [ "$value" = "your_"* ] || [ "$value" = "" ]; then
        echo "⏭️  Skipping $key (empty or placeholder)"
        return
    fi

    echo "Setting $key..."
    echo "$value" | vercel env add "$key" production --yes 2>&1 | grep -q "Created" && echo "  ✅ $key set" || echo "  ℹ️  $key already exists"
}

echo "📤 Syncing environment variables..."
echo ""

# Parse .env and sync variables
while IFS='=' read -r key value; do
    # Skip comments and empty lines
    if [[ $key =~ ^#.* ]] || [ -z "$key" ]; then
        continue
    fi

    # Remove quotes from value if present
    value=$(echo "$value" | sed 's/^["'\'']//' | sed 's/["'\'']$//')

    # Add the variable
    add_env_var "$key" "$value"

done < .env

echo ""
echo "================================================"
echo "✅ Environment Variables Sync Complete"
echo "================================================"
echo ""
echo "Next steps:"
echo "  1. Deploy to production: vercel --prod"
echo "  2. Test deployment: curl https://your-app.vercel.app/api/health"
echo ""
