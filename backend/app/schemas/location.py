from pydantic import BaseModel
from typing import List, Optional

class LocationBase(BaseModel):
    location_id: str
    city: str
    county: str
    state: str
    median_income: float
    crime_index: float
    growth_index: float
    home_price: float
    rent_price: float
    population: int
    lat: float
    lon: float

class LocationOut(LocationBase):
    pass

class LocationSearchResponse(BaseModel):
    total: int
    offset: int
    limit: int
    locations: List[LocationOut]
