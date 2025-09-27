import os
from typing import Optional, Tuple
from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS
import exifread

class GeotagExtractor:
    def __init__(self):
        # OpenAI is optional - system works without it
        self.api_key = os.getenv('OPENAI_API_KEY')
        self.client = None
        if self.api_key:
            try:
                from openai import OpenAI
                self.client = OpenAI(api_key=self.api_key)
            except:
                print("OpenAI client initialization failed - using fallback methods")
    
    @staticmethod
    def extract_coordinates(image_path: str) -> Optional[Tuple[float, float]]:
        """Extract GPS coordinates from image EXIF data - PRIMARY METHOD"""
        try:
            # Method 1: Using PIL
            image = Image.open(image_path)
            exifdata = image.getexif()
            
            if not exifdata:
                print(f"No EXIF data found in image")
                return None
            
            for tag_id, value in exifdata.items():
                tag = TAGS.get(tag_id, tag_id)
                if tag == "GPSInfo":
                    gps_info = {}
                    for gps_tag_id, gps_value in value.items():
                        gps_tag = GPSTAGS.get(gps_tag_id, gps_tag_id)
                        gps_info[gps_tag] = gps_value
                    
                    lat = gps_info.get("GPSLatitude")
                    lat_ref = gps_info.get("GPSLatitudeRef")
                    lon = gps_info.get("GPSLongitude")
                    lon_ref = gps_info.get("GPSLongitudeRef")
                    
                    if lat and lon:
                        # Convert to decimal degrees
                        lat_decimal = lat[0] + lat[1]/60 + lat[2]/3600
                        lon_decimal = lon[0] + lon[1]/60 + lon[2]/3600
                        
                        if lat_ref == "S":
                            lat_decimal = -lat_decimal
                        if lon_ref == "W":
                            lon_decimal = -lon_decimal
                        
                        print(f"Extracted GPS: {lat_decimal}, {lon_decimal}")
                        return lat_decimal, lon_decimal
            
            return None
            
        except Exception as e:
            print(f"Error extracting GPS with PIL: {e}")
            return None
    
    def extract_coordinates_enhanced(self, image_path: str) -> Optional[Tuple[float, float]]:
        """Enhanced extraction using OpenAI Vision API as primary method"""
        try:
            # Method 1: OpenAI Vision API (Primary method)
            coordinates = self.extract_coordinates_with_openai(image_path)
            if coordinates:
                print(f"OpenAI Vision API successfully extracted coordinates: {coordinates}")
                return coordinates
            
            print("OpenAI Vision API failed - no GPS coordinates found")
            return None
            
        except Exception as e:
            print(f"Error in enhanced extraction: {e}")
            return None
    
    def _convert_to_degrees(self, value):
        """Convert GPS coordinates to degrees"""
        try:
            d = float(value.values[0].num) / float(value.values[0].den)
            m = float(value.values[1].num) / float(value.values[1].den)
            s = float(value.values[2].num) / float(value.values[2].den)
            return d + (m / 60.0) + (s / 3600.0)
        except:
            return None
    
    def extract_coordinates_with_openai(self, image_path: str) -> Optional[Tuple[float, float]]:
        """Extract GPS coordinates using OpenAI Vision API - PRIMARY METHOD"""
        if not self.client:
            print("OpenAI client not available")
            return None
        
        try:
            import base64
            with open(image_path, "rb") as image_file:
                base64_image = base64.b64encode(image_file.read()).decode()
            
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": "Analyze this image and extract GPS coordinates (latitude and longitude) if visible. Look for:\n1. GPS metadata overlays\n2. Location information in the image\n3. Geographic coordinates displayed\n4. Any location tags or markers\n\nReturn ONLY the coordinates in format 'latitude,longitude' (e.g., '28.123456,77.654321') or 'none' if no coordinates found."
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{base64_image}",
                                    "detail": "high"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=100
            )
            
            result = response.choices[0].message.content.strip()
            print(f"OpenAI Vision API response: {result}")
            
            if ',' in result and result.lower() != 'none':
                parts = result.split(',')
                try:
                    lat = float(parts[0].strip())
                    lon = float(parts[1].strip())
                    if -90 <= lat <= 90 and -180 <= lon <= 180:
                        print(f"Successfully extracted GPS coordinates: {lat:.6f}, {lon:.6f}")
                        return lat, lon
                except ValueError:
                    print(f"Could not parse coordinates from response: {result}")
                    
        except Exception as e:
            print(f"OpenAI extraction failed: {e}")
        
        return None