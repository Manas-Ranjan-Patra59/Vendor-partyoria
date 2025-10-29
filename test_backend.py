import requests
import json

# Test if backend is running
try:
    response = requests.get('http://localhost:8000/api/vendor/auth/profile/')
    print(f"Backend status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Backend connection error: {e}")

# Test registration endpoint
test_data = {
    "email": "test@example.com",
    "full_name": "Test User",
    "mobile": "1234567890",
    "business": "Photography",
    "experience_level": "Beginner",
    "location": "Mumbai, Maharashtra - 400001",
    "city": "Mumbai",
    "state": "Maharashtra", 
    "pincode": "400001",
    "services": "photos,video-camera",
    "password": "testpass123"
}

try:
    response = requests.post(
        'http://localhost:8000/api/vendor/auth/register/',
        headers={'Content-Type': 'application/json'},
        data=json.dumps(test_data)
    )
    print(f"Registration status: {response.status_code}")
    print(f"Registration response: {response.text}")
except Exception as e:
    print(f"Registration error: {e}")