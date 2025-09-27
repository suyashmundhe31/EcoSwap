from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
import re

class ForestationApplicationBase(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100, description="Full name of the applicant")
    aadhar_card: str = Field(..., description="Aadhar card number")
    
    @validator('aadhar_card')
    def validate_aadhar_card(cls, v):
        # Remove spaces and validate Aadhar format (12 digits)
        cleaned = re.sub(r'\s+', '', v)
        if not re.match(r'^\d{12}$', cleaned):
            raise ValueError('Aadhar card must be 12 digits')
        return cleaned

class ForestationApplicationCreate(ForestationApplicationBase):
    pass

class ForestationApplicationUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    aadhar_card: Optional[str] = Field(None)
    status: Optional[str] = Field(None, pattern="^(pending|verified|approved|rejected)$")
    verification_notes: Optional[str] = Field(None, max_length=1000)
    
    @validator('aadhar_card')
    def validate_aadhar_card(cls, v):
        if v is not None:
            cleaned = re.sub(r'\s+', '', v)
            if not re.match(r'^\d{12}$', cleaned):
                raise ValueError('Aadhar card must be 12 digits')
            return cleaned

class ForestationApplicationResponse(ForestationApplicationBase):
    id: int
    user_id: int
    ownership_document_path: Optional[str] = None
    geotag_photo_path: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status: str
    verification_notes: Optional[str] = None
    verified_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class ForestationApplicationList(BaseModel):
    applications: list[ForestationApplicationResponse]
    total: int
    page: int
    size: int

class FileUploadResponse(BaseModel):
    message: str
    file_path: str
    file_type: str

class GeotagValidationResponse(BaseModel):
    is_valid: bool
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    message: str
