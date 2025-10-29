# Migration to sync with existing partyoria_db structure

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('vendors', '0001_initial'),
    ]

    operations = [
        # No-op migration since database already has correct structure
        migrations.RunSQL(
            "SELECT 1;",  # Simple no-op SQL
            reverse_sql="SELECT 1;"
        ),
    ]