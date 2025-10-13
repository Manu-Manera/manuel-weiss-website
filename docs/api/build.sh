#!/bin/bash

# API Documentation Build Script
# Generiert Redoc-Dokumentation aus OpenAPI-Spezifikation

set -e

echo "🚀 Building API Documentation..."

# Verzeichnisse erstellen
mkdir -p docs/api/dist
mkdir -p docs/api/assets

# Redoc CLI installieren (falls nicht vorhanden)
if ! command -v redoc-cli &> /dev/null; then
    echo "📦 Installing Redoc CLI..."
    npm install -g redoc-cli
fi

# OpenAPI validieren
echo "🔍 Validating OpenAPI specification..."
redoc-cli lint docs/api/openapi.yaml

# Redoc HTML generieren
echo "📝 Generating Redoc HTML..."
redoc-cli build docs/api/openapi.yaml \
    --output docs/api/dist/index.html \
    --title "Manuel Weiss Enterprise Platform API" \
    --theme.colors.primary.main "#667eea" \
    --theme.typography.fontSize "14px" \
    --theme.typography.fontFamily "system-ui, -apple-system, sans-serif" \
    --theme.typography.headings.fontFamily "system-ui, -apple-system, sans-serif" \
    --theme.typography.code.fontFamily "Monaco, Consolas, 'Courier New', monospace" \
    --theme.spacing.unit 4 \
    --theme.breakpoints.small 768 \
    --theme.breakpoints.medium 1024 \
    --theme.breakpoints.large 1200 \
    --theme.breakpoints.xlarge 1600 \
    --options.scrollYOffset 60 \
    --options.hideDownloadButton false \
    --options.hideHostname false \
    --options.hideLoading false \
    --options.nativeScrollbars false \
    --options.pathInMiddlePanel false \
    --options.requiredPropsFirst false \
    --options.sortPropsAlphabetically false \
    --options.showExtensions false \
    --options.showObjectSchemaExamples true \
    --options.menuToggle true \
    --options.jsonSampleExpandLevel 2 \
    --options.hideSingleRequestSampleTab false \
    --options.expandResponses "200,201" \
    --options.maxDisplayedEnumValues 5 \
    --options.hideSchemaPattern false \
    --options.simpleOneOfTypeLabel false \
    --options.schemaExpansionLevel 2 \
    --options.showRequestHeaders false \
    --options.showResponseHeaders false \
    --options.hideRequestPayloadSample false \
    --options.hideResponsePayloadSample false \
    --options.hideSchemaTitles false \
    --options.hideSchemaDescriptions false \
    --options.hideSchemaExamples false \
    --options.hideSchemaDefault false \
    --options.hideSchemaPattern false \
    --options.hideSchemaAdditionalProperties false \
    --options.hideSchemaDeprecated false \
    --options.hideSchemaReadOnly false \
    --options.hideSchemaWriteOnly false \
    --options.hideSchemaNullable false \
    --options.hideSchemaDiscriminator false \
    --options.hideSchemaXml false \
    --options.hideSchemaExternalDocs false \
    --options.hideSchemaAllOf false \
    --options.hideSchemaOneOf false \
    --options.hideSchemaAnyOf false \
    --options.hideSchemaNot false \
    --options.hideSchemaIf false \
    --options.hideSchemaThen false \
    --options.hideSchemaElse false \
    --options.hideSchemaDependentSchemas false \
    --options.hideSchemaDependentRequired false \
    --options.hideSchemaUnevaluatedProperties false \
    --options.hideSchemaUnevaluatedItems false \
    --options.hideSchemaContentSchema false \
    --options.hideSchemaPropertyNames false \
    --options.hideSchemaAdditionalItems false \
    --options.hideSchemaItems false \
    --options.hideSchemaContains false \
    --options.hideSchemaMinContains false \
    --options.hideSchemaMaxContains false \
    --options.hideSchemaUniqueItems false \
    --options.hideSchemaMinItems false \
    --options.hideSchemaMaxItems false \
    --options.hideSchemaMinLength false \
    --options.hideSchemaMaxLength false \
    --options.hideSchemaPattern false \
    --options.hideSchemaFormat false \
    --options.hideSchemaMultipleOf false \
    --options.hideSchemaMinimum false \
    --options.hideSchemaMaximum false \
    --options.hideSchemaExclusiveMinimum false \
    --options.hideSchemaExclusiveMaximum false \
    --options.hideSchemaConst false \
    --options.hideSchemaEnum false \
    --options.hideSchemaType false \
    --options.hideSchemaAllOf false \
    --options.hideSchemaOneOf false \
    --options.hideSchemaAnyOf false \
    --options.hideSchemaNot false \
    --options.hideSchemaIf false \
    --options.hideSchemaThen false \
    --options.hideSchemaElse false \
    --options.hideSchemaDependentSchemas false \
    --options.hideSchemaDependentRequired false \
    --options.hideSchemaUnevaluatedProperties false \
    --options.hideSchemaUnevaluatedItems false \
    --options.hideSchemaContentSchema false \
    --options.hideSchemaPropertyNames false \
    --options.hideSchemaAdditionalItems false \
    --options.hideSchemaItems false \
    --options.hideSchemaContains false \
    --options.hideSchemaMinContains false \
    --options.hideSchemaMaxContains false \
    --options.hideSchemaUniqueItems false \
    --options.hideSchemaMinItems false \
    --options.hideSchemaMaxItems false \
    --options.hideSchemaMinLength false \
    --options.hideSchemaMaxLength false \
    --options.hideSchemaPattern false \
    --options.hideSchemaFormat false \
    --options.hideSchemaMultipleOf false \
    --options.hideSchemaMinimum false \
    --options.hideSchemaMaximum false \
    --options.hideSchemaExclusiveMinimum false \
    --options.hideSchemaExclusiveMaximum false \
    --options.hideSchemaConst false \
    --options.hideSchemaEnum false \
    --options.hideSchemaType false

# OpenAPI YAML kopieren
echo "📋 Copying OpenAPI specification..."
cp docs/api/openapi.yaml docs/api/dist/openapi.yaml

# Assets kopieren
echo "🎨 Copying assets..."
if [ -d "docs/api/assets" ]; then
    cp -r docs/api/assets/* docs/api/dist/ 2>/dev/null || true
fi

# Index.html für /api-docs erstellen
echo "📄 Creating API docs index..."
cat > docs/api/dist/index.html << 'EOF'
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Manuel Weiss Enterprise Platform API</title>
    <meta name="description" content="Vollständige API-Dokumentation für die Manuel Weiss Enterprise Platform">
    <meta name="keywords" content="API, Dokumentation, Manuel Weiss, Enterprise, Platform">
    <meta name="author" content="Manuel Weiss">
    
    <!-- Open Graph -->
    <meta property="og:title" content="Manuel Weiss Enterprise Platform API">
    <meta property="og:description" content="Vollständige API-Dokumentation für die Manuel Weiss Enterprise Platform">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://mawps.netlify.app/api-docs">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Manuel Weiss Enterprise Platform API">
    <meta name="twitter:description" content="Vollständige API-Dokumentation für die Manuel Weiss Enterprise Platform">
    
    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    
    <!-- Redoc CSS -->
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .api-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem;
            text-align: center;
        }
        
        .api-header h1 {
            margin: 0;
            font-size: 2.5rem;
            font-weight: 700;
        }
        
        .api-header p {
            margin: 0.5rem 0 0 0;
            font-size: 1.2rem;
            opacity: 0.9;
        }
        
        .api-info {
            background: #f8fafc;
            padding: 1rem 2rem;
            border-bottom: 1px solid #e2e8f0;
            text-align: center;
        }
        
        .api-info a {
            color: #667eea;
            text-decoration: none;
            font-weight: 600;
        }
        
        .api-info a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="api-header">
        <h1>🚀 Manuel Weiss Enterprise Platform API</h1>
        <p>Vollständige API-Dokumentation für Bewerbungsmanagement, Medien-Upload und Workflow-Orchestrierung</p>
    </div>
    
    <div class="api-info">
        <p>
            📚 <strong>Version 2.0.0</strong> | 
            🔗 <a href="https://mawps.netlify.app">Website</a> | 
            📧 <a href="mailto:info@manuel-weiss.com">Support</a> |
            🐛 <a href="https://github.com/Manu-Manera/manuel-weiss-website/issues">Issues</a>
        </p>
    </div>
    
    <redoc spec-url="/docs/api/openapi.yaml"></redoc>
    
    <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
</body>
</html>
EOF

# Build-Info erstellen
echo "📊 Creating build info..."
cat > docs/api/dist/build-info.json << EOF
{
  "buildTime": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "version": "2.0.0",
  "openapiVersion": "3.1.0",
  "generator": "redoc-cli",
  "source": "docs/api/openapi.yaml",
  "output": "docs/api/dist/index.html"
}
EOF

# Berechtigungen setzen
chmod -R 755 docs/api/dist/

echo "✅ API Documentation build completed!"
echo "📁 Output directory: docs/api/dist/"
echo "🌐 Access via: /api-docs"
echo ""
echo "📋 Generated files:"
echo "  - index.html (Redoc documentation)"
echo "  - openapi.yaml (OpenAPI specification)"
echo "  - build-info.json (Build metadata)"
echo ""
echo "🚀 Ready for deployment!"
