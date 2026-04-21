"""
Enhanced Census Service - Demographics Analysis

Fetches age distribution and income data from Census ACS5 API.
Calculates demographic match scores for different business types.
"""

import os
import requests
from typing import Dict, List, Optional, Tuple
import logging

logger = logging.getLogger("locofinder")


class EnhancedCensusService:
    """
    Enhanced Census service with demographic analysis.
    
    Fetches:
    - Age distribution by block group
    - Household income distribution
    - Education levels
    - Household composition
    """
    
    BASE_URL = "https://api.census.gov/data/2021/acs/acs5"
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize Census service.
        
        Args:
            api_key: Census API key (optional but recommended)
        """
        self.api_key = api_key or os.getenv("CENSUS_API_KEY")
    
    def fetch_demographics(
        self,
        block_group_geoids: List[str]
    ) -> Dict[str, Dict[str, any]]:
        """
        Fetch comprehensive demographics for block groups.
        
        Args:
            block_group_geoids: List of block group GEOIDs
            
        Returns:
            Dict mapping GEOID to demographic data
        """
        
        demographics = {}
        
        # Fetch in batches (Census API limit)
        batch_size = 50
        for i in range(0, len(block_group_geoids), batch_size):
            batch = block_group_geoids[i:i+batch_size]
            
            # Fetch age data
            age_data = self._fetch_age_distribution(batch)
            
            # Fetch income data
            income_data = self._fetch_income_distribution(batch)
            
            # Combine
            for geoid in batch:
                demographics[geoid] = {
                    "age_distribution": age_data.get(geoid, {}),
                    "income_distribution": income_data.get(geoid, {}),
                }
        
        return demographics
    
    def _fetch_age_distribution(
        self,
        geoids: List[str]
    ) -> Dict[str, Dict[str, int]]:
        """
        Fetch age distribution from Census ACS5.
        
        Variables:
        - B01001_001E: Total population
        - B01001_003E to B01001_025E: Male age groups
        - B01001_027E to B01001_049E: Female age groups
        """
        
        # Age group variables
        variables = [
            "B01001_001E",  # Total
            "B01001_003E", "B01001_004E", "B01001_005E",  # Male 0-19
            "B01001_006E", "B01001_007E", "B01001_008E", "B01001_009E",  # Male 20-34
            "B01001_010E", "B01001_011E", "B01001_012E", "B01001_013E",  # Male 35-54
            "B01001_014E", "B01001_015E", "B01001_016E",  # Male 55-74
            "B01001_017E", "B01001_018E", "B01001_019E",  # Male 75+
            "B01001_027E", "B01001_028E", "B01001_029E",  # Female 0-19
            "B01001_030E", "B01001_031E", "B01001_032E", "B01001_033E",  # Female 20-34
            "B01001_034E", "B01001_035E", "B01001_036E", "B01001_037E",  # Female 35-54
            "B01001_038E", "B01001_039E", "B01001_040E",  # Female 55-74
            "B01001_041E", "B01001_042E", "B01001_043E",  # Female 75+
        ]
        
        params = {
            "get": ",".join(variables),
            "for": f"block group:*",
            "in": f"state:06 county:073",  # San Diego County
        }
        
        if self.api_key:
            params["key"] = self.api_key
        
        try:
            response = requests.get(self.BASE_URL, params=params, timeout=30)
            response.raise_for_status()
            data = response.json()
            
            # Parse results
            age_data = {}
            headers = data[0]
            
            for row in data[1:]:
                # Build GEOID
                state = row[headers.index("state")]
                county = row[headers.index("county")]
                tract = row[headers.index("tract")]
                bg = row[headers.index("block group")]
                geoid = f"{state}{county}{tract}{bg}"
                
                if geoid not in geoids:
                    continue
                
                # Parse age groups
                total = int(row[0] or 0)
                
                # Aggregate into age brackets
                age_0_17 = sum(int(row[i] or 0) for i in range(1, 4)) + sum(int(row[i] or 0) for i in range(12, 15))
                age_18_24 = int(row[4] or 0) + int(row[15] or 0)
                age_25_34 = int(row[5] or 0) + int(row[6] or 0) + int(row[16] or 0) + int(row[17] or 0)
                age_35_44 = int(row[7] or 0) + int(row[8] or 0) + int(row[18] or 0) + int(row[19] or 0)
                age_45_54 = int(row[9] or 0) + int(row[10] or 0) + int(row[20] or 0) + int(row[21] or 0)
                age_55_64 = int(row[11] or 0) + int(row[12] or 0) + int(row[22] or 0) + int(row[23] or 0)
                age_65_plus = sum(int(row[i] or 0) for i in range(13, 20)) + sum(int(row[i] or 0) for i in range(24, 31))
                
                age_data[geoid] = {
                    "total": total,
                    "0-17": age_0_17,
                    "18-24": age_18_24,
                    "25-34": age_25_34,
                    "35-44": age_35_44,
                    "45-54": age_45_54,
                    "55-64": age_55_64,
                    "65+": age_65_plus,
                }
            
            return age_data
            
        except Exception as e:
            logger.error(f"Error fetching age data: {e}")
            return {}
    
    def _fetch_income_distribution(
        self,
        geoids: List[str]
    ) -> Dict[str, Dict[str, int]]:
        """
        Fetch household income distribution.
        
        Variables: B19001_* (Household income in past 12 months)
        """
        
        variables = [
            "B19001_001E",  # Total households
            "B19001_002E", "B19001_003E", "B19001_004E", "B19001_005E",  # <$25k
            "B19001_006E", "B19001_007E", "B19001_008E",  # $25k-$50k
            "B19001_009E", "B19001_010E", "B19001_011E",  # $50k-$75k
            "B19001_012E", "B19001_013E",  # $75k-$100k
            "B19001_014E", "B19001_015E", "B19001_016E", "B19001_017E",  # $100k+
        ]
        
        params = {
            "get": ",".join(variables),
            "for": f"block group:*",
            "in": f"state:06 county:073",
        }
        
        if self.api_key:
            params["key"] = self.api_key
        
        try:
            response = requests.get(self.BASE_URL, params=params, timeout=30)
            response.raise_for_status()
            data = response.json()
            
            income_data = {}
            headers = data[0]
            
            for row in data[1:]:
                # Build GEOID
                state = row[headers.index("state")]
                county = row[headers.index("county")]
                tract = row[headers.index("tract")]
                bg = row[headers.index("block group")]
                geoid = f"{state}{county}{tract}{bg}"
                
                if geoid not in geoids:
                    continue
                
                # Aggregate into income brackets
                total = int(row[0] or 0)
                under_25k = sum(int(row[i] or 0) for i in range(1, 5))
                income_25_50k = sum(int(row[i] or 0) for i in range(5, 8))
                income_50_75k = sum(int(row[i] or 0) for i in range(8, 11))
                income_75_100k = sum(int(row[i] or 0) for i in range(11, 13))
                income_100_150k = sum(int(row[i] or 0) for i in range(13, 15))
                income_150k_plus = sum(int(row[i] or 0) for i in range(15, 17))
                
                income_data[geoid] = {
                    "total_households": total,
                    "<$25k": under_25k,
                    "$25k-$50k": income_25_50k,
                    "$50k-$75k": income_50_75k,
                    "$75k-$100k": income_75_100k,
                    "$100k-$150k": income_100_150k,
                    "$150k+": income_150k_plus,
                }
            
            return income_data
            
        except Exception as e:
            logger.error(f"Error fetching income data: {e}")
            return {}
    
    def calculate_demographic_match_score(
        self,
        demographics: Dict[str, any],
        target_age_range: Tuple[int, int],
        min_income: int,
        ideal_income: int,
    ) -> float:
        """
        Calculate how well demographics match target profile.
        
        Returns score 0-100.
        """
        
        if not demographics:
            return 50.0  # Neutral if no data
        
        age_dist = demographics.get("age_distribution", {})
        income_dist = demographics.get("income_distribution", {})
        
        score = 0.0
        
        # 1. Age match (50% weight)
        age_score = self._calculate_age_match(age_dist, target_age_range)
        score += age_score * 0.5
        
        # 2. Income match (50% weight)
        income_score = self._calculate_income_match(income_dist, min_income, ideal_income)
        score += income_score * 0.5
        
        return round(score, 2)
    
    def _calculate_age_match(
        self,
        age_dist: Dict[str, int],
        target_range: Tuple[int, int]
    ) -> float:
        """Calculate percentage of population in target age range."""
        
        if not age_dist or age_dist.get("total", 0) == 0:
            return 50.0
        
        total = age_dist["total"]
        target_min, target_max = target_range
        
        # Map age brackets to target range
        in_target = 0
        
        if target_min <= 17:
            in_target += age_dist.get("0-17", 0)
        if target_min <= 24 and target_max >= 18:
            in_target += age_dist.get("18-24", 0)
        if target_min <= 34 and target_max >= 25:
            in_target += age_dist.get("25-34", 0)
        if target_min <= 44 and target_max >= 35:
            in_target += age_dist.get("35-44", 0)
        if target_min <= 54 and target_max >= 45:
            in_target += age_dist.get("45-54", 0)
        if target_min <= 64 and target_max >= 55:
            in_target += age_dist.get("55-64", 0)
        if target_max >= 65:
            in_target += age_dist.get("65+", 0)
        
        percentage = (in_target / total) * 100 if total > 0 else 0
        
        # Score: 100 if 80%+ in target, scale down
        if percentage >= 80:
            return 100.0
        elif percentage >= 60:
            return 80.0 + ((percentage - 60) / 20) * 20
        elif percentage >= 40:
            return 60.0 + ((percentage - 40) / 20) * 20
        else:
            return (percentage / 40) * 60
    
    def _calculate_income_match(
        self,
        income_dist: Dict[str, int],
        min_income: int,
        ideal_income: int
    ) -> float:
        """Calculate percentage of households meeting income requirements."""
        
        if not income_dist or income_dist.get("total_households", 0) == 0:
            return 50.0
        
        total = income_dist["total_households"]
        
        # Count households above minimum
        above_min = 0
        above_ideal = 0
        
        if min_income <= 25000:
            above_min += income_dist.get("<$25k", 0)
        if min_income <= 50000:
            above_min += income_dist.get("$25k-$50k", 0)
        if min_income <= 75000:
            above_min += income_dist.get("$50k-$75k", 0)
        if min_income <= 100000:
            above_min += income_dist.get("$75k-$100k", 0)
        above_min += income_dist.get("$100k+", 0)
        
        if ideal_income <= 50000:
            above_ideal += income_dist.get("$25k-$50k", 0)
        if ideal_income <= 75000:
            above_ideal += income_dist.get("$50k-$75k", 0)
        if ideal_income <= 100000:
            above_ideal += income_dist.get("$75k-$100k", 0)
        above_ideal += income_dist.get("$100k+", 0)
        
        pct_above_min = (above_min / total) * 100 if total > 0 else 0
        pct_above_ideal = (above_ideal / total) * 100 if total > 0 else 0
        
        # Scoring
        if pct_above_ideal >= 50:
            return 100.0
        elif pct_above_ideal >= 30:
            return 80.0 + ((pct_above_ideal - 30) / 20) * 20
        elif pct_above_min >= 60:
            return 60.0 + ((pct_above_min - 60) / 20) * 20
        else:
            return (pct_above_min / 60) * 60
