from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.credit_purchase import (
    CreditPurchaseRequest, 
    CreditPurchaseResponse, 
    UserWalletResponse,
    MarketplaceCreditResponse
)
from app.services.credit_purchase_service import CreditPurchaseService

router = APIRouter()

@router.post("/purchase", response_model=CreditPurchaseResponse)
async def purchase_credits(
    purchase_request: CreditPurchaseRequest,
    db: Session = Depends(get_db)
):
    """Purchase carbon credits from marketplace"""
    try:
        service = CreditPurchaseService(db)
        result = service.purchase_credits(purchase_request)
        
        if not result.get('success', False):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get('error', 'Purchase failed')
            )
        
        return CreditPurchaseResponse(**result)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Purchase failed: {str(e)}"
        )

@router.get("/wallet/{user_id}", response_model=UserWalletResponse)
async def get_user_wallet(user_id: int, db: Session = Depends(get_db)):
    """Get user's current coin balance"""
    try:
        service = CreditPurchaseService(db)
        wallet_info = service.get_user_wallet(user_id)
        
        return UserWalletResponse(**wallet_info)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Wallet not found: {str(e)}"
        )

@router.get("/marketplace/available", response_model=List[MarketplaceCreditResponse])
async def get_available_credits(db: Session = Depends(get_db)):
    """Get all available credits in marketplace (credits > 0)"""
    try:
        service = CreditPurchaseService(db)
        available_credits = service.get_available_marketplace_credits()
        
        return [MarketplaceCreditResponse(**credit) for credit in available_credits]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch available credits: {str(e)}"
        )

@router.get("/marketplace/all", response_model=List[MarketplaceCreditResponse])
async def get_all_marketplace_credits(db: Session = Depends(get_db)):
    """Get all marketplace credits (including those with 0 credits)"""
    try:
        service = CreditPurchaseService(db)
        all_credits = service.get_all_marketplace_credits()
        
        return [MarketplaceCreditResponse(**credit) for credit in all_credits]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch all marketplace credits: {str(e)}"
        )