from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME", "smart_learning_platform")

client = MongoClient(MONGODB_URI)
db = client[DATABASE_NAME]

email = "blueneck46@gmail.com"
user = db.users.find_one({"email": email})

if user:
    print(f"User found: {user.get('username')} ({user.get('email')})")
    print(f"Auth provider: {user.get('auth_provider', 'local')}")
else:
    print(f"User NOT found: {email}")

client.close()
