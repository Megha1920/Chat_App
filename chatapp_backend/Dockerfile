# Use official Python image as base
FROM python:3.10

# Set environment variables to prevent interactive prompts
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    DEBIAN_FRONTEND=noninteractive

# Set the working directory inside the container
WORKDIR /app

# Upgrade pip to the latest version
RUN pip install --upgrade pip

# Copy requirements file to the container
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose the port for Django (default is 8000)
EXPOSE 8000

# Run migrations and start the Django server
ENTRYPOINT ["sh", "-c", "python manage.py migrate && python manage.py runserver 0.0.0.0:8000"]
