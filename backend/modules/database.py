import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DATABASE_NAME = "intelliscan"

client = None
db = None

def get_database():
    global client, db
    if client is None:
        client = AsyncIOMotorClient(MONGO_URI)
        db = client[DATABASE_NAME]
    return db

async def close_database_connection():
    global client
    if client:
        client.close()
        client = None

async def save_task(userId: str, taskType: str, inputData: str, outputData: str):
    db = get_database()
    task = {
        "userId": userId,
        "taskType": taskType,
        "input": inputData,
        "output": outputData,
        "timestamp": datetime.utcnow()
    }
    await db.tasks.insert_one(task)
