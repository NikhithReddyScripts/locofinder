"""
Location Enrichment Service - Adds market research data to scored locations.
Integrates Google Places competitor data, population metrics, and zoning info.
"""
import os
from typing import List, Dict, Any, Optional

from app.services.google_places_service import GooglePlacesService
from app.services.geospatial_service import GeospatialService
from app.services.census_service import CensusService


class LocationEnrichmentService:
    """
    Enriches location data with market research metrics:
    - Competitor count within radius
    - Population density
    - Zone category (Commercial, Residential, etc.)
    - Market saturation score (competitors per 10k people)
    """
    
    def __init__(self):
        google_key = os.getenv("GOOGLE_MAPS_API_KEY")
        census_key = os.getenv("CENSUS_API_KEY")
        
        self.places_service = GooglePlacesService(google_key) if google_key else None
        self.geo_service = GeospatialService()
        self.census_service = CensusService(census_key)
        
        # Cache for population data (fetch once per enrichment batch)
        self._population_cache = None
    
    def enrich_location(
        self,
        location: Dict[str, Any],
        business_type: str = "cafe",
        radius_meters: int = 1609,  # 1 mile
    ) -> Dict[str, Any]:
        """
        Enrich a single location with market research data.
        
        Args:
            location: Location dict with lat, lng
            business_type: Type of business to search for
            radius_meters: Search radius in meters
            
        Returns:
            Location dict with added market research fields
        """
        lat = location.get("latitude") or location.get("lat")
        lng = location.get("longitude") or location.get("lng")
        
        if not lat or not lng:
            return location
        
        enriched = location.copy()
        
        # Add competitor count
        try:
            competitor_count = self._get_competitor_count(lat, lng, business_type, radius_meters)
            enriched["competitor_count"] = competitor_count
        except Exception as e:
            print(f"Error getting competitor count: {e}")
            enriched["competitor_count"] = None
        
        # Add population estimate
        try:
            population = self._get_population(lat, lng, radius_meters)
            enriched["population_estimate"] = population
        except Exception as e:
            print(f"Error getting population: {e}")
            enriched["population_estimate"] = None
        
        # Add zone category
        try:
            zone = self._get_zone_category(lng, lat)
            enriched["zone_category"] = zone
            enriched["in_commercial_zone"] = zone in ["Commercial", "Mixed-use"] if zone else False
        except Exception as e:
            print(f"Error getting zone: {e}")
            enriched["zone_category"] = None
            enriched["in_commercial_zone"] = False
        
        # Calculate market saturation
        if enriched.get("competitor_count") is not None and enriched.get("population_estimate"):
            try:
                saturation = self._calculate_market_saturation(
                    enriched["competitor_count"],
                    enriched["population_estimate"]
                )
                enriched["market_saturation"] = saturation
            except:
                enriched["market_saturation"] = None
        else:
            enriched["market_saturation"] = None
        
        return enriched
    
    def enrich_locations_batch(
        self,
        locations: List[Dict[str, Any]],
        business_type: str = "cafe",
        radius_meters: int = 1609,
    ) -> List[Dict[str, Any]]:
        """
        Enrich multiple locations with market research data.
        More efficient than calling enrich_location multiple times.
        
        Args:
            locations: List of location dicts
            business_type: Type of business to search for
            radius_meters: Search radius in meters
            
        Returns:
            List of enriched location dicts
        """
        # Pre-load population data once
        try:
            self._population_cache = self.census_service.fetch_block_group_population()
        except Exception as e:
            print(f"Warning: Could not load population data: {e}")
            self._population_cache = {}
        
        enriched_locations = []
        
        for location in locations:
            try:
                enriched = self.enrich_location(location, business_type, radius_meters)
                enriched_locations.append(enriched)
            except Exception as e:
                print(f"Error enriching location: {e}")
                enriched_locations.append(location)
        
        # Clear cache
        self._population_cache = None
        
        return enriched_locations
    
    def _get_competitor_count(
        self,
        lat: float,
        lng: float,
        business_type: str,
        radius_meters: int
    ) -> int:
        """Get count of competitors within radius."""
        if not self.places_service:
            return 0
        
        try:
            result = self.places_service.nearby_search(
                business_type=business_type,
                lat=lat,
                lng=lng,
                radius_m=radius_meters,
                max_results=20,
            )
            
            places = result.get("places", []) or []
            
            # Filter by type match and boundary
            filtered = []
            for place in places:
                # Type filter
                if not self._matches_business_type(place, business_type):
                    continue
                
                # Boundary filter
                loc = place.get("location") or {}
                plat = loc.get("latitude")
                plng = loc.get("longitude")
                
                if plat and plng:
                    try:
                        if self.geo_service.point_in_boundary(plng, plat):
                            filtered.append(place)
                    except:
                        # If boundary check fails, include it anyway
                        filtered.append(place)
            
            return len(filtered)
            
        except Exception as e:
            print(f"Error in competitor search: {e}")
            return 0
    
    def _get_population(
        self,
        lat: float,
        lng: float,
        radius_meters: int
    ) -> int:
        """Get population estimate within radius."""
        try:
            # Load block groups if not already done
            block_groups = self.geo_service.load_block_groups()
            
            # Use cached population data if available
            if self._population_cache is None:
                self._population_cache = self.census_service.fetch_block_group_population()
            
            # Create circle
            circle = self.geo_service.create_circle_polygon(lng, lat, radius_meters)
            
            # Add population to block groups
            bg_copy = block_groups.copy()
            bg_copy["population"] = bg_copy["GEOID"].map(self._population_cache).fillna(0).astype(int)
            
            # Calculate area-weighted sum
            pop_estimate = self.geo_service.calculate_area_weighted_sum(
                bg_copy,
                "population",
                circle
            )
            
            return round(pop_estimate)
            
        except Exception as e:
            print(f"Error calculating population: {e}")
            return 0
    
    def _get_zone_category(self, lng: float, lat: float) -> Optional[str]:
        """Get zone category for location."""
        try:
            return self.geo_service.get_zone_category(lng, lat)
        except Exception as e:
            print(f"Error getting zone category: {e}")
            return None
    
    def _matches_business_type(self, place: Dict[str, Any], business_type: str) -> bool:
        """Check if place matches the business type."""
        if place.get("primaryType") == business_type:
            return True
        return business_type in (place.get("types") or [])
    
    def _calculate_market_saturation(
        self,
        competitor_count: int,
        population: int
    ) -> float:
        """
        Calculate market saturation as competitors per 10k people.
        
        Returns:
            Saturation score (competitors per 10k people)
        """
        if population <= 0:
            return 0.0
        
        return round((competitor_count / population) * 10000, 2)
    
    def calculate_market_score(
        self,
        location: Dict[str, Any],
        ideal_saturation: float = 5.0,
        weight_saturation: float = 0.4,
        weight_population: float = 0.3,
        weight_zone: float = 0.3,
    ) -> float:
        """
        Calculate a market opportunity score (0-100) based on:
        - Market saturation (lower is better, unless too low)
        - Population density (higher is better)
        - Commercial zone bonus
        
        Args:
            location: Enriched location dict
            ideal_saturation: Ideal competitors per 10k people
            weight_saturation: Weight for saturation score
            weight_population: Weight for population score
            weight_zone: Weight for zone bonus
            
        Returns:
            Market score (0-100)
        """
        score = 0.0
        
        # Saturation score (bell curve around ideal)
        saturation = location.get("market_saturation")
        if saturation is not None:
            # Score peaks at ideal_saturation, drops off on either side
            diff = abs(saturation - ideal_saturation)
            saturation_score = max(0, 100 - (diff * 10))
            score += saturation_score * weight_saturation
        
        # Population score (higher is better, with diminishing returns)
        population = location.get("population_estimate")
        if population:
            # Normalize to 0-100 (assumes 20k is excellent)
            pop_score = min(100, (population / 20000) * 100)
            score += pop_score * weight_population
        
        # Zone bonus (commercial/mixed-use gets full points)
        if location.get("in_commercial_zone"):
            score += 100 * weight_zone
        elif location.get("zone_category") in ["Industrial", "Other"]:
            score += 30 * weight_zone  # Partial credit
        
        return round(score, 2)
