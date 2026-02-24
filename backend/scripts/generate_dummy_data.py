"""
Purpose: Generate realistic dummy data for Locofinder
Responsibilities: Create a 10k+ row synthetic dataset using Polars and Faker, save to Parquet.
Inputs/Outputs: No inputs. Outputs 'backend/data/dummy_locations.parquet'.
"""
import os
import random
from faker import Faker
import polars as pl
import argparse
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("dummy_data_gen")

TARGET_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "dummy_locations.parquet")

def generate_data(num_rows: int = 10000) -> None:
    fake = Faker('en_US')
    # Make generation deterministic for testing
    Faker.seed(42)
    random.seed(42)

    logger.info(f"Generating {num_rows} rows of dummy data...")
    
    data = []
    for i in range(1, num_rows + 1):
        location_id = f"LOC-{i:06d}"
        city = fake.city()
        county = city + " County"
        state = fake.state_abbr()
        median_income = round(random.uniform(30000, 150000), 2)
        crime_index = round(random.uniform(10, 100), 1)
        growth_index = round(random.uniform(-5, 15), 1)
        home_price = round(random.uniform(100000, 1500000), 2)
        rent_price = round(random.uniform(500, 5000), 2)
        population = random.randint(1000, 5000000)
        lat = float(fake.latitude())
        lon = float(fake.longitude())
        
        data.append({
            "location_id": location_id,
            "city": city,
            "county": county,
            "state": state,
            "median_income": median_income,
            "crime_index": crime_index,
            "growth_index": growth_index,
            "home_price": home_price,
            "rent_price": rent_price,
            "population": population,
            "lat": lat,
            "lon": lon
        })

    # Use Polars to create a DataFrame and write to parquet
    df = pl.DataFrame(data)
    
    # Ensure data directory exists
    os.makedirs(os.path.dirname(TARGET_FILE), exist_ok=True)
    
    # Write to parquet
    df.write_parquet(TARGET_FILE)
    
    logger.info(f"Successfully generated {len(df)} rows and saved to {TARGET_FILE}.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate dummy location data.")
    parser.add_argument("--rows", type=int, default=10000, help="Number of rows to generate")
    args = parser.parse_args()
    generate_data(args.rows)
