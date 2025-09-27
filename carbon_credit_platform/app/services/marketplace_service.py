from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
from typing import List, Optional
from datetime import datetime
from app.models.marketplace import MarketplaceCredit, SourceType, VerificationStatus
from app.schemas.marketplace import (
    MarketplaceCreditCreate, 
    MarketplaceCreditUpdate,
    MarketplaceCreditResponse
)

class MarketplaceService:
    def __init__(self, db: Session):
        self.db = db

    def create_marketplace_credit(self, credit_data: MarketplaceCreditCreate) -> MarketplaceCredit:
        """Create a new marketplace credit entry"""
        db_credit = MarketplaceCredit(
            issuer_name=credit_data.issuer_name,
            issuer_id=credit_data.issuer_id,
            coins_issued=credit_data.coins_issued,
            source_type=credit_data.source_type,
            source_project_id=credit_data.source_project_id,
            description=credit_data.description,
            price_per_coin=credit_data.price_per_coin,
            verification_status=VerificationStatus.PENDING
        )
        
        self.db.add(db_credit)
        self.db.commit()
        self.db.refresh(db_credit)
        return db_credit

    def get_marketplace_credits(
        self, 
        skip: int = 0, 
        limit: int = 100,
        verification_status: Optional[VerificationStatus] = None,
        source_type: Optional[SourceType] = None,
        issuer_id: Optional[int] = None
    ) -> tuple[List[MarketplaceCredit], int]:
        """Get marketplace credits with optional filtering"""
        query = self.db.query(MarketplaceCredit)
        
        # Apply filters
        if verification_status:
            query = query.filter(MarketplaceCredit.verification_status == verification_status)
        if source_type:
            query = query.filter(MarketplaceCredit.source_type == source_type)
        if issuer_id:
            query = query.filter(MarketplaceCredit.issuer_id == issuer_id)
        
        # Get total count
        total = query.count()
        
        # Apply pagination and ordering
        credits = query.order_by(desc(MarketplaceCredit.created_at)).offset(skip).limit(limit).all()
        
        return credits, total

    def get_marketplace_credit_by_id(self, credit_id: int) -> Optional[MarketplaceCredit]:
        """Get a specific marketplace credit by ID"""
        return self.db.query(MarketplaceCredit).filter(MarketplaceCredit.id == credit_id).first()

    def update_marketplace_credit(
        self, 
        credit_id: int, 
        credit_update: MarketplaceCreditUpdate
    ) -> Optional[MarketplaceCredit]:
        """Update a marketplace credit"""
        db_credit = self.get_marketplace_credit_by_id(credit_id)
        if not db_credit:
            return None
        
        # Update fields if provided
        if credit_update.verification_status is not None:
            db_credit.verification_status = credit_update.verification_status
            if credit_update.verification_status == VerificationStatus.VERIFIED:
                db_credit.verified_at = datetime.utcnow()
        
        if credit_update.verified_at is not None:
            db_credit.verified_at = credit_update.verified_at
        
        if credit_update.description is not None:
            db_credit.description = credit_update.description
        
        if credit_update.price_per_coin is not None:
            db_credit.price_per_coin = credit_update.price_per_coin
        
        self.db.commit()
        self.db.refresh(db_credit)
        return db_credit

    def delete_marketplace_credit(self, credit_id: int) -> bool:
        """Delete a marketplace credit"""
        db_credit = self.get_marketplace_credit_by_id(credit_id)
        if not db_credit:
            return False
        
        self.db.delete(db_credit)
        self.db.commit()
        return True

    def get_verified_credits_for_marketplace(self) -> List[MarketplaceCredit]:
        """Get all verified credits suitable for marketplace display"""
        return self.db.query(MarketplaceCredit).filter(
            MarketplaceCredit.verification_status == VerificationStatus.VERIFIED
        ).order_by(desc(MarketplaceCredit.created_at)).all()

    def get_credits_by_source_type(self, source_type: SourceType) -> List[MarketplaceCredit]:
        """Get credits filtered by source type (forestation or solar_panel)"""
        return self.db.query(MarketplaceCredit).filter(
            MarketplaceCredit.source_type == source_type,
            MarketplaceCredit.verification_status == VerificationStatus.VERIFIED
        ).order_by(desc(MarketplaceCredit.created_at)).all()

    def get_issuer_stats(self, issuer_id: int) -> dict:
        """Get statistics for a specific issuer"""
        total_credits = self.db.query(MarketplaceCredit).filter(
            MarketplaceCredit.issuer_id == issuer_id
        ).count()
        
        verified_credits = self.db.query(MarketplaceCredit).filter(
            MarketplaceCredit.issuer_id == issuer_id,
            MarketplaceCredit.verification_status == VerificationStatus.VERIFIED
        ).count()
        
        total_coins = self.db.query(MarketplaceCredit).filter(
            MarketplaceCredit.issuer_id == issuer_id,
            MarketplaceCredit.verification_status == VerificationStatus.VERIFIED
        ).with_entities(MarketplaceCredit.coins_issued).all()
        
        total_coins_issued = sum([coin[0] for coin in total_coins]) if total_coins else 0
        
        return {
            "total_credits": total_credits,
            "verified_credits": verified_credits,
            "total_coins_issued": total_coins_issued,
            "verification_rate": (verified_credits / total_credits * 100) if total_credits > 0 else 0
        }
