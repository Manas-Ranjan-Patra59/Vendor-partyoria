# Migration to sync Django models with existing partyoria_db tables

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('vendors', '0002_sync_with_existing_db'),
    ]

    operations = [
        # No-op migration since tables already exist in partyoria_db
        # This migration just marks the models as migrated
        migrations.RunSQL(
            "SELECT 1;",  # Simple no-op SQL
            reverse_sql="SELECT 1;"
        ),
    ]