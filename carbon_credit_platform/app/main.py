# app/main.py
from dotenv import load_dotenv
import os

# Load environment variables at startup
load_dotenv()

# Verify environment variables are loaded
print(f"OpenAI API Key loaded: {'Yes' if os.getenv('OPENAI_API_KEY') else 'No'}")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.api import api_router
from app.database import engine, Base
from app.api.v1.solar_panel import router as solar_panel_router

# Create FastAPI app
app = FastAPI(
    title="Carbon Credit Platform API",
    version="1.0.0",
    description="API for Carbon Credit Platform"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables
Base.metadata.create_all(bind=engine)

# Include the main API router with v1 prefix
app.include_router(api_router, prefix="/api/v1")

# Include the solar panel router
app.include_router(solar_panel_router, prefix="/api/v1")

@app.get("/")
async def root():
    """Welcome endpoint"""
    return {"message": "Carbon Credit Platform API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    from datetime import datetime
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "carbon_credit_platform"
    }