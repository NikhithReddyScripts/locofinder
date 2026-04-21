"""
Business Recommendations API Routes
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import logging

from app.services.enhanced_recommendation_service import EnhancedBusinessRecommendationService

logger = logging.getLogger("locofinder")

# Request/Response Models
class RecommendationRequest(BaseModel):
    """Request for business location recommendations."""
    business_type: str = "cafe"
    num_recommendations: int = 3
    search_radius_miles: float = 2.0
    min_population: int = 0
    max_competitors: int = 999
    commercial_only: bool = False
    focus_city: Optional[str] = None
    center_lat: Optional[float] = None
    center_lng: Optional[float] = None
    custom_profile: Optional[Dict[str, Any]] = None


def register_routes(app):
    """Register business recommendation routes with the FastAPI app."""
    
    @app.post("/api/v1/recommend/business-locations")
    async def recommend_business_locations(request: RecommendationRequest):
        """
        Get business location recommendations based on criteria.
        
        Now supports custom profiles with:
        - weights: dict of 7 scoring weights
        - target_age_range: [min, max]
        - min_income: int
        - ideal_saturation: float
        """
        
        try:
            logger.info(f"Received recommendation request for {request.business_type}")
            
            # Initialize service
            service = EnhancedBusinessRecommendationService()
            
            # Convert miles to meters
            radius_meters = int(request.search_radius_miles * 1609)
            
            # Get recommendations
            results = service.recommend_locations(
                business_type=request.business_type,
                num_recommendations=request.num_recommendations,
                search_radius_meters=radius_meters,
                center_lat=request.center_lat,
                center_lng=request.center_lng,
                min_population=request.min_population,
                max_competitors=request.max_competitors,
                commercial_only=request.commercial_only,
                custom_profile=request.custom_profile,
            )
            
            # Format response
            recommendations = []
            
            for result in results:
                # Format competitors
                competitors = []
                for comp in result.get("competitors", [])[:5]:
                    competitors.append({
                        "name": comp.get("displayName", {}).get("text", "Unknown"),
                        "rating": comp.get("rating"),
                        "reviews": comp.get("userRatingCount"),
                    })
                
                recommendations.append({
                    "location_id": result["location_id"],
                    "name": result["name"],
                    "lat": result["lat"],
                    "lng": result["lng"],
                    "opportunity_score": result["opportunity_score"],
                    "population_estimate": result["population_estimate"],
                    "competitor_count": result["competitor_count"],
                    "market_saturation": result["market_saturation"],
                    "zone_category": result.get("zone_category"),
                    "in_commercial_zone": result.get("in_commercial_zone", False),
                    "retail_center_distance": result.get("retail_center_distance"),
                    "demographics_score": result.get("demographics_score", 50),
                    "foot_traffic_score": result.get("foot_traffic_score", 50),
                    "accessibility_score": result.get("accessibility_score", 50),
                    "competitors": competitors,
                    "nearest_retail_centers": result.get("nearest_retail_centers", []),
                    "competitor_analysis": result.get("competitor_analysis"),  # ADD THIS LINE
                    "demographics_data": result.get("demographics_data"),      # ADD THIS LINE
                })
            
            return {
                "recommendations": recommendations,
                "total_candidates_analyzed": len(results),
                "search_criteria": {
                    "business_type": request.business_type,
                    "radius_miles": request.search_radius_miles,
                    "center_point": {
                        "lat": request.center_lat,
                        "lng": request.center_lng,
                    } if request.center_lat else None,
                    "custom_profile_applied": request.custom_profile is not None,
                }
            }
            
        except Exception as e:
            logger.error(f"Error in recommendation endpoint: {e}")
            raise HTTPException(status_code=500, detail=str(e))
