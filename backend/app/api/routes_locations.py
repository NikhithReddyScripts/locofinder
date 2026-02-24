# Purpose: Locations API routes
from fastapi import APIRouter, Depends, Query, Header
import json
import logging
from typing import Optional
import duckdb

from app.db.connection import get_db
from app.db.repositories import LocationRepository
from app.schemas.location import LocationSearchResponse
from app.db.redis import get_redis

logger = logging.getLogger("locofinder")
router = APIRouter(prefix="/locations", tags=["Locations"])

@router.get("/search", response_model=LocationSearchResponse)
async def search_locations(
    state: Optional[str] = Query(None, description="Filter by state abbreviation"),
    offset: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    x_bypass_cache: Optional[bool] = Header(False, alias="X-Bypass-Cache"),
    redis: "redis.Redis" = Depends(get_redis),
    db: duckdb.DuckDBPyConnection = Depends(get_db)
):
    # Construct cache key
    cache_key = f"locations_search:state={state}:offset={offset}:limit={limit}"
    
    # Try cache
    if not x_bypass_cache:
        try:
            cached_result = await redis.get(cache_key)
            if cached_result:
                logger.info(f"Cache HIT for {cache_key}")
                return json.loads(cached_result)
            logger.info(f"Cache MISS for {cache_key}")
        except Exception as e:
            logger.warning(f"Redis get failed for {cache_key}: {e}")
    else:
        logger.info(f"Cache BYPASS for {cache_key}")

    # Fetch from DB
    repo = LocationRepository(db)
    from fastapi.concurrency import run_in_threadpool
    locations, total = await run_in_threadpool(repo.get_locations, state, offset, limit)
    
    response_data = {
        "total": total,
        "offset": offset,
        "limit": limit,
        "locations": locations
    }
    
    # Store in cache (TTL 300s = 5m)
    try:
        await redis.setex(cache_key, 300, json.dumps(response_data))
    except Exception as e:
        logger.warning(f"Redis setex failed for {cache_key}: {e}")
        
    return response_data

def register_routes(app):
    app.include_router(router)
