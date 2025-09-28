#!/bin/bash
# Schneller Test für Admin API-Verbindung

echo "🔍 Testing Admin Panel API Connection..."
echo ""

# Check if API config files exist
echo "📂 Checking configuration files:"
if [ -f "js/api-config.js" ]; then
    echo "   ✅ js/api-config.js exists"
else
    echo "   ❌ js/api-config.js missing"
fi

if [ -f "js/admin-connection-test.js" ]; then
    echo "   ✅ js/admin-connection-test.js exists"
else
    echo "   ❌ js/admin-connection-test.js missing"
fi

# Check if admin.html includes API config
if grep -q "api-config.js" admin.html; then
    echo "   ✅ admin.html includes API config"
else
    echo "   ❌ admin.html missing API config"
fi

echo ""
echo "🔧 Next steps:"
echo "   1. Run: ./deploy-aws.sh"
echo "   2. Open: https://manuel-weiss.com/admin.html"  
echo "   3. Check browser console for connection test results"
echo "   4. Use the '🔍 API-Verbindungstest' button in admin panel"
echo ""
echo "📖 See AWS_USER_MANAGEMENT_FIX.md for detailed instructions"
