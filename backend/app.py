from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

# In-memory storage for journal entries
# Structure: { "YYYY-MM-DD": { "entries": [...], "summary": "", "insights": "" } }
journal_data = {}

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'message': 'Journal backend is running'}), 200

# Get entries for a specific date
@app.route('/api/entries/<date>', methods=['GET'])
def get_entries(date):
    if date not in journal_data:
        return jsonify({'entries': [], 'summary': '', 'insights': ''}), 200
    
    return jsonify(journal_data[date]), 200

# Save/add a new entry for a date
@app.route('/api/entries/<date>', methods=['POST'])
def add_entry(date):
    data = request.get_json()
    reflection = data.get('reflection', '').strip()
    
    if not reflection:
        return jsonify({'success': False, 'error': 'Reflection cannot be empty'}), 400
    
    if date not in journal_data:
        journal_data[date] = {'entries': [], 'summary': '', 'insights': ''}
    
    journal_data[date]['entries'].append({
        'timestamp': datetime.now().isoformat(),
        'text': reflection
    })
    
    return jsonify({
        'success': True,
        'message': 'Entry saved',
        'entries': journal_data[date]['entries']
    }), 201

# Generate daily summary from reflections
@app.route('/api/summary/<date>', methods=['POST'])
def generate_summary(date):
    if date not in journal_data or not journal_data[date]['entries']:
        return jsonify({'success': False, 'error': 'No entries for this date'}), 400
    
    entries = journal_data[date]['entries']
    all_text = ' '.join([e['text'] for e in entries])
    
    # Simple summary generation (can be replaced with AI)
    summary = f"Daily Summary for {date}:\n\n"
    summary += f"Total reflections: {len(entries)}\n\n"
    summary += f"Key thoughts:\n{all_text[:300]}...\n\n"
    summary += "Focus areas: Self-reflection, Daily growth, Personal insights"
    
    journal_data[date]['summary'] = summary
    
    return jsonify({
        'success': True,
        'summary': summary
    }), 200

# Generate insights from all entries
@app.route('/api/insights/<date>', methods=['POST'])
def generate_insights(date):
    if date not in journal_data or not journal_data[date]['entries']:
        return jsonify({'success': False, 'error': 'No entries for this date'}), 400
    
    entries = journal_data[date]['entries']
    
    # Simple insights generation (can be replaced with AI)
    insights = f"Insights for {date}:\n\n"
    insights += f"📊 Entry count: {len(entries)} reflections\n"
    insights += f"📝 Total characters: {sum(len(e['text']) for e in entries)}\n"
    insights += f"💡 Key theme: Personal growth and self-awareness\n"
    insights += f"🎯 Recommended focus: Continue daily reflection practice\n"
    
    journal_data[date]['insights'] = insights
    
    return jsonify({
        'success': True,
        'insights': insights
    }), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
