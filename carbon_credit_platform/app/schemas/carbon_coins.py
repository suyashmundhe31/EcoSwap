from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum

class CoinSourceEnum(str, Enum):
    SOLAR_PANEL = "solar_panel"
    FORESTATION = "forestation"

class CarbonCoinIssueCreate(BaseModel):
    user_id: int
    coins_issued: float
    source: CoinSourceEnum
    source_application_id: int
    description: Optional[str] = None
    calculation_method: Optional[str] = None

class CarbonCoinIssueResponse(BaseModel):
    issue_id: int
    user_id: int
    full_name: str
    company_name: Optional[str]
    coins_issued: float
    source: str
    source_application_id: int
    description: Optional[str]
    calculation_method: Optional[str]
    issue_date: datetime
    created_at: datetime
    
    class Config:
        from_attributes = True

class CarbonCoinIssueList(BaseModel):
    issues: List[CarbonCoinIssueResponse]
    total: int
    page: int
    size: int

class CarbonCoinStats(BaseModel):
    total_coins_issued: float
    solar_panel_coins: float
    forestation_coins: float
    total_issues: int
    last_updated: str

class CarbonCoinMintRequest(BaseModel):
    coins_issued: float
    source: CoinSourceEnum
    source_application_id: int
    description: Optional[str] = None
    calculation_method: Optional[str] = None

class CarbonCoinMintResponse(BaseModel):
    success: bool
    issue_id: Optional[int] = None
    coins_issued: Optional[float] = None
    source: Optional[str] = None
    issue_date: Optional[str] = None
    message: str
    error: Optional[str] = None