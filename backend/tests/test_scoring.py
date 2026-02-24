import pytest
from app.scoring.engine import normalize_minmax, normalize_zscore, score_locations
from app.schemas.scoring import ScoringWeights

def test_normalize_minmax_standard():
    assert normalize_minmax(50, 0, 100) == 0.5
    assert normalize_minmax(0, 0, 100) == 0.0
    assert normalize_minmax(100, 0, 100) == 1.0

def test_normalize_minmax_minimize():
    # When minimize=True, lower values get higher scores
    assert normalize_minmax(0, 0, 100, minimize=True) == 1.0
    assert normalize_minmax(100, 0, 100, minimize=True) == 0.0
    assert normalize_minmax(75, 0, 100, minimize=True) == 0.25

def test_normalize_minmax_flat():
    assert normalize_minmax(50, 50, 50) == 0.5

def test_normalize_zscore_standard():
    val = normalize_zscore(100, 100, 10)
    assert val == 0.5  # sigmoid(0) = 0.5

def test_score_locations():
    locations = [
        {"location_id": "L1", "median_income": 100000, "rent_price": 1000},
        {"location_id": "L2", "median_income": 50000, "rent_price": 5000},
    ]
    
    db_stats = {
        "median_income": {"min": 50000, "max": 100000},
        "rent_price": {"min": 1000, "max": 5000},
    }
    
    # We want high income (positive weight) and low rent (positive weight on a minimize feature)
    weights = ScoringWeights(median_income=1.0, rent_price=1.0)
    
    result = score_locations(locations, db_stats, weights)
    
    # L1 should win because it has max income (1.0) and min rent (1.0 reversed)
    assert result[0]["location_id"] == "L1"
    assert result[0]["total_score"] == 2.0
    
    # L2 has min income (0.0) and max rent (0.0 reversed)
    assert result[1]["location_id"] == "L2"
    assert result[1]["total_score"] == 0.0
