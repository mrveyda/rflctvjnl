# Modern App

A sleek full-stack application with Flask backend and modern vanilla frontend.

## Stack

- **Backend**: Flask (Python)
- **Frontend**: HTML, Tailwind CSS, Vanilla JavaScript
- **Communication**: REST API with CORS support

## Setup

### Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

The backend runs on `http://localhost:5000`

### Frontend

```bash
cd frontend
# Open index.html in a browser or use a simple HTTP server:
python -m http.server 8000
```

The frontend runs on `http://localhost:8000`

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/echo` - Echo a message back
