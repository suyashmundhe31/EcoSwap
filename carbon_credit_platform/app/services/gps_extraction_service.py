# app/services/gps_extraction_service.py
import os
import base64
import tempfile
from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS
import openai
from typing import Dict, Optional
import logging
import json

logger = logging.getLogger(__name__)

class GPSExtractionService:
    def __init__(self):
        # Initialize OpenAI client
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable is required")
        
        self.openai_client = openai.OpenAI(api_key=api_key)
    
    def extract_gps_from_exif(self, image_path: str) -> Optional[Dict]:
        """Extract GPS coordinates from image EXIF data"""
        try:
            with Image.open(image_path) as image:
                exif_data = image._getexif()
                
                if not exif_data:
                    logger.info("No EXIF data found in image")
                    return None
                
                gps_info = {}
                for tag, value in exif_data.items():
                    decoded = TAGS.get(tag, tag)
                    if decoded == "GPSInfo":
                        for gps_tag in value:
                            sub_decoded = GPSTAGS.get(gps_tag, gps_tag)
                            gps_info[sub_decoded] = value[gps_tag]
                
                if not gps_info:
                    logger.info("No GPS info found in EXIF data")
                    return None
                
                # Convert GPS coordinates to decimal degrees
                lat = self._convert_to_degrees(gps_info.get('GPSLatitude'))
                lat_ref = gps_info.get('GPSLatitudeRef')
                lon = self._convert_to_degrees(gps_info.get('GPSLongitude'))
                lon_ref = gps_info.get('GPSLongitudeRef')
                
                if lat and lon:
                    if lat_ref == 'S':
                        lat = -lat
                    if lon_ref == 'W':
                        lon = -lon
                    
                    logger.info(f"Successfully extracted GPS from EXIF: {lat}, {lon}")
                    return {
                        'latitude': lat,
                        'longitude': lon,
                        'method': 'exif',
                        'confidence': 'high'
                    }
                
        except Exception as e:
            logger.error(f"Error extracting GPS from EXIF: {str(e)}")
            
        return None
    
    def _convert_to_degrees(self, value):
        """Convert GPS coordinates to decimal degrees"""
        if not value:
            return None
            
        try:
            d, m, s = value
            return float(d) + float(m)/60 + float(s)/3600
        except:
            return None
    
    def encode_image_to_base64(self, image_path: str) -> str:
        """Convert image to base64 for OpenAI API"""
        try:
            with open(image_path, "rb") as image_file:
                return base64.b64encode(image_file.read()).decode('utf-8')
        except Exception as e:
            logger.error(f"Error encoding image: {str(e)}")
            raise
    
    def extract_gps_with_openai(self, image_path: str) -> Dict:
        """Use OpenAI Vision API to extract GPS coordinates from image"""
        try:
            # First try EXIF data extraction
            exif_result = self.extract_gps_from_exif(image_path)
            if exif_result:
                return {
                    'success': True,
                    'latitude': exif_result['latitude'],
                    'longitude': exif_result['longitude'],
                    'message': f"GPS coordinates extracted from EXIF data",
                    'method': 'exif',
                    'confidence': 'high'
                }
            
            # If EXIF fails, use OpenAI Vision API
            logger.info("EXIF extraction failed, trying OpenAI Vision API")
            base64_image = self.encode_image_to_base64(image_path)
            
            response = self.openai_client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": """Analyze this solar panel installation image and try to extract location information. 
                                Look for:
                                1. Any visible GPS coordinates or location stamps
                                2. Geographical landmarks that could help identify the location
                                3. Solar panel installation characteristics that might indicate region
                                4. Any text or metadata visible in the image
                                
                                If you can determine a specific location, provide latitude and longitude in decimal degrees.
                                
                                Respond in this exact JSON format:
                                {
                                    "has_coordinates": true/false,
                                    "latitude": number or null,
                                    "longitude": number or null,
                                    "confidence": "high/medium/low",
                                    "method": "description of how you determined the location",
                                    "location_description": "what you see in the image that helped identify location"
                                }"""
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{base64_image}"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=500
            )
            
            # Parse OpenAI response
            ai_response = response.choices[0].message.content
            logger.info(f"OpenAI response: {ai_response}")
            
            # Try to parse JSON response
            try:
                parsed_response = json.loads(ai_response)
                
                if (parsed_response.get('has_coordinates') and 
                    parsed_response.get('latitude') and 
                    parsed_response.get('longitude')):
                    
                    return {
                        'success': True,
                        'latitude': float(parsed_response['latitude']),
                        'longitude': float(parsed_response['longitude']),
                        'message': f"AI extracted coordinates: {parsed_response.get('method', 'AI analysis')}",
                        'method': 'openai_vision',
                        'confidence': parsed_response.get('confidence', 'medium'),
                        'description': parsed_response.get('location_description', '')
                    }
                else:
                    return {
                        'success': False,
                        'latitude': None,
                        'longitude': None,
                        'message': f"AI could not determine coordinates: {parsed_response.get('location_description', 'No GPS data found')}",
                        'method': 'openai_vision',
                        'confidence': 'none'
                    }
                    
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse OpenAI JSON response: {e}")
                return {
                    'success': False,
                    'latitude': None,
                    'longitude': None,
                    'message': "AI analysis completed but response format was invalid",
                    'method': 'openai_vision',
                    'confidence': 'none'
                }
                
        except Exception as e:
            logger.error(f"Error in OpenAI GPS extraction: {str(e)}")
            return {
                'success': False,
                'latitude': None,
                'longitude': None,
                'message': f"Error during AI analysis: {str(e)}",
                'method': 'error',
                'confidence': 'none'
            }
    
    def process_uploaded_file(self, uploaded_file) -> Dict:
        """Process uploaded file and extract GPS coordinates"""
        try:
            # Create temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
                # Read and write file content
                uploaded_file.file.seek(0)
                content = uploaded_file.file.read()
                temp_file.write(content)
                temp_path = temp_file.name
            
            try:
                # Extract GPS coordinates
                result = self.extract_gps_with_openai(temp_path)
                return result
                
            finally:
                # Clean up temp file
                try:
                    os.unlink(temp_path)
                except:
                    pass
                    
        except Exception as e:
            logger.error(f"Error processing uploaded file: {str(e)}")
            return {
                'success': False,
                'latitude': None,
                'longitude': None,
                'message': f"Error processing image: {str(e)}",
                'method': 'error',
                'confidence': 'none'
            }