from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class SolarPanelApplication(Base):
    __tablename__ = "solar_panel_applications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Personal Information
    full_name = Column(String, nullable=False)
    company_name = Column(String, nullable=True)
    aadhar_card = Column(String, nullable=False)
    api_link = Column(String, nullable=False)
    
    # File paths for uploaded documents
    ownership_document_path = Column(String, nullable=True)
    energy_certification_path = Column(String, nullable=True)
    geotag_photo_path = Column(String, nullable=True)
    
    # Location data extracted from geotagged photo
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    # Application status
    status = Column(String, default="pending")  # pending, verified, approved, rejected
    
    # Verification data
    verification_notes = Column(Text, nullable=True)
    verified_at = Column(DateTime(timezone=True), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="solar_panel_applications")
