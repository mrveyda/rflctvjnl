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

- **POST /api/token/**: Obtain JWT token (login)
  - Body: `{"username": "string", "password": "string"}`
  - Response: `{"access": "token", "refresh": "token"}`

- **POST /api/token/refresh/**: Refresh JWT token
  - Body: `{"refresh": "refresh_token"}`
  - Response: `{"access": "new_token"}`

### Admin

- Access Django admin at `/admin/` (requires superuser login)

## Deployment

Hosted on Render with PostgreSQL database.

## Frontend

The frontend is a separate static site that calls these API endpoints.