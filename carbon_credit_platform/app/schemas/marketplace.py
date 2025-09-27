from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from enum import Enum

class SourceType(str, Enum):
    FORESTATION = "forestation"
    SOLAR_PANEL = "solar_panel"

class VerificationStatus(str, Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"

class MarketplaceCreditBase(BaseModel):
    issuer_name: str
    coins_issued: float
    source_type: SourceType
    source_project_id: Optional[int] = None
    description: Optional[str] = None
    price_per_coin: Optional[float] = None

class MarketplaceCreditCreate(MarketplaceCreditBase):
    issuer_id: int

class MarketplaceCreditUpdate(BaseModel):
    verification_status: Optional[VerificationStatus] = None
    verified_at: Optional[datetime] = None
    description: Optional[str] = None
    price_per_coin: Optional[float] = None

class MarketplaceCreditResponse(MarketplaceCreditBase):
    id: int
    issuer_id: int
    issue_date: datetime
    verification_status: VerificationStatus
    verified_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class MarketplaceCreditListResponse(BaseModel):
    credits: list[MarketplaceCreditResponse]
    total: int
    page: int
    size: int
