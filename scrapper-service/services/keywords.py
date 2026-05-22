import os
from dotenv import load_dotenv

load_dotenv()

KEYWORDS = os.getenv("KEYWORDS", "").split(",")