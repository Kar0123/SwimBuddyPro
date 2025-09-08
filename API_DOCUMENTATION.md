# 🏊‍♀️ SwimBuddy Pro - API Documentation

## FastAPI Backend API Reference

SwimBuddy Pro provides a comprehensive RESTful API for swimming performance data management and analytics.

**Base URL**: `http://localhost:8000`  
**API Version**: 1.2.0  
**Documentation**: Available at `/docs` (Swagger UI) and `/redoc`

---

## 🔗 API Endpoints Overview

### Core Endpoints
- **GET** `/health` - System health check
- **GET** `/api/swimmers/` - List all swimmers
- **GET** `/api/swimmers/{tiref}` - Get swimmer information
- **GET** `/api/swimmers/{tiref}/complete` - Get complete swimmer data
- **POST** `/api/scraper/scrape/{tiref}` - Scrape swimmer data
- **POST** `/api/scraper/refresh/{tiref}` - Force refresh swimmer data

### Data Endpoints
- **GET** `/api/swimmers/{tiref}/records` - Get swim records
- **GET** `/api/swimmers/{tiref}/personal-bests` - Get personal bests
- **GET** `/api/swimmers/{tiref}/personal-bests-cards` - Get formatted PB cards
- **GET** `/api/swimmers/{tiref}/cache-info` - Get cache information

### Management Endpoints
- **DELETE** `/api/swimmers/{tiref}` - Delete swimmer data
- **POST** `/api/swimmers/{tiref}/update-personal-bests` - Recalculate PBs

---

## 📊 Data Models

### SwimmerData
```typescript
interface SwimmerData {
  tiref: string              // Swimmer membership ID
  name: string               // Swimmer full name
  club?: string              // Swimming club name
  age?: number               // Current age
  ageGroup?: string          // Competition age group
  records: SwimRecord[]      // All race records
  personalBests: PersonalBest[]  // Personal best times
  stats: SwimmerStats        // Calculated statistics
  lastUpdated: string        // ISO timestamp
  cacheExpiry: string        // Cache expiration time
}
```

### SwimRecord
```typescript
interface SwimRecord {
  id: string                 // Unique record identifier
  stroke: 'Freestyle' | 'Backstroke' | 'Breaststroke' | 'Butterfly' | 'Individual Medley' | 'Relay'
  distance: number           // Distance in meters
  poolType: 'SC' | 'LC'      // Short Course (25m) or Long Course (50m)
  time: string               // Time in MM:SS.ss format
  timeInSeconds: number      // Time converted to seconds
  date: string               // Competition date (ISO format)
  meet: string               // Competition name
  venue: string              // Competition venue
  roundType: 'Finals' | 'Heats' | 'Semi-Finals' | 'Time Trial' | 'Qualifying'
  waPoints: number           // World Aquatics points
  rank?: number              // Final ranking in event
  heat?: number              // Heat number
  lane?: number              // Lane number
  isPersonalBest: boolean    // Whether this is a PB
  improvementFromPrevious?: number  // Seconds improved from previous race
  season: string             // Competition season (e.g., "2024-25")
}
```

### PersonalBest
```typescript
interface PersonalBest {
  stroke: string             // Swimming stroke
  distance: number           // Distance in meters
  poolType: 'SC' | 'LC'      // Pool type
  bestTime: string           // Best time formatted
  bestTimeSeconds: number    // Best time in seconds
  waPoints: number           // WA points for best time
  date: string               // Date achieved
  meet: string               // Meet where achieved
  venue: string              // Venue where achieved
  improvementHistory: {      // Historical improvements
    previousBest: string
    improvement: number
    date: string
  }[]
}
```

---

## 🎯 Core API Endpoints

### Health Check
```http
GET /health
```

**Response**:
```json
{
  "status": "healthy",
  "version": "1.2.0",
  "timestamp": "2025-09-08T10:30:00Z"
}
```

### List All Swimmers
```http
GET /api/swimmers/
```

**Response**:
```json
{
  "swimmers": ["1507205", "1234567", "9876543"],
  "total": 3
}
```

### Get Swimmer Information
```http
GET /api/swimmers/{tiref}
```

**Parameters**:
- `tiref` (path): Swimmer membership ID

**Response**:
```json
{
  "tiref": "1507205",
  "name": "John Smith",
  "club": "Example Swimming Club",
  "ageGroup": "Youth",
  "lastUpdated": "2025-09-08T10:30:00Z"
}
```

### Get Complete Swimmer Data
```http
GET /api/swimmers/{tiref}/complete
```

**Parameters**:
- `tiref` (path): Swimmer membership ID

**Response**: Full `SwimmerData` object with all records, personal bests, and statistics.

```json
{
  "tiref": "1507205",
  "name": "John Smith",
  "club": "Example Swimming Club",
  "records": [
    {
      "id": "record_123",
      "stroke": "Freestyle",
      "distance": 50,
      "poolType": "LC",
      "time": "25.34",
      "timeInSeconds": 25.34,
      "date": "2025-08-15T00:00:00Z",
      "meet": "Summer Championships",
      "venue": "Aquatic Centre",
      "roundType": "Finals",
      "waPoints": 678,
      "rank": 2,
      "isPersonalBest": true,
      "season": "2024-25"
    }
  ],
  "personalBests": [...],
  "stats": {...},
  "lastUpdated": "2025-09-08T10:30:00Z"
}
```

---

## 🔄 Data Scraping Endpoints

### Scrape Swimmer Data
```http
POST /api/scraper/scrape/{tiref}
```

**Parameters**:
- `tiref` (path): Swimmer membership ID

**Description**: Scrapes fresh data from external sources. Respects cache TTL.

**Response**:
```json
{
  "success": true,
  "message": "Data scraped successfully",
  "recordsFound": 45,
  "personalBests": 12,
  "lastUpdated": "2025-09-08T10:30:00Z"
}
```

### Force Refresh Data
```http
POST /api/scraper/refresh/{tiref}
```

**Parameters**:
- `tiref` (path): Swimmer membership ID

**Description**: Forces fresh data scraping, ignoring cache.

**Response**:
```json
{
  "success": true,
  "message": "Data refreshed successfully",
  "recordsFound": 47,
  "personalBests": 13,
  "cacheCleared": true,
  "lastUpdated": "2025-09-08T10:30:00Z"
}
```

---

## 📈 Analytics Endpoints

### Get Swim Records
```http
GET /api/swimmers/{tiref}/records?limit=50
```

**Parameters**:
- `tiref` (path): Swimmer membership ID
- `limit` (query, optional): Maximum number of records to return

**Response**:
```json
{
  "tiref": "1507205",
  "totalRecords": 156,
  "records": [
    {
      "id": "record_123",
      "stroke": "Freestyle",
      "distance": 50,
      "time": "25.34",
      "date": "2025-08-15T00:00:00Z",
      "meet": "Summer Championships",
      "waPoints": 678
    }
  ]
}
```

### Get Personal Bests
```http
GET /api/swimmers/{tiref}/personal-bests
```

**Response**:
```json
{
  "tiref": "1507205",
  "totalPersonalBests": 12,
  "personalBests": [
    {
      "stroke": "Freestyle",
      "distance": 50,
      "poolType": "LC",
      "bestTime": "25.34",
      "bestTimeSeconds": 25.34,
      "waPoints": 678,
      "date": "2025-08-15T00:00:00Z",
      "meet": "Summer Championships"
    }
  ]
}
```

### Get Personal Bests Cards
```http
GET /api/swimmers/{tiref}/personal-bests-cards
```

**Description**: Returns formatted personal bests data optimized for card display with LC/SC comparisons.

**Response**:
```json
{
  "tiref": "1507205",
  "swimmerName": "John Smith",
  "personalBests": [
    {
      "eventName": "50 Freestyle",
      "stroke": "Freestyle",
      "distance": 50,
      "strokeColor": "#3B82F6",
      "strokeIcon": "🏊",
      "primaryBest": {
        "time": "25.34",
        "timeSeconds": 25.34,
        "poolType": "LC",
        "date": "2025-08-15T00:00:00Z",
        "meetName": "Summer Championships",
        "venue": "Aquatic Centre",
        "waPoints": 678,
        "roundType": "Finals"
      },
      "secondaryBest": {
        "time": "24.89",
        "timeSeconds": 24.89,
        "poolType": "SC",
        "date": "2025-07-20T00:00:00Z",
        "meetName": "Winter Meet",
        "waPoints": 692
      },
      "improvement": {
        "recentImprovement": 0.45,
        "seasonImprovement": 1.23,
        "allTimeImprovement": 2.67,
        "trend": "improving"
      },
      "totalRaces": 8,
      "seasonsCompeted": ["2024-25", "2023-24"]
    }
  ],
  "lastUpdated": "2025-09-08T10:30:00Z"
}
```

---

## 🗄️ Cache Management Endpoints

### Get Cache Information
```http
GET /api/swimmers/{tiref}/cache-info
```

**Response**:
```json
{
  "tiref": "1507205",
  "lastScraped": "2025-09-08T08:00:00Z",
  "scrapeStatus": "success",
  "recordCount": 156,
  "cacheValid": true,
  "expiresAt": "2025-09-09T08:00:00Z"
}
```

---

## 🛠️ Management Endpoints

### Delete Swimmer Data
```http
DELETE /api/swimmers/{tiref}
```

**Description**: Removes all data for a swimmer from the database.

**Response**:
```json
{
  "message": "Swimmer 1507205 and all associated data deleted successfully",
  "tiref": "1507205"
}
```

### Update Personal Bests
```http
POST /api/swimmers/{tiref}/update-personal-bests
```

**Description**: Recalculates personal bests from existing race records.

**Response**:
```json
{
  "message": "Updated 12 personal bests for swimmer 1507205",
  "tiref": "1507205",
  "updatedCount": 12
}
```

---

## ⚠️ Error Responses

All endpoints return consistent error responses:

### 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid tiref format",
  "timestamp": "2025-09-08T10:30:00Z"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Swimmer with tiref 1507205 not found",
  "timestamp": "2025-09-08T10:30:00Z"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to retrieve swimmer data",
  "timestamp": "2025-09-08T10:30:00Z"
}
```

### 503 Service Unavailable
```json
{
  "success": false,
  "message": "Scraping service temporarily unavailable",
  "retryAfter": 300,
  "timestamp": "2025-09-08T10:30:00Z"
}
```

---

## 🔒 Authentication & Security

### Local Development
- No authentication required for local development
- CORS enabled for `http://localhost:5173` and `http://localhost:5180`

### Production Deployment
- Configure CORS for your domain
- Consider API key authentication for multi-user deployments
- Rate limiting recommended for scraping endpoints

---

## 📝 Rate Limiting

### Scraping Endpoints
- **Scrape/Refresh**: 1 request per 30 seconds per tiref
- **Bulk Operations**: 5 requests per minute

### Data Retrieval Endpoints
- **Get Operations**: 100 requests per minute
- **No limits on cached data retrieval**

---

## 🧪 API Testing

### Using curl
```bash
# Health check
curl http://localhost:8000/health

# Get swimmer data  
curl http://localhost:8000/api/swimmers/1507205/complete

# Scrape fresh data
curl -X POST http://localhost:8000/api/scraper/refresh/1507205
```

### Using Python requests
```python
import requests

# Get complete swimmer data
response = requests.get("http://localhost:8000/api/swimmers/1507205/complete")
swimmer_data = response.json()

# Scrape fresh data
scrape_response = requests.post("http://localhost:8000/api/scraper/refresh/1507205")
scrape_result = scrape_response.json()
```

### Using JavaScript fetch
```javascript
// Get swimmer data
const response = await fetch('http://localhost:8000/api/swimmers/1507205/complete');
const swimmerData = await response.json();

// Refresh data
const refreshResponse = await fetch('http://localhost:8000/api/scraper/refresh/1507205', {
  method: 'POST'
});
const refreshResult = await refreshResponse.json();
```

---

## 📊 API Performance

### Response Times (Typical)
- **Cached Data**: < 50ms
- **Database Queries**: < 100ms  
- **Fresh Scraping**: 2-5 seconds
- **Personal Best Calculations**: < 200ms

### Throughput
- **Concurrent Requests**: Up to 10 simultaneous requests
- **Data Processing**: 1000+ records processed per second
- **Cache Hit Ratio**: > 90% for frequently accessed swimmers

---

## 🔮 Future API Enhancements

### Planned Features
- **WebSocket Support**: Real-time data updates
- **Batch Operations**: Multi-swimmer data processing
- **Advanced Filtering**: Complex query capabilities
- **Export Endpoints**: PDF/CSV generation via API
- **Analytics Endpoints**: Advanced statistical analysis

### API Versioning
- Current: `v1` (implicit)
- Future: `/api/v2/` for breaking changes
- Backward compatibility maintained for 2+ versions

---

**Complete API documentation with interactive testing available at `/docs` when running the backend server.**
