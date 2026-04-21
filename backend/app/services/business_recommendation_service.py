"""
Business Location Recommendation Service

Recommends 3-4 optimal regions for a specific business type based on:
- Population density
- Competitor analysis
- Market saturation
- Proximity to retail centers
- Zone category
"""

import os
from typing import List, Dict, Any, Optional, Tuple
import geopandas as gpd
from shapely.geometry import Point
import math

from app.services.google_places_service import GooglePlacesService
from app.services.geospatial_service import GeospatialService
from app.services.census_service import CensusService


class BusinessRecommendationService:
    """
    Recommends optimal business locations by analyzing:
    - Market saturation (competitor density)
    - Population demographics
    - Retail center proximity
    - Commercial zoning
    """
    
    def __init__(self):
        google_key = os.getenv("GOOGLE_MAPS_API_KEY")
        census_key = os.getenv("CENSUS_API_KEY")
        
        self.places_service = GooglePlacesService(google_key) if google_key else None
        self.geo_service = GeospatialService()
        self.census_service = CensusService(census_key)
        
        # Load retail centers
        self.retail_centers = self._load_retail_centers()
        
        # Load boundary and block groups
        self.boundary = self.geo_service.load_boundary()
        self.block_groups = self.geo_service.load_block_groups()
        self.population_data = None
    
    def recommend_locations(
        self,
        business_type: str,
        num_recommendations: int = 4,
        search_radius_meters: int = 1609,  # 1 mile
        min_population: int = 5000,
        max_competitors: int = 15,
        commercial_only: bool = True,
        focus_city: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """
        Find the best 3-4 regions for a business.
        
        Args:
            business_type: Type of business (cafe, restaurant, gym, etc.)
            num_recommendations: Number of locations to return (3-4)
            search_radius_meters: Radius to analyze around each point
            min_population: Minimum population required
            max_competitors: Maximum competitors allowed
            commercial_only: Only consider commercial zones
            focus_city: Optional city name to focus search
            
        Returns:
            List of recommended locations with full market analysis
        """
        
        # Step 1: Load population data
        self.population_data = self.census_service.fetch_block_group_population()
        
        # Step 2: Generate candidate locations (grid search)
        candidates = self._generate_candidate_locations(focus_city)
        
        # Step 3: Score each candidate
        scored_candidates = []
        
        for candidate in candidates:
            try:
                analysis = self._analyze_location(
                    lat=candidate["lat"],
                    lng=candidate["lng"],
                    business_type=business_type,
                    search_radius_meters=search_radius_meters,
                )
                
                # Apply filters
                if analysis["population_estimate"] < min_population:
                    continue
                
                if analysis["competitor_count"] > max_competitors:
                    continue
                
                if commercial_only and not analysis.get("in_commercial_zone"):
                    continue
                
                # Calculate opportunity score
                opportunity_score = self._calculate_opportunity_score(analysis)
                
                scored_candidates.append({
                    **candidate,
                    **analysis,
                    "opportunity_score": opportunity_score,
                })
                
            except Exception as e:
                print(f"Error analyzing candidate {candidate}: {e}")
                continue
        
        # Step 4: Sort by opportunity score and return top N
        scored_candidates.sort(key=lambda x: x["opportunity_score"], reverse=True)
        
        # Step 5: Ensure geographic diversity (spread out recommendations)
        diverse_recommendations = self._select_diverse_locations(
            scored_candidates,
            num_recommendations,
            min_distance_meters=3000  # At least 3km apart
        )
        
        return diverse_recommendations
    
    def _generate_candidate_locations(
        self,
        focus_city: Optional[str] = None,
        grid_size_meters: int = 5000
    ) -> List[Dict[str, Any]]:
        """
        Generate candidate locations using a grid-based approach.
        Creates a grid of points within the city boundary.
        """
        
        # Get boundary bbox
        bounds = self.boundary.total_bounds  # [minx, miny, maxx, maxy]
        
        # Calculate grid points
        candidates = []
        
        # Convert meters to degrees (rough approximation)
        lat_deg_per_meter = 1 / 111000
        lng_deg_per_meter = 1 / (111000 * math.cos(math.radians(bounds[1])))
        
        grid_lat_step = grid_size_meters * lat_deg_per_meter
        grid_lng_step = grid_size_meters * lng_deg_per_meter
        
        # Generate grid
        lat = bounds[1]
        location_id = 0
        
        while lat < bounds[3]:
            lng = bounds[0]
            while lng < bounds[2]:
                point = Point(lng, lat)
                
                # Check if point is within boundary
                if self.boundary.contains(point).any():
                    candidates.append({
                        "location_id": f"candidate_{location_id}",
                        "lat": lat,
                        "lng": lng,
                        "name": f"Area {location_id}",
                    })
                    location_id += 1
                
                lng += grid_lng_step
            lat += grid_lat_step
        
        print(f"Generated {len(candidates)} candidate locations")
        return candidates
    
    def _analyze_location(
        self,
        lat: float,
        lng: float,
        business_type: str,
        search_radius_meters: int,
    ) -> Dict[str, Any]:
        """
        Perform complete market analysis for a specific location.
        """
        
        analysis = {}
        
        # 1. Competitor analysis
        competitor_result = self.places_service.nearby_search(
            business_type=business_type,
            lat=lat,
            lng=lng,
            radius_m=search_radius_meters,
            max_results=20,
        )
        
        competitors = competitor_result.get("places", []) or []
        
        # Filter to only matching types
        filtered_competitors = [
            c for c in competitors
            if self._matches_business_type(c, business_type)
        ]
        
        analysis["competitor_count"] = len(filtered_competitors)
        analysis["competitors"] = filtered_competitors[:5]  # Top 5 for details
        
        # 2. Population analysis
        circle = self.geo_service.create_circle_polygon(lng, lat, search_radius_meters)
        
        bg_copy = self.block_groups.copy()
        bg_copy["population"] = bg_copy["GEOID"].map(self.population_data).fillna(0).astype(int)
        
        population = self.geo_service.calculate_area_weighted_sum(
            bg_copy, "population", circle
        )
        
        analysis["population_estimate"] = round(population)
        
        # 3. Market saturation
        if population > 0:
            saturation = (len(filtered_competitors) / population) * 10000
            analysis["market_saturation"] = round(saturation, 2)
        else:
            analysis["market_saturation"] = 0.0
        
        # 4. Zone category
        zone = self.geo_service.get_zone_category(lng, lat)
        analysis["zone_category"] = zone
        analysis["in_commercial_zone"] = zone in ["Commercial", "Mixed-use"] if zone else False
        
        # 5. Retail center proximity
        retail_info = self._get_nearest_retail_centers(lat, lng, max_count=3)
        analysis["nearest_retail_centers"] = retail_info
        analysis["retail_center_distance"] = retail_info[0]["distance_meters"] if retail_info else None
        
        return analysis
    
    def _get_nearest_retail_centers(
        self,
        lat: float,
        lng: float,
        max_count: int = 3
    ) -> List[Dict[str, Any]]:
        """Get nearest retail centers to a location."""
        
        if self.retail_centers is None or len(self.retail_centers) == 0:
            return []
        
        point = Point(lng, lat)
        
        # Calculate distances
        distances = []
        for idx, row in self.retail_centers.iterrows():
            centroid = row["geometry"].centroid
            dist = point.distance(centroid) * 111000  # Rough conversion to meters
            
            distances.append({
                "name": row.get("rcName", "Unknown"),
                "type": row.get("typeName", "Unknown"),
                "distance_meters": round(dist),
                "lat": centroid.y,
                "lng": centroid.x,
            })
        
        # Sort by distance
        distances.sort(key=lambda x: x["distance_meters"])
        
        return distances[:max_count]
    
    def _calculate_opportunity_score(self, analysis: Dict[str, Any]) -> float:
        """
        Calculate market opportunity score (0-100).
        
        Scoring factors:
        - Population density (30%)
        - Market saturation (40%) - sweet spot around 5 per 10k
        - Commercial zone (20%)
        - Retail center proximity (10%)
        """
        
        score = 0.0
        
        # 1. Population score (higher is better, with diminishing returns)
        population = analysis.get("population_estimate", 0)
        pop_score = min(100, (population / 20000) * 100)
        score += pop_score * 0.30
        
        # 2. Saturation score (bell curve around ideal of 5 per 10k)
        saturation = analysis.get("market_saturation", 0)
        ideal_saturation = 5.0
        
        if saturation == 0:
            # No competition might mean no demand
            saturation_score = 50
        else:
            diff = abs(saturation - ideal_saturation)
            saturation_score = max(0, 100 - (diff * 10))
        
        score += saturation_score * 0.40
        
        # 3. Commercial zone bonus
        if analysis.get("in_commercial_zone"):
            score += 100 * 0.20
        else:
            score += 30 * 0.20  # Partial credit for other zones
        
        # 4. Retail center proximity (closer is better)
        retail_dist = analysis.get("retail_center_distance")
        if retail_dist is not None:
            if retail_dist < 500:  # Within 500m
                retail_score = 100
            elif retail_dist < 1000:  # Within 1km
                retail_score = 80
            elif retail_dist < 2000:  # Within 2km
                retail_score = 60
            else:
                retail_score = 30
            score += retail_score * 0.10
        
        return round(score, 2)
    
    def _select_diverse_locations(
        self,
        candidates: List[Dict[str, Any]],
        count: int,
        min_distance_meters: int = 3000
    ) -> List[Dict[str, Any]]:
        """
        Select geographically diverse locations.
        Ensures recommendations are spread out, not clustered.
        """
        
        if len(candidates) <= count:
            return candidates
        
        selected = []
        remaining = candidates.copy()
        
        # Always take the top one
        selected.append(remaining.pop(0))
        
        # Select remaining based on distance from already selected
        while len(selected) < count and remaining:
            best_candidate = None
            best_min_distance = 0
            
            for candidate in remaining:
                # Calculate minimum distance to any selected location
                min_dist = min([
                    self._haversine_distance(
                        candidate["lat"], candidate["lng"],
                        sel["lat"], sel["lng"]
                    )
                    for sel in selected
                ])
                
                # Pick candidate that is farthest from all selected
                if min_dist > best_min_distance:
                    best_min_distance = min_dist
                    best_candidate = candidate
            
            # If we found a candidate far enough, add it
            if best_candidate and best_min_distance >= min_distance_meters:
                selected.append(best_candidate)
                remaining.remove(best_candidate)
            else:
                # No more diverse candidates, just take next best
                if remaining:
                    selected.append(remaining.pop(0))
                break
        
        return selected
    
    def _haversine_distance(
        self,
        lat1: float, lng1: float,
        lat2: float, lng2: float
    ) -> float:
        """Calculate distance between two points in meters."""
        
        R = 6371000  # Earth radius in meters
        
        phi1 = math.radians(lat1)
        phi2 = math.radians(lat2)
        delta_phi = math.radians(lat2 - lat1)
        delta_lambda = math.radians(lng2 - lng1)
        
        a = (math.sin(delta_phi / 2) ** 2 +
             math.cos(phi1) * math.cos(phi2) *
             math.sin(delta_lambda / 2) ** 2)
        
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        
        return R * c
    
    def _matches_business_type(self, place: Dict[str, Any], business_type: str) -> bool:
        """Check if place matches the business type."""
        if place.get("primaryType") == business_type:
            return True
        return business_type in (place.get("types") or [])
    
    def _load_retail_centers(self) -> Optional[gpd.GeoDataFrame]:
        """Load retail centers GeoPackage if available."""
        try:
            import os
            base_path = os.path.dirname(os.path.abspath(__file__))
            gpkg_path = os.path.join(base_path, "..", "..", "data", "geo", "us_retailcentres.gpkg_", "US_RetailCentres.gpkg")
            
            if os.path.exists(gpkg_path):
                gdf = gpd.read_file(gpkg_path)
                # Filter to San Diego area
                sd_centers = gdf.cx[-117.3:-117.0, 32.6:32.9]
                print(f"Loaded {len(sd_centers)} retail centers in San Diego")
                return sd_centers
            else:
                print(f"Retail centers file not found at {gpkg_path}")
                return None
                
        except Exception as e:
            print(f"Error loading retail centers: {e}")
            return None
