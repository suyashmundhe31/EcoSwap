import os
from openai import OpenAI
from typing import Dict, Optional, Tuple
import json
from datetime import datetime
from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS

class CarbonCalculator:
    def __init__(self):
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            print("Warning: OPENAI_API_KEY not found in environment")
        self.client = OpenAI(api_key=api_key) if api_key else None
    
    def extract_gps_from_image(self, image_path: str) -> Tuple[Optional[float], Optional[float]]:
        """Extract GPS coordinates from image EXIF data"""
        try:
            image = Image.open(image_path)
            exifdata = image.getexif()
            
            if not exifdata:
                print(f"No EXIF data found in {image_path}")
                return None, None
            
            # Find GPS info
            for tag_id, value in exifdata.items():
                tag = TAGS.get(tag_id, tag_id)
                if tag == "GPSInfo":
                    gps_data = {}
                    for gps_tag_id, gps_value in value.items():
                        gps_tag = GPSTAGS.get(gps_tag_id, gps_tag_id)
                        gps_data[gps_tag] = gps_value
                    
                    # Extract coordinates
                    if "GPSLatitude" in gps_data and "GPSLongitude" in gps_data:
                        lat = self._convert_to_degrees(gps_data["GPSLatitude"])
                        lon = self._convert_to_degrees(gps_data["GPSLongitude"])
                        
                        # Handle hemisphere
                        if gps_data.get("GPSLatitudeRef") == "S":
                            lat = -lat
                        if gps_data.get("GPSLongitudeRef") == "W":
                            lon = -lon
                        
                        print(f"Extracted coordinates: {lat}, {lon}")
                        return lat, lon
            
            print(f"No GPS data found in EXIF for {image_path}")
            return None, None
            
        except Exception as e:
            print(f"Error extracting GPS from {image_path}: {e}")
            return None, None
    
    def _convert_to_degrees(self, value):
        """Convert GPS coordinates to degrees"""
        try:
            d, m, s = value
            degrees = d + (m / 60.0) + (s / 3600.0)
            return degrees
        except:
            return 0
    
    def calculate_solar_carbon_credits(
        self,
        latitude: float,
        longitude: float,
        image_path: Optional[str] = None,
        panel_area_sqm: Optional[float] = None
    ) -> Dict:
        """Calculate carbon credits for solar installation"""
        try:
            # Default calculations if OpenAI is not available
            if not self.client:
                return self._calculate_default_credits(latitude, longitude, panel_area_sqm)
            
            # Use OpenAI for analysis if available
            prompt = f"""
            Analyze a solar panel installation at coordinates {latitude}, {longitude}.
            
            Estimate:
            1. Annual energy generation in MWh (assume 20 panels, 400W each, 5 peak sun hours average)
            2. CO2 emissions avoided (use 0.5 kg CO2/kWh grid emission factor)
            3. Carbon credits generated (1 credit = 1 tonne CO2)
            
            Return ONLY a JSON object with these exact fields:
            {{
                "annual_energy_mwh": <number>,
                "annual_co2_avoided_tonnes": <number>,
                "annual_carbon_credits": <number>,
                "calculation_method": "AI estimation"
            }}
            """
            
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a solar energy expert. Provide accurate calculations in JSON format."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.2,
                max_tokens=200
            )
            
            result_text = response.choices[0].message.content
            
            # Parse JSON from response
            import re
            json_match = re.search(r'\{.*\}', result_text, re.DOTALL)
            if json_match:
                result = json.loads(json_match.group())
            else:
                return self._calculate_default_credits(latitude, longitude, panel_area_sqm)
            
            # Add carbon coins - 1 ton CO2 = 1 carbon coin
            annual_co2_tonnes = result.get('annual_co2_avoided_tonnes', 0)
            result['carbon_coins'] = {
                'annual': annual_co2_tonnes,  # 1 ton CO2 = 1 carbon coin
                'ten_year': annual_co2_tonnes * 10,  # 10-year projection
                'issue_date': datetime.now().isoformat(),
                'conversion_rate': '1 ton CO2 = 1 carbon coin'
            }
            
            return {
                'success': True,
                'data': result
            }
            
        except Exception as e:
            print(f"Error in carbon credit calculation: {e}")
            return self._calculate_default_credits(latitude, longitude, panel_area_sqm)
    
    def _calculate_default_credits(self, latitude: float, longitude: float, panel_area_sqm: Optional[float] = None) -> Dict:
        """Default calculation when AI is not available"""
        # Standard calculation: 20 panels, 400W each, 5 peak hours, 365 days
        panel_count = 20
        panel_wattage = 400  # watts
        peak_sun_hours = 5
        days_per_year = 365
        system_efficiency = 0.85
        
        # Calculate annual energy
        annual_energy_kwh = (panel_count * panel_wattage * peak_sun_hours * days_per_year * system_efficiency) / 1000
        annual_energy_mwh = annual_energy_kwh / 1000
        
        # CO2 calculation (0.5 kg CO2/kWh avoided)
        co2_avoided_kg = annual_energy_kwh * 0.5
        co2_avoided_tonnes = co2_avoided_kg / 1000
        
        # Carbon credits (1 credit = 1 tonne CO2)
        annual_credits = co2_avoided_tonnes
        
        return {
            'success': True,
            'data': {
                'annual_energy_mwh': round(annual_energy_mwh, 2),
                'annual_co2_avoided_tonnes': round(co2_avoided_tonnes, 2),
                'annual_carbon_credits': round(annual_credits, 2),
                'carbon_coins': {
                    'annual': round(co2_avoided_tonnes, 2),  # 1 ton CO2 = 1 carbon coin
                    'ten_year': round(co2_avoided_tonnes * 10, 2),  # 10-year projection
                    'issue_date': datetime.now().isoformat(),
                    'conversion_rate': '1 ton CO2 = 1 carbon coin'
                },
                'calculation_method': 'Standard calculation'
            }
        }

carbon_calculator = CarbonCalculator()