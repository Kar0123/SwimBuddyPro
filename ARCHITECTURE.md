# 🏊‍♀️ SwimBuddy Pro - Architecture Documentation

## System Architecture Overview

SwimBuddy Pro is built as a modern, scalable desktop application using a clean separation of concerns with a React frontend, FastAPI backend, and intelligent data processing pipeline.

---

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     SwimBuddy Pro System                       │
├─────────────────────────────────────────────────────────────────┤
│                    Presentation Layer                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              React Frontend                             │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │   │
│  │  │     UI      │  │ Components  │  │   Routing   │     │   │
│  │  │  Layer      │  │   Layer     │  │    Layer    │     │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘     │   │
│  └─────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                    Business Logic Layer                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │               FastAPI Backend                           │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │   │
│  │  │     API     │  │   Domain    │  │  Service    │     │   │
│  │  │  Endpoints  │  │   Logic     │  │   Layer     │     │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘     │   │
│  └─────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                     Data Layer                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                SQLite Database                          │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │   │
│  │  │   Swimmer   │  │    Race     │  │ Personal    │     │   │
│  │  │    Data     │  │   Records   │  │   Bests     │     │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘     │   │
│  └─────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                   External Integration                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │             Web Scraping Engine                         │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │   │
│  │  │  HTTP       │  │    HTML     │  │    Data     │     │   │
│  │  │ Client      │  │   Parser    │  │ Processor   │     │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘     │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Component Architecture

### Frontend Architecture (React + TypeScript)

```
frontend/src/
├── components/                 # React Components
│   ├── SwimmerInput.tsx       # Member ID input with validation
│   ├── KidDashboard.tsx       # Main dashboard orchestrator  
│   ├── PerformanceSummaryCards.tsx    # Statistics overview
│   ├── EnhancedPerformanceChart.tsx   # Interactive charts
│   ├── PersonalBestsCards.tsx # Personal bests display
│   ├── RecentPerformanceComparison.tsx # Race analysis
│   ├── RaceHistoryTable.tsx   # Complete race records
│   ├── ErrorBoundary.tsx      # Error handling
│   └── animations/            # Loading and transitions
│       ├── SwimmingLoaders.tsx
│       └── PageTransitions.tsx
├── services/                  # External Communication
│   └── api.ts                # HTTP client and type definitions
├── theme/                     # Design System
│   └── swimming-theme.ts     # Chakra UI theme configuration
└── App.tsx                   # Main application component
```

### Backend Architecture (FastAPI + Python)

```
backend/app/
├── api/                      # API Endpoints
│   ├── swimmers.py          # Swimmer CRUD operations
│   └── scraper.py          # Data scraping endpoints
├── database/                # Data Access Layer
│   └── database.py         # SQLite operations and queries
├── models/                  # Data Models
│   └── schemas.py          # Pydantic models and validation
├── scraper/                 # Web Scraping Engine
│   └── swimming_scraper.py # Live data extraction logic
└── main.py                 # FastAPI application entry point
```

---

## 📊 Data Architecture

### Database Schema

```sql
-- Swimmer Profile Information
CREATE TABLE swimmers (
    tiref TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    club TEXT,
    age_group TEXT,
    last_updated DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Individual Race Results
CREATE TABLE swim_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tiref TEXT NOT NULL,
    stroke TEXT NOT NULL,
    distance INTEGER NOT NULL,
    pool_type TEXT NOT NULL, -- 'LC' or 'SC'
    time TEXT NOT NULL,
    time_seconds REAL,
    meet_date DATE,
    meet_name TEXT,
    venue TEXT,
    round_type TEXT,
    wa_points INTEGER,
    ranking INTEGER,
    season TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tiref) REFERENCES swimmers (tiref)
);

-- Calculated Personal Bests
CREATE TABLE personal_bests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tiref TEXT NOT NULL,
    stroke TEXT NOT NULL,
    distance INTEGER NOT NULL,
    pool_type TEXT NOT NULL,
    best_time TEXT NOT NULL,
    best_time_seconds REAL,
    meet_date DATE,
    meet_name TEXT,
    venue TEXT,
    wa_points INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tiref) REFERENCES swimmers (tiref),
    UNIQUE (tiref, stroke, distance, pool_type)
);

-- Cache Management
CREATE TABLE cache_metadata (
    tiref TEXT PRIMARY KEY,
    last_scraped DATETIME,
    scrape_status TEXT,
    record_count INTEGER,
    error_message TEXT,
    FOREIGN KEY (tiref) REFERENCES swimmers (tiref)
);
```

### Data Flow Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   External      │    │    Scraping     │    │    Database     │
│   Data Source   │───▶│    Engine       │───▶│    Storage      │
│                 │    │                 │    │                 │
│ swimmingresults │    │ • HTTP Client   │    │ • SQLite        │
│ .org            │    │ • HTML Parser   │    │ • Normalized    │
│                 │    │ • Data Extract  │    │ • Indexed       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                ▲                       │
                                │                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   FastAPI       │    │   Business      │
│   Components    │◀───│   Endpoints     │◀───│   Logic         │
│                 │    │                 │    │                 │
│ • React UI      │    │ • REST API      │    │ • PB Calculate  │
│ • Charts        │    │ • Validation    │    │ • Statistics    │
│ • Tables        │    │ • Serialization │    │ • Analytics     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 🔄 Request Flow Architecture

### 1. Data Retrieval Flow

```
User Input (TIREF) 
    │
    ▼
[SwimmerInput Component]
    │
    ▼ 
[API Service Layer]
    │
    ▼
[FastAPI Backend]
    │
    ▼
[Check Database Cache]
    │
    ├─── Cache Hit ────▶ [Return Cached Data]
    │                        │
    └─── Cache Miss ───▶ [Trigger Web Scraping]
                             │
                             ▼
                        [Swimming Scraper]
                             │
                             ▼
                        [External Website]
                             │
                             ▼
                        [Parse & Store Data]
                             │
                             ▼
                        [Return Fresh Data]
                             │
                             ▼
[Dashboard Components] ◀─────┘
    │
    ▼
[User Interface Updates]
```

### 2. Real-Time Analytics Flow

```
[Raw Race Data]
    │
    ▼
[Data Processor]
    │
    ├─── Personal Best Detection
    │        │
    │        ▼
    │   [Compare Times by Event]
    │        │
    │        ▼
    │   [Update PB Records]
    │
    ├─── Performance Analysis
    │        │
    │        ▼
    │   [Trend Calculation]
    │        │
    │        ▼
    │   [Improvement Indicators]
    │
    └─── Statistical Computation
             │
             ▼
         [WA Points Calculation]
             │
             ▼
         [Season Statistics]
             │
             ▼
    [Analytics Dashboard]
```

---

## 🏗️ Technology Stack Deep Dive

### Frontend Technology Choices

#### **React 18 + TypeScript**
```typescript
// Component Structure Example
interface SwimmerDashboardProps {
  swimmer: SwimmerData | null
  isLoading: boolean
}

const SwimmerDashboard: React.FC<SwimmerDashboardProps> = ({ 
  swimmer, 
  isLoading 
}) => {
  // Type-safe component implementation
  const [selectedEvent, setSelectedEvent] = useState<string>('')
  
  const performanceData = useMemo(() => 
    processSwimmerRecords(swimmer?.records || []), 
    [swimmer?.records]
  )
  
  return (
    <Dashboard>
      <PerformanceCharts data={performanceData} />
      <StatsSummary swimmer={swimmer} />
    </Dashboard>
  )
}
```

#### **Chakra UI Design System**
```typescript
// Custom Theme Implementation
export const swimmingTheme = extendTheme({
  colors: {
    turquoise: {
      50: '#E6FFFA',
      500: '#38B2AC',
      600: '#319795',
    },
    seafoam: {
      50: '#F0FDF9',
      500: '#10B981',
    }
  },
  components: {
    Card: {
      variants: {
        glassmorphism: {
          bg: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }
      }
    }
  }
})
```

### Backend Technology Choices

#### **FastAPI Framework**
```python
# API Endpoint Example
@router.get("/{tiref}/complete", response_model=CompleteSwimmerData)
async def get_complete_swimmer_data(tiref: str):
    """
    Get comprehensive swimmer data with intelligent caching
    """
    # Check cache first
    cached_data = await cache_service.get_swimmer_data(tiref)
    if cached_data and not cache_service.is_expired(cached_data):
        return cached_data
    
    # Fetch fresh data if needed
    fresh_data = await scraper_service.scrape_swimmer(tiref)
    await cache_service.store_swimmer_data(tiref, fresh_data)
    
    return fresh_data
```

#### **SQLite with Async Support**
```python
# Database Layer Example  
class SwimmerDatabase:
    def __init__(self, db_path: str):
        self.db_path = db_path
        self.init_tables()
    
    async def get_swimmer_records(self, tiref: str) -> List[SwimRecord]:
        """Optimized query with indexing"""
        query = """
        SELECT * FROM swim_records 
        WHERE tiref = ? 
        ORDER BY meet_date DESC, time_seconds ASC
        """
        
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            async with db.execute(query, (tiref,)) as cursor:
                return [SwimRecord(**row) async for row in cursor]
```

---

## 🔧 Integration Architecture

### Web Scraping Engine

```python
class IntelligentScraper:
    """
    Multi-strategy scraping with error recovery
    """
    
    def __init__(self):
        self.session = aiohttp.ClientSession()
        self.user_agent = UserAgent()
        self.retry_config = ExponentialBackoff(
            initial_delay=1.0,
            max_delay=30.0,
            multiplier=2.0
        )
    
    async def scrape_swimmer_data(self, tiref: str) -> SwimmerData:
        """
        Intelligent multi-source data extraction
        """
        strategies = [
            self._scrape_primary_source,
            self._scrape_fallback_source,
            self._scrape_cached_source
        ]
        
        for strategy in strategies:
            try:
                return await self._execute_with_retry(strategy, tiref)
            except ScrapingException as e:
                logger.warning(f"Strategy failed: {e}")
                continue
        
        raise ScrapingException("All strategies exhausted")
```

### API Design Patterns

```python
# RESTful Resource Design
@app.get("/api/swimmers/{tiref}")           # Get swimmer info
@app.get("/api/swimmers/{tiref}/records")   # Get race records
@app.get("/api/swimmers/{tiref}/personal-bests")  # Get PB data
@app.post("/api/scraper/refresh/{tiref}")   # Force data refresh

# Consistent Response Format
class APIResponse(BaseModel):
    success: bool
    data: Optional[Any] = None
    message: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.now)
```

---

## 🚀 Performance Architecture

### Caching Strategy

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Browser       │    │   Backend       │    │   Database      │
│   Memory        │    │   Memory        │    │   Persistence   │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • Component     │    │ • Response      │    │ • Data Cache    │
│   State         │    │   Cache         │    │ • Query Results │
│ • Query Cache   │    │ • Session       │    │ • Metadata      │
│ • UI State      │    │   Storage       │    │ • Indexes       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
      │                         │                         │
      │◀────── API Calls ──────▶│◀───── SQL Queries ────▶│
      │                         │                         │
   TTL: 5min               TTL: 1hour               TTL: 24hour
```

### Database Optimization

```sql
-- Performance Indexes
CREATE INDEX idx_swim_records_tiref ON swim_records(tiref);
CREATE INDEX idx_swim_records_date ON swim_records(meet_date DESC);
CREATE INDEX idx_swim_records_event ON swim_records(stroke, distance, pool_type);
CREATE INDEX idx_personal_bests_lookup ON personal_bests(tiref, stroke, distance);

-- Query Optimization Example
EXPLAIN QUERY PLAN
SELECT r.*, pb.best_time
FROM swim_records r
LEFT JOIN personal_bests pb ON (
    r.tiref = pb.tiref AND 
    r.stroke = pb.stroke AND 
    r.distance = pb.distance AND
    r.pool_type = pb.pool_type
)
WHERE r.tiref = ?
ORDER BY r.meet_date DESC
LIMIT 50;
```

---

## 🔒 Security Architecture

### Data Protection Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    Security Layers                          │
├─────────────────────────────────────────────────────────────┤
│  Input Validation                                           │
│  ├── Frontend: TypeScript types + form validation          │
│  ├── Backend: Pydantic models + sanitization              │
│  └── Database: Parameterized queries + constraints         │
├─────────────────────────────────────────────────────────────┤
│  Authentication & Authorization                             │
│  ├── Local-only: No external auth required                │
│  ├── File System: Proper permissions on data files        │
│  └── Network: CORS protection for API endpoints           │
├─────────────────────────────────────────────────────────────┤
│  Data Privacy                                              │
│  ├── Local Storage: All data remains on user device       │
│  ├── No Telemetry: No usage tracking or data collection   │
│  └── Scraping Ethics: Rate limiting and respectful access │
└─────────────────────────────────────────────────────────────┘
```

### Error Handling Architecture

```typescript
// Comprehensive Error Boundaries
class SwimmingErrorBoundary extends React.Component {
  static getDerivedStateFromError(error: Error): ErrorState {
    return {
      hasError: true,
      error: error,
      errorInfo: this.categorizeError(error)
    }
  }
  
  private static categorizeError(error: Error): ErrorCategory {
    if (error.message.includes('Network')) return 'NETWORK_ERROR'
    if (error.message.includes('Scraping')) return 'DATA_ERROR'  
    if (error.message.includes('Database')) return 'STORAGE_ERROR'
    return 'UNKNOWN_ERROR'
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorRecoveryUI error={this.state} />
    }
    return this.props.children
  }
}
```

---

## 📈 Scalability Architecture

### Horizontal Scaling Options

```
┌─────────────────────────────────────────────────────────────┐
│                    Scaling Strategy                         │
├─────────────────────────────────────────────────────────────┤
│  Current: Single-User Desktop                              │
│  ├── SQLite database                                       │
│  ├── Local file storage                                    │
│  └── In-process backend                                    │
├─────────────────────────────────────────────────────────────┤
│  Phase 1: Multi-User Local Network                        │
│  ├── Shared database server                               │
│  ├── REST API server                                      │
│  └── Web-based frontend                                   │
├─────────────────────────────────────────────────────────────┤
│  Phase 2: Cloud Deployment                                │
│  ├── PostgreSQL/MySQL database                            │
│  ├── Container orchestration                              │
│  └── CDN for static assets                                │
├─────────────────────────────────────────────────────────────┤
│  Phase 3: Enterprise Scale                                │
│  ├── Microservices architecture                           │
│  ├── Event-driven updates                                 │
│  └── Real-time data streaming                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Deployment Architecture

### Development to Production Pipeline

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Development   │    │     Testing     │    │   Production    │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • Hot reload    │    │ • Unit tests    │    │ • Optimized     │
│ • Source maps   │───▶│ • Integration   │───▶│   builds        │
│ • Debug mode    │    │   tests         │    │ • Minification  │
│ • Mock data     │    │ • E2E tests     │    │ • Compression   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
    npm run dev           npm run test             npm run build
```

### Container Architecture

```dockerfile
# Multi-stage Production Build
FROM node:18-alpine AS frontend-build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci --only=production
COPY frontend/ .
RUN npm run build

FROM python:3.9-slim AS backend-build  
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ .

FROM nginx:alpine AS production
COPY --from=frontend-build /app/dist /usr/share/nginx/html
COPY --from=backend-build /app /backend
COPY nginx.conf /etc/nginx/nginx.conf
```

This comprehensive architecture documentation provides a complete technical overview of SwimBuddy Pro's design, implementation, and deployment strategies, suitable for developers, architects, and technical stakeholders.
