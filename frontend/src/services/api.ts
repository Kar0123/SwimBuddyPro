const API_BASE_URL = 'http://localhost:8000'

export interface SwimRecord {
  id: string
  stroke: 'Freestyle' | 'Backstroke' | 'Breaststroke' | 'Butterfly' | 'Individual Medley' | 'Relay'
  distance: number // in meters: 50, 100, 200, 400, 800, 1500
  poolType: 'SC' | 'LC' // Short Course (25m) or Long Course (50m)
  time: string // in MM:SS.ss format
  timeInSeconds: number // for easy comparison
  date: string // ISO date format
  meet: string
  venue: string
  roundType: 'Finals' | 'Heats' | 'Semi-Finals' | 'Time Trial' | 'Qualifying'
  waPoints: number
  rank?: number
  heat?: number
  lane?: number
  isPersonalBest: boolean
  improvementFromPrevious?: number // seconds improved
  season: string // e.g., "2024-25"
}

export interface PersonalBest {
  stroke: string
  distance: number
  poolType: 'SC' | 'LC'
  bestTime: string
  bestTimeSeconds: number
  waPoints: number
  date: string
  meet: string
  venue: string
  improvementHistory: {
    previousBest: string
    improvement: number
    date: string
  }[]
}

export interface SwimmerStats {
  totalRaces: number
  personalBests: number
  averageWAPoints: number
  mostCommonStroke: string
  mostCommonDistance: number
  currentSeason: string
  seasonsCompeted: string[]
  recentImprovements: number
  competitionSpan: {
    firstRace: string
    lastRace: string
    yearsActive: number
  }
}

export interface SwimmerData {
  tiref: string
  name: string
  club?: string
  age?: number
  ageGroup?: string
  records: SwimRecord[]
  personalBests: PersonalBest[]
  stats: SwimmerStats
  lastUpdated: string
  cacheExpiry: string
}

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

class ApiService {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`
    console.log(`Making API request to: ${url}`)
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })

      console.log(`Response status: ${response.status} ${response.statusText}`)

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log('Response data:', data)
      
      return {
        data,
        success: true,
      }
    } catch (error) {
      console.error(`API request to ${endpoint} failed:`, error)
      return {
        data: null as T,
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }

  async getSwimmerData(tiref: string): Promise<ApiResponse<SwimmerData>> {
    return this.request<SwimmerData>(`/api/swimmers/${tiref}/complete`)
  }

  async scrapeSwimmerData(tiref: string, forceRefresh: boolean = false): Promise<ApiResponse<any>> {
    const endpoint = forceRefresh 
      ? `/api/scraper/refresh/${tiref}`
      : `/api/scraper/scrape/${tiref}`
    
    console.log(`Scraping swimmer data: ${endpoint} (forceRefresh: ${forceRefresh})`)
    
    return this.request<any>(endpoint, {
      method: 'POST',
    })
  }

  async healthCheck(): Promise<ApiResponse<{ status: string }>> {
    return this.request<{ status: string }>('/health')
  }

  async getSwimmersList(): Promise<ApiResponse<string[]>> {
    return this.request<string[]>('/api/swimmers/')
  }
}

export const apiService = new ApiService()

// Personal Bests Cards API
export interface PersonalBestCard {
  event_name: string
  stroke: string
  distance: number
  stroke_color: string
  stroke_icon: string
  primary_best: {
    time: string
    time_seconds: number
    pool_type: string
    date: string
    meet_name: string
    venue: string
    wa_points: number
    round_type: string
  }
  secondary_best?: {
    time: string
    time_seconds: number
    pool_type: string
    date: string
    meet_name: string
    venue: string
    wa_points: number
  }
  improvement: {
    recent_improvement: number
    season_improvement: number
    all_time_improvement: number
    trend: 'improving' | 'declining' | 'stable'
  }
  total_races: number
  seasons_competed: string[]
}

export interface PersonalBestsCardsData {
  tiref: string
  swimmer_name: string
  personal_bests: PersonalBestCard[]
  last_updated: string | null
}

export async function personalBestsCardsApi(tiref: string): Promise<PersonalBestsCardsData> {
  const response = await fetch(`${API_BASE_URL}/api/swimmers/${tiref}/personal-bests-cards`)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch personal bests cards: ${response.statusText}`)
  }
  
  return response.json()
}
