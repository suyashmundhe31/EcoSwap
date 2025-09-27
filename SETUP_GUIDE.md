# Carbon Credit Platform - Setup Guide

## Issues Fixed

### 1. Database URL Configuration
**Problem**: You were unsure about the DATABASE_URL configuration.

**Solution**: The current SQLite configuration is correct for development:
```
DATABASE_URL=sqlite:///./carbon_credits.db
```

**For Production**: If you want to use PostgreSQL instead:
```
DATABASE_URL=postgresql://username:password@localhost:5432/carbon_credits_db
```

### 2. Geotag Extraction Issue
**Problem**: The models were not extracting real GPS coordinates from uploaded photos - they were using mock coordinates.

**Solution**: 
- Created a new `GeotagExtractor` service (`app/services/geotag_extractor.py`) that uses the Pillow library to extract EXIF GPS data from images
- Updated both `ForestationService` and `SolarPanelService` to use real geotag extraction instead of mock coordinates
- Added Pillow dependency to `requirements.txt`

### 3. Map Display Issue
**Problem**: The frontend was showing placeholder maps instead of real interactive maps.

**Solution**:
- Created a new `MapComponent` (`src/components/maps/MapComponent.jsx`) using Leaflet for interactive maps
- Updated both `ForestationForm.jsx` and `SolarPanelForm.jsx` to display real interactive street view and satellite view maps
- Maps now show actual GPS coordinates extracted from uploaded photos

## Setup Instructions

### Backend Setup
1. Install dependencies:
   ```bash
   cd EcoSwap/carbon_credit_platform
   pip install -r requirements.txt
   ```

2. Set up environment variables (create `.env` file):
   ```
   DATABASE_URL=sqlite:///./carbon_credits.db
   DEBUG=True
   SECRET_KEY=your-secret-key-here
   ```

3. Run database migrations:
   ```bash
   alembic upgrade head
   ```

4. Start the backend server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup
1. Install dependencies:
   ```bash
   cd EcoSwap/frontend/EcoSWAP
   npm install
   ```

2. Start the frontend development server:
   ```bash
   npm run dev
   ```

## How It Works Now

### Geotag Extraction Process
1. User uploads a geotagged photo
2. The `GeotagExtractor` service extracts GPS coordinates from the image's EXIF data
3. Coordinates are validated and stored in the database
4. Frontend displays interactive maps using the extracted coordinates

### Map Display
- **Street View**: Shows OpenStreetMap tiles with the exact location marked
- **Satellite View**: Shows satellite imagery from ESRI World Imagery
- Both maps are interactive and show the precise GPS coordinates extracted from the uploaded photo

## Testing the Geotag Feature

To test the geotag extraction:
1. Take a photo with your phone's location services enabled
2. Upload the photo through the forestation or solar panel form
3. The system will extract the GPS coordinates and display them on interactive maps

## Troubleshooting

### If geotag extraction fails:
- Ensure the uploaded image has GPS data in its EXIF
- Check that location services were enabled when the photo was taken
- Verify that the image format supports EXIF data (JPEG, TIFF)

### If maps don't display:
- Check browser console for JavaScript errors
- Ensure Leaflet CSS is properly loaded
- Verify that coordinates are valid (latitude: -90 to 90, longitude: -180 to 180)

## Next Steps

The platform now properly:
- ✅ Extracts real GPS coordinates from uploaded photos
- ✅ Displays interactive street view and satellite view maps
- ✅ Uses correct database configuration
- ✅ Validates geotagged images before processing

Your carbon credit platform is now ready for testing with real geotagged photos!
