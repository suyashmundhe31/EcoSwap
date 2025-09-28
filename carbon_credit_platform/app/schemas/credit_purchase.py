from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CreditPurchaseRequest(BaseModel):
    user_id: int
    credit_id: int
    credits_to_purchase: float
    coin_cost: float

class CreditPurchaseResponse(BaseModel):
    success: bool
    transaction_id: Optional[int] = None
    credits_purchased: float
    coins_spent: float
    remaining_user_coins: float
    remaining_credits_in_marketplace: float
    message: str

class UserWalletResponse(BaseModel):
    user_id: int
    total_coins: float
    available_coins: float
    last_updated: datetime

class MarketplaceCreditResponse(BaseModel):
    id: int
    name: str
    description: str
    credits: float
    coins: float
    source: str
    image: Optional[str] = None
    location: Optional[str] = None
    tokenized_date: Optional[str] = None