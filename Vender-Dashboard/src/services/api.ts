const API_BASE_URL = 'http://localhost:8000/api/vendor';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private getBasicHeaders() {
    return {
      'Content-Type': 'application/json',
    };
  }

  private async refreshToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
        method: 'POST',
        headers: this.getBasicHeaders(),
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access_token', data.access);
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }
    return false;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      const responseText = await response.text();
      
      if (!response.ok) {
        // Handle 401 Unauthorized - try to refresh token
        if (response.status === 401) {
          const refreshed = await this.refreshToken();
          if (refreshed) {
            // Retry the original request with new token
            return { error: 'TOKEN_REFRESHED' };
          } else {
            // Refresh failed, redirect to login
            localStorage.clear();
            window.location.href = '/login';
            return { error: 'Session expired. Please login again.' };
          }
        }
        
        let errorMessage = `Server Error (${response.status})`;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.detail || errorData.message || JSON.stringify(errorData);
        } catch {
          if (responseText.includes('<html>')) {
            errorMessage = `Server Error (${response.status}): Please check backend server`;
          } else {
            errorMessage = responseText || errorMessage;
          }
        }
        return { error: errorMessage };
      }
      
      // Handle empty response (like DELETE 204)
      if (!responseText || responseText.trim() === '') {
        return { data: {} as T };
      }
      
      const data = JSON.parse(responseText);
      return { data };
    } catch (error) {
      return { error: 'Network or parsing error' };
    }
  }

  private async makeRequest<T>(url: string, options: RequestInit): Promise<ApiResponse<T>> {
    let response = await fetch(url, options);
    let result = await this.handleResponse<T>(response);
    
    // If token was refreshed, retry the request
    if (result.error === 'TOKEN_REFRESHED') {
      const newOptions = {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      };
      response = await fetch(url, newOptions);
      result = await this.handleResponse<T>(response);
    }
    
    return result;
  }

  // Authentication
  async register(vendorData: {
    email: string;
    full_name: string;
    mobile: string;
    business: string;
    experience_level: string;
    location: string;
    city: string;
    state: string;
    pincode: string;
    services: string;
    password: string;
  }) {
    try {
      // Making registration request
      
      const response = await fetch(`${API_BASE_URL}/auth/register/`, {
        method: 'POST',
        headers: this.getBasicHeaders(),
        body: JSON.stringify(vendorData),
      });
      
      const result = await this.handleResponse(response);
      return result;
    } catch (error) {
      return { error: 'Network connection failed. Please check if the backend server is running.' };
    }
  }

  async login(email: string, password: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: 'POST',
        headers: this.getBasicHeaders(),
        body: JSON.stringify({ email, password }),
      });
      
      const responseText = await response.text();
      
      if (!response.ok) {
        return { error: `Server returned ${response.status}: ${responseText}` };
      }
      
      try {
        const data = JSON.parse(responseText);
        
        if (data.access && data.vendor) {
          localStorage.setItem('access_token', data.access);
          localStorage.setItem('refresh_token', data.refresh);
          localStorage.setItem('vendor_profile', JSON.stringify(data.vendor));
          return { data };
        } else {
          return { error: 'Invalid response from server' };
        }
      } catch (parseError) {
        return { error: 'Invalid JSON response from server' };
      }
      
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return { error: `Cannot connect to backend server at ${API_BASE_URL}. Is the server running?` };
      }
      
      return { error: `Network error: ${error.message}` };
    }
  }

  async logout() {
    const response = await fetch(`${API_BASE_URL}/auth/logout/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    
    // Clear all user data from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('vendor_profile');
    localStorage.removeItem('vendorOnboarding');
    localStorage.removeItem('verificationStatus');
    
    return this.handleResponse(response);
  }

  // Profile
  async getProfile() {
    // Add timestamp to prevent caching
    const timestamp = Date.now();
    const response = await fetch(`${API_BASE_URL}/auth/profile/?_t=${timestamp}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async updateProfile(profileData: any) {
    const token = localStorage.getItem('access_token');
    
    // Check if profileData is FormData (for file uploads)
    const isFormData = profileData instanceof FormData;
    
    const headers = isFormData 
      ? { ...(token && { Authorization: `Bearer ${token}` }) }
      : this.getAuthHeaders();
    
    const body = isFormData ? profileData : JSON.stringify(profileData);
    
    const response = await fetch(`${API_BASE_URL}/auth/profile/`, {
      method: 'PATCH',
      headers,
      body,
    });
    return this.handleResponse(response);
  }

  // Dashboard
  async getDashboardStats() {
    const response = await fetch(`${API_BASE_URL}/dashboard/stats/`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Bookings
  async getBookings() {
    const response = await fetch(`${API_BASE_URL}/bookings/`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async updateBookingStatus(bookingId: number, status: string) {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/status/`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    return this.handleResponse(response);
  }

  // Verification
  async submitVerification(formData: FormData) {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/verification/`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });
    return this.handleResponse(response);
  }

  async getVerificationStatus() {
    const response = await fetch(`${API_BASE_URL}/verification/`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async updateVerificationStatus(vendorId: string, isVerified: boolean) {
    const response = await fetch(`${API_BASE_URL}/verification/update-status/`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ 
        vendor_id: vendorId, 
        is_verified: isVerified 
      }),
    });
    return this.handleResponse(response);
  }

  // Services
  async getServices() {
    return this.makeRequest(`${API_BASE_URL}/services/`, {
      headers: this.getAuthHeaders(),
    });
  }

  async createService(serviceData: any) {
    console.log('API: Creating service with data:', serviceData);
    console.log('API: Auth headers:', this.getAuthHeaders());
    
    const response = await fetch(`${API_BASE_URL}/services/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(serviceData),
    });
    
    console.log('API: Create service response status:', response.status);
    const result = await this.handleResponse(response);
    console.log('API: Create service result:', result);
    return result;
  }

  async updateService(serviceId: number, serviceData: any) {
    console.log('API: Updating service', serviceId, 'with data:', serviceData);
    const response = await fetch(`${API_BASE_URL}/services/${serviceId}/`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(serviceData),
    });
    const result = await this.handleResponse(response);
    console.log('API: Update response:', result);
    return result;
  }

  async deleteService(serviceId: number) {
    const response = await fetch(`${API_BASE_URL}/services/${serviceId}/`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Calendar
  async getCalendarEvents() {
    const response = await fetch(`${API_BASE_URL}/calendar/events/`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async createCalendarEvent(eventData: any) {
    const response = await fetch(`${API_BASE_URL}/calendar/events/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(eventData),
    });
    return this.handleResponse(response);
  }

  // Email validation
  async checkEmailExists(email: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/check-email/`, {
        method: 'POST',
        headers: this.getBasicHeaders(),
        body: JSON.stringify({ email }),
      });
      return this.handleResponse(response);
    } catch (error) {
      return { error: 'Network error' };
    }
  }

  // Vendors
  async getVendors(filters: any = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.limit) queryParams.append('limit', filters.limit.toString());
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.location) queryParams.append('location', filters.location);
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.priceRange) queryParams.append('price_range', filters.priceRange);
      
      const url = `${API_BASE_URL}/vendors/${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      console.log('🔄 Making API call to:', url);
      
      const response = await fetch(url, {
        headers: this.getAuthHeaders(),
      });
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
      
      const result = await this.handleResponse(response);
      console.log('📦 API result:', result);
      
      if (result.data) {
        return {
          success: true,
          data: result.data
        };
      } else {
        console.log('❌ No data in response, error:', result.error);
        return {
          success: false,
          data: [],
          error: result.error
        };
      }
    } catch (error) {
      console.error('💥 Network error in getVendors:', error);
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  }

  async updateVendor(vendorId: number, vendorData: any) {
    const token = localStorage.getItem('access_token');
    const isFormData = vendorData instanceof FormData;
    
    const headers = isFormData 
      ? { ...(token && { Authorization: `Bearer ${token}` }) }
      : this.getAuthHeaders();
    
    const body = isFormData ? vendorData : JSON.stringify(vendorData);
    
    const response = await fetch(`${API_BASE_URL}/vendors/${vendorId}/`, {
      method: 'PATCH',
      headers,
      body,
    });
    return this.handleResponse(response);
  }

  async deleteVendor(vendorId: number) {
    const response = await fetch(`${API_BASE_URL}/vendors/${vendorId}/`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async updateServiceImage(serviceId: number, imageFile: File) {
    const token = localStorage.getItem('access_token');
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await fetch(`${API_BASE_URL}/services/${serviceId}/`, {
      method: 'PATCH',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });
    return this.handleResponse(response);
  }
}

export const apiService = new ApiService();

export default apiService;