FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Expose the port FastAPI runs on
EXPOSE 3000

# Metadata for Portaldot Sentinel
LABEL version="2.4.1"
LABEL type="governance-engine"

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "3000"]
