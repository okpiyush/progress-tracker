FROM python:3.9-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y gcc libpq-dev postgresql-client && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

COPY . /app/

RUN python manage.py collectstatic --noinput

# Inline entrypoint to avoid line ending / chmod issues
RUN printf '#!/bin/sh\nset -e\necho "Waiting for Postgres..."\nuntil pg_isready -h "${DB_HOST:-db}" -p "${DB_PORT:-5432}" -U "${DB_USER:-postgres}"; do sleep 1; done\necho "Postgres ready. Migrating..."\npython manage.py migrate --noinput\necho "Seeding..."\npython manage.py seed_journey || true\necho "Starting Gunicorn..."\nexec gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 2 --timeout 120\n' > /app/start.sh && chmod +x /app/start.sh

CMD ["/bin/sh", "/app/start.sh"]
