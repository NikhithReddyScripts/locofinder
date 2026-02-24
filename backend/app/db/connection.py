# Purpose: DB connection layer using DuckDB
import duckdb
import os
import logging
from typing import Generator

logger = logging.getLogger("locofinder")
DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data")
DUMMY_DATA_FILE = os.path.join(DATA_DIR, "dummy_locations.parquet")

def get_connection() -> duckdb.DuckDBPyConnection:
    if not os.path.exists(DUMMY_DATA_FILE):
        logger.warning(f"Data file not found at {DUMMY_DATA_FILE}. Run dummy generation.")
    # In-memory performance with readonly access to the parquet file
    conn = duckdb.connect(database=':memory:', read_only=False)
    return conn

def get_db() -> Generator[duckdb.DuckDBPyConnection, None, None]:
    conn = get_connection()
    try:
        yield conn
    finally:
        conn.close()
