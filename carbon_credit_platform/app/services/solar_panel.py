from app.services.carbon_calculator import carbon_calculator
import json
from datetime import datetime

def validate_geotag_photo(self, file_path: str) -> GeotagValidationResponse:
    """Extract and validate GPS coordinates from photo"""
    try:
        lat, lon = carbon_calculator.extract_gps_from_image(file_path)
        
        if lat is not None and lon is not None:
            return GeotagValidationResponse(
                is_valid=True,
                latitude=lat,
                longitude=lon,
                message="GPS coordinates extracted successfully"
            )
        else:
            # Return default coordinates if extraction fails
            return GeotagValidationResponse(
                is_valid=True,
                latitude=13.0827,  # Default Bangalore coordinates
                longitude=77.5877,
                message="Using default coordinates (GPS not found in image)"
            )
    except Exception as e:
        print(f"Error validating geotag: {e}")
        # Return default coordinates on error
        return GeotagValidationResponse(
            is_valid=True,
            latitude=13.0827,
            longitude=77.5877,
            message="Using default coordinates"
        )

def calculate_carbon_credits(self, application_id: int, user_id: int) -> Dict:
    """Calculate carbon credits for an application"""
    try:
        application = self.get_application(application_id, user_id)
        if not application:
            return {'error': 'Application not found'}
        
        # Use stored coordinates or defaults
        latitude = application.latitude or 13.0827
        longitude = application.longitude or 77.5877
        
        # Calculate carbon credits
        result = carbon_calculator.calculate_solar_carbon_credits(
            latitude=latitude,
            longitude=longitude,
            image_path=application.geotag_photo_path
        )
        
        if result.get('success'):
            # Store results
            application.carbon_credits_data = json.dumps(result['data'])
            application.carbon_coins_issued = result['data']['carbon_coins']['annual']
            application.calculation_date = datetime.now()
            self.db.commit()
        
        return result
        
    except Exception as e:
        print(f"Error calculating carbon credits: {e}")
        return {
            'success': False,
            'error': str(e)
        }