#!/bin/bash

# Build script for Manuel Weiss Website
echo "🚀 Building Manuel Weiss Website..."

# Create necessary directories
mkdir -p docs/api/dist
mkdir -p build

# Copy static files
echo "📁 Copying static files..."
cp -r *.html build/ 2>/dev/null || echo "No HTML files to copy"
cp -r css build/ 2>/dev/null || echo "No CSS files to copy"
cp -r js build/ 2>/dev/null || echo "No JS files to copy"
cp -r images build/ 2>/dev/null || echo "No images to copy"

# Create API docs placeholder
echo "📚 Creating API documentation..."
cat > docs/api/dist/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Documentation</title>
</head>
<body>
    <h1>Manuel Weiss Website API Documentation</h1>
    <p>API documentation will be available here.</p>
</body>
</html>
EOF

echo "✅ Build completed successfully!"
echo "📊 Build statistics:"
echo "  - HTML files: $(find . -name "*.html" | wc -l)"
echo "  - CSS files: $(find . -name "*.css" | wc -l)"
echo "  - JS files: $(find . -name "*.js" | wc -l)"
