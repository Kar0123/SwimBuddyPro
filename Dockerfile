# Multi-stage build for SwimBuddy Pro
FROM node:18-alpine AS frontend-build

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --only=production
COPY frontend/ .
RUN npm run build

# Python backend with frontend
FROM python:3.9-slim

WORKDIR /app

# Install Python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./backend/

# Copy built frontend
COPY --from=frontend-build /app/frontend/dist ./frontend/dist/

# Set working directory to backend for the app
WORKDIR /app/backend

# Expose port
EXPOSE $PORT

# Start the application
CMD uvicorn app.main:app --host 0.0.0.0 --port $PORT
