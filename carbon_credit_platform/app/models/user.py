from sqlalchemy import Column, Integer, String, DateTime, Boolean, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    coins_balance = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    solar_panel_applications = relationship("SolarPanelApplication", back_populates="user")
    forestation_applications = relationship("ForestationApplication", back_populates="user")
    credits = relationship("CarbonCredit", back_populates="owner")
    bounties = relationship("Bounty", back_populates="creator")
    marketplace_credits = relationship("MarketplaceCredit", back_populates="issuer")
    carbon_coin_issues = relationship("CarbonCoinIssue", back_populates="user")
    wallet = relationship("UserWallet", back_populates="user", uselist=False)
    credit_retirements = relationship("CreditRetirement", back_populates="user")
