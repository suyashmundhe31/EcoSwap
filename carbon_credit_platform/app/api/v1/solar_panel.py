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
