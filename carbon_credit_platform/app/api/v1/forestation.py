from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from typing import List, Optional
import json

from app.database import get_db
from app.api.deps import get_current_user
from app.models.forestation import ForestationApplication
from app.services.forestation_service import ForestationService
from app.schemas.forestation import (
    ForestationApplicationCreate,
    ForestationApplicationUpdate,
    ForestationApplicationResponse,
    ForestationApplicationList,
    FileUploadResponse,
    GeotagValidationResponse
)

router = APIRouter(prefix="/forestation", tags=["forestation"])

@router.post("/applications", response_model=ForestationApplicationResponse)
async def create_forestation_application(
    full_name: str = Form(...),
    aadhar_card: str = Form(...),
    ownership_document: Optional[UploadFile] = File(None),
    geotag_photo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    """Create a new forestation application"""
    try:
        # Create application data
        application_data = ForestationApplicationCreate(
            full_name=full_name,
            aadhar_card=aadhar_card
        )
        
        # Initialize service
        service = ForestationService(db)
        
        # For now, use a mock user_id (in real app, get from JWT token)
        user_id = 1  # TODO: Get from authenticated user
        
        # Create application
        application = service.create_application(
            user_id=user_id,
            application_data=application_data,
            ownership_document=ownership_document,
            geotag_photo=geotag_photo
        )
        
        return application
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/applications", response_model=ForestationApplicationList)
async def get_user_applications(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all forestation applications for the current user"""
    try:
        service = ForestationService(db)
        user_id = 1  # TODO: Get from authenticated user
        
        applications = service.get_user_applications(user_id, skip, limit)
        total = db.query(ForestationApplication).filter(
            ForestationApplication.user_id == user_id
        ).count()
        
        return ForestationApplicationList(
            applications=applications,
            total=total,
            page=skip // limit + 1,
            size=limit
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/applications/{application_id}", response_model=ForestationApplicationResponse)
async def get_application(
    application_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific forestation application"""
    try:
        service = ForestationService(db)
        user_id = 1  # TODO: Get from authenticated user
        
        application = service.get_application(application_id, user_id)
        if not application:
            raise HTTPException(status_code=404, detail="Application not found")
        
        return application
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.put("/applications/{application_id}", response_model=ForestationApplicationResponse)
async def update_application(
    application_id: int,
    update_data: ForestationApplicationUpdate,
    db: Session = Depends(get_db)
):
    """Update a forestation application"""
    try:
        service = ForestationService(db)
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
    """Delete a forestation application"""
    try:
        service = ForestationService(db)
        user_id = 1  # TODO: Get from authenticated user
        
        success = service.delete_application(application_id, user_id)
        if not success:
            raise HTTPException(status_code=404, detail="Application not found")
        
        return {"message": "Application deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/validate-geotag", response_model=GeotagValidationResponse)
async def validate_geotag_photo(
    photo: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Validate if uploaded photo contains geotag data"""
    try:
        service = ForestationService(db)
        validation_result = service.validate_geotag_photo(photo)
        return validation_result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error validating photo: {str(e)}")

@router.post("/upload-document", response_model=FileUploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    file_type: str = Form(...),  # "ownership", "geotag"
    db: Session = Depends(get_db)
):
    """Upload a document for forestation application"""
    try:
        service = ForestationService(db)
        
        # Validate file type
        allowed_types = {
            "ownership": ["pdf", "doc", "docx"],
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

@router.get("/stats")
async def get_application_stats(
    db: Session = Depends(get_db)
):
    """Get application statistics for the current user"""
    try:
        service = ForestationService(db)
        user_id = 1  # TODO: Get from authenticated user
        
        stats = service.get_application_stats(user_id)
        return stats
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# Admin endpoints
@router.get("/admin/applications", response_model=ForestationApplicationList)
async def get_all_applications_admin(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all forestation applications (admin only)"""
    try:
        service = ForestationService(db)
        applications = service.get_all_applications(skip, limit, status)
        
        # Get total count
        query = db.query(ForestationApplication)
        if status:
            query = query.filter(ForestationApplication.status == status)
        total = query.count()
        
        return ForestationApplicationList(
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
        service = ForestationService(db)
        
        # Find application
        application = db.query(ForestationApplication).filter(
            ForestationApplication.id == application_id
        ).first()
        
        if not application:
            raise HTTPException(status_code=404, detail="Application not found")
        
        # Update status
        update_data = ForestationApplicationUpdate(
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

# Additional utility endpoints
@router.get("/health")
async def forestation_health_check():
    """Health check for forestation module"""
    return {
        "module": "forestation",
        "status": "healthy",
        "endpoints": [
            "/applications",
            "/applications/{id}",
            "/validate-geotag",
            "/upload-document",
            "/stats",
            "/admin/applications"
        ]
    }

@router.post("/calculate-carbon-credits")
async def calculate_forestation_carbon_credits(
    latitude: float = Form(...),
    longitude: float = Form(...),
    area_hectares: float = Form(1.0),
    db: Session = Depends(get_db)
):
    """Calculate carbon credits for forestation projects - 1 ton CO2 = 1 carbon coin"""
    try:
        service = ForestationService(db)
        result = service.calculate_forestation_carbon_credits(
            latitude=latitude,
            longitude=longitude,
            area_hectares=area_hectares
        )
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating forestation carbon credits: {str(e)}")

@router.post("/applications/{application_id}/analyze")
async def perform_forest_analysis(
    application_id: int,
    db: Session = Depends(get_db)
):
    """Perform complete forest analysis with satellite imagery and carbon credit calculation"""
    try:
        service = ForestationService(db)
        user_id = 1  # TODO: Get from authenticated user
        
        result = await service.perform_complete_forest_analysis(application_id, user_id)
        
        if 'error' in result:
            raise HTTPException(status_code=400, detail=result['error'])
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forest analysis failed: {str(e)}")

@router.post("/applications/{application_id}/mint-coins")
async def mint_forestation_coins(
    application_id: int,
    issuer_name: str = Form(...),
    description: str = Form(None),
    price_per_coin: float = Form(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Mint carbon coins for an approved forestation application and save to marketplace"""
    try:
        from app.services.marketplace_service import MarketplaceService
        from app.schemas.marketplace import MarketplaceCreditCreate, SourceType
        
        service = ForestationService(db)
        
        # Get the application
        application = service.get_application(application_id, current_user.id)
        if not application:
            raise HTTPException(status_code=404, detail="Application not found")
        
        if application.status != 'approved':
            raise HTTPException(status_code=400, detail="Application must be approved before minting coins")
        
        # Calculate carbon credits
        result = service.calculate_carbon_credits(application_id, current_user.id)
        
        if 'error' in result:
            raise HTTPException(status_code=400, detail=result['error'])
        
        # Extract carbon credits from the result
        carbon_credits_data = result.get('carbon_credit_calculations', {})
        annual_carbon_coins = carbon_credits_data.get('annual_carbon_credits', 0)
        
        if annual_carbon_coins <= 0:
            raise HTTPException(status_code=400, detail="No carbon credits calculated for this application")
        
        # Create marketplace credit entry
        marketplace_service = MarketplaceService(db)
        
        credit_data = MarketplaceCreditCreate(
            issuer_name=issuer_name,
            issuer_id=current_user.id,
            coins_issued=annual_carbon_coins,
            source_type=SourceType.FORESTATION,
            source_project_id=application_id,
            description=description or f"Forestation carbon credits - {application.full_name}",
            price_per_coin=price_per_coin
        )
        
        # Save to marketplace credits database
        marketplace_credit = marketplace_service.create_marketplace_credit(credit_data)
        
        # Return minting result
        minting_result = {
            "success": True,
            "message": f"Successfully minted {annual_carbon_coins} carbon coins for forestation project!",
            "data": {
                "marketplace_credit_id": marketplace_credit.id,
                "application_id": application_id,
                "carbon_coins": {
                    "annual": annual_carbon_coins,
                    "issue_date": marketplace_credit.issue_date.isoformat(),
                    "conversion_rate": "1 ton CO2 = 1 carbon coin",
                    "minting_status": "successful",
                    "transaction_id": f"FC_{marketplace_credit.id}_{int(annual_carbon_coins)}"
                },
                "forestation_details": {
                    "applicant_name": application.full_name,
                    "coordinates": f"{application.latitude}, {application.longitude}",
                    "area_hectares": carbon_credits_data.get('total_area_ha', 0),
                    "forest_type": carbon_credits_data.get('forest_type', 'unknown')
                },
                "marketplace_info": {
                    "verification_status": marketplace_credit.verification_status,
                    "issuer_name": marketplace_credit.issuer_name,
                    "price_per_coin": marketplace_credit.price_per_coin
                }
            }
        }
        
        return minting_result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error minting forestation coins: {str(e)}")

@router.get("/")
async def forestation_info():
    """Get information about the forestation module"""
    return {
        "module": "forestation",
        "description": "Advanced forest carbon credit platform with AI-powered analysis",
        "version": "2.0.0",
        "features": [
            "Application submission",
            "Document upload",
            "Geotag validation with OpenAI Vision API",
            "Application tracking",
            "Admin management",
            "Advanced forest analysis with satellite imagery",
            "Computer vision tree counting and vegetation analysis",
            "Real-time weather data integration",
            "IPCC-compliant carbon credit calculation",
            "Carbon coin minting (1 ton CO2 = 1 carbon coin)",
            "Forest health monitoring with IoT data simulation",
            "Complete forest analysis with satellite imagery"
        ],
        "analysis_capabilities": [
            "Satellite imagery download and analysis",
            "Computer vision vegetation detection",
            "Individual tree counting using contour detection",
            "Forest type classification (tropical/temperate/boreal)",
            "Carbon sequestration rate calculation",
            "Real-time weather data integration",
            "Forest health monitoring simulation",
            "Carbon credit and coin calculation"
        ]
    }