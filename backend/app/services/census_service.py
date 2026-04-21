"""
Census API service for population and demographic data.
Adapted from main1 census.py
"""
from __future__ import annotations

import requests
from typing import Dict, Optional

# ACS5 endpoint
ACS_YEAR = 2023
ACS_BASE = f"https://api.census.gov/data/{ACS_YEAR}/acs/acs5"

# Variable codes
POP_VAR = "B01003_001E"  # Total population
MEDIAN_INCOME_VAR = "B19013_001E"  # Median household income


class CensusService:
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize Census API service.
        
        Args:
            api_key: Census API key (optional but recommended)
        """
        self.api_key = api_key

    def fetch_block_group_population(
        self,
        state: str = "06",  # California
        county: str = "073",  # San Diego County
    ) -> Dict[str, int]:
        """
        Fetch population for all block groups in a county.
        
        Args:
            state: State FIPS code (06 = California)
            county: County FIPS code (073 = San Diego)
            
        Returns:
            Dict mapping 12-digit GEOID to population
        """
        params = {
            "get": f"NAME,{POP_VAR}",
            "for": "block group:*",
            "in": f"state:{state} county:{county}",
        }
        
        if self.api_key:
            params["key"] = self.api_key
        
        r = requests.get(ACS_BASE, params=params, timeout=60)
        r.raise_for_status()
        
        rows = r.json()
        header = rows[0]
        
        # Find column indices
        idx_pop = header.index(POP_VAR)
        idx_state = header.index("state")
        idx_county = header.index("county")
        idx_tract = header.index("tract")
        idx_bg = header.index("block group")
        
        # Build GEOID -> population mapping
        result: Dict[str, int] = {}
        for row in rows[1:]:
            # GEOID format: state(2) + county(3) + tract(6) + block group(1)
            geoid = f"{row[idx_state]}{row[idx_county]}{row[idx_tract]}{row[idx_bg]}"
            
            try:
                result[geoid] = int(row[idx_pop])
            except (ValueError, TypeError):
                result[geoid] = 0
        
        return result

    def fetch_block_group_income(
        self,
        state: str = "06",
        county: str = "073",
    ) -> Dict[str, int]:
        """
        Fetch median household income for block groups.
        
        Returns:
            Dict mapping GEOID to median income
        """
        params = {
            "get": f"NAME,{MEDIAN_INCOME_VAR}",
            "for": "block group:*",
            "in": f"state:{state} county:{county}",
        }
        
        if self.api_key:
            params["key"] = self.api_key
        
        r = requests.get(ACS_BASE, params=params, timeout=60)
        r.raise_for_status()
        
        rows = r.json()
        header = rows[0]
        
        idx_income = header.index(MEDIAN_INCOME_VAR)
        idx_state = header.index("state")
        idx_county = header.index("county")
        idx_tract = header.index("tract")
        idx_bg = header.index("block group")
        
        result: Dict[str, int] = {}
        for row in rows[1:]:
            geoid = f"{row[idx_state]}{row[idx_county]}{row[idx_tract]}{row[idx_bg]}"
            
            try:
                result[geoid] = int(row[idx_income])
            except (ValueError, TypeError):
                result[geoid] = 0
        
        return result

    def fetch_tract_data(
        self,
        variables: list[str],
        state: str = "06",
        county: str = "073",
    ) -> Dict[str, Dict[str, any]]:
        """
        Fetch arbitrary variables at tract level.
        
        Args:
            variables: List of ACS variable codes
            state: State FIPS code
            county: County FIPS code
            
        Returns:
            Dict mapping tract GEOID to variable values
        """
        params = {
            "get": f"NAME,{','.join(variables)}",
            "for": "tract:*",
            "in": f"state:{state} county:{county}",
        }
        
        if self.api_key:
            params["key"] = self.api_key
        
        r = requests.get(ACS_BASE, params=params, timeout=60)
        r.raise_for_status()
        
        rows = r.json()
        header = rows[0]
        
        idx_state = header.index("state")
        idx_county = header.index("county")
        idx_tract = header.index("tract")
        
        result: Dict[str, Dict[str, any]] = {}
        for row in rows[1:]:
            # Tract GEOID: state(2) + county(3) + tract(6)
            geoid = f"{row[idx_state]}{row[idx_county]}{row[idx_tract]}"
            
            data = {}
            for var in variables:
                idx = header.index(var)
                try:
                    data[var] = float(row[idx]) if row[idx] else None
                except (ValueError, TypeError):
                    data[var] = None
            
            result[geoid] = data
        
        return result
