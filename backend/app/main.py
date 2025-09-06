from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from contextlib import asynccontextmanager
import logging

from app.database.database import init_db
from app.api.swimmers import router as swimmers_router
from app.api.scraper import router as scraper_router

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting SwimBuddy Pro API...")
    try:
        init_db()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("Shutting down SwimBuddy Pro API...")

app = FastAPI(
    title="SwimBuddy Pro API",
    description="API for SwimBuddy Pro - Swimming Performance Analytics",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://localhost:5173",  # Current Vite dev server port
        "http://localhost:5186",  # Vite dev server port
        "http://localhost:5187",  # Previous Vite dev server port
        "http://127.0.0.1:5173",  # Alternative localhost
        "http://127.0.0.1:5186",  # Alternative localhost
        "http://127.0.0.1:5187",  # Alternative localhost
        "*"  # Allow all origins for development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(swimmers_router, prefix="/api/swimmers", tags=["swimmers"])
app.include_router(scraper_router, prefix="/api/scraper", tags=["scraper"])

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "SwimBuddy Pro API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs"
    }

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "SwimBuddy Pro API"
    }

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Custom HTTP exception handler"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "message": exc.detail,
            "status_code": exc.status_code
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """General exception handler"""
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": True,
            "message": "Internal server error",
            "status_code": 500
        }
    )

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info"
    )
