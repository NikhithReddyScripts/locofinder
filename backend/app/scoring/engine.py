from typing import Dict, List, Any
from pydantic import BaseModel

def normalize_minmax(value: float, min_val: float, max_val: float, minimize: bool = False) -> float:
    """
    Min-max normalization. 
    If minimize is True (e.g. for crime index), lower values get scores closer to 1.
    """
    if max_val == min_val:
        return 0.5
    
    normalized = (value - min_val) / (max_val - min_val)
    if minimize:
        normalized = 1.0 - normalized
    return normalized

def normalize_zscore(value: float, mean: float, std_dev: float, minimize: bool = False) -> float:
    """
    Z-score normalization mapped roughly to a 0-1 scale using sigmoid to bound it.
    Not strictly needed for basic Phase 3 but included per specs.
    """
    import math
    if std_dev == 0:
        return 0.5
    z = (value - mean) / std_dev
    if minimize:
        z = -z
    
    # Sigmoid function out to bound between 0 and 1
    return 1 / (1 + math.exp(-z))


class EngineFeature(BaseModel):
    name: str # e.g. "median_income"
    minimize: bool # True if lower is better (rent, crime)

# Features we support scoring on
SCORABLE_FEATURES = [
    EngineFeature(name="median_income", minimize=False),
    EngineFeature(name="crime_index", minimize=True),
    EngineFeature(name="growth_index", minimize=False),
    EngineFeature(name="home_price", minimize=True),
    EngineFeature(name="rent_price", minimize=True)
]

def score_locations(locations: List[dict], db_stats: Dict[str, Dict[str, float]], weights: BaseModel) -> List[dict]:
    """
    Takes a raw list of location dictionaries from DB.
    Applies the weights using Min-Max normalization based on the overall database stats.
    Returns the same list mutated with 'total_score' and 'explained_scores'.
    """
    
    weight_dict = weights.model_dump()
    
    for loc in locations:
        total_score = 0.0
        explained = {}
        
        for feat in SCORABLE_FEATURES:
            w = weight_dict.get(feat.name, 0.0)
            if w == 0:
                continue
                
            val = loc.get(feat.name, 0.0)
            stats = db_stats.get(feat.name, {"min": 0, "max": 1})
            
            norm_val = normalize_minmax(
                value=float(val), 
                min_val=stats["min"], 
                max_val=stats["max"], 
                minimize=feat.minimize
            )
            
            contribution = norm_val * w
            total_score += contribution
            
            explained[feat.name] = {
                "base_value": float(val),
                "normalized_value": norm_val,
                "weight": w,
                "contribution": contribution
            }
            
        loc["total_score"] = float(total_score)
        loc["features"] = explained
        
    # Sort descending by total score
    locations.sort(key=lambda x: x["total_score"], reverse=True)
    return locations
