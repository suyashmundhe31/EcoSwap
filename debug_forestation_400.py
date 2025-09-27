# Debug script to test forestation mint-coins endpoint
# Run this to see what's causing the 400 error

import requests
import json

API_BASE_URL = 'http://localhost:8000/api/v1'

def test_forestation_mint_coins():
    print("🔍 Debugging forestation mint-coins 400 error...\n")
    
    application_id = 12
    
    # Test 1: Check if application exists
    print(f"1️⃣ Testing: Get application {application_id}")
    try:
        response = requests.get(f"{API_BASE_URL}/forestation/applications/{application_id}")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Application found: {data.get('full_name', 'Unknown')}")
            print(f"   Status: {data.get('status', 'Unknown')}")
            print(f"   User ID: {data.get('user_id', 'Unknown')}")
        else:
            print(f"❌ Application not found: {response.text}")
    except Exception as e:
        print(f"❌ Error checking application: {e}")
    
    print()
    
    # Test 2: Try mint-coins with minimal data
    print(f"2️⃣ Testing: Mint coins for application {application_id}")
    try:
        form_data = {
            'issuer_name': 'Test User',
            'description': 'Test minting',
        }
        
        response = requests.post(
            f"{API_BASE_URL}/forestation/applications/{application_id}/mint-coins",
            data=form_data
        )
        
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 400:
            try:
                error_data = response.json()
                print(f"❌ 400 Error Detail: {error_data.get('detail', 'No detail provided')}")
            except:
                print(f"❌ 400 Error (raw): {response.text}")
        elif response.status_code == 200:
            print("✅ Minting successful!")
            
    except Exception as e:
        print(f"❌ Error during minting: {e}")
    
    print()
    
    # Test 3: Check if there are any applications
    print("3️⃣ Testing: List all applications")
    try:
        response = requests.get(f"{API_BASE_URL}/forestation/applications")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            applications = data.get('applications', [])
            print(f"✅ Found {len(applications)} applications")
            for app in applications[:3]:  # Show first 3
                print(f"   ID: {app.get('id')}, Name: {app.get('full_name')}, Status: {app.get('status')}")
        else:
            print(f"❌ Error listing applications: {response.text}")
    except Exception as e:
        print(f"❌ Error listing applications: {e}")

if __name__ == "__main__":
    test_forestation_mint_coins()
