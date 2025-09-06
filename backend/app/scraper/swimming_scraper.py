import requests
from bs4 import BeautifulSoup
import logging
import time
import random
import re
from typing import List, Optional, Dict, Any, Tuple
from fake_useragent import UserAgent
from tenacity import retry, stop_after_attempt, wait_exponential
from datetime import datetime

from app.models.schemas import SwimmerInfo, SwimRecord, StrokeType, PoolType, RoundType

logger = logging.getLogger(__name__)

class SwimmingResultsScraper:
    """Web scraper for swimmingresults.org"""
    
    BASE_URL = "https://www.swimmingresults.org"
    PERSONAL_BEST_URL = f"{BASE_URL}/individualbest/personal_best.php"
    BIOGS_URL = f"{BASE_URL}/biogs/biogs_details.php"
    
    def __init__(self):
        self.session = requests.Session()
        self.ua = UserAgent()
        self.last_request_time = 0
        self.min_delay = 2.0  # Minimum 2 seconds between requests
        
        # Set default headers
        self.session.headers.update({
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        })
    
    def _get_random_user_agent(self) -> str:
        """Get a random user agent"""
        try:
            return self.ua.random
        except:
            # Fallback user agents
            agents = [
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            ]
            return random.choice(agents)
    
    def _rate_limit(self):
        """Implement rate limiting between requests"""
        current_time = time.time()
        time_since_last = current_time - self.last_request_time
        
        if time_since_last < self.min_delay:
            sleep_time = self.min_delay - time_since_last
            logger.info(f"Rate limiting: sleeping for {sleep_time:.2f} seconds")
            time.sleep(sleep_time)
        
        self.last_request_time = time.time()
    
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
    def _make_request(self, url: str, params: Dict[str, Any] = None) -> Optional[requests.Response]:
        """Make a rate-limited HTTP request with retries"""
        self._rate_limit()
        
        # Rotate user agent
        self.session.headers['User-Agent'] = self._get_random_user_agent()
        
        try:
            logger.info(f"Making request to: {url}")
            response = self.session.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            # Check if we got blocked or redirected
            if "blocked" in response.url.lower() or response.status_code == 429:
                logger.warning("Possible blocking detected")
                raise requests.exceptions.RequestException("Possible blocking")
            
            return response
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Request failed: {e}")
            raise
    
    def validate_tiref(self, tiref: str) -> bool:
        """Validate if a tiref exists by checking the personal best page"""
        try:
            response = self._make_request(self.PERSONAL_BEST_URL, {'mode': 'A', 'tiref': tiref})
            if response and response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Check for error messages or empty results
                error_indicators = [
                    "no results found",
                    "invalid",
                    "not found",
                    "error"
                ]
                
                page_text = soup.get_text().lower()
                for indicator in error_indicators:
                    if indicator in page_text:
                        return False
                
                # Check if there's actual data (tables, swimmer info, etc.)
                tables = soup.find_all('table')
                if tables:
                    return True
                
                # Check for swimmer name or other indicators
                if soup.find('h1') or soup.find('h2'):
                    return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error validating tiref {tiref}: {e}")
            return False
    
    def scrape_swimmer_info(self, tiref: str) -> Optional[SwimmerInfo]:
        """Scrape swimmer biographical information from personal best page"""
        try:
            # Get swimmer info from the personal best page since biogs page has issues
            response = self._make_request(self.PERSONAL_BEST_URL, {'mode': 'A', 'tiref': tiref})
            if not response:
                return None
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extract swimmer name and club from the specific pattern in HTML
            name = None
            club = None
            age_group = None
            
            # Look for the specific pattern: "Name - (tiref) - Club"
            # This appears in a <p class="rnk_sj"> element
            rnk_sj_elements = soup.find_all('p', class_='rnk_sj')
            for element in rnk_sj_elements:
                text = element.get_text(strip=True)
                # Look for pattern like "Khushi Rohit - (1507205) - Sutton & Cheam SC"
                if tiref in text and '-' in text:
                    # Split by dashes and extract components
                    parts = text.split(' - ')
                    if len(parts) >= 3:
                        # First part should be the name
                        potential_name = parts[0].strip()
                        # Last part should be the club (remove any trailing content)
                        potential_club = parts[-1].strip()
                        
                        # Clean up club name (remove trailing elements like search icons)
                        if potential_club:
                            # Find where club name ends (before "Search Again" or other elements)
                            club_clean = potential_club.split('Search Again')[0].strip()
                            if club_clean:
                                potential_club = club_clean
                        
                        # Validate that this looks like a real name (not page text)
                        if (potential_name and 
                            len(potential_name) > 2 and 
                            len(potential_name) < 80 and
                            not any(skip in potential_name.lower() for skip in [
                                'swimming', 'results', 'search', 'individual', 'best', 'times'
                            ])):
                            name = potential_name
                            club = potential_club
                            break
            
            # Fallback: try to extract from HTML source for the tiref pattern
            if not name:
                html_content = response.text
                # Look for pattern in HTML source: >Name - (<a href...tiref=ID>ID</a>) - Club<
                pattern = rf'([^<>]+?)\s*-\s*\(<a[^>]*tiref={tiref}[^>]*>{tiref}</a>\)\s*-\s*([^<>]+)'
                match = re.search(pattern, html_content)
                if match:
                    name = match.group(1).strip()
                    club = match.group(2).strip()
                    # Clean up any HTML artifacts
                    name = re.sub(r'[<>]', '', name)
                    club = re.sub(r'[<>]', '', club)
            
            # If still no name found, try the biogs page as last resort
            if not name:
                try:
                    biogs_response = self._make_request(self.BIOGS_URL, {'tiref': tiref})
                    if biogs_response:
                        biogs_soup = BeautifulSoup(biogs_response.content, 'html.parser')
                        biogs_title = biogs_soup.title.string if biogs_soup.title else ""
                        # Extract from title like "Biographical Data - Khushi Rohit (Sutton & Cheam SC)"
                        if " - " in biogs_title and "(" in biogs_title:
                            parts = biogs_title.split(" - ", 1)
                            if len(parts) > 1:
                                name_club_part = parts[1].split("(")[0].strip()
                                if name_club_part and len(name_club_part) < 50:
                                    name = name_club_part
                except Exception:
                    pass  # Biogs page failed, continue with fallback
            
            # Final fallback
            if not name:
                name = f"Swimmer {tiref}"
            
            # Clean up extracted data
            if name:
                name = name.strip()
                # Remove any remaining HTML artifacts or unwanted text
                name = re.sub(r'\s+', ' ', name)  # Normalize whitespace
                
            if club:
                club = club.strip()
                # Remove common trailing artifacts
                club = re.sub(r'(Search Again.*|<.*)', '', club).strip()
                club = re.sub(r'\s+', ' ', club)  # Normalize whitespace
            
            return SwimmerInfo(
                tiref=tiref,
                name=name,
                club=club,
                age_group=age_group,
                last_updated=datetime.now()
            )
            
        except Exception as e:
            logger.error(f"Error scraping swimmer info for {tiref}: {e}")
            return None
    
    def scrape_swim_records(self, tiref: str) -> List[SwimRecord]:
        """Scrape swimming records from personal best page - ENHANCED for complete race history"""
        try:
            # First, get personal bests to identify all events the swimmer has competed in
            personal_best_records = self._scrape_personal_bests(tiref)
            
            # Extract unique events from personal bests
            events_competed = self._extract_events_from_records(personal_best_records)
            
            # For each event, get complete race history
            all_race_records = []
            for event_info in events_competed:
                event_records = self._scrape_event_race_history(tiref, event_info)
                all_race_records.extend(event_records)
            
            # Remove duplicates and sort by date (newest first)
            unique_records = self._deduplicate_records(all_race_records)
            unique_records.sort(key=lambda x: x.meet_date, reverse=True)
            
            logger.info(f"Enhanced scrape for {tiref}: {len(unique_records)} total race records found (was {len(personal_best_records)} personal bests)")
            return unique_records
            
        except Exception as e:
            logger.error(f"Error in enhanced scraping for {tiref}: {e}")
            # Fallback to original personal best scraping
            return self._scrape_personal_bests(tiref)
    
    def _scrape_personal_bests(self, tiref: str) -> List[SwimRecord]:
        """Original method to scrape personal best records (kept as fallback)"""
        try:
            response = self._make_request(self.PERSONAL_BEST_URL, {'mode': 'A', 'tiref': tiref})
            if not response:
                return []
            
            soup = BeautifulSoup(response.content, 'html.parser')
            records = []
            
            # Find tables containing swim data
            tables = soup.find_all('table')
            
            for table_idx, table in enumerate(tables):
                rows = table.find_all('tr')
                
                if len(rows) < 2:  # Need at least header + 1 data row
                    continue
                
                # Determine pool type based on table headers or position
                pool_type = PoolType.LONG_COURSE  # Default
                header_text = rows[0].get_text().lower() if rows else ""
                
                # More precise pool type detection
                if 'strokelc' in header_text.replace(' ', '') or 'lc time' in header_text:
                    pool_type = PoolType.LONG_COURSE
                elif 'strokesc' in header_text.replace(' ', '') or 'sc time' in header_text:
                    pool_type = PoolType.SHORT_COURSE
                elif table_idx == 0:  # First table is usually LC
                    pool_type = PoolType.LONG_COURSE
                elif table_idx == 1:  # Second table is usually SC
                    pool_type = PoolType.SHORT_COURSE
                
                # Process data rows
                for row in rows[1:]:
                    try:
                        cells = row.find_all(['td', 'th'])
                        if len(cells) < 8:  # Need minimum columns for valid data
                            continue
                        
                        # Extract data based on actual structure
                        event_name = cells[0].get_text(strip=True) if len(cells) > 0 else ""
                        time_str = cells[1].get_text(strip=True) if len(cells) > 1 else ""
                        converted_time = cells[2].get_text(strip=True) if len(cells) > 2 else ""
                        wa_points_str = cells[3].get_text(strip=True) if len(cells) > 3 else ""
                        date_str = cells[4].get_text(strip=True) if len(cells) > 4 else ""
                        meet_name = cells[5].get_text(strip=True) if len(cells) > 5 else ""
                        venue = cells[6].get_text(strip=True) if len(cells) > 6 else ""
                        license_info = cells[7].get_text(strip=True) if len(cells) > 7 else ""
                        level = cells[8].get_text(strip=True) if len(cells) > 8 else ""
                        
                        # Validate essential data
                        if not all([event_name, time_str, date_str]):
                            continue
                        
                        # Parse event name to extract stroke and distance
                        stroke, distance = self._parse_event_name_v2(event_name)
                        if not stroke or not distance:
                            continue
                        
                        # Parse date
                        meet_date = self._parse_date_v2(date_str)
                        if not meet_date:
                            continue
                        
                        # Parse WA points
                        wa_points = None
                        try:
                            if wa_points_str and wa_points_str.isdigit():
                                wa_points = int(wa_points_str)
                        except:
                            pass
                        
                        # Create swim record
                        record = SwimRecord(
                            tiref=tiref,
                            event_name=event_name,
                            stroke=stroke,
                            distance=distance,
                            pool_type=pool_type,
                            time=time_str,
                            wa_points=wa_points,
                            ranking=None,  # Not available in this format
                            meet_date=meet_date,
                            venue=venue,
                            meet_name=meet_name,
                            round_type=RoundType.FINALS,  # Default
                            season=self._get_season_from_date(meet_date)
                        )
                        
                        records.append(record)
                        
                    except Exception as e:
                        logger.warning(f"Error parsing record row: {e}")
                        continue
            
            logger.info(f"Scraped {len(records)} records for tiref {tiref}")
            return records
            
        except Exception as e:
            logger.error(f"Error scraping swim records for {tiref}: {e}")
            return []
    
    def _extract_events_from_records(self, records: List[SwimRecord]) -> List[Dict[str, Any]]:
        """Extract unique events (stroke/distance/course combinations) from personal best records"""
        events = []
        seen_events = set()
        
        # Mapping for stroke types to URL parameters
        stroke_mapping = {
            StrokeType.FREESTYLE: {50: 1, 100: 2, 200: 3, 400: 4, 800: 5, 1500: 6},
            StrokeType.BREASTSTROKE: {50: 7, 100: 8, 200: 9},
            StrokeType.BUTTERFLY: {50: 10, 100: 11, 200: 12},
            StrokeType.BACKSTROKE: {50: 13, 100: 14, 200: 15},
            StrokeType.INDIVIDUAL_MEDLEY: {100: 18, 200: 16, 400: 17}
        }
        
        for record in records:
            if record.stroke in stroke_mapping and record.distance in stroke_mapping[record.stroke]:
                # Create unique identifier for this event
                event_key = f"{record.stroke.value}_{record.distance}_{record.pool_type.value}"
                
                if event_key not in seen_events:
                    seen_events.add(event_key)
                    
                    # Get stroke ID for URL
                    stroke_id = stroke_mapping[record.stroke][record.distance]
                    course_code = 'L' if record.pool_type == PoolType.LONG_COURSE else 'S'
                    
                    events.append({
                        'stroke': record.stroke,
                        'distance': record.distance,
                        'pool_type': record.pool_type,
                        'stroke_id': stroke_id,
                        'course_code': course_code,
                        'event_name': record.event_name
                    })
        
        logger.info(f"Found {len(events)} unique events to scrape detailed history for")
        return events
    
    def _scrape_event_race_history(self, tiref: str, event_info: Dict[str, Any]) -> List[SwimRecord]:
        """Scrape complete race history for a specific event"""
        try:
            stroke_id = event_info['stroke_id']
            course_code = event_info['course_code']
            
            # Build URL for individual event history
            url = f"{self.BASE_URL}/individualbest/personal_best_time_date.php"
            params = {
                'back': 'individualbest',
                'tiref': tiref,
                'mode': 'A',
                'tstroke': stroke_id,
                'tcourse': course_code
            }
            
            response = self._make_request(url, params)
            if not response:
                return []
            
            soup = BeautifulSoup(response.content, 'html.parser')
            records = []
            
            # Find tables containing race data
            tables = soup.find_all('table')
            
            for table in tables:
                rows = table.find_all('tr')
                
                if len(rows) < 2:  # Need at least header + 1 data row
                    continue
                
                # Process data rows
                for row in rows[1:]:
                    try:
                        cells = row.find_all(['td', 'th'])
                        if len(cells) < 4:  # Need minimum columns for valid data
                            continue
                        
                        # Extract data from individual event page format
                        time_str = cells[0].get_text(strip=True) if len(cells) > 0 else ""
                        wa_points_str = cells[1].get_text(strip=True) if len(cells) > 1 else ""
                        round_str = cells[2].get_text(strip=True) if len(cells) > 2 else ""
                        date_str = cells[3].get_text(strip=True) if len(cells) > 3 else ""
                        meet_name = cells[4].get_text(strip=True) if len(cells) > 4 else ""
                        venue = cells[5].get_text(strip=True) if len(cells) > 5 else ""
                        club = cells[6].get_text(strip=True) if len(cells) > 6 else ""
                        level = cells[7].get_text(strip=True) if len(cells) > 7 else ""
                        
                        # Validate essential data
                        if not all([time_str, date_str]):
                            continue
                        
                        # Parse date
                        meet_date = self._parse_date_v2(date_str)
                        if not meet_date:
                            continue
                        
                        # Parse WA points
                        wa_points = None
                        try:
                            if wa_points_str and wa_points_str.isdigit():
                                wa_points = int(wa_points_str)
                        except:
                            pass
                        
                        # Determine round type
                        round_type = RoundType.FINALS
                        if round_str.upper() == 'H':
                            round_type = RoundType.HEATS
                        elif round_str.upper() == 'SF':
                            round_type = RoundType.SEMI_FINALS
                        elif round_str.upper() == 'F':
                            round_type = RoundType.FINALS
                        
                        # Create swim record
                        record = SwimRecord(
                            tiref=tiref,
                            event_name=event_info['event_name'],
                            stroke=event_info['stroke'],
                            distance=event_info['distance'],
                            pool_type=event_info['pool_type'],
                            time=time_str,
                            wa_points=wa_points,
                            ranking=None,
                            meet_date=meet_date,
                            venue=venue,
                            meet_name=meet_name,
                            round_type=round_type,
                            season=self._get_season_from_date(meet_date)
                        )
                        
                        records.append(record)
                        
                    except Exception as e:
                        logger.warning(f"Error parsing race record row for {event_info['event_name']}: {e}")
                        continue
            
            logger.info(f"Scraped {len(records)} race records for {event_info['event_name']} ({event_info['pool_type'].value})")
            return records
            
        except Exception as e:
            logger.error(f"Error scraping event race history for {event_info}: {e}")
            return []
    
    def _deduplicate_records(self, records: List[SwimRecord]) -> List[SwimRecord]:
        """Remove duplicate records based on key attributes"""
        seen_records = set()
        unique_records = []
        
        for record in records:
            # Create unique key based on event, time, date, and meet
            record_key = (
                record.stroke.value,
                record.distance,
                record.pool_type.value,
                record.time,
                record.meet_date.strftime('%Y-%m-%d') if record.meet_date else 'unknown',
                record.meet_name
            )
            
            if record_key not in seen_records:
                seen_records.add(record_key)
                unique_records.append(record)
        
        logger.info(f"Deduplicated {len(records)} records to {len(unique_records)} unique records")
        return unique_records
    
    def _parse_event_name_v2(self, event_name: str) -> Tuple[Optional[StrokeType], Optional[int]]:
        """Parse event name to extract stroke and distance (updated for actual data)"""
        if not event_name:
            return None, None
        
        # Default values
        stroke = None
        distance = None
        
        # Extract distance (e.g., "50 Freestyle" -> 50)
        distance_match = re.search(r'(\d+)', event_name)
        if distance_match:
            distance = int(distance_match.group(1))
        
        # Extract stroke with improved patterns
        event_lower = event_name.lower()
        if 'freestyle' in event_lower or 'free' in event_lower or 'fr' in event_lower:
            stroke = StrokeType.FREESTYLE
        elif 'backstroke' in event_lower or 'back' in event_lower or 'bk' in event_lower:
            stroke = StrokeType.BACKSTROKE
        elif 'breaststroke' in event_lower or 'breast' in event_lower or 'br' in event_lower:
            stroke = StrokeType.BREASTSTROKE
        elif 'butterfly' in event_lower or 'fly' in event_lower or 'bf' in event_lower:
            stroke = StrokeType.BUTTERFLY
        elif 'medley' in event_lower or 'im' in event_lower or 'individual medley' in event_lower:
            stroke = StrokeType.INDIVIDUAL_MEDLEY
        
        return stroke, distance
    
    def _calculate_wa_points(self, time_seconds: float, stroke: StrokeType, distance: int, pool_type: str, gender: str = 'M') -> int:
        """Calculate World Aquatics (WA) points for a swim time"""
        # Simplified WA points calculation based on world record ratios
        # In a real implementation, you'd use official WA point scoring tables
        
        # World record reference times (in seconds) - approximate values for calculation
        wr_times = {
            ('Freestyle', 50, 'LC', 'M'): 20.91,
            ('Freestyle', 100, 'LC', 'M'): 46.86,
            ('Freestyle', 200, 'LC', 'M'): 104.00,
            ('Freestyle', 400, 'LC', 'M'): 220.07,
            ('Freestyle', 800, 'LC', 'M'): 458.17,
            ('Freestyle', 1500, 'LC', 'M'): 871.02,
            ('Backstroke', 50, 'LC', 'M'): 23.71,
            ('Backstroke', 100, 'LC', 'M'): 51.60,
            ('Backstroke', 200, 'LC', 'M'): 111.92,
            ('Breaststroke', 50, 'LC', 'M'): 25.95,
            ('Breaststroke', 100, 'LC', 'M'): 56.88,
            ('Breaststroke', 200, 'LC', 'M'): 125.95,
            ('Butterfly', 50, 'LC', 'M'): 22.27,
            ('Butterfly', 100, 'LC', 'M'): 49.45,
            ('Butterfly', 200, 'LC', 'M'): 110.73,
            ('Individual Medley', 200, 'LC', 'M'): 113.42,
            ('Individual Medley', 400, 'LC', 'M'): 240.54,
        }
        
        # Adjust for short course (roughly 3-5% faster)
        pool_factor = 0.96 if pool_type == 'SC' else 1.0
        
        # Get world record time for this event
        key = (stroke.value if stroke else 'Freestyle', distance, 'LC', gender)
        wr_time = wr_times.get(key)
        
        if not wr_time:
            # Fallback for unknown events
            return max(1, int(1000 - (time_seconds * 10)))
        
        # Adjust world record for pool type
        adjusted_wr = wr_time * pool_factor
        
        # Calculate points (1000 points = world record, decreases as time increases)
        if time_seconds <= adjusted_wr:
            # Faster than world record (theoretical)
            points = 1000 + int((adjusted_wr - time_seconds) * 50)
        else:
            # Slower than world record
            ratio = adjusted_wr / time_seconds
            points = int(1000 * (ratio ** 3))  # Cubic scaling for more realistic point distribution
        
        return max(1, min(points, 1500))  # Cap between 1 and 1500 points
    
    def _extract_venue_details(self, venue_text: str) -> Tuple[str, Optional[str]]:
        """Extract venue name and location from venue text"""
        if not venue_text:
            return "Unknown Venue", None
        
        # Common patterns for venue text
        # e.g., "Sydney Olympic Park Aquatic Centre, Sydney NSW"
        # e.g., "SOPAC, Homebush"
        # e.g., "Aquatic Centre - Melbourne VIC"
        
        parts = venue_text.split(',')
        venue_name = parts[0].strip()
        location = parts[1].strip() if len(parts) > 1 else None
        
        # Clean up venue name
        venue_name = venue_name.replace(' - ', ' ')
        venue_name = ' '.join(venue_name.split())  # Remove extra whitespace
        
        return venue_name, location
    
    def _parse_time_improved(self, time_str: str) -> Tuple[Optional[float], str]:
        """Parse time string and convert to seconds with improved handling"""
        if not time_str or time_str.lower() in ['ns', 'dq', 'dns', 'dnf']:
            return None, time_str
        
        try:
            # Remove any extra whitespace and common prefixes
            time_str = time_str.strip().replace('NT', '').replace('PB', '').strip()
            
            # Handle different time formats
            if ':' in time_str:
                # Format: MM:SS.sss or H:MM:SS.sss
                parts = time_str.split(':')
                if len(parts) == 2:
                    # MM:SS.sss
                    minutes = float(parts[0])
                    seconds = float(parts[1])
                    total_seconds = minutes * 60 + seconds
                elif len(parts) == 3:
                    # H:MM:SS.sss
                    hours = float(parts[0])
                    minutes = float(parts[1])
                    seconds = float(parts[2])
                    total_seconds = hours * 3600 + minutes * 60 + seconds
                else:
                    return None, time_str
            else:
                # Format: SS.sss (seconds only)
                total_seconds = float(time_str)
            
            return total_seconds, time_str
            
        except (ValueError, IndexError):
            logger.warning(f"Could not parse time: {time_str}")
            return None, time_str
    
    def _parse_date_v2(self, date_str: str) -> Optional[datetime]:
        """Parse date string to datetime object (updated for actual format)"""
        if not date_str:
            return None
        
        # The actual format appears to be dd/mm/yy (e.g., "10/05/25")
        date_formats = [
            '%d/%m/%y',    # 10/05/25
            '%d/%m/%Y',    # 10/05/2025
            '%d-%m-%y',    # 10-05-25
            '%d-%m-%Y',    # 10-05-2025
            '%Y-%m-%d',    # 2025-05-10
            '%d %b %Y',    # 10 May 2025
            '%d %B %Y',    # 10 May 2025
            '%b %d, %Y',   # May 10, 2025
            '%B %d, %Y'    # May 10, 2025
        ]
        
        for fmt in date_formats:
            try:
                parsed_date = datetime.strptime(date_str.strip(), fmt)
                # Handle 2-digit years (assume 20xx for years < 50, 19xx for years >= 50)
                if parsed_date.year < 50:
                    parsed_date = parsed_date.replace(year=parsed_date.year + 2000)
                elif parsed_date.year < 100:
                    parsed_date = parsed_date.replace(year=parsed_date.year + 1900)
                return parsed_date
            except ValueError:
                continue
        
        logger.warning(f"Could not parse date: {date_str}")
        return None
    
    def _get_season_from_date(self, meet_date: datetime) -> str:
        """Get swimming season from meet date"""
        # Swimming season typically runs September to August
        if meet_date.month >= 9:
            return f"{meet_date.year}-{meet_date.year + 1}"
        else:
            return f"{meet_date.year - 1}-{meet_date.year}"
    
    def scrape_swimmer_data(self, tiref: str) -> Tuple[Optional[SwimmerInfo], List[SwimRecord]]:
        """Scrape complete swimmer data (info + records)"""
        logger.info(f"Starting scrape for tiref: {tiref}")
        
        # Validate tiref first
        if not self.validate_tiref(tiref):
            logger.error(f"Invalid tiref: {tiref}")
            return None, []
        
        # Scrape swimmer info
        swimmer_info = self.scrape_swimmer_info(tiref)
        if not swimmer_info:
            logger.warning(f"Could not get swimmer info for {tiref}")
            # Create minimal info if we can't get it from bio page
            swimmer_info = SwimmerInfo(
                tiref=tiref,
                name=f"Swimmer {tiref}",
                club=None,
                age_group=None,
                last_updated=datetime.now()
            )
        
        # Scrape swim records
        swim_records = self.scrape_swim_records(tiref)
        
        logger.info(f"Completed scrape for {tiref}: {len(swim_records)} records found")
        return swimmer_info, swim_records

# Create a global scraper instance
scraper = SwimmingResultsScraper()
