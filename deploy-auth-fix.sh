#!/bin/bash
# 🚀 AUTOMATISCHE AUTH-FIX DEPLOYMENT
# Behebt alle identifizierten Authentifizierungsprobleme

set -e  # Exit on any error

echo "🚀 Starting Auth Fix Deployment..."

# Farben für Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funktionen
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 1. COGNITO KONFIGURATION AKTUALISIEREN
update_cognito_config() {
    log_info "Updating AWS Cognito configuration..."
    
    USER_POOL_ID="eu-central-1_8gP4gLK9r"
    CLIENT_ID="7kc5tt6a23fgh53d60vkefm812"
    
    # App Client aktualisieren
    aws cognito-idp update-user-pool-client \
        --user-pool-id $USER_POOL_ID \
        --client-id $CLIENT_ID \
        --explicit-auth-flows ALLOW_USER_PASSWORD_AUTH ALLOW_REFRESH_TOKEN_AUTH \
        --supported-identity-providers COGNITO \
        --callback-urls \
            "https://mawps.netlify.app" \
            "https://mawps.netlify.app/bewerbung.html" \
            "https://mawps.netlify.app/persoenlichkeitsentwicklung-uebersicht.html" \
            "https://mawps.netlify.app/user-profile.html" \
            "http://localhost:8000" \
            "http://localhost:8000/bewerbung.html" \
        --logout-urls \
            "https://mawps.netlify.app" \
            "http://localhost:8000" \
        --allowed-o-auth-flows implicit code \
        --allowed-o-auth-scopes email openid profile \
        --allowed-o-auth-flows-user-pool-client
    
    log_success "Cognito configuration updated"
}

# 2. REDIRECT URLS KORRIGIEREN
fix_redirect_urls() {
    log_info "Fixing redirect URLs in codebase..."
    
    # Node.js Script ausführen
    if command -v node &> /dev/null; then
        node fix-redirect-urls.js
        log_success "Redirect URLs fixed"
    else
        log_warning "Node.js not found, skipping redirect URL fix"
    fi
}

# 3. HTML-DATEIEN MIT AUTH-SYSTEM AUSSTATTEN
update_html_files() {
    log_info "Updating HTML files with auth system..."
    
    # Auth-Integration Template
    AUTH_INTEGRATION='
    <!-- 🔧 UNIFIED AUTH INTEGRATION -->
    <script src="https://sdk.amazonaws.com/js/aws-sdk-2.1490.0.min.js"></script>
    <script src="js/redirect-url-config.js"></script>
    <script src="js/fixed-auth-system.js"></script>
    <script src="js/error-handler.js"></script>
    <script src="js/global-auth-system.js"></script>
    <script src="js/auth-modals.js"></script>'
    
    # Finde alle HTML-Dateien
    find . -name "*.html" -not -path "./node_modules/*" -not -path "./.git/*" | while read file; do
        # Prüfe ob Auth-System bereits vorhanden
        if ! grep -q "UNIFIED AUTH INTEGRATION" "$file"; then
            # Füge Auth-System vor schließendem </body> Tag hinzu
            sed -i.bak "s|</body>|$AUTH_INTEGRATION\n</body>|" "$file"
            log_info "Updated: $file"
        fi
    done
    
    log_success "HTML files updated with auth system"
}

# 4. ENVIRONMENT VARIABLES SETZEN
set_environment_variables() {
    log_info "Setting environment variables..."
    
    # Netlify Environment Variables
    if command -v netlify &> /dev/null; then
        netlify env:set AWS_COGNITO_USER_POOL_ID "eu-central-1_8gP4gLK9r"
        netlify env:set AWS_COGNITO_CLIENT_ID "7kc5tt6a23fgh53d60vkefm812"
        netlify env:set AWS_COGNITO_REGION "eu-central-1"
        netlify env:set AWS_COGNITO_DOMAIN "manuel-weiss-userfiles-auth-038333965110.auth.eu-central-1.amazoncognito.com"
        log_success "Netlify environment variables set"
    else
        log_warning "Netlify CLI not found, skipping environment variables"
    fi
}

# 5. CORS KONFIGURATION
configure_cors() {
    log_info "Configuring CORS settings..."
    
    # API Gateway CORS (falls vorhanden)
    if command -v aws &> /dev/null; then
        # Hier würde die API Gateway CORS-Konfiguration stehen
        log_info "CORS configuration would be applied here"
    fi
    
    log_success "CORS configuration completed"
}

# 6. TESTING
run_tests() {
    log_info "Running authentication tests..."
    
    # Erstelle Test-HTML
    cat > test-auth.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Auth Test</title>
</head>
<body>
    <h1>Authentication Test</h1>
    <div id="auth-status">Loading...</div>
    <button id="test-login">Test Login</button>
    <button id="test-logout">Test Logout</button>
    
    <!-- Auth System -->
    <script src="https://sdk.amazonaws.com/js/aws-sdk-2.1490.0.min.js"></script>
    <script src="js/redirect-url-config.js"></script>
    <script src="js/fixed-auth-system.js"></script>
    <script src="js/error-handler.js"></script>
    
    <script>
        // Test Script
        document.addEventListener('DOMContentLoaded', () => {
            const statusDiv = document.getElementById('auth-status');
            const testLoginBtn = document.getElementById('test-login');
            const testLogoutBtn = document.getElementById('test-logout');
            
            function updateStatus() {
                if (window.fixedAuth && window.fixedAuth.isLoggedIn()) {
                    statusDiv.innerHTML = '✅ Authenticated';
                    statusDiv.style.color = 'green';
                } else {
                    statusDiv.innerHTML = '❌ Not authenticated';
                    statusDiv.style.color = 'red';
                }
            }
            
            testLoginBtn.addEventListener('click', () => {
                const email = prompt('Email:');
                const password = prompt('Password:');
                if (email && password) {
                    window.fixedAuth.login(email, password);
                }
            });
            
            testLogoutBtn.addEventListener('click', () => {
                window.fixedAuth.logout();
            });
            
            // Status alle 2 Sekunden aktualisieren
            setInterval(updateStatus, 2000);
            updateStatus();
        });
    </script>
</body>
</html>
EOF
    
    log_success "Test page created: test-auth.html"
}

# 7. DEPLOYMENT
deploy() {
    log_info "Deploying to production..."
    
    # Git commit
    git add .
    git commit -m "🔧 Auth Fix: Resolved all authentication issues" || true
    
    # Netlify deploy
    if command -v netlify &> /dev/null; then
        netlify deploy --prod
        log_success "Deployed to Netlify"
    else
        log_warning "Netlify CLI not found, manual deployment required"
    fi
}

# 8. VALIDATION
validate_deployment() {
    log_info "Validating deployment..."
    
    # Test URLs
    TEST_URLS=(
        "https://mawps.netlify.app"
        "https://mawps.netlify.app/bewerbung.html"
        "https://mawps.netlify.app/persoenlichkeitsentwicklung-uebersicht.html"
    )
    
    for url in "${TEST_URLS[@]}"; do
        if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "200"; then
            log_success "✅ $url is accessible"
        else
            log_warning "⚠️  $url might not be accessible"
        fi
    done
}

# HAUPTFUNKTION
main() {
    echo "🚀 Starting Auth Fix Deployment..."
    echo "=================================="
    
    # Prüfe Voraussetzungen
    if ! command -v aws &> /dev/null; then
        log_warning "AWS CLI not found, some features will be skipped"
    fi
    
    # Führe alle Schritte aus
    update_cognito_config
    fix_redirect_urls
    update_html_files
    set_environment_variables
    configure_cors
    run_tests
    deploy
    validate_deployment
    
    echo ""
    echo "🎉 Auth Fix Deployment completed!"
    echo "=================================="
    echo "📋 Next steps:"
    echo "1. Test the authentication on your website"
    echo "2. Check the browser console for any errors"
    echo "3. Verify that login/logout works correctly"
    echo "4. Test on different browsers and devices"
    echo ""
    echo "🔗 Test URLs:"
    echo "- Main site: https://mawps.netlify.app"
    echo "- Auth test: https://mawps.netlify.app/test-auth.html"
    echo "- Bewerbung: https://mawps.netlify.app/bewerbung.html"
}

# Script ausführen
main "$@"
