# Forestation API Implementation

## 🌲 Complete Forestation API System

This document outlines the comprehensive forestation API implementation that mirrors the solar panel system with three main components:

1. **Form Data API** - Handle forestation application submissions
2. **Analysis Data API** - Store and retrieve forest analysis results  
3. **Minted Coins API** - Direct coin minting and retrieval

---

## 📋 API Endpoints Overview

### 1. Form Data Endpoints

#### **POST** `/api/v1/forestation/applications`
Create a new forestation application.

**Parameters:**
- `full_name` (string, required): Full name of the applicant
- `aadhar_card` (string, required): Aadhar card number
- `ownership_document` (file, optional): Property ownership document
- `geotag_photo` (file, optional): Geotagged photo with location data

**Response:**
```json
{
  "id": 1,
  "full_name": "John Forest Owner",
  "aadhar_card": "1234 5678 9012",
  "status": "pending",
  "created_at": "2024-01-15T10:30:00",
  "ownership_document_url": "uploads/forestation/documents/...",
  "geotag_photo_url": "uploads/forestation/photos/..."
}
```

#### **GET** `/api/v1/forestation/applications`
Get user's forestation applications with pagination.

**Query Parameters:**
- `skip` (int, optional): Pagination offset (default: 0)
- `limit` (int, optional): Number of items per page (default: 100)

---

### 2. Analysis Data Endpoints

#### **POST** `/api/v1/forestation/analysis`
Save forestation analysis results to database.

**Parameters:**
- `application_id` (int, required): Application ID
- `latitude` (float, required): Latitude coordinate
- `longitude` (float, required): Longitude coordinate
- `area_hectares` (float, required): Forest area in hectares
- `co2_sequestration_rate` (float, required): CO2 sequestration rate per hectare/year
- `annual_carbon_credits` (float, required): Annual carbon credits generated
- `forest_type` (string, required): Type of forest (tropical/temperate/boreal)
- `tree_count` (int, required): Number of trees counted
- `vegetation_coverage` (float, required): Vegetation coverage percentage

**Response:**
```json
{
  "success": true,
  "analysis_id": 1,
  "application_id": 1,
  "message": "Forestation analysis results saved successfully",
  "data": {
    "id": 1,
    "application_id": 1,
    "latitude": 13.0827,
    "longitude": 77.5877,
    "area_hectares": 5.0,
    "co2_sequestration_rate": 2.5,
    "annual_carbon_credits": 12.5,
    "forest_type": "tropical",
    "tree_count": 150,
    "vegetation_coverage": 85.5
  }
}
```

#### **GET** `/api/v1/forestation/analysis`
Get forestation analysis results with optional filtering.

**Query Parameters:**
- `application_id` (int, optional): Filter by application ID
- `skip` (int, optional): Pagination offset (default: 0)
- `limit` (int, optional): Number of items per page (default: 100)

**Response:**
```json
{
  "success": true,
  "analysis_results": [
    {
      "id": 1,
      "application_id": 1,
      "latitude": 13.0827,
      "longitude": 77.5877,
      "area_hectares": 5.0,
      "co2_sequestration_rate": 2.5,
      "annual_carbon_credits": 12.5,
      "forest_type": "tropical",
      "tree_count": 150,
      "vegetation_coverage": 85.5
    }
  ],
  "total": 1,
  "filters_applied": {
    "application_id": null,
    "skip": 0,
    "limit": 100
  },
  "message": "Retrieved 1 forestation analysis results"
}
```

---

### 3. Minted Coins Endpoints

#### **POST** `/api/v1/forestation/mint-coin`
Mint forestation carbon coins directly.

**Parameters:**
- `name` (string, required): Name of the coin/project
- `credits` (float, required): Number of carbon credits/coins
- `source` (string, optional): Source type (default: "forestation")
- `description` (string, optional): Optional description

**Response:**
```json
{
  "success": true,
  "id": 1,
  "name": "Tropical Forest Project",
  "credits": 12.5,
  "source": "forestation",
  "description": "Carbon coins minted for Tropical Forest Project",
  "tokenized_date": "2024-01-15T10:30:00",
  "message": "Successfully minted 12.5 forestation carbon coins for Tropical Forest Project!"
}
```

#### **GET** `/api/v1/forestation/mint-coin`
Get forestation minted coin information with optional filtering.

**Query Parameters:**
- `name` (string, optional): Filter by coin name
- `source` (string, optional): Filter by source type
- `skip` (int, optional): Pagination offset (default: 0)
- `limit` (int, optional): Number of items per page (default: 100)

**Response:**
```json
{
  "success": true,
  "minted_coins": [
    {
      "id": 1,
      "name": "Tropical Forest Project",
      "credits": 12.5,
      "source": "forestation",
      "description": "Carbon coins minted for Tropical Forest Project",
      "tokenized_date": "2024-01-15T10:30:00",
      "application_id": 1
    }
  ],
  "total": 1,
  "filters_applied": {
    "name": null,
    "source": null,
    "skip": 0,
    "limit": 100
  },
  "message": "Retrieved 1 forestation minted coins"
}
```

---

## 🎯 Frontend Integration

### ForestationApiService Methods

The frontend service includes these new methods:

#### **mintCarbonCoinsDirect(coinData)**
Direct coin minting for forestation projects.

```javascript
const coinData = {
  name: "Tropical Forest Project",
  credits: 12.5,
  source: "forestation",
  description: "Carbon credits from tropical forest sequestration"
};

const result = await forestationApiService.mintCarbonCoinsDirect(coinData);
```

#### **getMintCoinInfo(options)**
Retrieve minted coins with filtering.

```javascript
const options = {
  name: "tropical",
  source: "forestation",
  skip: 0,
  limit: 10
};

const coins = await forestationApiService.getMintCoinInfo(options);
```

#### **saveAnalysisResults(analysisData)**
Save forest analysis results.

```javascript
const analysisData = {
  application_id: 1,
  latitude: 13.0827,
  longitude: 77.5877,
  area_hectares: 5.0,
  co2_sequestration_rate: 2.5,
  annual_carbon_credits: 12.5,
  forest_type: "tropical",
  tree_count: 150,
  vegetation_coverage: 85.5
};

const result = await forestationApiService.saveAnalysisResults(analysisData);
```

#### **getAnalysisResults(options)**
Retrieve analysis results with filtering.

```javascript
const options = {
  application_id: 1,
  skip: 0,
  limit: 10
};

const results = await forestationApiService.getAnalysisResults(options);
```

---

## 🧪 Testing

### Test Script Usage

Run the comprehensive test script:

```bash
cd EcoSwap
node test_forestation_api.js
```

### Manual Testing Examples

#### Test Form Data Submission:
```bash
curl -X POST "http://localhost:8000/api/v1/forestation/applications" \
  -F "full_name=John Forest Owner" \
  -F "aadhar_card=1234 5678 9012"
```

#### Test Analysis Data Save:
```bash
curl -X POST "http://localhost:8000/api/v1/forestation/analysis" \
  -F "application_id=1" \
  -F "latitude=13.0827" \
  -F "longitude=77.5877" \
  -F "area_hectares=5.0" \
  -F "co2_sequestration_rate=2.5" \
  -F "annual_carbon_credits=12.5" \
  -F "forest_type=tropical" \
  -F "tree_count=150" \
  -F "vegetation_coverage=85.5"
```

#### Test Coin Minting:
```bash
curl -X POST "http://localhost:8000/api/v1/forestation/mint-coin" \
  -F "name=Tropical Forest Project" \
  -F "credits=12.5" \
  -F "source=forestation" \
  -F "description=Carbon credits from tropical forest"
```

#### Test Coin Retrieval:
```bash
curl "http://localhost:8000/api/v1/forestation/mint-coin?name=tropical&source=forestation&limit=5"
```

---

## 🔄 Complete Workflow

### 1. Application Submission
1. User submits forestation application via form
2. System validates and stores application data
3. Returns application ID for further processing

### 2. Analysis Processing
1. System performs forest analysis (satellite imagery, tree counting, etc.)
2. Analysis results are saved to database
3. Carbon credit calculations are performed

### 3. Coin Minting
1. Based on analysis results, carbon coins are minted
2. Coins are stored with forestation source
3. User can view minted coins and transaction history

### 4. Data Retrieval
1. Users can query their applications, analysis results, and minted coins
2. Filtering and pagination support for large datasets
3. Real-time updates on forest carbon sequestration

---

## 📊 Key Features

- ✅ **Complete CRUD operations** for all forestation data
- ✅ **Direct coin minting** with forestation source
- ✅ **Analysis data persistence** for forest monitoring
- ✅ **Advanced filtering** and pagination
- ✅ **Comprehensive error handling** with meaningful messages
- ✅ **Frontend integration** with TypeScript support
- ✅ **Testing framework** with comprehensive test coverage
- ✅ **Documentation** with examples and usage guides

---

## 🚀 Next Steps

1. **Integration Testing**: Test with real forest data
2. **Performance Optimization**: Implement caching for large datasets
3. **Real-time Updates**: Add WebSocket support for live forest monitoring
4. **Mobile Support**: Optimize for mobile forestation applications
5. **Analytics Dashboard**: Create comprehensive forest carbon analytics

The forestation API system is now fully implemented and ready for production use! 🌲✨
