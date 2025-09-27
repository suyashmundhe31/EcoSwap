#!/usr/bin/env python3
"""
Test script for Marketplace API endpoints
This script demonstrates how to use the marketplace API endpoints
"""

import requests
import json
from datetime import datetime

# Base URL for the API
BASE_URL = "http://localhost:8000/api/v1/marketplace"

def test_marketplace_endpoints():
    """Test the marketplace API endpoints"""
    
    print("🌱 Testing Marketplace API Endpoints")
    print("=" * 50)
    
    # Test data for creating marketplace credits
    test_credits = [
        {
            "issuer_name": "Green Forest Co.",
            "issuer_id": 1,
            "coins_issued": 150.5,
            "source_type": "forestation",
            "source_project_id": 1,
            "description": "Reforestation project in Amazon",
            "price_per_coin": 25.0
        },
        {
            "issuer_name": "Solar Energy Ltd.",
            "issuer_id": 2,
            "coins_issued": 200.0,
            "source_type": "solar_panel",
            "source_project_id": 2,
            "description": "Solar panel installation project",
            "price_per_coin": 30.0
        },
        {
            "issuer_name": "Eco Solutions Inc.",
            "issuer_id": 3,
            "coins_issued": 75.25,
            "source_type": "forestation",
            "source_project_id": 3,
            "description": "Urban tree planting initiative",
            "price_per_coin": 20.0
        }
    ]
    
    print("\n1. Creating marketplace credits...")
    created_credits = []
    
    for i, credit_data in enumerate(test_credits, 1):
        try:
            response = requests.post(f"{BASE_URL}/credits", json=credit_data)
            if response.status_code == 200:
                credit = response.json()
                created_credits.append(credit)
                print(f"✅ Credit {i} created: ID {credit['id']} - {credit['issuer_name']}")
            else:
                print(f"❌ Failed to create credit {i}: {response.text}")
        except requests.exceptions.ConnectionError:
            print("❌ Could not connect to API server. Make sure the server is running.")
            return
    
    print(f"\n2. Created {len(created_credits)} marketplace credits")
    
    # Test getting all credits
    print("\n3. Fetching all marketplace credits...")
    try:
        response = requests.get(f"{BASE_URL}/credits")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Retrieved {data['total']} credits (page {data['page']} of {data['size']} per page)")
            for credit in data['credits']:
                print(f"   - {credit['issuer_name']}: {credit['coins_issued']} coins ({credit['source_type']})")
        else:
            print(f"❌ Failed to fetch credits: {response.text}")
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to API server")
    
    # Test filtering by source type
    print("\n4. Testing source type filtering...")
    for source_type in ["forestation", "solar_panel"]:
        try:
            response = requests.get(f"{BASE_URL}/by-source/{source_type}")
            if response.status_code == 200:
                credits = response.json()
                print(f"✅ {source_type.title()} credits: {len(credits)} found")
            else:
                print(f"❌ Failed to fetch {source_type} credits: {response.text}")
        except requests.exceptions.ConnectionError:
            print("❌ Could not connect to API server")
    
    # Test marketplace summary
    print("\n5. Getting marketplace summary...")
    try:
        response = requests.get(f"{BASE_URL}/summary")
        if response.status_code == 200:
            summary = response.json()
            print("✅ Marketplace Summary:")
            print(f"   - Total verified credits: {summary['total_verified_credits']}")
            print(f"   - Total coins issued: {summary['total_coins_issued']}")
            print(f"   - Forestation coins: {summary['forestation_coins']}")
            print(f"   - Solar panel coins: {summary['solar_panel_coins']}")
            print(f"   - Unique issuers: {summary['unique_issuers']}")
            print(f"   - Average coins per credit: {summary['average_coins_per_credit']:.2f}")
        else:
            print(f"❌ Failed to get summary: {response.text}")
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to API server")
    
    # Test verification update
    if created_credits:
        print("\n6. Testing verification update...")
        credit_id = created_credits[0]['id']
        try:
            update_data = {
                "verification_status": "verified"
            }
            response = requests.put(f"{BASE_URL}/credits/{credit_id}", json=update_data)
            if response.status_code == 200:
                updated_credit = response.json()
                print(f"✅ Credit {credit_id} verified: {updated_credit['verification_status']}")
            else:
                print(f"❌ Failed to verify credit: {response.text}")
        except requests.exceptions.ConnectionError:
            print("❌ Could not connect to API server")
    
    print("\n" + "=" * 50)
    print("🎉 Marketplace API testing completed!")
    print("\nAvailable endpoints:")
    print("• POST   /api/v1/marketplace/credits - Create new credit")
    print("• GET    /api/v1/marketplace/credits - List credits (with filters)")
    print("• GET    /api/v1/marketplace/credits/{id} - Get specific credit")
    print("• PUT    /api/v1/marketplace/credits/{id} - Update credit")
    print("• DELETE /api/v1/marketplace/credits/{id} - Delete credit")
    print("• GET    /api/v1/marketplace/verified - Get verified credits")
    print("• GET    /api/v1/marketplace/by-source/{type} - Get credits by source")
    print("• GET    /api/v1/marketplace/issuer/{id}/stats - Get issuer stats")
    print("• GET    /api/v1/marketplace/summary - Get marketplace summary")

if __name__ == "__main__":
    test_marketplace_endpoints()
