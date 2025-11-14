import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, X } from "lucide-react";

const DashboardLayout = () => {
  const [showVerificationPopup, setShowVerificationPopup] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkFirstTimeUser = () => {
      const hasShownPopup = localStorage.getItem('verificationPopupShown');
      const verificationStatus = localStorage.getItem('verificationStatus');
      const vendorProfile = JSON.parse(localStorage.getItem('vendor_profile') || '{}');
      const isVerified = vendorProfile.is_verified || verificationStatus === 'approved';
      
      // Only show popup if not shown before AND not verified
      if (!hasShownPopup && !isVerified) {
        setShowVerificationPopup(true);
        localStorage.setItem('verificationPopupShown', 'true');
      }
    };

    // Check on mount with a small delay to avoid conflicts
    const timer = setTimeout(checkFirstTimeUser, 100);

    // Listen for verification status changes
    const handleVerificationUpdate = () => {
      const verificationStatus = localStorage.getItem('verificationStatus');
      if (verificationStatus === 'approved') {
        setShowVerificationPopup(false);
      }
    };

    window.addEventListener('verificationStatusChanged', handleVerificationUpdate);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('verificationStatusChanged', handleVerificationUpdate);
    };
  }, []);

  // Scroll to top when route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="ml-64 flex flex-col min-h-screen">
        <Topbar />
        <main className="flex-1 p-6 overflow-auto" id="dashboard-main">
          <Outlet />
        </main>
      </div>
      
      {showVerificationPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                Verification Required
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowVerificationPopup(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Welcome! To access all features and start receiving bookings, please complete your document verification.
              </p>
              <div className="flex gap-2">
                <Button 
                  className="flex-1" 
                  onClick={() => {
                    setShowVerificationPopup(false);
                    window.location.href = '/dashboard/verification';
                  }}
                >
                  Verify Now
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowVerificationPopup(false)}
                >
                  Later
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
