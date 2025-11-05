#!/bin/bash

# BetterCV Test Database Setup Script
# This script creates and initializes the test database

set -e

echo "🗄️  BetterCV Test Database Setup"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ PostgreSQL is not installed${NC}"
    echo "   Install with: brew install postgresql (macOS)"
    echo "   or: apt-get install postgresql (Linux)"
    exit 1
fi

echo -e "${GREEN}✅ PostgreSQL is installed${NC}"
echo ""

# Check if PostgreSQL is running
if ! pg_isready &> /dev/null; then
    echo -e "${YELLOW}⚠️  PostgreSQL is not running${NC}"
    echo "   Starting PostgreSQL..."

    # Try to start PostgreSQL (macOS)
    if command -v brew &> /dev/null; then
        brew services start postgresql || true
        sleep 2
    fi

    # Check again
    if ! pg_isready &> /dev/null; then
        echo -e "${RED}❌ Could not start PostgreSQL${NC}"
        echo "   Start it manually with: brew services start postgresql"
        exit 1
    fi
fi

echo -e "${GREEN}✅ PostgreSQL is running${NC}"
echo ""

# Get database user
DB_USER=${PGUSER:-$(whoami)}
echo "Using database user: $DB_USER"
echo ""

# Drop and create test database
echo "📦 Creating test database..."
psql -U "$DB_USER" postgres << EOF
-- Drop existing database if exists
DROP DATABASE IF EXISTS bettercv_test;

-- Create new test database
CREATE DATABASE bettercv_test;

\c bettercv_test

-- Show success
SELECT 'Test database created: bettercv_test' as status;
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Test database created${NC}"
else
    echo -e "${RED}❌ Failed to create test database${NC}"
    exit 1
fi
echo ""

# Run schema
echo "📝 Creating database schema..."
psql -U "$DB_USER" bettercv_test < database/test-schema.sql > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Schema created${NC}"
else
    echo -e "${YELLOW}⚠️  Schema creation had warnings (this is usually okay)${NC}"
fi
echo ""

# Create .env.test file
echo "⚙️  Creating test environment file..."
cat > backend/.env.test << EOF
# Test Environment Configuration
NODE_ENV=test

# Test Database
TEST_DB_HOST=localhost
TEST_DB_PORT=5432
TEST_DB_NAME=bettercv_test
TEST_DB_USER=$DB_USER
TEST_DB_PASSWORD=

# JWT Secret (test only)
JWT_SECRET=test-jwt-secret-do-not-use-in-production

# Anthropic API (not required for most tests)
ANTHROPIC_API_KEY=test-key

# Other settings
PORT=3000
BCRYPT_ROUNDS=4
EOF

echo -e "${GREEN}✅ Test environment file created: backend/.env.test${NC}"
echo ""

# Verify setup
echo "🔍 Verifying setup..."
psql -U "$DB_USER" bettercv_test << EOF
-- Count tables
SELECT COUNT(*) as table_count FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- List tables
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;
EOF

echo ""
echo -e "${GREEN}✅ Test database setup complete!${NC}"
echo ""
echo "📋 Summary:"
echo "   Database: bettercv_test"
echo "   User: $DB_USER"
echo "   Host: localhost:5432"
echo ""
echo "🧪 Run tests with:"
echo "   cd backend"
echo "   npm test"
echo ""
echo "🔄 Reset test database:"
echo "   ./setup-test-db.sh"
echo ""
