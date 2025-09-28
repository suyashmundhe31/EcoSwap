from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.services.retirement_service import CreditRetirementService
from app.schemas.retirement_schemas import (
    RetirementRequestSchema,
    RetirementUpdateSchema,
    RetirementResponseSchema,
    DashboardStatsSchema,
    RetirementHistorySchema,
    PurchaseHistorySchema
)
from app.models.credit_retirement import CreditRetirement

router = APIRouter(prefix="/credit-retirement", tags=["Credit Retirement"])

@router.post("/retire", response_model=RetirementResponseSchema)
async def retire_credits(
    retirement_request: RetirementRequestSchema,
    db: Session = Depends(get_db)
):
    """Retire credits for carbon offset"""
    service = CreditRetirementService(db)
    result = service.retire_credits(retirement_request)
    
    if not result['success']:
        raise HTTPException(status_code=400, detail=result['error'])
    
    return RetirementResponseSchema(**result)

@router.get("/summary/{user_id}", response_model=DashboardStatsSchema)
async def get_retirement_summary(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Get user's retirement summary"""
    service = CreditRetirementService(db)
    summary = service.get_user_retirement_summary(user_id)
    return summary

@router.get("/history/{user_id}", response_model=List[RetirementHistorySchema])
async def get_retirement_history(
    user_id: int,
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get user's retirement history"""
    service = CreditRetirementService(db)
    history = service.get_retirement_history(user_id, limit)
    return history

@router.get("/dashboard-stats/{user_id}", response_model=DashboardStatsSchema)
async def get_dashboard_stats(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Get retirement stats for dashboard"""
    service = CreditRetirementService(db)
    stats = service.get_dashboard_stats(user_id)
    
    return DashboardStatsSchema(
        total_retired=stats['total_retired'],
        available_for_retirement=stats['available_for_retirement'],
        co2_offset_tons=stats['co2_offset_tons'],
        progress_percentage=stats['progress_percentage']
    )

@router.get("/certificate/{retirement_id}")
async def get_retirement_certificate(
    retirement_id: str,
    db: Session = Depends(get_db)
):
    """Get retirement certificate details"""
    service = CreditRetirementService(db)
    
    # Get retirement record
    retirement = db.query(CreditRetirement).filter(
        CreditRetirement.retirement_id == retirement_id
    ).first()
    
    if not retirement:
        raise HTTPException(status_code=404, detail="Retirement certificate not found")
    
    return {
        "certificate_number": retirement.certificate_number,
        "retirement_id": retirement.retirement_id,
        "coins_retired": retirement.coins_retired,
        "co2_offset_tons": retirement.co2_offset_tons,
        "retirement_date": retirement.retirement_date,
        "status": retirement.retirement_status,
        "issued": retirement.certificate_issued
    }

@router.put("/update/{retirement_id}")
async def update_retirement_request(
    retirement_id: str,
    update_request: RetirementUpdateSchema,
    user_id: int = Query(..., description="User ID"),
    db: Session = Depends(get_db)
):
    """Update a pending retirement request"""
    service = CreditRetirementService(db)
    result = service.update_retirement_request(retirement_id, user_id, update_request)
    
    if not result['success']:
        raise HTTPException(status_code=400, detail=result['error'])
    
    return result

@router.post("/confirm/{retirement_id}")
async def confirm_retirement(
    retirement_id: str,
    user_id: int = Query(..., description="User ID"),
    db: Session = Depends(get_db)
):
    """Confirm a pending retirement request"""
    service = CreditRetirementService(db)
    result = service.confirm_retirement(retirement_id, user_id)
    
    if not result['success']:
        raise HTTPException(status_code=400, detail=result['error'])
    
    return result

@router.delete("/cancel/{retirement_id}")
async def cancel_retirement(
    retirement_id: str,
    user_id: int = Query(..., description="User ID"),
    db: Session = Depends(get_db)
):
    """Cancel a pending retirement request"""
    service = CreditRetirementService(db)
    result = service.cancel_retirement(retirement_id, user_id)
    
    if not result['success']:
        raise HTTPException(status_code=400, detail=result['error'])
    
    return result

@router.get("/pending/{user_id}", response_model=List[RetirementHistorySchema])
async def get_pending_retirements(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Get user's pending retirement requests"""
    service = CreditRetirementService(db)
    pending_retirements = service.get_pending_retirements(user_id)
    return pending_retirements