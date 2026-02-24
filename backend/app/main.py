# Purpose: FastAPI app entrypoint
from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.logging import configure_logging
from app.db.redis import redis_client
from app.api import routes_health, routes_locations, routes_admin, routes_scoring

logger = configure_logging()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info(f"Starting {settings.PROJECT_NAME} v{settings.VERSION}")
    redis_client.init_pool(settings.REDIS_URL)
    yield
    # Shutdown
    logger.info("Shutting down...")
    await redis_client.close()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan
)

routes_health.register_routes(app)
routes_locations.register_routes(app)
routes_admin.register_routes(app)
routes_scoring.register_routes(app)

