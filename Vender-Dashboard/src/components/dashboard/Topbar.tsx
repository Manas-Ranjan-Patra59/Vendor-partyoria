import { useState, useEffect } from "react";
import { Bell, User, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

const Topbar = () => {
  const navigate = useNavigate();
  const vendorData = JSON.parse(localStorage.getItem("vendorOnboarding") || "{}");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <header className={`sticky top-0 z-50 h-20 transition-all duration-300 flex items-center justify-between px-8 ${
      isScrolled 
        ? 'bg-white border-b border-gray-300 shadow-2xl' 
        : 'bg-gradient-to-r from-slate-100 to-indigo-100 border-b border-indigo-200/60 shadow-lg'
    }`}>
      {/* Beautiful Search Bar */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
          <input
            type="text"
            placeholder="Search bookings, customers, services..."
            className="w-full h-12 pl-12 pr-4 bg-white/80 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-400 transition-all duration-200 shadow-sm backdrop-blur-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative hover:bg-blue-50 text-slate-600 hover:text-slate-800 border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <Bell className="w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white animate-pulse">
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => { navigate("/dashboard/bookings"); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="cursor-pointer hover:bg-blue-50 transition-colors duration-200">
              <div className="flex flex-col gap-1">
                <p className="font-medium">New booking request</p>
                <p className="text-xs text-muted-foreground">Sarah Johnson wants to book your service</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <div className="flex flex-col gap-1">
                <p className="font-medium">Payment received</p>
                <p className="text-xs text-muted-foreground">$500 payment confirmed</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { navigate("/dashboard/reviews"); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="cursor-pointer hover:bg-green-50 transition-colors duration-200">
              <div className="flex flex-col gap-1">
                <p className="font-medium">New review</p>
                <p className="text-xs text-muted-foreground">You received a 5-star review!</p>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-8 w-px bg-slate-300 mx-2"></div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="rounded-2xl p-2 hover:bg-blue-50 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center border-2 border-blue-200 shadow-sm">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-slate-900 font-medium text-sm">{vendorData.fullName || 'Vendor'}</p>
                  <p className="text-slate-500 text-xs">{vendorData.business || 'Professional'}</p>
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/dashboard/settings")}>Profile Settings</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Topbar;
