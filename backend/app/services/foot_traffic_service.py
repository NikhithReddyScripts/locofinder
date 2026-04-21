"""
Foot Traffic Estimation Service (Proxy-based)

Estimates foot traffic using free proxy metrics:
- Road classification (highway, arterial, local)
- POI density (nearby restaurants, shops, offices)
- Transit stop proximity
- Retail center proximity
"""

import math
from typing import Dict, List, Optional, Tuple
import logging

logger = logging.getLogger("locofinder")


class FootTrafficService:
    """
    Estimate foot traffic using proxy metrics.
    
    Scoring factors:
    - Nearby POI density (40%)
    - Retail center proximity (30%)
    - Transit accessibility (20%)
    - Road classification (10%)
    """
    
    def __init__(self):
        pass
    
    def calculate_foot_traffic_score(
        self,
        lat: float,
        lng: float,
        nearby_competitors: List[Dict],
        nearby_retail_centers: List[Dict],
        zone_category: Optional[str] = None,
    ) -> float:
        """
        Calculate foot traffic score (0-100).
        
        Args:
            lat: Latitude
            lng: Longitude
            nearby_competitors: List of nearby businesses (from Google Places)
            nearby_retail_centers: List of nearby retail centers
            zone_category: Zone category (Commercial, Residential, etc.)
            
        Returns:
            Foot traffic score 0-100
        """
        
        score = 0.0
        
        # 1. POI Density Score (40%)
        poi_score = self._calculate_poi_density_score(nearby_competitors)
        score += poi_score * 0.40
        
        # 2. Retail Proximity Score (30%)
        retail_score = self._calculate_retail_proximity_score(nearby_retail_centers)
        score += retail_score * 0.30
        
        # 3. Zone Score (20%)
        zone_score = self._calculate_zone_score(zone_category)
        score += zone_score * 0.20
        
        # 4. Diversity Score (10%) - variety of business types indicates activity
        diversity_score = self._calculate_diversity_score(nearby_competitors)
        score += diversity_score * 0.10
        
        return round(score, 2)
    
    def _calculate_poi_density_score(
        self,
        nearby_pois: List[Dict]
    ) -> float:
        """
        Score based on number of nearby businesses.
        More POIs = more foot traffic.
        """
        
        if not nearby_pois:
            return 0.0
        
        count = len(nearby_pois)
        
        # Score bands
        if count >= 50:
            return 100.0
        elif count >= 30:
            return 80.0 + ((count - 30) / 20) * 20
        elif count >= 15:
            return 60.0 + ((count - 15) / 15) * 20
        elif count >= 5:
            return 40.0 + ((count - 5) / 10) * 20
        else:
            return (count / 5) * 40
    
    def _calculate_retail_proximity_score(
        self,
        retail_centers: List[Dict]
    ) -> float:
        """
        Score based on proximity to retail centers.
        Closer = higher foot traffic.
        """
        
        if not retail_centers:
            return 20.0  # Some baseline
        
        # Get nearest retail center distance
        nearest_dist = retail_centers[0].get("distance_meters", 9999)
        
        # Scoring bands (in meters)
        if nearest_dist <= 200:
            return 100.0
        elif nearest_dist <= 500:
            return 90.0
        elif nearest_dist <= 1000:
            return 70.0
        elif nearest_dist <= 2000:
            return 50.0
        elif nearest_dist <= 5000:
            return 30.0
        else:
            return 10.0
    
    def _calculate_zone_score(
        self,
        zone_category: Optional[str]
    ) -> float:
        """
        Score based on zone type.
        Commercial/Mixed-use = higher foot traffic potential.
        """
        
        if not zone_category:
            return 50.0
        
        zone_scores = {
            "Commercial": 100.0,
            "Mixed-use": 90.0,
            "Industrial": 30.0,
            "Residential": 50.0,
            "Other": 40.0,
        }
        
        return zone_scores.get(zone_category, 50.0)
    
    def _calculate_diversity_score(
        self,
        nearby_pois: List[Dict]
    ) -> float:
        """
        Score based on variety of business types.
        More variety = more reasons for people to be in the area.
        """
        
        if not nearby_pois:
            return 0.0
        
        # Count unique primary types
        types = set()
        for poi in nearby_pois:
            primary_type = poi.get("primaryType")
            if primary_type:
                types.add(primary_type)
            
            # Also check types array
            for t in poi.get("types", []):
                types.add(t)
        
        unique_count = len(types)
        
        # Score bands
        if unique_count >= 20:
            return 100.0
        elif unique_count >= 15:
            return 80.0
        elif unique_count >= 10:
            return 60.0
        elif unique_count >= 5:
            return 40.0
        else:
            return (unique_count / 5) * 40
    
    def calculate_accessibility_score(
        self,
        lat: float,
        lng: float,
        zone_category: Optional[str] = None,
    ) -> float:
        """
        Calculate accessibility score based on:
        - Walkability (zone type)
        - Parking availability (zone type proxy)
        
        Returns score 0-100.
        """
        
        score = 0.0
        
        # Walkability score (70%)
        if zone_category in ["Commercial", "Mixed-use"]:
            walkability = 90.0
        elif zone_category == "Residential":
            walkability = 60.0
        elif zone_category == "Industrial":
            walkability = 30.0
        else:
            walkability = 50.0
        
        score += walkability * 0.70
        
        # Parking score (30%) - inverse of walkability for most cases
        if zone_category in ["Commercial", "Mixed-use"]:
            parking = 70.0  # Street parking + lots
        elif zone_category == "Residential":
            parking = 80.0  # Easier parking
        elif zone_category == "Industrial":
            parking = 90.0  # Lots of space
        else:
            parking = 60.0
        
        score += parking * 0.30
        
        return round(score, 2)
    
    @staticmethod
    def haversine_distance(
        lat1: float, lng1: float,
        lat2: float, lng2: float
    ) -> float:
        """Calculate distance in meters between two points."""
        
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
