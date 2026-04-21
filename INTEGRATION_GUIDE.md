# LocoFinder - Integrated Version

## What's New

This integrated version combines the best of both projects:

### From Main (Preserved)
✅ Sophisticated location scoring engine  
✅ DuckDB analytics with Parquet data  
✅ Redis caching  
✅ Next.js 14 + TypeScript frontend  
✅ Business filtering and recommendations  
✅ Production-ready architecture  

### From Main1 (Added)
🆕 Google Places API integration - competitor analysis  
🆕 Geospatial analysis - boundary and zoning checks  
🆕 Census API - population demographics  
🆕 Interactive map with Leaflet  
🆕 Population density visualization  
🆕 Market metrics (competitors per 10k people)  

## Quick Start

### 1. Environment Setup

Create `.env` file in the `backend` directory:

```bash
# Required for mapping features
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Optional (Census API works without key but with rate limits)
CENSUS_API_KEY=your_census_api_key_here

# Existing config
REDIS_URL=redis://localhost:6379
DATABASE_URL=backend/data/locations.db
```

### 2. Install Dependencies

**Backend:**
```bash
cd backend
pip install -r requirements.txt
```

**Frontend:**
```bash
cd frontend
npm install
```

### 3. Setup Geospatial Data

The mapping features require GeoJSON files. Place these in `backend/data/geo/`:

- `SDBoundary.geojson` - City/region boundary
- `SDZoning.geojson` - Zoning data with zone_name property
- `SDBlockgrp.geojson` - Census block groups with GEOID

**Note:** These files are in the main1 project. Copy them:
```bash
mkdir -p backend/data/geo
cp path/to/main1/backend/data/*.geojson backend/data/geo/
```

### 4. Run the Application

**Backend** (terminal 1):
```bash
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

**Frontend** (terminal 2):
```bash
cd frontend
npm run dev
```

**Access:**
- Main Dashboard: http://localhost:3000
- Market Research: http://localhost:3000/market-research
- API Docs: http://localhost:8001/docs

## New API Endpoints

### Market Research Routes (`/api/v1/market`)

#### 1. Search Competitors
```bash
POST /api/v1/market/competitors/search
```

Request:
```json
{
  "business_type": "cafe",
  "center": {"lat": 32.7157, "lng": -117.1611},
  "radius_meters": 1500,
  "commercial_only": false
}
```

Response:
```json
{
  "places": [...],
  "summary": {
    "count": 15,
    "avg_rating": 4.2,
    "avg_review_count": 234,
    "top5": [...]
  }
}
```

#### 2. Get Place Details
```bash
GET /api/v1/market/competitors/details/{place_id}
```

#### 3. Population Summary
```bash
POST /api/v1/market/population/summary
```

Request:
```json
{
  "center": {"lat": 32.7157, "lng": -117.1611},
  "radius_meters": 1500
}
```

Response:
```json
{
  "population_estimate": 12543,
  "radius_meters": 1500,
  "center": {"lat": 32.7157, "lng": -117.1611}
}
```

#### 4. Geospatial Layers
```bash
GET /api/v1/market/geo/boundary        # City boundary GeoJSON
GET /api/v1/market/geo/zoning          # Zoning GeoJSON
GET /api/v1/market/population/blockgroups  # Population choropleth
```

#### 5. Point Check (Debug)
```bash
POST /api/v1/market/geo/point-check
```

## Project Structure

```
integrated-locofinder/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes_health.py
│   │   │   ├── routes_locations.py
│   │   │   ├── routes_scoring.py
│   │   │   ├── routes_admin.py
│   │   │   └── routes_market_research.py  # NEW
│   │   ├── services/
│   │   │   ├── google_places_service.py   # NEW
│   │   │   ├── geospatial_service.py      # NEW
│   │   │   ├── census_service.py          # NEW
│   │   │   └── ... (existing services)
│   │   ├── main.py  # Updated with CORS and new routes
│   │   └── ... (existing structure)
│   ├── data/
│   │   ├── geo/  # NEW
│   │   │   ├── SDBoundary.geojson
│   │   │   ├── SDZoning.geojson
│   │   │   └── SDBlockgrp.geojson
│   │   └── ... (existing data)
│   └── requirements.txt  # Updated with geospatial libs
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── market-research/
│   │   │   │   └── page.tsx  # NEW - Market research page
│   │   │   └── ... (existing pages)
│   │   ├── components/
│   │   │   ├── market/
│   │   │   │   └── MarketMap.tsx  # NEW - Interactive map
│   │   │   └── ... (existing components)
│   │   └── ...
│   └── package.json  # Already has leaflet
```

## Usage Guide

### Market Research Page

1. **Navigate** to http://localhost:3000/market-research

2. **Select business type** from dropdown (cafe, restaurant, gym, etc.)

3. **Adjust radius** using the slider (0.5 - 5 miles)

4. **Click on map** to set search center point

5. **Click "Search Competitors"** to find nearby businesses

6. **Toggle layers:**
   - City Boundary - Shows administrative boundary
   - Zoning - Color-coded zoning categories
   - Population Density - Choropleth of population by block group

7. **Review results:**
   - Market Summary shows count, avg rating, population metrics
   - Competitors list shows all matches
   - Click on competitor to see details
   - Map markers show ratings

### Integration with Existing Features

The market research features complement the existing location scoring:

**Original Flow (Preserved):**
1. Filter by business type and budget
2. Get scored and ranked locations
3. View top recommendations

**Enhanced Flow (New):**
1. Find a location candidate
2. Analyze competitors in the area using market research
3. Check population density and demographics
4. Verify zoning compliance
5. Make informed decision with both scoring AND market data

## API Key Setup

### Google Maps API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project or select existing
3. Enable APIs:
   - Places API (New)
4. Create credentials → API Key
5. Add to `.env` as `GOOGLE_MAPS_API_KEY`

**Cost estimate:** ~$17 per 1000 Nearby Search requests  
**Recommendation:** Set up billing alerts and quotas

### Census API (Optional)

1. Request free key at [Census API](https://api.census.gov/data/key_signup.html)
2. Add to `.env` as `CENSUS_API_KEY`

Works without key but with lower rate limits.

## Key Features

### 1. Competitor Analysis
- Search radius: 0.5 - 5 miles
- Type-specific filtering
- Rating and review aggregation
- Market density metrics

### 2. Geospatial Intelligence
- Point-in-polygon boundary checks
- Commercial/mixed-use zone filtering
- Zone category determination
- Area-weighted calculations

### 3. Population Demographics
- Census block group level data
- Area-weighted population in radius
- Choropleth visualization
- Market density (competitors per 10k people)

### 4. Interactive Mapping
- Leaflet-based map
- Multiple overlay layers
- Competitor markers with ratings
- Click-to-search functionality

## Testing

### Backend API Tests

```bash
cd backend

# Test health endpoint
curl http://localhost:8001/health

# Test competitor search
curl -X POST http://localhost:8001/api/v1/market/competitors/search \
  -H "Content-Type: application/json" \
  -d '{
    "business_type": "cafe",
    "center": {"lat": 32.7157, "lng": -117.1611},
    "radius_meters": 1500
  }'

# Test point check
curl -X POST http://localhost:8001/api/v1/market/geo/point-check \
  -H "Content-Type: application/json" \
  -d '{"lat": 32.7157, "lng": -117.1611}'
```

### Frontend Tests

1. Visit http://localhost:3000/market-research
2. Click on map to set search point
3. Click "Search Competitors"
4. Toggle each layer (boundary, zoning, population)
5. Click on competitor markers
6. Select different business types

## Troubleshooting

### "Missing GOOGLE_MAPS_API_KEY"
Add the key to `backend/.env` file

### "Boundary/Zoning data not found"
Copy GeoJSON files to `backend/data/geo/` directory

### Map not loading
- Check browser console for errors
- Verify Leaflet CSS is loaded
- Try hard refresh (Ctrl+Shift+R)

### No competitors found
- Check if Google Places API is enabled
- Verify API key has correct permissions
- Try larger radius
- Check if location is within boundary

### CORS errors
Main.py has been updated with CORS middleware. If issues persist:
- Clear browser cache
- Check backend is on port 8001
- Verify frontend is on port 3000 or 3001

## Performance Considerations

### Caching
- Google Places API responses should be cached (implement Redis cache)
- Census data can be cached daily
- Geospatial files are loaded once on startup

### Data Size
- GeoJSON files are large (38MB in main1)
- Consider using PostGIS for production
- Implement pagination for large result sets

### Rate Limits
- Google Places: Quota based on billing
- Census API: ~500 requests/day without key, higher with key
- Implement exponential backoff for retries

## Next Steps

1. **Enhance Scoring Engine**
   - Add competitor density as scoring factor
   - Include population metrics
   - Weight commercial zones higher

2. **Data Enrichment Pipeline**
   - Batch enrich existing locations with market data
   - Schedule periodic updates
   - Add competitor tracking over time

3. **Advanced Analytics**
   - Market saturation analysis
   - Growth trend predictions
   - Demographic targeting

4. **User Experience**
   - Save favorite searches
   - Export reports
   - Share market analyses

## License

Same as original project

## Support

For questions about:
- Original features: See main project documentation
- New mapping features: Check this integration guide
- API issues: Review API docs at http://localhost:8001/docs
