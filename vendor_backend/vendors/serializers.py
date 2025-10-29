from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import Vendor, Booking, VendorChat, Verification, CalendarEvent

class VendorRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = Vendor
        fields = ['email', 'full_name', 'mobile', 'business', 'experience_level', 'location', 'password']
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        vendor = Vendor.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            password=password,
            **validated_data
        )
        return vendor

class VendorLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()
    
    def validate(self, data):
        email = data.get('email')
        password = data.get('password')
        
        if email and password:
            vendor = authenticate(username=email, password=password)
            if vendor and vendor.is_active:
                data['vendor'] = vendor
                return data
            else:
                raise serializers.ValidationError('Invalid credentials')
        else:
            raise serializers.ValidationError('Email and password required')

class VendorProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = ['id', 'email', 'full_name', 'mobile', 'business', 'experience_level', 
                 'location', 'profile_image', 'is_verified', 'is_online', 'created_at']
        read_only_fields = ['id', 'email', 'is_verified', 'created_at']

class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ['id', 'customer_name', 'service_type', 'event_date', 'amount', 
                 'status', 'description', 'location', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class BookingStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ['status']

class VendorChatSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.full_name', read_only=True)
    receiver_name = serializers.CharField(source='receiver.full_name', read_only=True)
    
    class Meta:
        model = VendorChat
        fields = ['id', 'sender', 'receiver', 'sender_name', 'receiver_name', 
                 'message', 'is_read', 'timestamp']
        read_only_fields = ['id', 'sender', 'timestamp']

class VendorListSerializer(serializers.ModelSerializer):
    last_message = serializers.SerializerMethodField()
    
    class Meta:
        model = Vendor
        fields = ['id', 'full_name', 'business', 'profile_image', 'is_online', 'last_message']
    
    def get_last_message(self, obj):
        current_vendor = self.context['request'].user
        last_msg = VendorChat.objects.filter(
            models.Q(sender=current_vendor, receiver=obj) | 
            models.Q(sender=obj, receiver=current_vendor)
        ).order_by('-timestamp').first()
        
        if last_msg:
            return {
                'message': last_msg.message,
                'timestamp': last_msg.timestamp,
                'is_read': last_msg.is_read
            }
        return None

class VerificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Verification
        fields = ['id', 'aadhaar_document', 'pan_document', 'status', 'submitted_at', 'reviewed_at']
        read_only_fields = ['id', 'status', 'submitted_at', 'reviewed_at']

class CalendarEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = CalendarEvent
        fields = ['id', 'title', 'description', 'event_date', 'location', 'booking', 'created_at']
        read_only_fields = ['id', 'created_at']

class DashboardStatsSerializer(serializers.Serializer):
    total_bookings = serializers.IntegerField()
    pending_bookings = serializers.IntegerField()
    in_progress_bookings = serializers.IntegerField()
    completed_bookings = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=10, decimal_places=2)
    monthly_revenue = serializers.DecimalField(max_digits=10, decimal_places=2)