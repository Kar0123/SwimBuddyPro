#!/bin/bash

# Build frontend
echo "Building frontend..."
cd frontend
npm install
npm run build
cd ..

# Install Python dependencies
echo "Installing Python dependencies..."
cd backend
pip install -r requirements.txt
cd ..

echo "Build complete!"
