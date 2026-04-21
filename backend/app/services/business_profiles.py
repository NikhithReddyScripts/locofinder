"""
Business Profile Configurations

Defines target demographics, ideal conditions, and scoring weights
for different business types.
"""

from typing import Dict, Any, Tuple


class BusinessProfiles:
    """
    Business-specific profiles for market opportunity scoring.
    
    Each profile defines:
    - Target age range
    - Minimum household income
    - Ideal market saturation (competitors per 10k people)
    - Scoring weights for different factors
    - Special considerations
    """
    
    PROFILES: Dict[str, Dict[str, Any]] = {
        
        # ============================================================
        # FOOD & BEVERAGE
        # ============================================================
        
        "cafe": {
            "name": "Coffee Shop / Cafe",
            "target_age_range": (25, 44),
            "min_income": 40000,
            "ideal_income": 60000,
            "ideal_saturation": 5.0,
            
            # Scoring weights
            "weights": {
                "population": 0.15,
                "demographics_match": 0.25,
                "competition": 0.20,
                "foot_traffic": 0.20,
                "transit_access": 0.10,
                "parking": 0.05,
                "retail_proximity": 0.05,
            },
            
            "boost_factors": [
                "near_office_buildings",
                "near_university",
                "high_foot_traffic_area",
                "morning_commute_route",
            ],
            
            "penalty_factors": [
                "retirement_community",
                "industrial_only_area",
                "low_transit_access",
            ],
        },
        
        "restaurant_casual": {
            "name": "Casual Dining Restaurant",
            "target_age_range": (25, 65),
            "min_income": 45000,
            "ideal_income": 65000,
            "ideal_saturation": 4.0,
            
            "weights": {
                "population": 0.20,
                "demographics_match": 0.20,
                "competition": 0.20,
                "foot_traffic": 0.15,
                "transit_access": 0.05,
                "parking": 0.15,
                "retail_proximity": 0.05,
            },
            
            "boost_factors": [
                "near_retail_centers",
                "mixed_use_area",
                "entertainment_district",
                "residential_nearby",
            ],
            
            "penalty_factors": [
                "isolated_location",
                "limited_parking",
            ],
        },
        
        "restaurant_fine_dining": {
            "name": "Fine Dining Restaurant",
            "target_age_range": (30, 65),
            "min_income": 75000,
            "ideal_income": 100000,
            "ideal_saturation": 2.0,
            
            "weights": {
                "population": 0.15,
                "demographics_match": 0.30,
                "competition": 0.20,
                "foot_traffic": 0.05,
                "transit_access": 0.05,
                "parking": 0.20,
                "retail_proximity": 0.05,
            },
            
            "boost_factors": [
                "affluent_neighborhood",
                "downtown_area",
                "near_hotels",
                "theater_district",
            ],
            
            "penalty_factors": [
                "low_income_area",
                "fast_food_dominated",
            ],
        },
        
        "bakery": {
            "name": "Bakery / Pastry Shop",
            "target_age_range": (25, 60),
            "min_income": 45000,
            "ideal_income": 65000,
            "ideal_saturation": 3.0,
            
            "weights": {
                "population": 0.20,
                "demographics_match": 0.20,
                "competition": 0.20,
                "foot_traffic": 0.20,
                "transit_access": 0.05,
                "parking": 0.10,
                "retail_proximity": 0.05,
            },
            
            "boost_factors": [
                "near_residential",
                "morning_commute_route",
                "near_offices",
                "pedestrian_friendly",
            ],
            
            "penalty_factors": [
                "low_foot_traffic",
                "industrial_area",
            ],
        },
        
        "bar": {
            "name": "Bar / Pub",
            "target_age_range": (21, 45),
            "min_income": 35000,
            "ideal_income": 55000,
            "ideal_saturation": 6.0,
            
            "weights": {
                "population": 0.15,
                "demographics_match": 0.25,
                "competition": 0.15,
                "foot_traffic": 0.20,
                "transit_access": 0.15,
                "parking": 0.05,
                "retail_proximity": 0.05,
            },
            
            "boost_factors": [
                "entertainment_district",
                "near_restaurants",
                "downtown_area",
                "nightlife_area",
                "near_hotels",
            ],
            
            "penalty_factors": [
                "family_oriented_area",
                "retirement_community",
                "residential_only",
            ],
        },
        
        "fast_food": {
            "name": "Fast Food Restaurant",
            "target_age_range": (18, 54),
            "min_income": 25000,
            "ideal_income": 45000,
            "ideal_saturation": 8.0,
            
            "weights": {
                "population": 0.25,
                "demographics_match": 0.15,
                "competition": 0.15,
                "foot_traffic": 0.25,
                "transit_access": 0.05,
                "parking": 0.10,
                "retail_proximity": 0.05,
            },
            
            "boost_factors": [
                "high_traffic_road",
                "near_highway",
                "strip_mall",
                "drive_through_possible",
            ],
            
            "penalty_factors": [
                "affluent_area_only",
                "low_traffic_road",
            ],
        },
        
        # ============================================================
        # RETAIL & SERVICES
        # ============================================================
        
        "gym": {
            "name": "Gym / Fitness Center",
            "target_age_range": (18, 54),
            "min_income": 45000,
            "ideal_income": 70000,
            "ideal_saturation": 2.0,
            
            "weights": {
                "population": 0.25,
                "demographics_match": 0.25,
                "competition": 0.25,
                "foot_traffic": 0.05,
                "transit_access": 0.05,
                "parking": 0.15,
                "retail_proximity": 0.00,
            },
            
            "boost_factors": [
                "residential_nearby",
                "near_offices",
                "ample_parking",
                "mixed_age_population",
            ],
            
            "penalty_factors": [
                "retirement_community",
                "limited_parking",
                "high_competition",
            ],
        },
        
        "grocery": {
            "name": "Grocery Store",
            "target_age_range": (25, 75),
            "min_income": 35000,
            "ideal_income": 60000,
            "ideal_saturation": 1.5,
            
            "weights": {
                "population": 0.30,
                "demographics_match": 0.15,
                "competition": 0.25,
                "foot_traffic": 0.05,
                "transit_access": 0.05,
                "parking": 0.20,
                "retail_proximity": 0.00,
            },
            
            "boost_factors": [
                "residential_dense",
                "underserved_area",
                "large_parking_available",
                "easy_access_roads",
            ],
            
            "penalty_factors": [
                "existing_major_grocery",
                "limited_parking",
                "difficult_access",
            ],
        },
        
        "convenience_store": {
            "name": "Convenience Store",
            "target_age_range": (18, 65),
            "min_income": 25000,
            "ideal_income": 50000,
            "ideal_saturation": 10.0,
            
            "weights": {
                "population": 0.20,
                "demographics_match": 0.10,
                "competition": 0.15,
                "foot_traffic": 0.30,
                "transit_access": 0.10,
                "parking": 0.10,
                "retail_proximity": 0.05,
            },
            
            "boost_factors": [
                "high_foot_traffic",
                "near_transit",
                "gas_station_potential",
                "24_hour_feasible",
            ],
            
            "penalty_factors": [
                "low_foot_traffic",
                "isolated_location",
            ],
        },
        
        "salon": {
            "name": "Hair Salon / Barber",
            "target_age_range": (18, 65),
            "min_income": 35000,
            "ideal_income": 55000,
            "ideal_saturation": 4.0,
            
            "weights": {
                "population": 0.25,
                "demographics_match": 0.20,
                "competition": 0.20,
                "foot_traffic": 0.10,
                "transit_access": 0.05,
                "parking": 0.15,
                "retail_proximity": 0.05,
            },
            
            "boost_factors": [
                "near_residential",
                "strip_mall",
                "near_retail",
                "walk_in_traffic",
            ],
            
            "penalty_factors": [
                "too_many_salons",
                "limited_parking",
            ],
        },
        
        # ============================================================
        # SPECIALTY & SERVICES
        # ============================================================
        
        "daycare": {
            "name": "Daycare / Childcare Center",
            "target_age_range": (25, 40),
            "min_income": 50000,
            "ideal_income": 80000,
            "ideal_saturation": 2.0,
            
            "weights": {
                "population": 0.20,
                "demographics_match": 0.35,
                "competition": 0.25,
                "foot_traffic": 0.00,
                "transit_access": 0.00,
                "parking": 0.15,
                "retail_proximity": 0.05,
            },
            
            "boost_factors": [
                "young_families",
                "residential_area",
                "dual_income_households",
                "safe_neighborhood",
            ],
            
            "penalty_factors": [
                "retirement_area",
                "high_crime",
                "limited_parking",
            ],
        },
        
        "pet_store": {
            "name": "Pet Store / Pet Services",
            "target_age_range": (25, 65),
            "min_income": 45000,
            "ideal_income": 70000,
            "ideal_saturation": 3.0,
            
            "weights": {
                "population": 0.20,
                "demographics_match": 0.20,
                "competition": 0.20,
                "foot_traffic": 0.10,
                "transit_access": 0.05,
                "parking": 0.20,
                "retail_proximity": 0.05,
            },
            
            "boost_factors": [
                "suburban_area",
                "residential_nearby",
                "pet_friendly_area",
                "ample_parking",
            ],
            
            "penalty_factors": [
                "high_density_apartments",
                "limited_parking",
            ],
        },
        
        "bookstore": {
            "name": "Bookstore / Book Cafe",
            "target_age_range": (25, 65),
            "min_income": 50000,
            "ideal_income": 75000,
            "ideal_saturation": 1.0,
            
            "weights": {
                "population": 0.15,
                "demographics_match": 0.30,
                "competition": 0.20,
                "foot_traffic": 0.15,
                "transit_access": 0.05,
                "parking": 0.10,
                "retail_proximity": 0.05,
            },
            
            "boost_factors": [
                "educated_population",
                "near_university",
                "arts_district",
                "downtown_area",
                "pedestrian_friendly",
            ],
            
            "penalty_factors": [
                "low_education_area",
                "existing_major_bookstore",
            ],
        },
        
        "yoga_studio": {
            "name": "Yoga / Wellness Studio",
            "target_age_range": (25, 55),
            "min_income": 50000,
            "ideal_income": 80000,
            "ideal_saturation": 2.5,
            
            "weights": {
                "population": 0.20,
                "demographics_match": 0.30,
                "competition": 0.20,
                "foot_traffic": 0.05,
                "transit_access": 0.05,
                "parking": 0.15,
                "retail_proximity": 0.05,
            },
            
            "boost_factors": [
                "affluent_area",
                "health_conscious_population",
                "near_residential",
                "walkable_area",
            ],
            
            "penalty_factors": [
                "low_income_area",
                "industrial_area",
            ],
        },
        
        "laundromat": {
            "name": "Laundromat",
            "target_age_range": (18, 65),
            "min_income": 20000,
            "ideal_income": 45000,
            "ideal_saturation": 3.0,
            
            "weights": {
                "population": 0.30,
                "demographics_match": 0.15,
                "competition": 0.25,
                "foot_traffic": 0.05,
                "transit_access": 0.05,
                "parking": 0.20,
                "retail_proximity": 0.00,
            },
            
            "boost_factors": [
                "high_density_apartments",
                "student_housing",
                "low_homeownership",
                "near_residential",
            ],
            
            "penalty_factors": [
                "single_family_homes_only",
                "affluent_area",
            ],
        },
    }
    
    @classmethod
    def get_profile(cls, business_type: str) -> Dict[str, Any]:
        """Get business profile by type."""
        business_type = business_type.lower().strip()
        
        if business_type in cls.PROFILES:
            return cls.PROFILES[business_type]
        
        # Try partial match
        for key in cls.PROFILES:
            if business_type in key or key in business_type:
                return cls.PROFILES[key]
        
        # Default to cafe if not found
        return cls.PROFILES["cafe"]
    
    @classmethod
    def list_available_types(cls) -> list:
        """Get list of all available business types."""
        return list(cls.PROFILES.keys())
    
    @classmethod
    def get_profile_summary(cls, business_type: str) -> str:
        """Get human-readable summary of a business profile."""
        profile = cls.get_profile(business_type)
        
        age_min, age_max = profile["target_age_range"]
        min_inc = profile["min_income"]
        ideal_inc = profile["ideal_income"]
        sat = profile["ideal_saturation"]
        
        summary = f"""
{profile['name']}
Target Demographics:
  - Age: {age_min}-{age_max} years
  - Income: ${min_inc:,}+ (ideal: ${ideal_inc:,}+)
  - Ideal saturation: {sat} competitors per 10k people

Top Factors:
"""
        # Sort weights and show top 3
        weights = sorted(profile["weights"].items(), key=lambda x: x[1], reverse=True)
        for factor, weight in weights[:3]:
            summary += f"  - {factor}: {weight*100:.0f}%\n"
        
        return summary.strip()
