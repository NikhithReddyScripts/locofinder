import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.db.redis import get_redis
from tests.mock_redis import MockFailingRedis

@pytest.fixture
async def failing_redis_client_app():
    # Setup app with a broken redis client
    app.dependency_overrides[get_redis] = lambda: MockFailingRedis()
    
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
        
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_health_redis_down(failing_redis_client_app: AsyncClient):
    response = await failing_redis_client_app.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    # Even if redis is down, the API itself should be "ok", but redis should report "disconnected"
    assert data["redis"] == "disconnected"

@pytest.mark.asyncio
async def test_search_redis_down_resilience(failing_redis_client_app: AsyncClient, monkeypatch):
    # We still need the repository patched so it doesn't try to read parquet
    from app.db.repositories import LocationRepository
    def mock_get_locations(self, state, offset, limit):
        return [{
            "location_id": "RESILIENT",
            "city": "Resilient City",
            "county": "County",
            "state": "CA",
            "median_income": 50000,
            "crime_index": 50,
            "growth_index": 5,
            "home_price": 300000,
            "rent_price": 1500,
            "population": 10000,
            "lat": 0.0,
            "lon": 0.0
        }], 1
        
    monkeypatch.setattr(LocationRepository, "get_locations", mock_get_locations)
    
    # Even with a ConnectionError in Redis, the endpoint catches it and proceeds to DB
    response = await failing_redis_client_app.get("/locations/search")
    assert response.status_code == 200
    data = response.json()
    assert data["locations"][0]["location_id"] == "RESILIENT"
