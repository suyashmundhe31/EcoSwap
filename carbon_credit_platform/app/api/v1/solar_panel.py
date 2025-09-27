from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from typing import List, Optional
import json

from app.database import get_db
from app.services.solar_panel_service import SolarPanelService
from app.schemas.solar_panel import (
    SolarPanelApplicationCreate,
    SolarPanelApplicationUpdate,
    SolarPanelApplicationResponse,
    SolarPanelApplicationList,
    FileUploadResponse,
    GeotagValidationResponse
)

router = APIRouter(prefix="/solar-panel", tags=["solar-panel"])

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
    """Create a new solar panel application"""
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
        
        # For now, use a mock user_id (in real app, get from JWT token)
        user_id = 1  # TODO: Get from authenticated user
        
        # Create application
        application = service.create_application(
            user_id=user_id,
            application_data=application_data,
            ownership_document=ownership_document,
            energy_certification=energy_certification,
            geotag_photo=geotag_photo
        )
        
        return application
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/applications", response_model=SolarPanelApplicationList)
async def get_user_applications(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all solar panel applications for the current user"""
    try:
        service = SolarPanelService(db)
        user_id = 1  # TODO: Get from authenticated user
        
        applications = service.get_user_applications(user_id, skip, limit)
        total = service.db.query(service.db.query(SolarPanelApplication).filter(
            SolarPanelApplication.user_id == user_id
        ).count())
        
        return SolarPanelApplicationList(
            applications=applications,
            total=total,
            page=skip // limit + 1,
            size=limit
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/applications/{application_id}", response_model=SolarPanelApplicationResponse)
async def get_application(
    application_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific solar panel application"""
    try:
        service = SolarPanelService(db)
        user_id = 1  # TODO: Get from authenticated user
        
        application = service.get_application(application_id, user_id)
        if not application:
            raise HTTPException(status_code=404, detail="Application not found")
        
        return application
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.put("/applications/{application_id}", response_model=SolarPanelApplicationResponse)
async def update_application(
    application_id: int,
    update_data: SolarPanelApplicationUpdate,
    db: Session = Depends(get_db)
):
    """Update a solar panel application"""
    try:
        service = SolarPanelService(db)
        user_id = 1  # TODO: Get from authenticated user
        
        application = service.update_application(application_id, user_id, update_data)
        if not application:
            raise HTTPException(status_code=404, detail="Application not found")
        
        return application
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.delete("/applications/{application_id}")
async def delete_application(
    application_id: int,
    db: Session = Depends(get_db)
):
    """Delete a solar panel application"""
    try:
        service = SolarPanelService(db)
        user_id = 1  # TODO: Get from authenticated user
        
        success = service.delete_application(application_id, user_id)
        if not success:
            raise HTTPException(status_code=404, detail="Application not found")
        
        return {"message": "Application deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/extract-gps", response_model=GeotagValidationResponse)
async def extract_gps_from_photo(
    photo: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Extract GPS coordinates from uploaded photo in real-time"""
    try:
        service = SolarPanelService(db)
        
        # Validate file type
        if not photo.content_type or not photo.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Extract GPS coordinates using OpenAI and fallback methods
        validation_result = service.validate_geotag_photo(photo)
        
        return validation_result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error extracting GPS: {str(e)}")

@router.post("/calculate-solar-energy")
async def calculate_solar_energy(
    latitude: float = Form(...),
    longitude: float = Form(...),
    panel_area_sqm: Optional[float] = Form(None),
    db: Session = Depends(get_db)
):
    """Calculate solar energy potential and carbon credits for given coordinates"""
    try:
        from app.services.carbon_calculator import carbon_calculator
        
        # Calculate solar energy and carbon credits
        result = carbon_calculator.calculate_solar_carbon_credits(
            latitude=latitude,
            longitude=longitude,
            panel_area_sqm=panel_area_sqm
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating solar energy: {str(e)}")

@router.post("/validate-geotag", response_model=GeotagValidationResponse)
async def validate_geotag_photo(
    photo: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Validate if uploaded photo contains geotag data"""
    try:
        service = SolarPanelService(db)
        validation_result = service.validate_geotag_photo(photo)
        return validation_result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error validating photo: {str(e)}")

@router.post("/upload-document", response_model=FileUploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    file_type: str = Form(...),  # "ownership", "certification", "geotag"
    db: Session = Depends(get_db)
):
    """Upload a document for solar panel application"""
    try:
        service = SolarPanelService(db)
        
        # Validate file type
        allowed_types = {
            "ownership": ["pdf", "doc", "docx"],
            "certification": ["pdf", "doc", "docx"],
            "geotag": ["jpg", "jpeg", "png"]
        }
        
        if file_type not in allowed_types:
            raise HTTPException(status_code=400, detail="Invalid file type")
        
        file_extension = file.filename.split('.')[-1].lower()
        if file_extension not in allowed_types[file_type]:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid file format. Allowed: {', '.join(allowed_types[file_type])}"
            )
        
        # Save file
        file_path = service._save_file(file, file_extension)
        
        return FileUploadResponse(
            message="File uploaded successfully",
            file_path=file_path,
            file_type=file_type
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading file: {str(e)}")

@router.post("/mint-carbon-coins")
async def mint_carbon_coins(
    latitude: float = Form(...),
    longitude: float = Form(...),
    annual_energy_mwh: float = Form(...),
    annual_co2_avoided_tonnes: float = Form(...),
    annual_carbon_credits: float = Form(...),
    calculation_method: str = Form(...),
    db: Session = Depends(get_db)
):
    """Mint carbon coins based on solar calculation results"""
    try:
        from app.services.carbon_calculator import carbon_calculator
        from datetime import datetime
        
        # Calculate carbon coins (1 ton CO2 = 1 carbon coin)
        annual_carbon_coins = annual_co2_avoided_tonnes
        ten_year_carbon_coins = annual_carbon_coins * 10
        
        # Create carbon coin minting result
        minting_result = {
            "success": True,
            "message": "Carbon coins minted successfully!",
            "data": {
                "annual_energy_mwh": annual_energy_mwh,
                "annual_co2_avoided_tonnes": annual_co2_avoided_tonnes,
                "annual_carbon_credits": annual_carbon_credits,
                "calculation_method": calculation_method,
                "carbon_coins": {
                    "annual": annual_carbon_coins,
                    "ten_year": ten_year_carbon_coins,
                    "issue_date": datetime.now().isoformat(),
                    "conversion_rate": "1 ton CO2 = 1 carbon coin",
                    "minting_status": "successful",
                    "transaction_id": f"CC_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{int(annual_carbon_coins)}"
                },
                "coordinates": {
                    "latitude": latitude,
                    "longitude": longitude
                },
                "environmental_impact": {
                    "co2_avoided_per_year": f"{annual_co2_avoided_tonnes} tonnes",
                    "equivalent_trees_planted": int(annual_co2_avoided_tonnes * 22),  # 1 ton CO2 = ~22 trees
                    "cars_off_road_equivalent": round(annual_co2_avoided_tonnes / 4.6, 1)  # Average car emits 4.6 tons/year
                }
            }
        }
        
        return minting_result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error minting carbon coins: {str(e)}")

@router.get("/stats")
async def get_application_stats(
    db: Session = Depends(get_db)
):
    """Get application statistics for the current user"""
    try:
        service = SolarPanelService(db)
        user_id = 1  # TODO: Get from authenticated user
        
        stats = service.get_application_stats(user_id)
        return stats
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# Admin endpoints
@router.get("/admin/applications", response_model=SolarPanelApplicationList)
async def get_all_applications_admin(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all solar panel applications (admin only)"""
    try:
        service = SolarPanelService(db)
        applications = service.get_all_applications(skip, limit, status)
        
        # Get total count
        query = service.db.query(SolarPanelApplication)
        if status:
            query = query.filter(SolarPanelApplication.status == status)
        total = query.count()
        
        return SolarPanelApplicationList(
            applications=applications,
            total=total,
            page=skip // limit + 1,
            size=limit
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.put("/admin/applications/{application_id}/status")
async def update_application_status(
    application_id: int,
    status: str = Form(...),
    verification_notes: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """Update application status (admin only)"""
    try:
        service = SolarPanelService(db)
        
        # Find application
        application = service.db.query(SolarPanelApplication).filter(
            SolarPanelApplication.id == application_id
        ).first()
        
        if not application:
            raise HTTPException(status_code=404, detail="Application not found")
        
        # Update status
        update_data = SolarPanelApplicationUpdate(
            status=status,
            verification_notes=verification_notes
        )
        
        updated_application = service.update_application(
            application_id, 
            application.user_id, 
            update_data
        )
        
        return updated_application
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
