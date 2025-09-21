# Multi-stage build for SwimBuddy Pro - Frontend Only
FROM node:18-alpine AS frontend-build

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# Final stage - serve frontend with Express
FROM node:18-alpine

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built frontend from previous stage
COPY --from=frontend-build /app/frontend/dist ./frontend/dist/

# Copy Express server
COPY server.js ./

# Expose port
EXPOSE 3000

# Start the Express server
CMD ["node", "server.js"]
