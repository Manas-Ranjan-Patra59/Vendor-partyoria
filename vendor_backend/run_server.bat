@echo off
echo Starting Django server...
python manage.py runserver 8000 --settings=vendor_hub.settings.base
pause