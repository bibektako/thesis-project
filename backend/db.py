from motor.motor_asyncio import AsyncIOMotorClient
from config import MONGODB_URL, DATABASE_NAME

client = None
database = None

async def connect_db():
    global client, database
    client = AsyncIOMotorClient(MONGODB_URL)
    database = client[DATABASE_NAME]
    return database

async def close_db():
    global client
    if client:
        client.close()

def get_database():
    return database





