import jwt
import bcrypt
from functools import wraps
from flask import request, jsonify, current_app
from bson import ObjectId

def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

def check_password(password, hashed):
    if isinstance(password, str):
        password = password.encode('utf-8')
    if isinstance(hashed, str):
        hashed = hashed.encode('utf-8')
    return bcrypt.checkpw(password, hashed)

def generate_token(user_id, role):
    payload = {
        'user_id': str(user_id),
        'role': role
    }
    return jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm='HS256')

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        try:
            if token.startswith('Bearer '):
                token = token.split(" ")[1]
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = {
                'id': data['user_id'],
                'role': data['role']
            }
        except:
            return jsonify({'message': 'Token is invalid'}), 401
            
        return f(current_user, *args, **kwargs)
    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(current_user, *args, **kwargs):
        if current_user.get('role') != 'Admin':
            return jsonify({'message': 'Admin rights required'}), 403
        return f(current_user, *args, **kwargs)
    return decorated
