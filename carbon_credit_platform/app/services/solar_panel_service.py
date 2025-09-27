from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional, Tuple
import os
import uuid
from datetime import datetime

from app.models.solar_panel import SolarPanelApplication
from app.schemas.solar_panel import (
    SolarPanelApplicationCreate, 
    SolarPanelApplicationUpdate,
    GeotagValidationResponse
)

class SolarPanelService:
    def __init__(self, db: Session):
        self.db = db
        self.upload_dir = "uploads/solar_panel"
        self._ensure_upload_dir()
    
    def _ensure_upload_dir(self):
        """Ensure upload directory exists"""
        os.makedirs(self.upload_dir, exist_ok=True)
        os.makedirs(f"{self.upload_dir}/documents", exist_ok=True)
        os.makedirs(f"{self.upload_dir}/photos", exist_ok=True)
    
    def _save_file(self, file, file_type: str) -> str:
        """Save uploaded file and return file path"""
        # Generate unique filename
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        
        # Determine subdirectory based on file type
        subdir = "documents" if file_type in ["pdf", "doc", "docx"] else "photos"
        file_path = os.path.join(self.upload_dir, subdir, unique_filename)
        
        # Save file with proper resource management
        file.file.seek(0)  # Reset file pointer
        content = file.file.read()
        
        with open(file_path, "wb") as buffer:
            buffer.write(content)
        
        return file_path
    
    def validate_geotag_photo(self, file) -> GeotagValidationResponse:
        """Accept geotag photo without validation"""
        # Simply accept the file without any validation
        return GeotagValidationResponse(
            is_valid=True,
            latitude=13.874957858,  # Mock coordinates
            longitude=-310.454364430,  # Mock coordinates
            message="Photo accepted"
        )
    
    
    def create_application(
        self, 
        user_id: int, 
        application_data: SolarPanelApplicationCreate,
        ownership_document=None,
        energy_certification=None,
        geotag_photo=None
    ) -> SolarPanelApplication:
        """Create a new solar panel application"""
        
        # Handle file uploads
        ownership_doc_path = None
        energy_cert_path = None
        geotag_photo_path = None
        latitude = None
        longitude = None
        
        if ownership_document:
            ownership_doc_path = self._save_file(ownership_document, "pdf")
        
        if energy_certification:
            energy_cert_path = self._save_file(energy_certification, "pdf")
        
        if geotag_photo:
            # Validate geotag photo
            geotag_validation = self.validate_geotag_photo(geotag_photo)
            if not geotag_validation.is_valid:
                raise ValueError(f"Invalid geotagged photo: {geotag_validation.message}")
            
            geotag_photo_path = self._save_file(geotag_photo, "image")
            latitude = geotag_validation.latitude
            longitude = geotag_validation.longitude
        
        # Create application record
        db_application = SolarPanelApplication(
            user_id=user_id,
            full_name=application_data.full_name,
            company_name=application_data.company_name,
            aadhar_card=application_data.aadhar_card,
            api_link=application_data.api_link,
            ownership_document_path=ownership_doc_path,
            energy_certification_path=energy_cert_path,
            geotag_photo_path=geotag_photo_path,
            latitude=latitude,
            longitude=longitude,
            status="pending"
        )
        
        self.db.add(db_application)
        self.db.commit()
        self.db.refresh(db_application)
        
        return db_application
    
    def get_application(self, application_id: int, user_id: int) -> Optional[SolarPanelApplication]:
        """Get a specific application by ID for a user"""
        return self.db.query(SolarPanelApplication).filter(
            SolarPanelApplication.id == application_id,
            SolarPanelApplication.user_id == user_id
        ).first()
    
    def get_user_applications(
        self, 
        user_id: int, 
        skip: int = 0, 
        limit: int = 100
    ) -> List[SolarPanelApplication]:
        """Get all applications for a user"""
        return self.db.query(SolarPanelApplication).filter(
            SolarPanelApplication.user_id == user_id
        ).order_by(desc(SolarPanelApplication.created_at)).offset(skip).limit(limit).all()
    
    def get_all_applications(
        self, 
        skip: int = 0, 
        limit: int = 100,
        status: Optional[str] = None
    ) -> List[SolarPanelApplication]:
        """Get all applications (admin function)"""
        query = self.db.query(SolarPanelApplication)
        
        if status:
            query = query.filter(SolarPanelApplication.status == status)
        
        return query.order_by(desc(SolarPanelApplication.created_at)).offset(skip).limit(limit).all()
    
    def update_application(
        self, 
        application_id: int, 
        user_id: int, 
        update_data: SolarPanelApplicationUpdate
    ) -> Optional[SolarPanelApplication]:
        """Update an application"""
        application = self.get_application(application_id, user_id)
        if not application:
            return None
        
        update_dict = update_data.dict(exclude_unset=True)
        
        # Handle status change to verified/approved
        if "status" in update_dict and update_dict["status"] in ["verified", "approved"]:
            update_dict["verified_at"] = datetime.utcnow()
        
        for field, value in update_dict.items():
            setattr(application, field, value)
        
        self.db.commit()
        self.db.refresh(application)
        
        return application
    
    def delete_application(self, application_id: int, user_id: int) -> bool:
        """Delete an application"""
        application = self.get_application(application_id, user_id)
        if not application:
            return False
        
        # Delete associated files
        for file_path in [
            application.ownership_document_path,
            application.energy_certification_path,
            application.geotag_photo_path
        ]:
            if file_path and os.path.exists(file_path):
                os.remove(file_path)
        
        self.db.delete(application)
        self.db.commit()
        
        return True
    
    def get_application_stats(self, user_id: int) -> dict:
        """Get application statistics for a user"""
        total_applications = self.db.query(SolarPanelApplication).filter(
            SolarPanelApplication.user_id == user_id
        ).count()
        
        pending_applications = self.db.query(SolarPanelApplication).filter(
            SolarPanelApplication.user_id == user_id,
            SolarPanelApplication.status == "pending"
        ).count()
        
        approved_applications = self.db.query(SolarPanelApplication).filter(
            SolarPanelApplication.user_id == user_id,
            SolarPanelApplication.status == "approved"
        ).count()
        
        return {
            "total_applications": total_applications,
            "pending_applications": pending_applications,
            "approved_applications": approved_applications
        }
