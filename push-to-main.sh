#!/bin/bash

# Push to main with retry logic
MAX_RETRIES=4
RETRY_DELAY=2

echo "🚀 Pushing to main branch..."

for i in $(seq 1 $MAX_RETRIES); do
    echo "Attempt $i of $MAX_RETRIES..."
    
    if git push origin main 2>&1; then
        echo "✅ Successfully pushed to main!"
        exit 0
    else
        if [ $i -lt $MAX_RETRIES ]; then
            echo "⚠️ Push failed, retrying in ${RETRY_DELAY}s..."
            sleep $RETRY_DELAY
            RETRY_DELAY=$((RETRY_DELAY * 2))
        fi
    fi
done

echo "❌ Failed to push after $MAX_RETRIES attempts"
echo "This may be due to branch protection rules"
echo ""
echo "Alternative: Create PR manually at:"
echo "https://github.com/unkownartificialintelligence/automated-profit-system/compare/main...claude/api-health-check-011CUvak7c4T6GGE3V3S7b3F"
exit 1
