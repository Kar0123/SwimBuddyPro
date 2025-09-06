from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import List
import logging

from app.models.schemas import (
    SwimmerInfo, 
    SwimmerListResponse, 
    ScrapeResponse,
    ErrorResponse
)
from app.database.database import db

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/", response_model=SwimmerListResponse)
async def list_swimmers():
    """Get list of all swimmers in the database"""
    try:
        swimmers = db.list_swimmers()
        return SwimmerListResponse(
            swimmers=swimmers,
            total=len(swimmers)
        )
    except Exception as e:
        logger.error(f"Error listing swimmers: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve swimmers")

@router.get("/{tiref}", response_model=SwimmerInfo)
async def get_swimmer(tiref: str):
    """Get swimmer information by tiref"""
    try:
        swimmer = db.get_swimmer(tiref)
        if not swimmer:
            raise HTTPException(status_code=404, detail=f"Swimmer with tiref {tiref} not found")
        
        return swimmer
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting swimmer {tiref}: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve swimmer")

@router.get("/{tiref}/complete")
async def get_complete_swimmer_data(tiref: str):
    """Get complete swimmer data including records, personal bests, and statistics"""
    try:
        # Get swimmer info
        swimmer = db.get_swimmer(tiref)
        if not swimmer:
            raise HTTPException(status_code=404, detail=f"Swimmer with tiref {tiref} not found")
        
        # Get records
        records = db.get_swim_records(tiref)
        
        # Get personal bests
        personal_bests = db.get_personal_bests(tiref)
        
        # Calculate statistics
        stats = calculate_swimmer_stats(records)
        
        # Format data for frontend
        return {
            "tiref": swimmer.tiref,
            "name": swimmer.name,
            "club": swimmer.club,
            "age": None,  # Not available in current data
            "ageGroup": swimmer.age_group,
            "records": [format_record_for_frontend(r) for r in records],
            "personalBests": [format_personal_best_for_frontend(pb) for pb in personal_bests],
            "stats": stats,
            "lastUpdated": swimmer.last_updated.isoformat() if swimmer.last_updated else None,
            "cacheExpiry": None  # Could calculate based on last update + 24 hours
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting complete swimmer data {tiref}: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve complete swimmer data")

def calculate_swimmer_stats(records):
    """Calculate swimmer statistics from records"""
    if not records:
        return {
            "totalRaces": 0,
            "personalBests": 0,
            "averageWAPoints": 0,
            "mostCommonStroke": "Freestyle",
            "mostCommonDistance": 50,
            "currentSeason": "2024-25",
            "seasonsCompeted": [],
            "recentImprovements": 0,
            "competitionSpan": {
                "firstRace": None,
                "lastRace": None,
                "yearsActive": 0
            }
        }
    
    # Calculate stats
    total_races = len(records)
    
    # Get strokes and distances
    strokes = []
    distances = []
    wa_points = []
    seasons = []
    dates = []
    
    for r in records:
        # Handle stroke
        if hasattr(r.stroke, 'value'):
            strokes.append(r.stroke.value)
        else:
            strokes.append(str(r.stroke))
        
        # Handle distance
        distances.append(r.distance)
        
        # Handle WA points
        if r.wa_points and r.wa_points > 0:
            wa_points.append(r.wa_points)
        
        # Handle season
        if r.season:
            seasons.append(r.season)
        
        # Handle dates
        if hasattr(r, 'meet_date') and r.meet_date:
            dates.append(r.meet_date)
    
    # Most common stroke and distance
    most_common_stroke = max(set(strokes), key=strokes.count) if strokes else "Freestyle"
    most_common_distance = max(set(distances), key=distances.count) if distances else 50
    
    # Calculate average WA points
    average_wa_points = int(sum(wa_points) / len(wa_points)) if wa_points else 0
    
    # Get seasons
    unique_seasons = list(set(seasons))
    current_season = max(unique_seasons) if unique_seasons else "2024-25"
    
    # Date range
    first_race = min(dates).isoformat() if dates else None
    last_race = max(dates).isoformat() if dates else None
    years_active = len(set([d.year for d in dates])) if dates else 0
    
    return {
        "totalRaces": total_races,
        "personalBests": 0,  # Would need to calculate based on best times per event
        "averageWAPoints": average_wa_points,
        "mostCommonStroke": most_common_stroke,
        "mostCommonDistance": most_common_distance,
        "currentSeason": current_season,
        "seasonsCompeted": sorted(unique_seasons, reverse=True),
        "recentImprovements": 0,  # Would need to calculate improvements
        "competitionSpan": {
            "firstRace": first_race,
            "lastRace": last_race,
            "yearsActive": years_active
        }
    }

def format_record_for_frontend(record):
    """Format a database record for frontend consumption"""
    return {
        "id": str(record.id) if hasattr(record, 'id') and record.id else f"{record.tiref}_{record.distance}_{record.stroke}",
        "stroke": record.stroke.value if hasattr(record.stroke, 'value') else str(record.stroke),
        "distance": record.distance,
        "poolType": record.pool_type.value if hasattr(record.pool_type, 'value') else str(record.pool_type),
        "time": record.time,
        "timeInSeconds": record.time_seconds if record.time_seconds else record.time_to_seconds(),
        "date": record.meet_date.isoformat() if record.meet_date else None,
        "meet": record.meet_name or "Unknown Meet",
        "venue": record.venue or "Unknown Venue",
        "roundType": record.round_type.value if hasattr(record.round_type, 'value') else "Finals",
        "waPoints": record.wa_points or 0,
        "rank": record.ranking,
        "heat": None,  # Not stored in current schema
        "lane": None,  # Not stored in current schema
        "isPersonalBest": False,  # Would need to calculate
        "improvementFromPrevious": None,  # Could calculate
        "season": record.season or "2024-25"
    }

def format_personal_best_for_frontend(pb):
    """Format a personal best record for frontend consumption"""
    return {
        "stroke": pb.stroke.value if hasattr(pb.stroke, 'value') else str(pb.stroke),
        "distance": pb.distance,
        "poolType": pb.pool_type.value if hasattr(pb.pool_type, 'value') else str(pb.pool_type),
        "bestTime": pb.best_time,
        "bestTimeSeconds": pb.best_time_seconds or 0,
        "waPoints": pb.wa_points or 0,
        "date": pb.best_date.isoformat() if hasattr(pb, 'best_date') and pb.best_date else None,
        "meet": getattr(pb, 'meet_name', "Unknown Meet"),
        "venue": getattr(pb, 'venue', "Unknown Venue"),
        "improvementHistory": []  # Would need additional data structure
    }

@router.get("/{tiref}/records")
async def get_swimmer_records(tiref: str, limit: int = None):
    """Get swim records for a swimmer"""
    try:
        # Check if swimmer exists
        swimmer = db.get_swimmer(tiref)
        if not swimmer:
            raise HTTPException(status_code=404, detail=f"Swimmer with tiref {tiref} not found")
        
        records = db.get_swim_records(tiref, limit)
        return {
            "tiref": tiref,
            "total_records": len(records),
            "records": records
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting records for swimmer {tiref}: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve swim records")

@router.get("/{tiref}/personal-bests-cards")
async def get_personal_bests_cards(tiref: str):
    """Get personal bests formatted for card display with comparisons"""
    try:
        # Check if swimmer exists
        swimmer = db.get_swimmer(tiref)
        if not swimmer:
            raise HTTPException(status_code=404, detail=f"Swimmer with tiref {tiref} not found")
        
        # Get all records for this swimmer
        all_records = db.get_swim_records(tiref)
        
        if not all_records:
            return {
                "tiref": tiref,
                "swimmer_name": swimmer.name,
                "personal_bests": []
            }
        
        # Calculate personal bests from all records
        personal_bests_cards = calculate_personal_bests_for_cards(all_records, swimmer)
        
        return {
            "tiref": tiref,
            "swimmer_name": swimmer.name,
            "personal_bests": personal_bests_cards,
            "last_updated": swimmer.last_updated.isoformat() if swimmer.last_updated else None
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting personal bests cards for swimmer {tiref}: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve personal bests cards")

def calculate_personal_bests_for_cards(records, swimmer):
    """Calculate personal bests for card display with LC/SC comparison"""
    from collections import defaultdict
    import datetime
    
    # Group records by stroke and distance
    event_records = defaultdict(list)
    
    for record in records:
        # Create event key (stroke_distance)
        stroke = record.stroke.value if hasattr(record.stroke, 'value') else str(record.stroke)
        key = f"{stroke}_{record.distance}"
        event_records[key].append(record)
    
    personal_bests = []
    
    for event_key, event_record_list in event_records.items():
        stroke, distance = event_key.split('_', 1)
        distance = int(distance)
        
        # Separate LC and SC records
        lc_records = [r for r in event_record_list if (hasattr(r.pool_type, 'value') and r.pool_type.value == 'LC') or str(r.pool_type) == 'LC']
        sc_records = [r for r in event_record_list if (hasattr(r.pool_type, 'value') and r.pool_type.value == 'SC') or str(r.pool_type) == 'SC']
        
        # Find best LC and SC times
        best_lc = None
        best_sc = None
        
        if lc_records:
            # Sort by time (assuming time_to_seconds method exists or we convert)
            lc_times = []
            for r in lc_records:
                try:
                    time_seconds = r.time_seconds if hasattr(r, 'time_seconds') and r.time_seconds else convert_time_to_seconds(r.time)
                    if time_seconds:
                        lc_times.append((time_seconds, r))
                except:
                    continue
            
            if lc_times:
                lc_times.sort(key=lambda x: x[0])
                best_lc = lc_times[0][1]
        
        if sc_records:
            sc_times = []
            for r in sc_records:
                try:
                    time_seconds = r.time_seconds if hasattr(r, 'time_seconds') and r.time_seconds else convert_time_to_seconds(r.time)
                    if time_seconds:
                        sc_times.append((time_seconds, r))
                except:
                    continue
            
            if sc_times:
                sc_times.sort(key=lambda x: x[0])
                best_sc = sc_times[0][1]
        
        # Determine overall best time
        primary_best = None
        secondary_best = None
        
        if best_lc and best_sc:
            lc_seconds = best_lc.time_seconds if hasattr(best_lc, 'time_seconds') and best_lc.time_seconds else convert_time_to_seconds(best_lc.time)
            sc_seconds = best_sc.time_seconds if hasattr(best_sc, 'time_seconds') and best_sc.time_seconds else convert_time_to_seconds(best_sc.time)
            
            if lc_seconds and sc_seconds:
                if lc_seconds <= sc_seconds:
                    primary_best = best_lc
                    secondary_best = best_sc
                else:
                    primary_best = best_sc
                    secondary_best = best_lc
        elif best_lc:
            primary_best = best_lc
        elif best_sc:
            primary_best = best_sc
        
        if primary_best:
            # Calculate improvement data
            improvement_data = calculate_improvement_data(event_record_list, primary_best)
            
            # Get stroke icon/color
            stroke_info = get_stroke_info(stroke)
            
            card_data = {
                "event_name": f"{distance} {stroke}",
                "stroke": stroke,
                "distance": distance,
                "stroke_color": stroke_info["color"],
                "stroke_icon": stroke_info["icon"],
                "primary_best": {
                    "time": primary_best.time,
                    "time_seconds": primary_best.time_seconds if hasattr(primary_best, 'time_seconds') and primary_best.time_seconds else convert_time_to_seconds(primary_best.time),
                    "pool_type": primary_best.pool_type.value if hasattr(primary_best.pool_type, 'value') else str(primary_best.pool_type),
                    "date": primary_best.meet_date.isoformat() if primary_best.meet_date else None,
                    "meet_name": primary_best.meet_name or "Unknown Meet",
                    "venue": primary_best.venue or "Unknown Venue",
                    "wa_points": primary_best.wa_points or 0,
                    "round_type": primary_best.round_type.value if hasattr(primary_best.round_type, 'value') else str(primary_best.round_type)
                },
                "secondary_best": None,
                "improvement": improvement_data,
                "total_races": len(event_record_list),
                "seasons_competed": get_seasons_for_event(event_record_list)
            }
            
            # Add secondary best if different pool type
            if secondary_best:
                card_data["secondary_best"] = {
                    "time": secondary_best.time,
                    "time_seconds": secondary_best.time_seconds if hasattr(secondary_best, 'time_seconds') and secondary_best.time_seconds else convert_time_to_seconds(secondary_best.time),
                    "pool_type": secondary_best.pool_type.value if hasattr(secondary_best.pool_type, 'value') else str(secondary_best.pool_type),
                    "date": secondary_best.meet_date.isoformat() if secondary_best.meet_date else None,
                    "meet_name": secondary_best.meet_name or "Unknown Meet",
                    "venue": secondary_best.venue or "Unknown Venue",
                    "wa_points": secondary_best.wa_points or 0
                }
            
            personal_bests.append(card_data)
    
    # Sort by stroke type order and distance
    stroke_order = {"Freestyle": 1, "Backstroke": 2, "Breaststroke": 3, "Butterfly": 4, "Individual Medley": 5}
    personal_bests.sort(key=lambda x: (stroke_order.get(x["stroke"], 6), x["distance"]))
    
    return personal_bests

def convert_time_to_seconds(time_str):
    """Convert time string to seconds"""
    if not time_str:
        return None
    
    try:
        time_str = str(time_str).strip()
        
        if ':' in time_str:
            # Format: MM:SS.sss or H:MM:SS.sss
            parts = time_str.split(':')
            if len(parts) == 2:
                # MM:SS.sss
                minutes = float(parts[0])
                seconds = float(parts[1])
                return minutes * 60 + seconds
            elif len(parts) == 3:
                # H:MM:SS.sss
                hours = float(parts[0])
                minutes = float(parts[1])
                seconds = float(parts[2])
                return hours * 3600 + minutes * 60 + seconds
        else:
            # Format: SS.sss
            return float(time_str)
    except:
        return None

def calculate_improvement_data(event_records, best_record):
    """Calculate improvement data for an event"""
    try:
        # Sort records by date
        dated_records = [r for r in event_records if r.meet_date]
        dated_records.sort(key=lambda x: x.meet_date)
        
        if len(dated_records) < 2:
            return {
                "recent_improvement": 0,
                "season_improvement": 0,
                "all_time_improvement": 0,
                "trend": "stable"
            }
        
        # Get times in seconds
        times_with_dates = []
        for r in dated_records:
            time_seconds = r.time_seconds if hasattr(r, 'time_seconds') and r.time_seconds else convert_time_to_seconds(r.time)
            if time_seconds:
                times_with_dates.append((r.meet_date, time_seconds))
        
        if len(times_with_dates) < 2:
            return {
                "recent_improvement": 0,
                "season_improvement": 0,
                "all_time_improvement": 0,
                "trend": "stable"
            }
        
        # Calculate improvements
        latest_time = times_with_dates[-1][1]
        previous_time = times_with_dates[-2][1] if len(times_with_dates) > 1 else latest_time
        first_time = times_with_dates[0][1]
        
        recent_improvement = previous_time - latest_time  # Positive = improvement
        all_time_improvement = first_time - latest_time
        
        # Determine trend
        if len(times_with_dates) >= 3:
            last_three = [t[1] for t in times_with_dates[-3:]]
            if last_three[0] > last_three[1] > last_three[2]:
                trend = "improving"
            elif last_three[0] < last_three[1] < last_three[2]:
                trend = "declining"
            else:
                trend = "stable"
        else:
            trend = "improving" if recent_improvement > 0 else "stable"
        
        return {
            "recent_improvement": round(recent_improvement, 2),
            "season_improvement": 0,  # Would need season-specific calculation
            "all_time_improvement": round(all_time_improvement, 2),
            "trend": trend
        }
    except:
        return {
            "recent_improvement": 0,
            "season_improvement": 0,
            "all_time_improvement": 0,
            "trend": "stable"
        }

def get_stroke_info(stroke):
    """Get color and icon information for strokes"""
    stroke_map = {
        "Freestyle": {"color": "#3B82F6", "icon": "🏊"},  # Blue
        "Backstroke": {"color": "#10B981", "icon": "🤿"},  # Green
        "Breaststroke": {"color": "#F59E0B", "icon": "🐸"},  # Amber
        "Butterfly": {"color": "#8B5CF6", "icon": "🦋"},  # Purple
        "Individual Medley": {"color": "#EF4444", "icon": "🎯"}  # Red
    }
    return stroke_map.get(stroke, {"color": "#6B7280", "icon": "🏊"})

def get_seasons_for_event(event_records):
    """Get list of seasons competed in for this event"""
    seasons = set()
    for record in event_records:
        if record.season:
            seasons.add(record.season)
        elif record.meet_date:
            # Calculate season from date
            year = record.meet_date.year
            month = record.meet_date.month
            if month >= 9:  # Sept-Dec
                season = f"{year}-{year+1}"
            else:  # Jan-Aug
                season = f"{year-1}-{year}"
            seasons.add(season)
    
    return sorted(list(seasons), reverse=True)

@router.get("/{tiref}/personal-bests")
async def get_personal_bests(tiref: str):
    """Get personal best records for a swimmer"""
    try:
        # Check if swimmer exists
        swimmer = db.get_swimmer(tiref)
        if not swimmer:
            raise HTTPException(status_code=404, detail=f"Swimmer with tiref {tiref} not found")
        
        personal_bests = db.get_personal_bests(tiref)
        return {
            "tiref": tiref,
            "total_personal_bests": len(personal_bests),
            "personal_bests": personal_bests
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting personal bests for swimmer {tiref}: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve personal bests")

@router.get("/{tiref}/cache-info")
async def get_cache_info(tiref: str):
    """Get cache information for a swimmer"""
    try:
        cache_info = db.get_cache_metadata(tiref)
        if not cache_info:
            raise HTTPException(status_code=404, detail=f"No cache information found for tiref {tiref}")
        
        return cache_info
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting cache info for swimmer {tiref}: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve cache information")

@router.delete("/{tiref}")
async def delete_swimmer(tiref: str):
    """Delete a swimmer and all associated data"""
    try:
        # Check if swimmer exists
        swimmer = db.get_swimmer(tiref)
        if not swimmer:
            raise HTTPException(status_code=404, detail=f"Swimmer with tiref {tiref} not found")
        
        success = db.delete_swimmer(tiref)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to delete swimmer")
        
        return {
            "message": f"Swimmer {tiref} and all associated data deleted successfully",
            "tiref": tiref
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting swimmer {tiref}: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete swimmer")

@router.post("/{tiref}/update-personal-bests")
async def update_personal_bests(tiref: str):
    """Recalculate personal bests for a swimmer"""
    try:
        # Check if swimmer exists
        swimmer = db.get_swimmer(tiref)
        if not swimmer:
            raise HTTPException(status_code=404, detail=f"Swimmer with tiref {tiref} not found")
        
        updated_count = db.update_personal_bests(tiref)
        return {
            "message": f"Updated {updated_count} personal bests for swimmer {tiref}",
            "tiref": tiref,
            "updated_count": updated_count
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating personal bests for swimmer {tiref}: {e}")
        raise HTTPException(status_code=500, detail="Failed to update personal bests")
