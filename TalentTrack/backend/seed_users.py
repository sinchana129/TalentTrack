import bcrypt
from pymongo import MongoClient

# Database connection matching the .env file
client = MongoClient('mongodb://localhost:27017')
db = client['talenttrack']

print("Connecting to local MongoDB (talenttrack)...")

# Hashing function matching app/utils/auth.py
def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

# Admin user data
admin_user = {
    'name': 'Admin User',
    'email': 'admin@talenttrack.com',
    'password': hash_password('admin123'),
    'role': 'Admin'
}

# Standard user data
standard_user = {
    'name': 'Standard User',
    'email': 'user@talenttrack.com',
    'password': hash_password('user123'),
    'role': 'User'
}

# Clear any previous versions of these users
db.users.delete_many({'email': {'$in': ['admin@talenttrack.com', 'user@talenttrack.com']}})

# Insert users
db.users.insert_many([admin_user, standard_user])

print("\nSuccess! I have created two accounts for you to test with:")
print("---------------------------------------------------------")
print("ADMIN LOGIN:")
print("Email: admin@talenttrack.com")
print("Password: admin123")
print("\nUSER LOGIN:")
print("Email: user@talenttrack.com")
print("Password: user123")
print("---------------------------------------------------------")
