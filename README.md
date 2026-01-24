# Journaling App

A simple journaling application with separate backend and frontend services.

## Structure

- `backend/`: Django REST API backend
- `frontend/`: Static HTML/JS frontend

## Deployment

### Backend
1. Go to Render dashboard
2. Create new Web Service
3. Connect to `backend/` folder in your repo
4. Use `render.yaml` for configuration
5. Deploy

### Frontend
1. Create new Static Site on Render
2. Connect to `frontend/` folder
3. Use `render.yaml` for configuration
4. Update `API_BASE` in HTML files with backend URL
5. Deploy

## API Documentation

See `backend/README.md` for API details.
