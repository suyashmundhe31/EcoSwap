from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Enum, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base
import enum
import uuid
from datetime import datetime

class RetirementStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class TransactionType(str, enum.Enum):
    PURCHASE = "purchase"
    MINT = "mint"
    TRANSFER = "transfer"
    RETIREMENT = "retirement"

class TransactionStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"

class CreditRetirement(Base):
    __tablename__ = "credit_retirements"
    
    id = Column(Integer, primary_key=True, index=True)
    retirement_id = Column(String, unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    
    # User information
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Retirement details
    coins_retired = Column(Float, nullable=False)
    co2_offset_tons = Column(Float, nullable=False)  # 1 coin = 1 ton CO2
    
    # Status and tracking
    retirement_status = Column(Enum(RetirementStatus), default=RetirementStatus.PENDING)
    retirement_reason = Column(String, nullable=True, default="Net Zero Goal")
    
    # Certificate information
    certificate_number = Column(String, unique=True, nullable=True)
    certificate_issued = Column(Boolean, default=False)
    
    # Timestamps
    retirement_date = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="credit_retirements")

# CreditTransaction is defined in credit_transaction.py to avoid duplication