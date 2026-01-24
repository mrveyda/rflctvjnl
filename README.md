# Journaling App Backend

This is the Django REST API backend for the Journaling App.

## Setup

1. Install dependencies: `pip install -r requirements.txt`
2. Run migrations: `python manage.py migrate`
3. Create superuser: `python manage.py createsuperuser`
4. Run server: `python manage.py runserver`

## API Endpoints

### Authentication

- **POST /api/register/**: Register a new user
  - Body: `{"username": "string", "email": "string", "password1": "string", "password2": "string"}`
  - Response: `{"message": "User registered successfully"}` or errors

- **POST /api/login/**: Login user
  - Body: `{"username": "string", "password": "string"}`
  - Response: `{"message": "Logged in successfully"}` or `{"error": "Invalid credentials"}`

### Admin

- Access Django admin at `/admin/` (requires superuser login)

## Deployment

Hosted on Render with PostgreSQL database.

## Frontend

The frontend templates are stored in the `frontend/` folder for future use as a separate service.
