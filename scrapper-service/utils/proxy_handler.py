import os
from dotenv import load_dotenv

load_dotenv()

ENABLE_PROXY = os.getenv("ENABLE_PROXY", "false").lower() == "true"

PROXIES = [
    # Example:
    # "http://username:password@proxy-ip:port"
]

def get_proxy():

    if not ENABLE_PROXY:
        return None

    if not PROXIES:
        return None

    return {
        "server": PROXIES[0]
    }