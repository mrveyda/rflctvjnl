# Reflective Journal

A sleek online journal application for daily reflections with AI-powered summaries and insights.

## Features

- **Daily Entries**: Write and save multiple reflections for each day
- **Date Navigation**: View entries from any date
- **Daily Summaries**: Generate summaries from your daily reflections
- **Insights**: Extract key themes and insights from your entries
- **Elegant UI**: Modern dark theme with Tailwind CSS

## Stack

- **Backend**: Flask (Python)
- **Frontend**: HTML, Tailwind CSS, Vanilla JavaScript
- **API**: REST with CORS support

## Setup

### Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

Backend runs on `http://localhost:5000`

### Frontend

```bash
cd frontend
# Option 1: Open index.html directly in a browser
# Option 2: Use a simple HTTP server
python -m http.server 8000
```

Frontend runs on `http://localhost:8000`

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/entries/<date>` - Get all entries for a date (YYYY-MM-DD)
- `POST /api/entries/<date>` - Save a new entry for a date
- `POST /api/summary/<date>` - Generate daily summary
- `POST /api/insights/<date>` - Generate daily insights
