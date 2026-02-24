from pydantic import BaseModel, Field
from typing import Dict, List, Optional
from app.schemas.location import LocationOut

class ScoringWeights(BaseModel):
    median_income: float = Field(default=0.0, description="Weight for high median income (positive helps)")
    crime_index: float = Field(default=0.0, description="Weight for low crime index (positive means you want low crime)")
    growth_index: float = Field(default=0.0, description="Weight for high growth index")
    home_price: float = Field(default=0.0, description="Weight for low home price (positive means you want cheaper homes)")
    rent_price: float = Field(default=0.0, description="Weight for low rent price (positive means you want cheaper rent)")

class ScoringFilters(BaseModel):
    state: Optional[str] = None
    max_home_price: Optional[float] = None
    max_rent_price: Optional[float] = None
    min_income: Optional[float] = None

class ScoringRequest(BaseModel):
    weights: ScoringWeights
    filters: ScoringFilters = Field(default_factory=ScoringFilters)
    limit: int = Field(default=20, ge=1, le=100)

class ExplainedScore(BaseModel):
    base_value: float
    normalized_value: float
    weight: float
    contribution: float

class RankedLocation(BaseModel):
    location: LocationOut
    total_score: float

class RecommendResponse(BaseModel):
    total_analyzed: int
    results: List[RankedLocation]

class ExplainResponse(BaseModel):
    location_id: str
    total_score: float
    features: Dict[str, ExplainedScore]

class FeatureSchema(BaseModel):
    feature_name: str
    description: str
    min_value: float
    max_value: float
    optimization_direction: str  # "minimize" or "maximize"
