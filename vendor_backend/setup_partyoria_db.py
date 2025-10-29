#!/usr/bin/env python
"""
Setup script for connecting Django to existing partyoria_db database
"""
import os
import sys
import django
from django.core.management import execute_from_command_line

if __name__ == '__main__':
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'vendor_hub.settings')
    django.setup()
    
    print("🚀 Setting up Django with existing partyoria_db database...")
    
    try:
        # Run migrations to sync Django with existing database
        print("\n📋 Running migrations...")
        execute_from_command_line(['manage.py', 'migrate', '--fake-initial'])
        
        # Verify database connection and tables
        print("\n🔍 Verifying database setup...")
        execute_from_command_line(['manage.py', 'verify_db'])
        
        print("\n✅ Setup completed successfully!")
        print("🎉 Your Django application is now connected to partyoria_db")
        print("\n📝 Next steps:")
        print("   1. Run: python manage.py runserver")
        print("   2. Test the API endpoints")
        print("   3. Verify frontend connectivity")
        
    except Exception as e:
        print(f"\n❌ Setup failed: {str(e)}")
        sys.exit(1)