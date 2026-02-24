# Locofinder Backend Analysis Report

## 1. Architecture Overview
The Locofinder backend is built to calculate and serve real-time location metrics and rankings over synthetic geographical data. The system emphasizes high local read performance and modular code structuring.

### 1.1 Core Components
- **API Framework**: FastAPI (Python 3.11+) handles asynchronous HTTP requests and Pydantic validation.
- **Data Generator**: A custom `polars` script generates 10,000+ deterministic synthetic locations (using `faker` for city/county names) and outputs a highly compressed `dummy_locations.parquet` file.
- **Embedded Database**: DuckDB. By querying the native Parquet file directly, DuckDB provides analytical column-store read performance without requiring a heavy, external DB server (like PostgreSQL).
- **Caching Layer**: Redis caches identical search and recommendation results, dramatically offloading repetitive sorting operations.

## 2. API Endpoints
- `GET /health`: Returns basic uptime and Redis connectivity status.
- `GET /locations/search`: Returns paginated raw location data with optional state filtering.
- `GET /scoring/schema`: Returns metadata (min/max bounds, optimization direction) for scorable features (`median_income`, `crime_index`, etc.).
- `POST /recommend`: Accepts user-defined feature weights and hard filters via a JSON payload. Returns a scored, ranked subset of the data. 
- `POST /scoring/explain/{location_id}`: Yields a detailed calculation breakdown for a specific location's score.
- `POST /admin/reset-dummy-data`: Developer tool that triggers the Polars generation script on-demand via subprocess.

## 3. Scoring Engine
The proprietary scoring system uses **Min-Max Normalization** natively in Python memory to rank bulk locations extracted from DuckDB.
- Features like `median_income` are **maximized** (higher income -> score approaches 1.0).
- Features like `crime_index` and `home_price` are **minimized** (lower crime/price -> score approaches 1.0).
- Users pass weights between `0.0` and `1.0` to customize their ideal location profile.

### 3.1 Explainability
The `/scoring/explain` route provides full transparency into the matching algorithm. For each feature, it returns the `base_value`, its `normalized_value`, the applied `weight`, and the final math `contribution` towards the total score.

## 4. Performance Benchmarks
We conducted local load testing using **Locust** utilizing an environment of 100 concurrent users ramping up over 30 seconds.

### 4.1 Test Profile
- **Scenario:** 75% of users browse paginated search results; 25% of users submit heavy weighted recommendation queries. States were randomized to induce both cache hits and cache misses (simulating cold DuckDB reads vs warm Redis reads).
- **Users:** 100
- **Duration:** 30 seconds
- **Host:** `localhost:8000` (uvicorn single worker)

### 4.2 Architectural Latency Comparisons (30 Seconds, 100 Users)

We ran different runtime architectures to observe how the FastAPI event loop handled blocking DuckDB queries.

| Architecture | Total Requests | Failure Rate | Average Latency | Wait state |
| :--- | :--- | :--- | :--- | :--- |
| **Baseline (1 Worker)** | 297 | 0% | ~6,237 ms | Python event loop blocked. |
| **Threadpool (1 Worker)** | 943 | 0% | ~907 ms | Offloaded DB to threadpool. |
| **Horizontal Scale (4 Workers)** | 1,106 | 0% | ~352 ms | Parallel processed by CPU. |

### 4.3 Cache Degradation Percentiles (P50 - P99)
Using the optimal **4 Workers** setup, we contrasted a realistic caching environment (where repeated searches hit Redis instantly) against a forced **100% Cache Miss** environment that passed `X-Bypass-Cache: true` on every single request, forcing the server to route every request to DuckDB.

| Scenario | P50 (Median) | P75 | P95 | P99 (Worst Case) |
| :--- | :--- | :--- | :--- | :--- |
| **Normal Caching Load** | 75 ms | 140 ms | 2,800 ms | 3,500 ms |
| **100% Cache Miss Stress** | 150 ms | 350 ms | 2,500 ms | 3,400 ms |

### 4.4 Observations
- **Horizontal Scaling Efficiency:** Simply changing the Uvicorn runtime to use 4 separate processes (`--workers 4`) achieved the highest overall throughput and the lowest latency. Because DuckDB handles multiple parallel read connections exceptionally well, this architectural configuration proved optimal.
- **Cache Miss Resilience:** In the "Cache Miss Stress" scenario, we bypassed Redis entirely. While the median response time (P50) expectedly bumped from 75ms to 150ms, the tail latencies (P95/P99) **did not materially degrade**. DuckDB's analytical engine is highly efficient; even when completely saturated by 100 concurrent users performing real-time scoring evaluations, P99 worst-case query times capped firmly around ~3.5 seconds.
- **Stability:** Across all scenarios, the endpoints exhibited a **0% Server failure rate**.

## 5. Instructions to Run

1. Clone repository and set up a `.venv`.
2. `pip install -r backend/requirements.txt`
3. Generate data: `python backend/scripts/generate_dummy_data.py`
4. Start Redis (via provided `docker-compose.yml` or native process).
5. Run server: `uvicorn app.main:app` (use `--workers 4` for higher local concurrency).
6. Tests (100% coverage): `pytest backend/tests/ -v`
