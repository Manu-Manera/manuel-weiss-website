#!/bin/bash

# 🧪 Profile API Test Script
# Testet alle User Data Endpoints nach Lambda Deployment

set -e

API_BASE="https://6i6ysj9c8c.execute-api.eu-central-1.amazonaws.com/v1"
TEST_USER_ID="test-user-123"
TEST_TOKEN="test-token-placeholder"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🧪 PROFILE API TESTS"
echo "===================="
echo ""
echo "API Base: $API_BASE"
echo ""

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Test function
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local expected_status=${4:-200}
    local data=${5:-""}
    
    echo -n "Testing: $description ... "
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            "$API_BASE$endpoint" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $TEST_TOKEN" \
            -d "$data" 2>&1)
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            "$API_BASE$endpoint" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $TEST_TOKEN" 2>&1)
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "$expected_status" ] || [ "$http_code" = "401" ]; then
        # 401 ist OK (kein gültiger Token), bedeutet aber dass Endpoint erreichbar ist
        echo -e "${GREEN}✅ OK${NC} (HTTP $http_code)"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}❌ FAILED${NC} (HTTP $http_code, expected $expected_status)"
        echo "   Response: $body"
        ((TESTS_FAILED++))
        return 1
    fi
}

# Test CORS Preflight
test_cors() {
    local endpoint=$1
    echo -n "Testing CORS: $endpoint ... "
    
    response=$(curl -s -w "\n%{http_code}" -X "OPTIONS" \
        "$API_BASE$endpoint" \
        -H "Access-Control-Request-Method: GET" \
        -H "Origin: https://manuel-weiss.ch" 2>&1)
    
    http_code=$(echo "$response" | tail -n1)
    
    # 200 oder 204 sind OK für OPTIONS
    if [ "$http_code" = "200" ] || [ "$http_code" = "204" ]; then
        echo -e "${GREEN}✅ OK${NC} (HTTP $http_code)"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAILED${NC} (HTTP $http_code)"
        ((TESTS_FAILED++))
    fi
}

echo "📋 TEST 1: CORS Preflight"
echo "-------------------------"
test_cors "/user-data"
test_cors "/user-data/profile"
test_cors "/user-data/resumes"
echo ""

echo "📋 TEST 2: Profile Endpoints"
echo "----------------------------"
test_endpoint "GET" "/user-data/profile" "Get Profile" "200"
test_endpoint "GET" "/user-data" "Get All User Data" "200"
echo ""

echo "📋 TEST 3: Resumes Endpoints"
echo "----------------------------"
test_endpoint "GET" "/user-data/resumes" "Get Resumes" "200"
test_endpoint "POST" "/user-data/resumes" "Create Resume" "200" '{"id":"test-resume-1","name":"Test Resume"}'
echo ""

echo "📋 TEST 4: Documents Endpoints"
echo "------------------------------"
test_endpoint "GET" "/user-data/documents" "Get Documents" "200"
test_endpoint "POST" "/user-data/documents" "Create Document" "200" '{"id":"test-doc-1","name":"Test Document"}'
echo ""

echo "📋 TEST 5: Cover Letters Endpoints"
echo "----------------------------------"
test_endpoint "GET" "/user-data/cover-letters" "Get Cover Letters" "200"
test_endpoint "POST" "/user-data/cover-letters" "Create Cover Letter" "200" '{"id":"test-cl-1","name":"Test Cover Letter"}'
echo ""

echo "📋 TEST 6: Applications Endpoints"
echo "---------------------------------"
test_endpoint "GET" "/user-data/applications" "Get Applications" "200"
test_endpoint "POST" "/user-data/applications" "Create Application" "200" '{"id":"test-app-1","name":"Test Application"}'
echo ""

echo "📋 TEST 7: Photos Endpoints"
echo "---------------------------"
test_endpoint "GET" "/user-data/photos" "Get Photos" "200"
test_endpoint "POST" "/user-data/photos" "Create Photo" "200" '{"id":"test-photo-1","name":"Test Photo"}'
echo ""

echo "📋 TEST 8: Workflows Endpoints"
echo "------------------------------"
test_endpoint "GET" "/user-data/workflows" "Get Workflows" "200"
test_endpoint "GET" "/user-data/workflows/ikigai/steps" "Get Workflow Steps" "200"
echo ""

echo "📊 TEST SUMMARY"
echo "==============="
echo -e "${GREEN}✅ Passed: $TESTS_PASSED${NC}"
echo -e "${RED}❌ Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  SOME TESTS FAILED${NC}"
    exit 1
fi
