import sqlite3
import logging
from pathlib import Path
from typing import List, Optional, Dict, Any
from datetime import datetime
import json

from app.models.schemas import SwimmerInfo, SwimRecord, PersonalBest, SwimmerStats

logger = logging.getLogger(__name__)

# Database file path
DB_PATH = Path("swimbuddy.db")

def get_db_connection():
    """Get database connection with row factory"""
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize database with required tables"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Swimmers table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS swimmers (
                tiref TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                club TEXT,
                age_group TEXT,
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Swim records table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS swim_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tiref TEXT NOT NULL,
                event_name TEXT NOT NULL,
                stroke TEXT NOT NULL,
                distance INTEGER NOT NULL,
                pool_type TEXT NOT NULL,
                time TEXT NOT NULL,
                time_seconds REAL,
                wa_points INTEGER,
                ranking INTEGER,
                meet_date TIMESTAMP NOT NULL,
                venue TEXT NOT NULL,
                meet_name TEXT NOT NULL,
                round_type TEXT NOT NULL,
                season TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (tiref) REFERENCES swimmers (tiref),
                UNIQUE(tiref, event_name, pool_type, time, meet_date, venue)
            )
        """)
        
        # Personal bests table (computed/cached data)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS personal_bests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tiref TEXT NOT NULL,
                event_name TEXT NOT NULL,
                stroke TEXT NOT NULL,
                distance INTEGER NOT NULL,
                pool_type TEXT NOT NULL,
                best_time TEXT NOT NULL,
                best_time_seconds REAL NOT NULL,
                wa_points INTEGER,
                meet_date TIMESTAMP NOT NULL,
                venue TEXT NOT NULL,
                meet_name TEXT NOT NULL,
                improvement_from_previous REAL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (tiref) REFERENCES swimmers (tiref),
                UNIQUE(tiref, event_name, pool_type)
            )
        """)
        
        # Cache metadata table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS cache_metadata (
                tiref TEXT PRIMARY KEY,
                last_scraped TIMESTAMP NOT NULL,
                records_count INTEGER DEFAULT 0,
                scrape_success BOOLEAN DEFAULT TRUE,
                error_message TEXT,
                FOREIGN KEY (tiref) REFERENCES swimmers (tiref)
            )
        """)
        
        # Create indexes for better performance
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_swim_records_tiref ON swim_records(tiref)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_swim_records_date ON swim_records(meet_date)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_personal_bests_tiref ON personal_bests(tiref)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_cache_metadata_scraped ON cache_metadata(last_scraped)")
        
        conn.commit()
        logger.info("Database initialized successfully")
        
    except Exception as e:
        conn.rollback()
        logger.error(f"Failed to initialize database: {e}")
        raise
    finally:
        conn.close()

class SwimmerDatabase:
    """Database operations for swimmers and records"""
    
    def get_swimmer(self, tiref: str) -> Optional[SwimmerInfo]:
        """Get swimmer information by tiref"""
        conn = get_db_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT tiref, name, club, age_group, last_updated
                FROM swimmers WHERE tiref = ?
            """, (tiref,))
            
            row = cursor.fetchone()
            if row:
                return SwimmerInfo(
                    tiref=row['tiref'],
                    name=row['name'],
                    club=row['club'],
                    age_group=row['age_group'],
                    last_updated=datetime.fromisoformat(row['last_updated'])
                )
            return None
        finally:
            conn.close()
    
    def save_swimmer(self, swimmer: SwimmerInfo) -> bool:
        """Save or update swimmer information"""
        conn = get_db_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT OR REPLACE INTO swimmers 
                (tiref, name, club, age_group, last_updated)
                VALUES (?, ?, ?, ?, ?)
            """, (
                swimmer.tiref,
                swimmer.name,
                swimmer.club,
                swimmer.age_group,
                swimmer.last_updated
            ))
            conn.commit()
            return True
        except Exception as e:
            conn.rollback()
            logger.error(f"Failed to save swimmer {swimmer.tiref}: {e}")
            return False
        finally:
            conn.close()
    
    def get_swim_records(self, tiref: str, limit: Optional[int] = None) -> List[SwimRecord]:
        """Get swim records for a swimmer"""
        conn = get_db_connection()
        try:
            cursor = conn.cursor()
            query = """
                SELECT * FROM swim_records 
                WHERE tiref = ? 
                ORDER BY meet_date DESC
            """
            if limit:
                query += f" LIMIT {limit}"
            
            cursor.execute(query, (tiref,))
            rows = cursor.fetchall()
            
            records = []
            for row in rows:
                records.append(SwimRecord(
                    id=row['id'],
                    tiref=row['tiref'],
                    event_name=row['event_name'],
                    stroke=row['stroke'],
                    distance=row['distance'],
                    pool_type=row['pool_type'],
                    time=row['time'],
                    time_seconds=row['time_seconds'],
                    wa_points=row['wa_points'],
                    ranking=row['ranking'],
                    meet_date=datetime.fromisoformat(row['meet_date']),
                    venue=row['venue'],
                    meet_name=row['meet_name'],
                    round_type=row['round_type'],
                    season=row['season'],
                    created_at=datetime.fromisoformat(row['created_at'])
                ))
            
            return records
        finally:
            conn.close()
    
    def save_swim_records(self, records: List[SwimRecord]) -> int:
        """Save multiple swim records, return count of saved records"""
        if not records:
            return 0
            
        conn = get_db_connection()
        saved_count = 0
        
        try:
            cursor = conn.cursor()
            
            for record in records:
                try:
                    # Calculate time in seconds
                    time_seconds = record.time_to_seconds()
                    
                    cursor.execute("""
                        INSERT OR IGNORE INTO swim_records 
                        (tiref, event_name, stroke, distance, pool_type, time, time_seconds,
                         wa_points, ranking, meet_date, venue, meet_name, round_type, season)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        record.tiref,
                        record.event_name,
                        record.stroke.value,
                        record.distance,
                        record.pool_type.value,
                        record.time,
                        time_seconds,
                        record.wa_points,
                        record.ranking,
                        record.meet_date,
                        record.venue,
                        record.meet_name,
                        record.round_type.value,
                        record.season
                    ))
                    
                    if cursor.rowcount > 0:
                        saved_count += 1
                        
                except Exception as e:
                    logger.warning(f"Failed to save record: {e}")
                    continue
            
            conn.commit()
            logger.info(f"Saved {saved_count} new records for swimmer {records[0].tiref}")
            
        except Exception as e:
            conn.rollback()
            logger.error(f"Failed to save swim records: {e}")
        finally:
            conn.close()
        
        return saved_count
    
    def get_personal_bests(self, tiref: str) -> List[PersonalBest]:
        """Get personal best records for a swimmer"""
        conn = get_db_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT * FROM personal_bests 
                WHERE tiref = ? 
                ORDER BY stroke, distance
            """, (tiref,))
            
            rows = cursor.fetchall()
            bests = []
            
            for row in rows:
                try:
                    # Handle potentially invalid date data
                    meet_date = None
                    if row['meet_date']:
                        try:
                            meet_date = datetime.fromisoformat(row['meet_date'])
                        except (ValueError, TypeError) as e:
                            logger.warning(f"Invalid meet_date '{row['meet_date']}' for PB {row['tiref']}: {e}")
                            meet_date = None
                    
                    bests.append(PersonalBest(
                        tiref=row['tiref'],
                        event_name=row['event_name'],
                        stroke=row['stroke'],
                        distance=row['distance'],
                        pool_type=row['pool_type'],
                        best_time=row['best_time'],
                        best_time_seconds=row['best_time_seconds'],
                        wa_points=row['wa_points'],
                        meet_date=meet_date,
                        venue=row['venue'],
                        meet_name=row['meet_name'],
                        improvement_from_previous=row['improvement_from_previous']
                    ))
                except Exception as e:
                    logger.error(f"Error creating PersonalBest object for row {row}: {e}")
                    continue
            
            return bests
        finally:
            conn.close()
    
    def update_personal_bests(self, tiref: str) -> int:
        """Recalculate and update personal bests for a swimmer"""
        conn = get_db_connection()
        try:
            cursor = conn.cursor()
            
            # Get all unique events for this swimmer
            cursor.execute("""
                SELECT DISTINCT event_name, stroke, distance, pool_type
                FROM swim_records 
                WHERE tiref = ?
            """, (tiref,))
            
            events = cursor.fetchall()
            updated_count = 0
            
            for event in events:
                # Find the best time for this event
                cursor.execute("""
                    SELECT * FROM swim_records 
                    WHERE tiref = ? AND event_name = ? AND pool_type = ?
                    ORDER BY time_seconds ASC 
                    LIMIT 1
                """, (tiref, event['event_name'], event['pool_type']))
                
                best_record = cursor.fetchone()
                if best_record:
                    # Validate and format the meet_date
                    meet_date_value = best_record['meet_date']
                    try:
                        # Try to parse and format the date properly
                        if meet_date_value:
                            # If it's already a proper datetime string, parse and re-format
                            parsed_date = datetime.fromisoformat(str(meet_date_value).replace('Z', '+00:00'))
                            formatted_date = parsed_date.isoformat()
                        else:
                            formatted_date = None
                    except (ValueError, TypeError) as e:
                        logger.warning(f"Invalid meet_date '{meet_date_value}' for record {best_record['tiref']}: {e}")
                        formatted_date = None
                    
                    # Insert or update personal best
                    cursor.execute("""
                        INSERT OR REPLACE INTO personal_bests 
                        (tiref, event_name, stroke, distance, pool_type, best_time,
                         best_time_seconds, wa_points, meet_date, venue, meet_name, updated_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        best_record['tiref'],
                        best_record['event_name'],
                        best_record['stroke'],
                        best_record['distance'],
                        best_record['pool_type'],
                        best_record['time'],
                        best_record['time_seconds'],
                        best_record['wa_points'],
                        formatted_date,
                        best_record['venue'],
                        best_record['meet_name'],
                        datetime.now()
                    ))
                    updated_count += 1
            
            conn.commit()
            logger.info(f"Updated {updated_count} personal bests for swimmer {tiref}")
            return updated_count
            
        except Exception as e:
            conn.rollback()
            logger.error(f"Failed to update personal bests for {tiref}: {e}")
            return 0
        finally:
            conn.close()
    
    def update_cache_metadata(self, tiref: str, records_count: int, success: bool = True, error_message: str = None):
        """Update cache metadata for a swimmer"""
        conn = get_db_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT OR REPLACE INTO cache_metadata 
                (tiref, last_scraped, records_count, scrape_success, error_message)
                VALUES (?, ?, ?, ?, ?)
            """, (tiref, datetime.now(), records_count, success, error_message))
            conn.commit()
        except Exception as e:
            conn.rollback()
            logger.error(f"Failed to update cache metadata for {tiref}: {e}")
        finally:
            conn.close()
    
    def get_cache_metadata(self, tiref: str) -> Optional[Dict[str, Any]]:
        """Get cache metadata for a swimmer"""
        conn = get_db_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT * FROM cache_metadata WHERE tiref = ?
            """, (tiref,))
            
            row = cursor.fetchone()
            if row:
                return {
                    'tiref': row['tiref'],
                    'last_scraped': datetime.fromisoformat(row['last_scraped']),
                    'records_count': row['records_count'],
                    'scrape_success': bool(row['scrape_success']),
                    'error_message': row['error_message']
                }
            return None
        finally:
            conn.close()
    
    def list_swimmers(self) -> List[SwimmerInfo]:
        """Get all swimmers in the database"""
        conn = get_db_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT s.*, c.last_scraped, c.records_count
                FROM swimmers s
                LEFT JOIN cache_metadata c ON s.tiref = c.tiref
                ORDER BY s.last_updated DESC
            """)
            
            rows = cursor.fetchall()
            swimmers = []
            
            for row in rows:
                swimmers.append(SwimmerInfo(
                    tiref=row['tiref'],
                    name=row['name'],
                    club=row['club'],
                    age_group=row['age_group'],
                    last_updated=datetime.fromisoformat(row['last_updated'])
                ))
            
            return swimmers
        finally:
            conn.close()
    
    def delete_swimmer(self, tiref: str) -> bool:
        """Delete a swimmer and all associated data"""
        conn = get_db_connection()
        try:
            cursor = conn.cursor()
            
            # Delete in order due to foreign key constraints
            cursor.execute("DELETE FROM cache_metadata WHERE tiref = ?", (tiref,))
            cursor.execute("DELETE FROM personal_bests WHERE tiref = ?", (tiref,))
            cursor.execute("DELETE FROM swim_records WHERE tiref = ?", (tiref,))
            cursor.execute("DELETE FROM swimmers WHERE tiref = ?", (tiref,))
            
            conn.commit()
            logger.info(f"Deleted swimmer {tiref} and all associated data")
            return True
            
        except Exception as e:
            conn.rollback()
            logger.error(f"Failed to delete swimmer {tiref}: {e}")
            return False
        finally:
            conn.close()

# Create a global database instance
db = SwimmerDatabase()
