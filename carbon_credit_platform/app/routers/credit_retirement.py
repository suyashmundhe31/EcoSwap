from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, desc
from typing import List, Optional
import uuid
from datetime import datetime

from app.database import get_db
from app.models.credit_retirement import CreditRetirement, CreditTransaction, RetirementStatus, TransactionType, TransactionStatus
from app.models.user import User
from app.schemas.retirement_schemas import (
    RetirementRequestSchema, 
    RetirementUpdateSchema,
    RetirementResponseSchema,
    DashboardStatsSchema,
    RetirementHistorySchema,
    PurchaseHistorySchema,
    RetirementOperationResponse
)

router = APIRouter(prefix="/api/v1/credit-retirement", tags=["Credit Retirement"])

def get_user_coins(db: Session, user_id: int) -> float:
    """Get user's current available coins"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return getattr(user, 'coins_balance', 0.0)  # Adjust field name as per your User model

def update_user_coins(db: Session, user_id: int, new_balance: float):
    """Update user's coin balance"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.coins_balance = new_balance  # Adjust field name as per your User model
    db.commit()

def generate_certificate_number() -> str:
    """Generate a unique certificate number"""
    return f"CERT-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"

@router.get("/dashboard-stats/{user_id}", response_model=DashboardStatsSchema)
async def get_dashboard_stats(user_id: int, db: Session = Depends(get_db)):
    """Get comprehensive dashboard statistics for a user"""
    
    # Get user's current available coins
    available_coins = get_user_coins(db, user_id)
    
    # Get retirement statistics
    retirement_stats = db.query(
        func.coalesce(func.sum(CreditRetirement.coins_retired), 0).label('total_retired'),
        func.coalesce(func.sum(CreditRetirement.co2_offset_tons), 0).label('total_co2_offset'),
        func.count(CreditRetirement.id).label('total_retirements')
    ).filter(
        and_(
            CreditRetirement.user_id == user_id,
            CreditRetirement.retirement_status == RetirementStatus.COMPLETED
        )
    ).first()
    
    # Get pending retirements count
    pending_count = db.query(func.count(CreditRetirement.id)).filter(
        and_(
            CreditRetirement.user_id == user_id,
            CreditRetirement.retirement_status == RetirementStatus.PENDING
        )
    ).scalar()
    
    # Get total credits (purchased/available)
    total_credits_query = db.query(
        func.coalesce(func.sum(CreditTransaction.credits_amount), 0)
    ).filter(
        and_(
            CreditTransaction.user_id == user_id,
            CreditTransaction.transaction_type == TransactionType.PURCHASE,
            CreditTransaction.status == TransactionStatus.COMPLETED
        )
    ).scalar()
    
    total_retired = retirement_stats.total_retired or 0
    total_co2_offset = retirement_stats.total_co2_offset or 0
    total_credits = total_credits_query or 0
    
    # Calculate progress percentage (assuming net zero goal is total credits)
    progress_percentage = (total_retired / total_credits * 100) if total_credits > 0 else 0
    
    return DashboardStatsSchema(
        total_retired=total_retired,
        available_for_retirement=available_coins,
        total_credits=total_credits,
        co2_offset_tons=total_co2_offset,
        progress_percentage=min(progress_percentage, 100),  # Cap at 100%
        pending_retirements=pending_count or 0,
        completed_retirements=retirement_stats.total_retirements or 0
    )

@router.post("/retire", response_model=RetirementOperationResponse)
async def retire_credits(
    retirement_request: RetirementRequestSchema,
    db: Session = Depends(get_db)
):
    """Retire carbon credits/coins"""
    
    # Validate user and coins
    current_coins = get_user_coins(db, retirement_request.user_id)
    
    if retirement_request.coins_to_retire > current_coins:
        raise HTTPException(
            status_code=400, 
            detail=f"Insufficient coins. Available: {current_coins}, Requested: {retirement_request.coins_to_retire}"
        )
    
    try:
        # Create retirement record
        retirement = CreditRetirement(
            user_id=retirement_request.user_id,
            coins_retired=retirement_request.coins_to_retire,
            co2_offset_tons=retirement_request.coins_to_retire,  # 1 coin = 1 ton CO2
            retirement_reason=retirement_request.retirement_reason,
            retirement_status=RetirementStatus.PENDING if not retirement_request.auto_confirm else RetirementStatus.COMPLETED
        )
        
        # If auto-confirm, complete the retirement immediately
        if retirement_request.auto_confirm:
            retirement.certificate_number = generate_certificate_number()
            retirement.certificate_issued = True
            retirement.completed_at = datetime.utcnow()
            retirement.retirement_status = RetirementStatus.COMPLETED
            
            # Update user's coin balance
            new_balance = current_coins - retirement_request.coins_to_retire
            update_user_coins(db, retirement_request.user_id, new_balance)
        
        db.add(retirement)
        db.commit()
        db.refresh(retirement)
        
        # Create transaction record
        transaction = CreditTransaction(
            user_id=retirement_request.user_id,
            retirement_id=retirement.id,
            credits_amount=retirement_request.coins_to_retire,
            coins_amount=retirement_request.coins_to_retire,
            transaction_type=TransactionType.RETIREMENT,
            status=TransactionStatus.COMPLETED if retirement_request.auto_confirm else TransactionStatus.PENDING,
            description=f"Carbon credit retirement: {retirement_request.retirement_reason}"
        )
        
        db.add(transaction)
        db.commit()
        
        # Get updated coin balance
        updated_balance = get_user_coins(db, retirement_request.user_id)
        
        return RetirementOperationResponse(
            success=True,
            message="Retirement request created successfully" if not retirement_request.auto_confirm else "Credits retired successfully",
            status=retirement.retirement_status.value,
            retirement_id=retirement.retirement_id,
            certificate_number=retirement.certificate_number,
            remaining_user_coins=updated_balance
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Retirement failed: {str(e)}")

@router.get("/history/{user_id}", response_model=List[RetirementHistorySchema])
async def get_retirement_history(user_id: int, db: Session = Depends(get_db)):
    """Get user's retirement history"""
    
    retirements = db.query(CreditRetirement).filter(
        CreditRetirement.user_id == user_id
    ).order_by(desc(CreditRetirement.created_at)).all()
    
    return [RetirementHistorySchema.from_orm(retirement) for retirement in retirements]

@router.get("/pending/{user_id}", response_model=List[RetirementResponseSchema])
async def get_pending_retirements(user_id: int, db: Session = Depends(get_db)):
    """Get user's pending retirements"""
    
    pending_retirements = db.query(CreditRetirement).filter(
        and_(
            CreditRetirement.user_id == user_id,
            CreditRetirement.retirement_status == RetirementStatus.PENDING
        )
    ).order_by(desc(CreditRetirement.created_at)).all()
    
    return [RetirementResponseSchema.from_orm(retirement) for retirement in pending_retirements]

@router.put("/update/{retirement_id}", response_model=RetirementOperationResponse)
async def update_retirement_request(
    retirement_id: int,
    user_id: int,
    update_data: RetirementUpdateSchema,
    db: Session = Depends(get_db)
):
    """Update a pending retirement request"""
    
    retirement = db.query(CreditRetirement).filter(
        and_(
            CreditRetirement.id == retirement_id,
            CreditRetirement.user_id == user_id,
            CreditRetirement.retirement_status == RetirementStatus.PENDING
        )
    ).first()
    
    if not retirement:
        raise HTTPException(status_code=404, detail="Pending retirement not found")
    
    # Validate coin amount if being updated
    if update_data.coins_to_retire:
        current_coins = get_user_coins(db, user_id)
        if update_data.coins_to_retire > current_coins:
            raise HTTPException(
                status_code=400, 
                detail=f"Insufficient coins. Available: {current_coins}"
            )
        
        retirement.coins_retired = update_data.coins_to_retire
        retirement.co2_offset_tons = update_data.coins_to_retire
    
    if update_data.retirement_reason:
        retirement.retirement_reason = update_data.retirement_reason
    
    retirement.updated_at = datetime.utcnow()
    
    try:
        db.commit()
        db.refresh(retirement)
        
        return RetirementOperationResponse(
            success=True,
            message="Retirement request updated successfully",
            status=retirement.retirement_status.value,
            retirement_id=retirement.retirement_id
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Update failed: {str(e)}")

@router.post("/confirm/{retirement_id}", response_model=RetirementOperationResponse)
async def confirm_retirement(retirement_id: int, user_id: int, db: Session = Depends(get_db)):
    """Confirm a pending retirement"""
    
    retirement = db.query(CreditRetirement).filter(
        and_(
            CreditRetirement.id == retirement_id,
            CreditRetirement.user_id == user_id,
            CreditRetirement.retirement_status == RetirementStatus.PENDING
        )
    ).first()
    
    if not retirement:
        raise HTTPException(status_code=404, detail="Pending retirement not found")
    
    # Validate user still has enough coins
    current_coins = get_user_coins(db, user_id)
    if retirement.coins_retired > current_coins:
        raise HTTPException(
            status_code=400, 
            detail=f"Insufficient coins. Available: {current_coins}, Required: {retirement.coins_retired}"
        )
    
    try:
        # Complete the retirement
        retirement.retirement_status = RetirementStatus.COMPLETED
        retirement.certificate_number = generate_certificate_number()
        retirement.certificate_issued = True
        retirement.completed_at = datetime.utcnow()
        
        # Update user's coin balance
        new_balance = current_coins - retirement.coins_retired
        update_user_coins(db, user_id, new_balance)
        
        # Update related transaction
        transaction = db.query(CreditTransaction).filter(
            CreditTransaction.retirement_id == retirement.id
        ).first()
        if transaction:
            transaction.status = TransactionStatus.COMPLETED
        
        db.commit()
        db.refresh(retirement)
        
        return RetirementOperationResponse(
            success=True,
            message="Retirement confirmed successfully",
            status=retirement.retirement_status.value,
            retirement_id=retirement.retirement_id,
            certificate_number=retirement.certificate_number,
            remaining_user_coins=new_balance
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Confirmation failed: {str(e)}")

@router.delete("/cancel/{retirement_id}", response_model=RetirementOperationResponse)
async def cancel_retirement(retirement_id: int, user_id: int, db: Session = Depends(get_db)):
    """Cancel a pending retirement"""
    
    retirement = db.query(CreditRetirement).filter(
        and_(
            CreditRetirement.id == retirement_id,
            CreditRetirement.user_id == user_id,
            CreditRetirement.retirement_status == RetirementStatus.PENDING
        )
    ).first()
    
    if not retirement:
        raise HTTPException(status_code=404, detail="Pending retirement not found")
    
    try:
        retirement.retirement_status = RetirementStatus.CANCELLED
        retirement.updated_at = datetime.utcnow()
        
        # Update related transaction
        transaction = db.query(CreditTransaction).filter(
            CreditTransaction.retirement_id == retirement.id
        ).first()
        if transaction:
            transaction.status = TransactionStatus.FAILED
        
        db.commit()
        
        return RetirementOperationResponse(
            success=True,
            message="Retirement cancelled successfully",
            status=retirement.retirement_status.value,
            retirement_id=retirement.retirement_id
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Cancellation failed: {str(e)}")

@router.get("/purchase-history/{user_id}", response_model=List[PurchaseHistorySchema])
async def get_purchase_history(user_id: int, db: Session = Depends(get_db)):
    """Get user's purchase/transaction history"""
    
    transactions = db.query(CreditTransaction).filter(
        CreditTransaction.user_id == user_id
    ).order_by(desc(CreditTransaction.created_at)).all()
    
    return [PurchaseHistorySchema.from_orm(transaction) for transaction in transactions]