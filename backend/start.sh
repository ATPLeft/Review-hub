#!/bin/bash
set -e

# Wait for PostgreSQL
echo "Waiting for PostgreSQL..."
until pg_isready -h localhost -U reviewuser -d reviewdb 2>/dev/null; do
  sleep 1
done
echo "PostgreSQL ready."

# Install dependencies
pip install -r requirements.txt -q

# Seed database
python seed.py

# Start server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
