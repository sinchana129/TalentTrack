from flask import Blueprint, request, jsonify
from app.db import db
from app.utils.auth import hash_password, check_password, generate_token

bp = Blueprint('auth', __name__)

@bp.route('/register', methods=['POST'])
def register():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'User') # Role can be Admin or User
    
    if not name or not email or not password:
        return jsonify({'message': 'Missing fields'}), 400
        
    if db.db.users.find_one({'email': email}):
        return jsonify({'message': 'Email already exists'}), 400
        
    hashed_password = hash_password(password)
    
    new_user = {
        'name': name,
        'email': email,
        'password': hashed_password.decode('utf-8'),
        'role': role
    }
    
    result = db.db.users.insert_one(new_user)
    
    return jsonify({'message': 'User registered successfully', 'user_id': str(result.inserted_id)}), 201

@bp.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'message': 'Missing credentials'}), 400
        
    user = db.db.users.find_one({'email': email})
    
    if not user or not check_password(password, user['password']):
        return jsonify({'message': 'Invalid credentials'}), 401
        
    token = generate_token(user['_id'], user['role'])
    
    return jsonify({
        'token': token,
        'user': {
            'id': str(user['_id']),
            'name': user['name'],
            'email': user['email'],
            'role': user['role']
        }
    }), 200
