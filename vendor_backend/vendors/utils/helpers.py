from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)

def send_verification_email(vendor, status):
    """Send verification status email to vendor"""
    subject_map = {
        'approved': 'Verification Approved - Vendor Hub',
        'rejected': 'Verification Rejected - Vendor Hub',
    }
    
    message_map = {
        'approved': f'Congratulations {vendor.full_name}! Your verification has been approved.',
        'rejected': f'Hello {vendor.full_name}, your verification has been rejected. Please resubmit your documents.',
    }
    
    try:
        send_mail(
            subject_map.get(status, 'Verification Update'),
            message_map.get(status, 'Your verification status has been updated.'),
            settings.DEFAULT_FROM_EMAIL,
            [vendor.email],
            fail_silently=False,
        )
        logger.info(f"Verification email sent to {vendor.email}")
    except Exception as e:
        logger.error(f"Failed to send verification email to {vendor.email}: {str(e)}")

def get_booking_analytics(vendor, days=30):
    """Get booking analytics for the vendor"""
    from ..models import Booking
    
    end_date = timezone.now()
    start_date = end_date - timedelta(days=days)
    
    bookings = Booking.objects.filter(
        vendor=vendor,
        created_at__range=[start_date, end_date]
    )
    
    analytics = {
        'total_bookings': bookings.count(),
        'pending_count': bookings.filter(status='pending').count(),
        'in_progress_count': bookings.filter(status='in_progress').count(),
        'completed_count': bookings.filter(status='completed').count(),
        'total_revenue': sum(b.amount for b in bookings.filter(status='completed')),
        'average_booking_value': 0,
    }
    
    if analytics['completed_count'] > 0:
        analytics['average_booking_value'] = analytics['total_revenue'] / analytics['completed_count']
    
    return analytics

def validate_file_upload(file, allowed_types=['pdf', 'jpg', 'jpeg', 'png'], max_size_mb=5):
    """Validate uploaded file type and size"""
    if not file:
        return False, "No file provided"
    
    # Check file extension
    file_extension = file.name.split('.')[-1].lower()
    if file_extension not in allowed_types:
        return False, f"File type not allowed. Allowed types: {', '.join(allowed_types)}"
    
    # Check file size
    max_size_bytes = max_size_mb * 1024 * 1024
    if file.size > max_size_bytes:
        return False, f"File size too large. Maximum size: {max_size_mb}MB"
    
    return True, "File is valid"

def generate_booking_reference():
    """Generate unique booking reference"""
    import uuid
    return f"BK{str(uuid.uuid4())[:8].upper()}"