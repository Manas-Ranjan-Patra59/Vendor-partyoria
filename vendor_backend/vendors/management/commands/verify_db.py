from django.core.management.base import BaseCommand
from django.db import connection


class Command(BaseCommand):
    help = 'Verify database connection and existing tables'

    def handle(self, *args, **options):
        try:
            with connection.cursor() as cursor:
                # Check if we can connect to the database
                cursor.execute("SELECT version();")
                version = cursor.fetchone()
                self.stdout.write(
                    self.style.SUCCESS(f'✅ Connected to PostgreSQL: {version[0]}')
                )
                
                # Check existing vendor tables
                vendor_tables = [
                    'user_details',
                    'profile_details', 
                    'verification_details',
                    'vendor_services',
                    'booking_details',
                    'vendors_calendarevent',
                    'vendors_vendorchat'
                ]
                
                for table in vendor_tables:
                    cursor.execute(f"SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '{table}');")
                    exists = cursor.fetchone()[0]
                    if exists:
                        cursor.execute(f"SELECT COUNT(*) FROM {table};")
                        count = cursor.fetchone()[0]
                        self.stdout.write(
                            self.style.SUCCESS(f'✅ Table {table} exists with {count} records')
                        )
                    else:
                        self.stdout.write(
                            self.style.WARNING(f'⚠️  Table {table} does not exist')
                        )
                        
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Database connection failed: {str(e)}')
            )