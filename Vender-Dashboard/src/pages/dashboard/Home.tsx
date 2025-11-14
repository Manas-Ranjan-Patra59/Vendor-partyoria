import { DollarSign, Calendar, TrendingUp, Bell, Plus, Clock, MessageSquare, Star, CheckCircle, AlertTriangle, ShieldAlert, X, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getVerificationStatus, getVerificationStatusDisplay, type VerificationStatus } from "@/utils/verificationUtils";
import { apiService } from "@/services/api";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const getStatsCards = (stats: any) => [
  {
    title: "Total Revenue",
    value: `₹${stats?.total_revenue || 0}`,
    change: "+12.5%",
    icon: DollarSign,
    gradient: "from-primary to-accent",
  },
  {
    title: "Total Bookings",
    value: stats?.total_bookings || 0,
    change: `${stats?.pending_bookings || 0} pending`,
    icon: Calendar,
    gradient: "from-secondary to-primary",
  },
  {
    title: "In Progress",
    value: stats?.in_progress_bookings || 0,
    change: "Active jobs",
    icon: TrendingUp,
    gradient: "from-accent to-highlight",
  },
  {
    title: "Completed",
    value: stats?.completed_bookings || 0,
    change: "Finished",
    icon: Bell,
    gradient: "from-highlight to-secondary",
  },
];

const getRecentActivityForCategory = (category: string) => {
  const activityByCategory = {
    Photography: [
      { id: 1, type: "booking", customer: "Sarah Johnson", service: "Wedding Photography", time: "2 hours ago", status: "pending" },
      { id: 6, type: "booking", customer: "Amanda Taylor", service: "Event Photography", time: "4 hours ago", status: "in_progress" },
      { id: 7, type: "payment", customer: "James Brown", service: "Corporate Photography", time: "6 hours ago", status: "completed" },
      { id: 9, type: "review", customer: "David Wilson", service: "Portrait Photography", time: "1 day ago", status: "5_stars" },
      { id: 10, type: "booking", customer: "Maria Garcia", service: "Drone Photography", time: "2 days ago", status: "accepted" },
      { id: 101, type: "booking", customer: "Lisa Parker", service: "Fashion Photography", time: "3 hours ago", status: "pending" },
      { id: 102, type: "payment", customer: "Tom Anderson", service: "Product Photography", time: "8 hours ago", status: "completed" },
      { id: 103, type: "review", customer: "Anna Smith", service: "Maternity Photography", time: "12 hours ago", status: "4_stars" },
      { id: 104, type: "booking", customer: "Chris Lee", service: "Family Photography", time: "1 day ago", status: "in_progress" },
      { id: 105, type: "payment", customer: "Emma Wilson", service: "Baby Photography", time: "3 days ago", status: "completed" },
    ],
    Catering: [
      { id: 2, type: "payment", customer: "Mike Chen", service: "Corporate Catering", time: "5 hours ago", status: "completed" },
      { id: 5, type: "booking", customer: "Lisa Anderson", service: "Wedding Catering", time: "3 days ago", status: "completed" },
      { id: 11, type: "booking", customer: "John Smith", service: "Buffet Service", time: "1 day ago", status: "pending" },
      { id: 12, type: "review", customer: "Emma Davis", service: "Live Stalls", time: "2 days ago", status: "4_stars" },
      { id: 13, type: "payment", customer: "Robert Lee", service: "Desserts & Sweets", time: "3 days ago", status: "completed" },
      { id: 106, type: "booking", customer: "Sophie Martinez", service: "Birthday Catering", time: "1 hour ago", status: "pending" },
      { id: 107, type: "payment", customer: "Ryan Clark", service: "Anniversary Dinner", time: "7 hours ago", status: "completed" },
      { id: 108, type: "review", customer: "Maya Patel", service: "Festival Catering", time: "10 hours ago", status: "5_stars" },
      { id: 109, type: "booking", customer: "Alex Rodriguez", service: "Office Party Catering", time: "2 days ago", status: "in_progress" },
      { id: 110, type: "payment", customer: "Nina Johnson", service: "Cocktail Catering", time: "4 days ago", status: "completed" },
    ],
    Decoration: [
      { id: 3, type: "review", customer: "Emily Davis", service: "Birthday Decoration", time: "1 day ago", status: "new" },
      { id: 14, type: "booking", customer: "Sophie Brown", service: "Stage Decoration", time: "3 hours ago", status: "pending" },
      { id: 15, type: "payment", customer: "Alex Johnson", service: "Flower Decoration", time: "1 day ago", status: "completed" },
      { id: 16, type: "booking", customer: "Rachel Green", service: "Balloon Decoration", time: "2 days ago", status: "in_progress" },
      { id: 111, type: "booking", customer: "Priya Sharma", service: "Wedding Decoration", time: "30 minutes ago", status: "pending" },
      { id: 112, type: "payment", customer: "Kevin White", service: "Corporate Decoration", time: "5 hours ago", status: "completed" },
      { id: 113, type: "review", customer: "Jessica Brown", service: "Anniversary Decoration", time: "9 hours ago", status: "4_stars" },
      { id: 114, type: "booking", customer: "Mark Taylor", service: "Baby Shower Decoration", time: "1 day ago", status: "accepted" },
      { id: 115, type: "payment", customer: "Linda Garcia", service: "Engagement Decoration", time: "2 days ago", status: "completed" },
      { id: 116, type: "booking", customer: "David Miller", service: "Housewarming Decoration", time: "3 days ago", status: "in_progress" },
    ],
    DJ: [
      { id: 4, type: "booking", customer: "Robert Smith", service: "DJ Services", time: "2 days ago", status: "accepted" },
      { id: 17, type: "booking", customer: "Michael Taylor", service: "Wedding DJ", time: "5 hours ago", status: "pending" },
      { id: 18, type: "payment", customer: "Jennifer White", service: "Club DJ", time: "1 day ago", status: "completed" },
      { id: 19, type: "review", customer: "Chris Wilson", service: "Corporate Events DJ", time: "3 days ago", status: "5_stars" },
      { id: 117, type: "booking", customer: "Amanda Jones", service: "Birthday Party DJ", time: "2 hours ago", status: "pending" },
      { id: 118, type: "payment", customer: "Carlos Rodriguez", service: "School Dance DJ", time: "6 hours ago", status: "completed" },
      { id: 119, type: "review", customer: "Rachel Adams", service: "New Year DJ", time: "11 hours ago", status: "5_stars" },
      { id: 120, type: "booking", customer: "Steve Johnson", service: "Pool Party DJ", time: "1 day ago", status: "in_progress" },
      { id: 121, type: "payment", customer: "Monica Davis", service: "Sangeet DJ", time: "2 days ago", status: "completed" },
      { id: 122, type: "booking", customer: "Tyler Brown", service: "Festival DJ", time: "4 days ago", status: "accepted" },
    ],
    "Event Manager": [
      { id: 20, type: "booking", customer: "Patricia Miller", service: "Wedding Management", time: "1 hour ago", status: "pending" },
      { id: 21, type: "payment", customer: "Daniel Garcia", service: "Corporate Event", time: "4 hours ago", status: "completed" },
      { id: 22, type: "booking", customer: "Linda Martinez", service: "Birthday Party", time: "1 day ago", status: "in_progress" },
      { id: 123, type: "booking", customer: "Sarah Wilson", service: "Conference Planning", time: "45 minutes ago", status: "pending" },
      { id: 124, type: "payment", customer: "James Anderson", service: "Product Launch", time: "3 hours ago", status: "completed" },
      { id: 125, type: "review", customer: "Michelle Lee", service: "Award Ceremony", time: "8 hours ago", status: "4_stars" },
      { id: 126, type: "booking", customer: "Robert Chen", service: "Charity Event", time: "1 day ago", status: "accepted" },
      { id: 127, type: "payment", customer: "Lisa Thompson", service: "Fashion Show", time: "2 days ago", status: "completed" },
      { id: 128, type: "booking", customer: "Kevin Martinez", service: "Cultural Festival", time: "3 days ago", status: "in_progress" },
      { id: 129, type: "review", customer: "Diana Rodriguez", service: "Graduation Ceremony", time: "5 days ago", status: "5_stars" },
    ],
    Transportation: [
      { id: 23, type: "booking", customer: "Kevin Anderson", service: "Car Rental", time: "3 hours ago", status: "pending" },
      { id: 24, type: "payment", customer: "Nancy Thomas", service: "Luxury Vehicles", time: "6 hours ago", status: "completed" },
      { id: 25, type: "booking", customer: "Steven Clark", service: "Bus/Tempo Traveller", time: "2 days ago", status: "accepted" },
      { id: 130, type: "booking", customer: "Maria Santos", service: "Wedding Transport", time: "1 hour ago", status: "pending" },
      { id: 131, type: "payment", customer: "John Davis", service: "Airport Transfer", time: "4 hours ago", status: "completed" },
      { id: 132, type: "review", customer: "Ashley Garcia", service: "Party Bus", time: "7 hours ago", status: "5_stars" },
      { id: 133, type: "booking", customer: "Brian Wilson", service: "Corporate Shuttle", time: "1 day ago", status: "in_progress" },
      { id: 134, type: "payment", customer: "Jennifer Lee", service: "VIP Transport", time: "2 days ago", status: "completed" },
      { id: 135, type: "booking", customer: "Michael Brown", service: "Group Transport", time: "3 days ago", status: "accepted" },
      { id: 136, type: "review", customer: "Laura Martinez", service: "Event Shuttle", time: "4 days ago", status: "4_stars" },
    ],
    Florist: [
      { id: 26, type: "booking", customer: "Michelle Lewis", service: "Wedding Flowers", time: "2 hours ago", status: "pending" },
      { id: 27, type: "payment", customer: "Paul Walker", service: "Bouquets", time: "5 hours ago", status: "completed" },
      { id: 28, type: "review", customer: "Carol Hall", service: "Stage Floral Decoration", time: "1 day ago", status: "5_stars" },
      { id: 137, type: "booking", customer: "Emma Thompson", service: "Corporate Arrangements", time: "90 minutes ago", status: "pending" },
      { id: 138, type: "payment", customer: "Daniel Kim", service: "Anniversary Flowers", time: "4 hours ago", status: "completed" },
      { id: 139, type: "review", customer: "Sophia Rodriguez", service: "Birthday Flowers", time: "9 hours ago", status: "4_stars" },
      { id: 140, type: "booking", customer: "Oliver Johnson", service: "Funeral Arrangements", time: "1 day ago", status: "accepted" },
      { id: 141, type: "payment", customer: "Isabella Davis", service: "Valentine Bouquets", time: "2 days ago", status: "completed" },
      { id: 142, type: "booking", customer: "Lucas Wilson", service: "Car Decoration", time: "3 days ago", status: "in_progress" },
      { id: 143, type: "review", customer: "Mia Garcia", service: "Temple Flowers", time: "5 days ago", status: "5_stars" },
    ],
    Baker: [
      { id: 29, type: "booking", customer: "Sandra Young", service: "Wedding Cake", time: "1 hour ago", status: "pending" },
      { id: 30, type: "payment", customer: "Mark Allen", service: "Custom Desserts", time: "4 hours ago", status: "completed" },
      { id: 31, type: "booking", customer: "Betty King", service: "Cupcakes", time: "2 days ago", status: "in_progress" },
      { id: 144, type: "booking", customer: "Charlotte Brown", service: "Birthday Cake", time: "2 hours ago", status: "pending" },
      { id: 145, type: "payment", customer: "Henry Martinez", service: "Anniversary Cake", time: "5 hours ago", status: "completed" },
      { id: 146, type: "review", customer: "Amelia Wilson", service: "Baby Shower Treats", time: "8 hours ago", status: "5_stars" },
      { id: 147, type: "booking", customer: "William Garcia", service: "Corporate Desserts", time: "1 day ago", status: "accepted" },
      { id: 148, type: "payment", customer: "Harper Davis", service: "Graduation Cake", time: "2 days ago", status: "completed" },
      { id: 149, type: "booking", customer: "Benjamin Lee", service: "Festival Sweets", time: "3 days ago", status: "in_progress" },
      { id: 150, type: "review", customer: "Evelyn Rodriguez", service: "Engagement Cake", time: "4 days ago", status: "4_stars" },
    ],
    Videography: [
      { id: 32, type: "booking", customer: "Donald Wright", service: "Cinematic Videography", time: "3 hours ago", status: "pending" },
      { id: 33, type: "payment", customer: "Helen Lopez", service: "Traditional Videography", time: "1 day ago", status: "completed" },
      { id: 34, type: "review", customer: "Jason Hill", service: "Drone Videography", time: "2 days ago", status: "4_stars" },
      { id: 151, type: "booking", customer: "Alexander Johnson", service: "Wedding Videography", time: "1 hour ago", status: "pending" },
      { id: 152, type: "payment", customer: "Victoria Smith", service: "Corporate Video", time: "6 hours ago", status: "completed" },
      { id: 153, type: "review", customer: "Sebastian Brown", service: "Event Documentation", time: "10 hours ago", status: "5_stars" },
      { id: 154, type: "booking", customer: "Scarlett Davis", service: "Music Video", time: "1 day ago", status: "in_progress" },
      { id: 155, type: "payment", customer: "Jackson Wilson", service: "Product Video", time: "2 days ago", status: "completed" },
      { id: 156, type: "booking", customer: "Madison Garcia", service: "Training Video", time: "3 days ago", status: "accepted" },
      { id: 157, type: "review", customer: "Aiden Martinez", service: "Live Stream", time: "5 days ago", status: "4_stars" },
    ],
    "Makeup Artist": [
      { id: 8, type: "review", customer: "Grace Wilson", service: "Bridal Makeup", time: "8 hours ago", status: "5_stars" },
      { id: 35, type: "booking", customer: "Ashley Scott", service: "Party Makeup", time: "2 hours ago", status: "pending" },
      { id: 36, type: "payment", customer: "Kimberly Green", service: "Photoshoot Makeup", time: "1 day ago", status: "completed" },
      { id: 158, type: "booking", customer: "Layla Thompson", service: "Special Event Makeup", time: "3 hours ago", status: "pending" },
      { id: 159, type: "payment", customer: "Elijah Rodriguez", service: "Fashion Show Makeup", time: "7 hours ago", status: "completed" },
      { id: 160, type: "review", customer: "Aria Johnson", service: "Group Makeup", time: "12 hours ago", status: "4_stars" },
      { id: 161, type: "booking", customer: "Carter Davis", service: "Corporate Makeup", time: "1 day ago", status: "accepted" },
      { id: 162, type: "payment", customer: "Luna Wilson", service: "TV Commercial Makeup", time: "2 days ago", status: "completed" },
      { id: 163, type: "booking", customer: "Grayson Garcia", service: "Festival Makeup", time: "3 days ago", status: "in_progress" },
      { id: 164, type: "review", customer: "Nova Martinez", service: "Portfolio Makeup", time: "4 days ago", status: "5_stars" },
    ],
    "Hair Stylist": [
      { id: 37, type: "booking", customer: "Donna Adams", service: "Bridal Hairstyle", time: "1 hour ago", status: "pending" },
      { id: 38, type: "payment", customer: "Ryan Baker", service: "Fashion/Runway", time: "5 hours ago", status: "completed" },
      { id: 39, type: "booking", customer: "Julie Nelson", service: "Casual Hairstyle", time: "2 days ago", status: "accepted" },
      { id: 165, type: "booking", customer: "Hazel Brown", service: "Party Hair", time: "2 hours ago", status: "pending" },
      { id: 166, type: "payment", customer: "Axel Johnson", service: "Photoshoot Styling", time: "6 hours ago", status: "completed" },
      { id: 167, type: "review", customer: "Violet Davis", service: "Special Event Hair", time: "9 hours ago", status: "5_stars" },
      { id: 168, type: "booking", customer: "Maverick Wilson", service: "Bridal Party Hair", time: "1 day ago", status: "in_progress" },
      { id: 169, type: "payment", customer: "Aurora Garcia", service: "Corporate Styling", time: "2 days ago", status: "completed" },
      { id: 170, type: "booking", customer: "Knox Martinez", service: "Fashion Editorial", time: "3 days ago", status: "accepted" },
      { id: 171, type: "review", customer: "Isla Rodriguez", service: "Award Show Styling", time: "5 days ago", status: "4_stars" },
    ],
    "Fashion Designer": [
      { id: 40, type: "booking", customer: "Amy Carter", service: "Bridal Wear", time: "2 hours ago", status: "pending" },
      { id: 41, type: "payment", customer: "Brian Mitchell", service: "Custom Designs", time: "1 day ago", status: "completed" },
      { id: 42, type: "review", customer: "Nicole Perez", service: "Party Wear", time: "3 days ago", status: "5_stars" },
      { id: 172, type: "booking", customer: "Sage Thompson", service: "Evening Gown", time: "4 hours ago", status: "pending" },
      { id: 173, type: "payment", customer: "Phoenix Johnson", service: "Bridesmaid Dresses", time: "8 hours ago", status: "completed" },
      { id: 174, type: "review", customer: "River Davis", service: "Cocktail Dress", time: "11 hours ago", status: "4_stars" },
      { id: 175, type: "booking", customer: "Sage Wilson", service: "Corporate Uniform", time: "1 day ago", status: "accepted" },
      { id: 176, type: "payment", customer: "Rowan Garcia", service: "Festival Collection", time: "2 days ago", status: "completed" },
      { id: 177, type: "booking", customer: "Aspen Martinez", service: "Men's Sherwani", time: "3 days ago", status: "in_progress" },
      { id: 178, type: "review", customer: "Wren Rodriguez", service: "Kids Party Wear", time: "4 days ago", status: "5_stars" },
    ],
    "Gift Services": [
      { id: 43, type: "booking", customer: "Gregory Roberts", service: "Return Gifts", time: "4 hours ago", status: "pending" },
      { id: 44, type: "payment", customer: "Cynthia Turner", service: "Gift Hampers", time: "1 day ago", status: "completed" },
      { id: 45, type: "booking", customer: "Jeremy Phillips", service: "Custom Gifts", time: "2 days ago", status: "in_progress" },
      { id: 179, type: "booking", customer: "Ember Brown", service: "Wedding Favors", time: "1 hour ago", status: "pending" },
      { id: 180, type: "payment", customer: "Atlas Johnson", service: "Corporate Gifts", time: "5 hours ago", status: "completed" },
      { id: 181, type: "review", customer: "Ivy Davis", service: "Baby Shower Gifts", time: "7 hours ago", status: "5_stars" },
      { id: 182, type: "booking", customer: "Orion Wilson", service: "Anniversary Gifts", time: "1 day ago", status: "accepted" },
      { id: 183, type: "payment", customer: "Sage Garcia", service: "Holiday Gifts", time: "2 days ago", status: "completed" },
      { id: 184, type: "booking", customer: "Luna Martinez", service: "Graduation Gifts", time: "3 days ago", status: "in_progress" },
      { id: 185, type: "review", customer: "Nova Rodriguez", service: "Retirement Gifts", time: "5 days ago", status: "4_stars" },
    ],
    Entertainment: [
      { id: 46, type: "booking", customer: "Samantha Campbell", service: "Live Band", time: "1 hour ago", status: "pending" },
      { id: 47, type: "payment", customer: "Arthur Parker", service: "Dance Troupe", time: "6 hours ago", status: "completed" },
      { id: 48, type: "review", customer: "Deborah Evans", service: "Stand-up Comedy", time: "2 days ago", status: "4_stars" },
      { id: 186, type: "booking", customer: "Zara Thompson", service: "Magician", time: "3 hours ago", status: "pending" },
      { id: 187, type: "payment", customer: "Kai Johnson", service: "String Quartet", time: "7 hours ago", status: "completed" },
      { id: 188, type: "review", customer: "Aria Davis", service: "Folk Dancers", time: "10 hours ago", status: "5_stars" },
      { id: 189, type: "booking", customer: "Leo Wilson", service: "Jazz Band", time: "1 day ago", status: "in_progress" },
      { id: 190, type: "payment", customer: "Maya Garcia", service: "Karaoke Host", time: "2 days ago", status: "completed" },
      { id: 191, type: "booking", customer: "Ezra Martinez", service: "Acoustic Performance", time: "3 days ago", status: "accepted" },
      { id: 192, type: "review", customer: "Nora Rodriguez", service: "Classical Concert", time: "4 days ago", status: "4_stars" },
    ],
    Lighting: [
      { id: 49, type: "booking", customer: "Joshua Edwards", service: "Stage Lighting", time: "3 hours ago", status: "pending" },
      { id: 50, type: "payment", customer: "Stephanie Collins", service: "Ambient Lighting", time: "1 day ago", status: "completed" },
      { id: 51, type: "booking", customer: "Brandon Stewart", service: "DJ Lighting", time: "2 days ago", status: "accepted" },
      { id: 193, type: "booking", customer: "Cleo Brown", service: "Wedding Lighting", time: "2 hours ago", status: "pending" },
      { id: 194, type: "payment", customer: "Felix Johnson", service: "Corporate Lighting", time: "4 hours ago", status: "completed" },
      { id: 195, type: "review", customer: "Iris Davis", service: "Party Lighting", time: "8 hours ago", status: "5_stars" },
      { id: 196, type: "booking", customer: "Jude Wilson", service: "Architectural Lighting", time: "1 day ago", status: "in_progress" },
      { id: 197, type: "payment", customer: "Ruby Garcia", service: "Festival Lighting", time: "2 days ago", status: "completed" },
      { id: 198, type: "booking", customer: "Milo Martinez", service: "Concert Lighting", time: "3 days ago", status: "accepted" },
      { id: 199, type: "review", customer: "Skye Rodriguez", service: "Event Lighting", time: "5 days ago", status: "4_stars" },
    ]
  };
  
  return activityByCategory[category as keyof typeof activityByCategory] || [];
};

const revenueData = [
  { month: 'Jul', revenue: 14200, bookings: 28, completed: 25 },
  { month: 'Aug', revenue: 18500, bookings: 32, completed: 29 },
  { month: 'Sep', revenue: 16200, bookings: 35, completed: 33 },
  { month: 'Oct', revenue: 22100, bookings: 38, completed: 35 },
  { month: 'Nov', revenue: 19800, bookings: 42, completed: 39 },
  { month: 'Dec', revenue: 23800, bookings: 45, completed: 42 },
];

const paymentData = [
  { name: 'Completed', value: 78, color: '#10b981' },
  { name: 'Pending', value: 15, color: '#f59e0b' },
  { name: 'Overdue', value: 7, color: '#ef4444' },
];

const bookedDates = [3, 5, 8, 12, 15, 18, 20, 22, 25, 28, 30]; // Example booked dates

const quickActions = [
  { label: "Add New Service", icon: Plus, color: "bg-primary" },
  { label: "Update Availability", icon: Clock, color: "bg-secondary" },
  { label: "Respond to Requests", icon: MessageSquare, color: "bg-accent" },
];

const Home = () => {
  const navigate = useNavigate();
  const [currentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>("pending");

  const [dashboardStats, setDashboardStats] = useState({
    total_revenue: 23800,
    total_bookings: 45,
    pending_bookings: 8,
    in_progress_bookings: 12,
    completed_bookings: 25
  });
  const [loading, setLoading] = useState(true);
  
  // Get vendor category from localStorage
  const vendorData = JSON.parse(localStorage.getItem("vendorOnboarding") || "{}");
  const vendorCategory = vendorData.business || "Photography";
  const recentActivity = getRecentActivityForCategory(vendorCategory);

  useEffect(() => {
    const fetchData = async () => {
      const status = getVerificationStatus();
      setVerificationStatus(status);
      
      // Check if login is in progress
      const isLoginLoading = localStorage.getItem('loginLoading');
      

      
      // Use mock dashboard stats (API call disabled for demo)
      // const statsResult = await apiService.getDashboardStats();
      // if (statsResult.data) {
      //   setDashboardStats(statsResult.data);
      // }
      
      setLoading(false);
    };
    
    // Listen for verification status changes
    const handleVerificationStatusChanged = () => {
      const newStatus = getVerificationStatus();
      setVerificationStatus(newStatus);
    };
    
    window.addEventListener('verificationStatusChanged', handleVerificationStatusChanged);
    
    fetchData();
    
    return () => {
      window.removeEventListener('verificationStatusChanged', handleVerificationStatusChanged);
    };
  }, []);

  const statsCards = getStatsCards(dashboardStats);

  const verificationDisplay = getVerificationStatusDisplay(verificationStatus);
  
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };
  
  const isBooked = (day) => bookedDates.includes(day);
  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() && 
           currentDate.getMonth() === today.getMonth() && 
           currentDate.getFullYear() === today.getFullYear();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 space-y-6 animate-fade-in">
      
      {/* Welcome Card */}
      <Card className="bg-gradient-to-r from-indigo-800 via-purple-800 to-pink-800 border-none shadow-xl">
        <CardContent className="p-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Welcome back, {vendorData.fullName || 'Vendor'}! 👋
            </h2>
            <p className="text-blue-100 mb-4">
              Ready to manage your {vendorCategory.toLowerCase()} business today?
            </p>
            <div className="flex gap-3">
              <Button 
                onClick={() => navigate("/dashboard/services")}
                className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Service
              </Button>
              <Button 
                onClick={() => navigate("/dashboard/bookings")}
                className="bg-white/20 text-white border-white/30 hover:bg-white/30 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                variant="outline"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Update Bookings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-200 bg-white/80 backdrop-blur-sm">
              <div className={`h-2 bg-gradient-to-r ${stat.gradient}`} />
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                  {stat.title}
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.gradient}`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Row 2: Recent Activity + Mini Calendar & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="shadow-lg lg:col-span-2 bg-white/80 backdrop-blur-sm border-none">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-slate-50/80 hover:bg-slate-100/80 transition-colors border border-slate-200/50"
                >
                  <div className="flex-1">
                    <p className="font-medium">{activity.customer}</p>
                    <p className="text-sm text-muted-foreground">{activity.service}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">{activity.time}</span>
                    <Badge
                      variant={
                        activity.status === "completed"
                          ? "default"
                          : activity.status === "pending"
                          ? "secondary"
                          : "outline"
                      }
                      className={
                        activity.status === "completed"
                          ? "bg-success text-success-foreground"
                          : activity.status === "pending"
                          ? "bg-warning text-warning-foreground"
                          : "bg-primary text-primary-foreground"
                      }
                    >
                      {activity.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Mini Calendar & Quick Actions */}
        <div className="space-y-4">
          {/* Mini Calendar */}
          <Card className="shadow-lg bg-white/80 backdrop-blur-sm border-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                  <div key={day} className="font-medium text-muted-foreground p-1">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {getDaysInMonth().map((day, index) => (
                  <div
                    key={index}
                    className={`
                      h-8 w-8 flex items-center justify-center text-sm rounded cursor-pointer transition-colors
                      ${!day ? '' : 
                        isToday(day) ? 'bg-primary text-primary-foreground font-bold' :
                        isBooked(day) ? 'bg-accent text-accent-foreground font-medium' :
                        'hover:bg-muted'
                      }
                    `}
                    onClick={() => day && setSelectedDate(day)}
                  >
                    {day}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-3 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-accent rounded"></div>
                  <span>Booked</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-primary rounded"></div>
                  <span>Today</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="shadow-lg bg-white/80 backdrop-blur-sm border-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                const handleClick = (e) => {
                  e.currentTarget.style.transform = 'scale(0.95)';
                  e.currentTarget.style.opacity = '0.8';
                  
                  setTimeout(() => {
                    if (action.label === "Add New Service") {
                      navigate("/dashboard/services");
                    } else if (action.label === "Update Availability") {
                      navigate("/dashboard/calendar");
                    } else if (action.label === "Respond to Requests") {
                      navigate("/dashboard/bookings");
                    }
                  }, 150);
                };
                return (
                  <Button
                    key={action.label}
                    variant="outline"
                    className="w-full justify-start h-auto p-3 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all duration-200"
                    onClick={handleClick}
                  >
                    <div className={`p-2 rounded-lg ${action.color} mr-3`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm">{action.label}</span>
                  </Button>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Row 3: Financial Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card className="shadow-lg bg-white/80 backdrop-blur-sm border-none">
          <CardHeader>
            <CardTitle className="text-center">Monthly Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="w-full">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      formatter={(value) => [`₹${value}`, 'Revenue']}
                      labelStyle={{ color: '#000' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#8b5cf6" 
                      fill="url(#colorRevenue)"
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Status */}
        <Card className="shadow-lg bg-white/80 backdrop-blur-sm border-none">
          <CardHeader>
            <CardTitle className="text-center">Payment Status</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="flex items-center gap-4">
              <div className="h-32 w-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={25}
                      outerRadius={50}
                      dataKey="value"
                    >
                      {paymentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {paymentData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-sm">{item.name}: {item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;
