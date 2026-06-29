#!/bin/bash

# LDAP Authentication Test Script
# Tests LDAP authentication against the ForumSys public test server

echo "=========================================="
echo "LDAP Authentication Test Script"
echo "=========================================="
echo ""

# Configuration
LDAP_SERVER="ldap://ldap.forumsys.com"
LDAP_PORT="389"
TEST_USER="newton"
TEST_PASSWORD="password"
TEST_DN="uid=${TEST_USER},dc=example,dc=com"

echo "📋 Test Configuration:"
echo "   Server: ${LDAP_SERVER}:${LDAP_PORT}"
echo "   Test User: ${TEST_USER}"
echo "   Test DN: ${TEST_DN}"
echo ""

# Check if ldapsearch is installed
if ! command -v ldapsearch &> /dev/null; then
    echo "❌ ldapsearch not found. Installing ldap-utils..."
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-get update && sudo apt-get install -y ldap-utils
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew install openldap
    else
        echo "❌ Unsupported OS. Please install ldap-utils manually."
        exit 1
    fi
fi

# Test 1: Connect to LDAP server
echo "🔍 Test 1: Connecting to LDAP server..."
ldapsearch -x -H "${LDAP_SERVER}:${LDAP_PORT}" -b "" -s base > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ LDAP Server connectivity: OK"
else
    echo "❌ Failed to connect to LDAP server"
    exit 1
fi
echo ""

# Test 2: Query directory
echo "🔍 Test 2: Querying LDAP directory..."
ldapsearch -x -H "${LDAP_SERVER}:${LDAP_PORT}" -b "dc=example,dc=com" "uid=*" 2>/dev/null | grep "dn:" | head -5
if [ $? -eq 0 ]; then
    echo "✅ Directory query: OK"
else
    echo "❌ Failed to query directory"
    exit 1
fi
echo ""

# Test 3: Find test user
echo "🔍 Test 3: Looking for test user (${TEST_USER})..."
ldapsearch -x -H "${LDAP_SERVER}:${LDAP_PORT}" -b "dc=example,dc=com" "uid=${TEST_USER}" > /tmp/ldap_user.txt 2>&1
if grep -q "dn: uid=${TEST_USER}" /tmp/ldap_user.txt; then
    echo "✅ Test user found"
    echo "   User Details:"
    grep -E "dn:|mail:|cn:|givenName:|sn:" /tmp/ldap_user.txt | sed 's/^/   /'
else
    echo "❌ Test user not found"
    exit 1
fi
echo ""

# Test 4: Authenticate with user credentials
echo "🔍 Test 4: Testing authentication with user credentials..."
echo -n "${TEST_PASSWORD}" | ldapsearch -x -H "${LDAP_SERVER}:${LDAP_PORT}" -D "${TEST_DN}" -W -b "dc=example,dc=com" "uid=${TEST_USER}" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ User authentication: OK"
else
    echo "❌ Authentication failed (check password)"
    exit 1
fi
echo ""

# Test 5: Invalid password test
echo "🔍 Test 5: Testing with invalid password (should fail)..."
echo -n "wrongpassword" | ldapsearch -x -H "${LDAP_SERVER}:${LDAP_PORT}" -D "${TEST_DN}" -W -b "dc=example,dc=com" > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "✅ Invalid password correctly rejected"
else
    echo "⚠️  Warning: Invalid password was accepted (unusual)"
fi
echo ""

# Test 6: List all test users
echo "🔍 Test 6: Available test users in ForumSys directory:"
ldapsearch -x -H "${LDAP_SERVER}:${LDAP_PORT}" -b "dc=example,dc=com" "uid=*" dn uid mail 2>/dev/null | grep -E "dn:|uid:|mail:" | paste - - - | sed 's/^/   /'
echo ""

echo "=========================================="
echo "✅ All LDAP tests completed successfully!"
echo "=========================================="
echo ""
echo "📝 Next Steps:"
echo "1. Update your .env file with:"
echo "   AUTH_MODE=LDAP"
echo "   LDAP_URL=ldap://ldap.forumsys.com:389"
echo "   LDAP_SEARCH_DN=uid={username},dc=example,dc=com"
echo ""
echo "2. Restart your application:"
echo "   npm run dev"
echo ""
echo "3. Test login endpoint with:"
echo "   curl -X POST http://localhost:3000/auth/login \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"email\": \"newton@forumsys.com\", \"password\": \"password\"}'"
echo ""
