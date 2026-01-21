#!/bin/bash

# 🧪 PDF Generator Test Script
# Testet die Puppeteer PDF-Generierung nach Lambda Deployment

set -e

API_BASE="https://6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com/v1"
ENDPOINT="/pdf-generator"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🧪 PDF GENERATOR TESTS"
echo "======================"
echo ""
echo "API Base: $API_BASE"
echo "Endpoint: $ENDPOINT"
echo ""

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Test function
test_endpoint() {
    local method=$1
    local description=$2
    local expected_status=${3:-200}
    local data=${4:-""}
    
    echo -n "Testing: $description ... "
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "\\n%{http_code}" -X "$method" \
            "$API_BASE$ENDPOINT" \
            -H "Content-Type: application/json" \
            -d "$data" 2>&1)
    else
        response=$(curl -s -w "\\n%{http_code}" -X "$method" \
            "$API_BASE$ENDPOINT" \
            -H "Content-Type: application/json" 2>&1)
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "$expected_status" ]; then
        echo -e "${GREEN}✅ OK${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAILED${NC} (HTTP $http_code, Expected $expected_status)"
        echo "Response Body: $body" | head -20
        ((TESTS_FAILED++))
    fi
}

# Test CORS preflight
test_cors() {
    echo -n "Testing CORS: $ENDPOINT ... "
    
    response=$(curl -s -w "\\n%{http_code}" -X "OPTIONS" \
        "$API_BASE$ENDPOINT" \
        -H "Access-Control-Request-Method: POST" \
        -H "Origin: https://manuel-weiss.ch" 2>&1)
    
    http_code=$(echo "$response" | tail -n1)
    
    # For OPTIONS, 200 or 204 are valid successful responses
    if [ "$http_code" = "200" ] || [ "$http_code" = "204" ]; then
        echo -e "${GREEN}✅ OK${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAILED${NC} (HTTP $http_code)"
        ((TESTS_FAILED++))
    fi
}

# Simple HTML test payload
SIMPLE_HTML='{
    "html": "<html><body><h1>Test PDF</h1><p>This is a test PDF generation.</p></body></html>",
    "options": {
        "format": "A4",
        "printBackground": true,
        "margin": {
            "top": "20mm",
            "right": "20mm",
            "bottom": "20mm",
            "left": "20mm"
        }
    }
}'

# --- Run Tests ---

# CORS Test
test_cors

# POST with simple HTML (expected 200)
test_endpoint "POST" "POST PDF Generation (Simple HTML)" 200 "$SIMPLE_HTML"

# POST without body (expected 400 or 500)
test_endpoint "POST" "POST PDF Generation (No Body)" 400 ""

# POST with invalid JSON (expected 400)
test_endpoint "POST" "POST PDF Generation (Invalid JSON)" 400 '{"invalid": json}'

echo ""
echo "======================"
echo "TEST SUMMARY: ${GREEN}$TESTS_PASSED Passed${NC}, ${RED}$TESTS_FAILED Failed${NC}"
echo "======================"

if [ "$TESTS_FAILED" -gt 0 ]; then
    exit 1
else
    exit 0
fi
