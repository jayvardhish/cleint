import certifi
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI") or os.getenv("MONGO_URI")

if not MONGODB_URI:
    print("Warning: MONGODB_URI not found. Trying local default.")
    MONGODB_URI = "mongodb://localhost:27017"

DATABASE_NAME = os.getenv("DATABASE_NAME", "smart_learning_platform")

import sys

# Add TLS CA file explicitly for compatibility with Atlas across all OS
try:
    client = AsyncIOMotorClient(MONGODB_URI, tlsCAFile=certifi.where())
    db = client[DATABASE_NAME]
    display_uri = MONGODB_URI.split('@')[-1] if '@' in MONGODB_URI else 'localhost'
    print(f"Connected to MongoDB at {display_uri}")
except Exception as e:
    print(f"Database Connection Error: {e}")
    client = None
    db = None

async def get_database():
    return db

async def close_db():
    if client:
        client.close()
