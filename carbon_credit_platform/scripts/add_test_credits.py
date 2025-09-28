import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database import SessionLocal
# Import all models to ensure relationships are properly set up
from app.models.user import User
from app.models.carbon_coins import CarbonCoinIssue
from app.models.marketplace import MarketplaceCredit
from datetime import datetime

def add_test_credits():
    db: Session = SessionLocal()
    
    try:
        # Test solar credits
        solar_credits = [
            {
                'issuer_name': 'Solar Plant Project Alpha',
                'issuer_id': 1,
                'coins_issued': 150.5,
                'source_type': 'SOLAR_PANEL',
                'source_project_id': 1,
                'description': 'Clean energy generation facility in Rajasthan producing 500kW annually',
                'price_per_coin': 15.0
            },
            {
                'issuer_name': 'Community Solar Grid',
                'issuer_id': 1,
                'coins_issued': 200.0,
                'source_type': 'SOLAR_PANEL',
                'source_project_id': 2,
                'description': 'Distributed solar energy network for rural communities in Gujarat',
                'price_per_coin': 12.0
            },
            {
                'issuer_name': 'Rooftop Solar Initiative',
                'issuer_id': 1,
                'coins_issued': 75.3,
                'source_type': 'SOLAR_PANEL',
                'source_project_id': 3,
                'description': 'Residential solar installation program in urban areas',
                'price_per_coin': 18.0
            }
        ]
        
        # Test forestry credits
        forestry_credits = [
            {
                'issuer_name': 'Forest Conservation Initiative',
                'issuer_id': 1,
                'coins_issued': 89.2,
                'source_type': 'FORESTATION',
                'source_project_id': 1,
                'description': 'Reforestation project in Western Ghats protecting biodiversity',
                'price_per_coin': 20.0
            },
            {
                'issuer_name': 'Mangrove Restoration Project',
                'issuer_id': 1,
                'coins_issued': 120.7,
                'source_type': 'FORESTATION',
                'source_project_id': 2,
                'description': 'Coastal mangrove restoration for carbon sequestration',
                'price_per_coin': 22.0
            },
            {
                'issuer_name': 'Urban Afforestation Drive',
                'issuer_id': 1,
                'coins_issued': 65.4,
                'source_type': 'FORESTATION',
                'source_project_id': 3,
                'description': 'City-wide tree plantation and urban forest development',
                'price_per_coin': 16.0
            }
        ]
        
        # Add all credits to database
        all_credits = solar_credits + forestry_credits
        
        for credit_data in all_credits:
            credit = MarketplaceCredit(**credit_data)
            db.add(credit)
        
        db.commit()
        print(f"Successfully added {len(all_credits)} test credits to marketplace")
        
        # Print summary
        print("\nAdded Credits:")
        for credit_data in all_credits:
            print(f"- {credit_data['issuer_name']}: {credit_data['coins_issued']} coins ({credit_data['source_type']})")
        
    except Exception as e:
        db.rollback()
        print(f"Error adding test credits: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    add_test_credits()
