"""
Updated Scoring Routes - Now includes market research data enrichment.

This adds competitor count, population, zone category, and market saturation
to each scored location.
"""

from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

from app.services.location_enrichment_service import LocationEnrichmentService


# Request/Response Models
class ScoringRequest(BaseModel):
    """Request for location scoring with optional market research."""
    # Original filters
    median_income_weight: float = 0.55
    crime_index_weight: float = 0.55
    growth_index_weight: float = 0.35
    home_price_weight: float = 0.15
    rent_price_weight: float = 0.45
    
    state: Optional[str] = None
    max_home_price: Optional[int] = None
    max_rent_price: Optional[int] = None
    min_median_income: Optional[int] = None
    
    limit: int = 20
    bypass_cache: bool = False
    
    # NEW: Market research options
    include_market_data: bool = True
    business_type: str = "cafe"
    search_radius_miles: float = 1.0
    include_market_score: bool = True


class EnrichedLocation(BaseModel):
    """Location with both scoring and market research data."""
    # Original fields
    location_id: str
    city: str
    state: str
    latitude: float
    longitude: float
    
    # Scoring data
    total_score: float
    median_income: Optional[int] = None
    crime_index: Optional[float] = None
    growth_index: Optional[float] = None
    home_price: Optional[int] = None
    rent_price: Optional[int] = None
    
    # NEW: Market research data
    competitor_count: Optional[int] = None
    population_estimate: Optional[int] = None
    zone_category: Optional[str] = None
    in_commercial_zone: Optional[bool] = None
    market_saturation: Optional[float] = None
    market_score: Optional[float] = None


router = APIRouter()
enrichment_service = LocationEnrichmentService()


@router.post("/score", response_model=List[EnrichedLocation])
async def score_locations(request: ScoringRequest):
    """
    Score and rank locations based on weights and filters.
    NOW INCLUDES market research data for each location.
    
    Returns locations with:
    - Original scoring (income, crime, growth, rent, etc.)
    - NEW: Competitor count
    - NEW: Population estimate
    - NEW: Zone category
    - NEW: Market saturation score
    - NEW: Market opportunity score
    """
    
    # Step 1: Get scored locations using original logic
    # (Your existing scoring logic here - I'll show integration pattern)
    scored_locations = await _get_scored_locations(request)
    
    if not scored_locations:
        return []
    
    # Step 2: Enrich with market research data if requested
    if request.include_market_data:
        try:
            radius_meters = int(request.search_radius_miles * 1609)
            
            enriched_locations = enrichment_service.enrich_locations_batch(
                locations=scored_locations,
                business_type=request.business_type,
                radius_meters=radius_meters,
            )
            
            # Step 3: Add market score if requested
            if request.include_market_score:
                for location in enriched_locations:
                    market_score = enrichment_service.calculate_market_score(location)
                    location["market_score"] = market_score
                    
                    # Optionally: Combine with total_score
                    # location["combined_score"] = (location["total_score"] * 0.7) + (market_score * 0.3)
            
            return enriched_locations
            
        except Exception as e:
            print(f"Error enriching locations: {e}")
            # Return original scored locations if enrichment fails
            return scored_locations
    
    return scored_locations


async def _get_scored_locations(request: ScoringRequest) -> List[Dict[str, Any]]:
    """
    Your existing scoring logic goes here.
    This is a placeholder - you'll integrate your actual scoring service.
    
    Should return list of dicts with:
    - location_id, city, state, latitude, longitude
    - total_score
    - median_income, crime_index, growth_index, home_price, rent_price
    """
    # TODO: Replace with your actual scoring logic
    # Example:
    # from app.services.scoring_service import ScoringService
    # scoring_service = ScoringService()
    # return scoring_service.score_locations(request)
    
    raise NotImplementedError("Integrate with your existing scoring service")


def register_routes(app):
    """Register scoring routes."""
    app.include_router(router, prefix="/api/v1/scoring", tags=["scoring"])
