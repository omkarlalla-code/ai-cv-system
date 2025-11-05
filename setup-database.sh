#!/bin/bash

# BetterCV Database Setup Script
# This script will create the database and run migrations

set -e  # Exit on error

echo "🗄️  BetterCV Database Setup"
echo "================================"
echo ""

# Get database user (default to current user)
DB_USER="${DB_USER:-$USER}"
DB_NAME="bettercv"

echo "📋 Configuration:"
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"
echo ""

# Check if PostgreSQL is running
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "❌ ERROR: PostgreSQL is not running!"
    echo ""
    echo "Start PostgreSQL with:"
    echo "   brew services start postgresql@14"
    echo ""
    exit 1
fi

echo "✅ PostgreSQL is running"
echo ""

# Check if database already exists
if psql -U "$DB_USER" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo "⚠️  Database '$DB_NAME' already exists"
    read -p "   Do you want to DROP and recreate it? (yes/no): " response
    if [ "$response" = "yes" ]; then
        echo "   Dropping database..."
        dropdb -U "$DB_USER" "$DB_NAME"
    else
        echo "   Using existing database..."
    fi
fi

# Create database if it doesn't exist
if ! psql -U "$DB_USER" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo "📦 Creating database '$DB_NAME'..."
    createdb -U "$DB_USER" "$DB_NAME"
    echo "   ✅ Database created"
fi

echo ""
echo "🔧 Running migrations..."
echo ""

# Run main schema
echo "   1/2 Running main schema..."
if psql -U "$DB_USER" -d "$DB_NAME" -f database/schema.sql > /dev/null 2>&1; then
    echo "       ✅ Main schema applied"
else
    echo "       ❌ Failed to apply main schema"
    exit 1
fi

# Run builder schema
echo "   2/2 Running builder schema..."
if psql -U "$DB_USER" -d "$DB_NAME" -f database/builder-schema.sql > /dev/null 2>&1; then
    echo "       ✅ Builder schema applied"
else
    echo "       ❌ Failed to apply builder schema"
    exit 1
fi

echo ""
echo "🎉 Database setup complete!"
echo ""
echo "📊 Database info:"
psql -U "$DB_USER" -d "$DB_NAME" -c "
SELECT
    tablename as table_name,
    schemaname as schema
FROM pg_catalog.pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY tablename;
" 2>/dev/null

echo ""
echo "🔑 Update your backend/.env file with:"
echo "   DB_NAME=$DB_NAME"
echo "   DB_USER=$DB_USER"
echo "   DB_PASSWORD=<your_password>"
echo ""
echo "✨ Ready to start the backend server!"
