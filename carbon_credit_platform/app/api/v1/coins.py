from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.marketplace import MarketplaceCredit
from app.schemas.marketplace import MarketplaceCreditResponse, MarketplaceCreditCreate
from app.api.deps import get_current_user

router = APIRouter(prefix="/coins", tags=["coins"])

@router.post("/", response_model=MarketplaceCreditResponse)
def create_coin(
    coin_data: MarketplaceCreditCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create a new carbon coin entry - simplified version"""
    try:
        # Create new marketplace credit directly
        marketplace_credit = MarketplaceCredit(
            issuer_name=coin_data.issuer_name,
            issuer_id=current_user.id,
            coins_issued=coin_data.coins_issued,
            source_type=coin_data.source_type,
            source_project_id=coin_data.source_project_id,
            description=coin_data.description,
            price_per_coin=coin_data.price_per_coin
        )
        
        db.add(marketplace_credit)
        db.commit()
        db.refresh(marketplace_credit)
        
        return marketplace_credit
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[MarketplaceCreditResponse])
def get_all_coins(db: Session = Depends(get_db)):
    """Get all coins from database"""
    coins = db.query(MarketplaceCredit).all()
    return coins

@router.get("/verified", response_model=List[MarketplaceCreditResponse])
def get_verified_coins(db: Session = Depends(get_db)):
    """Get only verified coins"""
    coins = db.query(MarketplaceCredit).filter(
        MarketplaceCredit.verification_status == "verified"
    ).all()
    return coins

@router.get("/forestation", response_model=List[MarketplaceCreditResponse])
def get_forestation_coins(db: Session = Depends(get_db)):
    """Get forestation coins"""
    coins = db.query(MarketplaceCredit).filter(
        MarketplaceCredit.source_type == "forestation"
    ).all()
    return coins

@router.get("/solar", response_model=List[MarketplaceCreditResponse])
def get_solar_coins(db: Session = Depends(get_db)):
    """Get solar panel coins"""
    coins = db.query(MarketplaceCredit).filter(
        MarketplaceCredit.source_type == "solar_panel"
    ).all()
    return coins

@router.get("/issuer/{issuer_id}", response_model=List[MarketplaceCreditResponse])
def get_coins_by_issuer(issuer_id: int, db: Session = Depends(get_db)):
    """Get coins by issuer ID"""
    coins = db.query(MarketplaceCredit).filter(
        MarketplaceCredit.issuer_id == issuer_id
    ).all()
    return coins

@router.get("/stats")
def get_coin_stats(db: Session = Depends(get_db)):
    """Get coin statistics"""
    total_coins = db.query(MarketplaceCredit).count()
    verified_coins = db.query(MarketplaceCredit).filter(
        MarketplaceCredit.verification_status == "verified"
    ).count()
    
    total_coins_issued = db.query(MarketplaceCredit).filter(
        MarketplaceCredit.verification_status == "verified"
    ).with_entities(MarketplaceCredit.coins_issued).all()
    
    total_amount = sum([coin[0] for coin in total_coins_issued]) if total_coins_issued else 0
    
    forestation_coins = db.query(MarketplaceCredit).filter(
        MarketplaceCredit.source_type == "forestation",
        MarketplaceCredit.verification_status == "verified"
    ).count()
    
    solar_coins = db.query(MarketplaceCredit).filter(
        MarketplaceCredit.source_type == "solar_panel",
        MarketplaceCredit.verification_status == "verified"
    ).count()
    
    return {
        "total_coins": total_coins,
        "verified_coins": verified_coins,
        "total_coins_issued": total_amount,
        "forestation_coins": forestation_coins,
        "solar_coins": solar_coins,
        "verification_rate": (verified_coins / total_coins * 100) if total_coins > 0 else 0
    }
