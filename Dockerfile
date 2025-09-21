# Multi-stage build for SwimBuddy Pro - Full Stack
FROM node:18-alpine AS frontend-build

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# Python backend stage with frontend
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY backend/ ./backend/

# Copy built frontend from previous stage to static directory
COPY --from=frontend-build /app/frontend/dist ./backend/static/

# Set working directory to backend
WORKDIR /app/backend

# Expose port
EXPOSE 8000

# Start the application using shell form to handle environment variables
CMD sh -c "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"
