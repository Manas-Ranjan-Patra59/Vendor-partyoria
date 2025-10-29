from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Q, Sum
from django.utils import timezone
from datetime import datetime, timedelta
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from django.utils.html import escape
import logging

logger = logging.getLogger(__name__)
from ..models import UserDetails, BookingDetails, VendorChat, VerificationDetails, CalendarEvent, VendorService
from .serializers import (
    VendorRegistrationSerializer, VendorLoginSerializer, VendorProfileSerializer,
    BookingSerializer, BookingStatusUpdateSerializer, VendorChatSerializer,
    VendorListSerializer, VerificationSerializer, CalendarEventSerializer,
    DashboardStatsSerializer, VendorServiceSerializer
)

class VendorRegistrationView(generics.CreateAPIView):
    queryset = UserDetails.objects.all()
    serializer_class = VendorRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        try:
            logger.info("API: Vendor registration attempt")
            logger.info(f"API: Registration data: {request.data}")
            
            serializer = self.get_serializer(data=request.data)
            if not serializer.is_valid():
                logger.warning(f"API: Registration validation failed: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            vendor = serializer.save()
            logger.info(f"API: Vendor created successfully: {vendor.email}")
            
            refresh = RefreshToken.for_user(vendor)
            response_data = {
                'vendor': VendorProfileSerializer(vendor).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
            logger.info(f"API: Registration response vendor data: {response_data['vendor']}")
            
            return Response(response_data, status=status.HTTP_201_CREATED)
        except ValidationError as e:
            logger.error(f"API: Validation error during registration: {e}")
            return Response({'error': 'Invalid data provided'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"API: Unexpected error during registration: {e}")
            return Response({'error': 'Registration failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def vendor_login(request):
    logger.info(f"API: Login attempt for email: {request.data.get('email')}")
    
    serializer = VendorLoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    vendor = serializer.validated_data['vendor']
    vendor.is_online = True
    vendor.save()
    
    logger.info(f"API: Login successful for vendor: {vendor.email}")
    
    refresh = RefreshToken.for_user(vendor)
    response_data = {
        'vendor': VendorProfileSerializer(vendor).data,
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }
    logger.info(f"API: Login response vendor data: {response_data['vendor']}")
    
    return Response(response_data)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def vendor_logout(request):
    vendor = request.user
    vendor.is_online = False
    vendor.save()
    return Response({'message': 'Logged out successfully'})

class VendorProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = VendorProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    def retrieve(self, request, *args, **kwargs):
        vendor = self.get_object()
        if not vendor:
            return Response({'error': 'No vendor found'}, status=status.HTTP_400_BAD_REQUEST)
        
        logger.info(f"Profile retrieved for vendor: {vendor.email}")
        serializer = self.get_serializer(vendor)
        return Response(serializer.data)
    
    def update(self, request, *args, **kwargs):
        vendor = self.get_object()
        if not vendor:
            return Response({'error': 'No vendor found'}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = self.get_serializer(vendor, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_stats(request):
    vendor = request.user
    if not vendor:
        return Response({'error': 'No vendor found'}, status=status.HTTP_400_BAD_REQUEST)
        
    bookings = BookingDetails.objects.filter(vendor=vendor)
    
    total_bookings = bookings.count()
    pending_bookings = bookings.filter(status='pending').count()
    in_progress_bookings = bookings.filter(status='in_progress').count()
    completed_bookings = bookings.filter(status='completed').count()
    
    total_revenue = bookings.filter(status='completed').aggregate(
        total=Sum('amount'))['total'] or 0
    
    current_month = timezone.now().replace(day=1)
    monthly_revenue = bookings.filter(
        status='completed',
        created_at__gte=current_month
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    stats = {
        'total_bookings': total_bookings,
        'pending_bookings': pending_bookings,
        'in_progress_bookings': in_progress_bookings,
        'completed_bookings': completed_bookings,
        'total_revenue': total_revenue,
        'monthly_revenue': monthly_revenue,
    }
    
    serializer = DashboardStatsSerializer(stats)
    return Response(serializer.data)

class BookingListView(generics.ListAPIView):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return BookingDetails.objects.filter(vendor=self.request.user).order_by('-created_at')

class BookingStatusUpdateView(generics.UpdateAPIView):
    serializer_class = BookingStatusUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return BookingDetails.objects.filter(vendor=self.request.user)

class VendorListForChatView(generics.ListAPIView):
    serializer_class = VendorListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return UserDetails.objects.exclude(id=self.request.user.id)

class ChatMessagesView(generics.ListCreateAPIView):
    serializer_class = VendorChatSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        vendor_id = self.kwargs['vendor_id']
        
        return VendorChat.objects.filter(
            Q(receiver_id=vendor_id) | Q(sender_id=vendor_id)
        ).order_by('timestamp')
    
    def perform_create(self, serializer):
        vendor_id = self.kwargs['vendor_id']
        serializer.save(
            sender=self.request.user,
            receiver_id=vendor_id
        )

@api_view(['PUT'])
@permission_classes([permissions.IsAuthenticated])
def mark_messages_read(request, vendor_id):
    VendorChat.objects.filter(
        sender_id=vendor_id,
        receiver=request.user,
        is_read=False
    ).update(is_read=True)
    
    return Response({'message': 'Messages marked as read'})

class VerificationView(generics.CreateAPIView, generics.RetrieveAPIView):
    serializer_class = VerificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return None
    
    def create(self, request, *args, **kwargs):
        try:
            vendor = request.user
            if not vendor:
                return Response({'error': 'No vendor found'}, status=status.HTTP_400_BAD_REQUEST)
            
            logger.info(f"Verification submission for vendor: {vendor.email}")
            
            # Check if verification already exists
            existing_verification = VerificationDetails.objects.filter(user=vendor).first()
            if existing_verification:
                # Update existing verification documents but keep status as pending
                serializer = self.get_serializer(existing_verification, data=request.data, partial=True)
                serializer.is_valid(raise_exception=True)
                verification = serializer.save(status='approved', is_verified=True)
                
                logger.info(f"Updated existing verification for vendor: {vendor.email}, status: approved")
                return Response(VerificationSerializer(verification).data, status=status.HTTP_200_OK)
            
            # Create new verification with approved status and is_verified=True
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            verification = serializer.save(user=vendor, status='approved', is_verified=True)
            
            logger.info(f"Created new verification for vendor: {vendor.email}, status: approved")
            return Response(VerificationSerializer(verification).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Verification error: {e}")
            return Response({'error': 'Verification failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CalendarEventsView(generics.ListCreateAPIView):
    serializer_class = CalendarEventSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return CalendarEvent.objects.filter(vendor=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(vendor=self.request.user)

class VendorServicesListView(generics.ListCreateAPIView):
    serializer_class = VendorServiceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return VendorService.objects.filter(user=self.request.user)
    
    def list(self, request, *args, **kwargs):
        logger.info(f"SERVICE LIST REQUEST - User: {request.user.email}")
        queryset = self.get_queryset()
        logger.info(f"Found {queryset.count()} services for user")
        for service in queryset:
            logger.info(f"Service: {service.service_name}, Price: {service.service_price}")
        return super().list(request, *args, **kwargs)
    
    def create(self, request, *args, **kwargs):
        try:
            logger.info(f"SERVICE CREATE REQUEST - User: {request.user.email}")
            logger.info(f"Request data: {request.data}")
            
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            service = serializer.save(user=self.request.user)
            
            logger.info(f"Created service: {service.service_name}, Price: {service.service_price}")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except IntegrityError as e:
            logger.error(f"IntegrityError in service creation: {e}")
            if 'duplicate key value violates unique constraint' in str(e):
                return Response(
                    {'error': 'Service with this name already exists for your account'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            return Response(
                {'error': 'Database error occurred'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except Exception as e:
            logger.error(f"Service creation error: {e}")
            return Response(
                {'error': 'Failed to create service'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class VendorServiceDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = VendorServiceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return VendorService.objects.filter(user=self.request.user)
    
    def update(self, request, *args, **kwargs):
        try:
            logger.info(f"=== SERVICE UPDATE REQUEST ===")
            logger.info(f"User: {request.user.email}")
            logger.info(f"Service ID: {kwargs.get('pk')}")
            logger.info(f"Request data: {request.data}")
            logger.info(f"Request method: {request.method}")
            
            # Get the service before update
            service = self.get_object()
            logger.info(f"BEFORE UPDATE - Service: {service.service_name}, Price: {service.service_price}")
            
            # Validate serializer
            serializer = self.get_serializer(service, data=request.data, partial=True)
            if not serializer.is_valid():
                logger.error(f"Serializer validation failed: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            # Save the update
            serializer.save()
            
            # Get the service after update
            service.refresh_from_db()
            logger.info(f"AFTER UPDATE - Service: {service.service_name}, New Price: {service.service_price}")
            logger.info(f"=== UPDATE COMPLETE ===")
            
            return Response(serializer.data)
        except IntegrityError as e:
            logger.error(f"IntegrityError in service update: {e}")
            if 'duplicate key value violates unique constraint' in str(e):
                return Response(
                    {'error': 'Service with this name already exists for your account'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            return Response(
                {'error': 'Database error occurred'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except Exception as e:
            logger.error(f"Service update error: {e}")
            return Response(
                {'error': 'Failed to update service'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class CalendarEventDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CalendarEventSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return CalendarEvent.objects.filter(vendor=self.request.user)

class VendorListView(generics.ListAPIView):
    serializer_class = VendorProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = UserDetails.objects.exclude(id=self.request.user.id).prefetch_related('services', 'profile')
        
        # Apply filters
        category = self.request.query_params.get('category')
        location = self.request.query_params.get('location')
        search = self.request.query_params.get('search')
        price_range = self.request.query_params.get('price_range')
        limit = self.request.query_params.get('limit')
        
        if category:
            queryset = queryset.filter(business__icontains=category)
        
        if location and location != 'All':
            # Add logging to debug location filtering
            logger.info(f"Filtering by location: {location}")
            queryset = queryset.filter(
                Q(profile__city__icontains=location) | 
                Q(profile__location__icontains=location) |
                Q(profile__state__icontains=location) |
                Q(verification__address__icontains=location)
            ).distinct()
            logger.info(f"After location filter, found {queryset.count()} vendors")
        
        if search:
            queryset = queryset.filter(
                Q(full_name__icontains=search) |
                Q(business__icontains=search) |
                Q(services__service_name__icontains=search) |
                Q(services__category__icontains=search) |
                Q(services__description__icontains=search)
            ).distinct()
        
        if price_range and price_range != 'All':
            if price_range == 'Under ₹10,000':
                queryset = queryset.filter(services__service_price__lt=10000)
            elif price_range == '₹10,000 - ₹25,000':
                queryset = queryset.filter(services__service_price__gte=10000, services__service_price__lte=25000)
            elif price_range == '₹25,000 - ₹50,000':
                queryset = queryset.filter(services__service_price__gte=25000, services__service_price__lte=50000)
            elif price_range == 'Above ₹50,000':
                queryset = queryset.filter(services__service_price__gt=50000)
            queryset = queryset.distinct()
        
        # Apply limit if specified
        if limit:
            try:
                limit_int = int(limit)
                queryset = queryset[:limit_int]
            except ValueError:
                pass
        
        return queryset
    
    @property
    def paginator(self):
        # Disable pagination when no limit is specified (i.e., when filters are applied)
        limit = self.request.query_params.get('limit')
        if not limit:
            return None
        return super().paginator