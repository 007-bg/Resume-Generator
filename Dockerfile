# ===== STAGE 1: Build React Frontend =====
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend
COPY ./frontend/package.json ./frontend/package-lock.json* ./
RUN npm ci --prefer-offline --no-audit

COPY ./frontend ./
RUN npm run build


# ===== STAGE 2: Python Runtime Image =====
FROM python:3.10-slim-bullseye

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    redis-server \
    supervisor \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

WORKDIR /app

# Install Python dependencies first for layer caching
COPY ./backend/requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Download spaCy model (use smaller model to reduce build time, upgrade in production)
RUN python -m spacy download en_core_web_sm

# Copy backend source code
COPY ./backend /app

# Create directories
RUN mkdir -p /app/staticfiles /app/static_build /app/media /app/templates

# Copy React build from Stage 1
COPY --from=frontend-builder /app/frontend/dist /app/static_build

# Copy index.html to templates for Django catch-all routing
RUN cp /app/static_build/index.html /app/templates/index.html

# Collect static files
ENV DJANGO_STATIC_ROOT=/app/staticfiles
RUN python manage.py collectstatic --noinput

# Copy supervisor configuration
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Create non-root user for security
RUN useradd -m -u 1000 user \
    && chown -R user:user /app /var/log /var/run

# Create Redis data directory
RUN mkdir -p /var/lib/redis && chown user:user /var/lib/redis

# Switch to non-root user
USER user

# Expose HuggingFace Spaces port
EXPOSE 7860

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:7860/api/jobs/ || exit 1

# Start supervisor (manages Redis, Django, Celery)
CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
