# app/schemas/solar_panel.py
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# API 1: Application Schemas
class SolarPanelApplicationCreate(BaseModel):
    full_name: str
    company_name: Optional[str] = None
    aadhar_card: str
    api_link: str

class SolarPanelApplicationResponse(BaseModel):
    id: int
    user_id: int
    full_name: str
    company_name: Optional[str] = None
    aadhar_card: str
    api_link: str
    ownership_document_path: Optional[str] = None
    energy_certification_path: Optional[str] = None
    geotag_photo_path: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# API 2: Analysis Schemas
class SolarAnalysisCreate(BaseModel):
    application_id: int
    latitude: float
    longitude: float
    co2_emission_saved: float
    annual_mwh: float
    annual_carbon_credits: float

class SolarAnalysisResponse(BaseModel):
    id: int
    application_id: int
    latitude: float
    longitude: float
    co2_emission_saved: float
    annual_mwh: float
    annual_carbon_credits: float
    created_at: datetime
    
    class Config:
        from_attributes = True

# API 3: Token Schemas
class CarbonTokenCreate(BaseModel):
    application_id: int
    name: str
    credits: float

class CarbonTokenResponse(BaseModel):
    id: int
    application_id: int
    name: str
    credits: float
    source: str
    tokenized_date: datetime
    
    class Config:
        from_attributes = True

class CarbonTokenList(BaseModel):
    tokens: List[CarbonTokenResponse]
    total: int
    
    class Config:
        from_attributes = True