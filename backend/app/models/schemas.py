from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from enum import Enum

class PoolType(str, Enum):
    SHORT_COURSE = "SC"
    LONG_COURSE = "LC"

class StrokeType(str, Enum):
    FREESTYLE = "Freestyle"
    BACKSTROKE = "Backstroke"
    BREASTSTROKE = "Breaststroke"
    BUTTERFLY = "Butterfly"
    INDIVIDUAL_MEDLEY = "Individual Medley"

class RoundType(str, Enum):
    FINALS = "F"
    HEATS = "H"
    SEMI_FINALS = "SF"
    PRELIMINARY = "P"

class SwimmerInfo(BaseModel):
    """Swimmer personal information"""
    tiref: str = Field(..., description="Swimmer's membership ID")
    name: str = Field(..., description="Swimmer's full name")
    club: Optional[str] = Field(None, description="Swimming club")
    age_group: Optional[str] = Field(None, description="Age group category")
    last_updated: datetime = Field(default_factory=datetime.now)

class SwimRecord(BaseModel):
    """Individual swimming record/performance"""
    id: Optional[int] = Field(None, description="Record ID")
    tiref: str = Field(..., description="Swimmer's membership ID")
    event_name: str = Field(..., description="Event name (e.g., '50 Freestyle')")
    stroke: StrokeType = Field(..., description="Stroke type")
    distance: int = Field(..., description="Distance in meters")
    pool_type: PoolType = Field(..., description="Pool type (SC/LC)")
    time: str = Field(..., description="Race time (MM:SS.SS format)")
    time_seconds: Optional[float] = Field(None, description="Time in seconds for calculations")
    wa_points: Optional[int] = Field(None, description="World Aquatics points")
    ranking: Optional[int] = Field(None, description="Ranking in the race")
    meet_date: datetime = Field(..., description="Date of the meet")
    venue: str = Field(..., description="Venue/location of the meet")
    meet_name: str = Field(..., description="Name of the swimming meet")
    round_type: RoundType = Field(..., description="Round type (Finals, Heats, etc.)")
    season: Optional[str] = Field(None, description="Season (e.g., '2024-25')")
    created_at: datetime = Field(default_factory=datetime.now)

    @validator('time')
    def validate_time_format(cls, v):
        """Validate time format and convert to seconds"""
        if not v:
            raise ValueError("Time cannot be empty")
        
        # Handle different time formats
        try:
            if ':' in v:
                # MM:SS.SS or M:SS.SS format
                parts = v.split(':')
                if len(parts) == 2:
                    minutes = int(parts[0])
                    seconds = float(parts[1])
                    return v
            else:
                # SS.SS format (under 1 minute)
                float(v)
                return v
        except (ValueError, IndexError):
            raise ValueError(f"Invalid time format: {v}")
        
        return v

    @validator('distance')
    def validate_distance(cls, v):
        """Validate distance is a standard swimming distance"""
        valid_distances = [25, 50, 100, 200, 400, 800, 1500]
        if v not in valid_distances:
            raise ValueError(f"Distance must be one of {valid_distances}")
        return v

    def time_to_seconds(self) -> float:
        """Convert time string to seconds for calculations"""
        if ':' in self.time:
            parts = self.time.split(':')
            minutes = int(parts[0])
            seconds = float(parts[1])
            return minutes * 60 + seconds
        else:
            return float(self.time)

class PersonalBest(BaseModel):
    """Personal best record for a specific event"""
    tiref: str
    event_name: str
    stroke: StrokeType
    distance: int
    pool_type: PoolType
    best_time: str
    best_time_seconds: float
    wa_points: Optional[int]
    meet_date: datetime
    venue: str
    meet_name: str
    improvement_from_previous: Optional[float] = Field(None, description="Seconds improved from previous PB")

class SwimmerStats(BaseModel):
    """Swimmer performance statistics"""
    tiref: str
    total_races: int
    total_events: int
    personal_bests: int
    favorite_stroke: Optional[StrokeType]
    favorite_distance: Optional[int]
    first_race_date: Optional[datetime]
    last_race_date: Optional[datetime]
    average_wa_points: Optional[float]

class ScrapeRequest(BaseModel):
    """Request model for scraping data"""
    tiref: str = Field(..., description="Swimmer's membership ID")
    force_refresh: bool = Field(False, description="Force refresh even if cached data exists")

class ScrapeResponse(BaseModel):
    """Response model for scraping operations"""
    success: bool
    message: str
    tiref: str
    records_found: int
    swimmer_info: Optional[SwimmerInfo]
    last_updated: datetime
    from_cache: bool = Field(False, description="Whether data was loaded from cache")

class ErrorResponse(BaseModel):
    """Error response model"""
    error: bool = True
    message: str
    status_code: int
    details: Optional[str] = None

class SwimmerListResponse(BaseModel):
    """Response model for listing swimmers"""
    swimmers: List[SwimmerInfo]
    total: int

class PerformanceAnalysis(BaseModel):
    """Performance analysis data"""
    tiref: str
    stroke: Optional[StrokeType]
    distance: Optional[int]
    improvement_trend: float  # Positive = improving, negative = declining
    consistency_score: float  # 0-100, higher = more consistent
    recent_performance: List[SwimRecord]
    personal_bests: List[PersonalBest]
