from flask import Blueprint, request, jsonify
from app.db import db
from app.utils.auth import hash_password, check_password, generate_token
import uuid

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

@bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.json
    email = data.get('email')
    
    if not email:
        return jsonify({'message': 'Email is required'}), 400
        
    user = db.db.users.find_one({'email': email})
    if not user:
        # Return success anyway to prevent email enumeration
        return jsonify({'message': 'If this email is registered, a reset token has been generated.'}), 200
        
    reset_token = str(uuid.uuid4())
    db.db.users.update_one({'_id': user['_id']}, {'$set': {'reset_token': reset_token}})
    
    # Mocking email sending for development
    print(f"\n--- MOCK EMAIL ---")
    print(f"To: {email}")
    print(f"Subject: Password Reset Request")
    print(f"Body: Use this token to reset your password: {reset_token}")
    print(f"------------------\n")
    
    # In a real app we wouldn't return the token in the response, but doing so for easier testing
    return jsonify({'message': 'If this email is registered, a reset token has been generated.', 'dev_token': reset_token}), 200

@bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.json
    token = data.get('token')
    new_password = data.get('new_password')
    
    if not token or not new_password:
        return jsonify({'message': 'Token and new password are required'}), 400
        
    user = db.db.users.find_one({'reset_token': token})
    if not user:
        return jsonify({'message': 'Invalid or expired token'}), 400
        
    hashed_password = hash_password(new_password)
    
    db.db.users.update_one(
        {'_id': user['_id']}, 
        {
            '$set': {'password': hashed_password.decode('utf-8')},
            '$unset': {'reset_token': ''}
        }
    )
    
    return jsonify({'message': 'Password has been reset successfully'}), 200
