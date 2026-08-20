import json
import httpx

from app.core.redis_client import redis_client

async def geocode_location(location: str):
    if not location:
        return None
    
    cache_key = f"geo:{location.lower()}"
    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached)
    
    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.get(
            "https://nominatim.openstreetmap.org/search",
            params={
                "q": location,
                "format": "json",
                "limit": 1
            },
            headers={
                "User-Agent": "SmartPublicSentimentDashboard"
            }
        )
        
        if response.status_code != 200:
            return None
        
        data = response.json()
        if not data:
            return None
        
        result = {
            "latitude": float(data[0]["lat"]),
            "longitude": float(data[0]["lon"]),
        }
        
        redis_client.setex(
            cache_key,
            86400,
            json.dumps(result)
        )
        
        return result
    