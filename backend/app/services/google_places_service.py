"""
Google Places Service - Enhanced with Places Details API for reviews
"""

import os
import requests
import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger("locofinder")


class GooglePlacesService:
    """Service for interacting with Google Places API."""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://places.googleapis.com/v1/places"
    
    def nearby_search(
        self,
        business_type: str,
        lat: float,
        lng: float,
        radius_m: int = 1609,
        max_results: int = 20,
    ) -> Dict[str, Any]:
        """
        Search for places near a location.
        Returns basic place data (no reviews).
        """
        
        from app.services.google_places_type_mapping import get_google_places_type
        
        url = f"{self.base_url}:searchNearby"
        
        headers = {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": self.api_key,
            "X-Goog-FieldMask": "places.id,places.displayName,places.location,places.rating,places.userRatingCount,places.types,places.primaryType"
        }
        
        payload = {
            "includedTypes": [get_google_places_type(business_type)],
            "locationRestriction": {
                "circle": {
                    "center": {
                        "latitude": lat,
                        "longitude": lng
                    },
                    "radius": radius_m
                }
            },
            "maxResultCount": max_results
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Google Places API error: {e}")
            return {"places": []}
    
    def get_place_details(self, place_id: str) -> Optional[Dict[str, Any]]:
        """
        Fetch detailed information including reviews for a place.
        Returns up to 5 most helpful reviews.
        """
        
        url = f"{self.base_url}/{place_id}"
        
        headers = {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": self.api_key,
            "X-Goog-FieldMask": "id,displayName,rating,userRatingCount,priceLevel,reviews"
        }
        
        try:
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            data = response.json()
            
            # Format reviews for easier consumption
            reviews = []
            for review in data.get("reviews", []):
                reviews.append({
                    "author": review.get("authorAttribution", {}).get("displayName", "Anonymous"),
                    "rating": review.get("rating", 0),
                    "text": review.get("text", {}).get("text", ""),
                    "time": review.get("publishTime", ""),
                    "relative_time": review.get("relativePublishTimeDescription", ""),
                })
            
            return {
                "id": data.get("id"),
                "name": data.get("displayName", {}).get("text", "Unknown"),
                "rating": data.get("rating"),
                "user_rating_count": data.get("userRatingCount"),
                "price_level": data.get("priceLevel"),
                "reviews": reviews,
            }
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching place details for {place_id}: {e}")
            return None
    
    def batch_get_place_details(self, place_ids: List[str]) -> List[Dict[str, Any]]:
        """
        Fetch details for multiple places.
        Returns list of place details with reviews.
        """
        
        results = []
        for place_id in place_ids:
            details = self.get_place_details(place_id)
            if details:
                results.append(details)
        
        logger.info(f"Fetched details for {len(results)}/{len(place_ids)} places")
        return results
