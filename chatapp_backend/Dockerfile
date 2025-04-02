# Use the official Python image as base
FROM python:3.11

# Set the working directory in the container
WORKDIR /app

# Install system dependencies required for mysqlclient
RUN apt-get update && apt-get install -y \
    default-libmysqlclient-dev build-essential python3-dev \
    libmariadb-dev-compat libmariadb-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy the requirements file into the container
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the Django project files into the container
COPY . .

# Expose the port Django runs on
EXPOSE 8000

# Define the command to run the application
CMD ["gunicorn", "chatapp_backend.chatapp_backend.wsgi:application", "--bind", "0.0.0.0:8000"]
