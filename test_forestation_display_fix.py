# Test script to verify forestation minting displays correct values
# Run this to test the fixed frontend display

import requests
import json

API_BASE_URL = 'http://localhost:8000/api/v1'

def test_forestation_mint_coins_display():
    print("🌲 Testing forestation mint-coins display fix...\n")
    
    application_id = 13
    
    # Test the mint-coins endpoint
    print(f"Testing: POST /forestation/applications/{application_id}/mint-coins")
    try:
        form_data = {
            'issuer_name': 'Test Forest Owner',
            'description': 'Testing display fix',
            'price_per_coin': 10.0
        }
        
        response = requests.post(
            f"{API_BASE_URL}/forestation/applications/{application_id}/mint-coins",
            data=form_data
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ SUCCESS! Minting worked")
            
            # Check the response structure
            print("\n📊 Response Structure Analysis:")
            print(f"Success: {data.get('success')}")
            
            if 'carbon_credit_calculations' in data:
                calc = data['carbon_credit_calculations']
                print(f"Annual Carbon Coins: {calc.get('annual_carbon_coins')}")
                print(f"Annual Carbon Credits: {calc.get('annual_carbon_credits')}")
                print(f"CO2 Sequestration Rate: {calc.get('co2_sequestration_rate')}")
                print(f"Area Hectares: {calc.get('area_hectares')}")
                print(f"Calculation Method: {calc.get('calculation_method')}")
            
            if 'marketplace_credit_id' in data:
                print(f"Marketplace Credit ID: {data.get('marketplace_credit_id')}")
            
            print(f"\nMessage: {data.get('message')}")
            
            # This should now display correctly in the frontend
            print("\n✅ Frontend should now display:")
            print(f"   Annual Coins: {data.get('carbon_credit_calculations', {}).get('annual_carbon_coins', 0)}")
            print(f"   10-Year Projection: {(data.get('carbon_credit_calculations', {}).get('annual_carbon_coins', 0) * 10)}")
            
        else:
            print(f"❌ Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Request failed: {e}")

if __name__ == "__main__":
    test_forestation_mint_coins_display()
