# Railway Deployment Configuration

# Backend (Python/FastAPI)
web: cd backend && python -m pip install -r requirements.txt && uvicorn app.main:app --host 0.0.0.0 --port $PORT

# Frontend build (will be served by backend in production)
build: cd frontend && npm install && npm run build
