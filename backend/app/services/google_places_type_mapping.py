"""
Google Places API Type Mapping

Maps our business types to valid Google Places API v1 types.
Google's new API uses different type names than the old API.
"""

# Map our types to Google Places API (new) types
GOOGLE_PLACES_TYPE_MAP = {
    # Food & Drink
    'cafe': 'cafe',
    'restaurant': 'restaurant',
    'bakery': 'bakery',
    'bar': 'bar',
    'fast_food_restaurant': 'fast_food_restaurant',
    'pizza_restaurant': 'pizza_restaurant',
    'ice_cream_shop': 'ice_cream_shop',
    'meal_takeaway': 'meal_takeaway',
    
    # Health & Fitness
    'gym': 'gym',
    'spa': 'spa',
    'yoga_studio': 'fitness_center',  # Maps to fitness_center
    'beauty_salon': 'beauty_salon',
    'hair_salon': 'hair_salon',  # This is valid in new API
    'nail_salon': 'beauty_salon',  # Maps to beauty_salon
    
    # Retail
    'grocery_store': 'grocery_store',
    'supermarket': 'supermarket',
    'convenience_store': 'convenience_store',
    'clothing_store': 'clothing_store',
    'shoe_store': 'shoe_store',
    'book_store': 'book_store',
    'florist': 'florist',
    'pet_store': 'pet_store',
    'hardware_store': 'hardware_store',
    'electronics_store': 'electronics_store',
    'furniture_store': 'furniture_store',
    'jewelry_store': 'jewelry_store',
    'bicycle_store': 'sporting_goods_store',
    'liquor_store': 'liquor_store',
    
    # Services
    'laundry': 'laundry',
    'car_wash': 'car_wash',
    'bank': 'bank',
    'atm': 'atm',
    'gas_station': 'gas_station',
    'parking': 'parking',
    
    # Automotive
    'auto_parts_store': 'auto_parts_store',
    'car_dealer': 'car_dealer',
    'car_repair': 'car_repair',
    
    # Healthcare
    'hospital': 'hospital',
    'pharmacy': 'pharmacy',
    'dentist': 'dentist',
    'doctor': 'doctor',
    'veterinary_care': 'veterinary_care',
    
    # Education
    'preschool': 'preschool',
    'primary_school': 'primary_school',
    'secondary_school': 'secondary_school',
    'university': 'university',
    'library': 'library',
    
    # Entertainment
    'night_club': 'night_club',
    'movie_theater': 'movie_theater',
    'bowling_alley': 'bowling_alley',
    'amusement_park': 'amusement_park',
    'tourist_attraction': 'tourist_attraction',
    
    # Hospitality
    'lodging': 'lodging',
    'rv_park': 'rv_park',
    'campground': 'campground',
}


def get_google_places_type(business_type: str) -> str:
    """
    Convert our business type to Google Places API type.
    Falls back to original if no mapping exists.
    """
    return GOOGLE_PLACES_TYPE_MAP.get(business_type, business_type)
