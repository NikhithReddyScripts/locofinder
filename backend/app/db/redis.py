# Purpose: Redis connection management
import redis.asyncio as redis
from typing import AsyncIterator
import logging

logger = logging.getLogger("locofinder")

class RedisClient:
    def __init__(self):
        self.pool = None

    def init_pool(self, url: str):
        self.pool = redis.from_url(url, decode_responses=True)
        logger.info(f"Initialized Redis pool at {url}")

    async def close(self):
        if self.pool:
            await self.pool.close()
            logger.info("Closed Redis pool")

    async def ping(self) -> bool:
        if not self.pool:
            return False
        try:
            return await self.pool.ping()
        except Exception as e:
            logger.error(f"Redis ping failed: {e}")
            return False

# Global instance
redis_client = RedisClient()

async def get_redis() -> AsyncIterator[redis.Redis]:
    if not redis_client.pool:
        raise RuntimeError("Redis pool not initialized")
    yield redis_client.pool
