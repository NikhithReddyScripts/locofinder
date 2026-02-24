from locust import HttpUser, task, between
import random

class LocofinderBenchmarkUser(HttpUser):
    # Wait between 1 and 3 seconds between requests per user
    wait_time = between(1.0, 3.0)
    
    # State options to randomize queries and observe cache warm/cold
    STATES = ["CA", "TX", "NY", "IN", "FL", "OH", None]

    @task(3) # 3x more likely to run than the others
    def get_locations_search(self):
        """Simulate browsing paginated search results"""
        state = random.choice(self.STATES)
        limit = random.choice([10, 20, 50])
        offset = random.choice([0, limit, limit*2])
        
        params = {"limit": limit, "offset": offset}
        if state:
            params["state"] = state
            
        self.client.get(
            "/locations/search", 
            params=params,
            headers={"X-Bypass-Cache": "true"},
            name="/locations/search (Cache Miss)" # Group by name in report
        )

    @task(1)
    def post_recommend(self):
        """Simulate a weighted recommendation (heavier sorting op)"""
        state = random.choice(self.STATES)
        
        payload = {
            "weights": {
                "median_income": random.uniform(0, 1),
                "home_price": random.uniform(0, 1),
                "crime_index": random.uniform(0.5, 1) # people usually care about crime
            },
            "limit": 20
        }
        
        if state:
            payload["filters"] = {"state": state}
            
        self.client.post(
            "/recommend",
            json=payload,
            headers={"X-Bypass-Cache": "true"},
            name="/recommend (Cache Miss)" 
        )
