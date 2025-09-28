from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum
import uuid

class TransactionType(enum.Enum):
    PURCHASE = "purchase"
    MINT = "mint"
    TRANSFER = "transfer"
    RETIREMENT = "retirement"

class TransactionStatus(enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"

class CreditTransaction(Base):
    __tablename__ = "credit_transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(String, unique=True, index=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(Integer, ForeignKey("users.id"))
    credit_id = Column(Integer, ForeignKey("marketplace_credits.id"), nullable=True)
    retirement_id = Column(Integer, ForeignKey("credit_retirements.id"), nullable=True)
    
    # Transaction details
    credits_amount = Column(Float)  # Credits involved
    coins_amount = Column(Float)    # Coins involved
    
    transaction_type = Column(Enum(TransactionType), default=TransactionType.PURCHASE)
    status = Column(Enum(TransactionStatus), default=TransactionStatus.PENDING)
    
    # Additional details
    description = Column(Text, nullable=True)
    transaction_metadata = Column(Text, nullable=True)  # JSON string for additional data
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Relationships
    user = relationship("User")
    marketplace_credit = relationship("MarketplaceCredit", backref="transactions")
    retirement = relationship("CreditRetirement", backref="transactions")