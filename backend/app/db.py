from pymongo import MongoClient
import os
from .config import Config

db = None

def init_db(app):
    global db
    mongo_uri = app.config["MONGO_URI"]
    client = MongoClient(mongo_uri)
    db = client.get_database()
    print(f"Connected to MongoDB database: {db.name}")
