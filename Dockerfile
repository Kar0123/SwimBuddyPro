# Multi-stage build for SwimBuddy Pro
FROM node:18-alpine AS frontend-build

# Set working directory
WORKDIR /app/frontend

# Copy package files
COPY frontend/package*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci

# Copy all frontend source code
COPY frontend/ .

# Build the frontend
RUN npm run build

# Python backend stage
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY backend/ ./backend/

# Copy built frontend from previous stage
COPY --from=frontend-build /app/frontend/dist ./frontend/dist/

# Set working directory to backend
WORKDIR /app/backend

# Create a non-root user
RUN useradd --create-home --shell /bin/bash app
USER app

# Expose port (Railway will set PORT env var)
EXPOSE $PORT

# Start the application - Railway provides PORT env var
CMD uvicorn app.main:app --host 0.0.0.0 --port $PORT
