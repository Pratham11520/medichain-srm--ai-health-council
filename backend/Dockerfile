FROM python:3.11-slim

# Non-root user for security
RUN groupadd -r medichain && useradd -r -g medichain medichain

WORKDIR /app

# Install dependencies first (layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Set ownership
RUN chown -R medichain:medichain /app

USER medichain

EXPOSE 8000

# Production: 2 workers, no reload
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2", "--access-log"]
