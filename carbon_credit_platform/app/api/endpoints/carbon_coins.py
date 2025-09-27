from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.api.deps import get_current_user
from app.services.carbon_coin_service import CarbonCoinService
from app.schemas.carbon_coins import (
    CarbonCoinIssueResponse,
    CarbonCoinIssueList,
    CarbonCoinStats,
    CarbonCoinMintRequest,
    CarbonCoinMintResponse,
    CoinSourceEnum
)

router = APIRouter(prefix="/carbon-coins", tags=["carbon-coins"])

@router.get("/", response_model=CarbonCoinIssueList)
async def get_user_carbon_coins(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=1000),
    source: Optional[str] = Query(None, description="Filter by source: solar_panel or forestation"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get all carbon coin issues for the current user"""
    try:
        service = CarbonCoinService(db)
        
        # Get carbon coin issues
        issues = service.get_user_carbon_coins(
            user_id=current_user.id,
            skip=skip,
            limit=limit,
            source_filter=source
        )
        
        # Get total count for pagination
        total_query = service.db.query(service.db.query(
            service.db.query(CarbonCoinIssue).filter(
                CarbonCoinIssue.user_id == current_user.id
            )
        ).count())
        
        # Apply source filter to total count if provided
        if source:
            if source.lower() == 'solar_panel':
                total = service.db.query(CarbonCoinIssue).filter(
                    CarbonCoinIssue.user_id == current_user.id,
                    CarbonCoinIssue.source == CoinSource.SOLAR_PANEL
                ).count()
            elif source.lower() == 'forestation':
                total = service.db.query(CarbonCoinIssue).filter(
                    CarbonCoinIssue.user_id == current_user.id,
                    CarbonCoinIssue.source == CoinSource.FORESTATION
                ).count()
            else:
                total = service.db.query(CarbonCoinIssue).filter(
                    CarbonCoinIssue.user_id == current_user.id
                ).count()
        else:
            total = service.db.query(CarbonCoinIssue).filter(
                CarbonCoinIssue.user_id == current_user.id
            ).count()
        
        return CarbonCoinIssueList(
            issues=issues,
            total=total,
            page=skip // limit + 1,
            size=limit
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving carbon coins: {str(e)}")

@router.get("/stats", response_model=CarbonCoinStats)
async def get_carbon_coin_stats(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get carbon coin statistics for the current user"""
    try:
        service = CarbonCoinService(db)
        stats = service.get_carbon_coin_stats(current_user.id)
        return stats
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving stats: {str(e)}")

@router.get("/{issue_id}", response_model=CarbonCoinIssueResponse)
async def get_carbon_coin_issue(
    issue_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get a specific carbon coin issue by ID"""
    try:
        service = CarbonCoinService(db)
        issue = service.get_carbon_coin_by_id(issue_id, current_user.id)
        
        if not issue:
            raise HTTPException(status_code=404, detail="Carbon coin issue not found")
        
        return issue
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving carbon coin issue: {str(e)}")

@router.post("/mint", response_model=CarbonCoinMintResponse)
async def mint_carbon_coins(
    mint_request: CarbonCoinMintRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Mint carbon coins (internal endpoint for solar/forestation services)"""
    try:
        service = CarbonCoinService(db)
        
        # Import the enum from the model
        from app.models.carbon_coins import CoinSource
        
        # Convert string to enum
        source_enum = CoinSource.SOLAR_PANEL if mint_request.source == CoinSourceEnum.SOLAR_PANEL else CoinSource.FORESTATION
        
        result = service.mint_carbon_coins(
            user_id=current_user.id,
            coins_issued=mint_request.coins_issued,
            source=source_enum,
            source_application_id=mint_request.source_application_id,
            description=mint_request.description,
            calculation_method=mint_request.calculation_method
        )
        
        return CarbonCoinMintResponse(**result)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error minting carbon coins: {str(e)}")

# Admin endpoints
@router.get("/admin/all", response_model=CarbonCoinIssueList)
async def get_all_carbon_coins_admin(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=1000),
    source: Optional[str] = Query(None, description="Filter by source: solar_panel or forestation"),
    db: Session = Depends(get_db)
    # TODO: Add admin authentication dependency
):
    """Get all carbon coin issues (admin only)"""
    try:
        service = CarbonCoinService(db)
        
        # Get all carbon coin issues
        issues = service.get_all_carbon_coins(
            skip=skip,
            limit=limit,
            source_filter=source
        )
        
        # Get total count
        from app.models.carbon_coins import CarbonCoinIssue, CoinSource
        
        query = service.db.query(CarbonCoinIssue)
        if source:
            if source.lower() == 'solar_panel':
                query = query.filter(CarbonCoinIssue.source == CoinSource.SOLAR_PANEL)
            elif source.lower() == 'forestation':
                query = query.filter(CarbonCoinIssue.source == CoinSource.FORESTATION)
        
        total = query.count()
        
        return CarbonCoinIssueList(
            issues=issues,
            total=total,
            page=skip // limit + 1,
            size=limit
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving carbon coins: {str(e)}")

@router.get("/health")
async def carbon_coins_health_check():
    """Health check for carbon coins module"""
    return {
        "module": "carbon_coins",
        "status": "healthy",
        "description": "Carbon coin issuance and tracking system",
        "endpoints": [
            "GET / - Get user carbon coins",
            "GET /stats - Get user carbon coin statistics", 
            "GET /{issue_id} - Get specific carbon coin issue",
            "POST /mint - Mint new carbon coins",
            "GET /admin/all - Get all carbon coins (admin)"
        ],
        "features": [
            "Track carbon coin issuance from solar and forestation projects",
            "Store issuer details and company information",
            "Provide statistics and filtering by source",
            "Support pagination and detailed tracking"
        ]
    }