from pymongo import MongoClient
import os
from .config import Config

class DBWrapper:
    def __init__(self, database):
        self.db = database
        self.name = database.name
        
    def __getattr__(self, name):
        return getattr(self.db, name)

db = None

def init_db(app):
    global db
    mongo_uri = app.config["MONGO_URI"]
    client = MongoClient(mongo_uri)
    db = DBWrapper(client.get_database())
    print(f"Connected to MongoDB database: {db.name}")
