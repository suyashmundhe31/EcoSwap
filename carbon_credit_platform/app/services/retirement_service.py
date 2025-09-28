from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from typing import List, Dict
from datetime import datetime
import uuid

from app.models.user_wallets import UserWallet
from app.models.credit_retirement import CreditRetirement, RetirementStatus
from app.schemas.retirement_schemas import RetirementRequestSchema, RetirementUpdateSchema, RetirementResponseSchema, DashboardStatsSchema, RetirementHistorySchema, PurchaseHistorySchema

class CreditRetirementService:
    def __init__(self, db: Session):
        self.db = db
    
    def retire_credits(self, retirement_request: RetirementRequestSchema) -> Dict:
        """Retire credits for carbon offset"""
        try:
            # Get user wallet
            wallet = self.db.query(UserWallet).filter(
                UserWallet.user_id == retirement_request.user_id
            ).first()
            
            if not wallet:
                return {
                    'success': False,
                    'error': 'User wallet not found'
                }
            
            # Check if user has enough coins
            if wallet.available_coins < retirement_request.coins_to_retire:
                return {
                    'success': False,
                    'error': f'Insufficient coins. Available: {wallet.available_coins}, Required: {retirement_request.coins_to_retire}'
                }
            
            # Generate retirement ID and certificate number
            retirement_id = str(uuid.uuid4())
            certificate_number = f"ECO-RET-{datetime.now().strftime('%Y%m%d')}-{retirement_id[:8].upper()}"
            
            # Determine initial status based on auto_confirm
            initial_status = RetirementStatus.COMPLETED if retirement_request.auto_confirm else RetirementStatus.PENDING
            
            # Create retirement record
            retirement = CreditRetirement(
                retirement_id=retirement_id,
                user_id=retirement_request.user_id,
                coins_retired=retirement_request.coins_to_retire,
                co2_offset_tons=retirement_request.coins_to_retire,  # 1 coin = 1 ton CO2
                retirement_status=initial_status,
                retirement_reason=retirement_request.retirement_reason or "Carbon Offset",
                certificate_number=certificate_number if retirement_request.auto_confirm else None,
                certificate_issued=retirement_request.auto_confirm,
                completed_at=datetime.utcnow() if retirement_request.auto_confirm else None
            )
            self.db.add(retirement)
            
            # Only deduct coins if auto-confirmed
            if retirement_request.auto_confirm:
                wallet.available_coins -= retirement_request.coins_to_retire
                wallet.updated_at = datetime.utcnow()
            
            # Commit changes
            self.db.commit()
            self.db.refresh(retirement)
            
            status_message = "completed" if retirement_request.auto_confirm else "pending confirmation"
            
            return {
                'success': True,
                'retirement_id': retirement_id,
                'coins_retired': retirement_request.coins_to_retire,
                'co2_offset_tons': retirement_request.coins_to_retire,
                'certificate_number': certificate_number if retirement_request.auto_confirm else None,
                'remaining_user_coins': wallet.available_coins,
                'status': initial_status.value,
                'message': f'Retirement request {status_message}. {retirement_request.coins_to_retire} coins will offset {retirement_request.coins_to_retire} tons of CO2'
            }
            
        except Exception as e:
            self.db.rollback()
            return {
                'success': False,
                'error': f'Retirement transaction failed: {str(e)}'
            }
    
    def get_user_retirement_summary(self, user_id: int) -> DashboardStatsSchema:
        """Get summary of user's retirement activities"""
        # Get total retired coins
        total_retired = self.db.query(func.sum(CreditRetirement.coins_retired)).filter(
            CreditRetirement.user_id == user_id,
            CreditRetirement.retirement_status == RetirementStatus.COMPLETED
        ).scalar() or 0.0
        
        # Get retirement count
        retirement_count = self.db.query(func.count(CreditRetirement.id)).filter(
            CreditRetirement.user_id == user_id,
            CreditRetirement.retirement_status == RetirementStatus.COMPLETED
        ).scalar() or 0
        
        # Get user wallet
        wallet = self.db.query(UserWallet).filter(UserWallet.user_id == user_id).first()
        remaining_coins = wallet.available_coins if wallet else 0.0
        
        # Calculate net zero progress (assuming company needs to offset all their coins)
        total_coins = wallet.total_coins if wallet else 0.0
        progress_percentage = (total_retired / total_coins * 100) if total_coins > 0 else 0.0
        
        # Get last retirement date
        last_retirement = self.db.query(CreditRetirement).filter(
            CreditRetirement.user_id == user_id,
            CreditRetirement.retirement_status == RetirementStatus.COMPLETED
        ).order_by(CreditRetirement.retirement_date.desc()).first()
        
        # Get pending retirements count
        pending_count = self.db.query(func.count(CreditRetirement.id)).filter(
            CreditRetirement.user_id == user_id,
            CreditRetirement.retirement_status == RetirementStatus.PENDING
        ).scalar() or 0
        
        return DashboardStatsSchema(
            total_retired=total_retired,
            available_for_retirement=remaining_coins,
            total_credits=total_coins,
            co2_offset_tons=total_retired,  # 1:1 ratio
            progress_percentage=min(progress_percentage, 100.0),
            pending_retirements=pending_count,
            completed_retirements=retirement_count
        )
    
    def get_retirement_history(self, user_id: int, limit: int = 50) -> List[RetirementHistorySchema]:
        """Get user's retirement history"""
        retirements = self.db.query(CreditRetirement).filter(
            CreditRetirement.user_id == user_id
        ).order_by(CreditRetirement.retirement_date.desc()).limit(limit).all()
        
        return [
            RetirementHistorySchema(
                id=retirement.id,
                retirement_id=retirement.retirement_id,
                coins_retired=retirement.coins_retired,
                co2_offset_tons=retirement.co2_offset_tons,
                retirement_date=retirement.retirement_date,
                retirement_status=retirement.retirement_status.value,
                certificate_number=retirement.certificate_number,
                retirement_reason=retirement.retirement_reason,
                completed_at=retirement.completed_at
            )
            for retirement in retirements
        ]
    
    def get_dashboard_stats(self, user_id: int) -> Dict:
        """Get retirement stats for dashboard"""
        summary = self.get_user_retirement_summary(user_id)
        
        return {
            'total_retired': summary.total_coins_retired,
            'available_for_retirement': summary.remaining_coins,
            'co2_offset_tons': summary.total_co2_offset_tons,
            'progress_percentage': summary.net_zero_progress_percentage,
            'certificates_issued': summary.total_retirements
        }
    
    def update_retirement_request(self, retirement_id: str, user_id: int, update_request: RetirementUpdateSchema) -> Dict:
        """Update a pending retirement request"""
        try:
            # Get the retirement record
            retirement = self.db.query(CreditRetirement).filter(
                CreditRetirement.retirement_id == retirement_id,
                CreditRetirement.user_id == user_id,
                CreditRetirement.retirement_status == RetirementStatus.PENDING
            ).first()
            
            if not retirement:
                return {
                    'success': False,
                    'error': 'Retirement request not found or already processed'
                }
            
            # Get user wallet for validation
            wallet = self.db.query(UserWallet).filter(UserWallet.user_id == user_id).first()
            if not wallet:
                return {
                    'success': False,
                    'error': 'User wallet not found'
                }
            
            # Validate new coin amount if provided
            if update_request.coins_to_retire is not None:
                if wallet.available_coins < update_request.coins_to_retire:
                    return {
                        'success': False,
                        'error': f'Insufficient coins. Available: {wallet.available_coins}, Required: {update_request.coins_to_retire}'
                    }
                
                # Update the retirement record
                retirement.coins_retired = update_request.coins_to_retire
                retirement.co2_offset_tons = update_request.coins_to_retire
                retirement.updated_at = datetime.utcnow()
            
            # Update reason if provided
            if update_request.retirement_reason is not None:
                retirement.retirement_reason = update_request.retirement_reason
            
            self.db.commit()
            self.db.refresh(retirement)
            
            return {
                'success': True,
                'retirement_id': retirement_id,
                'coins_retired': retirement.coins_retired,
                'co2_offset_tons': retirement.co2_offset_tons,
                'retirement_reason': retirement.retirement_reason,
                'message': 'Retirement request updated successfully'
            }
            
        except Exception as e:
            self.db.rollback()
            return {
                'success': False,
                'error': f'Update failed: {str(e)}'
            }
    
    def confirm_retirement(self, retirement_id: str, user_id: int) -> Dict:
        """Confirm a pending retirement request"""
        try:
            # Get the retirement record
            retirement = self.db.query(CreditRetirement).filter(
                CreditRetirement.retirement_id == retirement_id,
                CreditRetirement.user_id == user_id,
                CreditRetirement.retirement_status == RetirementStatus.PENDING
            ).first()
            
            if not retirement:
                return {
                    'success': False,
                    'error': 'Retirement request not found or already processed'
                }
            
            # Get user wallet
            wallet = self.db.query(UserWallet).filter(UserWallet.user_id == user_id).first()
            if not wallet:
                return {
                    'success': False,
                    'error': 'User wallet not found'
                }
            
            # Check if user still has enough coins
            if wallet.available_coins < retirement.coins_retired:
                return {
                    'success': False,
                    'error': f'Insufficient coins. Available: {wallet.available_coins}, Required: {retirement.coins_retired}'
                }
            
            # Generate certificate number
            certificate_number = f"ECO-RET-{datetime.now().strftime('%Y%m%d')}-{retirement_id[:8].upper()}"
            
            # Update retirement record
            retirement.retirement_status = RetirementStatus.COMPLETED
            retirement.certificate_number = certificate_number
            retirement.certificate_issued = True
            retirement.completed_at = datetime.utcnow()
            retirement.updated_at = datetime.utcnow()
            
            # Deduct coins from wallet
            wallet.available_coins -= retirement.coins_retired
            wallet.updated_at = datetime.utcnow()
            
            self.db.commit()
            self.db.refresh(retirement)
            
            return {
                'success': True,
                'retirement_id': retirement_id,
                'coins_retired': retirement.coins_retired,
                'co2_offset_tons': retirement.co2_offset_tons,
                'certificate_number': certificate_number,
                'remaining_user_coins': wallet.available_coins,
                'message': f'Retirement confirmed! {retirement.coins_retired} coins retired, offsetting {retirement.co2_offset_tons} tons of CO2'
            }
            
        except Exception as e:
            self.db.rollback()
            return {
                'success': False,
                'error': f'Confirmation failed: {str(e)}'
            }
    
    def cancel_retirement(self, retirement_id: str, user_id: int) -> Dict:
        """Cancel a pending retirement request"""
        try:
            # Get the retirement record
            retirement = self.db.query(CreditRetirement).filter(
                CreditRetirement.retirement_id == retirement_id,
                CreditRetirement.user_id == user_id,
                CreditRetirement.retirement_status == RetirementStatus.PENDING
            ).first()
            
            if not retirement:
                return {
                    'success': False,
                    'error': 'Retirement request not found or already processed'
                }
            
            # Update status to failed (cancelled)
            retirement.retirement_status = RetirementStatus.FAILED
            retirement.updated_at = datetime.utcnow()
            
            self.db.commit()
            
            return {
                'success': True,
                'retirement_id': retirement_id,
                'message': 'Retirement request cancelled successfully'
            }
            
        except Exception as e:
            self.db.rollback()
            return {
                'success': False,
                'error': f'Cancellation failed: {str(e)}'
            }
    
    def get_pending_retirements(self, user_id: int) -> List[RetirementHistorySchema]:
        """Get user's pending retirement requests"""
        retirements = self.db.query(CreditRetirement).filter(
            CreditRetirement.user_id == user_id,
            CreditRetirement.retirement_status == RetirementStatus.PENDING
        ).order_by(CreditRetirement.retirement_date.desc()).all()
        
        return [
            RetirementHistorySchema(
                id=retirement.id,
                retirement_id=retirement.retirement_id,
                coins_retired=retirement.coins_retired,
                co2_offset_tons=retirement.co2_offset_tons,
                retirement_date=retirement.retirement_date,
                retirement_status=retirement.retirement_status.value,
                certificate_number=retirement.certificate_number,
                retirement_reason=retirement.retirement_reason,
                completed_at=retirement.completed_at
            )
            for retirement in retirements
        ]