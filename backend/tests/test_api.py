import pytest
from httpx import AsyncClient
import duckdb

# We need to monkeypatch the Repository so it queries our in-memory "test_data_table" 
# instead of the physical parquet file.
@pytest.fixture(autouse=True)
def patch_repository(monkeypatch):
    from app.db.repositories import LocationRepository
    
    # Keep original init
    orig_init = LocationRepository.__init__
    
    def mock_get_locations(self, state, offset, limit):
        where_clause = f"WHERE state = '{state}'" if state else ""
        count_q = f"SELECT count(*) FROM test_data_table {where_clause}"
        total = self.conn.execute(count_q).fetchone()[0]
        
        data_q = f"SELECT * FROM test_data_table {where_clause} LIMIT {limit} OFFSET {offset}"
        results = self.conn.execute(data_q).fetchall()
        columns = [desc[0] for desc in self.conn.description]
        return [dict(zip(columns, row)) for row in results], total
        
    def mock_get_all_locations_for_scoring(self, filters):
        conditions = []
        if filters.get("state"):
            conditions.append(f"state = '{filters['state']}'")
        if filters.get("max_home_price"):
            conditions.append(f"home_price <= {filters['max_home_price']}")
        where_clause = "WHERE " + " AND ".join(conditions) if conditions else ""
        
        data_q = f"SELECT * FROM test_data_table {where_clause}"
        results = self.conn.execute(data_q).fetchall()
        columns = [desc[0] for desc in self.conn.description]
        return [dict(zip(columns, row)) for row in results]
        
    def mock_get_feature_stats(self):
        features = ["median_income", "crime_index", "growth_index", "home_price", "rent_price"]
        selects = [f"MIN({f}) as {f}_min, MAX({f}) as {f}_max" for f in features]
        query = f"SELECT {', '.join(selects)} FROM test_data_table"
        row = self.conn.execute(query).fetchone()
        
        stats = {}
        for i, feat in enumerate(features):
            stats[feat] = {"min": float(row[i*2]), "max": float(row[i*2 + 1])}
        return stats

    monkeypatch.setattr(LocationRepository, "get_locations", mock_get_locations)
    monkeypatch.setattr(LocationRepository, "get_all_locations_for_scoring", mock_get_all_locations_for_scoring)
    monkeypatch.setattr(LocationRepository, "get_feature_stats", mock_get_feature_stats)

@pytest.mark.asyncio
async def test_health_endpoint(client: AsyncClient):
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "uptime_seconds" in data
    assert data["redis"] == "connected" # the mock_redis ping returns True

@pytest.mark.asyncio
async def test_search_locations(client: AsyncClient):
    response = await client.get("/locations/search?limit=2")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 3
    assert len(data["locations"]) == 2
    assert data["locations"][0]["location_id"] == "LOC-001"

@pytest.mark.asyncio
async def test_search_locations_filtered(client: AsyncClient):
    response = await client.get("/locations/search?state=TX")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["locations"][0]["city"] == "TestC"

@pytest.mark.asyncio
async def test_recommend_locations(client: AsyncClient):
    payload = {
        "weights": {
            "median_income": 1.0,
            "home_price": 1.0
        },
        "filters": {
            "state": "CA" # Only LOC-001 and LOC-002
        },
        "limit": 5
    }
    
    response = await client.post("/recommend", json=payload)
    assert response.status_code == 200
    data = response.json()
    
    assert data["total_analyzed"] == 2
    assert len(data["results"]) == 2
    
    # Income: CA max is 100k, min is 80k.
    # Home Price: CA max applies (minimize = True).
    # LOC-001 has highest income (1.0 vs 0.0). However, LOC-002 has lowest home price (1.0 vs 0.0)
    # The normalizer calculates over ALL data in test_data_table though (TX included).
    # TX has 150k income, 800k home_price.
    # Overall min/max across all 3: 
    # Income: 80k (min) to 150k (max)
    # Home price: 400k (min) to 800k (max)
    
    # LOC-001 Income = (100k-80k)/70k = 0.28. Home price (reversed) = 1 - (500k-400k)/400k = 0.75. Total = 1.03
    # LOC-002 Income = (80k-80k)/70k = 0. Home price (reversed) = 1 - (400k-400k)/400k = 1.0. Total = 1.0
    
    assert data["results"][0]["location"]["location_id"] == "LOC-001"
    assert data["results"][1]["location"]["location_id"] == "LOC-002"

@pytest.mark.asyncio
async def test_scoring_schema(client: AsyncClient):
    response = await client.get("/scoring/schema")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 5
    income_feat = next(f for f in data if f["feature_name"] == "median_income")
    assert income_feat["min_value"] == 80000.0
    assert income_feat["max_value"] == 150000.0
