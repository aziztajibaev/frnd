#!/bin/bash

# Database Reset Script
# This script completely cleans and resets the database

echo "🗑️  Database Reset Script"
echo "========================"
echo ""
echo "⚠️  WARNING: This will completely delete all data in your database!"
echo "This action cannot be undone."
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Database reset cancelled."
    exit 0
fi

echo ""
echo "🔄 Starting database reset process..."
echo ""

# Step 1: Drop the database (using Prisma migrate reset with force flag)
echo "1️⃣  Dropping existing database and running migrations..."
npx prisma migrate reset --force

# Check if the reset was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database has been successfully reset!"
    echo ""
    echo "📊 Database now contains:"
    echo "   - Empty users table"
    echo "   - Empty user_roles table"
    echo "   - Roles table with 4 default roles:"
    echo "     • USER"
    echo "     • ADMIN"
    echo "     • MODERATOR"
    echo "     • SUPER_ADMIN"
    echo "   - Default Super Admin user:"
    echo "     Email: admin@example.com"
    echo "     Password: superadmin123"
    echo ""
    echo "⚠️  IMPORTANT: Change the default admin password after first login!"
    echo ""
else
    echo ""
    echo "❌ Database reset failed!"
    echo "Please check your DATABASE_URL in .env file and ensure PostgreSQL is running."
    exit 1
fi
