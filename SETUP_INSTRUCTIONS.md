# Vendor Hub - Full Stack Setup Instructions

## Backend Setup (Django)

### Prerequisites
- Python 3.8+
- pip
- Virtual environment (recommended)

### Setup Steps

1. **Navigate to backend directory:**
   ```bash
   cd "vendor_backend"
   ```

2. **Create and activate virtual environment:**
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the setup script:**
   ```bash
   python run_backend.py
   ```

   This will:
   - Run database migrations
   - Create a superuser (admin@admin.com / admin123)
   - Start the development server on http://localhost:8000

### Manual Setup (Alternative)

If the script doesn't work, run these commands manually:

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 0.0.0.0:8000
```

## Frontend Setup (React + Vite)

### Prerequisites
- Node.js 16+
- npm or yarn

### Setup Steps

1. **Navigate to frontend directory:**
   ```bash
   cd "Vender-Dashboard"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

   The frontend will be available at http://localhost:5173

## API Endpoints

### Authentication
- `POST /api/vendor/auth/register/` - Register new vendor
- `POST /api/vendor/auth/login/` - Login vendor
- `POST /api/vendor/auth/logout/` - Logout vendor
- `GET /api/vendor/auth/profile/` - Get vendor profile

### Dashboard
- `GET /api/vendor/dashboard/stats/` - Get dashboard statistics

### Bookings
- `GET /api/vendor/bookings/` - Get vendor bookings
- `PATCH /api/vendor/bookings/{id}/status/` - Update booking status

### Verification
- `POST /api/vendor/verification/` - Submit verification documents
- `GET /api/vendor/verification/` - Get verification status

### Calendar
- `GET /api/vendor/calendar/events/` - Get calendar events
- `POST /api/vendor/calendar/events/` - Create calendar event

## Features Connected

✅ **Authentication System**
- User registration with onboarding flow
- Login/logout functionality
- JWT token management

✅ **Dashboard**
- Real-time statistics from backend
- Dynamic data display

✅ **Bookings Management**
- Fetch bookings from API
- Update booking status
- Verification-based access control

✅ **Verification System**
- Document upload to backend
- Status tracking
- Auto-approval for demo

✅ **Profile Management**
- Update vendor profile
- Sync with backend data

## Demo Credentials

**Admin Panel:**
- URL: http://localhost:8000/admin/
- Email: admin@admin.com
- Password: admin123

**Vendor Login:**
- Register through onboarding flow
- Default password: defaultPassword123

## Development Notes

1. **CORS is configured** to allow frontend (localhost:5173) to communicate with backend (localhost:8000)

2. **File uploads** are handled for verification documents

3. **Real-time data** is fetched from the backend API

4. **Error handling** is implemented with toast notifications

5. **Authentication state** is managed across the application

## Troubleshooting

### Backend Issues
- Ensure Python virtual environment is activated
- Check if all dependencies are installed
- Verify database migrations are applied

### Frontend Issues
- Clear browser cache and localStorage
- Restart the development server
- Check console for API connection errors

### CORS Issues
- Ensure backend is running on port 8000
- Check CORS settings in Django settings
- Verify frontend is running on port 5173

## Next Steps

1. **Production Deployment:**
   - Configure production database (PostgreSQL)
   - Set up proper environment variables
   - Configure static file serving
   - Set up proper CORS for production domains

2. **Additional Features:**
   - Real-time chat with WebSockets
   - Email notifications
   - Payment integration
   - Advanced analytics

3. **Security Enhancements:**
   - Implement proper password validation
   - Add rate limiting
   - Set up proper file upload validation
   - Implement proper JWT refresh token handling