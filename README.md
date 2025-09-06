# 🏊‍♀️ SwimBuddy Pro

A comprehensive swimming performance analytics desktop application that fetches real competitive swimming data from live websites and provides professional-grade insights through beautiful visualizations.

## Features

- **Real Data Integration**: Scrapes live data from swimmingresults.org
- **Membership ID Input**: Enter tiref ID to fetch specific swimmer data
- **Smart Caching**: Cache-first approach with manual refresh capability
- **Multi-Swimmer Support**: Track multiple swimmers and switch between them
- **Performance Analytics**: Interactive charts and trend analysis
- **Personal Best Tracking**: Automatic record identification
- **Stroke Analysis**: Detailed analysis by stroke type and distance
- **Offline Capability**: Full functionality without internet connection

## Architecture

- **Frontend**: React 18 + TypeScript + Vite + Electron
- **Backend**: Python FastAPI with web scraping
- **Database**: SQLite for local caching
- **UI**: Chakra UI with swimming theme
- **Charts**: Chart.js for interactive visualizations

## Quick Start

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # On Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Desktop App
```bash
cd frontend
npm run electron
```

## Project Structure

```
SwimBuddyPro/
├── backend/
│   ├── app/
│   │   ├── api/          # API endpoints
│   │   ├── scraper/      # Web scraping modules
│   │   ├── database/     # Database operations
│   │   ├── models/       # Data models
│   │   └── main.py       # FastAPI app
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Application pages
│   │   ├── hooks/        # Custom React hooks
│   │   ├── utils/        # Utility functions
│   │   └── electron/     # Electron configuration
│   └── package.json
└── README.md
```

## Development

This project follows a phased development approach:

1. **Phase 1**: Core scraping and caching infrastructure
2. **Phase 2**: Basic UI with swimmer input and data display
3. **Phase 3**: Advanced analytics and visualizations
4. **Phase 4**: Multi-swimmer support and data management

## License

MIT License - see LICENSE file for details.
