# Purpose: DB repositories for Data Access
import duckdb
from typing import List, Tuple, Optional, Dict
from app.db.connection import DUMMY_DATA_FILE
import os
import logging

logger = logging.getLogger("locofinder")

class LocationRepository:
    def __init__(self, conn: duckdb.DuckDBPyConnection):
        self.conn = conn

    def get_locations(self, state: Optional[str], offset: int, limit: int) -> Tuple[List[dict], int]:
        if not os.path.exists(DUMMY_DATA_FILE):
            logger.error(f"Cannot query. {DUMMY_DATA_FILE} is missing.")
            return [], 0

        base_query = f"FROM read_parquet('{DUMMY_DATA_FILE}')"
        
        where_clause = ""
        params = []
        if state:
            where_clause = "WHERE state = ?"
            params.append(state)

        count_query = f"SELECT count(*) {base_query} {where_clause}"
        total = self.conn.execute(count_query, params).fetchone()[0]

        data_query = f"SELECT * {base_query} {where_clause} LIMIT ? OFFSET ?"
        params.extend([limit, offset])
        
        results = self.conn.execute(data_query, params).fetchall()
        
        columns = [desc[0] for desc in self.conn.description]
        locations = [dict(zip(columns, row)) for row in results]
        
        return locations, total

    def get_all_locations_for_scoring(self, filters: dict) -> List[dict]:
        """Fetch unpaginated bulk list of locations matching hard constraints"""
        if not os.path.exists(DUMMY_DATA_FILE):
            return []
            
        base_query = f"FROM read_parquet('{DUMMY_DATA_FILE}')"
        conditions = []
        params = []
        
        if filters.get("state"):
            conditions.append("state = ?")
            params.append(filters["state"])
            
        if filters.get("max_home_price"):
            conditions.append("home_price <= ?")
            params.append(filters["max_home_price"])
            
        if filters.get("max_rent_price"):
            conditions.append("rent_price <= ?")
            params.append(filters["max_rent_price"])
            
        if filters.get("min_income"):
            conditions.append("median_income >= ?")
            params.append(filters["min_income"])

        where_clause = ""
        if conditions:
            where_clause = "WHERE " + " AND ".join(conditions)

        data_query = f"SELECT * {base_query} {where_clause}"
        results = self.conn.execute(data_query, params).fetchall()
        columns = [desc[0] for desc in self.conn.description]
        return [dict(zip(columns, row)) for row in results]

    def get_feature_stats(self) -> Dict[str, Dict[str, float]]:
        """Extract min/max of key numerical columns for normalization"""
        if not os.path.exists(DUMMY_DATA_FILE):
            return {}

        features = ["median_income", "crime_index", "growth_index", "home_price", "rent_price"]
        stats = {}
        
        # Build a single query to get MIN and MAX for all features at once for performance
        selects = []
        for feat in features:
            selects.append(f"MIN({feat}) as {feat}_min, MAX({feat}) as {feat}_max")
            
        query = f"SELECT {', '.join(selects)} FROM read_parquet('{DUMMY_DATA_FILE}')"
        
        row = self.conn.execute(query).fetchone()
        
        if not row:
            return {}
            
        # Map row tuple back to dict { feature_name: {min, max} }
        for i, feat in enumerate(features):
            stats[feat] = {
                "min": float(row[i*2]),
                "max": float(row[i*2 + 1])
            }
            
        return stats

