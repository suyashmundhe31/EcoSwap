#!/usr/bin/env python3
"""
Test script to verify that minted coins are properly saved to the marketplace credits database.
This script tests both solar panel and forestation coin minting integration.
"""

import requests
import json
import sys
import os

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

def test_solar_panel_minting():
    """Test solar panel coin minting and database storage"""
    print("🧪 Testing Solar Panel Coin Minting Integration...")
    
    # Test data for solar panel minting
    minting_data = {
        'latitude': 13.0827,
        'longitude': 77.5877,
        'annual_energy_mwh': 50.0,
        'annual_co2_avoided_tonnes': 25.0,
        'annual_carbon_credits': 25.0,
        'calculation_method': 'Solar Panel Carbon Calculator',
        'issuer_name': 'Test Solar Company',
        'description': 'Test solar panel installation',
        'price_per_coin': 15.0
    }
    
    try:
        # Make request to mint coins
        response = requests.post(
            'http://localhost:8000/api/v1/solar-panel/mint-carbon-coins',
            data=minting_data,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Solar panel minting successful!")
            print(f"   Marketplace Credit ID: {result['data']['marketplace_credit_id']}")
            print(f"   Coins Issued: {result['data']['carbon_coins']['annual']}")
            print(f"   Verification Status: {result['data']['marketplace_info']['verification_status']}")
            return result['data']['marketplace_credit_id']
        else:
            print(f"❌ Solar panel minting failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Network error during solar panel minting test: {e}")
        return None

def test_forestation_minting():
    """Test forestation coin minting and database storage"""
    print("\n🌳 Testing Forestation Coin Minting Integration...")
    
    # First, we need to create a forestation application
    print("   Creating test forestation application...")
    
    application_data = {
        'full_name': 'Test Forest Owner',
        'aadhar_card': '123456789012'
    }
    
    try:
        # Create application
        response = requests.post(
            'http://localhost:8000/api/v1/forestation/applications',
            data=application_data,
            timeout=30
        )
        
        if response.status_code == 200:
            app_result = response.json()
            application_id = app_result['id']
            print(f"   ✅ Application created with ID: {application_id}")
            
            # Approve the application (simulate admin approval)
            print("   Approving application...")
            approval_response = requests.put(
                f'http://localhost:8000/api/v1/forestation/admin/applications/{application_id}/status',
                data={'status': 'approved', 'verification_notes': 'Test approval'},
                timeout=30
            )
            
            if approval_response.status_code == 200:
                print("   ✅ Application approved!")
                
                # Now mint coins
                print("   Minting forestation coins...")
                minting_data = {
                    'issuer_name': 'Test Forest Company',
                    'description': 'Test forestation project',
                    'price_per_coin': 20.0
                }
                
                mint_response = requests.post(
                    f'http://localhost:8000/api/v1/forestation/applications/{application_id}/mint-coins',
                    data=minting_data,
                    timeout=30
                )
                
                if mint_response.status_code == 200:
                    result = mint_response.json()
                    print("   ✅ Forestation minting successful!")
                    print(f"   Marketplace Credit ID: {result['data']['marketplace_credit_id']}")
                    print(f"   Coins Issued: {result['data']['carbon_coins']['annual']}")
                    print(f"   Verification Status: {result['data']['marketplace_info']['verification_status']}")
                    return result['data']['marketplace_credit_id']
                else:
                    print(f"   ❌ Forestation minting failed: {mint_response.status_code}")
                    print(f"   Error: {mint_response.text}")
                    return None
            else:
                print(f"   ❌ Application approval failed: {approval_response.status_code}")
                return None
        else:
            print(f"   ❌ Application creation failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Network error during forestation minting test: {e}")
        return None

def test_marketplace_credits_api():
    """Test that minted coins appear in the marketplace credits API"""
    print("\n📊 Testing Marketplace Credits API...")
    
    try:
        # Get all marketplace credits
        response = requests.get('http://localhost:8000/api/v1/marketplace/credits', timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            credits = result.get('credits', [])
            print(f"   ✅ Found {len(credits)} marketplace credits")
            
            # Show details of each credit
            for credit in credits:
                print(f"   📋 Credit ID: {credit['id']}")
                print(f"      Issuer: {credit['issuer_name']}")
                print(f"      Coins: {credit['coins_issued']}")
                print(f"      Source: {credit['source_type']}")
                print(f"      Status: {credit['verification_status']}")
                print()
            
            return len(credits) > 0
        else:
            print(f"   ❌ Failed to fetch marketplace credits: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Network error during marketplace credits test: {e}")
        return False

def test_coins_api():
    """Test the coins API endpoint"""
    print("\n🪙 Testing Coins API...")
    
    try:
        # Get all coins
        response = requests.get('http://localhost:8000/api/v1/coins/', timeout=30)
        
        if response.status_code == 200:
            coins = response.json()
            print(f"   ✅ Found {len(coins)} coins in database")
            
            # Show coin statistics
            stats_response = requests.get('http://localhost:8000/api/v1/coins/stats', timeout=30)
            if stats_response.status_code == 200:
                stats = stats_response.json()
                print(f"   📈 Total coins: {stats['total_coins']}")
                print(f"   ✅ Verified coins: {stats['verified_coins']}")
                print(f"   🌳 Forestation coins: {stats['forestation_coins']}")
                print(f"   ☀️ Solar coins: {stats['solar_coins']}")
                print(f"   💰 Total coins issued: {stats['total_coins_issued']}")
            
            return len(coins) > 0
        else:
            print(f"   ❌ Failed to fetch coins: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Network error during coins API test: {e}")
        return False

def main():
    """Run all integration tests"""
    print("🚀 Starting Coin Minting Integration Tests")
    print("=" * 50)
    
    # Check if server is running
    try:
        response = requests.get('http://localhost:8000/docs', timeout=5)
        if response.status_code != 200:
            print("❌ Server is not running. Please start the FastAPI server first.")
            print("   Run: uvicorn app.main:app --reload")
            return
    except requests.exceptions.RequestException:
        print("❌ Server is not running. Please start the FastAPI server first.")
        print("   Run: uvicorn app.main:app --reload")
        return
    
    print("✅ Server is running. Starting tests...\n")
    
    # Run tests
    solar_credit_id = test_solar_panel_minting()
    forest_credit_id = test_forestation_minting()
    
    # Test APIs
    marketplace_success = test_marketplace_credits_api()
    coins_success = test_coins_api()
    
    # Summary
    print("\n" + "=" * 50)
    print("📋 TEST SUMMARY")
    print("=" * 50)
    
    if solar_credit_id:
        print("✅ Solar Panel Minting: PASSED")
    else:
        print("❌ Solar Panel Minting: FAILED")
    
    if forest_credit_id:
        print("✅ Forestation Minting: PASSED")
    else:
        print("❌ Forestation Minting: FAILED")
    
    if marketplace_success:
        print("✅ Marketplace Credits API: PASSED")
    else:
        print("❌ Marketplace Credits API: FAILED")
    
    if coins_success:
        print("✅ Coins API: PASSED")
    else:
        print("❌ Coins API: FAILED")
    
    # Overall result
    all_passed = all([solar_credit_id, forest_credit_id, marketplace_success, coins_success])
    
    if all_passed:
        print("\n🎉 ALL TESTS PASSED! Coins are being properly saved to the database.")
    else:
        print("\n⚠️  SOME TESTS FAILED. Please check the implementation.")

if __name__ == "__main__":
    main()
