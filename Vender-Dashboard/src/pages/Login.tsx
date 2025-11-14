import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, Eye, EyeOff, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { apiService } from "@/services/api";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    console.log("🔐 Login attempt started", { email, password: password ? "***" : "empty" });
    
    if (!email || !password) {
      console.log("❌ Validation failed - missing email or password");
      toast.error("Please enter both email and password");
      return;
    }

    setLoading(true);
    console.log("📡 Calling API login...");
    
    try {
      const result = await apiService.login(email, password);
      console.log("📥 API Response:", result);
      
      if (result.data) {
        console.log("✅ Login successful, processing data...");
        
        // Clear old verification status first
        console.log('🧹 LOGIN: Clearing old verification status');
        localStorage.removeItem('verificationStatus');
        
        // Store authentication tokens
        if (result.data.access) {
          localStorage.setItem('access_token', result.data.access);
          console.log("🔑 LOGIN: Access token saved");
        }
        if (result.data.refresh) {
          localStorage.setItem('refresh_token', result.data.refresh);
          console.log("🔄 LOGIN: Refresh token saved");
        }
        if (result.data.vendor) {
          localStorage.setItem('vendor_profile', JSON.stringify(result.data.vendor));
          console.log("👤 LOGIN: Vendor profile saved:", result.data.vendor);
          console.log("📊 LOGIN: Vendor is_verified from API:", result.data.vendor.is_verified, 'type:', typeof result.data.vendor.is_verified);
          
          // Create onboarding data from vendor profile for dashboard compatibility
          const vendorOnboarding = {
            email: result.data.vendor.email,
            fullName: result.data.vendor.full_name,
            mobile: result.data.vendor.mobile,
            business: result.data.vendor.business,
            level: result.data.vendor.experience_level,
            services: Array.isArray(result.data.vendor.services) ? result.data.vendor.services : (result.data.vendor.services ? result.data.vendor.services.split(',') : []),
            city: result.data.vendor.city,
            state: result.data.vendor.state,
            pincode: result.data.vendor.pincode,
            location: result.data.vendor.location,
            is_verified: result.data.vendor.is_verified
          };
          localStorage.setItem('vendorOnboarding', JSON.stringify(vendorOnboarding));
          console.log("📋 LOGIN: Onboarding data created:", vendorOnboarding);
          console.log("📊 LOGIN: Onboarding is_verified:", vendorOnboarding.is_verified, 'type:', typeof vendorOnboarding.is_verified);
        console.log("📋 Services type:", typeof result.data.vendor.services, result.data.vendor.services);
        }
        
        // Get fresh profile data to update verification status
        try {
          console.log('📡 LOGIN: Calling profile API for fresh verification status...');
          const profileResult = await apiService.getProfile();
          console.log('📋 LOGIN: Profile API result:', profileResult);
          
          if (profileResult.data) {
            const isVerified = (profileResult.data as any).is_verified;
            const verificationStatus = isVerified === true || isVerified === 1 ? 'approved' : 'pending';
            localStorage.setItem('verificationStatus', verificationStatus);
            console.log("✅ LOGIN: Fresh verification status from profile API:", verificationStatus);
            console.log("📊 LOGIN: is_verified from profile API:", isVerified, 'type:', typeof isVerified);
          } else {
            // Fallback to login data
            const isVerified = result.data.vendor?.is_verified === true || result.data.vendor?.is_verified === 1;
            const verificationStatus = isVerified ? 'approved' : 'pending';
            localStorage.setItem('verificationStatus', verificationStatus);
            console.log("✅ LOGIN: Fallback verification status (no profile data):", verificationStatus);
            console.log("📊 LOGIN: Fallback is_verified:", isVerified);
          }
        } catch (profileError) {
          console.error('💥 LOGIN: Profile API error:', profileError);
          // Fallback to login data
          const isVerified = result.data.vendor?.is_verified === true || result.data.vendor?.is_verified === 1;
          const verificationStatus = isVerified ? 'approved' : 'pending';
          localStorage.setItem('verificationStatus', verificationStatus);
          console.log("✅ LOGIN: Error fallback verification status:", verificationStatus);
          console.log("📊 LOGIN: Error fallback is_verified:", isVerified);
        }
        
        // Set loading state to prevent popup during login
        localStorage.setItem('loginLoading', 'true');
        
        toast.success("Login successful!");
        console.log("🚀 Redirecting to dashboard...");
        setTimeout(() => {
          console.log("📍 Navigation executing...");
          navigate("/dashboard");
          // Reload to refresh verification status from backend
          setTimeout(() => {
            localStorage.removeItem('loginLoading');
            window.location.reload();
          }, 100);
        }, 500);
      } else {
        console.log("❌ Login failed - no data in response");
        toast.error("Invalid email or password");
      }
    } catch (error) {
      console.error("💥 Login error:", error);
      toast.error(`Login failed: ${error.message || 'Please check if backend server is running'}`);
    }
    
    setLoading(false);
    console.log("🏁 Login process completed");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-primary px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mx-auto"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Welcome Back! 👋</h1>
          <p className="text-xl text-white/80">Sign in to your vendor account</p>
        </div>

        <div className="space-y-6">
          <div className="relative">
            <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70 z-10" />
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-14 text-lg bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-sm pr-12"
              autoFocus
            />
          </div>

          <div className="relative">
            <Lock className="absolute right-12 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70 z-10" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-14 text-lg bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-sm pr-16"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors z-20"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <Button
            onClick={handleLogin}
            disabled={loading}
            className="w-full h-14 text-lg bg-white text-primary hover:bg-white/90 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
            ) : (
              <>
                Sign In <ArrowRight className="w-5 h-5" />
              </>
            )}
          </Button>

          <div className="text-center">
            <p className="text-white/60 text-sm">
              Don't have an account?{" "}
              <Link 
                to="/onboarding" 
                className="text-white font-medium hover:text-white/80 transition-colors"
              >
                Sign up here
              </Link>
            </p>
          </div>

          <div className="text-center mt-6">
            <p className="text-white/40 text-xs">
              Demo: Use registered email with password "defaultPassword123"
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;