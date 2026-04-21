# Testing Guide - Integrated LocoFinder

This guide provides complete testing commands and expected responses for all new features.

## Prerequisites

- Backend running on http://localhost:8001
- Frontend running on http://localhost:3000
- Google Maps API key configured
- GeoJSON files in backend/data/geo/

## Backend API Testing

### 1. Health Check

```bash
curl http://localhost:8001/health
```

**Expected Response:**
```json
{
  "ok": true,
  "date": "2024-04-19"
}
```

---

### 2. Competitor Search

```bash
curl -X POST http://localhost:8001/api/v1/market/competitors/search \
  -H "Content-Type: application/json" \
  -d '{
    "business_type": "cafe",
    "center": {"lat": 32.7157, "lng": -117.1611},
    "radius_meters": 1500,
    "commercial_only": false
  }'
```

**Expected Response:**
```json
{
  "places": [
    {
      "id": "ChIJ...",
      "displayName": {"text": "Blue Bottle Coffee"},
      "location": {"latitude": 32.716, "longitude": -117.162},
      "rating": 4.5,
      "userRatingCount": 234,
      "primaryType": "cafe",
      "zone_category": "Commercial"
    }
    // ... more places
  ],
  "summary": {
    "count": 15,
    "avg_rating": 4.2,
    "avg_review_count": 189,
    "top5": [...]
  },
  "filters_applied": {
    "business_type": "cafe",
    "radius_meters": 1500,
    "commercial_only": false
  }
}
```

**Test Variations:**
```bash
# Commercial zones only
curl -X POST http://localhost:8001/api/v1/market/competitors/search \
  -H "Content-Type: application/json" \
  -d '{
    "business_type": "restaurant",
    "center": {"lat": 32.7157, "lng": -117.1611},
    "radius_meters": 3000,
    "commercial_only": true
  }'

# Different business types
for type in cafe coffee_shop restaurant gym bakery; do
  echo "Testing $type..."
  curl -X POST http://localhost:8001/api/v1/market/competitors/search \
    -H "Content-Type: application/json" \
    -d "{\"business_type\":\"$type\",\"center\":{\"lat\":32.7157,\"lng\":-117.1611},\"radius_meters\":1500}"
done
```

---

### 3. Place Details

First, get a place_id from competitor search, then:

```bash
curl http://localhost:8001/api/v1/market/competitors/details/ChIJYourPlaceIdHere
```

**Expected Response:**
```json
{
  "id": "ChIJ...",
  "displayName": {"text": "Blue Bottle Coffee"},
  "formattedAddress": "123 Main St, San Diego, CA 92101",
  "location": {"latitude": 32.716, "longitude": -117.162},
  "rating": 4.5,
  "userRatingCount": 234,
  "regularOpeningHours": {
    "weekdayDescriptions": [
      "Monday: 7:00 AM – 6:00 PM",
      "Tuesday: 7:00 AM – 6:00 PM"
      // ...
    ]
  },
  "websiteUri": "https://example.com",
  "nationalPhoneNumber": "(619) 555-0100",
  "reviews": [
    {
      "text": {"text": "Great coffee!"},
      "rating": 5,
      "relativePublishTimeDescription": "2 months ago"
    }
    // ...
  ]
}
```

---

### 4. Population Summary

```bash
curl -X POST http://localhost:8001/api/v1/market/population/summary \
  -H "Content-Type: application/json" \
  -d '{
    "center": {"lat": 32.7157, "lng": -117.1611},
    "radius_meters": 1500
  }'
```

**Expected Response:**
```json
{
  "population_estimate": 12543,
  "radius_meters": 1500,
  "center": {"lat": 32.7157, "lng": -117.1611}
}
```

**Test Variations:**
```bash
# Different radii
for radius in 800 1600 3200 4800; do
  echo "Testing radius $radius meters..."
  curl -X POST http://localhost:8001/api/v1/market/population/summary \
    -H "Content-Type: application/json" \
    -d "{\"center\":{\"lat\":32.7157,\"lng\":-117.1611},\"radius_meters\":$radius}"
done
```

---

### 5. Population Layer (Block Groups)

```bash
curl http://localhost:8001/api/v1/market/population/blockgroups
```

**Expected Response:**
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[-117.1, 32.7], ...]]
      },
      "properties": {
        "GEOID": "060730001001",
        "population": 1234
      }
    }
    // ... hundreds more features
  ]
}
```

---

### 6. Boundary GeoJSON

```bash
curl http://localhost:8001/api/v1/market/geo/boundary
```

**Expected Response:**
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "MultiPolygon",
        "coordinates": [...]
      },
      "properties": {...}
    }
  ]
}
```

---

### 7. Zoning GeoJSON

```bash
curl http://localhost:8001/api/v1/market/geo/zoning
```

**Expected Response:**
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [...]
      },
      "properties": {
        "zone_name": "CC-3-4",
        "zone_category": "Commercial"
      }
    }
    // ... many more features
  ]
}
```

---

### 8. Point Check (Debug)

```bash
curl -X POST http://localhost:8001/api/v1/market/geo/point-check \
  -H "Content-Type: application/json" \
  -d '{"lat": 32.7157, "lng": -117.1611}'
```

**Expected Response:**
```json
{
  "lat": 32.7157,
  "lng": -117.1611,
  "in_boundary": true,
  "in_commercial_zone": true,
  "zone_category": "Commercial"
}
```

**Test Edge Cases:**
```bash
# Point outside boundary
curl -X POST http://localhost:8001/api/v1/market/geo/point-check \
  -H "Content-Type: application/json" \
  -d '{"lat": 34.0522, "lng": -118.2437}'  # LA coordinates

# Point in residential zone
curl -X POST http://localhost:8001/api/v1/market/geo/point-check \
  -H "Content-Type: application/json" \
  -d '{"lat": 32.8, "lng": -117.2}'
```

---

## Frontend Testing

### 1. Market Research Page

**URL:** http://localhost:3000/market-research

**Manual Tests:**

1. **Map Interaction**
   - [ ] Map loads without errors
   - [ ] Can zoom in/out
   - [ ] Can pan around
   - [ ] Click sets search center (marker appears)

2. **Search Controls**
   - [ ] Business type dropdown has options
   - [ ] Radius slider changes value display
   - [ ] Commercial only checkbox toggles
   - [ ] Layer checkboxes toggle

3. **Competitor Search**
   - [ ] Click "Search Competitors" button
   - [ ] Loading state shows
   - [ ] Results appear in sidebar
   - [ ] Markers appear on map
   - [ ] Market summary displays

4. **Map Layers**
   - [ ] Toggle "City Boundary" - blue outline appears
   - [ ] Toggle "Zoning" - colored zones appear
   - [ ] Toggle "Population Density" - heatmap appears
   - [ ] Legend shows when layers active

5. **Competitor List**
   - [ ] Shows count
   - [ ] Shows ratings
   - [ ] Click on competitor highlights
   - [ ] Shows zone category if available

6. **Place Details**
   - [ ] Click competitor in list
   - [ ] Details panel appears
   - [ ] Shows name, rating, address
   - [ ] Click map marker shows popup

---

## Integration Tests

### Full Market Analysis Workflow

```bash
#!/bin/bash
# Complete market analysis test script

API_BASE="http://localhost:8001/api/v1/market"
LAT=32.7157
LNG=-117.1611
RADIUS=1500

echo "=== Market Analysis Test ==="
echo ""

# 1. Check point location
echo "1. Checking point location..."
curl -s -X POST $API_BASE/geo/point-check \
  -H "Content-Type: application/json" \
  -d "{\"lat\":$LAT,\"lng\":$LNG}" | jq .
echo ""

# 2. Get population
echo "2. Getting population estimate..."
POPULATION=$(curl -s -X POST $API_BASE/population/summary \
  -H "Content-Type: application/json" \
  -d "{\"center\":{\"lat\":$LAT,\"lng\":$LNG},\"radius_meters\":$RADIUS}" \
  | jq -r '.population_estimate')
echo "Population in $RADIUS m radius: $POPULATION"
echo ""

# 3. Search competitors
echo "3. Searching competitors..."
RESULT=$(curl -s -X POST $API_BASE/competitors/search \
  -H "Content-Type: application/json" \
  -d "{\"business_type\":\"cafe\",\"center\":{\"lat\":$LAT,\"lng\":$LNG},\"radius_meters\":$RADIUS}")

COMP_COUNT=$(echo $RESULT | jq -r '.summary.count')
AVG_RATING=$(echo $RESULT | jq -r '.summary.avg_rating')

echo "Competitors found: $COMP_COUNT"
echo "Average rating: $AVG_RATING"
echo ""

# 4. Calculate market density
if [ "$POPULATION" != "null" ] && [ "$COMP_COUNT" != "null" ]; then
  DENSITY=$(echo "scale=2; $COMP_COUNT * 10000 / $POPULATION" | bc)
  echo "Market density: $DENSITY competitors per 10k people"
fi
echo ""

echo "=== Test Complete ==="
```

Save as `test_market_analysis.sh`, make executable, and run:
```bash
chmod +x test_market_analysis.sh
./test_market_analysis.sh
```

---

## Performance Tests

### Response Time Benchmarks

```bash
# Test competitor search response time
time curl -X POST http://localhost:8001/api/v1/market/competitors/search \
  -H "Content-Type: application/json" \
  -d '{
    "business_type": "cafe",
    "center": {"lat": 32.7157, "lng": -117.1611},
    "radius_meters": 1500
  }' > /dev/null 2>&1

# Expected: 1-3 seconds (first call, no cache)
# Expected: <0.5 seconds (subsequent calls, with cache)
```

### Concurrent Requests

```bash
# Install apache bench if needed: apt-get install apache2-utils

# Test 100 concurrent requests
ab -n 100 -c 10 -p competitor_search.json -T application/json \
  http://localhost:8001/api/v1/market/competitors/search

# Create competitor_search.json:
echo '{
  "business_type": "cafe",
  "center": {"lat": 32.7157, "lng": -117.1611},
  "radius_meters": 1500
}' > competitor_search.json
```

---

## Error Cases to Test

### 1. Missing API Key
```bash
# Remove GOOGLE_MAPS_API_KEY from .env, restart backend
curl -X POST http://localhost:8001/api/v1/market/competitors/search \
  -H "Content-Type: application/json" \
  -d '{"business_type":"cafe","center":{"lat":32.7157,"lng":-117.1611},"radius_meters":1500}'

# Expected: HTTP 500 with error message about missing API key
```

### 2. Missing GeoJSON Files
```bash
# Temporarily rename geo folder
mv backend/data/geo backend/data/geo.bak

curl http://localhost:8001/api/v1/market/geo/boundary

# Expected: HTTP 404 with "Boundary data not found"

# Restore folder
mv backend/data/geo.bak backend/data/geo
```

### 3. Invalid Coordinates
```bash
curl -X POST http://localhost:8001/api/v1/market/competitors/search \
  -H "Content-Type: application/json" \
  -d '{
    "business_type": "cafe",
    "center": {"lat": 999, "lng": 999},
    "radius_meters": 1500
  }'

# Expected: Returns empty results or API error
```

### 4. Invalid Business Type
```bash
curl -X POST http://localhost:8001/api/v1/market/competitors/search \
  -H "Content-Type: application/json" \
  -d '{
    "business_type": "invalid_type",
    "center": {"lat": 32.7157, "lng": -117.1611},
    "radius_meters": 1500
  }'

# Expected: Returns empty results (Google Places API returns no matches)
```

---

## Validation Checklist

After running all tests:

- [ ] All API endpoints return valid JSON
- [ ] Response times acceptable (<3s for first call, <0.5s cached)
- [ ] Error messages are clear and helpful
- [ ] Map renders without errors
- [ ] All layers load correctly
- [ ] Competitor search returns relevant results
- [ ] Population data displays correctly
- [ ] No console errors in browser
- [ ] Mobile responsive (test on small screen)
- [ ] Works in Chrome, Firefox, Safari

---

## Troubleshooting

**No results from competitor search:**
- Verify API key is valid
- Check Places API (New) is enabled in Google Cloud
- Try different location or larger radius
- Check backend logs for errors

**GeoJSON layers not loading:**
- Verify files exist in backend/data/geo/
- Check file permissions
- Look for errors in browser console
- Try accessing endpoints directly via curl

**Slow response times:**
- Check Redis is running and connected
- Verify caching is working (second request should be faster)
- Consider reducing GeoJSON complexity
- Check network latency

**Population data incorrect:**
- Verify Census API key if using one
- Check block group GeoJSON has GEOID column
- Ensure area-weighted calculation is working
- Test with known location

---

## Next Steps

After all tests pass:

1. Load test with realistic usage patterns
2. Monitor API quota usage
3. Set up error tracking (Sentry, etc.)
4. Create automated test suite
5. Document any edge cases found
