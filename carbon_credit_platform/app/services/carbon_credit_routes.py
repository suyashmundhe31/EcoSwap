# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.carbon_credit_routes import router as carbon_credit_router

# Create FastAPI app
app = FastAPI(
    title="Carbon Credit Platform API",
    version="1.0.0",
    description="API for Carbon Credit Platform with Alembic integration"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(carbon_credit_router, prefix="/api/v1")

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