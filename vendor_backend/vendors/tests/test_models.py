from django.test import TestCase
from django.contrib.auth import get_user_model
from ..models import Vendor, Booking, VendorChat, Verification

User = get_user_model()

class VendorModelTest(TestCase):
    def setUp(self):
        self.vendor_data = {
            'username': 'test@example.com',
            'email': 'test@example.com',
            'full_name': 'Test Vendor',
            'mobile': '1234567890',
            'business': 'Photography',
            'experience_level': 'Intermediate',
            'location': 'Test City'
        }
    
    def test_vendor_creation(self):
        vendor = Vendor.objects.create_user(**self.vendor_data)
        self.assertEqual(vendor.email, 'test@example.com')
        self.assertEqual(vendor.business, 'Photography')
        self.assertFalse(vendor.is_verified)
        self.assertFalse(vendor.is_online)
    
    def test_vendor_str_representation(self):
        vendor = Vendor.objects.create_user(**self.vendor_data)
        expected_str = f"{vendor.full_name} - {vendor.business}"
        self.assertEqual(str(vendor), expected_str)

class BookingModelTest(TestCase):
    def setUp(self):
        self.vendor = Vendor.objects.create_user(
            username='vendor@example.com',
            email='vendor@example.com',
            full_name='Test Vendor',
            business='Photography'
        )
        
        self.booking_data = {
            'vendor': self.vendor,
            'customer_name': 'John Doe',
            'service_type': 'Wedding Photography',
            'event_date': '2024-12-25',
            'amount': 1500.00,
            'location': 'Test Venue'
        }
    
    def test_booking_creation(self):
        booking = Booking.objects.create(**self.booking_data)
        self.assertEqual(booking.status, 'pending')
        self.assertEqual(booking.vendor, self.vendor)
        self.assertEqual(str(booking), 'John Doe - Wedding Photography')
    
    def test_booking_status_choices(self):
        booking = Booking.objects.create(**self.booking_data)
        valid_statuses = ['pending', 'in_progress', 'completed']
        
        for status in valid_statuses:
            booking.status = status
            booking.save()
            self.assertEqual(booking.status, status)