#!/usr/bin/env python3
"""
Simple test script for solar panel coin minting - simplified version
"""

import requests
import json

# API base URL
BASE_URL = "http://localhost:8000/api/v1"

def test_simple_coin_creation():
    """Test simple coin creation via POST /coins/"""
    print("Testing Simple Coin Creation...")
    
    # Test data
    coin_data = {
        "issuer_name": "Simple Test Company",
        "coins_issued": 15.5,
        "source_type": "solar_panel",
        "source_project_id": None,
        "description": "Simple test coin creation",
        "price_per_coin": 25.0
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/coins/",
            json=coin_data
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✓ Simple coin creation successful!")
            print(f"  Coin ID: {result['id']}")
            print(f"  Issuer: {result['issuer_name']}")
            print(f"  Coins Issued: {result['coins_issued']}")
            print(f"  Issue Date: {result['issue_date']}")
            print(f"  Verification Status: {result['verification_status']}")
            return True
        else:
            print(f"✗ Simple coin creation failed: {response.status_code}")
            print(f"  Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"✗ Simple coin creation error: {e}")
        return False

def test_simple_solar_minting():
    """Test simple solar panel coin minting"""
    print("\nTesting Simple Solar Panel Minting...")
    
    # Test data
    minting_data = {
        "latitude": 12.9716,
        "longitude": 77.5946,
        "annual_energy_mwh": 3.2,
        "annual_co2_avoided_tonnes": 1.6,
        "annual_carbon_credits": 1.6,
        "calculation_method": "Simple Calculation",
        "issuer_name": "Simple Solar Company",
        "description": "Simple solar panel test",
        "price_per_coin": 20.0,
        "source_project_id": None
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/solar-panel/mint-carbon-coins",
            data=minting_data
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✓ Simple solar minting successful!")
            print(f"  Marketplace Credit ID: {result['marketplace_credit_id']}")
            print(f"  Coins Issued: {result['coins_issued']}")
            print(f"  Issue Date: {result['issue_date']}")
            print(f"  Verification Status: {result['verification_status']}")
            return True
        else:
            print(f"✗ Simple solar minting failed: {response.status_code}")
            print(f"  Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"✗ Simple solar minting error: {e}")
        return False

def test_get_coins():
    """Test getting all coins"""
    print("\nTesting Get All Coins...")
    
    try:
        response = requests.get(f"{BASE_URL}/coins/")
        
        if response.status_code == 200:
            coins = response.json()
            print(f"✓ Retrieved {len(coins)} coins from database")
            if coins:
                print(f"  Latest coin: ID={coins[-1]['id']}, Issuer={coins[-1]['issuer_name']}, Coins={coins[-1]['coins_issued']}")
            return True
        else:
            print(f"✗ Get coins failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"✗ Get coins error: {e}")
        return False

def main():
    """Run simplified tests"""
    print("=" * 60)
    print("SIMPLIFIED SOLAR PANEL COIN MINTING TEST")
    print("=" * 60)
    
    # Test 1: Simple coin creation
    coin_success = test_simple_coin_creation()
    
    # Test 2: Simple solar minting
    solar_success = test_simple_solar_minting()
    
    # Test 3: Get coins
    get_success = test_get_coins()
    
    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    print(f"Simple Coin Creation: {'✓ PASS' if coin_success else '✗ FAIL'}")
    print(f"Simple Solar Minting: {'✓ PASS' if solar_success else '✗ FAIL'}")
    print(f"Get Coins: {'✓ PASS' if get_success else '✗ FAIL'}")
    
    if all([coin_success, solar_success, get_success]):
        print("\n🎉 All simplified tests passed! Data is being stored in DB correctly.")
    else:
        print("\n⚠️  Some tests failed. Check the output above for details.")

if __name__ == "__main__":
    main()
