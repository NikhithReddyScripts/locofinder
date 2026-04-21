# Deployment Checklist

Use this checklist to deploy the integrated LocoFinder project.

## Pre-Deployment

### 1. Get API Keys
- [ ] Google Maps API Key from [Google Cloud Console](https://console.cloud.google.com/)
  - [ ] Enable "Places API (New)"
  - [ ] Set up billing (required for Places API)
  - [ ] Create API key
  - [ ] Restrict key to your domains/IPs
- [ ] Census API Key from [census.gov](https://api.census.gov/data/key_signup.html) (optional)

### 2. Prepare Geospatial Data
- [ ] Locate GeoJSON files from main1 project:
  - [ ] `SDBoundary.geojson` (city boundary)
  - [ ] `SDZoning.geojson` (zoning data)
  - [ ] `SDBlockgrp.geojson` (census block groups)
- [ ] Create target directory: `mkdir -p backend/data/geo`
- [ ] Copy files: `cp main1/backend/data/*.geojson backend/data/geo/`
- [ ] Verify files exist: `ls -lh backend/data/geo/`

### 3. Environment Setup
- [ ] Create `backend/.env` file
- [ ] Add required variables:
  ```bash
  GOOGLE_MAPS_API_KEY=your_actual_key_here
  CENSUS_API_KEY=your_census_key_here
  REDIS_URL=redis://localhost:6379
  DATABASE_URL=backend/data/locations.db
  ```
- [ ] Verify .env is in .gitignore (security!)

## Backend Setup

### 4. Python Environment
- [ ] Check Python version: `python --version` (need 3.11+)
- [ ] Create virtual environment (recommended):
  ```bash
  cd backend
  python -m venv venv
  source venv/bin/activate  # Linux/Mac
  # OR: venv\Scripts\activate  # Windows
  ```
- [ ] Install dependencies: `pip install -r requirements.txt`
- [ ] Verify geospatial libs installed:
  ```bash
  python -c "import geopandas; import shapely; print('OK')"
  ```

### 5. Test Backend
- [ ] Start backend: `uvicorn app.main:app --reload --port 8001`
- [ ] Check health: `curl http://localhost:8001/health`
- [ ] Check API docs: Visit `http://localhost:8001/docs`
- [ ] Test new endpoints:
  - [ ] GET `http://localhost:8001/api/v1/market/geo/boundary`
  - [ ] POST competitor search (see INTEGRATION_GUIDE.md for curl command)

## Frontend Setup

### 6. Node Environment
- [ ] Check Node version: `node --version` (need 18+)
- [ ] Check npm version: `npm --version`
- [ ] Install dependencies:
  ```bash
  cd frontend
  npm install
  ```
- [ ] Verify Leaflet installed: `npm list leaflet`

### 7. Test Frontend
- [ ] Start dev server: `npm run dev`
- [ ] Visit original dashboard: `http://localhost:3000`
- [ ] Visit market research: `http://localhost:3000/market-research`
- [ ] Check browser console for errors
- [ ] Test map interactions:
  - [ ] Click on map
  - [ ] Search competitors
  - [ ] Toggle layers

## Integration Testing

### 8. End-to-End Tests
- [ ] Original features still work:
  - [ ] `/health` endpoint responds
  - [ ] `/api/v1/locations` returns data
  - [ ] Dashboard filters work
  - [ ] Scoring engine works
- [ ] New features work:
  - [ ] Competitor search returns results
  - [ ] Map displays correctly
  - [ ] Boundary layer loads
  - [ ] Zoning layer loads
  - [ ] Population layer loads
  - [ ] Click on competitor shows popup

### 9. Performance Tests
- [ ] Check API response times
- [ ] Verify caching works (second request faster)
- [ ] Test with large radius (5 miles)
- [ ] Check memory usage during geospatial operations
- [ ] Monitor Google Places API quota usage

## Production Preparation

### 10. Security
- [ ] `.env` file in `.gitignore`
- [ ] API keys not committed to git
- [ ] CORS settings configured for production domains
- [ ] API rate limiting configured
- [ ] Redis password set (if using Redis)

### 11. Optimization
- [ ] Implement Redis caching for Google Places calls
- [ ] Add request timeout configurations
- [ ] Set up error logging (Sentry, etc.)
- [ ] Configure API quota alerts
- [ ] Add response compression

### 12. Docker Setup (Optional)
- [ ] Build backend image: `docker build -t locofinder-backend ./backend`
- [ ] Build frontend image: `docker build -t locofinder-frontend ./frontend`
- [ ] Test with docker-compose: `docker-compose up`
- [ ] Verify all services connect

## Deployment

### 13. Backend Deployment
- [ ] Set environment variables on server
- [ ] Copy GeoJSON files to server
- [ ] Install dependencies
- [ ] Configure reverse proxy (Nginx)
- [ ] Set up SSL/TLS
- [ ] Start backend service
- [ ] Configure auto-restart (systemd, supervisor)

### 14. Frontend Deployment
- [ ] Update API endpoints for production
- [ ] Build: `npm run build`
- [ ] Test production build: `npm run start`
- [ ] Deploy to hosting (Vercel, Netlify, etc.)
- [ ] Configure environment variables
- [ ] Set up SSL/TLS

### 15. Database & Cache
- [ ] Set up Redis (if not already)
- [ ] Configure Redis persistence
- [ ] Set up DuckDB backups
- [ ] Configure data retention policies

## Post-Deployment

### 16. Monitoring
- [ ] Set up uptime monitoring
- [ ] Configure error alerts
- [ ] Monitor API quota usage
- [ ] Track response times
- [ ] Set up log aggregation

### 17. Documentation
- [ ] Update README with production URLs
- [ ] Document deployment process
- [ ] Create runbook for common issues
- [ ] Document API rate limits
- [ ] Create user guide

## Rollback Plan

### 18. Backup Strategy
- [ ] Backup current working version
- [ ] Document rollback procedure
- [ ] Test rollback process
- [ ] Keep old version accessible

## Cost Management

### 19. API Costs
- [ ] Set Google Cloud billing alerts
- [ ] Configure API quotas
- [ ] Monitor daily usage
- [ ] Implement caching aggressively
- [ ] Set up cost reports

### 20. Infrastructure
- [ ] Right-size server resources
- [ ] Monitor memory usage
- [ ] Optimize database queries
- [ ] Configure auto-scaling (if needed)

## Validation Checklist

Before marking as complete:

- [ ] All tests pass
- [ ] No console errors
- [ ] API documentation accurate
- [ ] User guide created
- [ ] Team trained on new features
- [ ] Monitoring alerts configured
- [ ] Backup system working
- [ ] Rollback tested
- [ ] Performance acceptable
- [ ] Security review complete

## Common Issues & Solutions

### Backend won't start
- Check Python version (need 3.11+)
- Verify all dependencies installed
- Check .env file exists and has GOOGLE_MAPS_API_KEY
- Ensure port 8001 is free

### Frontend build fails
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node version (need 18+)
- Clear .next folder: `rm -rf .next`

### Map doesn't load
- Check browser console for errors
- Verify Leaflet CSS is imported
- Check API endpoints are accessible
- Try hard refresh (Ctrl+Shift+R)

### No competitors found
- Verify Google Maps API key is valid
- Check Places API (New) is enabled
- Confirm API has billing enabled
- Try larger search radius
- Check if location is within boundary

### Geospatial errors
- Verify GeoJSON files are in backend/data/geo/
- Check file permissions
- Ensure geopandas installed correctly
- Verify files are valid GeoJSON

## Next Steps After Deployment

1. Monitor initial usage patterns
2. Gather user feedback
3. Optimize based on real-world data
4. Plan feature enhancements
5. Schedule regular updates

## Support Contacts

- Backend issues: Check INTEGRATION_GUIDE.md
- Frontend issues: Check QUICK_REFERENCE.md
- API issues: http://localhost:8001/docs
- General: See README.md
