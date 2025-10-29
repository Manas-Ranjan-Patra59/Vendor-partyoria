from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from ..models import Booking

User = get_user_model()

class VendorAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.vendor_data = {
            'email': 'test@example.com',
            'full_name': 'Test Vendor',
            'mobile': '1234567890',
            'business': 'Photography',
            'experience_level': 'Intermediate',
            'location': 'Test City',
            'password': 'testpass123'
        }
    
    def test_vendor_registration(self):
        url = reverse('vendor-register')
        response = self.client.post(url, self.vendor_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertIn('vendor', response.data)
    
    def test_vendor_login(self):
        # Create vendor first
        vendor = User.objects.create_user(
            username=self.vendor_data['email'],
            email=self.vendor_data['email'],
            password=self.vendor_data['password'],
            **{k: v for k, v in self.vendor_data.items() if k not in ['email', 'password']}
        )
        
        login_data = {
            'email': self.vendor_data['email'],
            'password': self.vendor_data['password']
        }
        
        url = reverse('vendor-login')
        response = self.client.post(url, login_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
    
    def test_dashboard_stats_authenticated(self):
        # Create and authenticate vendor
        vendor = User.objects.create_user(
            username=self.vendor_data['email'],
            email=self.vendor_data['email'],
            password=self.vendor_data['password'],
            **{k: v for k, v in self.vendor_data.items() if k not in ['email', 'password']}
        )
        
        self.client.force_authenticate(user=vendor)
        
        url = reverse('dashboard-stats')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_bookings', response.data)
        self.assertIn('total_revenue', response.data)
    
    def test_dashboard_stats_unauthenticated(self):
        url = reverse('dashboard-stats')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)