from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base
import enum

class SourceType(str, enum.Enum):
    FORESTATION = "forestation"
    SOLAR_PANEL = "solar_panel"

class VerificationStatus(str, enum.Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"

class MarketplaceCredit(Base):
    __tablename__ = "marketplace_credits"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Issuer information
    issuer_name = Column(String, nullable=False)
    issuer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Credit details
    coins_issued = Column(Float, nullable=False)
    issue_date = Column(DateTime(timezone=True), server_default=func.now())
    
    # Verification status
    verification_status = Column(Enum(VerificationStatus), default=VerificationStatus.PENDING)
    verified_at = Column(DateTime(timezone=True), nullable=True)
    
    # Source information
    source_type = Column(Enum(SourceType), nullable=False)
    source_project_id = Column(Integer, nullable=True)  # Reference to forestation or solar panel application
    
    # Additional metadata
    description = Column(String, nullable=True)
    price_per_coin = Column(Float, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    issuer = relationship("User", back_populates="marketplace_credits")
