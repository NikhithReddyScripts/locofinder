"""
Enhanced Business Location Recommendation Service

Now includes:
- Business-specific scoring profiles
- Age and income demographics matching
- Foot traffic estimation
- Comprehensive opportunity scoring
- Radius-based search from center point
- Competitor review analysis with Groq LLM
"""

import os
from typing import List, Dict, Any, Optional, Tuple
import geopandas as gpd
from shapely.geometry import Point
import math
import logging

from app.services.google_places_service import GooglePlacesService
from app.services.geospatial_service import GeospatialService
from app.services.census_service import CensusService
from app.services.business_profiles import BusinessProfiles
from app.services.enhanced_census_service import EnhancedCensusService
from app.services.foot_traffic_service import FootTrafficService
from app.services.competitor_analysis_service import CompetitorAnalysisService

logger = logging.getLogger("locofinder")


class EnhancedBusinessRecommendationService:
    """
    Enhanced business location recommendation with:
    - Demographics-based targeting
    - Foot traffic estimation
    - Business-specific scoring
    - Radius-based search from center point
    - Competitor review analysis
    """
    
    def __init__(self):
        google_key = os.getenv("GOOGLE_MAPS_API_KEY")
        census_key = os.getenv("CENSUS_API_KEY")
        
        self.places_service = GooglePlacesService(google_key) if google_key else None
        self.geo_service = GeospatialService()
        self.census_service = CensusService(census_key)
        self.enhanced_census = EnhancedCensusService(census_key)
        self.foot_traffic_service = FootTrafficService()
        self.competitor_analyzer = CompetitorAnalysisService()  # NEW
        
        # Load retail centers
        self.retail_centers = self._load_retail_centers()
        
        # Load boundary and block groups
        self.boundary = self.geo_service.load_boundary()
        self.block_groups = self.geo_service.load_block_groups()
        
        # Cache
        self.population_data = None
        self.demographics_cache = {}
    
    def recommend_locations(
        self,
        business_type: str,
        num_recommendations: int = 4,
        search_radius_meters: int = 1609,
        center_lat: Optional[float] = None,
        center_lng: Optional[float] = None,
        min_population: int = 0,
        max_competitors: int = 999,
        commercial_only: bool = False,
        custom_profile: Optional[Dict[str, Any]] = None,
    ) -> List[Dict[str, Any]]:
        """
        Find optimal locations using enhanced scoring.
        
        If center_lat/lng provided, searches within radius from that point.
        Otherwise, does city-wide search.
        """
        
        # Get business profile - use custom if provided
        if custom_profile:
            profile = BusinessProfiles.get_profile(business_type)
            
            if "weights" in custom_profile:
                profile["weights"] = custom_profile["weights"]
            if "target_age_range" in custom_profile:
                profile["target_age_range"] = custom_profile["target_age_range"]
            if "min_income" in custom_profile:
                profile["min_income"] = custom_profile["min_income"]
            if "ideal_saturation" in custom_profile:
                profile["ideal_saturation"] = custom_profile["ideal_saturation"]
            
            logger.info(f"Using custom profile for {business_type}")
        else:
            profile = BusinessProfiles.get_profile(business_type)
            logger.info(f"Using profile: {profile['name']}")
        
        # Load data
        self.population_data = self.census_service.fetch_block_group_population()
        
        # Generate candidates
        candidates = self._generate_candidate_locations(
            center_lat=center_lat,
            center_lng=center_lng,
            max_radius_meters=search_radius_meters if center_lat else None
        )
        logger.info(f"Generated {len(candidates)} candidates")
        
        # Fetch demographics for all block groups (batch)
        all_geoids = list(self.block_groups["GEOID"].unique())
        self.demographics_cache = self.enhanced_census.fetch_demographics(all_geoids)
        logger.info(f"Loaded demographics for {len(self.demographics_cache)} block groups")
        
        # Score candidates
        scored_candidates = []
        
        for i, candidate in enumerate(candidates):
            try:
                if i % 50 == 0:
                    logger.info(f"Analyzing candidate {i+1}/{len(candidates)}")
                
                analysis = self._analyze_location_enhanced(
                    lat=candidate["lat"],
                    lng=candidate["lng"],
                    business_type=business_type,
                    profile=profile,
                    search_radius_meters=search_radius_meters,
                )
                
                # Apply filters
                if analysis["population_estimate"] < min_population:
                    continue
                
                if analysis["competitor_count"] > max_competitors:
                    continue
                
                if commercial_only and not analysis.get("in_commercial_zone"):
                    continue
                
                # Calculate enhanced opportunity score
                opportunity_score = self._calculate_enhanced_opportunity_score(
                    analysis,
                    profile
                )
                
                scored_candidates.append({
                    **candidate,
                    **analysis,
                    "opportunity_score": opportunity_score,
                })
                
            except Exception as e:
                logger.error(f"Error analyzing candidate {candidate}: {e}")
                continue
        
        logger.info(f"Scored {len(scored_candidates)} candidates")
        
        # Filter results to be within user's selected radius (NEW - moved before analysis)
        if center_lat and center_lng:
            scored_candidates = [
                c for c in scored_candidates
                if self._haversine_distance(center_lat, center_lng, c["lat"], c["lng"]) <= search_radius_meters
            ]
            logger.info(f"Filtered to {len(scored_candidates)} candidates within {search_radius_meters}m radius")
        
        # Sort by score
        scored_candidates.sort(key=lambda x: x["opportunity_score"], reverse=True)
        
        # Select diverse locations
        diverse_recommendations = self._select_diverse_locations(
            scored_candidates,
            num_recommendations,
            min_distance_meters=3000
        )
        
        # NEW: Analyze competitor reviews for top recommendations
        logger.info("Analyzing competitor reviews for top recommendations...")
        for candidate in diverse_recommendations:
            if candidate.get("competitors_with_reviews"):
                try:
                    competitor_analysis = self.competitor_analyzer.analyze_competitors(
                        candidate["competitors_with_reviews"],
                        business_type
                    )
                    candidate["competitor_analysis"] = competitor_analysis
                except Exception as e:
                    logger.error(f"Error analyzing competitors for {candidate['name']}: {e}")
                    candidate["competitor_analysis"] = None
        
        return diverse_recommendations
    
    def _analyze_location_enhanced(
        self,
        lat: float,
        lng: float,
        business_type: str,
        profile: Dict[str, Any],
        search_radius_meters: int,
    ) -> Dict[str, Any]:
        """Enhanced location analysis with demographics and foot traffic."""
        
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
        filtered_competitors = [
            c for c in competitors
            if self._matches_business_type(c, business_type)
        ]
        
        analysis["competitor_count"] = len(filtered_competitors)
        analysis["competitors"] = filtered_competitors[:5]
        
        # NEW: Fetch detailed reviews for top 5 competitors
        competitor_ids = [c.get("id") for c in filtered_competitors[:5] if c.get("id")]
        if competitor_ids:
            try:
                competitors_with_reviews = self.places_service.batch_get_place_details(competitor_ids)
                analysis["competitors_with_reviews"] = competitors_with_reviews
            except Exception as e:
                logger.error(f"Error fetching competitor reviews: {e}")
                analysis["competitors_with_reviews"] = []
        else:
            analysis["competitors_with_reviews"] = []
        
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
        
        # 6. Demographics match
        intersecting_geoids = self._get_intersecting_block_groups(lng, lat, search_radius_meters)
        combined_demographics = self._combine_demographics(intersecting_geoids)
        
        demographics_score = self.enhanced_census.calculate_demographic_match_score(
            demographics=combined_demographics,
            target_age_range=profile["target_age_range"],
            min_income=profile["min_income"],
            ideal_income=profile["ideal_income"],
        )
        
        analysis["demographics_score"] = demographics_score
        analysis["demographics_data"] = combined_demographics
        
        # 7. Foot traffic score
        foot_traffic_score = self.foot_traffic_service.calculate_foot_traffic_score(
            lat=lat,
            lng=lng,
            nearby_competitors=competitors,
            nearby_retail_centers=retail_info,
            zone_category=zone,
        )
        
        analysis["foot_traffic_score"] = foot_traffic_score
        
        # 8. Accessibility score
        accessibility_score = self.foot_traffic_service.calculate_accessibility_score(
            lat=lat,
            lng=lng,
            zone_category=zone,
        )
        
        analysis["accessibility_score"] = accessibility_score
        
        return analysis
    
    def _calculate_enhanced_opportunity_score(
        self,
        analysis: Dict[str, Any],
        profile: Dict[str, Any]
    ) -> float:
        """Calculate opportunity score using business-specific weights."""
        
        weights = profile["weights"]
        score = 0.0
        
        # 1. Population score
        population = analysis.get("population_estimate", 0)
        pop_score = min(100, (population / 20000) * 100)
        score += pop_score * weights["population"]
        
        # 2. Demographics match score
        demo_score = analysis.get("demographics_score", 50)
        score += demo_score * weights["demographics_match"]
        
        # 3. Competition score (bell curve)
        saturation = analysis.get("market_saturation", 0)
        ideal_sat = profile["ideal_saturation"]
        
        if saturation == 0:
            comp_score = 50
        else:
            diff = abs(saturation - ideal_sat)
            comp_score = max(0, 100 - (diff * 10))
        
        score += comp_score * weights["competition"]
        
        # 4. Foot traffic score
        ft_score = analysis.get("foot_traffic_score", 50)
        score += ft_score * weights["foot_traffic"]
        
        # 5. Transit access
        transit_score = analysis.get("accessibility_score", 50)
        score += transit_score * weights["transit_access"]
        
        # 6. Parking (inverse of transit)
        parking_score = 100 - transit_score if transit_score > 50 else 50
        score += parking_score * weights["parking"]
        
        # 7. Retail proximity
        retail_dist = analysis.get("retail_center_distance")
        if retail_dist is not None:
            if retail_dist < 500:
                retail_score = 100
            elif retail_dist < 1000:
                retail_score = 80
            elif retail_dist < 2000:
                retail_score = 60
            else:
                retail_score = 30
        else:
            retail_score = 20
        
        score += retail_score * weights["retail_proximity"]
        
        return round(score, 2)
    
    def _get_intersecting_block_groups(
        self,
        lng: float,
        lat: float,
        radius_meters: int
    ) -> List[str]:
        """Get block group GEOIDs that intersect with search radius."""
        
        circle = self.geo_service.create_circle_polygon(lng, lat, radius_meters)
        
        intersecting = []
        for _, row in self.block_groups.iterrows():
            if row.geometry.intersects(circle):
                intersecting.append(row["GEOID"])
        
        return intersecting
    
    def _combine_demographics(
        self,
        geoids: List[str]
    ) -> Dict[str, Any]:
        """Combine demographics from multiple block groups."""
        
        if not geoids:
            return {}
        
        combined_age = {}
        combined_income = {}
        
        for geoid in geoids:
            demo = self.demographics_cache.get(geoid, {})
            
            age_dist = demo.get("age_distribution", {})
            income_dist = demo.get("income_distribution", {})
            
            for key, value in age_dist.items():
                combined_age[key] = combined_age.get(key, 0) + value
            
            for key, value in income_dist.items():
                combined_income[key] = combined_income.get(key, 0) + value
        
        return {
            "age_distribution": combined_age,
            "income_distribution": combined_income,
        }
    
    def _generate_candidate_locations(
        self,
        center_lat: Optional[float] = None,
        center_lng: Optional[float] = None,
        max_radius_meters: Optional[int] = None,
        grid_size_meters: int = 2000,
    ) -> List[Dict[str, Any]]:
        """Generate candidate locations."""
        
        if center_lat and center_lng and max_radius_meters:
            return self._generate_radius_candidates(
                center_lat, center_lng, max_radius_meters, grid_size_meters
            )
        else:
            return self._generate_citywide_candidates(grid_size_meters=9000)
    
    def _generate_radius_candidates(
        self,
        center_lat: float,
        center_lng: float,
        max_radius_meters: int,
        grid_size_meters: int,
    ) -> List[Dict[str, Any]]:
        """Generate candidates within radius of center point."""
        
        candidates = []
        location_id = 0
        
        lat_deg_per_meter = 1 / 111000
        lng_deg_per_meter = 1 / (111000 * math.cos(math.radians(center_lat)))
        
        max_radius_deg_lat = max_radius_meters * lat_deg_per_meter
        max_radius_deg_lng = max_radius_meters * lng_deg_per_meter
        
        grid_lat_step = grid_size_meters * lat_deg_per_meter
        grid_lng_step = grid_size_meters * lng_deg_per_meter
        
        lat = center_lat - max_radius_deg_lat
        
        while lat <= center_lat + max_radius_deg_lat:
            lng = center_lng - max_radius_deg_lng
            
            while lng <= center_lng + max_radius_deg_lng:
                dist = self._haversine_distance(center_lat, center_lng, lat, lng)
                
                if dist <= max_radius_meters:
                    point = Point(lng, lat)
                    
                    if self.boundary.contains(point).any():
                        candidates.append({
                            "location_id": f"candidate_{location_id}",
                            "lat": lat,
                            "lng": lng,
                            "name": f"Area {location_id}",
                            "distance_from_center": dist,
                        })
                        location_id += 1
                
                lng += grid_lng_step
            lat += grid_lat_step
        
        logger.info(f"Generated {len(candidates)} candidates within {max_radius_meters}m radius")
        return candidates
    
    def _generate_citywide_candidates(
        self,
        grid_size_meters: int = 9000
    ) -> List[Dict[str, Any]]:
        """Generate candidate locations using city-wide grid."""
        
        bounds = self.boundary.total_bounds
        
        lat_deg_per_meter = 1 / 111000
        lng_deg_per_meter = 1 / (111000 * math.cos(math.radians(bounds[1])))
        
        grid_lat_step = grid_size_meters * lat_deg_per_meter
        grid_lng_step = grid_size_meters * lng_deg_per_meter
        
        candidates = []
        lat = bounds[1]
        location_id = 0
        
        while lat < bounds[3]:
            lng = bounds[0]
            while lng < bounds[2]:
                point = Point(lng, lat)
                
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
        
        return candidates
    
    def _get_nearest_retail_centers(
        self,
        lat: float,
        lng: float,
        max_count: int = 3
    ) -> List[Dict[str, Any]]:
        """Get nearest retail centers."""
        
        if self.retail_centers is None or len(self.retail_centers) == 0:
            return []
        
        point = Point(lng, lat)
        
        distances = []
        for _, row in self.retail_centers.iterrows():
            centroid = row["geometry"].centroid
            dist = point.distance(centroid) * 111000
            
            distances.append({
                "name": row.get("rcName", "Unknown"),
                "type": row.get("typeName", "Unknown"),
                "distance_meters": round(dist),
                "lat": centroid.y,
                "lng": centroid.x,
            })
        
        distances.sort(key=lambda x: x["distance_meters"])
        return distances[:max_count]
    
    def _select_diverse_locations(
        self,
        candidates: List[Dict[str, Any]],
        count: int,
        min_distance_meters: int = 3000
    ) -> List[Dict[str, Any]]:
        """Select geographically diverse locations."""
        
        if len(candidates) <= count:
            return candidates
        
        selected = [candidates[0]]
        remaining = candidates[1:]
        
        while len(selected) < count and remaining:
            best_candidate = None
            best_min_distance = 0
            
            for candidate in remaining:
                min_dist = min([
                    self._haversine_distance(
                        candidate["lat"], candidate["lng"],
                        sel["lat"], sel["lng"]
                    )
                    for sel in selected
                ])
                
                if min_dist > best_min_distance:
                    best_min_distance = min_dist
                    best_candidate = candidate
            
            if best_candidate and best_min_distance >= min_distance_meters:
                selected.append(best_candidate)
                remaining.remove(best_candidate)
            else:
                if remaining:
                    selected.append(remaining.pop(0))
                break
        
        return selected
    
    def _haversine_distance(
        self,
        lat1: float, lng1: float,
        lat2: float, lng2: float
    ) -> float:
        """Calculate distance in meters."""
        
        R = 6371000
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
        """Check if place matches business type."""
        if place.get("primaryType") == business_type:
            return True
        return business_type in (place.get("types") or [])
    
    def _load_retail_centers(self) -> Optional[gpd.GeoDataFrame]:
        """Load retail centers."""
        try:
            import os
            base_path = os.path.dirname(os.path.abspath(__file__))
            gpkg_path = os.path.join(base_path, "..", "..", "data", "geo", "us_retailcentres.gpkg_", "US_RetailCentres.gpkg")
            
            if os.path.exists(gpkg_path):
                gdf = gpd.read_file(gpkg_path)
                sd_centers = gdf.cx[-117.3:-117.0, 32.6:32.9]
                logger.info(f"Loaded {len(sd_centers)} retail centers")
                return sd_centers
            else:
                logger.warning(f"Retail centers not found at {gpkg_path}")
                return None
                
        except Exception as e:
            logger.error(f"Error loading retail centers: {e}")
            return None
