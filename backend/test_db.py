import os
import asyncio
from dotenv import load_dotenv
import certifi
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()
MONGODB_URI = os.getenv("MONGODB_URI")
print(f"URI: {MONGODB_URI}")

async def test_conn():
    try:
        client = AsyncIOMotorClient(MONGODB_URI, tlsCAFile=certifi.where())
        info = await client.server_info()
        print("Success:", info.get("version"))
    except Exception as e:
        print("Error:", e)

asyncio.run(test_conn())
