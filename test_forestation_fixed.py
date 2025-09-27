# Test script to verify forestation mint-coins now works
# Run this to test the fixed endpoint

import requests
import json

API_BASE_URL = 'http://localhost:8000/api/v1'

def test_forestation_mint_coins_fixed():
    print("🌲 Testing forestation mint-coins after fix...\n")
    
    application_id = 13
    
    # Test the mint-coins endpoint
    print(f"Testing: POST /forestation/applications/{application_id}/mint-coins")
    try:
        form_data = {
            'issuer_name': 'Test Forest Owner',
            'description': 'Testing minting after fix',
            'price_per_coin': 10.0
        }
        
        response = requests.post(
            f"{API_BASE_URL}/forestation/applications/{application_id}/mint-coins",
            data=form_data
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ SUCCESS! Minting worked after fix")
            print(f"Response: {json.dumps(data, indent=2)}")
        elif response.status_code == 400:
            try:
                error_data = response.json()
                print(f"❌ 400 Error: {error_data.get('detail', 'Unknown error')}")
            except:
                print(f"❌ 400 Error (raw): {response.text}")
        elif response.status_code == 404:
            print(f"❌ 404 Error: Application {application_id} not found")
        else:
            print(f"❌ Unexpected status {response.status_code}: {response.text}")
            
    except Exception as e:
        print(f"❌ Request failed: {e}")
    
    print()
    
    # Test with different application ID if 13 doesn't exist
    print("Testing with application ID 1 (fallback)...")
    try:
        form_data = {
            'issuer_name': 'Test Forest Owner',
            'description': 'Testing with application 1',
        }
        
        response = requests.post(
            f"{API_BASE_URL}/forestation/applications/1/mint-coins",
            data=form_data
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ SUCCESS! Minting worked with application 1")
            print(f"Response: {json.dumps(data, indent=2)}")
        else:
            print(f"❌ Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Request failed: {e}")

if __name__ == "__main__":
    test_forestation_mint_coins_fixed()
