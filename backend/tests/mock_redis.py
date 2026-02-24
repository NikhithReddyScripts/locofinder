import json
from typing import Optional

class MockRedis:
    def __init__(self):
        self._store = {}

    async def get(self, key: str) -> Optional[str]:
        return self._store.get(key)
        
    async def setex(self, key: str, time: int, value: str):
        self._store[key] = value

    async def ping(self):
        return True

class MockFailingRedis(MockRedis):
    async def get(self, key: str) -> Optional[str]:
        raise ConnectionError("Redis is down")
        
    async def setex(self, key: str, time: int, value: str):
        raise ConnectionError("Redis is down")
        
    async def ping(self):
        return False
