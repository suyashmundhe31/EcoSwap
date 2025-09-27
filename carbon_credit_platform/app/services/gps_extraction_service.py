# app/services/gps_extraction_service.py
import os
import base64
import tempfile
import re
import cv2
import numpy as np
from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS
import openai
from typing import Dict, Optional
import logging
import json
import pytesseract

# Configure Tesseract path
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

logger = logging.getLogger(__name__)

class GPSExtractionService:
    def __init__(self):
        # Initialize OpenAI client
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable is required")
        
        self.openai_client = openai.OpenAI(api_key=api_key)
    
    def extract_gps_from_exif(self, image_path: str) -> Optional[Dict]:
        """Extract GPS coordinates from image EXIF data using the carbon_calculator method"""
        try:
            # Use the existing carbon_calculator method
            from app.services.carbon_calculator import carbon_calculator
            
            lat, lon = carbon_calculator.extract_gps_from_image(image_path)
            
            if lat is not None and lon is not None:
                logger.info(f"Successfully extracted GPS from EXIF: {lat}, {lon}")
                return {
                    'latitude': lat,
                    'longitude': lon,
                    'method': 'exif',
                    'confidence': 'high'
                }
            else:
                logger.info("No GPS coordinates found in EXIF data")
                return None
                
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
    
    def extract_gps_with_opencv(self, image_path: str) -> Optional[Dict]:
        """Extract GPS coordinates using OpenCV for better text detection and processing"""
        try:
            # Read image with OpenCV
            img = cv2.imread(image_path)
            if img is None:
                logger.error(f"Could not read image: {image_path}")
                return None
            
            # Convert to different color spaces for better text detection
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            
            # Apply various preprocessing techniques
            processed_images = []
            
            # 1. Original grayscale
            processed_images.append(gray)
            
            # 2. Gaussian blur + threshold
            blurred = cv2.GaussianBlur(gray, (5, 5), 0)
            _, thresh1 = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            processed_images.append(thresh1)
            
            # 3. Adaptive threshold
            thresh2 = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
            processed_images.append(thresh2)
            
            # 4. Morphological operations to clean up text
            kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
            morph = cv2.morphologyEx(thresh1, cv2.MORPH_CLOSE, kernel)
            processed_images.append(morph)
            
            # Try OCR on each processed image
            best_result = None
            best_confidence = 0
            
            for i, processed_img in enumerate(processed_images):
                try:
                    # Convert OpenCV image to PIL for pytesseract
                    pil_img = Image.fromarray(processed_img)
                    text = pytesseract.image_to_string(pil_img, config='--psm 6')
                    
                    logger.info(f"OpenCV processed image {i+1} OCR text: {text[:200]}...")
                    
                    # Extract GPS coordinates from text
                    coords = self._extract_coordinates_from_text(text)
                    if coords:
                        confidence = self._calculate_text_confidence(text, coords)
                        if confidence > best_confidence:
                            best_confidence = confidence
                            best_result = {
                                'latitude': coords['latitude'],
                                'longitude': coords['longitude'],
                                'method': 'opencv_ocr',
                                'confidence': 'high' if confidence > 0.8 else 'medium',
                                'extracted_text': text.strip(),
                                'processing_method': f'opencv_method_{i+1}',
                                'confidence_score': confidence
                            }
                
                except Exception as e:
                    logger.warning(f"Error processing image variant {i+1}: {str(e)}")
                    continue
            
            if best_result:
                logger.info(f"OpenCV extracted GPS coordinates: {best_result['latitude']}, {best_result['longitude']}")
                return best_result
            
            logger.info("No GPS coordinates found with OpenCV processing")
            return None
            
        except Exception as e:
            logger.error(f"Error in OpenCV GPS extraction: {str(e)}")
            return None
    
    def _extract_coordinates_from_text(self, text: str) -> Optional[Dict]:
        """Extract GPS coordinates from text using regex patterns with improved accuracy"""
        patterns = [
            # Pattern 1: JSON format with latitude/longitude fields (highest priority for API responses)
            {
                'pattern': r'"latitude":\s*([+-]?\d+\.?\d*).*?"longitude":\s*([+-]?\d+\.?\d*)',
                'name': 'JSON format',
                'priority': 1
            },
            # Pattern 2: "Lat 28.586847° Long 77.071348°" (from your image)
            {
                'pattern': r'Lat\s+([+-]?\d+\.?\d*)\s*°?\s*Long\s+([+-]?\d+\.?\d*)\s*°?',
                'name': 'Lat Long format',
                'priority': 2
            },
            # Pattern 3: "Latitude: 28.586847 Longitude: 77.071348"
            {
                'pattern': r'Latitude:\s*([+-]?\d+\.?\d*)\s*Longitude:\s*([+-]?\d+\.?\d*)',
                'name': 'Latitude Longitude labels',
                'priority': 3
            },
            # Pattern 4: "28.586847° N, 77.071348° E"
            {
                'pattern': r'([+-]?\d+\.?\d*)\s*°?\s*[NS]?\s*,\s*([+-]?\d+\.?\d*)\s*°?\s*[EW]?',
                'name': 'Degrees with direction',
                'priority': 4
            },
            # Pattern 5: "GPS: 28.586847, 77.071348"
            {
                'pattern': r'GPS:\s*([+-]?\d+\.?\d*)\s*,\s*([+-]?\d+\.?\d*)',
                'name': 'GPS prefix',
                'priority': 5
            },
            # Pattern 6: "28.586847, 77.071348"
            {
                'pattern': r'([+-]?\d+\.?\d*)\s*,\s*([+-]?\d+\.?\d*)',
                'name': 'Simple decimal',
                'priority': 6
            },
            # Pattern 7: "28° 35' 12.6\" N, 77° 4' 16.9\" E" (degrees, minutes, seconds)
            {
                'pattern': r'(\d+)\s*°\s*(\d+)\s*[\'′]\s*([\d.]+)\s*["″]\s*[NS]?\s*,\s*(\d+)\s*°\s*(\d+)\s*[\'′]\s*([\d.]+)\s*["″]\s*[EW]?',
                'name': 'DMS format',
                'priority': 7
            }
        ]
        
        # Sort patterns by priority (lower number = higher priority)
        patterns.sort(key=lambda x: x['priority'])
        
        for pattern_info in patterns:
            pattern = pattern_info['pattern']
            matches = re.findall(pattern, text, re.IGNORECASE)
            
            if matches:
                match = matches[0]
                logger.info(f"Found GPS coordinates using pattern '{pattern_info['name']}': {match}")
                
                try:
                    if pattern_info['name'] == 'DMS format':  # DMS format (degrees, minutes, seconds)
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
                        logger.info(f"Valid GPS coordinates extracted: {lat}, {lon}")
                        return {
                            'latitude': lat, 
                            'longitude': lon,
                            'method': pattern_info['name'],
                            'confidence': self._calculate_text_confidence(text, {'latitude': lat, 'longitude': lon})
                        }
                    else:
                        logger.warning(f"Invalid coordinate ranges: lat={lat}, lon={lon}")
                        
                except (ValueError, IndexError) as e:
                    logger.warning(f"Error parsing coordinates from pattern '{pattern_info['name']}': {e}")
                    continue
        
        logger.info("No valid GPS coordinates found in text")
        return None
    
    def _calculate_text_confidence(self, text: str, coords: Dict) -> float:
        """Calculate confidence score based on text quality and coordinate context"""
        confidence = 0.5  # Base confidence
        
        # Check for GPS-related keywords
        gps_keywords = ['lat', 'long', 'latitude', 'longitude', 'gps', 'coordinates', 'location']
        keyword_count = sum(1 for keyword in gps_keywords if keyword.lower() in text.lower())
        confidence += keyword_count * 0.1
        
        # Check for degree symbols
        if '°' in text:
            confidence += 0.1
        
        # Check for location context (city, country, etc.)
        location_indicators = ['delhi', 'india', 'new delhi', 'city', 'country']
        location_count = sum(1 for loc in location_indicators if loc.lower() in text.lower())
        confidence += location_count * 0.05
        
        # Check coordinate precision (more decimal places = higher confidence)
        lat_str = str(coords['latitude'])
        lon_str = str(coords['longitude'])
        if '.' in lat_str and '.' in lon_str:
            lat_precision = len(lat_str.split('.')[1])
            lon_precision = len(lon_str.split('.')[1])
            precision_score = min((lat_precision + lon_precision) / 10, 0.2)
            confidence += precision_score
        
        return min(confidence, 1.0)

    def extract_gps_from_text(self, image_path: str) -> Optional[Dict]:
        """Extract GPS coordinates from text written in the image using OCR"""
        try:
            # Use pytesseract to extract text from image
            image = Image.open(image_path)
            text = pytesseract.image_to_string(image)
            
            logger.info(f"OCR extracted text: {text}")
            
            coords = self._extract_coordinates_from_text(text)
            if coords:
                confidence = self._calculate_text_confidence(text, coords)
                return {
                    'latitude': coords['latitude'],
                    'longitude': coords['longitude'],
                    'method': 'ocr_text',
                    'confidence': 'high' if confidence > 0.8 else 'medium',
                    'extracted_text': text.strip(),
                    'confidence_score': confidence
                }
            
            logger.info("No GPS coordinates found in OCR text")
            return None
            
        except Exception as e:
            logger.error(f"Error in OCR GPS extraction: {str(e)}")
            return None

    def extract_gps_with_openai(self, image_path: str) -> Dict:
        """Extract GPS coordinates using multiple methods, prioritizing text extraction for written coordinates"""
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
            
            # Try text-based extraction first (for images with written coordinates like yours)
            text_result = self.extract_gps_from_text(image_path)
            if text_result:
                return {
                    'success': True,
                    'latitude': text_result['latitude'],
                    'longitude': text_result['longitude'],
                    'message': f"GPS coordinates extracted from text in image",
                    'method': 'text_extraction',
                    'confidence': text_result['confidence'],
                    'description': f"Coordinates found in image text: {text_result.get('extracted_text', '')[:100]}..."
                }
            
            # Try OpenCV-based extraction for better text detection
            opencv_result = self.extract_gps_with_opencv(image_path)
            if opencv_result:
                return {
                    'success': True,
                    'latitude': opencv_result['latitude'],
                    'longitude': opencv_result['longitude'],
                    'message': f"GPS coordinates extracted using OpenCV processing",
                    'method': 'opencv_ocr',
                    'confidence': opencv_result['confidence'],
                    'description': f"OpenCV method: {opencv_result.get('processing_method', 'unknown')}, Confidence: {opencv_result.get('confidence_score', 0):.2f}"
                }
            
            # If EXIF and OCR fail, use OpenAI Vision API
            logger.info("EXIF and OCR extraction failed, trying OpenAI Vision API")
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
                
                # Check if coordinates are directly available
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
                
                # Check if coordinates are in the raw response text (even if JSON parsing failed)
                coords_in_response = self._extract_coordinates_from_text(ai_response)
                if coords_in_response:
                    return {
                        'success': True,
                        'latitude': coords_in_response['latitude'],
                        'longitude': coords_in_response['longitude'],
                        'message': f"AI extracted coordinates from response text",
                        'method': 'openai_vision',
                        'confidence': coords_in_response.get('confidence', 'medium'),
                        'description': f"Raw AI response: {ai_response[:200]}..."
                    }
                
                # Special case: Check if coordinates are mentioned in the parsed response
                if 'latitude' in parsed_response and 'longitude' in parsed_response:
                    try:
                        lat = float(parsed_response['latitude'])
                        lon = float(parsed_response['longitude'])
                        if -90 <= lat <= 90 and -180 <= lon <= 180:
                            return {
                                'success': True,
                                'latitude': lat,
                                'longitude': lon,
                                'message': f"AI extracted coordinates from parsed response",
                                'method': 'openai_vision',
                                'confidence': parsed_response.get('confidence', 'medium'),
                                'description': f"Coordinates found in AI response: {parsed_response.get('location_description', '')}"
                            }
                    except (ValueError, TypeError):
                        pass
                else:
                    # Try to extract coordinates from the raw text response
                    coords = self._extract_coordinates_from_text(ai_response)
                    if coords:
                        return {
                            'success': True,
                            'latitude': coords['latitude'],
                            'longitude': coords['longitude'],
                            'message': f"AI extracted coordinates from text response",
                            'method': 'openai_vision',
                            'confidence': coords.get('confidence', 'medium'),
                            'description': f"Raw AI response: {ai_response[:200]}..."
                        }
                    
                    # Try to extract from description field if coordinates are mentioned there
                    if 'description' in parsed_response:
                        desc_coords = self._extract_coordinates_from_text(parsed_response['description'])
                        if desc_coords:
                            return {
                                'success': True,
                                'latitude': desc_coords['latitude'],
                                'longitude': desc_coords['longitude'],
                                'message': f"AI extracted coordinates from description field",
                                'method': 'openai_vision',
                                'confidence': desc_coords.get('confidence', 'medium'),
                                'description': f"Extracted from description: {parsed_response['description'][:200]}..."
                            }
                    
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
                logger.info(f"Raw AI response: {ai_response}")
                
                # Try to extract coordinates from the raw text response
                coords = self._extract_coordinates_from_text(ai_response)
                if coords:
                    return {
                        'success': True,
                        'latitude': coords['latitude'],
                        'longitude': coords['longitude'],
                        'message': f"AI extracted coordinates from raw text response",
                        'method': 'openai_vision',
                        'confidence': 'medium',
                        'description': f"Raw AI response: {ai_response[:200]}..."
                    }
                
                return {
                    'success': False,
                    'latitude': None,
                    'longitude': None,
                    'message': "AI analysis completed but response format was invalid",
                    'method': 'openai_vision',
                    'confidence': 'none',
                    'description': f"Raw AI response: {ai_response[:200]}..."
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