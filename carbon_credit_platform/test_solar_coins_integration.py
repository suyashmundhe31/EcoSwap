#!/usr/bin/env python3
"""
Test script for solar panel coin minting integration
"""

import requests
import json
from datetime import datetime

# API base URL
BASE_URL = "http://localhost:8000/api/v1"

def test_coins_api():
    """Test the coins API endpoints"""
    print("Testing Coins API...")
    
    # Test GET all coins
    try:
        response = requests.get(f"{BASE_URL}/coins/")
        if response.status_code == 200:
            coins = response.json()
            print(f"✓ GET /coins/ - Found {len(coins)} coins")
            if coins:
                print(f"  Sample coin: {coins[0]}")
        else:
            print(f"✗ GET /coins/ failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ GET /coins/ error: {e}")
        return False
    
    # Test GET solar coins
    try:
        response = requests.get(f"{BASE_URL}/coins/solar")
        if response.status_code == 200:
            solar_coins = response.json()
            print(f"✓ GET /coins/solar - Found {len(solar_coins)} solar coins")
        else:
            print(f"✗ GET /coins/solar failed: {response.status_code}")
    except Exception as e:
        print(f"✗ GET /coins/solar error: {e}")
    
    # Test GET coin stats
    try:
        response = requests.get(f"{BASE_URL}/coins/stats")
        if response.status_code == 200:
            stats = response.json()
            print(f"✓ GET /coins/stats - {stats}")
        else:
            print(f"✗ GET /coins/stats failed: {response.status_code}")
    except Exception as e:
        print(f"✗ GET /coins/stats error: {e}")
    
    return True

def test_solar_panel_minting():
    """Test solar panel coin minting"""
    print("\nTesting Solar Panel Coin Minting...")
    
    # Test data for minting
    minting_data = {
        "latitude": 13.0827,
        "longitude": 77.5877,
        "annual_energy_mwh": 5.5,
        "annual_co2_avoided_tonnes": 2.75,
        "annual_carbon_credits": 2.75,
        "calculation_method": "NREL Solar Calculator",
        "issuer_name": "Test Solar Company",
        "description": "Test solar panel installation for coin minting",
        "price_per_coin": 15.0,
        "source_project_id": None
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/solar-panel/mint-carbon-coins",
            data=minting_data
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✓ Solar coin minting successful!")
            print(f"  Marketplace Credit ID: {result['data']['marketplace_credit_id']}")
            print(f"  Coins Issued: {result['data']['carbon_coins']['annual']}")
            print(f"  Issue Date: {result['data']['carbon_coins']['issue_date']}")
            print(f"  Verification Status: {result['data']['marketplace_info']['verification_status']}")
            return True
        else:
            print(f"✗ Solar coin minting failed: {response.status_code}")
            print(f"  Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"✗ Solar coin minting error: {e}")
        return False

def test_coins_post_endpoint():
    """Test the POST endpoint for creating coins directly"""
    print("\nTesting Coins POST Endpoint...")
    
    # Test data for direct coin creation
    coin_data = {
        "issuer_name": "Direct Test Company",
        "coins_issued": 10.5,
        "source_type": "solar_panel",
        "source_project_id": None,
        "description": "Direct coin creation test",
        "price_per_coin": 20.0
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/coins/",
            json=coin_data
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✓ Direct coin creation successful!")
            print(f"  Coin ID: {result['id']}")
            print(f"  Coins Issued: {result['coins_issued']}")
            print(f"  Issue Date: {result['issue_date']}")
            print(f"  Verification Status: {result['verification_status']}")
            return True
        else:
            print(f"✗ Direct coin creation failed: {response.status_code}")
            print(f"  Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"✗ Direct coin creation error: {e}")
        return False

def main():
    """Run all tests"""
    print("=" * 60)
    print("SOLAR PANEL COIN MINTING INTEGRATION TEST")
    print("=" * 60)
    
    # Test 1: Coins API
    coins_api_success = test_coins_api()
    
    # Test 2: Solar Panel Minting
    solar_minting_success = test_solar_panel_minting()
    
    # Test 3: Direct Coins POST
    direct_coin_success = test_coins_post_endpoint()
    
    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    print(f"Coins API: {'✓ PASS' if coins_api_success else '✗ FAIL'}")
    print(f"Solar Minting: {'✓ PASS' if solar_minting_success else '✗ FAIL'}")
    print(f"Direct Coin POST: {'✓ PASS' if direct_coin_success else '✗ FAIL'}")
    
    if all([coins_api_success, solar_minting_success, direct_coin_success]):
        print("\n🎉 All tests passed! Integration is working correctly.")
    else:
        print("\n⚠️  Some tests failed. Check the output above for details.")

if __name__ == "__main__":
    main()
