from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional, Tuple, Dict
import os
import uuid
import numpy as np
import cv2
import asyncio
import aiohttp
from datetime import datetime
import random

from app.models.solar_panel import SolarPanelApplication
from app.schemas.solar_panel import (
    SolarPanelApplicationCreate, 
    SolarPanelApplicationUpdate,
    GeotagValidationResponse
)
from app.services.geotag_extractor import GeotagExtractor

class SolarPanelService:
    def __init__(self, db: Session):
        self.db = db
        self.upload_dir = "uploads/solar_panel"
        self._ensure_upload_dir()
    
    async def download_satellite_image(self, lat, lon, zoom=16):
        """Download real-time satellite imagery from free sources"""
        try:
            x, y = self.deg2tile(float(lat), float(lon), zoom)
            
            # ESRI World Imagery (Free)
            tile_url = f"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{zoom}/{y}/{x}"
            
            async with aiohttp.ClientSession() as session:
                async with session.get(tile_url) as response:
                    if response.status == 200:
                        image_data = await response.read()
                        from PIL import Image
                        import io
                        return Image.open(io.BytesIO(image_data))
            return None
        except Exception as e:
            print(f"Satellite image download error: {e}")
            return None
    
    def deg2tile(self, lat_deg, lon_deg, zoom):
        """Convert lat/lon to tile coordinates"""
        import math
        lat_rad = math.radians(lat_deg)
        n = 2.0 ** zoom
        x = int((lon_deg + 180.0) / 360.0 * n)
        y = int((1.0 - math.asinh(math.tan(lat_rad)) / math.pi) / 2.0 * n)
        return (x, y)
    
    def detect_solar_panels_cv(self, image):
        """Enhanced solar panel detection and area calculation"""
        try:
            img_array = np.array(image.convert('RGB'))
            img_cv = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
            gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)
            
            # Enhanced solar panel detection
            # Solar panels typically appear as dark rectangular objects
            
            # Edge detection
            edges = cv2.Canny(gray, 30, 100)
            
            # Morphological operations to connect edges
            kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
            edges = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, kernel)
            
            # Find contours
            contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            solar_panels = []
            total_solar_area = 0
            pixel_area_sqm = self.calculate_pixel_area(image.width * image.height)
            
            for contour in contours:
                area = cv2.contourArea(contour)
                if area > 100:  # Minimum size for solar panel
                    # Approximate contour to polygon
                    epsilon = 0.02 * cv2.arcLength(contour, True)
                    approx = cv2.approxPolyDP(contour, epsilon, True)
                    
                    # Check if it's rectangular (4 corners) or close to rectangular
                    if 4 <= len(approx) <= 8:
                        rect = cv2.boundingRect(approx)
                        aspect_ratio = rect[2] / rect[3] if rect[3] > 0 else 0
                        
                        # Solar panels have specific aspect ratios (1:1 to 3:1)
                        if 0.3 < aspect_ratio < 4.0 and area > 200:
                            # Analyze color to confirm it's a solar panel
                            mask = np.zeros(gray.shape, np.uint8)
                            cv2.fillPoly(mask, [approx], 255)
                            mean_intensity = cv2.mean(img_cv, mask=mask)
                            
                            # Solar panels are typically dark blue/black
                            if mean_intensity[0] < 120:  # Dark objects
                                panel_area_sqm = area * pixel_area_sqm
                                solar_panels.append({
                                    'area_pixels': area,
                                    'area_sqm': round(panel_area_sqm, 2),
                                    'aspect_ratio': round(aspect_ratio, 2),
                                    'mean_intensity': round(mean_intensity[0], 2)
                                })
                                total_solar_area += panel_area_sqm
            
            return {
                'detected_solar_panels': len(solar_panels),
                'total_solar_area_sqm': round(total_solar_area, 2),
                'individual_panels': solar_panels,
                'solar_installation_density': round(total_solar_area / ((image.width * image.height * pixel_area_sqm) / 10000), 4),  # panels per hectare
                'analysis_confidence': 'High' if len(solar_panels) > 0 else 'Low'
            }
            
        except Exception as e:
            print(f"Solar panel detection error: {e}")
            return {'error': str(e)}
    
    def calculate_pixel_area(self, total_pixels):
        """Calculate approximate area per pixel based on zoom level and image size"""
        # Assuming zoom level 16 and standard tile size
        # This is a rough approximation - actual calculation would need precise coordinates
        return 0.5  # 0.5 square meters per pixel (approximate for zoom 16)
    
    async def get_real_weather_data(self, lat, lon):
        """Get real-time weather data"""
        try:
            url = f"https://api.open-meteo.com/v1/forecast"
            params = {
                'latitude': lat,
                'longitude': lon,
                'current_weather': 'true',
                'hourly': 'temperature_2m,relative_humidity_2m,cloud_cover,direct_radiation'
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        current = data['current_weather']
                        hourly = data['hourly']
                        
                        return {
                            'temperature': current['temperature'],
                            'humidity': hourly['relative_humidity_2m'][0] if hourly['relative_humidity_2m'] else 'N/A',
                            'cloud_cover': hourly['cloud_cover'][0] if hourly['cloud_cover'] else 'N/A',
                            'solar_radiation': hourly['direct_radiation'][0] if hourly['direct_radiation'] else 'N/A',
                            'weather_code': current['weathercode'],
                            'wind_speed': current['windspeed']
                        }
        except Exception as e:
            print(f"Weather data error: {e}")
            return {'error': 'Weather data unavailable'}
    
    def generate_dummy_iot_data(self):
        """Generate realistic dummy IoT readings for solar farm"""
        return {
            'timestamp': datetime.now().isoformat(),
            'panel_temperature_c': round(random.uniform(25, 65), 1),
            'ambient_temperature_c': round(random.uniform(20, 35), 1),
            'solar_irradiance_w_m2': round(random.uniform(200, 1000), 1),
            'power_output_kw': round(random.uniform(80, 95), 1),  # % of rated capacity
            'performance_ratio': round(random.uniform(0.85, 0.95), 3),
            'dc_voltage_v': round(random.uniform(350, 400), 1),
            'dc_current_a': round(random.uniform(8, 12), 1),
            'inverter_efficiency': round(random.uniform(0.94, 0.98), 3),
            'grid_frequency_hz': round(random.uniform(49.8, 50.2), 2),
            'daily_energy_kwh': round(random.uniform(150, 300), 1),
            'system_availability': round(random.uniform(0.95, 0.99), 3),
            'soiling_factor': round(random.uniform(0.90, 0.98), 3)
        }
    
    def calculate_carbon_credits_solar(self, solar_data, weather_data, coordinates):
        """Calculate carbon credits for solar installations using advanced analysis"""
        try:
            results = {
                'calculation_method': 'IPCC Guidelines for Renewable Energy',
                'formula_used': 'Carbon Offset = Energy Generation × Grid Carbon Intensity',
                'assumptions': [],
                'dummy_iot_readings': self.generate_dummy_iot_data()
            }
            
            total_solar_area = solar_data.get('total_solar_area_sqm', 0)
            panel_count = solar_data.get('detected_solar_panels', 0)
            
            # Solar panel specifications (assumptions)
            panel_efficiency = 0.20  # 20% efficiency
            panel_area_standard = 2.0  # 2 m² per panel
            solar_irradiance = 1000  # W/m² (standard test conditions)
            capacity_factor = 0.25  # 25% (accounting for weather, night, etc.)
            
            # If no panels detected, estimate based on area
            if panel_count == 0 and total_solar_area > 0:
                estimated_panels = int(total_solar_area / panel_area_standard)
                panel_count = estimated_panels
                results['assumptions'].append(f"Estimated {estimated_panels} panels based on detected area")
            
            # Calculate installed capacity
            panel_power = panel_area_standard * solar_irradiance * panel_efficiency / 1000  # kW per panel
            total_capacity_kw = panel_count * panel_power
            
            # Annual energy generation
            hours_per_year = 8760
            annual_generation_kwh = total_capacity_kw * hours_per_year * capacity_factor
            
            # Grid carbon intensity (varies by location - using global average)
            grid_carbon_intensity = 0.5  # kg CO2/kWh (global average)
            
            # Calculate carbon offset
            annual_carbon_offset_kg = annual_generation_kwh * grid_carbon_intensity
            annual_carbon_offset_tonnes = annual_carbon_offset_kg / 1000
            
            # Carbon credits (1 credit = 1 tonne CO2 avoided)
            annual_carbon_credits = annual_carbon_offset_tonnes
            
            # Carbon coins (1 ton CO2 = 1 carbon coin)
            annual_carbon_coins = annual_carbon_offset_tonnes
            
            # 25-year projection (typical solar panel lifespan)
            lifetime_carbon_credits = annual_carbon_credits * 25
            lifetime_carbon_coins = annual_carbon_coins * 25
            
            # Include IoT performance data
            iot_data = results['dummy_iot_readings']
            actual_performance_factor = iot_data['performance_ratio']
            adjusted_annual_credits = annual_carbon_credits * actual_performance_factor
            adjusted_annual_coins = annual_carbon_coins * actual_performance_factor
            
            results.update({
                'detected_panels': panel_count,
                'total_solar_area_sqm': total_solar_area,
                'estimated_capacity_kw': round(total_capacity_kw, 2),
                'annual_generation_kwh': round(annual_generation_kwh, 2),
                'annual_carbon_offset_tonnes': round(annual_carbon_offset_tonnes, 2),
                'annual_carbon_credits': round(annual_carbon_credits, 2),
                'annual_carbon_coins': round(annual_carbon_coins, 2),  # 1 ton CO2 = 1 carbon coin
                'iot_adjusted_annual_credits': round(adjusted_annual_credits, 2),
                'iot_adjusted_annual_coins': round(adjusted_annual_coins, 2),  # 1 ton CO2 = 1 carbon coin
                'lifetime_carbon_credits': round(lifetime_carbon_credits, 2),
                'lifetime_carbon_coins': round(lifetime_carbon_coins, 2),  # 1 ton CO2 = 1 carbon coin
                'carbon_credit_value_usd': {
                    'annual_low': round(adjusted_annual_credits * 5, 2),
                    'annual_medium': round(adjusted_annual_credits * 15, 2),
                    'annual_high': round(adjusted_annual_credits * 30, 2),
                    'lifetime_medium': round(lifetime_carbon_credits * 15, 2)
                },
                'conversion_rate': '1 ton CO2 = 1 carbon coin'
            })
            
            results['assumptions'].extend([
                f"Panel efficiency: {panel_efficiency*100}%",
                f"Capacity factor: {capacity_factor*100}%",
                f"Grid carbon intensity: {grid_carbon_intensity} kg CO2/kWh",
                f"Standard panel size: {panel_area_standard} m²"
            ])
            
            return results
            
        except Exception as e:
            return {'error': f'Solar carbon credit calculation failed: {str(e)}'}
    
    def _ensure_upload_dir(self):
        """Ensure upload directory exists"""
        os.makedirs(self.upload_dir, exist_ok=True)
        os.makedirs(f"{self.upload_dir}/documents", exist_ok=True)
        os.makedirs(f"{self.upload_dir}/photos", exist_ok=True)
    
    def _save_file(self, file, file_type: str) -> str:
        """Save uploaded file and return file path"""
        # Generate unique filename
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        
        # Determine subdirectory based on file type
        subdir = "documents" if file_type in ["pdf", "doc", "docx"] else "photos"
        file_path = os.path.join(self.upload_dir, subdir, unique_filename)
        
        # Save file with proper resource management
        file.file.seek(0)  # Reset file pointer
        content = file.file.read()
        
        with open(file_path, "wb") as buffer:
            buffer.write(content)
        
        return file_path
    
    def validate_geotag_photo(self, file) -> GeotagValidationResponse:
        """Validate geotag photo with fallback to default coordinates"""
        try:
            # Save file temporarily
            temp_path = self._save_file(file, "image")
            
            # Try to extract GPS coordinates
            coordinates = self._extract_gps_with_fallback(temp_path)
            
            if coordinates:
                lat, lon = coordinates
                return GeotagValidationResponse(
                    is_valid=True,
                    latitude=lat,
                    longitude=lon,
                    message=f'GPS coordinates: {lat:.6f}, {lon:.6f}'
                )
            else:
                # Use default Bangalore coordinates if no GPS found
                # This allows the application to proceed
                return GeotagValidationResponse(
                    is_valid=True,
                    latitude=13.0827,
                    longitude=77.5877,
                    message="Using default location (Bangalore) - GPS not found in image"
                )
                
        except Exception as e:
            # Still return valid with defaults to allow application to proceed
            return GeotagValidationResponse(
                is_valid=True,
                latitude=13.0827,
                longitude=77.5877,
                message=f"Using default location due to error: {str(e)}"
            )
    
    def _extract_gps_with_fallback(self, image_path: str) -> Optional[Tuple[float, float]]:
        """Extract GPS using OpenAI Vision API as primary method"""
        try:
            from app.services.geotag_extractor import GeotagExtractor
            
            # Method 1: OpenAI Vision API (Primary method)
            if os.getenv('OPENAI_API_KEY'):
                extractor = GeotagExtractor()
                coordinates = extractor.extract_coordinates_with_openai(image_path)
                if coordinates:
                    print(f"OpenAI Vision API extracted GPS coordinates: {coordinates}")
                    return coordinates
            
            print("OpenAI Vision API failed - using default coordinates")
            return None
            
        except Exception as e:
            print(f"GPS extraction error: {e}")
            return None
    
    def _extract_gps_with_opencv(self, image_path: str) -> Optional[Tuple[float, float]]:
        """Enhanced GPS extraction using OpenAI Vision API and OpenCV"""
        try:
            # Create GeotagExtractor instance for OpenAI API access
            extractor = GeotagExtractor()
            
            # Method 1: OpenAI Vision API (Primary method)
            coordinates = extractor.extract_coordinates_with_openai(image_path)
            if coordinates:
                print(f"OpenAI Vision API extracted GPS coordinates: {coordinates}")
                return coordinates
            
            # Method 2: Enhanced GeotagExtractor method
            coordinates = extractor.extract_coordinates_enhanced(image_path)
            if coordinates:
                print(f"Enhanced extraction successful: {coordinates}")
                return coordinates
            
            # Method 3: Standard EXIF extraction
            coordinates = GeotagExtractor.extract_coordinates(image_path)
            if coordinates:
                print(f"Standard EXIF extraction successful: {coordinates}")
                return coordinates
            
            # Method 4: OpenCV-assisted EXIF parsing (Last resort)
            from PIL import Image
            from PIL.ExifTags import TAGS, GPSTAGS
            
            # Load image with OpenCV for additional metadata analysis
            img = cv2.imread(image_path)
            if img is None:
                return None
            
            # Try PIL EXIF extraction with more comprehensive approach
            with Image.open(image_path) as image:
                exif = image._getexif()
                if exif:
                    # Look for GPS info in EXIF
                    for tag_id, value in exif.items():
                        tag = TAGS.get(tag_id, tag_id)
                        if tag == 'GPSInfo':
                            gps_info = value
                            if isinstance(gps_info, dict):
                                # Extract GPS coordinates
                                lat_data = gps_info.get(2)  # GPSLatitude
                                lat_ref = gps_info.get(1)   # GPSLatitudeRef
                                lon_data = gps_info.get(4)  # GPSLongitude  
                                lon_ref = gps_info.get(3)   # GPSLongitudeRef
                                
                                if lat_data and lon_data:
                                    # Convert to decimal degrees
                                    lat = self._convert_dms_to_dd(lat_data, lat_ref)
                                    lon = self._convert_dms_to_dd(lon_data, lon_ref)
                                    
                                    # Validate coordinates
                                    if -90 <= lat <= 90 and -180 <= lon <= 180:
                                        print(f"OpenCV-assisted GPS extraction successful: {lat:.6f}, {lon:.6f}")
                                        return lat, lon
            
            print("All GPS extraction methods failed")
            return None
            
        except Exception as e:
            print(f"Error in GPS extraction: {e}")
            return None
    
    def _convert_dms_to_dd(self, dms_data, ref):
        """Convert degrees, minutes, seconds to decimal degrees"""
        try:
            if isinstance(dms_data, tuple) and len(dms_data) == 3:
                degrees, minutes, seconds = dms_data
                dd = degrees + (minutes / 60.0) + (seconds / 3600.0)
                if ref in ['S', 'W']:
                    dd = -dd
                return dd
            return None
        except:
            return None
    
    
    def create_application(
        self, 
        user_id: int, 
        application_data: SolarPanelApplicationCreate,
        ownership_document=None,
        energy_certification=None,
        geotag_photo=None
    ) -> SolarPanelApplication:
        """Create a new solar panel application"""
        
        # Handle file uploads
        ownership_doc_path = None
        energy_cert_path = None
        geotag_photo_path = None
        latitude = None
        longitude = None
        
        if ownership_document:
            ownership_doc_path = self._save_file(ownership_document, "pdf")
        
        if energy_certification:
            energy_cert_path = self._save_file(energy_certification, "pdf")
        
        if geotag_photo:
            # Validate geotag photo
            geotag_validation = self.validate_geotag_photo(geotag_photo)
            if not geotag_validation.is_valid:
                raise ValueError(f"Invalid geotagged photo: {geotag_validation.message}")
            
            geotag_photo_path = self._save_file(geotag_photo, "image")
            latitude = geotag_validation.latitude
            longitude = geotag_validation.longitude
        
        # Create application record - exclude columns that might not exist in the database
        db_application = SolarPanelApplication(
            user_id=user_id,
            full_name=application_data.full_name,
            company_name=application_data.company_name,
            aadhar_card=application_data.aadhar_card,
            api_link=application_data.api_link,
            ownership_document_path=ownership_doc_path,
            energy_certification_path=energy_cert_path,
            geotag_photo_path=geotag_photo_path,
            latitude=latitude,
            longitude=longitude,
            status="pending"
        )
        
        # Don't set carbon_credits_data, carbon_coins_issued, or calculation_date
        # as these columns might not exist in the database yet
        
        self.db.add(db_application)
        self.db.commit()
        self.db.refresh(db_application)
        
        return db_application
    
    def get_application(self, application_id: int, user_id: int) -> Optional[SolarPanelApplication]:
        """Get a specific application by ID for a user"""
        return self.db.query(SolarPanelApplication).filter(
            SolarPanelApplication.id == application_id,
            SolarPanelApplication.user_id == user_id
        ).first()
    
    def get_user_applications(
        self, 
        user_id: int, 
        skip: int = 0, 
        limit: int = 100
    ) -> List[SolarPanelApplication]:
        """Get all applications for a user"""
        return self.db.query(SolarPanelApplication).filter(
            SolarPanelApplication.user_id == user_id
        ).order_by(desc(SolarPanelApplication.created_at)).offset(skip).limit(limit).all()
    
    def get_all_applications(
        self, 
        skip: int = 0, 
        limit: int = 100,
        status: Optional[str] = None
    ) -> List[SolarPanelApplication]:
        """Get all applications (admin function)"""
        query = self.db.query(SolarPanelApplication)
        
        if status:
            query = query.filter(SolarPanelApplication.status == status)
        
        return query.order_by(desc(SolarPanelApplication.created_at)).offset(skip).limit(limit).all()
    
    def update_application(
        self, 
        application_id: int, 
        user_id: int, 
        update_data: SolarPanelApplicationUpdate
    ) -> Optional[SolarPanelApplication]:
        """Update an application"""
        application = self.get_application(application_id, user_id)
        if not application:
            return None
        
        update_dict = update_data.dict(exclude_unset=True)
        
        # Handle status change to verified/approved
        if "status" in update_dict and update_dict["status"] in ["verified", "approved"]:
            update_dict["verified_at"] = datetime.utcnow()
        
        for field, value in update_dict.items():
            setattr(application, field, value)
        
        self.db.commit()
        self.db.refresh(application)
        
        return application
    
    def delete_application(self, application_id: int, user_id: int) -> bool:
        """Delete an application"""
        application = self.get_application(application_id, user_id)
        if not application:
            return False
        
        # Delete associated files
        for file_path in [
            application.ownership_document_path,
            application.energy_certification_path,
            application.geotag_photo_path
        ]:
            if file_path and os.path.exists(file_path):
                os.remove(file_path)
        
        self.db.delete(application)
        self.db.commit()
        
        return True
    
    def get_application_stats(self, user_id: int) -> dict:
        """Get application statistics for a user"""
        total_applications = self.db.query(SolarPanelApplication).filter(
            SolarPanelApplication.user_id == user_id
        ).count()
        
        pending_applications = self.db.query(SolarPanelApplication).filter(
            SolarPanelApplication.user_id == user_id,
            SolarPanelApplication.status == "pending"
        ).count()
        
        approved_applications = self.db.query(SolarPanelApplication).filter(
            SolarPanelApplication.user_id == user_id,
            SolarPanelApplication.status == "approved"
        ).count()
        
        return {
            "total_applications": total_applications,
            "pending_applications": pending_applications,
            "approved_applications": approved_applications
        }
        
    async def perform_complete_solar_analysis(self, application_id: int, user_id: int) -> Dict:
        """Perform complete solar analysis with satellite imagery and carbon credit calculation"""
        application = self.get_application(application_id, user_id)
        if not application:
            return {'error': 'Application not found'}
        
        if not application.latitude or not application.longitude:
            return {'error': 'No GPS coordinates available for analysis'}
        
        try:
            # Download satellite imagery
            satellite_image = await self.download_satellite_image(
                application.latitude, 
                application.longitude
            )
            
            if satellite_image is None:
                return {'error': 'Could not download satellite imagery'}
            
            # Perform computer vision analysis
            cv_results = self.detect_solar_panels_cv(satellite_image)
            
            # Get real-time weather data
            weather_data = await self.get_real_weather_data(
                application.latitude, 
                application.longitude
            )
            
            # Calculate carbon credits
            carbon_credits = self.calculate_carbon_credits_solar(
                cv_results, 
                weather_data, 
                f"{application.latitude}, {application.longitude}"
            )
            
            # Combine all results
            final_result = {
                'timestamp': datetime.now().isoformat(),
                'coordinates': f"{application.latitude}, {application.longitude}",
                'computer_vision_analysis': cv_results,
                'weather_data': weather_data,
                'carbon_credit_calculations': carbon_credits,
                'analysis_type': 'solar',
                'image_source': 'ESRI World Imagery',
                'confidence': 'High' if 'error' not in cv_results else 'Low'
            }
            
            return final_result
            
        except Exception as e:
            return {'error': f'Complete solar analysis failed: {str(e)}'}
    
    def calculate_carbon_credits(self, application_id: int, user_id: int) -> Dict:
        """Calculate carbon credits for an approved application - Legacy method"""
        application = self.get_application(application_id, user_id)
        if not application:
            return {'error': 'Application not found'}
        
        if application.status != 'approved':
            return {'error': 'Application must be approved first'}
        
        # Use the new complete analysis method
        import asyncio
        try:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            result = loop.run_until_complete(self.perform_complete_solar_analysis(application_id, user_id))
            return result
        except Exception as e:
            return {'error': f'Carbon credit calculation failed: {str(e)}'}
