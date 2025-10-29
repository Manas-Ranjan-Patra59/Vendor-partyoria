# Vendor Hub Backend API

Django REST API backend for the Vendor Hub event management dashboard.

## Project Structure

```
vendor_backend/
├── manage.py
├── requirements.txt
├── .env.example
├── .gitignore
├── README.md
├── static/                 # Static files
├── media/                  # Media uploads
│   ├── profiles/          # Profile images
│   └── documents/         # Verification documents
├── templates/             # Django templates
├── logs/                  # Application logs
├── vendor_hub/            # Main project
│   ├── __init__.py
│   ├── settings/          # Settings package
│   │   ├── __init__.py
│   │   ├── base.py        # Base settings
│   │   ├── local.py       # Development settings
│   │   └── production.py  # Production settings
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
└── vendors/               # Vendors app
    ├── __init__.py
    ├── models.py
    ├── admin.py
    ├── apps.py
    ├── routing.py
    ├── consumers.py
    ├── migrations/
    ├── api/               # API package
    │   ├── __init__.py
    │   ├── serializers.py
    │   ├── views.py
    │   └── urls.py
    ├── utils/             # Utility functions
    │   ├── __init__.py
    │   └── helpers.py
    └── tests/             # Test package
        ├── __init__.py
        ├── test_models.py
        └── test_views.py
```

## Setup Instructions

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Database Setup
```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE vendor_hub;
```

### 3. Environment Configuration
```bash
cp .env.example .env
# Edit .env with your database credentials
```

### 4. Django Setup
```bash
# Update settings to use custom user model
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

### 5. Run Server
```bash
python manage.py runserver
```

## API Endpoints

### Authentication
- `POST /api/vendor/auth/register/` - Vendor registration
- `POST /api/vendor/auth/login/` - Login
- `POST /api/vendor/auth/logout/` - Logout
- `GET/PUT /api/vendor/auth/profile/` - Profile management

### Dashboard
- `GET /api/vendor/dashboard/stats/` - Dashboard analytics

### Bookings
- `GET /api/vendor/bookings/` - List vendor bookings
- `PUT /api/vendor/bookings/{id}/status/` - Update booking status

### Chat
- `GET /api/vendor/chat/vendors/` - List vendors for chat
- `GET/POST /api/vendor/chat/messages/{vendor_id}/` - Chat messages
- `PUT /api/vendor/chat/messages/{vendor_id}/read/` - Mark as read

### Verification
- `GET/POST /api/vendor/verification/` - Document verification

### Calendar
- `GET/POST /api/vendor/calendar/events/` - Calendar events
- `GET/PUT/DELETE /api/vendor/calendar/events/{id}/` - Event details

## WebSocket
- `ws://localhost:8000/ws/chat/{vendor_id}/` - Real-time chat

## Features
- JWT Authentication
- Profession-based booking filtering
- Real-time vendor chat
- Document verification system
- Calendar management
- Dashboard analytics
- MySQL database with proper relationships