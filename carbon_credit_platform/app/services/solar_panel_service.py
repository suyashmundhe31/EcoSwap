# app/services/solar_panel_service.py
from sqlalchemy.orm import Session
from sqlalchemy import func
import os
import uuid
from typing import Optional, List

from app.models.solar_panel import SolarPanelApplication, SolarAnalysisResult, CarbonToken
from app.schemas.solar_panel import (
    SolarPanelApplicationCreate,
    SolarAnalysisCreate,
    CarbonTokenCreate
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
    
    # API 1: Create Application
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
        
        if ownership_document:
            ownership_doc_path = self._save_file(ownership_document, "document")
        
        if energy_certification:
            energy_cert_path = self._save_file(energy_certification, "document")
        
        if geotag_photo:
            geotag_photo_path = self._save_file(geotag_photo, "image")
        
        # Create application record
        db_application = SolarPanelApplication(
            user_id=user_id,
            full_name=application_data.full_name,
            company_name=application_data.company_name,
            aadhar_card=application_data.aadhar_card,
            api_link=application_data.api_link,
            ownership_document_path=ownership_doc_path,
            energy_certification_path=energy_cert_path,
            geotag_photo_path=geotag_photo_path
        )
        
        self.db.add(db_application)
        self.db.commit()
        self.db.refresh(db_application)
        
        return db_application
    
    # API 2: Save Analysis Results
    def save_analysis_results(self, analysis_data: SolarAnalysisCreate) -> SolarAnalysisResult:
        """Save solar panel analysis results"""
        
        # Create analysis record
        db_analysis = SolarAnalysisResult(
            application_id=analysis_data.application_id,
            latitude=analysis_data.latitude,
            longitude=analysis_data.longitude,
            co2_emission_saved=analysis_data.co2_emission_saved,
            annual_mwh=analysis_data.annual_mwh,
            annual_carbon_credits=analysis_data.annual_carbon_credits
        )
        
        self.db.add(db_analysis)
        self.db.commit()
        self.db.refresh(db_analysis)
        
        return db_analysis
    
    # API 3: Create Carbon Token
    def create_carbon_token(self, token_data: CarbonTokenCreate) -> CarbonToken:
        """Create carbon token from application and analysis data"""
        
        # Create token record
        db_token = CarbonToken(
            application_id=token_data.application_id,
            name=token_data.name,
            credits=token_data.credits,
            source="solar"
        )
        
        self.db.add(db_token)
        self.db.commit()
        self.db.refresh(db_token)
        
        return db_token
    
    # Get application by ID
    def get_application(self, application_id: int) -> Optional[SolarPanelApplication]:
        """Get application by ID"""
        return self.db.query(SolarPanelApplication).filter(
            SolarPanelApplication.id == application_id
        ).first()
    
    # Get all applications
    def get_all_applications(self, skip: int = 0, limit: int = 100) -> List[SolarPanelApplication]:
        """Get all applications with pagination"""
        return self.db.query(SolarPanelApplication).offset(skip).limit(limit).all()
    
    # Get analysis by application ID
    def get_analysis_by_application(self, application_id: int) -> Optional[SolarAnalysisResult]:
        """Get analysis results by application ID"""
        return self.db.query(SolarAnalysisResult).filter(
            SolarAnalysisResult.application_id == application_id
        ).first()
    
    # Get all analysis results
    def get_all_analysis(self, skip: int = 0, limit: int = 100) -> List[SolarAnalysisResult]:
        """Get all analysis results with pagination"""
        return self.db.query(SolarAnalysisResult).offset(skip).limit(limit).all()
    
    # Get token by ID
    def get_token(self, token_id: int) -> Optional[CarbonToken]:
        """Get carbon token by ID"""
        return self.db.query(CarbonToken).filter(
            CarbonToken.id == token_id
        ).first()
    
    # Get token by application ID
    def get_token_by_application(self, application_id: int) -> Optional[CarbonToken]:
        """Get carbon token by application ID"""
        return self.db.query(CarbonToken).filter(
            CarbonToken.application_id == application_id
        ).first()
    
    # Get all tokens
    def get_all_tokens(self, skip: int = 0, limit: int = 100) -> List[CarbonToken]:
        """Get all carbon tokens with pagination"""
        return self.db.query(CarbonToken).offset(skip).limit(limit).all()
    
    # Get total token count
    def get_token_count(self) -> int:
        """Get total count of carbon tokens"""
        return self.db.query(CarbonToken).count()
    
    # Get tokens by name
    def get_tokens_by_name(self, name: str, skip: int = 0, limit: int = 100) -> List[CarbonToken]:
        """Get carbon tokens by name with pagination"""
        return self.db.query(CarbonToken).filter(
            CarbonToken.name == name
        ).offset(skip).limit(limit).all()
    
    # Get total credits sum
    def get_total_credits(self) -> float:
        """Get sum of all carbon credits"""
        result = self.db.query(func.sum(CarbonToken.credits)).scalar()
        return float(result) if result is not None else 0.0