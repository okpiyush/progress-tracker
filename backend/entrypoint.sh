#!/bin/sh
# entrypoint.sh - wait for postgres, migrate, then start gunicorn

set -e

echo "⏳  Waiting for Postgres at ${DB_HOST}:${DB_PORT:-5432}..."
until pg_isready -h "${DB_HOST:-db}" -p "${DB_PORT:-5432}" -U "${DB_USER:-postgres}"; do
  sleep 1
done
echo "✅  Postgres is ready."

echo "🔄  Running migrations..."
python manage.py migrate --noinput

echo "🌱  Seeding journey data (idempotent)..."
python manage.py seed_journey || true

echo "🚀  Starting Gunicorn..."
exec gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 2 --timeout 120
