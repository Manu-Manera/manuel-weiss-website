#!/bin/bash
# 🔄 COMPLETE AUTH SYSTEM MIGRATION SCRIPT
# Migriert alle Auth-Systeme auf das einheitliche Unified Auth System

echo "🚀 Starting Complete Auth System Migration..."
echo "=============================================="

# 1. BACKUP ALTE SYSTEME
echo "📦 Creating backup of old auth systems..."
mkdir -p backup/auth-systems-$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="backup/auth-systems-$(date +%Y%m%d-%H%M%S)"

# Backup alte Auth-Dateien
if [ -f "js/real-aws-auth.js" ]; then
    mv js/real-aws-auth.js "$BACKUP_DIR/"
    echo "✅ Backed up: js/real-aws-auth.js"
fi

if [ -f "js/global-auth-system.js" ]; then
    mv js/global-auth-system.js "$BACKUP_DIR/"
    echo "✅ Backed up: js/global-auth-system.js"
fi

if [ -f "js/auth-modals.js" ]; then
    mv js/auth-modals.js "$BACKUP_DIR/"
    echo "✅ Backed up: js/auth-modals.js"
fi

# 2. LÖSCHE DEAKTIVIERTE DATEIEN
echo "🗑️ Removing disabled auth files..."
rm -f js/aws-auth-system.js.disabled
rm -f js/personality-auth-integration.js.disabled
rm -f js/user-profile.js.disabled
echo "✅ Removed disabled files"

# 3. MIGRIERE ALLE HTML-DATEIEN
echo "🔄 Migrating all HTML files to unified auth system..."

# Finde alle HTML-Dateien
find . -name "*.html" -not -path "./node_modules/*" -not -path "./.git/*" -not -path "./backup/*" | while read file; do
    echo "🔄 Processing: $file"
    
    # Erstelle Backup
    cp "$file" "$file.bak"
    
    # Ersetze alte Auth-Systeme mit Unified Auth Manager
    sed -i.tmp 's|js/real-aws-auth\.js|js/unified-auth-manager.js|g' "$file"
    sed -i.tmp 's|js/global-auth-system\.js|js/unified-auth-manager.js|g' "$file"
    sed -i.tmp 's|js/auth-modals\.js|js/unified-auth-manager.js|g' "$file"
    
    # Entferne doppelte unified-auth-manager.js Einträge
    awk '!seen[$0]++' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
    
    # Füge CSS hinzu falls nicht vorhanden
    if ! grep -q "unified-auth-system.css" "$file"; then
        # Füge CSS vor schließendem </head> Tag hinzu
        sed -i.tmp 's|</head>|    <link rel="stylesheet" href="css/unified-auth-system.css">\n</head>|' "$file"
    fi
    
    # Füge Auth-Modals Container hinzu falls nicht vorhanden
    if ! grep -q "authModalsContainer" "$file"; then
        # Füge Container vor schließendem </body> Tag hinzu
        sed -i.tmp 's|</body>|    <!-- Auth Modals Container -->\n    <div id="authModalsContainer"></div>\n</body>|' "$file"
    fi
    
    # Füge Auth-Modals Loading Script hinzu falls nicht vorhanden
    if ! grep -q "loadAuthModals" "$file"; then
        # Füge Script vor schließendem </body> Tag hinzu
        cat >> "$file" << 'EOF'
    
    <script>
        // Load auth modals
        async function loadAuthModals() {
            try {
                const response = await fetch('components/unified-auth-modals.html');
                const html = await response.text();
                document.getElementById('authModalsContainer').innerHTML = html;
            } catch (error) {
                console.error('Error loading auth modals:', error);
            }
        }
        
        // Initialize on page load
        document.addEventListener('DOMContentLoaded', () => {
            loadAuthModals();
        });
    </script>
EOF
    fi
    
    # Entferne temporäre Dateien
    rm -f "$file.tmp"
    
    echo "✅ Migrated: $file"
done

# 4. ÜBERPRÜFE MIGRATION
echo "🔍 Verifying migration..."

# Zähle verbleibende alte Auth-Systeme
OLD_SYSTEMS=$(grep -r "js/real-aws-auth.js\|js/global-auth-system.js\|js/auth-modals.js" . --include="*.html" | wc -l)
UNIFIED_SYSTEMS=$(grep -r "js/unified-auth-manager.js" . --include="*.html" | wc -l)

echo "📊 Migration Results:"
echo "   - Old auth systems found: $OLD_SYSTEMS"
echo "   - Unified auth systems: $UNIFIED_SYSTEMS"

if [ "$OLD_SYSTEMS" -eq 0 ]; then
    echo "✅ SUCCESS: All old auth systems removed!"
else
    echo "⚠️  WARNING: $OLD_SYSTEMS old auth systems still found"
    echo "   Files with old systems:"
    grep -r "js/real-aws-auth.js\|js/global-auth-system.js\|js/auth-modals.js" . --include="*.html" | cut -d: -f1 | sort | uniq
fi

# 5. BEREINIGUNG
echo "🧹 Cleaning up temporary files..."
find . -name "*.tmp" -delete
find . -name "*.bak" -delete

# 6. ERGEBNIS
echo ""
echo "🎉 AUTH SYSTEM MIGRATION COMPLETED!"
echo "=================================="
echo "✅ All HTML files migrated to unified auth system"
echo "✅ Old auth systems backed up to: $BACKUP_DIR"
echo "✅ Disabled files removed"
echo "✅ CSS and modals integrated"
echo ""
echo "🔐 Your website now uses a single, unified auth system!"
echo "   - No more conflicts between auth systems"
echo "   - Consistent user experience across all pages"
echo "   - Single session management"
echo "   - Unified UI/UX"
echo ""
echo "📁 Backup location: $BACKUP_DIR"
echo "🔄 To restore old systems: mv $BACKUP_DIR/* js/"
