from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional, Dict
from datetime import datetime

from app.models.carbon_coins import CarbonCoinIssue, CoinSource
from app.models.solar_panel import SolarPanelApplication
from app.models.forestation import ForestationApplication
from app.models.user import User

class CarbonCoinService:
    def __init__(self, db: Session):
        self.db = db
    
    def mint_carbon_coins(
        self,
        user_id: int,
        coins_issued: float,
        source: CoinSource,
        source_application_id: int,
        description: str = None,
        calculation_method: str = None
    ) -> Dict:
        """Mint carbon coins and store in database"""
        try:
            # Get user information
            user = self.db.query(User).filter(User.id == user_id).first()
            if not user:
                return {'success': False, 'error': 'User not found'}
            
            # Get source application details based on source type
            full_name = ""
            company_name = None
            
            if source == CoinSource.SOLAR_PANEL:
                application = self.db.query(SolarPanelApplication).filter(
                    SolarPanelApplication.id == source_application_id,
                    SolarPanelApplication.user_id == user_id
                ).first()
                if application:
                    full_name = application.full_name
                    company_name = application.company_name
            
            elif source == CoinSource.FORESTATION:
                application = self.db.query(ForestationApplication).filter(
                    ForestationApplication.id == source_application_id,
                    ForestationApplication.user_id == user_id
                ).first()
                if application:
                    full_name = application.full_name
                    # Forestation doesn't have company_name, so it stays None
            
            if not full_name:
                return {'success': False, 'error': 'Source application not found'}
            
            # Create carbon coin issue record
            coin_issue = CarbonCoinIssue(
                user_id=user_id,
                full_name=full_name,
                company_name=company_name,
                coins_issued=coins_issued,
                source=source,
                source_application_id=source_application_id,
                description=description,
                calculation_method=calculation_method
            )
            
            self.db.add(coin_issue)
            self.db.commit()
            self.db.refresh(coin_issue)
            
            return {
                'success': True,
                'issue_id': coin_issue.issue_id,
                'coins_issued': coin_issue.coins_issued,
                'source': coin_issue.source.value,
                'issue_date': coin_issue.issue_date.isoformat(),
                'message': f'Successfully minted {coins_issued} carbon coins!'
            }
            
        except Exception as e:
            self.db.rollback()
            return {'success': False, 'error': str(e)}
    
    def get_user_carbon_coins(
        self, 
        user_id: int, 
        skip: int = 0, 
        limit: int = 100,
        source_filter: Optional[str] = None
    ) -> List[CarbonCoinIssue]:
        """Get all carbon coin issues for a user"""
        query = self.db.query(CarbonCoinIssue).filter(
            CarbonCoinIssue.user_id == user_id
        )
        
        # Apply source filter if provided
        if source_filter:
            if source_filter.lower() == 'solar_panel':
                query = query.filter(CarbonCoinIssue.source == CoinSource.SOLAR_PANEL)
            elif source_filter.lower() == 'forestation':
                query = query.filter(CarbonCoinIssue.source == CoinSource.FORESTATION)
        
        return query.order_by(desc(CarbonCoinIssue.issue_date)).offset(skip).limit(limit).all()
    
    def get_all_carbon_coins(
        self, 
        skip: int = 0, 
        limit: int = 100,
        source_filter: Optional[str] = None
    ) -> List[CarbonCoinIssue]:
        """Get all carbon coin issues (admin function)"""
        query = self.db.query(CarbonCoinIssue)
        
        # Apply source filter if provided
        if source_filter:
            if source_filter.lower() == 'solar_panel':
                query = query.filter(CarbonCoinIssue.source == CoinSource.SOLAR_PANEL)
            elif source_filter.lower() == 'forestation':
                query = query.filter(CarbonCoinIssue.source == CoinSource.FORESTATION)
        
        return query.order_by(desc(CarbonCoinIssue.issue_date)).offset(skip).limit(limit).all()
    
    def get_carbon_coin_stats(self, user_id: int) -> Dict:
        """Get carbon coin statistics for a user"""
        # Total coins issued
        total_coins = self.db.query(CarbonCoinIssue).filter(
            CarbonCoinIssue.user_id == user_id
        ).with_entities(
            self.db.func.sum(CarbonCoinIssue.coins_issued)
        ).scalar() or 0
        
        # Coins by source
        solar_coins = self.db.query(CarbonCoinIssue).filter(
            CarbonCoinIssue.user_id == user_id,
            CarbonCoinIssue.source == CoinSource.SOLAR_PANEL
        ).with_entities(
            self.db.func.sum(CarbonCoinIssue.coins_issued)
        ).scalar() or 0
        
        forestation_coins = self.db.query(CarbonCoinIssue).filter(
            CarbonCoinIssue.user_id == user_id,
            CarbonCoinIssue.source == CoinSource.FORESTATION
        ).with_entities(
            self.db.func.sum(CarbonCoinIssue.coins_issued)
        ).scalar() or 0
        
        # Total issues count
        total_issues = self.db.query(CarbonCoinIssue).filter(
            CarbonCoinIssue.user_id == user_id
        ).count()
        
        return {
            'total_coins_issued': float(total_coins),
            'solar_panel_coins': float(solar_coins),
            'forestation_coins': float(forestation_coins),
            'total_issues': total_issues,
            'last_updated': datetime.now().isoformat()
        }
    
    def get_carbon_coin_by_id(self, issue_id: int, user_id: int) -> Optional[CarbonCoinIssue]:
        """Get a specific carbon coin issue by ID"""
        return self.db.query(CarbonCoinIssue).filter(
            CarbonCoinIssue.issue_id == issue_id,
            CarbonCoinIssue.user_id == user_id
        ).first()