# Marketplace API Documentation

## Overview

The Marketplace API provides endpoints for managing carbon credit listings in a marketplace environment. It tracks issuer information, verification status, coin issuance, and source types (forestation or solar panel projects).

## Database Schema

### MarketplaceCredit Table

| Field | Type | Description |
|-------|------|-------------|
| `id` | Integer | Primary key |
| `issuer_name` | String | Name of the credit issuer |
| `issuer_id` | Integer | Foreign key to users table |
| `coins_issued` | Float | Number of carbon coins issued |
| `issue_date` | DateTime | When the coins were issued |
| `verification_status` | Enum | pending, verified, rejected |
| `verified_at` | DateTime | When verification was completed |
| `source_type` | Enum | forestation or solar_panel |
| `source_project_id` | Integer | Reference to source project |
| `description` | String | Optional description |
| `price_per_coin` | Float | Optional price per coin |
| `created_at` | DateTime | Record creation timestamp |
| `updated_at` | DateTime | Last update timestamp |

## API Endpoints

### 1. Create Marketplace Credit
**POST** `/api/v1/marketplace/credits`

Creates a new marketplace credit entry.

**Request Body:**
```json
{
  "issuer_name": "Green Forest Co.",
  "issuer_id": 1,
  "coins_issued": 150.5,
  "source_type": "forestation",
  "source_project_id": 1,
  "description": "Reforestation project in Amazon",
  "price_per_coin": 25.0
}
```

**Response:**
```json
{
  "id": 1,
  "issuer_name": "Green Forest Co.",
  "issuer_id": 1,
  "coins_issued": 150.5,
  "issue_date": "2024-01-15T10:30:00Z",
  "verification_status": "pending",
  "verified_at": null,
  "source_type": "forestation",
  "source_project_id": 1,
  "description": "Reforestation project in Amazon",
  "price_per_coin": 25.0,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

### 2. List Marketplace Credits
**GET** `/api/v1/marketplace/credits`

Retrieves marketplace credits with optional filtering and pagination.

**Query Parameters:**
- `page` (int): Page number (default: 1)
- `size` (int): Page size (default: 10, max: 100)
- `verification_status` (string): Filter by status (pending, verified, rejected)
- `source_type` (string): Filter by source (forestation, solar_panel)
- `issuer_id` (int): Filter by issuer ID

**Example:**
```
GET /api/v1/marketplace/credits?page=1&size=20&verification_status=verified&source_type=forestation
```

**Response:**
```json
{
  "credits": [...],
  "total": 50,
  "page": 1,
  "size": 20
}
```

### 3. Get Specific Credit
**GET** `/api/v1/marketplace/credits/{credit_id}`

Retrieves a specific marketplace credit by ID.

### 4. Update Marketplace Credit
**PUT** `/api/v1/marketplace/credits/{credit_id}`

Updates a marketplace credit (typically for verification).

**Request Body:**
```json
{
  "verification_status": "verified",
  "description": "Updated description",
  "price_per_coin": 30.0
}
```

### 5. Delete Marketplace Credit
**DELETE** `/api/v1/marketplace/credits/{credit_id}`

Deletes a marketplace credit.

### 6. Get Verified Credits
**GET** `/api/v1/marketplace/verified`

Retrieves all verified credits suitable for marketplace display.

### 7. Get Credits by Source Type
**GET** `/api/v1/marketplace/by-source/{source_type}`

Retrieves verified credits filtered by source type.

**Path Parameters:**
- `source_type`: Either "forestation" or "solar_panel"

### 8. Get Issuer Statistics
**GET** `/api/v1/marketplace/issuer/{issuer_id}/stats`

Retrieves statistics for a specific issuer.

**Response:**
```json
{
  "total_credits": 10,
  "verified_credits": 8,
  "total_coins_issued": 1200.5,
  "verification_rate": 80.0
}
```

### 9. Get Marketplace Summary
**GET** `/api/v1/marketplace/summary`

Retrieves overall marketplace statistics.

**Response:**
```json
{
  "total_verified_credits": 25,
  "total_coins_issued": 3500.75,
  "forestation_coins": 2000.25,
  "solar_panel_coins": 1500.50,
  "unique_issuers": 12,
  "average_coins_per_credit": 140.03
}
```

## Usage Examples

### Creating Credits from Forestation Projects
```python
import requests

# Create a forestation credit
forestation_credit = {
    "issuer_name": "Eco Forest Ltd.",
    "issuer_id": 1,
    "coins_issued": 200.0,
    "source_type": "forestation",
    "source_project_id": 1,
    "description": "Amazon reforestation project",
    "price_per_coin": 25.0
}

response = requests.post("http://localhost:8000/api/v1/marketplace/credits", json=forestation_credit)
```

### Creating Credits from Solar Panel Projects
```python
# Create a solar panel credit
solar_credit = {
    "issuer_name": "Solar Solutions Inc.",
    "issuer_id": 2,
    "coins_issued": 150.5,
    "source_type": "solar_panel",
    "source_project_id": 2,
    "description": "Residential solar installation",
    "price_per_coin": 30.0
}

response = requests.post("http://localhost:8000/api/v1/marketplace/credits", json=solar_credit)
```

### Verifying Credits
```python
# Verify a credit
verification_data = {
    "verification_status": "verified"
}

response = requests.put("http://localhost:8000/api/v1/marketplace/credits/1", json=verification_data)
```

### Marketplace Display
```python
# Get verified credits for marketplace display
response = requests.get("http://localhost:8000/api/v1/marketplace/verified")
verified_credits = response.json()

# Get forestation credits only
response = requests.get("http://localhost:8000/api/v1/marketplace/by-source/forestation")
forestation_credits = response.json()

# Get marketplace summary
response = requests.get("http://localhost:8000/api/v1/marketplace/summary")
summary = response.json()
```

## Testing

Run the test script to verify the API functionality:

```bash
python test_marketplace.py
```

Make sure the FastAPI server is running:

```bash
uvicorn app.main:app --reload
```

## Integration with Existing Systems

The marketplace API integrates with:
- **User Management**: Links to existing user accounts
- **Forestation Applications**: References forestation projects
- **Solar Panel Applications**: References solar panel projects
- **Carbon Credit System**: Extends the existing credit system

## Security Considerations

- All endpoints require proper authentication (implement as needed)
- Verification status changes should be restricted to authorized users
- Input validation is handled by Pydantic schemas
- SQL injection protection via SQLAlchemy ORM
