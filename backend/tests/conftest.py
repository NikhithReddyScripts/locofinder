import pytest
from httpx import AsyncClient, ASGITransport
import duckdb
from tests.mock_redis import MockRedis
import os
import polars as pl
from app.main import app
from app.db.connection import get_db
from app.db.redis import get_redis

# Create a tiny 5-row duckdb test file in memory using polars -> duckdb
TEST_DATA = [
    {"location_id": "LOC-001", "city": "TestA", "county": "CA", "state": "CA", "median_income": 100000.0, "crime_index": 20.0, "growth_index": 5.0, "home_price": 500000.0, "rent_price": 2000.0, "population": 10000, "lat": 0.0, "lon": 0.0},
    {"location_id": "LOC-002", "city": "TestB", "county": "CA", "state": "CA", "median_income": 80000.0, "crime_index": 40.0, "growth_index": 2.0, "home_price": 400000.0, "rent_price": 1500.0, "population": 20000, "lat": 0.0, "lon": 0.0},
    {"location_id": "LOC-003", "city": "TestC", "county": "TX", "state": "TX", "median_income": 150000.0, "crime_index": 10.0, "growth_index": 10.0, "home_price": 800000.0, "rent_price": 3000.0, "population": 5000, "lat": 0.0, "lon": 0.0},
]

@pytest.fixture
def mock_db():
    # Setup an in-memory db for testing
    conn = duckdb.connect(':memory:')
    df = pl.DataFrame(TEST_DATA)
    # Register the dataframe so we can query it like a table
    conn.register('test_data_table', df)
    
    # We patch the repository class directly in our test_api to point queries to 'test_data_table'
    # instead of the read_parquet file.
    yield conn
    conn.close()

@pytest.fixture
def mock_redis_client():
    return MockRedis()

@pytest.fixture
async def client(mock_db, mock_redis_client):
    # Override dependencies
    async def override_get_db():
        yield mock_db
        
    async def override_get_redis():
        yield mock_redis_client
        
    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_redis] = override_get_redis
    
    # Needs ASGITransport for newer httpx
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
        
    app.dependency_overrides.clear()
