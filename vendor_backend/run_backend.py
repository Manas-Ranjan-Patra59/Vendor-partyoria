#!/usr/bin/env python
import os
import sys
import subprocess

def run_migrations():
    """Run database migrations"""
    print("Running migrations...")
    subprocess.run([sys.executable, "manage.py", "makemigrations"], check=True)
    subprocess.run([sys.executable, "manage.py", "migrate"], check=True)
    print("Migrations completed!")

def create_superuser():
    """Create superuser if it doesn't exist"""
    try:
        subprocess.run([
            sys.executable, "manage.py", "shell", "-c",
            "from vendors.models import Vendor; "
            "Vendor.objects.filter(email='admin@admin.com').exists() or "
            "Vendor.objects.create_superuser('admin@admin.com', 'admin@admin.com', 'admin123', full_name='Admin User', mobile='1234567890', business='Photography', experience_level='Expert', location='Admin City')"
        ], check=True)
        print("Superuser created/verified!")
    except subprocess.CalledProcessError:
        print("Superuser already exists or creation failed")

def run_server():
    """Run the development server"""
    print("Starting Django development server...")
    subprocess.run([sys.executable, "manage.py", "runserver", "0.0.0.0:8000"])

if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    print("Setting up Vendor Hub Backend...")
    
    # Run migrations
    run_migrations()
    
    # Create superuser
    create_superuser()
    
    # Start server
    run_server()