from rest_framework import serializers
from django.contrib.auth import authenticate
from django.db import models
from ..models import UserDetails, BookingDetails, VendorChat, VerificationDetails, CalendarEvent, ProfileDetails, VendorService

class VendorRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    services = serializers.CharField(required=False, allow_blank=True)
    experience_level = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = UserDetails
        fields = ['email', 'full_name', 'mobile', 'business', 'experience_level', 'services', 'password']
    
    def validate_email(self, value):
        if UserDetails.objects.filter(email=value).exists():
            raise serializers.ValidationError("A vendor with this email already exists.")
        return value
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        services_str = validated_data.pop('services', '')
        email = validated_data.pop('email')
        
        # Convert services string to list
        if services_str:
            services_list = [s.strip() for s in services_str.split(',') if s.strip()]
        else:
            services_list = []
        
        # Set default experience level if empty
        if not validated_data.get('experience_level') or validated_data.get('experience_level').strip() == '':
            validated_data['experience_level'] = 'Beginner'
        
        # Extract profile fields from request data
        location = self.context['request'].data.get('location', '')
        city = self.context['request'].data.get('city', '')
        state = self.context['request'].data.get('state', '')
        pincode = self.context['request'].data.get('pincode', '')
        
        # Create user
        user = UserDetails(
            username=email,
            email=email,
            **validated_data
        )
        user.set_password(password)
        user.save()
        
        # Create profile
        ProfileDetails.objects.create(
            user=user,
            location=location,
            city=city,
            state=state,
            pincode=pincode
        )
        
        # Create individual service records
        business_category = validated_data.get('business', '')
        for service_name in services_list:
            VendorService.objects.get_or_create(
                user=user,
                service_name=service_name,
                defaults={'category': business_category}
            )
        
        vendor = user
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
    is_verified = serializers.SerializerMethodField()
    services = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()
    city = serializers.SerializerMethodField()
    
    class Meta:
        model = UserDetails
        fields = ['id', 'email', 'full_name', 'mobile', 'business', 'experience_level', 
                 'is_online', 'is_verified', 'services', 'location', 'city', 'created_at']
        read_only_fields = ['id', 'email', 'created_at']
    
    def get_is_verified(self, obj):
        try:
            verification = VerificationDetails.objects.filter(user=obj).first()
            return verification.is_verified if verification else False
        except:
            return False
    
    def get_location(self, obj):
        try:
            return obj.profile.location if hasattr(obj, 'profile') and obj.profile.location else None
        except:
            return None
    
    def get_city(self, obj):
        try:
            return obj.profile.city if hasattr(obj, 'profile') and obj.profile.city else None
        except:
            return None
    
    def get_services(self, obj):
        vendor_services = VendorService.objects.filter(user=obj, is_active=True)
        return [{
            'name': service.service_name,
            'price': service.service_price,
            'description': service.description
        } for service in vendor_services]

class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = BookingDetails
        fields = ['id', 'customer_name', 'service_type', 'event_date', 'amount', 
                 'status', 'description', 'location', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class BookingStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = BookingDetails
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
        model = UserDetails
        fields = ['id', 'full_name', 'business', 'is_online', 'last_message']
    
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
        model = VerificationDetails
        fields = ['id', 'aadhaar_document', 'pan_document', 'status', 'submitted_at', 'reviewed_at']
        read_only_fields = ['id', 'status', 'submitted_at', 'reviewed_at']

class CalendarEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = CalendarEvent
        fields = ['id', 'title', 'description', 'event_date', 'location', 'booking', 'created_at']
        read_only_fields = ['id', 'created_at']

class VendorServiceSerializer(serializers.ModelSerializer):
    category = serializers.CharField(required=False)
    
    class Meta:
        model = VendorService
        fields = ['id', 'service_name', 'category', 'service_price', 'minimum_people', 'maximum_people', 'description', 'image', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
        extra_kwargs = {
            'service_name': {'required': False},
            'category': {'required': False}
        }

class DashboardStatsSerializer(serializers.Serializer):
    total_bookings = serializers.IntegerField()
    pending_bookings = serializers.IntegerField()
    in_progress_bookings = serializers.IntegerField()
    completed_bookings = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=10, decimal_places=2)
    monthly_revenue = serializers.DecimalField(max_digits=10, decimal_places=2)