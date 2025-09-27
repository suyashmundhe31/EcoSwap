# Forestation Mint-Coin API Endpoints

## 🌲 Complete Forestation Carbon Coin System

This document outlines the comprehensive forestation mint-coin API system with both POST and GET endpoints.

---

## 📋 API Endpoints Overview

### 1. Direct Mint-Coin Endpoints

#### **POST** `/api/v1/forestation/mint-coin`
Mint forestation carbon coins directly without requiring an application.

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
  "name": "Test Forest Project",
  "credits": 5.5,
  "source": "forestation",
  "description": "Test minting forestation coins",
  "tokenized_date": "2024-01-15T10:30:00",
  "message": "Successfully minted 5.5 forestation carbon coins for Test Forest Project!"
}
```

#### **GET** `/api/v1/forestation/mint-coin`
Retrieve all forestation minted coin information with optional filtering.

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
      "name": "Test Forest Project",
      "credits": 5.5,
      "source": "forestation",
      "description": "Test minting forestation coins",
      "tokenized_date": "2024-01-15T10:30:00",
      "application_id": 1,
      "price_per_coin": null,
      "issuer_id": 1
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

### 2. Application-Specific Mint-Coins Endpoint

#### **POST** `/api/v1/forestation/applications/{application_id}/mint-coins`
Mint carbon coins for a specific forestation application.

**Parameters:**
- `issuer_name` (string, required): Name of the issuer
- `description` (string, optional): Optional description
- `price_per_coin` (float, optional): Price per coin

**Response:**
```json
{
  "success": true,
  "carbon_credit_calculations": {
    "annual_carbon_credits": 3.5,
    "annual_carbon_coins": 3.5,
    "co2_sequestration_rate": 3.5,
    "area_hectares": 1.0,
    "calculation_method": "Simplified IPCC Guidelines",
    "conversion_rate": "1 credit = 1 coin (1 ton CO2)",
    "forest_analysis": {
      "latitude": 13.0827,
      "longitude": 77.5877,
      "forest_type": "tropical",
      "tree_count": 30,
      "vegetation_coverage": 85.0
    }
  },
  "marketplace_credit_id": 1,
  "message": "Successfully calculated 3 carbon credits!"
}
```

---

## 🎯 Frontend Integration

### ForestationApiService Methods

#### **mintCarbonCoinsDirect(coinData)**
Direct coin minting for forestation projects.

```javascript
const coinData = {
  name: "Test Forest Project",
  credits: 5.5,
  source: "forestation",
  description: "Test minting forestation coins"
};

const result = await forestationApiService.mintCarbonCoinsDirect(coinData);
```

#### **getMintCoinInfo(options)**
Retrieve minted coins with filtering.

```javascript
const options = {
  name: "test",
  source: "forestation",
  skip: 0,
  limit: 10
};

const coins = await forestationApiService.getMintCoinInfo(options);
```

#### **mintCarbonCoins(applicationId, issuerName, description)**
Application-specific coin minting.

```javascript
const result = await forestationApiService.mintCarbonCoins(
  17, 
  "Test User", 
  "Application-specific minting"
);
```

---

## 🧪 Testing

### Test Script Usage

Run the comprehensive test script:

```bash
cd EcoSwap
python test_forestation_mint_endpoints.py
```

### Manual Testing Examples

#### Test Direct Minting:
```bash
curl -X POST "http://localhost:8000/api/v1/forestation/mint-coin" \
  -F "name=Test Forest Project" \
  -F "credits=5.5" \
  -F "source=forestation" \
  -F "description=Test minting"
```

#### Test Retrieving All Coins:
```bash
curl "http://localhost:8000/api/v1/forestation/mint-coin"
```

#### Test Filtered Retrieval:
```bash
curl "http://localhost:8000/api/v1/forestation/mint-coin?name=test&source=forestation&limit=5"
```

#### Test Application Minting:
```bash
curl -X POST "http://localhost:8000/api/v1/forestation/applications/17/mint-coins" \
  -F "issuer_name=Test User" \
  -F "description=Application minting" \
  -F "price_per_coin=12.0"
```

---

## 🔄 Complete Workflow

### 1. Direct Minting
1. Use POST `/mint-coin` to mint coins directly
2. Coins are stored in marketplace credits database
3. Use GET `/mint-coin` to retrieve all minted coins

### 2. Application-Based Minting
1. Create forestation application via POST `/applications`
2. Mint coins for specific application via POST `/applications/{id}/mint-coins`
3. Retrieve application-specific coins via GET `/mint-coin`

### 3. Data Retrieval
1. Use GET `/mint-coin` to query all minted coins
2. Apply filters for specific searches
3. Use pagination for large datasets

---

## 📊 Key Features

- ✅ **Direct Minting**: Mint coins without application requirement
- ✅ **Application-Based Minting**: Mint coins for specific applications
- ✅ **Comprehensive Retrieval**: GET endpoint with filtering and pagination
- ✅ **Marketplace Integration**: All coins stored in marketplace credits database
- ✅ **Flexible Filtering**: Filter by name, source, pagination
- ✅ **Consistent Response Format**: Standardized API responses
- ✅ **Frontend Integration**: Complete API service methods
- ✅ **Testing Framework**: Comprehensive test coverage

---

## 🚀 Usage Examples

### Backend API Calls:
```bash
# Direct minting
POST /api/v1/forestation/mint-coin

# Retrieve all coins
GET /api/v1/forestation/mint-coin

# Application minting
POST /api/v1/forestation/applications/17/mint-coins

# Filtered retrieval
GET /api/v1/forestation/mint-coin?name=forest&source=forestation&limit=10
```

### Frontend Usage:
```javascript
import forestationApiService from '../services/forestationApi';

// Direct minting
const result = await forestationApiService.mintCarbonCoinsDirect({
  name: "Forest Project",
  credits: 5.5,
  source: "forestation"
});

// Retrieve coins
const coins = await forestationApiService.getMintCoinInfo({
  name: "forest",
  limit: 10
});

// Application minting
const appResult = await forestationApiService.mintCarbonCoins(
  17, 
  "User Name", 
  "Description"
);
```

The forestation mint-coin system is now complete with both POST and GET endpoints! 🌲✨
