from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.database import Base

class CoinSource(enum.Enum):
    SOLAR_PANEL = "solar_panel"
    FORESTATION = "forestation"

class CarbonCoinIssue(Base):
    __tablename__ = "carbon_coin_issues"
    
    # Primary key
    issue_id = Column(Integer, primary_key=True, index=True)
    
    # User information
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    full_name = Column(String, nullable=False)
    company_name = Column(String, nullable=True)  # Optional company name
    
    # Coin details
    coins_issued = Column(Float, nullable=False)
    source = Column(Enum(CoinSource), nullable=False)  # SOLAR_PANEL or FORESTATION
    
    # Reference to source application
    source_application_id = Column(Integer, nullable=False)  # ID of solar/forestation application
    
    # Additional metadata
    description = Column(String, nullable=True)
    calculation_method = Column(String, nullable=True)
    
    # Timestamps
    issue_date = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="carbon_coin_issues")
