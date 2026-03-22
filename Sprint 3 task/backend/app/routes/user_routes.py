from flask import Blueprint, jsonify
from app.db import db
from app.utils.auth import token_required, admin_required

bp = Blueprint('users', __name__)

@bp.route('/', methods=['GET'])
@token_required
@admin_required
def get_users(current_user):
    # Admins need a list of users to assign tasks to
    # Return all users with role 'User'
    users = list(db.db.users.find({'role': 'User'}, {'password': 0}))
    
    for user in users:
        user['_id'] = str(user['_id'])
        
    return jsonify(users), 200
