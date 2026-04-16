#!/bin/bash
set -e

# Start PostgreSQL if not running
if ! pg_isready -q; then
  service postgresql start || true
  sleep 2
fi

# Create user and database
sudo -u postgres psql -tc "SELECT 1 FROM pg_user WHERE usename = 'reviewuser'" | grep -q 1 || \
  sudo -u postgres psql -c "CREATE USER reviewuser WITH PASSWORD 'reviewpass';"

sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname = 'reviewdb'" | grep -q 1 || \
  sudo -u postgres createdb -O reviewuser reviewdb

echo "Database setup complete."
