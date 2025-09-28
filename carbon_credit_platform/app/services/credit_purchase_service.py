from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Dict
from datetime import datetime
import uuid

from app.models.user_wallets import UserWallet
from app.models.marketplace import MarketplaceCredit
from app.models.credit_transaction import CreditTransaction
from app.schemas.credit_purchase import CreditPurchaseRequest

class CreditPurchaseService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_user_wallet(self, user_id: int) -> Dict:
        """Get or create user wallet with default 2500 coins"""
        wallet = self.db.query(UserWallet).filter(UserWallet.user_id == user_id).first()
        
        if not wallet:
            # Create new wallet with default 2500 coins for MVP
            wallet = UserWallet(
                user_id=user_id,
                total_coins=2500.0,
                available_coins=2500.0
            )
            self.db.add(wallet)
            self.db.commit()
            self.db.refresh(wallet)
        
        return {
            'user_id': wallet.user_id,
            'total_coins': wallet.total_coins,
            'available_coins': wallet.available_coins,
            'last_updated': wallet.updated_at
        }
    
    def get_available_marketplace_credits(self) -> List[Dict]:
        """Get all marketplace credits with coins_issued > 0"""
        credits = self.db.query(MarketplaceCredit).filter(
            MarketplaceCredit.coins_issued > 0
        ).all()
        
        result = []
        for credit in credits:
            result.append({
                'id': credit.id,
                'name': credit.issuer_name,
                'description': credit.description,
                'credits': credit.coins_issued,  # Using coins_issued as available credits
                'coins': credit.coins_issued,    # Same value for coins
                'source': credit.source_type.value.lower(),
                'image': None,  # Not available in new model
                'location': f"Project ID: {credit.source_project_id}",
                'tokenized_date': credit.issue_date.isoformat() if credit.issue_date else None
            })
        
        return result
    
    def get_all_marketplace_credits(self) -> List[Dict]:
        """Get all marketplace credits (including those with 0 credits)"""
        credits = self.db.query(MarketplaceCredit).all()
        
        result = []
        for credit in credits:
            result.append({
                'id': credit.id,
                'name': credit.issuer_name,
                'description': credit.description,
                'credits': credit.coins_issued,  # Using coins_issued as available credits
                'coins': credit.coins_issued,    # Same value for coins
                'source': credit.source_type.value.lower(),
                'image': None,  # Not available in new model
                'location': f"Project ID: {credit.source_project_id}",
                'tokenized_date': credit.issue_date.isoformat() if credit.issue_date else None
            })
        
        return result
    
    def purchase_credits(self, purchase_request: CreditPurchaseRequest) -> Dict:
        """Purchase credits and update wallet and marketplace"""
        try:
            # Get user wallet
            wallet = self.db.query(UserWallet).filter(
                UserWallet.user_id == purchase_request.user_id
            ).first()
            
            if not wallet:
                wallet = UserWallet(
                    user_id=purchase_request.user_id,
                    total_coins=2500.0,
                    available_coins=2500.0
                )
                self.db.add(wallet)
                self.db.commit()
                self.db.refresh(wallet)
            
            # Check if user has enough coins
            if wallet.available_coins < purchase_request.coin_cost:
                return {
                    'success': False,
                    'error': f'Insufficient coins. Available: {wallet.available_coins}, Required: {purchase_request.coin_cost}'
                }
            
            # Get marketplace credit
            marketplace_credit = self.db.query(MarketplaceCredit).filter(
                MarketplaceCredit.id == purchase_request.credit_id
            ).first()
            
            if not marketplace_credit:
                return {
                    'success': False,
                    'error': 'Marketplace credit not found'
                }
            
            # Check if enough credits available
            if marketplace_credit.coins_issued < purchase_request.credits_to_purchase:
                return {
                    'success': False,
                    'error': f'Insufficient credits. Available: {marketplace_credit.coins_issued}, Requested: {purchase_request.credits_to_purchase}'
                }
            
            # Create transaction record
            transaction = CreditTransaction(
                transaction_id=str(uuid.uuid4()),
                user_id=purchase_request.user_id,
                credit_id=purchase_request.credit_id,
                credits_purchased=purchase_request.credits_to_purchase,
                coins_spent=purchase_request.coin_cost,
                transaction_type='PURCHASE',
                status='COMPLETED'
            )
            self.db.add(transaction)
            
            # Update user wallet (deduct coins)
            wallet.available_coins -= purchase_request.coin_cost
            wallet.total_coins -= purchase_request.coin_cost
            wallet.updated_at = datetime.utcnow()
            
            # Update marketplace credit (reduce available credits)
            marketplace_credit.coins_issued -= purchase_request.credits_to_purchase
            
            # Commit all changes
            self.db.commit()
            
            return {
                'success': True,
                'transaction_id': transaction.id,
                'credits_purchased': purchase_request.credits_to_purchase,
                'coins_spent': purchase_request.coin_cost,
                'remaining_user_coins': wallet.available_coins,
                'remaining_credits_in_marketplace': marketplace_credit.coins_issued,
                'message': f'Successfully purchased {purchase_request.credits_to_purchase} credits for {purchase_request.coin_cost} coins'
            }
            
        except Exception as e:
            self.db.rollback()
            return {
                'success': False,
                'error': f'Purchase transaction failed: {str(e)}'
            }