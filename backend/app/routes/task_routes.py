from flask import Blueprint, request, jsonify
from app.db import db
from app.utils.auth import token_required, admin_required
from bson import ObjectId
from datetime import datetime

bp = Blueprint('tasks', __name__)

@bp.route('/', methods=['POST'])
@token_required
@admin_required
def create_task(current_user):
    data = request.json
    title = data.get('title')
    description = data.get('description')
    assigned_to = data.get('assigned_to') # User ID
    
    if not title or not description or not assigned_to:
        return jsonify({'message': 'Missing fields'}), 400
        
    task = {
        'title': title,
        'description': description,
        'assigned_to': ObjectId(assigned_to),
        'created_by': ObjectId(current_user['id']),
        'status': 'Pending',
        'feedback': '',
        'created_at': datetime.utcnow()
    }
    
    result = db.tasks.insert_one(task)
    return jsonify({'message': 'Task created successfully', 'task_id': str(result.inserted_id)}), 201

@bp.route('/', methods=['GET'])
@token_required
def get_tasks(current_user):
    if current_user['role'] == 'Admin':
        # Admins see all tasks they created or all tasks in general
        tasks = list(db.tasks.find())
    else:
        # Users see only tasks assigned to them
        tasks = list(db.tasks.find({'assigned_to': ObjectId(current_user['id'])}))
        
    # Format ObjectIds to strings
    for task in tasks:
        task['_id'] = str(task['_id'])
        task['assigned_to'] = str(task['assigned_to'])
        task['created_by'] = str(task['created_by'])
        
    return jsonify(tasks), 200

@bp.route('/<task_id>/status', methods=['PUT'])
@token_required
def update_task_status(current_user, task_id):
    data = request.json
    new_status = data.get('status')
    
    if new_status not in ['Pending', 'In Progress', 'Completed']:
        return jsonify({'message': 'Invalid status'}), 400
        
    task = db.tasks.find_one({'_id': ObjectId(task_id)})
    if not task:
        return jsonify({'message': 'Task not found'}), 404
        
    # Only assigned user or admin can update
    if current_user['role'] != 'Admin' and str(task['assigned_to']) != current_user['id']:
        return jsonify({'message': 'Unauthorized to update this task'}), 403
        
    db.tasks.update_one({'_id': ObjectId(task_id)}, {'$set': {'status': new_status}})
    return jsonify({'message': 'Task status updated'}), 200

@bp.route('/<task_id>/feedback', methods=['PUT'])
@token_required
@admin_required
def add_feedback(current_user, task_id):
    data = request.json
    feedback = data.get('feedback')
    
    if not feedback:
        return jsonify({'message': 'Feedback is required'}), 400
        
    result = db.tasks.update_one({'_id': ObjectId(task_id)}, {'$set': {'feedback': feedback}})
    
    if result.matched_count == 0:
        return jsonify({'message': 'Task not found'}), 404
        
    return jsonify({'message': 'Feedback added successfully'}), 200
