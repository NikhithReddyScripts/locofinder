# Purpose: Scoring API routes
from fastapi import APIRouter, Depends, Query, Header, HTTPException
import json
import logging
from typing import Optional, List
import duckdb

from app.db.connection import get_db
from app.db.repositories import LocationRepository
from app.db.redis import get_redis
from app.schemas.scoring import ScoringRequest, RecommendResponse, ExplainResponse, FeatureSchema
from app.scoring.engine import score_locations, SCORABLE_FEATURES

logger = logging.getLogger("locofinder")
router = APIRouter(tags=["Scoring"])

@router.post("/recommend", response_model=RecommendResponse)
async def recommend_locations(
    request: ScoringRequest,
    x_bypass_cache: Optional[bool] = Header(False, alias="X-Bypass-Cache"),
    redis: "redis.Redis" = Depends(get_redis),
    db: duckdb.DuckDBPyConnection = Depends(get_db)
):
    # Deterministic cache key based on the request body
    payload_str = request.model_dump_json()
    cache_key = f"recommend:{hash(payload_str)}"
    
    if not x_bypass_cache:
        try:
            cached_result = await redis.get(cache_key)
            if cached_result:
                logger.info(f"Cache HIT for dict {cache_key}")
                return json.loads(cached_result)
        except Exception as e:
            logger.warning(f"Redis get failed for {cache_key}: {e}")
            
    repo = LocationRepository(db)
    from fastapi.concurrency import run_in_threadpool
    
    # 1. Fetch baseline locations matching hard constraints
    raw_locations = await run_in_threadpool(repo.get_all_locations_for_scoring, request.filters.model_dump(exclude_none=True))
    total_analyzed = len(raw_locations)
    
    # 2. Extract database-wide min/max stats for normalization
    stats = await run_in_threadpool(repo.get_feature_stats)
    
    if not stats or not raw_locations:
        return {"total_analyzed": 0, "results": []}
        
    # 3. Apply scoring engine (mutates and sorts list in-place)
    ranked_locations = score_locations(raw_locations, stats, request.weights)
    
    # 4. Truncate to limit
    top_results = ranked_locations[:request.limit]
    
    response_data = {
        "total_analyzed": total_analyzed,
        "results": [{"location": loc, "total_score": loc["total_score"]} for loc in top_results]
    }
    
    try:
        await redis.setex(cache_key, 300, json.dumps(response_data))
    except Exception as e:
        logger.warning(f"Redis setex failed for {cache_key}: {e}")
        
    return response_data

@router.get("/scoring/schema", response_model=List[FeatureSchema])
def get_scoring_schema(db: duckdb.DuckDBPyConnection = Depends(get_db)):
    """Returns metadata about what features can be weighted and their data distributions."""
    repo = LocationRepository(db)
    stats = repo.get_feature_stats()
    
    schemas = []
    for feat in SCORABLE_FEATURES:
        feat_stats = stats.get(feat.name, {"min": 0, "max": 0})
        schemas.append(FeatureSchema(
            feature_name=feat.name,
            description=f"Score based on {feat.name}",
            min_value=feat_stats["min"],
            max_value=feat_stats["max"],
            optimization_direction="minimize" if feat.minimize else "maximize"
        ))
    return schemas

@router.post("/scoring/explain/{location_id}", response_model=ExplainResponse)
def explain_scoring(
    location_id: str,
    weights: ScoringRequest,
    db: duckdb.DuckDBPyConnection = Depends(get_db)
):
    """Provides a detailed breakdown of a specific location's score given the weights."""
    repo = LocationRepository(db)
    stats = repo.get_feature_stats()
    
    # We cheat slightly by pulling the specific location natively via duckdb,
    # then running it through the normalizer as a list of 1.
    query = f"SELECT * FROM read_parquet('{repo.DUMMY_DATA_FILE}') WHERE location_id = ?" if hasattr(repo, 'DUMMY_DATA_FILE') else f"SELECT * FROM read_parquet('backend/data/dummy_locations.parquet') WHERE location_id = ?"
    try:
        results = repo.conn.execute(query, [location_id]).fetchall()
    except Exception:
        # Fallback to absolute if needed
        import os
        path = os.path.join(os.path.dirname(__file__), "..", "..", "data", "dummy_locations.parquet")
        query = f"SELECT * FROM read_parquet('{path}') WHERE location_id = ?"
        results = repo.conn.execute(query, [location_id]).fetchall()
        
    if not results:
        raise HTTPException(status_code=404, detail="Location not found")
        
    columns = [desc[0] for desc in repo.conn.description]
    loc_dict = dict(zip(columns, results[0]))
    
    # Score the single location
    scored = score_locations([loc_dict], stats, weights.weights)[0]
    
    return {
        "location_id": location_id,
        "total_score": scored["total_score"],
        "features": scored["features"]
    }

def register_routes(app):
    app.include_router(router)
