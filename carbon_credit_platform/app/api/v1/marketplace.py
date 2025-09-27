from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.services.marketplace_service import MarketplaceService
from app.schemas.marketplace import (
    MarketplaceCreditCreate,
    MarketplaceCreditUpdate,
    MarketplaceCreditResponse,
    MarketplaceCreditListResponse,
    SourceType,
    VerificationStatus
)

router = APIRouter(prefix="/marketplace", tags=["marketplace"])

@router.post("/credits", response_model=MarketplaceCreditResponse)
def create_marketplace_credit(
    credit_data: MarketplaceCreditCreate,
    db: Session = Depends(get_db)
):
    """Create a new marketplace credit entry"""
    service = MarketplaceService(db)
    return service.create_marketplace_credit(credit_data)

@router.get("/credits", response_model=MarketplaceCreditListResponse)
def get_marketplace_credits(
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Page size"),
    verification_status: Optional[VerificationStatus] = Query(None, description="Filter by verification status"),
    source_type: Optional[SourceType] = Query(None, description="Filter by source type"),
    issuer_id: Optional[int] = Query(None, description="Filter by issuer ID"),
    db: Session = Depends(get_db)
):
    """Get marketplace credits with optional filtering"""
    service = MarketplaceService(db)
    skip = (page - 1) * size
    
    credits, total = service.get_marketplace_credits(
        skip=skip,
        limit=size,
        verification_status=verification_status,
        source_type=source_type,
        issuer_id=issuer_id
    )
    
    return MarketplaceCreditListResponse(
        credits=credits,
        total=total,
        page=page,
        size=size
    )

@router.get("/credits/{credit_id}", response_model=MarketplaceCreditResponse)
def get_marketplace_credit(
    credit_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific marketplace credit by ID"""
    service = MarketplaceService(db)
    credit = service.get_marketplace_credit_by_id(credit_id)
    if not credit:
        raise HTTPException(status_code=404, detail="Marketplace credit not found")
    return credit

@router.put("/credits/{credit_id}", response_model=MarketplaceCreditResponse)
def update_marketplace_credit(
    credit_id: int,
    credit_update: MarketplaceCreditUpdate,
    db: Session = Depends(get_db)
):
    """Update a marketplace credit"""
    service = MarketplaceService(db)
    credit = service.update_marketplace_credit(credit_id, credit_update)
    if not credit:
        raise HTTPException(status_code=404, detail="Marketplace credit not found")
    return credit

@router.delete("/credits/{credit_id}")
def delete_marketplace_credit(
    credit_id: int,
    db: Session = Depends(get_db)
):
    """Delete a marketplace credit"""
    service = MarketplaceService(db)
    success = service.delete_marketplace_credit(credit_id)
    if not success:
        raise HTTPException(status_code=404, detail="Marketplace credit not found")
    return {"message": "Marketplace credit deleted successfully"}

@router.get("/verified", response_model=List[MarketplaceCreditResponse])
def get_verified_credits_for_marketplace(
    db: Session = Depends(get_db)
):
    """Get all verified credits suitable for marketplace display"""
    service = MarketplaceService(db)
    return service.get_verified_credits_for_marketplace()

@router.get("/by-source/{source_type}", response_model=List[MarketplaceCreditResponse])
def get_credits_by_source_type(
    source_type: SourceType,
    db: Session = Depends(get_db)
):
    """Get verified credits filtered by source type (forestation or solar_panel)"""
    service = MarketplaceService(db)
    return service.get_credits_by_source_type(source_type)

@router.get("/issuer/{issuer_id}/stats")
def get_issuer_stats(
    issuer_id: int,
    db: Session = Depends(get_db)
):
    """Get statistics for a specific issuer"""
    service = MarketplaceService(db)
    return service.get_issuer_stats(issuer_id)

@router.get("/summary")
def get_marketplace_summary(
    db: Session = Depends(get_db)
):
    """Get marketplace summary statistics"""
    service = MarketplaceService(db)
    
    # Get all verified credits
    verified_credits, _ = service.get_marketplace_credits(
        verification_status=VerificationStatus.VERIFIED
    )
    
    # Calculate totals
    total_coins = sum(credit.coins_issued for credit in verified_credits)
    forestation_coins = sum(
        credit.coins_issued for credit in verified_credits 
        if credit.source_type == SourceType.FORESTATION
    )
    solar_coins = sum(
        credit.coins_issued for credit in verified_credits 
        if credit.source_type == SourceType.SOLAR_PANEL
    )
    
    # Count unique issuers
    unique_issuers = len(set(credit.issuer_id for credit in verified_credits))
    
    return {
        "total_verified_credits": len(verified_credits),
        "total_coins_issued": total_coins,
        "forestation_coins": forestation_coins,
        "solar_panel_coins": solar_coins,
        "unique_issuers": unique_issuers,
        "average_coins_per_credit": total_coins / len(verified_credits) if verified_credits else 0
    }
