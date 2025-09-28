from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class RetirementStatusEnum(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class RetirementRequestSchema(BaseModel):
    user_id: int
    coins_to_retire: float = Field(..., gt=0, description="Number of coins to retire")
    retirement_reason: Optional[str] = "Net Zero Goal"
    auto_confirm: bool = False

class RetirementUpdateSchema(BaseModel):
    coins_to_retire: Optional[float] = Field(None, gt=0)
    retirement_reason: Optional[str] = None

class RetirementResponseSchema(BaseModel):
    id: int
    retirement_id: str
    user_id: int
    coins_retired: float
    co2_offset_tons: float
    retirement_status: RetirementStatusEnum
    retirement_reason: Optional[str]
    certificate_number: Optional[str]
    certificate_issued: bool
    retirement_date: datetime
    completed_at: Optional[datetime]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class DashboardStatsSchema(BaseModel):
    total_retired: float
    available_for_retirement: float
    total_credits: float
    co2_offset_tons: float
    progress_percentage: float
    pending_retirements: int
    completed_retirements: int

class RetirementHistorySchema(BaseModel):
    id: int
    retirement_id: str
    coins_retired: float
    co2_offset_tons: float
    retirement_status: str
    retirement_reason: Optional[str]
    certificate_number: Optional[str]
    retirement_date: datetime
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True

class PurchaseHistorySchema(BaseModel):
    id: int
    transaction_id: str
    credits_amount: float
    coins_amount: float
    transaction_type: str
    status: str
    description: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class RetirementOperationResponse(BaseModel):
    success: bool
    message: str
    status: Optional[str] = None
    retirement_id: Optional[str] = None
    certificate_number: Optional[str] = None
    remaining_user_coins: Optional[float] = None