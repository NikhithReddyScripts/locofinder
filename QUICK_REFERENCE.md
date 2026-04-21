# Quick Reference - LocoFinder Integration

## What Changed?

### ✅ Preserved (From Main)
- All original backend routes and services
- Scoring engine with normalization and weighting
- DuckDB + Redis architecture
- Next.js frontend with existing pages
- Business filtering and recommendations

### 🆕 Added (From Main1)
- Google Places API competitor search
- Geospatial boundary and zoning analysis
- Census population data
- Interactive Leaflet map
- Market research page at `/market-research`

## File Changes

### New Files
```
backend/app/services/google_places_service.py
backend/app/services/geospatial_service.py
backend/app/services/census_service.py
backend/app/api/routes_market_research.py
backend/data/geo/SDBoundary.geojson (copy from main1)
backend/data/geo/SDZoning.geojson (copy from main1)
backend/data/geo/SDBlockgrp.geojson (copy from main1)

frontend/src/components/market/MarketMap.tsx
frontend/src/app/market-research/page.tsx
```

### Modified Files
```
backend/app/main.py - Added CORS, new route registration
backend/requirements.txt - Added geopandas, shapely, pyproj
```

## Quick Setup

```bash
# 1. Copy GeoJSON files
mkdir -p backend/data/geo
cp /path/to/main1/backend/data/*.geojson backend/data/geo/

# 2. Create .env
cat > backend/.env << EOF
GOOGLE_MAPS_API_KEY=your_key_here
CENSUS_API_KEY=your_key_here
REDIS_URL=redis://localhost:6379
EOF

# 3. Install dependencies
cd backend && pip install -r requirements.txt
cd ../frontend && npm install

# 4. Run (two terminals)
# Terminal 1:
cd backend && python -m uvicorn app.main:app --reload --port 8001

# Terminal 2:
cd frontend && npm run dev
```

## Testing the Integration

### Test Backend APIs
```bash
# Competitor search
curl -X POST http://localhost:8001/api/v1/market/competitors/search \
  -H "Content-Type: application/json" \
  -d '{
    "business_type": "cafe",
    "center": {"lat": 32.7157, "lng": -117.1611},
    "radius_meters": 1500
  }'

# Population estimate
curl -X POST http://localhost:8001/api/v1/market/population/summary \
  -H "Content-Type: application/json" \
  -d '{
    "center": {"lat": 32.7157, "lng": -117.1611},
    "radius_meters": 1500
  }'

# Boundary check
curl -X POST http://localhost:8001/api/v1/market/geo/point-check \
  -H "Content-Type: application/json" \
  -d '{"lat": 32.7157, "lng": -117.1611}'
```

### Test Frontend
1. Visit http://localhost:3000/market-research
2. Click on map to set search point
3. Select business type
4. Click "Search Competitors"
5. Toggle map layers (boundary, zoning, population)

## Key Endpoints

### New Market Research Routes
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/v1/market/competitors/search` | Find competitors |
| GET | `/api/v1/market/competitors/details/{id}` | Place details |
| POST | `/api/v1/market/population/summary` | Pop in radius |
| GET | `/api/v1/market/population/blockgroups` | Pop layer |
| GET | `/api/v1/market/geo/boundary` | Boundary GeoJSON |
| GET | `/api/v1/market/geo/zoning` | Zoning GeoJSON |
| POST | `/api/v1/market/geo/point-check` | Debug point |

### Original Routes (Unchanged)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/health` | Health check |
| GET | `/api/v1/locations` | Get locations |
| POST | `/api/v1/scoring/score` | Score locations |
| POST | `/admin/reset-dummy-data` | Reset data |

## Common Issues

### "GOOGLE_MAPS_API_KEY not configured"
**Fix:** Add key to `backend/.env`

### "Boundary data not found"
**Fix:** Copy GeoJSON files from main1 to `backend/data/geo/`

### Map not rendering
**Fix:** Hard refresh (Ctrl+Shift+R), check console for errors

### No competitors found
**Fix:** Try larger radius, check API key permissions

### CORS errors
**Fix:** Backend should be on 8001, frontend on 3000/3001

## Architecture

```
┌─────────────────────────────────────────────┐
│           Frontend (Next.js)                │
│  ┌──────────────┐   ┌──────────────────┐  │
│  │  Dashboard   │   │ Market Research  │  │
│  │  (Original)  │   │    (New Map)     │  │
│  └──────────────┘   └──────────────────┘  │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│         Backend (FastAPI)                   │
│  ┌──────────────────────────────────────┐  │
│  │  Original Routes    │  Market Routes  │  │
│  │  - Locations        │  - Competitors  │  │
│  │  - Scoring          │  - Population   │  │
│  │  - Admin            │  - Geo layers   │  │
│  └──────────────────────────────────────┘  │
│  ┌──────────────────────────────────────┐  │
│  │  Services                             │  │
│  │  - Scoring Engine (original)          │  │
│  │  - Google Places (new)                │  │
│  │  - Geospatial (new)                   │  │
│  │  - Census (new)                       │  │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
         │              │              │
         ▼              ▼              ▼
   ┌─────────┐   ┌──────────┐   ┌──────────┐
   │ DuckDB  │   │  Redis   │   │ GeoJSON  │
   │ Parquet │   │  Cache   │   │  Files   │
   └─────────┘   └──────────┘   └──────────┘
                                       │
                                       ▼
                              ┌──────────────────┐
                              │ External APIs    │
                              │ - Google Places  │
                              │ - Census ACS5    │
                              └──────────────────┘
```

## Dependencies Added

### Backend (requirements.txt)
- `geopandas>=1.0.1` - Geospatial data processing
- `shapely>=2.0.5` - Geometric operations
- `pyproj>=3.6.1` - Coordinate transformations
- `requests>=2.32.3` - HTTP client
- `python-dotenv>=1.0.1` - Environment variables

### Frontend (package.json)
- Already had `leaflet` and `@types/leaflet` ✅

## Environment Variables

```bash
# Required
GOOGLE_MAPS_API_KEY=      # Get from Google Cloud Console

# Optional
CENSUS_API_KEY=           # Free from census.gov
REDIS_URL=                # Default: redis://localhost:6379
DATABASE_URL=             # Default: backend/data/locations.db
```

## Cost Estimate

### Google Places API
- Nearby Search: ~$17 per 1,000 requests
- Place Details: ~$17 per 1,000 requests
- Recommendation: Implement caching, set quotas

### Census API
- Free with key (higher rate limits)
- Free without key (500 requests/day)

## Performance Tips

1. **Cache everything:** Google Places responses, Census data
2. **Lazy load:** GeoJSON layers only when toggled
3. **Optimize queries:** Use prepared geometries for fast spatial checks
4. **Rate limit:** Implement exponential backoff
5. **Batch:** Process multiple locations in one request

## Next Features to Build

1. **Scoring Integration:** Add competitor density to scoring engine
2. **Location Enrichment:** Batch enrich locations with market data
3. **Save Searches:** Let users save market analyses
4. **Export:** PDF reports with map snapshots
5. **Time Series:** Track market changes over time
