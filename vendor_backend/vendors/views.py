from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Q, Sum
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Vendor, Booking, VendorChat, Verification, CalendarEvent
from .serializers import (
    VendorRegistrationSerializer, VendorLoginSerializer, VendorProfileSerializer,
    BookingSerializer, BookingStatusUpdateSerializer, VendorChatSerializer,
    VendorListSerializer, VerificationSerializer, CalendarEventSerializer,
    DashboardStatsSerializer
)

class VendorRegistrationView(generics.CreateAPIView):
    queryset = Vendor.objects.all()
    serializer_class = VendorRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        vendor = serializer.save()
        
        refresh = RefreshToken.for_user(vendor)
        return Response({
            'vendor': VendorProfileSerializer(vendor).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def vendor_login(request):
    serializer = VendorLoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    vendor = serializer.validated_data['vendor']
    vendor.is_online = True
    vendor.save()
    
    refresh = RefreshToken.for_user(vendor)
    return Response({
        'vendor': VendorProfileSerializer(vendor).data,
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    })

@api_view(['POST'])
def vendor_logout(request):
    vendor = request.user
    vendor.is_online = False
    vendor.save()
    return Response({'message': 'Logged out successfully'})

class VendorProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = VendorProfileSerializer
    
    def get_object(self):
        return self.request.user

@api_view(['GET'])
def dashboard_stats(request):
    vendor = request.user
    bookings = Booking.objects.filter(vendor=vendor)
    
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
    
    def get_queryset(self):
        vendor = self.request.user
        return Booking.objects.filter(vendor=vendor).order_by('-created_at')

class BookingStatusUpdateView(generics.UpdateAPIView):
    serializer_class = BookingStatusUpdateSerializer
    
    def get_queryset(self):
        return Booking.objects.filter(vendor=self.request.user)

class VendorListForChatView(generics.ListAPIView):
    serializer_class = VendorListSerializer
    
    def get_queryset(self):
        return Vendor.objects.exclude(id=self.request.user.id)

class ChatMessagesView(generics.ListCreateAPIView):
    serializer_class = VendorChatSerializer
    
    def get_queryset(self):
        vendor_id = self.kwargs['vendor_id']
        current_vendor = self.request.user
        
        return VendorChat.objects.filter(
            Q(sender=current_vendor, receiver_id=vendor_id) |
            Q(sender_id=vendor_id, receiver=current_vendor)
        ).order_by('timestamp')
    
    def perform_create(self, serializer):
        vendor_id = self.kwargs['vendor_id']
        serializer.save(
            sender=self.request.user,
            receiver_id=vendor_id
        )

@api_view(['PUT'])
def mark_messages_read(request, vendor_id):
    VendorChat.objects.filter(
        sender_id=vendor_id,
        receiver=request.user,
        is_read=False
    ).update(is_read=True)
    
    return Response({'message': 'Messages marked as read'})

class VerificationView(generics.CreateAPIView, generics.RetrieveAPIView):
    serializer_class = VerificationSerializer
    
    def get_object(self):
        return getattr(self.request.user, 'verification', None)
    
    def perform_create(self, serializer):
        serializer.save(vendor=self.request.user)

class CalendarEventsView(generics.ListCreateAPIView):
    serializer_class = CalendarEventSerializer
    
    def get_queryset(self):
        return CalendarEvent.objects.filter(vendor=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(vendor=self.request.user)

class CalendarEventDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CalendarEventSerializer
    
    def get_queryset(self):
        return CalendarEvent.objects.filter(vendor=self.request.user)