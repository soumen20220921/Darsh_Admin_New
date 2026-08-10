import React, { useState, useEffect } from "react";
import { useAppContext } from "../../context/Context";
import axios from "axios";
import {
  Search,
  Calendar,
  Clock,
  User,
  Phone,
  IndianRupee,
  CheckCircle,
  XCircle,
  ChevronDown,
  Eye,
  Filter,
  Grid,
  List,
  X,
  AlertCircle,
  Mail,
  ArrowLeft,
  Star,
  MapPin,
  Briefcase,
  GraduationCap,
  ChevronUp,
  ChevronRight,
  RefreshCw,
  Download,
  MoreVertical,
  Sparkles,
  Zap,
  TrendingUp,
  Users,
  DollarSign,
  FileText,
  MessageCircle,
  Send,
  Copy,
  Shield,
  BadgeCheck,
  Heart,
  Activity,
  ArrowUpRight,
  PlayCircle,
  CheckCircle2,
  CalendarDays,
  History,
  AlertTriangle,
} from "lucide-react";

const Booking = () => {
  const { url } = useAppContext();
  const [bookings, setBookings] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [mobileView, setMobileView] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [refreshPulse, setRefreshPulse] = useState(false);
  const [activeTab, setActiveTab] = useState("upcoming"); // Default to upcoming tab
  const [notification, setNotification] = useState(null);
  const [copiedField, setCopiedField] = useState("");

  // Enhanced notification system
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    showNotification("success", `${field} copied to clipboard!`);
    setTimeout(() => setCopiedField(""), 2000);
  };

  useEffect(() => {
    const pulseInterval = setInterval(() => {
      setRefreshPulse(true);
      setTimeout(() => setRefreshPulse(false), 1000);
    }, 30000);

    return () => clearInterval(pulseInterval);
  }, []);

  useEffect(() => {
    const checkScreenSize = () => {
      setMobileView(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setViewMode("list");
        setShowStats(false);
      } else {
        setShowStats(true);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchBookings(), fetchDoctors()]);
    } catch (error) {
      setError("Failed to load initial data");
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      setError("");
      const response = await axios.get(`${url}/api/booking/allbookings`);
      
      if (response.data.success) {
        const transformedBookings = response.data.allOrders.map(booking => ({
          _id: booking._id,
          userId: booking.userId,
          doctorId: booking.doctorId?._id || booking.doctorId,
          FullName: booking.FullName || "N/A",
          Phone: booking.Phone || "N/A",
          Date: booking.Date ? new Date(booking.Date).toISOString().split('T')[0] : "N/A",
          Time: booking.Time || "N/A",
          Half: booking.Half || "AM",
          Email: booking.Email || "Not provided",
          amount: booking.amount || 0,
          payStatus: booking.payStatus || "pending",
          patientAge: booking.Age || booking.patientAge || "Not specified",
          patientGender: booking.Gender || booking.patientGender || "Not specified",
          appointmentType: booking.appointmentType || "Consultation",
          createdAt: booking.createdAt,
          doctorData: booking.doctorId || null
        }));
        
        setBookings(transformedBookings);
      } else {
        setError("Failed to fetch bookings");
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setError("Failed to load bookings. Please try again.");
      setBookings([]);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await axios.get(`${url}/api/doctor/all`);
      if (response.data.success) {
        setDoctors(response.data.doctors || []);
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchBookings(), fetchDoctors()]);
      showNotification("success", "Data refreshed successfully!");
      setTimeout(() => setRefreshing(false), 1000);
    } catch (error) {
      setError("Failed to refresh data");
      setRefreshing(false);
    }
  };

  // Get upcoming appointments (today and future dates)
  const getUpcomingAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    return bookings.filter(booking => {
      if (booking.Date === "N/A" || !booking.Date) return false;
      
      const appointmentDate = booking.Date;
      const isTodayOrFuture = appointmentDate >= today;
      const isPaidOrConfirmed = booking.payStatus === "paid" || booking.payStatus === "confirmed";
      
      return isTodayOrFuture && isPaidOrConfirmed;
    }).sort((a, b) => new Date(a.Date) - new Date(b.Date)); // Sort by date ascending
  };

  // Get today's appointments
  const getTodayAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    return bookings.filter(booking => 
      booking.Date === today && 
      (booking.payStatus === "paid" || booking.payStatus === "confirmed")
    ).sort((a, b) => {
      // Sort by time
      const timeA = `${a.Time} ${a.Half}`;
      const timeB = `${b.Time} ${b.Half}`;
      return timeA.localeCompare(timeB);
    });
  };

  // Get completed appointments (past dates)
  const getCompletedAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    return bookings.filter(booking => {
      if (booking.Date === "N/A" || !booking.Date) return false;
      
      const appointmentDate = booking.Date;
      const isPast = appointmentDate < today;
      const isPaidOrConfirmed = booking.payStatus === "paid" || booking.payStatus === "confirmed";
      
      return isPast && isPaidOrConfirmed;
    }).sort((a, b) => new Date(b.Date) - new Date(a.Date)); // Sort by date descending (most recent first)
  };

  // Get pending payments
  const getPendingPayments = () => {
    return bookings.filter(booking => 
      booking.payStatus === "Not Paid" || booking.payStatus === "pending"
    );
  };

  // Get all appointments for the "all" tab
  const getAllAppointments = () => {
    return bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort by creation date
  };

  // Get appointments based on active tab
  const getFilteredAppointments = () => {
    switch (activeTab) {
      case "upcoming":
        return getUpcomingAppointments();
      case "today":
        return getTodayAppointments();
      case "completed":
        return getCompletedAppointments();
      case "pending":
        return getPendingPayments();
      case "all":
        return getAllAppointments();
      default:
        return getAllAppointments();
    }
  };

  const exportBookings = async () => {
    setExporting(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      const appointmentsToExport = getFilteredAppointments();
      const data = appointmentsToExport.map(booking => {
        const doctorDetails = getDoctorDetails(booking);
        return {
          'Patient Name': booking.FullName,
          'Phone': booking.Phone,
          'Email': booking.Email,
          'Doctor': doctorDetails.name,
          'Specialization': doctorDetails.specialization,
          'Date': formatDate(booking.Date),
          'Time': formatTime(booking.Time, booking.Half),
          'Amount': booking.amount,
          'Status': booking.payStatus,
          'Appointment Type': booking.appointmentType,
          'Patient Age': booking.patientAge,
          'Patient Gender': booking.patientGender
        };
      });

      const csv = Object.keys(data[0]).join(',') + '\n' +
        data.map(row => Object.values(row).map(field => `"${field}"`).join(',')).join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `appointments-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      showNotification("success", "Data exported successfully!");

      setTimeout(() => setExporting(false), 500);
    } catch (error) {
      setError("Failed to export data");
      setExporting(false);
    }
  };

  const getDoctorDetails = (booking) => {
    let doctor = null;
    
    if (booking.doctorData && typeof booking.doctorData === 'object') {
      doctor = booking.doctorData;
    } else if (booking.doctorId) {
      doctor = doctors.find(d => d._id === booking.doctorId);
    } else if (booking.doctor) {
      doctor = doctors.find(d => 
        d.name?.toLowerCase().includes(booking.doctor.toLowerCase()) ||
        booking.doctor?.toLowerCase().includes(d.name?.toLowerCase())
      );
    }

    return {
      _id: doctor?._id || booking.doctorId || `temp-${booking._id}`,
      image: doctor?.image,
      name: doctor?.name || booking.doctor || "Dr. Unknown",
      specialization: doctor?.specialization || booking.specialization || "General Medicine",
      qualification: doctor?.qualification || "MBBS",
      experience: doctor?.experience || 5,
      fees: doctor?.fees || booking.amount || 500,
      description: doctor?.description || "Experienced medical professional",
      image: doctor?.image,
      rating: doctor?.rating || 4.5,
      location: doctor?.location || "Main Hospital",
      languages: doctor?.languages || ["English", "Bengali"],
      availability: doctor?.availability || "Mon-Fri, 9AM-6PM"      
    };
  };

  const getPatientEmoji = (name, gender) => {
    if (gender?.toLowerCase() === "female") return "👩";
    if (gender?.toLowerCase() === "male") return "👨";
    if (gender?.toLowerCase() === "child") return "👧";
    if (!name) return "👤";
    
    const firstLetter = name.charAt(0).toLowerCase();
    if (firstLetter >= 'a' && firstLetter <= 'm') return "👨";
    return "👩";
  };

  const getSpecialtyEmoji = (specialty) => {
    const emojiMap = {
      "cardiology": "❤️",
      "dermatology": "🔬",
      "orthopedics": "🦴",
      "pediatrics": "👶",
      "dentistry": "🦷",
      "neurology": "🧠",
      "surgery": "🔪",
      "general": "👨‍⚕️",
      "gynecology": "👩",
      "psychiatry": "🧠",
      "ophthalmology": "👁️",
      "ent": "👂",
      "gastroenterology": "🍽️"
    };
    return emojiMap[specialty?.toLowerCase()] || "👨‍⚕️";
  };

  // Apply search and additional filters to the current tab's appointments
  const filteredBookings = getFilteredAppointments().filter(booking => {
    const doctorDetails = getDoctorDetails(booking);
    const matchesSearch = 
      booking.FullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.Phone?.includes(searchTerm) ||
      booking.Email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctorDetails.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctorDetails.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || booking.payStatus === statusFilter;
    const matchesDate = !dateFilter || booking.Date === dateFilter;
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      "confirmed": { 
        color: "bg-emerald-50 text-emerald-700 border-emerald-200", 
        icon: CheckCircle,
        label: "Confirmed"
      },
      "paid": { 
        color: "bg-emerald-50 text-emerald-700 border-emerald-200", 
        icon: CheckCircle,
        label: "Paid"
      },
      "pending": { 
        color: "bg-amber-50 text-amber-700 border-amber-200", 
        icon: Clock,
        label: "Pending"
      },
      "Not Paid": { 
        color: "bg-amber-50 text-amber-700 border-amber-200", 
        icon: AlertTriangle,
        label: "Payment Pending"
      },
      "cancelled": { 
        color: "bg-red-50 text-red-700 border-red-200", 
        icon: XCircle,
        label: "Cancelled"
      }
    };
    
    const config = statusConfig[status] || { 
      color: "bg-gray-50 text-gray-700 border-gray-200", 
      icon: Clock,
      label: status 
    };
    
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${config.color}`}>
        <IconComponent className="w-3.5 h-3.5" />
        {config.label}
      </span>
    );
  };

  const getAppointmentTimelineBadge = (booking) => {
    const today = new Date().toISOString().split('T')[0];
    const isToday = booking.Date === today;
    const isUpcoming = booking.Date > today;
    const isCompleted = booking.Date < today;

    if (isToday) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border bg-blue-50 text-blue-700 border-blue-200">
          <PlayCircle className="w-3.5 h-3.5" />
          Today
        </span>
      );
    } else if (isUpcoming) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border bg-purple-50 text-purple-700 border-purple-200">
          <CalendarDays className="w-3.5 h-3.5" />
          Upcoming
        </span>
      );
    } else if (isCompleted) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border bg-green-50 text-green-700 border-green-200">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Completed
        </span>
      );
    }
    
    return getStatusBadge(booking.payStatus);
  };

  const stats = {
    total: bookings.length,
    upcoming: getUpcomingAppointments().length,
    today: getTodayAppointments().length,
    completed: getCompletedAppointments().length,
    pending: getPendingPayments().length,
    confirmed: bookings.filter(b => b.payStatus === 'confirmed' || b.payStatus === 'paid').length,
    revenue: bookings.filter(b => b.payStatus === 'confirmed' || b.payStatus === 'paid').reduce((sum, b) => sum + (b.amount || 0), 0)
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === "N/A") return "Not scheduled";
    
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (time, half) => {
    if (!time || time === "N/A") return "";
    return `${time} ${half || ''}`.trim();
  };

  const getDaysUntilAppointment = (dateString) => {
    if (!dateString || dateString === "N/A") return null;
    
    const today = new Date();
    const appointmentDate = new Date(dateString);
    const diffTime = appointmentDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays > 1) return `In ${diffDays} days`;
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
    
    return null;
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetailModal(true);
  };

  const closeModal = () => {
    setShowDetailModal(false);
    setSelectedBooking(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading appointments...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="space-y-2">
            <h1 className="text-xl lg:text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-transparent bg-clip-text">
              Appointment Management
            </h1>
            <p className="text-gray-600 text-xs md:text-sm">
              Manage and track all patient appointments in one place
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <button
              onClick={exportBookings}
              disabled={exporting || filteredBookings.length === 0}
              className={`
                relative flex items-center justify-center gap-3 px-6 py-2 rounded-2xl font-semibold
                transition-all duration-500 ease-out transform hover:scale-105 hover:shadow-2xl
                ${
                  exporting
                    ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg"
                    : filteredBookings.length === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-purple-500/25"
                }
                overflow-hidden group
              `}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

              <div className="relative flex items-center gap-3">
                {exporting ? (
                  <>
                    <div className="animate-spin">
                      <RefreshCw className="w-5 h-5" />
                    </div>
                    <span className="text-sm">Exporting...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 transition-transform group-hover:scale-110" />
                    <span className="text-sm">Export CSV</span>
                    <Sparkles className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </>
                )}
              </div>

              {!exporting && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              )}
            </button>

            <button
              onClick={refreshData}
              disabled={refreshing}
              className={`
                relative flex items-center justify-center gap-3 px-6 py-2 rounded-2xl font-semibold
                transition-all duration-500 ease-out transform hover:scale-105 hover:shadow-2xl
                ${
                  refreshing
                    ? "bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg"
                    : refreshPulse
                    ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg ring-2 ring-purple-300 ring-opacity-50"
                    : "bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700 shadow-lg hover:shadow-violet-500/25"
                }
                overflow-hidden group
              `}
            >
              {refreshPulse && !refreshing && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-2xl animate-pulse" />
              )}

              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%]" />

              <div className="relative flex items-center gap-3">
                <RefreshCw
                  className={`w-5 h-5 transition-all duration-300 ${
                    refreshing
                      ? "animate-spin"
                      : refreshPulse
                      ? "animate-bounce"
                      : "group-hover:rotate-180"
                  }`}
                />
                <span className="text-sm">
                  {refreshing
                    ? "Refreshing..."
                    : refreshPulse
                    ? "New Data!"
                    : "Refresh"}
                </span>
                {!refreshing && (
                  <Zap className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
                )}
              </div>

              <div className="absolute -top-1 -right-1">
                <div
                  className={`w-2 h-2 rounded-full ${
                    refreshing
                      ? "bg-yellow-400 animate-ping"
                      : refreshPulse
                      ? "bg-green-400 animate-pulse"
                      : "bg-green-400"
                  }`}
                />
              </div>
            </button>

            {!mobileView && (
              <div className="flex bg-white border border-gray-300 rounded-2xl p-1 shadow-inner">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-3 rounded-xl transition-all duration-300 ${
                    viewMode === "grid"
                      ? "bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 shadow-sm"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-3 rounded-xl transition-all duration-300 ${
                    viewMode === "list"
                      ? "bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 shadow-sm"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">{error}</span>
              <button
                onClick={() => setError("")}
                className="ml-auto p-1 hover:bg-red-100 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="space-y-4">
          {mobileView && (
            <div className="flex justify-center">
              <button
                onClick={() => setShowStats(!showStats)}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-purple-500/25 font-medium w-full max-w-xs justify-center transform hover:scale-105"
              >
                <span>{showStats ? "Hide Statistics" : "Show Statistics"}</span>
                {showStats ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
              </button>
            </div>
          )}

          {(showStats || !mobileView) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 transition-all duration-300 ease-in-out">
              <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Appointments
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {stats.total}
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl group-hover:from-purple-100 group-hover:to-indigo-100 transition-colors">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-gray-500">
                    All time bookings
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Upcoming
                    </p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">
                      {stats.upcoming}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
                    <CalendarDays className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                  <span className="text-xs text-gray-500">
                    Future appointments
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Completed
                    </p>
                    <p className="text-2xl font-bold text-emerald-600 mt-1">
                      {stats.completed}
                    </p>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-xl group-hover:bg-emerald-100 transition-colors">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-xs text-gray-500">
                    Past appointments
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Revenue</p>
                    <p className="text-2xl font-bold text-purple-600 mt-1">
                      ₹{stats.revenue.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl group-hover:from-purple-100 group-hover:to-violet-100 transition-colors">
                    <IndianRupee className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <IndianRupee className="w-4 h-4 text-purple-500" />
                  <span className="text-xs text-gray-500">Total earnings</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Tabs Section */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            {/* Enhanced Tabs */}
            <div className="flex overflow-x-auto space-x-1 bg-gray-100 rounded-xl p-1 scrollbar-hide w-full lg:w-auto">
              {[
                {
                  id: "upcoming",
                  label: "Upcoming",
                  count: stats.upcoming,
                  icon: CalendarDays,
                  color: "text-blue-600",
                },
                {
                  id: "today",
                  label: "Today",
                  count: stats.today,
                  icon: PlayCircle,
                  color: "text-green-600",
                },
                {
                  id: "completed",
                  label: "Completed",
                  count: stats.completed,
                  icon: CheckCircle2,
                  color: "text-emerald-600",
                },
                {
                  id: "pending",
                  label: "Pending Payment",
                  count: stats.pending,
                  icon: AlertTriangle,
                  color: "text-amber-600",
                },
                {
                  id: "all",
                  label: "All Appointments",
                  count: stats.total,
                  icon: Calendar,
                  color: "text-purple-600",
                },
              ].map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                      activeTab === tab.id
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <IconComponent
                      className={`w-4 h-4 ${
                        activeTab === tab.id ? tab.color : "text-gray-500"
                      }`}
                    />
                    <span>{tab.label}</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold ${
                        activeTab === tab.id
                          ? "bg-purple-100 text-purple-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={`Search ${activeTab} appointments...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-50/50 placeholder-gray-400 text-sm transition-all duration-300"
              />
            </div>

            {!mobileView && (
              <div className="flex gap-3">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="appearance-none pl-10 pr-8 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white w-40 text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="paid">Paid</option>
                    <option value="Not Paid">Not Paid</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                </div>

                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm"
                  />
                </div>
              </div>
            )}

            {mobileView && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-center gap-2 w-full px-4 py-1 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors font-medium"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                {showFilters ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            )}
          </div>

          {showFilters && mobileView && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3 animate-in fade-in duration-300">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none pl-10 pr-8 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white w-full text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="paid">Paid</option>
                  <option value="Not Paid">Not Paid</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white w-full text-sm"
                />
              </div>
            </div>
          )}
        </div>

        {/* Tab-specific content headers */}
        <div className="flex-wrap md:flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 capitalize">
              {activeTab === "today"
                ? "Today's Appointments"
                : activeTab === "upcoming"
                ? "Upcoming Appointments"
                : activeTab === "completed"
                ? "Completed Appointments"
                : activeTab === "pending"
                ? "Pending Payment Appointments"
                : "All Appointments"}
            </h2>
            <p className="text-xs md:text-sm text-gray-600 mt-1">
              {activeTab === "today" && "Appointments scheduled for today"}
              {activeTab === "upcoming" &&
                "Future appointments that are confirmed and paid"}
              {activeTab === "completed" &&
                "Past appointments that have been completed"}
              {activeTab === "pending" &&
                "Appointments waiting for payment confirmation"}
              {activeTab === "all" && "All appointments in the system"}
            </p>
          </div>
          <div className="flex items-center gap-2 whitespace-nowrap text-xs md:text-sm text-purple-600 font-medium">
            <div
              className={`w-2 h-2 rounded-full ${
                refreshing
                  ? "bg-yellow-400 animate-pulse"
                  : "bg-green-400 animate-pulse"
              }`}
            />
            <span>Live Data Updates</span>
          </div>
        </div>

        {/* Appointment Count */}
        <div className="flex-wrap md:flex justify-between items-center mb-6">
          <p className="text-xs md:text-sm text-gray-600">
            Showing {filteredBookings.length} of{" "}
            {getFilteredAppointments().length} {activeTab} appointments
          </p>
          {activeTab === "upcoming" && stats.today > 0 && (
            <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              <PlayCircle className="w-3 h-3" />
              <span>{stats.today} appointments today</span>
            </div>
          )}
        </div>

        {/* Appointment Cards/List */}
        {viewMode === "grid" && !mobileView ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
            {filteredBookings.map((booking) => {
              const doctorDetails = getDoctorDetails(booking);
              const daysUntil = getDaysUntilAppointment(booking.Date);

              return (
                <div
                  key={booking._id}
                  className={`bg-white rounded-2xl border shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden group ${
                    activeTab === "today"
                      ? "border-blue-200 ring-1 ring-blue-100"
                      : activeTab === "upcoming"
                      ? "border-purple-200"
                      : activeTab === "completed"
                      ? "border-green-200"
                      : activeTab === "pending"
                      ? "border-amber-200"
                      : "border-gray-200"
                  }`}
                >
                  {/* Header with status and timeline info */}
                  <div
                    className={`px-5 py-3 border-b ${
                      activeTab === "today"
                        ? "bg-blue-50 border-blue-100"
                        : activeTab === "upcoming"
                        ? "bg-purple-50 border-purple-100"
                        : activeTab === "completed"
                        ? "bg-green-50 border-green-100"
                        : activeTab === "pending"
                        ? "bg-amber-50 border-amber-100"
                        : "bg-gray-50 border-gray-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      {getAppointmentTimelineBadge(booking)}
                      {daysUntil && activeTab !== "completed" && (
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-lg ${
                            daysUntil === "Today"
                              ? "bg-blue-100 text-blue-700"
                              : daysUntil === "Tomorrow"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {daysUntil}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5">
                    {/* Patient Info */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/25">
                        {getPatientEmoji(
                          booking.FullName,
                          booking.patientGender
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 truncate text-base">
                          {booking.FullName}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex items-center gap-1.5 text-sm text-gray-500">
                            <Phone className="w-3.5 h-3.5" />
                            <span className="truncate">{booking.Phone}</span>
                          </div>
                          {booking.patientAge &&
                            booking.patientAge !== "Not specified" && (
                              <>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                                  {booking.patientAge} yrs
                                </span>
                              </>
                            )}
                        </div>
                        {booking.patientGender &&
                          booking.patientGender !== "Not specified" && (
                            <div className="text-xs text-gray-500 mt-1">
                              Gender: {booking.patientGender}
                            </div>
                          )}
                      </div>
                    </div>

                    {/* Doctor Info */}
                    <div className="mb-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white text-xs">
                            {getSpecialtyEmoji(doctorDetails.specialization)}
                          </div>
                          <span className="font-semibold text-gray-900 text-sm truncate">
                            Dr. {doctorDetails.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-gray-200 flex-shrink-0">
                          <Star className="w-3 h-3 text-amber-500 fill-current" />
                          <span className="text-xs font-semibold text-gray-700">
                            {doctorDetails.rating}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                        <Briefcase className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">
                          {doctorDetails.specialization}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 pl-5">
                        {doctorDetails.experience}+ years exp • ₹
                        {doctorDetails.fees} fee
                      </div>
                    </div>

                    {/* Date & Time */}
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-indigo-600" />
                        <span className="font-semibold text-gray-900 text-sm">
                          {formatDate(booking.Date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-indigo-600" />
                        <span className="font-semibold text-gray-900 text-sm">
                          {booking.Time} {booking.Half}
                        </span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-baseline gap-1.5">
                        <IndianRupee className="w-4 h-4 text-gray-600" />
                        <span className="text-xl font-bold text-gray-900">
                          {booking.amount || doctorDetails.fees}
                        </span>
                        <span className="text-xs text-gray-500 ml-1">fees</span>
                      </div>
                      <button
                        onClick={() => handleViewDetails(booking)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-xs hover:shadow-sm group"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="text-sm font-medium">View</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // List view implementation remains similar but enhanced for tabs
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Patient
                    </th>
                    {!mobileView && (
                      <>
                        <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Doctor
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Date & Time
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Amount
                        </th>
                      </>
                    )}
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredBookings.map((booking) => {
                    const doctorDetails = getDoctorDetails(booking);
                    const daysUntil = getDaysUntilAppointment(booking.Date);

                    return (
                      <tr
                        key={booking._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                              {getPatientEmoji(
                                booking.FullName,
                                booking.patientGender
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">
                                {booking.FullName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {booking.Phone}
                              </div>
                              <div className="text-xs text-gray-400">
                                {booking.patientAge !== "Not specified" &&
                                  `${booking.patientAge} yrs`}
                                {booking.patientAge !== "Not specified" &&
                                  booking.patientGender !== "Not specified" &&
                                  " • "}
                                {booking.patientGender !== "Not specified" &&
                                  booking.patientGender}
                              </div>
                              {mobileView && (
                                <div className="text-xs text-gray-400 mt-1">
                                  {formatDate(booking.Date)} • {booking.Time}{" "}
                                  {booking.Half}
                                  {daysUntil && (
                                    <span
                                      className={`ml-2 px-1.5 py-0.5 rounded text-xs ${
                                        daysUntil === "Today"
                                          ? "bg-blue-100 text-blue-700"
                                          : daysUntil === "Tomorrow"
                                          ? "bg-purple-100 text-purple-700"
                                          : "bg-gray-100 text-gray-700"
                                      }`}
                                    >
                                      {daysUntil}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        {!mobileView && (
                          <>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-900">
                                Dr. {doctorDetails.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {doctorDetails.specialization}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {formatDate(booking.Date)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {booking.Time} {booking.Half}
                              </div>
                              {daysUntil && (
                                <div
                                  className={`text-xs mt-1 px-2 py-1 rounded-full ${
                                    daysUntil === "Today"
                                      ? "bg-blue-100 text-blue-700"
                                      : daysUntil === "Tomorrow"
                                      ? "bg-purple-100 text-purple-700"
                                      : "bg-gray-100 text-gray-700"
                                  }`}
                                >
                                  {daysUntil}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-baseline gap-1">
                                <IndianRupee className="w-4 h-4 text-gray-600" />
                                <span className="font-bold text-gray-900">
                                  {booking.amount || doctorDetails.fees}
                                </span>
                              </div>
                            </td>
                          </>
                        )}
                        <td className="px-4 py-4 whitespace-nowrap">
                          {getAppointmentTimelineBadge(booking)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleViewDetails(booking)}
                            className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                          >
                            <Eye className="w-4 h-4" />
                            {mobileView ? "" : "View"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredBookings.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              {activeTab === "upcoming" && (
                <CalendarDays className="w-12 h-12 text-gray-400" />
              )}
              {activeTab === "today" && (
                <PlayCircle className="w-12 h-12 text-gray-400" />
              )}
              {activeTab === "completed" && (
                <CheckCircle2 className="w-12 h-12 text-gray-400" />
              )}
              {activeTab === "pending" && (
                <AlertTriangle className="w-12 h-12 text-gray-400" />
              )}
              {activeTab === "all" && (
                <Calendar className="w-12 h-12 text-gray-400" />
              )}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {activeTab === "upcoming" && "No upcoming appointments"}
              {activeTab === "today" && "No appointments today"}
              {activeTab === "completed" && "No completed appointments"}
              {activeTab === "pending" && "No pending payments"}
              {activeTab === "all" && "No appointments found"}
            </h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              {searchTerm || statusFilter !== "all" || dateFilter
                ? "No appointments match your current filters. Try adjusting your search criteria."
                : activeTab === "upcoming"
                ? "Upcoming appointments will appear here once they are scheduled and confirmed."
                : activeTab === "today"
                ? "There are no appointments scheduled for today."
                : activeTab === "completed"
                ? "Completed appointments will appear here once they are finished."
                : activeTab === "pending"
                ? "Appointments waiting for payment will appear here."
                : "You don't have any appointments scheduled yet. New appointments will appear here."}
            </p>
            {(searchTerm || statusFilter !== "all" || dateFilter) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setDateFilter("");
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/25 font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Detail Modal - Keep existing implementation */}
      {showDetailModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-full overflow-y-auto shadow-lg animate-in slide-in-from-bottom-80">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
              <div className="flex items-center gap-3">
                {mobileView && (
                  <button
                    onClick={closeModal}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-500" />
                  </button>
                )}
                <div>
                  <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
                    Appointment Details
                  </h2>
                  <p className="text-gray-600 mt-1 text-sm">
                    Complete information about the booking
                  </p>
                </div>
              </div>
              {!mobileView && (
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              )}
            </div>

            <div className="p-4 lg:p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-5 border border-blue-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                      {getPatientEmoji(
                        selectedBooking.FullName,
                        selectedBooking.patientGender
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">
                        Patient Information
                      </h3>
                      <p className="text-sm text-gray-600">Personal details</p>
                    </div>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center p-2 bg-white/50 rounded-lg">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-semibold">
                        {selectedBooking.FullName}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white/50 rounded-lg">
                      <span className="text-gray-600">Phone:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {selectedBooking.Phone}
                        </span>
                        <button
                          onClick={() =>
                            copyToClipboard(selectedBooking.Phone, "Phone")
                          }
                          className="p-1 hover:bg-blue-100 rounded transition-colors"
                        >
                          <Copy
                            className={`w-3 h-3 ${
                              copiedField === "Phone"
                                ? "text-green-500"
                                : "text-gray-400"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                    {selectedBooking.patientAge !== "Not specified" && (
                      <div className="flex justify-between items-center p-2 bg-white/50 rounded-lg">
                        <span className="text-gray-600">Age:</span>
                        <span className="font-semibold">
                          {selectedBooking.patientAge} years
                        </span>
                      </div>
                    )}
                    {selectedBooking.patientGender !== "Not specified" && (
                      <div className="flex justify-between items-center p-2 bg-white/50 rounded-lg">
                        <span className="text-gray-600">Gender:</span>
                        <span className="font-semibold">
                          {selectedBooking.patientGender}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Doctor Card */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-5 border border-green-200">
                  <div className="flex items-center sm:items-start gap-4 mb-6 flex-wrap sm:flex-nowrap">
                    {/* Doctor Image */}
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shadow-md flex-shrink-0 group">
                      <img
                        src={
                          getDoctorDetails(selectedBooking).image
                            ? `${url}/img/${
                                getDoctorDetails(selectedBooking).image._id
                              }`
                            : "https://static.vecteezy.com/system/resources/previews/028/782/024/large_2x/doctor-cartoon-character-ai-generate-free-photo.jpg"
                        }
                        alt={getDoctorDetails(selectedBooking).name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    {/* Doctor Info */}
                    <div className="flex flex-col justify-center">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                        Doctor Information
                      </h3>

                      {/* Optional specialization / title */}
                      <p className="text-sm text-gray-600">
                        Medical professional
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center p-2 bg-white/50 rounded-lg">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-semibold">
                        {getDoctorDetails(selectedBooking).name}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white/50 rounded-lg">
                      <span className="text-xs md:text-sm text-gray-600">
                        Specialization:
                      </span>
                      <span className="text-xs md:text-sm font-semibold">
                        {getDoctorDetails(selectedBooking).specialization}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white/50 rounded-lg">
                      <span className="text-gray-600">Experience:</span>
                      <span className="font-semibold">
                        {getDoctorDetails(selectedBooking).experience}+ years
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white/50 rounded-lg">
                      <span className="text-gray-600">Rating:</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-500 fill-current" />
                        <span className="font-semibold">
                          {getDoctorDetails(selectedBooking).rating}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Appointment Card */}
                <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl p-5 border border-purple-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">
                        Appointment Details
                      </h3>
                      <p className="text-sm text-gray-600">
                        Schedule information
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center p-2 bg-white/50 rounded-lg">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-semibold">
                        {formatDate(selectedBooking.Date)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white/50 rounded-lg">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-semibold">
                        {selectedBooking.Time} {selectedBooking.Half}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white/50 rounded-lg">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-semibold">
                        {selectedBooking.appointmentType}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white/50 rounded-lg">
                      <span className="text-gray-600">Status:</span>
                      {getAppointmentTimelineBadge(selectedBooking)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <IndianRupee className="w-5 h-5 text-violet-600" />
                  Payment Information
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Consultation Fee:</span>
                    <span className="font-bold text-gray-900 text-lg">
                      ₹
                      {selectedBooking.amount ||
                        getDoctorDetails(selectedBooking).fees}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-t border-gray-100">
                    <span className="text-gray-600">Payment Status:</span>
                    {getStatusBadge(selectedBooking.payStatus)}
                  </div>
                  <div className="flex justify-between items-center py-2 border-t border-gray-100">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-semibold text-gray-900">
                      {selectedBooking.payStatus === "paid" ||
                      selectedBooking.payStatus === "confirmed"
                        ? "Online Payment"
                        : "Pending Payment"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Booking;