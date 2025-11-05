#!/bin/bash

# BetterCV Neon Database Setup Script
# This script will run migrations on your Neon PostgreSQL database

set -e  # Exit on error

echo "🗄️  BetterCV Neon Database Setup"
echo "================================"
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set!"
    echo ""
    echo "Usage:"
    echo "   export DATABASE_URL='your-neon-connection-string'"
    echo "   ./setup-neon-db.sh"
    echo ""
    echo "Or pass it directly:"
    echo "   DATABASE_URL='your-connection-string' ./setup-neon-db.sh"
    echo ""
    exit 1
fi

echo "✅ DATABASE_URL found"
echo ""
echo "🔧 Running migrations..."
echo ""

# Run main schema
echo "   1/2 Running main schema..."
if psql "$DATABASE_URL" -f database/schema.sql > /dev/null 2>&1; then
    echo "       ✅ Main schema applied"
else
    echo "       ❌ Failed to apply main schema"
    exit 1
fi

# Run builder schema
echo "   2/2 Running builder schema..."
if psql "$DATABASE_URL" -f database/builder-schema.sql > /dev/null 2>&1; then
    echo "       ✅ Builder schema applied"
else
    echo "       ❌ Failed to apply builder schema"
    exit 1
fi

echo ""
echo "🎉 Database setup complete!"
echo ""
echo "📊 Checking tables..."
psql "$DATABASE_URL" -c "
SELECT
    tablename as table_name
FROM pg_catalog.pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY tablename;
" 2>/dev/null

echo ""
echo "✨ Your Neon database is ready!"
echo ""
echo "Next steps:"
echo "   1. Update backend/.env with your DATABASE_URL"
echo "   2. Start the backend: cd backend && npm run dev"
echo ""
