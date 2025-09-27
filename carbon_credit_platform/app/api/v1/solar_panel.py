# app/api/v1/solar_panel.py
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional, List

from app.database import get_db
from app.services.gps_extraction_service import GPSExtractionService
from app.services.solar_panel_service import SolarPanelService
from app.models.solar_panel import CarbonToken
from app.schemas.solar_panel import (
    SolarPanelApplicationCreate,
    SolarPanelApplicationResponse,
    SolarAnalysisCreate,
    SolarAnalysisResponse,
    CarbonTokenCreate,
    CarbonTokenResponse,
    CarbonTokenList
)

router = APIRouter(prefix="/solar-panel", tags=["solar-panel"])

@router.post("/extract-gps")
async def extract_gps_from_photo(
    photo: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Extract GPS coordinates from uploaded geotagged photo using AI"""
    try:
        # Validate file type
        if not photo.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Check file size (limit to 10MB)
        max_size = 10 * 1024 * 1024  # 10MB
        photo.file.seek(0, 2)  # Seek to end
        file_size = photo.file.tell()
        photo.file.seek(0)  # Reset to beginning
        
        if file_size > max_size:
            raise HTTPException(status_code=400, detail="File size too large. Maximum 10MB allowed.")
        
        # Initialize GPS extraction service
        gps_service = GPSExtractionService()
        
        # Process the image
        result = gps_service.process_uploaded_file(photo)
        
        return {
            "success": result['success'],
            "latitude": result['latitude'],
            "longitude": result['longitude'],
            "message": result['message'],
            "method": result.get('method', 'unknown'),
            "confidence": result.get('confidence', 'unknown'),
            "description": result.get('description', '')
        }
        
    except HTTPException:
        raise
    except Exception as e:
        import logging
        logging.error(f"GPS extraction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error extracting GPS: {str(e)}")

# Add this endpoint to calculate solar energy potential
@router.post("/calculate-solar-energy")
async def calculate_solar_energy(
    latitude: float = Form(...),
    longitude: float = Form(...),
    panel_area_sqm: Optional[float] = Form(None),
    db: Session = Depends(get_db)
):
    """Calculate solar energy potential for given coordinates"""
    try:
        # Mock solar calculation - replace with your actual solar API/calculation
        # This simulates realistic solar potential based on latitude
        
        # Base values
        base_energy_per_sqm = 150  # kWh per square meter per year (typical for India)
        default_area = 100  # square meters if not provided
        area = panel_area_sqm or default_area
        
        # Adjust for latitude (closer to equator = better solar potential)
        lat_factor = max(0.7, 1 - abs(latitude) / 90 * 0.3)
        
        # Calculate energy values
        annual_kwh = area * base_energy_per_sqm * lat_factor
        annual_mwh = annual_kwh / 1000
        
        # Carbon emissions avoided (India grid factor: ~0.82 kg CO2/kWh)
        co2_factor = 0.82
        annual_co2_avoided_tonnes = (annual_kwh * co2_factor) / 1000
        
        # Carbon credits (1 tonne CO2 = 1 carbon credit)
        annual_carbon_credits = annual_co2_avoided_tonnes
        
        # Estimate panel count (assuming 400W panels, 2m²/panel)
        panel_count = max(1, int(area / 2))
        estimated_capacity_kw = panel_count * 0.4  # 400W per panel
        
        return {
            "success": True,
            "annual_energy_mwh": round(annual_mwh, 2),
            "annual_co2_avoided_tonnes": round(annual_co2_avoided_tonnes, 2),
            "annual_carbon_credits": round(annual_carbon_credits, 2),
            "carbon_coins": {
                "annual": round(annual_carbon_credits, 2),
                "ten_year": round(annual_carbon_credits * 10, 2)
            },
            "calculation_method": "IPCC Guidelines for Renewable Energy (India Grid Factor: 0.82 kg CO2/kWh)",
            "panel_count": panel_count,
            "estimated_capacity_kw": round(estimated_capacity_kw, 2),
            "panel_area_sqm": area,
            "location": {
                "latitude": latitude,
                "longitude": longitude
            }
        }
        
    except Exception as e:
        import logging
        logging.error(f"Solar calculation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error calculating solar energy: {str(e)}")

# API 1: Create Application with Documents
@router.post("/applications", response_model=SolarPanelApplicationResponse)
async def create_solar_panel_application(
    full_name: str = Form(...),
    company_name: Optional[str] = Form(None),
    aadhar_card: str = Form(...),
    api_link: str = Form(...),
    ownership_document: Optional[UploadFile] = File(None),
    energy_certification: Optional[UploadFile] = File(None),
    geotag_photo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    """Create a new solar panel application with document uploads"""
    try:
        # Create application data
        application_data = SolarPanelApplicationCreate(
            full_name=full_name,
            company_name=company_name,
            aadhar_card=aadhar_card,
            api_link=api_link
        )
        
        # Initialize service
        service = SolarPanelService(db)
        
        # For demo, use a fixed user_id (in production, get from JWT token)
        user_id = 1
        
        # Create application
        application = service.create_application(
            user_id=user_id,
            application_data=application_data,
            ownership_document=ownership_document,
            energy_certification=energy_certification,
            geotag_photo=geotag_photo
        )
        
        return application
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating application: {str(e)}")

# Get all applications
@router.get("/applications", response_model=List[SolarPanelApplicationResponse])
async def get_all_applications(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all solar panel applications with pagination"""
    try:
        service = SolarPanelService(db)
        applications = service.get_all_applications(skip, limit)
        return applications
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving applications: {str(e)}")

# Get Application by ID
@router.get("/applications/{application_id}", response_model=SolarPanelApplicationResponse)
async def get_application(
    application_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific solar panel application"""
    try:
        service = SolarPanelService(db)
        
        application = service.get_application(application_id)
        if not application:
            raise HTTPException(status_code=404, detail="Application not found")
        
        return application
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving application: {str(e)}")

# API 2: Save Analysis Results
@router.post("/analysis", response_model=SolarAnalysisResponse)
async def save_solar_analysis(
    analysis_data: SolarAnalysisCreate,
    db: Session = Depends(get_db)
):
    """Save solar panel analysis results"""
    try:
        service = SolarPanelService(db)
        
        # Check if application exists
        application = service.get_application(analysis_data.application_id)
        if not application:
            raise HTTPException(status_code=404, detail="Application not found")
        
        # Save analysis results
        analysis = service.save_analysis_results(analysis_data)
        
        return analysis
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving analysis: {str(e)}")

# Get all analysis results
@router.get("/analysis", response_model=List[SolarAnalysisResponse])
async def get_all_analysis(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all analysis results with pagination"""
    try:
        service = SolarPanelService(db)
        analysis_list = service.get_all_analysis(skip, limit)
        return analysis_list
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving analysis results: {str(e)}")

# Get Analysis by Application ID
@router.get("/analysis/{application_id}", response_model=SolarAnalysisResponse)
async def get_analysis(
    application_id: int,
    db: Session = Depends(get_db)
):
    """Get analysis results for a specific application"""
    try:
        service = SolarPanelService(db)
        
        analysis = service.get_analysis_by_application(application_id)
        if not analysis:
            raise HTTPException(status_code=404, detail="Analysis not found for this application")
        
        return analysis
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving analysis: {str(e)}")

# API 3: Create Carbon Token
@router.post("/tokens", response_model=CarbonTokenResponse)
async def create_carbon_token(
    token_data: CarbonTokenCreate,
    db: Session = Depends(get_db)
):
    """Create carbon token from application and analysis data"""
    try:
        service = SolarPanelService(db)
        
        # Check if application exists
        application = service.get_application(token_data.application_id)
        if not application:
            raise HTTPException(status_code=404, detail="Application not found")
        
        # Check if analysis exists
        analysis = service.get_analysis_by_application(token_data.application_id)
        if not analysis:
            raise HTTPException(status_code=404, detail="Analysis data not found for this application")
        
        # Create token
        token = service.create_carbon_token(token_data)
        
        return token
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating token: {str(e)}")

# Get all tokens
@router.get("/tokens", response_model=CarbonTokenList)
async def get_all_tokens(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all carbon tokens with pagination"""
    try:
        service = SolarPanelService(db)
        tokens = service.get_all_tokens(skip, limit)
        total = service.get_token_count()
        
        return CarbonTokenList(tokens=tokens, total=total)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving tokens: {str(e)}")

# Get Token by ID
@router.get("/tokens/id/{token_id}", response_model=CarbonTokenResponse)
async def get_token_by_id(
    token_id: int,
    db: Session = Depends(get_db)
):
    """Get carbon token by its ID"""
    try:
        service = SolarPanelService(db)
        
        token = service.get_token(token_id)
        if not token:
            raise HTTPException(status_code=404, detail="Token not found")
        
        return token
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving token: {str(e)}")

# Get Token by Application ID
@router.get("/tokens/application/{application_id}", response_model=CarbonTokenResponse)
async def get_token_by_application(
    application_id: int,
    db: Session = Depends(get_db)
):
    """Get carbon token for a specific application"""
    try:
        service = SolarPanelService(db)
        
        token = service.get_token_by_application(application_id)
        if not token:
            raise HTTPException(status_code=404, detail="Token not found for this application")
        
        return token
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving token: {str(e)}")

# Get Tokens by Name
@router.get("/tokens/name/{name}", response_model=CarbonTokenList)
async def get_tokens_by_name(
    name: str,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get carbon tokens by name with pagination"""
    try:
        service = SolarPanelService(db)
        
        tokens = service.get_tokens_by_name(name, skip, limit)
        total = db.query(CarbonToken).filter(CarbonToken.name == name).count()
        
        if not tokens:
            raise HTTPException(status_code=404, detail="No tokens found with this name")
        
        return CarbonTokenList(tokens=tokens, total=total)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving tokens: {str(e)}")

# Get Token Summary Statistics
@router.get("/tokens/summary")
async def get_tokens_summary(
    db: Session = Depends(get_db)
):
    """Get summary statistics of carbon tokens"""
    try:
        service = SolarPanelService(db)
        
        # Get total count
        total_tokens = service.get_token_count()
        
        # Get total credits
        total_credits = service.get_total_credits()
        
        # Get source distribution
        from sqlalchemy import func
        source_counts = db.query(
            CarbonToken.source,
            func.count(CarbonToken.id)
        ).group_by(CarbonToken.source).all()
        
        source_distribution = {source: count for source, count in source_counts}
        
        return {
            "total_tokens": total_tokens,
            "total_credits": total_credits,
            "source_distribution": source_distribution
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving token summary: {str(e)}")