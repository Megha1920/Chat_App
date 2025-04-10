# Use the official Python image as base
FROM python:3.11

WORKDIR /app

RUN apt-get update && apt-get install -y \
    default-libmysqlclient-dev build-essential python3-dev \
    libmariadb-dev-compat libmariadb-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# ✅ Ensure pip, setuptools, and wheel are fully up to date
RUN pip install --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# ✅ Run ASGI app using Daphne (for WebSocket support)
CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "chatapp_backend.asgi:application"]
