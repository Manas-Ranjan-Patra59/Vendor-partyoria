from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator
from django.utils.html import escape

class UserDetails(AbstractUser):
    PROFESSION_CHOICES = [
        ('Photography', 'Photography'),
        ('Catering', 'Catering'),
        ('DJ', 'DJ'),
        ('Decoration', 'Decoration'),
        ('Event Manager', 'Event Manager'),
        ('Transportation', 'Transportation'),
        ('Florist', 'Florist'),
        ('Baker', 'Baker'),
        ('Videography', 'Videography'),
        ('Makeup Artist', 'Makeup Artist'),
        ('Hair Stylist', 'Hair Stylist'),
        ('Fashion Designer', 'Fashion Designer'),
        ('Gift Services', 'Gift Services'),
        ('Entertainment', 'Entertainment'),
        ('Lighting', 'Lighting'),
    ]
    
    EXPERIENCE_CHOICES = [
        ('Beginner', 'Beginner'),
        ('Intermediate', 'Intermediate'),
        ('Expert', 'Expert'),
    ]
    
    full_name = models.CharField(max_length=255, validators=[RegexValidator(r'^[a-zA-Z\s]+$', 'Only letters and spaces allowed')])
    mobile = models.CharField(max_length=15, validators=[RegexValidator(r'^\d{10}$', 'Enter a valid 10-digit mobile number')])
    business = models.CharField(max_length=50, choices=PROFESSION_CHOICES)
    experience_level = models.CharField(max_length=20, choices=EXPERIENCE_CHOICES)
    is_online = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Remove inherited fields
    last_login = None
    is_staff = None
    is_superuser = None

    class Meta:
        db_table = 'user_details'

    def __str__(self):
        return f"{escape(self.full_name)} - {escape(self.business)}"

class ProfileDetails(models.Model):
    user = models.OneToOneField(UserDetails, on_delete=models.CASCADE, related_name='profile')
    location = models.CharField(max_length=255)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    pincode = models.CharField(max_length=10, blank=True)
    profile_image = models.ImageField(upload_to='profiles/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'profile_details'

    def __str__(self):
        return f"{self.user.full_name} Profile"

class VerificationDetails(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    user = models.OneToOneField(UserDetails, on_delete=models.CASCADE, related_name='verification')
    aadhaar_document = models.FileField(upload_to='documents/aadhaar/')
    pan_document = models.FileField(upload_to='documents/pan/')
    address = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    is_verified = models.BooleanField(default=False)
    submitted_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'verification_details'

    def __str__(self):
        return f"{self.user.full_name} - {self.status}"

class VendorService(models.Model):
    user = models.ForeignKey(UserDetails, on_delete=models.CASCADE, related_name='services')
    service_name = models.CharField(max_length=255)
    category = models.CharField(max_length=100)
    service_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    minimum_people = models.IntegerField(null=True, blank=True)
    maximum_people = models.IntegerField(null=True, blank=True)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='services/', null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'vendor_services'
        unique_together = ['user', 'service_name']

    def __str__(self):
        return f"{self.user.full_name} - {self.service_name}"

# Backward compatibility
ServicesDetails = VendorService

class BookingDetails(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    ]
    
    vendor = models.ForeignKey(UserDetails, on_delete=models.CASCADE, related_name='bookings')
    customer_name = models.CharField(max_length=255)
    service_type = models.CharField(max_length=255)
    event_date = models.DateField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    description = models.TextField(blank=True)
    location = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'booking_details'

    def __str__(self):
        return f"{self.customer_name} - {self.service_type}"

class VendorChat(models.Model):
    sender = models.ForeignKey(UserDetails, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(UserDetails, on_delete=models.CASCADE, related_name='received_messages')
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"{escape(self.sender.full_name)} to {escape(self.receiver.full_name)}"

class CalendarEvent(models.Model):
    vendor = models.ForeignKey(UserDetails, on_delete=models.CASCADE, related_name='calendar_events')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    event_date = models.DateTimeField()
    location = models.CharField(max_length=255, blank=True)
    booking = models.OneToOneField(BookingDetails, on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{escape(self.vendor.full_name)} - {escape(self.title)}"

# Backward compatibility aliases
Vendor = UserDetails
Booking = BookingDetails
Verification = VerificationDetails