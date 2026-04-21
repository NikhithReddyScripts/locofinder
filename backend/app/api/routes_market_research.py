"""
Market research API routes - competitor analysis, population data, geospatial queries.
"""
from typing import Any, Dict, Optional
import os

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field

from app.services.google_places_service import GooglePlacesService
from app.services.geospatial_service import GeospatialService
from app.services.census_service import CensusService
from app.core.config import settings


# Request/Response models
class CompetitorSearchRequest(BaseModel):
    business_type: str = Field(..., description="Business type (cafe, restaurant, gym, etc.)")
    center: Dict[str, float] = Field(..., description="Center point {lat, lng}")
    radius_meters: int = Field(1500, description="Search radius in meters")
    commercial_only: bool = Field(False, description="Filter to commercial/mixed-use zones only")


class PopulationSummaryRequest(BaseModel):
    center: Dict[str, float] = Field(..., description="Center point {lat, lng}")
    radius_meters: float = Field(1500, description="Search radius in meters")


class PointCheckRequest(BaseModel):
    lat: float
    lng: float


# Dependency injection for services
def get_google_places_service() -> GooglePlacesService:
    api_key = os.getenv("GOOGLE_MAPS_API_KEY", "")
    if not api_key:
        raise HTTPException(status_code=500, detail="GOOGLE_MAPS_API_KEY not configured")
    return GooglePlacesService(api_key)


def get_geospatial_service() -> GeospatialService:
    return GeospatialService()


def get_census_service() -> CensusService:
    api_key = os.getenv("CENSUS_API_KEY")
    return CensusService(api_key)


router = APIRouter(prefix="/api/v1/market", tags=["market-research"])


@router.post("/competitors/search")
async def search_competitors(
    request: CompetitorSearchRequest,
    places_service: GooglePlacesService = Depends(get_google_places_service),
    geo_service: GeospatialService = Depends(get_geospatial_service),
):
    """
    Search for competitor businesses near a location.
    
    Returns:
        - places: List of competitor places
        - summary: Market metrics (count, avg rating, top 5)
        - market_density: Competitors per 10k people (if population data available)
    """
    center = request.center
    lat = center["lat"]
    lng = center["lng"]
    
    # 1. Call Google Places API
    try:
        result = places_service.nearby_search(
            business_type=request.business_type,
            lat=lat,
            lng=lng,
            radius_m=request.radius_meters,
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Google Places API error: {str(e)}")
    
    places = result.get("places", []) or []
    
    # 2. Filter by type match
    places = places_service.filter_by_type(places, request.business_type)
    
    # 3. Apply geospatial filters
    filtered_places = []
    for place in places:
        loc = place.get("location") or {}
        plat = loc.get("latitude")
        plng = loc.get("longitude")
        
        if plat is None or plng is None:
            continue
        
        # Boundary check
        try:
            if not geo_service.point_in_boundary(plng, plat):
                continue
        except FileNotFoundError:
            # If boundary file not available, skip boundary check
            pass
        
        # Commercial zone check
        if request.commercial_only:
            try:
                if not geo_service.point_in_commercial_zone(plng, plat):
                    continue
            except FileNotFoundError:
                pass
        
        # Add zone category
        try:
            zone = geo_service.get_zone_category(plng, plat)
            place["zone_category"] = zone
        except Exception:
            place["zone_category"] = None
        
        filtered_places.append(place)
    
    # 4. Calculate market summary
    summary = places_service.calculate_market_summary(filtered_places)
    
    return {
        "places": filtered_places,
        "summary": summary,
        "filters_applied": {
            "business_type": request.business_type,
            "radius_meters": request.radius_meters,
            "commercial_only": request.commercial_only,
        },
    }


@router.get("/competitors/details/{place_id}")
async def get_place_details(
    place_id: str,
    places_service: GooglePlacesService = Depends(get_google_places_service),
):
    """Get detailed information about a specific place."""
    try:
        details = places_service.place_details(place_id)
        return details
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Google Places API error: {str(e)}")


@router.post("/population/summary")
async def get_population_summary(
    request: PopulationSummaryRequest,
    geo_service: GeospatialService = Depends(get_geospatial_service),
    census_service: CensusService = Depends(get_census_service),
):
    """
    Calculate estimated population within a radius using census block groups.
    Uses area-weighted overlay analysis.
    """
    center = request.center
    lat = center["lat"]
    lng = center["lng"]
    
    # Load block groups
    try:
        block_groups = geo_service.load_block_groups()
    except FileNotFoundError:
        raise HTTPException(
            status_code=400,
            detail="Census block groups data not available. Upload SDBlockgrp.geojson to backend/data/geo/",
        )
    
    # Fetch population data
    try:
        population_data = census_service.fetch_block_group_population()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Census API error: {str(e)}")
    
    # Create circle polygon
    circle = geo_service.create_circle_polygon(lng, lat, request.radius_meters)
    
    # Add population to block groups
    block_groups = block_groups.copy()
    block_groups["population"] = block_groups["GEOID"].map(population_data).fillna(0).astype(int)
    
    # Calculate area-weighted population
    pop_estimate = geo_service.calculate_area_weighted_sum(
        block_groups,
        "population",
        circle,
    )
    
    return {
        "population_estimate": round(pop_estimate),
        "radius_meters": request.radius_meters,
        "center": center,
    }


@router.get("/population/blockgroups")
async def get_population_layer(
    geo_service: GeospatialService = Depends(get_geospatial_service),
    census_service: CensusService = Depends(get_census_service),
):
    """
    Get block groups with population data as GeoJSON (for choropleth map).
    """
    try:
        population_data = census_service.fetch_block_group_population()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Census API error: {str(e)}")
    
    try:
        geojson = geo_service.get_block_groups_geojson(population_data)
        return geojson
    except FileNotFoundError:
        raise HTTPException(
            status_code=400,
            detail="Census block groups data not available",
        )


@router.get("/geo/boundary")
async def get_boundary(
    geo_service: GeospatialService = Depends(get_geospatial_service),
):
    """Get city/region boundary as GeoJSON."""
    try:
        return geo_service.get_boundary_geojson()
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Boundary data not found")


@router.get("/geo/zoning")
async def get_zoning(
    geo_service: GeospatialService = Depends(get_geospatial_service),
):
    """Get zoning data as GeoJSON."""
    try:
        return geo_service.get_zoning_geojson()
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Zoning data not found")


@router.post("/geo/point-check")
async def check_point(
    request: PointCheckRequest,
    geo_service: GeospatialService = Depends(get_geospatial_service),
):
    """
    Check if a point is within boundary and what zone it's in.
    Useful for debugging and validation.
    """
    result = {
        "lat": request.lat,
        "lng": request.lng,
    }
    
    try:
        result["in_boundary"] = geo_service.point_in_boundary(request.lng, request.lat)
    except FileNotFoundError:
        result["in_boundary"] = None
    
    try:
        result["in_commercial_zone"] = geo_service.point_in_commercial_zone(request.lng, request.lat)
    except FileNotFoundError:
        result["in_commercial_zone"] = None
    
    try:
        result["zone_category"] = geo_service.get_zone_category(request.lng, request.lat)
    except Exception:
        result["zone_category"] = None
    
    return result


def register_routes(app):
    """Register market research routes with FastAPI app."""
    app.include_router(router)
