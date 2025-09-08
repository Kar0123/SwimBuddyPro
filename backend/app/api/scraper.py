from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
import logging
from datetime import datetime

from app.models.schemas import ScrapeRequest, ScrapeResponse, ErrorResponse
from app.scraper.swimming_scraper import scraper
from app.database.database import db

router = APIRouter()
logger = logging.getLogger(__name__)

class ValidateRequest(BaseModel):
    tiref: str

@router.post("/validate", response_model=dict)
async def validate_tiref(request: ValidateRequest):
    """Validate if a tiref exists on the swimming results website"""
    try:
        tiref = request.tiref.strip()
        
        # Basic format validation - allow 4-8 digits to be more flexible
        if not tiref.isdigit() or len(tiref) < 4 or len(tiref) > 8:
            return {
                "valid": False,
                "message": "Invalid tiref format. Must be 4-8 digits.",
                "tiref": tiref
            }
        
        # Check with the website
        is_valid = scraper.validate_tiref(tiref)
        
        return {
            "valid": is_valid,
            "message": "Valid tiref" if is_valid else "Tiref not found on swimming results website",
            "tiref": tiref
        }
    except Exception as e:
        logger.error(f"Error validating tiref {request.tiref}: {e}")
        return {
            "valid": False,
            "message": "Error occurred during validation",
            "tiref": request.tiref,
            "error": str(e)
        }

@router.post("/scrape/{tiref}", response_model=ScrapeResponse)
async def scrape_swimmer_data(tiref: str, force_refresh: bool = False):
    """Scrape fresh swimming data for a swimmer"""
    try:
        tiref = tiref.strip()
        
        # Basic format validation - allow 4-8 digits to be more flexible
        if not tiref.isdigit() or len(tiref) < 4 or len(tiref) > 8:
            raise HTTPException(
                status_code=400,
                detail="Invalid tiref format. Must be 4-8 digits."
            )
        
        # Check if we should use cached data (improved caching logic)
        if not force_refresh:
            cache_info = db.get_cache_metadata(tiref)
            swimmer = db.get_swimmer(tiref)
            
            if cache_info and swimmer and cache_info['scrape_success']:
                # Check if cache is fresh (less than 24 hours old)
                cache_age_hours = (datetime.now() - cache_info['last_scraped']).total_seconds() / 3600
                
                # Use cache if it's less than 24 hours old, or immediately return for very recent cache
                if cache_age_hours < 24:
                    records_count = cache_info['records_count']
                    return ScrapeResponse(
                        success=True,
                        message=f"Loaded {records_count} records from cache ({cache_age_hours:.1f}h old)",
                        tiref=tiref,
                        records_found=records_count,
                        swimmer_info=swimmer,
                        last_updated=cache_info['last_scraped'],
                        from_cache=True
                    )
                else:
                    logger.info(f"Cache for {tiref} is {cache_age_hours:.1f}h old, refreshing...")
            elif swimmer and not force_refresh:
                # Even if no cache metadata, if we have swimmer data, return it quickly
                records = db.get_swim_records(tiref)
                return ScrapeResponse(
                    success=True,
                    message=f"Loaded {len(records)} records from database",
                    tiref=tiref,
                    records_found=len(records),
                    swimmer_info=swimmer,
                    last_updated=swimmer.last_updated,
                    from_cache=True
                )
        
        # Scrape fresh data
        logger.info(f"Starting fresh scrape for tiref: {tiref}")
        
        try:
            swimmer_info, swim_records = scraper.scrape_swimmer_data(tiref)
            
            if not swimmer_info:
                # Update cache with failure
                db.update_cache_metadata(tiref, 0, False, "Swimmer not found or invalid tiref")
                raise HTTPException(
                    status_code=404,
                    detail=f"Swimmer with tiref {tiref} not found"
                )
            
            # Save swimmer info
            success_swimmer = db.save_swimmer(swimmer_info)
            if not success_swimmer:
                raise HTTPException(
                    status_code=500,
                    detail="Failed to save swimmer information"
                )
            
            # Save swim records
            saved_records = 0
            if swim_records:
                saved_records = db.save_swim_records(swim_records)
            
            # Update personal bests
            db.update_personal_bests(tiref)
            
            # Update cache metadata
            db.update_cache_metadata(tiref, saved_records, True)
            
            return ScrapeResponse(
                success=True,
                message=f"Successfully scraped {saved_records} records",
                tiref=tiref,
                records_found=saved_records,
                swimmer_info=swimmer_info,
                last_updated=datetime.now(),
                from_cache=False
            )
            
        except Exception as scrape_error:
            # Update cache with failure
            error_message = str(scrape_error)
            db.update_cache_metadata(tiref, 0, False, error_message)
            logger.error(f"Scraping failed for {tiref}: {error_message}")
            
            # Check if we have any cached data to fall back to
            swimmer = db.get_swimmer(tiref)
            if swimmer:
                records = db.get_swim_records(tiref)
                return ScrapeResponse(
                    success=False,
                    message=f"Scraping failed: {error_message}. Showing cached data.",
                    tiref=tiref,
                    records_found=len(records),
                    swimmer_info=swimmer,
                    last_updated=swimmer.last_updated,
                    from_cache=True
                )
            else:
                raise HTTPException(
                    status_code=500,
                    detail=f"Scraping failed and no cached data available: {error_message}"
                )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in scrape endpoint for {tiref}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error occurred: {str(e)}"
        )

@router.post("/refresh/{tiref}", response_model=ScrapeResponse)
async def refresh_swimmer_data(tiref: str):
    """Force refresh swimmer data (same as scrape with force_refresh=True)"""
    return await scrape_swimmer_data(tiref, force_refresh=True)

@router.get("/health")
async def scraper_health():
    """Check scraper health and connectivity"""
    try:
        # Test connectivity to the swimming results website
        test_response = scraper._make_request(scraper.BASE_URL)
        
        if test_response and test_response.status_code == 200:
            return {
                "status": "healthy",
                "message": "Scraper is working and website is accessible",
                "website_accessible": True,
                "last_check": datetime.now()
            }
        else:
            return {
                "status": "degraded",
                "message": "Website may be temporarily unavailable",
                "website_accessible": False,
                "last_check": datetime.now()
            }
    except Exception as e:
        logger.error(f"Scraper health check failed: {e}")
        return {
            "status": "unhealthy",
            "message": f"Scraper health check failed: {str(e)}",
            "website_accessible": False,
            "last_check": datetime.now()
        }
