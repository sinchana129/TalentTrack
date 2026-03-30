import pymongo
import bcrypt

try:
    client = pymongo.MongoClient('mongodb://localhost:27017')
    db = client['talenttrack']
    
    hashed_pw = bcrypt.hashpw('password123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    result = db.users.update_one(
        {'email': 'sinchana.se22@bitsathy.ac.in'}, 
        {'$set': {'password': hashed_pw, 'role': 'Admin'}}
    )
    print(f"Success! Updated documents: {result.modified_count}")
except Exception as e:
    print(f"Error: {e}")
