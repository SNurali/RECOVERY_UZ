#!/bin/bash
set -e

# Create new database recovery_uz in existing postgres container
echo "Creating database recovery_uz..."
sudo docker exec recovery_postgres psql -U hdd_fixer -c "CREATE DATABASE recovery_uz OWNER hdd_fixer;" 2>/dev/null || echo "DB may already exist"

# Apply schema
echo "Applying schema..."
sudo docker exec -i recovery_postgres psql -U hdd_fixer -d recovery_uz < /home/yoyo/RECOVERY_UZ/backend/init.sql

echo "Schema applied OK"
