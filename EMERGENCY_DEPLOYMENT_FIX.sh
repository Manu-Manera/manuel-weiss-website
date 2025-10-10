#!/bin/bash
# 🚨 EMERGENCY DEPLOYMENT FIX
# Sofortige Lösung für GitHub Deployment-Probleme

echo "🚨 EMERGENCY DEPLOYMENT FIX"
echo "============================="

# 1. GITHUB ACTIONS TRIGGERN
echo "🔄 Triggering GitHub Actions..."

# Force push to trigger deployment
git add .
git commit -m "🚨 Emergency Fix: Force deployment trigger" --allow-empty
git push origin main

echo "✅ GitHub Actions triggered"

# 2. NETLIFY DEPLOYMENT FALLBACK
echo "🌐 Checking Netlify deployment..."

# Check if Netlify CLI is available
if command -v netlify &> /dev/null; then
    echo "📦 Deploying to Netlify..."
    netlify deploy --prod
    echo "✅ Netlify deployment completed"
else
    echo "⚠️  Netlify CLI not found, using GitHub Actions only"
fi

# 3. VERIFY DEPLOYMENT STATUS
echo "🔍 Verifying deployment status..."

# Wait a moment for deployment
sleep 30

# Check if site is accessible
if curl -s -o /dev/null -w "%{http_code}" "https://mawps.netlify.app" | grep -q "200"; then
    echo "✅ Site is accessible: https://mawps.netlify.app"
else
    echo "❌ Site might not be accessible yet"
fi

echo ""
echo "🎉 EMERGENCY FIX COMPLETED!"
echo "============================="
echo "📋 Next steps:"
echo "1. Check GitHub Actions: https://github.com/Manu-Manera/manuel-weiss-website/actions"
echo "2. Check Netlify: https://app.netlify.com/sites/mawps"
echo "3. Test your site: https://mawps.netlify.app"
echo ""
echo "🔧 If still not working:"
echo "- Check GitHub Actions logs"
echo "- Verify Netlify build logs"
echo "- Check for any error messages"
