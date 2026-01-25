from flask import Flask, jsonify, request
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'message': 'Backend is running'}), 200

# Example API endpoint
@app.route('/api/echo', methods=['POST'])
def echo():
    data = request.get_json()
    message = data.get('message', '')
    return jsonify({
        'success': True,
        'message': f'Echo: {message}'
    }), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
