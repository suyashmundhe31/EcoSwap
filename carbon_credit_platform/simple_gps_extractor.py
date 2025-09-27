#!/usr/bin/env python3
"""
Simple GPS coordinate extractor that can extract coordinates from text
without requiring Tesseract installation. This demonstrates the core
functionality for extracting GPS coordinates from images with written text.
"""

import re
from typing import Dict, Optional, List

class SimpleGPSExtractor:
    """Simple GPS coordinate extractor using regex patterns"""
    
    def __init__(self):
        # Define patterns for different GPS coordinate formats
        self.patterns = [
            # Pattern 1: "Lat 28.586847° Long 77.071348°" (from your image)
            {
                'name': 'Lat Long format',
                'pattern': r'Lat\s+([+-]?\d+\.?\d*)\s*°?\s*Long\s+([+-]?\d+\.?\d*)\s*°?',
                'example': 'Lat 28.586847° Long 77.071348°'
            },
            # Pattern 2: "28.586847° N, 77.071348° E"
            {
                'name': 'Degrees with direction',
                'pattern': r'([+-]?\d+\.?\d*)\s*°?\s*[NS]?\s*,\s*([+-]?\d+\.?\d*)\s*°?\s*[EW]?',
                'example': '28.586847° N, 77.071348° E'
            },
            # Pattern 3: "28.586847, 77.071348"
            {
                'name': 'Simple decimal',
                'pattern': r'([+-]?\d+\.?\d*)\s*,\s*([+-]?\d+\.?\d*)',
                'example': '28.586847, 77.071348'
            },
            # Pattern 4: "Latitude: 28.586847 Longitude: 77.071348"
            {
                'name': 'Latitude Longitude labels',
                'pattern': r'Latitude:\s*([+-]?\d+\.?\d*)\s*Longitude:\s*([+-]?\d+\.?\d*)',
                'example': 'Latitude: 28.586847 Longitude: 77.071348'
            },
            # Pattern 5: "GPS: 28.586847, 77.071348"
            {
                'name': 'GPS prefix',
                'pattern': r'GPS:\s*([+-]?\d+\.?\d*)\s*,\s*([+-]?\d+\.?\d*)',
                'example': 'GPS: 28.586847, 77.071348'
            },
            # Pattern 6: "28° 35' 12.6\" N, 77° 4' 16.9\" E" (degrees, minutes, seconds)
            {
                'name': 'DMS format',
                'pattern': r'(\d+)\s*°\s*(\d+)\s*[\'′]\s*([\d.]+)\s*["″]\s*[NS]?\s*,\s*(\d+)\s*°\s*(\d+)\s*[\'′]\s*([\d.]+)\s*["″]\s*[EW]?',
                'example': '28° 35\' 12.6" N, 77° 4\' 16.9" E'
            }
        ]
    
    def extract_coordinates(self, text: str) -> Optional[Dict]:
        """Extract GPS coordinates from text using regex patterns"""
        print(f"Analyzing text: {text[:200]}...")
        
        for i, pattern_info in enumerate(self.patterns):
            pattern = pattern_info['pattern']
            matches = re.findall(pattern, text, re.IGNORECASE)
            
            if matches:
                match = matches[0]
                print(f"✅ Found match with pattern '{pattern_info['name']}': {match}")
                
                try:
                    if i == 5:  # DMS format (degrees, minutes, seconds)
                        lat_deg, lat_min, lat_sec, lon_deg, lon_min, lon_sec = match
                        lat = float(lat_deg) + float(lat_min)/60 + float(lat_sec)/3600
                        lon = float(lon_deg) + float(lon_min)/60 + float(lon_sec)/3600
                        
                        # Check for N/S and E/W indicators in the text
                        if 'S' in text.upper() and float(lat_deg) > 0:
                            lat = -lat
                        if 'W' in text.upper() and float(lon_deg) > 0:
                            lon = -lon
                    else:
                        lat = float(match[0])
                        lon = float(match[1])
                    
                    # Validate coordinate ranges
                    if -90 <= lat <= 90 and -180 <= lon <= 180:
                        confidence = self._calculate_confidence(text, pattern_info['name'])
                        return {
                            'latitude': lat,
                            'longitude': lon,
                            'method': pattern_info['name'],
                            'confidence': confidence,
                            'pattern_used': pattern_info['name'],
                            'raw_match': match
                        }
                    else:
                        print(f"❌ Invalid coordinate ranges: lat={lat}, lon={lon}")
                        
                except (ValueError, IndexError) as e:
                    print(f"❌ Error parsing coordinates: {e}")
                    continue
        
        print("❌ No valid GPS coordinates found")
        return None
    
    def _calculate_confidence(self, text: str, method: str) -> str:
        """Calculate confidence level based on text context and method"""
        confidence_score = 0.5  # Base confidence
        
        # Check for GPS-related keywords
        gps_keywords = ['lat', 'long', 'latitude', 'longitude', 'gps', 'coordinates', 'location']
        keyword_count = sum(1 for keyword in gps_keywords if keyword.lower() in text.lower())
        confidence_score += keyword_count * 0.1
        
        # Check for degree symbols
        if '°' in text:
            confidence_score += 0.1
        
        # Check for location context
        location_indicators = ['delhi', 'india', 'new delhi', 'city', 'country']
        location_count = sum(1 for loc in location_indicators if loc.lower() in text.lower())
        confidence_score += location_count * 0.05
        
        # Method-specific confidence
        if method == 'Lat Long format':
            confidence_score += 0.2  # High confidence for explicit Lat/Long format
        
        if confidence_score >= 0.8:
            return 'high'
        elif confidence_score >= 0.6:
            return 'medium'
        else:
            return 'low'
    
    def test_with_sample_texts(self):
        """Test the extractor with various sample texts"""
        print("Testing GPS Coordinate Extractor")
        print("=" * 50)
        
        # Test cases including the specific format from your image
        test_cases = [
            "Lat 28.586847° Long 77.071348°",  # From your image
            "New Delhi, Delhi, India 🇮🇳\nLat 28.586847° Long 77.071348°\n25/09/2025 10:28 PM GMT +05:30",
            "28.586847° N, 77.071348° E",
            "28.586847, 77.071348",
            "Latitude: 28.586847 Longitude: 77.071348",
            "GPS: 28.586847, 77.071348",
            "28° 35' 12.6\" N, 77° 4' 16.9\" E",
            "Solar Panel Installation\nLocation: New Delhi\nLat 28.586847° Long 77.071348°\nGPS Map Camera"
        ]
        
        for i, test_text in enumerate(test_cases, 1):
            print(f"\nTest Case {i}:")
            print(f"Text: {test_text}")
            result = self.extract_coordinates(test_text)
            
            if result:
                print(f"✅ SUCCESS!")
                print(f"   Latitude: {result['latitude']}")
                print(f"   Longitude: {result['longitude']}")
                print(f"   Method: {result['method']}")
                print(f"   Confidence: {result['confidence']}")
            else:
                print("❌ FAILED")
        
        print("\n" + "=" * 50)
        print("Testing completed!")

def main():
    """Main function to run the GPS extractor tests"""
    extractor = SimpleGPSExtractor()
    extractor.test_with_sample_texts()

if __name__ == "__main__":
    main()
