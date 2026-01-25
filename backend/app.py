from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import os

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

# In-memory storage
users = {}  # { "username": { "password": hashed, "email": "", "is_admin": False, "created_at": "" } }
journal_data = {}  # { "username": { "YYYY-MM-DD": { "entries": [...], "summary": "", "insights": "" } } }
sessions = {}  # { "token": "username" }

import secrets

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'message': 'Journal backend is running'}), 200

# Register a new account
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()
    email = data.get('email', '').strip()
    
    if not username or not password:
        return jsonify({'success': False, 'error': 'Username and password required'}), 400
    
    if username in users:
        return jsonify({'success': False, 'error': 'Username already exists'}), 400
    
    users[username] = {
        'password': generate_password_hash(password),
        'email': email,
        'is_admin': False,
        'created_at': datetime.now().isoformat()
    }
    
    journal_data[username] = {}
    
    return jsonify({
        'success': True,
        'message': 'Account created successfully'
    }), 201

# Login
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()
    
    if not username or not password:
        return jsonify({'success': False, 'error': 'Username and password required'}), 400
    
    if username not in users:
        return jsonify({'success': False, 'error': 'Invalid credentials'}), 401
    
    user = users[username]
    if not check_password_hash(user['password'], password):
        return jsonify({'success': False, 'error': 'Invalid credentials'}), 401
    
    # Generate session token
    token = secrets.token_hex(32)
    sessions[token] = username
    
    return jsonify({
        'success': True,
        'token': token,
        'username': username,
        'is_admin': user['is_admin']
    }), 200

# Logout
@app.route('/api/auth/logout', methods=['POST'])
def logout():
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    if token in sessions:
        del sessions[token]
    return jsonify({'success': True}), 200

# Get current user from token
def get_current_user():
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    return sessions.get(token)

# Get entries for a specific date
@app.route('/api/entries/<date>', methods=['GET'])
def get_entries(date):
    username = get_current_user()
    if not username:
        return jsonify({'success': False, 'error': 'Unauthorized'}), 401
    
    if username not in journal_data or date not in journal_data[username]:
        return jsonify({'entries': [], 'summary': '', 'insights': ''}), 200
    
    return jsonify(journal_data[username][date]), 200

# Save/add a new entry for a date
@app.route('/api/entries/<date>', methods=['POST'])
def add_entry(date):
    username = get_current_user()
    if not username:
        return jsonify({'success': False, 'error': 'Unauthorized'}), 401
    
    data = request.get_json()
    reflection = data.get('reflection', '').strip()
    
    if not reflection:
        return jsonify({'success': False, 'error': 'Reflection cannot be empty'}), 400
    
    if date not in journal_data[username]:
        journal_data[username][date] = {'entries': [], 'summary': '', 'insights': ''}
    
    journal_data[username][date]['entries'].append({
        'timestamp': datetime.now().isoformat(),
        'text': reflection
    })
    
    return jsonify({
        'success': True,
        'message': 'Entry saved',
        'entries': journal_data[username][date]['entries']
    }), 201

# Generate daily summary from reflections
@app.route('/api/summary/<date>', methods=['POST'])
def generate_summary(date):
    username = get_current_user()
    if not username:
        return jsonify({'success': False, 'error': 'Unauthorized'}), 401
    
    if date not in journal_data[username] or not journal_data[username][date]['entries']:
        return jsonify({'success': False, 'error': 'No entries for this date'}), 400
    
    entries = journal_data[username][date]['entries']
    all_text = ' '.join([e['text'] for e in entries])
    
    summary = f"Daily Summary for {date}:\n\n"
    summary += f"Total reflections: {len(entries)}\n\n"
    summary += f"Key thoughts:\n{all_text[:300]}...\n\n"
    summary += "Focus areas: Self-reflection, Daily growth, Personal insights"
    
    journal_data[username][date]['summary'] = summary
    
    return jsonify({
        'success': True,
        'summary': summary
    }), 200

# Generate insights from all entries
@app.route('/api/insights/<date>', methods=['POST'])
def generate_insights(date):
    username = get_current_user()
    if not username:
        return jsonify({'success': False, 'error': 'Unauthorized'}), 401
    
    if date not in journal_data[username] or not journal_data[username][date]['entries']:
        return jsonify({'success': False, 'error': 'No entries for this date'}), 400
    
    entries = journal_data[username][date]['entries']
    
    insights = f"Insights for {date}:\n\n"
    insights += f"📊 Entry count: {len(entries)} reflections\n"
    insights += f"📝 Total characters: {sum(len(e['text']) for e in entries)}\n"
    insights += f"💡 Key theme: Personal growth and self-awareness\n"
    insights += f"🎯 Recommended focus: Continue daily reflection practice\n"
    
    journal_data[username][date]['insights'] = insights
    
    return jsonify({
        'success': True,
        'insights': insights
    }), 200

# ============ ADMIN ENDPOINTS ============

# Get all users (admin only)
@app.route('/api/admin/users', methods=['GET'])
def get_all_users():
    username = get_current_user()
    if not username or not users.get(username, {}).get('is_admin', False):
        return jsonify({'success': False, 'error': 'Admin access required'}), 403
    
    user_list = []
    for user, data in users.items():
        user_list.append({
            'username': user,
            'email': data['email'],
            'is_admin': data['is_admin'],
            'created_at': data['created_at'],
            'entry_count': sum(len(entries.get('entries', [])) for entries in journal_data.get(user, {}).values())
        })
    
    return jsonify({'success': True, 'users': user_list}), 200

# Make user admin
@app.route('/api/admin/users/<target_username>/make-admin', methods=['POST'])
def make_admin(target_username):
    username = get_current_user()
    if not username or not users.get(username, {}).get('is_admin', False):
        return jsonify({'success': False, 'error': 'Admin access required'}), 403
    
    if target_username not in users:
        return jsonify({'success': False, 'error': 'User not found'}), 404
    
    users[target_username]['is_admin'] = True
    
    return jsonify({
        'success': True,
        'message': f'{target_username} is now an admin'
    }), 200

# Remove admin access
@app.route('/api/admin/users/<target_username>/remove-admin', methods=['POST'])
def remove_admin(target_username):
    username = get_current_user()
    if not username or not users.get(username, {}).get('is_admin', False):
        return jsonify({'success': False, 'error': 'Admin access required'}), 403
    
    if target_username not in users:
        return jsonify({'success': False, 'error': 'User not found'}), 404
    
    if target_username == username:
        return jsonify({'success': False, 'error': 'Cannot remove your own admin status'}), 400
    
    users[target_username]['is_admin'] = False
    
    return jsonify({
        'success': True,
        'message': f'{target_username} admin status removed'
    }), 200

# Delete user (admin only)
@app.route('/api/admin/users/<target_username>', methods=['DELETE'])
def delete_user(target_username):
    username = get_current_user()
    if not username or not users.get(username, {}).get('is_admin', False):
        return jsonify({'success': False, 'error': 'Admin access required'}), 403
    
    if target_username == username:
        return jsonify({'success': False, 'error': 'Cannot delete your own account'}), 400
    
    if target_username not in users:
        return jsonify({'success': False, 'error': 'User not found'}), 404
    
    del users[target_username]
    if target_username in journal_data:
        del journal_data[target_username]
    
    return jsonify({
        'success': True,
        'message': f'User {target_username} deleted'
    }), 200

# Get system stats (admin only)
@app.route('/api/admin/stats', methods=['GET'])
def get_stats():
    username = get_current_user()
    if not username or not users.get(username, {}).get('is_admin', False):
        return jsonify({'success': False, 'error': 'Admin access required'}), 403
    
    total_entries = sum(
        len(entries.get('entries', []))
        for user_data in journal_data.values()
        for entries in user_data.values()
    )
    
    return jsonify({
        'success': True,
        'stats': {
            'total_users': len(users),
            'total_entries': total_entries,
            'total_admins': sum(1 for u in users.values() if u.get('is_admin', False))
        }
    }), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

