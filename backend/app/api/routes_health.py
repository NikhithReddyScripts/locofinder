# Purpose: Health API routes
from fastapi import APIRouter, Depends
from app.core.config import settings
from app.db.redis import get_redis
import time

router = APIRouter()
START_TIME = time.time()

@router.get("/health")
async def health_check(redis: "redis.Redis" = Depends(get_redis)):
    uptime = time.time() - START_TIME
    try:
        redis_status = await redis.ping()
    except Exception:
        redis_status = False
    
    return {
        "status": "ok",
        "version": settings.VERSION,
        "uptime_seconds": round(uptime, 2),
        "redis": "connected" if redis_status else "disconnected"
    }

def register_routes(app):
    app.include_router(router, tags=["Health"])

