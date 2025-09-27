# app/models/solar_panel.py
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class SolarPanelApplication(Base):
    __tablename__ = "solar_panel_applications_v2"
    
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
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship
    user = relationship("User", back_populates="solar_panel_applications")


class SolarAnalysisResult(Base):
    __tablename__ = "solar_analysis_results_v2"
    
    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("solar_panel_applications_v2.id"), nullable=False)
    
    # Analysis results
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    co2_emission_saved = Column(Float, nullable=True)
    annual_mwh = Column(Float, nullable=True)
    annual_carbon_credits = Column(Float, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship
    application = relationship("SolarPanelApplication")


class CarbonToken(Base):
    __tablename__ = "carbon_tokens_v2"
    
    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("solar_panel_applications_v2.id"), nullable=False)
    
    # Token information
    name = Column(String, nullable=False)
    credits = Column(Float, nullable=False)
    source = Column(String, default="solar")
    tokenized_date = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship
    application = relationship("SolarPanelApplication")