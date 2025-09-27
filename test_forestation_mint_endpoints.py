# Test script for forestation mint-coin POST and GET endpoints
# Run this to test both minting and retrieving coins

import requests
import json

API_BASE_URL = 'http://localhost:8000/api/v1'

def test_forestation_mint_coin_endpoints():
    print("🌲 Testing Forestation Mint-Coin Endpoints...\n")

    # Test 1: POST - Mint coins
    print("1️⃣ Testing: POST /forestation/mint-coin")
    try:
        form_data = {
            'name': 'Test Forest Project',
            'credits': '5.5',
            'source': 'forestation',
            'description': 'Test minting forestation coins'
        }
        
        response = requests.post(
            f"{API_BASE_URL}/forestation/mint-coin",
            data=form_data
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ SUCCESS! Coins minted")
            print(f"Response: {json.dumps(data, indent=2)}")
        else:
            print(f"❌ Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Request failed: {e}")
    
    print()
    
    # Test 2: GET - Retrieve all minted coins
    print("2️⃣ Testing: GET /forestation/mint-coin")
    try:
        response = requests.get(f"{API_BASE_URL}/forestation/mint-coin")
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ SUCCESS! Retrieved minted coins")
            print(f"Total coins found: {data.get('total', 0)}")
            print(f"Response: {json.dumps(data, indent=2)}")
        else:
            print(f"❌ Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Request failed: {e}")
    
    print()
    
    # Test 3: GET - Retrieve with filters
    print("3️⃣ Testing: GET /forestation/mint-coin with filters")
    try:
        response = requests.get(f"{API_BASE_URL}/forestation/mint-coin?name=test&source=forestation&limit=5")
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ SUCCESS! Retrieved filtered coins")
            print(f"Filtered coins found: {data.get('total', 0)}")
            print(f"Filters applied: {data.get('filters_applied', {})}")
        else:
            print(f"❌ Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Request failed: {e}")
    
    print()
    
    # Test 4: GET - Retrieve with pagination
    print("4️⃣ Testing: GET /forestation/mint-coin with pagination")
    try:
        response = requests.get(f"{API_BASE_URL}/forestation/mint-coin?skip=0&limit=3")
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ SUCCESS! Retrieved paginated coins")
            print(f"Coins in this page: {len(data.get('minted_coins', []))}")
            print(f"Total available: {data.get('total', 0)}")
        else:
            print(f"❌ Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Request failed: {e}")

def test_application_mint_coins():
    print("\n🌲 Testing Application-Specific Mint-Coins...\n")
    
    # Test application mint-coins endpoint
    print("Testing: POST /forestation/applications/17/mint-coins")
    try:
        form_data = {
            'issuer_name': 'Application Test User',
            'description': 'Testing application-specific minting',
            'price_per_coin': 12.0
        }
        
        response = requests.post(
            f"{API_BASE_URL}/forestation/applications/17/mint-coins",
            data=form_data
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ SUCCESS! Application coins minted")
            print(f"Response: {json.dumps(data, indent=2)}")
        else:
            print(f"❌ Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Request failed: {e}")

if __name__ == "__main__":
    test_forestation_mint_coin_endpoints()
    test_application_mint_coins()
    
    print("\n✨ All tests completed!")
    print("\n📋 Available Endpoints:")
    print("   POST /api/v1/forestation/mint-coin - Direct coin minting")
    print("   GET  /api/v1/forestation/mint-coin - Retrieve all minted coins")
    print("   POST /api/v1/forestation/applications/{id}/mint-coins - Application-specific minting")
