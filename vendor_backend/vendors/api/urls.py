from django.urls import path
from . import views

urlpatterns = [
    # Authentication
    path('auth/register/', views.VendorRegistrationView.as_view(), name='vendor-register'),
    path('auth/login/', views.vendor_login, name='vendor-login'),
    path('auth/logout/', views.vendor_logout, name='vendor-logout'),
    path('auth/profile/', views.VendorProfileView.as_view(), name='vendor-profile'),
    
    # Dashboard
    path('dashboard/stats/', views.dashboard_stats, name='dashboard-stats'),
    
    # Bookings
    path('bookings/', views.BookingListView.as_view(), name='booking-list'),
    path('bookings/<int:pk>/status/', views.BookingStatusUpdateView.as_view(), name='booking-status-update'),
    
    # Chat
    path('chat/vendors/', views.VendorListForChatView.as_view(), name='vendor-list-chat'),
    path('chat/messages/<int:vendor_id>/', views.ChatMessagesView.as_view(), name='chat-messages'),
    path('chat/messages/<int:vendor_id>/read/', views.mark_messages_read, name='mark-messages-read'),
    
    # Verification
    path('verification/', views.VerificationView.as_view(), name='verification'),
    
    # Services
    path('services/', views.VendorServicesListView.as_view(), name='services-list'),
    path('services/<int:pk>/', views.VendorServiceDetailView.as_view(), name='service-detail'),
    
    # Calendar
    path('calendar/events/', views.CalendarEventsView.as_view(), name='calendar-events'),
    path('calendar/events/<int:pk>/', views.CalendarEventDetailView.as_view(), name='calendar-event-detail'),
    
    # Vendors List
    path('vendors/', views.VendorListView.as_view(), name='vendors-list'),
]