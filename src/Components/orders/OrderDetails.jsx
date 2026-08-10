import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  MapPin,
  Loader2,
  User,
  Phone,
  Home,
  Globe,
  Flag,
  Hash,
  Info,
  Package,
  Truck,
  Clock,
  CreditCard,
  Mail,
  Calendar,
  Download,
  Share2,
  Copy,
  Eye,
  BarChart3,
  Shield,
  BadgeCheck,
  Star,
  Heart,
  TrendingUp,
  FileText,
  MessageCircle,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  MoreVertical
} from "lucide-react";
import axios from "axios";
import { useState, useRef, useEffect } from "react";
import { useAppContext } from "../../context/Context";
import html2pdf from "html2pdf.js";

const Notification = ({ type, message, onClose }) => {
  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <XCircle className="h-5 w-5 text-red-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
  };

  const colors = {
    success: "bg-gradient-to-r from-green-500 to-emerald-500",
    error: "bg-gradient-to-r from-red-500 to-pink-500",
    info: "bg-gradient-to-r from-blue-500 to-cyan-500",
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-up md:max-w-md w-[calc(100%-2rem)]">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-0 backdrop-blur-sm bg-white/95">
        <div className="p-4 flex items-center space-x-3">
          <div className="flex-shrink-0">{icons[type]}</div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">{message}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <XCircle className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
        </div>
        <div className="h-1 bg-gray-100 overflow-hidden">
          <div className={`h-1 animate-progress ${colors[type]} shadow-lg`}></div>
        </div>
      </div>
    </div>
  );
};

const OrderDetails = ({ order, onClose }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [trackingInput, setTrackingInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const [isJourneyPlaying, setIsJourneyPlaying] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { fetchOrders, url } = useAppContext();
  const invoiceRef = useRef(null);
  const [notification, setNotification] = useState(null);
  const [copiedField, setCopiedField] = useState("");
  const progressBarRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    if (!isJourneyPlaying) return;

    const interval = setInterval(() => {
      if (progressBarRef.current) {
        progressBarRef.current.style.transform = 'scaleX(1)';
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isJourneyPlaying]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest('.mobile-menu-container')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  if (!order) return null;

  const showNotification = (type, message) => {
    setNotification({ type, message });
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    showNotification("success", `${field} copied to clipboard!`);
    setTimeout(() => setCopiedField(""), 2000);
  };

  const shareOrder = async (method = 'link') => {
    const orderData = {
      id: order._id,
      customer: order.userShipping?.FullName,
      amount: order.amount,
      status: getOrderProgress().status,
      date: new Date(order.orderDate).toLocaleDateString()
    };

    const shareText = `Order #${orderData.id.slice(-8)} - ${orderData.customer} - ₹${orderData.amount} - ${orderData.status}`;
    const shareUrl = `${window.location.origin}/orders/${order._id}`;

    try {
      if (method === 'whatsapp') {
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`, '_blank');
      } else if (method === 'email') {
        window.open(`mailto:?subject=Order ${orderData.id}&body=${encodeURIComponent(shareText + '\n' + shareUrl)}`);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        showNotification("success", "Order link copied to clipboard!");
      }
    } catch (error) {
      showNotification("error", "Failed to share order");
    }
    setIsShareMenuOpen(false);
  };

  const acceptOrReject = async (id, action) => {
    setLoading(true);
    try {
      let payload = {};
      if (action === "accept")
        payload = {
          ...order,
          orderAccept: true,
          orderReject: false,
          orderDispatch: false,
        };
      else if (action === "reject")
        payload = {
          ...order,
          orderReject: true,
          orderAccept: false,
          orderDispatch: false,
        };
      else if (action === "dispatch")
        payload = { ...order, orderDispatch: true };
      else if (action === "tracking")
        payload = { ...order, trackingId: trackingInput };

      await axios.put(`${url}/api/payment/dispatch/${id}`, payload);
      fetchOrders();
      setLoading(false);
      setIsModalOpen(false);

      const messages = {
        accept: { type: "success", message: "🎉 Order Accepted Successfully!" },
        reject: { type: "error", message: "❌ Order Rejected" },
        dispatch: { type: "info", message: "🚚 Order Dispatched to Shipping" },
        tracking: { type: "success", message: `📦 Tracking ID Added: ${trackingInput}` }
      };

      showNotification(messages[action].type, messages[action].message);
      setTimeout(() => onClose(), 1500);
    } catch (error) {
      setLoading(false);
      showNotification("error", `Error: ${error.message}`);
    }
  };

  const handlePrintInvoice = () => {
    setIsPrinting(true);
    const element = invoiceRef.current;
    const customerName = order?.userShipping?.FullName || "Customer";
    const orderId = order?._id || "Invoice";

    const opt = {
      margin: [10, 10, 10, 10],
      filename: `${customerName}_invoice_${orderId}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        logging: false
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    html2pdf()
      .set(opt)
      .from(element)
      .save()
      .finally(() => {
        setIsPrinting(false);
        showNotification("success", "📄 Invoice downloaded successfully!");
      });
  };

  const subTotal = order?.orderItems?.reduce((sum, item) => sum + item.price, 0) || 0;
  const totalInvoiceValue = subTotal;

  const getOrderProgress = () => {
    if (order?.orderReject) return { stage: 0, status: "Rejected", color: "text-red-600", bg: "bg-red-100" };
    if (order?.trackingId) return { stage: 4, status: "Delivered", color: "text-green-600", bg: "bg-green-100" };
    if (order?.orderDispatch) return { stage: 3, status: "Dispatched", color: "text-indigo-600", bg: "bg-indigo-100" };
    if (order?.orderAccept) return { stage: 2, status: "Accepted", color: "text-blue-600", bg: "bg-blue-100" };
    return { stage: 1, status: "Processing", color: "text-yellow-600", bg: "bg-yellow-100" };
  };

  const progress = getOrderProgress();

  const MobileActionButtons = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-30 lg:hidden">
      <div className="flex space-x-3">
        <button
          onClick={handlePrintInvoice}
          disabled={isPrinting}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 text-sm font-medium"
        >
          {isPrinting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {isPrinting ? 'Generating...' : 'Invoice'}
        </button>
        
        <button 
          onClick={() => setIsShareMenuOpen(true)}
          className="hidden md:flex flex-1 items-center justify-center gap-2 px-4 py-3 bg-white text-gray-700 rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          <Share2 className="h-4 w-4" />
          Share
        </button>

        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex items-center justify-center px-4 py-3 bg-white text-gray-700 rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  const MobileMenu = () => (
    <div className="mobile-menu-container fixed bottom-16 left-4 right-4 bg-white rounded-2xl shadow-2xl border border-gray-200 z-40 animate-scale-in lg:hidden">
      <div className="p-3 space-y-2">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
          <BarChart3 className="h-4 w-4" />
          View Analytics
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
          <Star className="h-4 w-4" />
          Add Note
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
          <Heart className="h-4 w-4" />
          Save Customer
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors">
          <RotateCcw className="h-4 w-4" />
          Refresh Data
        </button>
      </div>
    </div>
  );

  const InvoicePreview = () => (
    <div className="bg-white rounded-2xl lg:rounded-3xl shadow-sm border border-gray-200/60 p-4 lg:p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 space-y-3 lg:space-y-0">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FileText className="h-5 w-5 text-indigo-600" />
          Invoice Preview
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Ready to download</span>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl lg:rounded-2xl p-4 lg:p-6 border border-gray-200/50">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-6 space-y-4 lg:space-y-0">
          <div>
            <h3 className="text-xl lg:text-2xl font-bold text-gray-900">INVOICE</h3>
            <p className="text-sm text-gray-600 mt-1">#{order?._id?.slice(-8).toUpperCase()}</p>
          </div>
          <div className="text-left lg:text-right">
            <p className="text-lg font-bold text-gray-900">₹{order?.amount}</p>
            <p className="text-sm text-gray-500">Total Amount</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Bill To:</h4>
            <p className="text-sm text-gray-700">{order?.userShipping?.FullName}</p>
            <p className="text-sm text-gray-600">{order?.userShipping?.Phone}</p>
            <p className="text-sm text-gray-600 line-clamp-2">{order?.userShipping?.Add}</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Order Details:</h4>
            <p className="text-sm text-gray-700">
              Date: {new Date(order.orderDate).toLocaleDateString('en-IN')}
            </p>
            <p className="text-sm text-gray-700">
              Status: <span className="font-semibold text-green-600">Paid</span>
            </p>
            <p className="text-sm text-gray-700">
              Items: {order?.orderItems?.length} products
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Subtotal</span>
            <span className="text-sm font-semibold text-gray-900">₹{subTotal}</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-600">Tax</span>
            <span className="text-sm font-semibold text-gray-900">₹0.00</span>
          </div>
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
            <span className="text-base lg:text-lg font-bold text-gray-900">Total</span>
            <span className="text-base lg:text-lg font-bold text-indigo-600">₹{totalInvoiceValue}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <button
          onClick={handlePrintInvoice}
          disabled={isPrinting}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 text-sm font-medium"
        >
          {isPrinting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {isPrinting ? 'Generating...' : 'Download PDF'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 pb-20 lg:pb-8">
      {/* Enhanced Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/60 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 lg:py-6 space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3 lg:space-x-4 w-full sm:w-auto">
              <button
                onClick={onClose}
                className="group p-2 lg:p-3 hover:bg-white rounded-xl lg:rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md border border-gray-200/50"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600 group-hover:text-gray-900 transition-colors" />
              </button>
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center space-x-2 lg:space-x-3">
                  <h1 className="text-xl lg:text-2xl xl:text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-transparent bg-clip-text truncate">
                    Order Details
                  </h1>
                  <span className="px-2 lg:px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border border-indigo-200 whitespace-nowrap">
                    #{order?._id?.slice(-8)}
                  </span>
                </div>
                <div className="flex flex-col lg:flex-row lg:items-center space-y-1 lg:space-y-0 lg:space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span className="text-xs lg:text-sm">{new Date(order.orderDate).toLocaleDateString('en-IN')}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span className="text-xs lg:text-sm">{new Date(order.orderDate).toLocaleTimeString('en-IN', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden lg:flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={handlePrintInvoice}
                disabled={isPrinting}
                className={`
                  group relative flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-semibold
                  transition-all duration-500 ease-out transform hover:scale-105 hover:shadow-2xl
                  ${isPrinting 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg' 
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-blue-500/25'
                  }
                  overflow-hidden
                `}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                
                <div className="relative flex items-center gap-2">
                  {isPrinting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 transition-transform group-hover:scale-110" />
                  )}
                  <span className="text-sm">{isPrinting ? 'Generating...' : 'Download Invoice'}</span>
                </div>
              </button>

              <div className="relative">
                <button 
                  onClick={() => setIsShareMenuOpen(!isShareMenuOpen)}
                  className="flex items-center gap-2 px-4 py-3 bg-white text-gray-700 rounded-2xl border border-gray-300 hover:bg-gray-50 transition-all duration-300 shadow-sm hover:shadow-md w-full sm:w-auto"
                >
                  <Share2 className="h-4 w-4" />
                  <span className="text-sm">Share</span>
                  <ChevronRight className={`h-4 w-4 transition-transform ${isShareMenuOpen ? 'rotate-90' : ''}`} />
                </button>

                {isShareMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-200/60 backdrop-blur-sm z-50 animate-scale-in">
                    <div className="p-2">
                      <button
                        onClick={() => shareOrder('link')}
                        className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                      >
                        <Copy className="h-4 w-4 text-gray-400" />
                        Copy Order Link
                      </button>
                      <button
                        onClick={() => shareOrder('whatsapp')}
                        className="flex whitespace-nowrap items-center gap-3 w-full px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                      >
                        <MessageCircle className="h-4 w-4 text-green-500" />
                        Share WhatsApp
                      </button>
                      <button
                        onClick={() => shareOrder('email')}
                        className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                      >
                        <Mail className="h-4 w-4 text-blue-500" />
                        Share via Email
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 lg:mt-6">
        <div className="flex overflow-x-auto space-x-1 bg-white/80 backdrop-blur-sm rounded-xl lg:rounded-2xl p-1.5 border border-gray-200/60 shadow-sm scrollbar-hide">
          {[
            { id: "overview", label: "Overview", icon: Eye },
            { id: "products", label: "Products", icon: Package },
            { id: "customer", label: "Customer", icon: User },
            { id: "shipping", label: "Shipping", icon: Truck },
            { id: "invoice", label: "Invoice", icon: FileText },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 lg:px-4 py-2 lg:py-2.5 rounded-lg lg:rounded-xl text-xs lg:text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white"
              }`}
            >
              <tab.icon className="h-3 w-3 lg:h-4 lg:w-4" />
              <span className="hidden md:block">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 lg:mt-6">
        {activeTab === "invoice" ? (
          <InvoicePreview />
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
            <div className="xl:col-span-2 space-y-4 lg:space-y-6">
              <div className="bg-white rounded-2xl lg:rounded-3xl shadow-sm border border-gray-200/60 p-4 lg:p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 lg:mb-6 space-y-3 lg:space-y-0">
                  <h2 className="text-base lg:text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 lg:h-5 lg:w-5 text-indigo-600" />
                    Order Journey
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsJourneyPlaying(!isJourneyPlaying)}
                      className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                      {isJourneyPlaying ? (
                        <Pause className="h-4 w-4 text-gray-600" />
                      ) : (
                        <Play className="h-4 w-4 text-gray-600" />
                      )}
                    </button>
                    <span className={`px-2 lg:px-3 py-1 lg:py-1.5 text-xs lg:text-sm font-semibold rounded-full ${progress.bg} ${progress.color} border`}>
                      {progress.status}
                    </span>
                  </div>
                </div>

                <div className="relative">
                  <div className="lg:hidden">
                    <div className="flex items-center justify-between mb-4">
                      {[
                        { stage: 1, label: "Placed", icon: Clock },
                        { stage: 2, label: "Accepted", icon: CheckCircle },
                        { stage: 3, label: "Dispatched", icon: Truck },
                        { stage: 4, label: "Delivered", icon: BadgeCheck },
                      ].map((step, index) => (
                        <div key={step.stage} className="flex flex-col items-center flex-1">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center border-2 transition-all duration-500 ${
                            progress.stage >= step.stage
                              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-transparent shadow-lg'
                              : 'bg-white border-gray-300 text-gray-400'
                          }`}>
                            <step.icon className="h-4 w-4" />
                          </div>
                          <span className="text-xs mt-1 font-medium text-center text-gray-600">
                            {step.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="hidden lg:block">
                    <div className="flex justify-between mb-3 relative">
                      {[
                        { stage: 1, label: "Placed", icon: Clock, description: "Order received" },
                        { stage: 2, label: "Accepted", icon: CheckCircle, description: "Order confirmed" },
                        { stage: 3, label: "Dispatched", icon: Truck, description: "Shipped out" },
                        { stage: 4, label: "Delivered", icon: BadgeCheck, description: "Delivery completed" },
                      ].map((step, index) => (
                        <div key={step.stage} className="flex flex-col items-center flex-1 relative">
                          {index < 3 && (
                            <div className={`absolute top-5 left-1/2 w-full h-0.5 -z-10 ${
                              progress.stage > step.stage 
                                ? 'bg-gradient-to-r from-indigo-500 to-purple-500' 
                                : 'bg-gray-200'
                            }`}>
                              {progress.stage === step.stage && isJourneyPlaying && (
                                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3">
                                  <div className="w-3 h-3 bg-indigo-500 rotate-45 transform origin-center animate-pulse"></div>
                                </div>
                              )}
                            </div>
                          )}
                          
                          <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl flex items-center justify-center border-2 transition-all duration-500 transform ${
                            progress.stage >= step.stage
                              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-transparent shadow-lg scale-110'
                              : progress.stage === step.stage - 0.5
                              ? 'bg-indigo-100 border-indigo-300 text-indigo-400 scale-105'
                              : 'bg-white border-gray-300 text-gray-400'
                          } ${isJourneyPlaying && progress.stage === step.stage ? 'animate-bounce' : ''}`}>
                            <step.icon className="h-5 w-5 lg:h-6 lg:w-6" />
                          </div>
                          <span className={`text-xs mt-2 lg:mt-3 font-medium text-center ${
                            progress.stage >= step.stage ? 'text-gray-900' : 'text-gray-500'
                          }`}>
                            {step.label}
                          </span>
                          <span className="text-xs text-gray-400 text-center mt-1 hidden sm:block">
                            {step.description}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden mt-4">
                      <div 
                        ref={progressBarRef}
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-2000 ease-out transform origin-left"
                        style={{ 
                          width: `${(progress.stage / 4) * 100}%`,
                          transform: `scaleX(${isJourneyPlaying ? 1 : 0.95})` 
                        }}
                      >
                        <div className="absolute top-0 left-0 w-20 h-full bg-white/30 skew-x-12 animate-shine"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 lg:mt-8 space-y-3">
                  {order?.orderDispatch ? (
                    <button
                      onClick={() => setIsModalOpen(true)}
                      disabled={loading}
                      className={`group w-full flex items-center justify-center gap-2 lg:gap-3 px-4 lg:px-6 py-3 lg:py-4 rounded-xl lg:rounded-2xl font-semibold transition-all duration-300 ${
                        loading 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-xl lg:hover:shadow-2xl hover:scale-[1.02] shadow-lg'
                      }`}
                    >
                      {loading && <Loader2 className="h-4 w-4 lg:h-5 lg:w-5 animate-spin" />}
                      <MapPin className="h-4 w-4 lg:h-5 lg:w-5" />
                      <span className="text-xs lg:text-base whitespace-nowrap">Add Tracking Information</span>
                    </button>
                  ) : order?.orderAccept ? (
                    <button
                      onClick={() => acceptOrReject(order._id, "dispatch")}
                      disabled={loading}
                      className={`group w-full flex items-center justify-center gap-2 lg:gap-3 px-4 lg:px-6 py-3 lg:py-4 rounded-xl lg:rounded-2xl font-semibold transition-all duration-300 ${
                        loading 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:shadow-xl lg:hover:shadow-2xl hover:scale-[1.02] shadow-lg'
                      }`}
                    >
                      {loading && <Loader2 className="h-4 w-4 lg:h-5 lg:w-5 animate-spin" />}
                      <Truck className="h-4 w-4 lg:h-5 lg:w-5" />
                      <span className="text-sm lg:text-base">Dispatch Order</span>
                    </button>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        onClick={() => acceptOrReject(order._id, "accept")}
                        disabled={loading}
                        className={`group flex items-center justify-center gap-2 lg:gap-3 px-4 lg:px-6 py-3 lg:py-4 rounded-xl lg:rounded-2xl font-semibold transition-all duration-300 ${
                          loading 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-xl lg:hover:shadow-2xl hover:scale-[1.02] shadow-lg'
                        }`}
                      >
                        {loading && <Loader2 className="h-4 w-4 lg:h-5 lg:w-5 animate-spin" />}
                        <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5" />
                        <span className="text-sm lg:text-base">Accept Order</span>
                      </button>
                      <button
                        onClick={() => acceptOrReject(order._id, "reject")}
                        disabled={loading}
                        className={`group flex items-center justify-center gap-2 lg:gap-3 px-4 lg:px-6 py-3 lg:py-4 rounded-xl lg:rounded-2xl font-semibold transition-all duration-300 ${
                          loading 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-red-600 to-pink-600 text-white hover:shadow-xl lg:hover:shadow-2xl hover:scale-[1.02] shadow-lg'
                        }`}
                      >
                        {loading && <Loader2 className="h-4 w-4 lg:h-5 lg:w-5 animate-spin" />}
                        <XCircle className="h-4 w-4 lg:h-5 lg:w-5" />
                        <span className="text-sm lg:text-base">Reject Order</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Products Section */}
              {(activeTab === "products" || activeTab === "overview") && (
                <div className="bg-white rounded-2xl lg:rounded-3xl shadow-sm border border-gray-200/60 p-4 lg:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 lg:mb-6 space-y-3 lg:space-y-0">
                    <h2 className="text-base lg:text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Package className="h-4 w-4 lg:h-5 lg:w-5 text-indigo-600" />
                      Order Items ({order?.orderItems?.length || 0})
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <CreditCard className="h-4 w-4" />
                      Total: <span className="font-semibold text-gray-900">₹{order?.amount}</span>
                    </div>
                  </div>

                  <div className="space-y-3 lg:space-y-4">
                    {order?.orderItems?.map((item, i) => (
                      <div
                        key={i}
                        className="group flex items-center space-x-3 lg:space-x-4 p-3 lg:p-4 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-xl lg:rounded-2xl border border-gray-200/50 hover:border-indigo-200 transition-all duration-300 hover:shadow-md"
                      >
                        <div className="relative flex-shrink-0">
                          <img
  src={
    item.imgSrc
      ? `${url}/img/${item.imgSrc}`
      : "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=150&h=150&fit=crop&crop=center"
  }
  alt={item.title}
 onClick={() =>
  setSelectedImage({
    src: item.imgSrc
      ? `${url}/img/${item.imgSrc}`
      : "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=150&h=150&fit=crop&crop=center",
    title: item.title,
  })
}
  className="h-12 w-12 lg:h-16 lg:w-16 object-cover rounded-lg lg:rounded-xl shadow-sm cursor-pointer hover:scale-105 transition-all"
/>
                          <div className="absolute -top-1 -right-1 bg-indigo-500 text-white text-xs font-bold px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-full">
                            {item.qty}
                          </div>
                          {
                            item.size && (
                              <div className="absolute -bottom-1 -right-1 bg-gray-800 text-white text-xs font-semibold px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-full">
                                {item.size}
                              </div>
                            )
                          }
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate text-sm lg:text-base group-hover:text-indigo-600 transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-xs lg:text-sm text-gray-600 mt-1">Quantity: {item.qty}</p>
                          {
                            item.size && (
                              <p className="text-xs lg:text-sm text-gray-600 mt-1">Size: {item.size}</p>
                            )
                          }
                          <div className="flex items-center gap-2 mt-1 lg:mt-2">
                            <span className="text-xs lg:text-sm font-medium text-gray-900">
                              ₹{item.price / item.qty} each
                            </span>
                            <span className="text-gray-400 hidden sm:inline">•</span>
                            <span className="text-xs lg:text-sm font-semibold text-indigo-600">
                              ₹{item.price} total
                            </span>
                          </div>
                        </div>
                        
                        <div className="text-right flex-shrink-0">
                          <div className="w-2 h-2 lg:w-3 lg:h-3 bg-green-400 rounded-full animate-pulse mb-1 lg:mb-2"></div>
                          <span className="text-xs text-gray-500">In Stock</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Summary */}
                  <div className="mt-4 lg:mt-6 pt-4 lg:pt-6 border-t border-gray-200">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-3 lg:space-y-0">
                      <div className="space-y-2">
                        <p className="text-xs lg:text-sm text-gray-600 flex items-center gap-2">
                          <CreditCard className="h-3 w-3 lg:h-4 lg:w-4" />
                          Payment Method: <span className="font-semibold text-gray-900">{order?.paymentMethod || "Online Payment"}</span>
                        </p>
                        <p className="text-xs lg:text-sm text-gray-600">
                          Payment Status: <span className={`font-semibold ${
                            order?.payStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'
                          }`}>
                            {order?.payStatus?.charAt(0).toUpperCase() + order?.payStatus?.slice(1)}
                          </span>
                        </p>
                      </div>
                      <div className="text-left lg:text-right">
                        <p className="text-base lg:text-lg font-bold text-gray-900">₹{order?.amount}</p>
                        <p className="text-xs lg:text-sm text-gray-500">Total Amount</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {(activeTab === "customer" || activeTab === "overview" || activeTab === "shipping") && (
              <div className="space-y-4 lg:space-y-6">
                <div className="bg-white rounded-2xl lg:rounded-3xl shadow-sm border border-gray-200/60 p-4 lg:p-6">
                  <div className="flex items-center gap-2 lg:gap-3 mb-4 lg:mb-6">
                    <div className="p-1.5 lg:p-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg lg:rounded-xl">
                      <User className="h-4 w-4 lg:h-5 lg:w-5 text-indigo-600" />
                    </div>
                    <h2 className="text-base lg:text-lg font-semibold text-gray-900">Customer Details</h2>
                  </div>

                  <div className="space-y-3 lg:space-y-4">
                    <div className="flex items-center justify-between p-2 lg:p-3 bg-gray-50 rounded-lg lg:rounded-xl hover:bg-gray-100 transition-colors cursor-pointer group"
                      onClick={() => copyToClipboard(order?.userShipping?.FullName, "Customer Name")}>
                      <div className="flex items-center gap-2 lg:gap-3">
                        <User className="h-3 w-3 lg:h-4 lg:w-4 text-gray-400" />
                        <span className="text-xs lg:text-sm font-medium text-gray-600">Name</span>
                      </div>
                      <div className="flex items-center gap-1 lg:gap-2">
                        <span className="text-xs lg:text-sm font-semibold text-gray-900 truncate max-w-[100px] lg:max-w-none">{order?.userShipping?.FullName}</span>
                        <Copy className={`h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity ${
                          copiedField === "Customer Name" ? 'text-green-500 opacity-100' : ''
                        }`} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2 lg:p-3 bg-gray-50 rounded-lg lg:rounded-xl hover:bg-gray-100 transition-colors cursor-pointer group"
                      onClick={() => copyToClipboard(order?.userShipping?.Phone, "Phone")}>
                      <div className="flex items-center gap-2 lg:gap-3">
                        <Phone className="h-3 w-3 lg:h-4 lg:w-4 text-gray-400" />
                        <span className="text-xs lg:text-sm font-medium text-gray-600">Phone</span>
                      </div>
                      <div className="flex items-center gap-1 lg:gap-2">
                        <span className="text-xs lg:text-sm font-semibold text-gray-900">{order?.userShipping?.Phone}</span>
                        <Copy className={`h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity ${
                          copiedField === "Phone" ? 'text-green-500 opacity-100' : ''
                        }`} />
                      </div>
                    </div>

                    {order?.userShipping?.Email && (
                      <div className="flex items-center justify-between p-2 lg:p-3 bg-gray-50 rounded-lg lg:rounded-xl hover:bg-gray-100 transition-colors cursor-pointer group"
                        onClick={() => copyToClipboard(order?.userShipping?.Email, "Email")}>
                        <div className="flex items-center gap-2 lg:gap-3">
                          <Mail className="h-3 w-3 lg:h-4 lg:w-4 text-gray-400" />
                          <span className="text-xs lg:text-sm font-medium text-gray-600">Email</span>
                        </div>
                        <div className="flex items-center gap-1 lg:gap-2">
                          <span className="text-xs lg:text-sm font-semibold text-gray-900 truncate max-w-[100px] lg:max-w-[120px]">{order?.userShipping?.Email}</span>
                          <Copy className={`h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity ${
                            copiedField === "Email" ? 'text-green-500 opacity-100' : ''
                          }`} />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between p-2 lg:p-3 bg-gray-50 rounded-lg lg:rounded-xl">
                      <div className="flex items-center gap-2 lg:gap-3">
                        <Package className="h-3 w-3 lg:h-4 lg:w-4 text-gray-400" />
                        <span className="text-xs lg:text-sm font-medium text-gray-600">Items</span>
                      </div>
                      <span className="text-xs lg:text-sm font-semibold text-gray-900">{order?.orderItems?.length}</span>
                    </div>

                    {order?.trackingId && (
                      <div className="flex items-center justify-between p-2 lg:p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg lg:rounded-xl border border-green-200">
                        <div className="flex items-center gap-2 lg:gap-3">
                          <Truck className="h-3 w-3 lg:h-4 lg:w-4 text-green-600" />
                          <span className="text-xs lg:text-sm font-medium text-green-700">Tracking ID</span>
                        </div>
                        <span className="text-xs lg:text-sm font-semibold text-green-800 truncate max-w-[100px] lg:max-w-none">{order?.trackingId}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-2xl lg:rounded-3xl shadow-sm border border-gray-200/60 p-4 lg:p-6">
                  <div className="flex items-center gap-2 lg:gap-3 mb-4 lg:mb-6">
                    <div className="p-1.5 lg:p-2 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg lg:rounded-xl">
                      <MapPin className="h-4 w-4 lg:h-5 lg:w-5 text-blue-600" />
                    </div>
                    <h2 className="text-base lg:text-lg font-semibold text-gray-900">Shipping Address</h2>
                  </div>

                  <div className="space-y-3 text-xs lg:text-sm">
                    <div className="flex items-start gap-2 lg:gap-3 p-2 lg:p-3 bg-blue-50/50 rounded-lg lg:rounded-xl">
                      <Home className="h-3 w-3 lg:h-4 lg:w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="font-medium text-gray-900 break-words">{order?.userShipping?.Add}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 lg:gap-3">
                      <div className="flex items-center gap-1 lg:gap-2 p-2 bg-gray-50 rounded-lg">
                        <MapPin className="h-3 w-3 lg:h-4 lg:w-4 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-700 truncate">{order?.userShipping?.VillorCity}</span>
                      </div>
                      <div className="flex items-center gap-1 lg:gap-2 p-2 bg-gray-50 rounded-lg">
                        <Globe className="h-3 w-3 lg:h-4 lg:w-4 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-700 truncate">{order?.userShipping?.Dist}</span>
                      </div>
                      <div className="flex items-center gap-1 lg:gap-2 p-2 bg-gray-50 rounded-lg">
                        <Flag className="h-3 w-3 lg:h-4 lg:w-4 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-700 truncate">{order?.userShipping?.State}</span>
                      </div>
                      <div className="flex items-center gap-1 lg:gap-2 p-2 bg-gray-50 rounded-lg">
                        <Hash className="h-3 w-3 lg:h-4 lg:w-4 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-700">{order?.userShipping?.Pin}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="hidden lg:block bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-2xl">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Quick Actions
                  </h3>
                  <div className="space-y-3">
                    <button className="w-full flex items-center gap-3 p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all duration-300 backdrop-blur-sm">
                      <Star className="h-4 w-4" />
                      <span className="text-sm font-medium">Add Note</span>
                    </button>
                    <button className="w-full flex items-center gap-3 p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all duration-300 backdrop-blur-sm">
                      <Heart className="h-4 w-4" />
                      <span className="text-sm font-medium">Save Customer</span>
                    </button>
                    <button className="w-full flex items-center gap-3 p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all duration-300 backdrop-blur-sm">
                      <BarChart3 className="h-4 w-4" />
                      <span className="text-sm font-medium">View Analytics</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <MobileActionButtons />
      {selectedImage && (
  <div
    className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4"
    onClick={() => setSelectedImage(null)}
  >
    <div
      className="relative bg-white rounded-2xl overflow-hidden max-w-4xl w-full"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b">
        <h2 className="text-lg font-semibold text-gray-800">
          {selectedImage.title}
        </h2>

        <button
          onClick={() => setSelectedImage(null)}
          className="text-2xl text-gray-500 hover:text-red-500"
        >
          &times;
        </button>
      </div>

      {/* Image */}
      <div className="flex justify-center bg-gray-100 p-4">
        <img
          src={selectedImage.src}
          alt={selectedImage.title}
          className="max-h-[80vh] max-w-full object-contain rounded-lg"
        />
      </div>
    </div>
  </div>
)}
      {isMobileMenuOpen && <MobileMenu />}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl lg:rounded-3xl shadow-2xl w-full max-w-md transform animate-scale-in">
            <div className="p-4 lg:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg lg:text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Truck className="h-4 w-4 lg:h-5 lg:w-5 text-purple-600" />
                  Add Tracking Information
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <XCircle className="h-4 w-4 lg:h-5 lg:w-5 text-gray-400" />
                </button>
              </div>
              
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Enter the tracking ID provided by your shipping partner. This will allow the customer to track their order.
                </p>
                
                <div className="relative">
                  <input
                    type="text"
                    value={trackingInput}
                    onChange={(e) => setTrackingInput(e.target.value)}
                    placeholder="Enter Tracking ID (e.g., TRK123456789)"
                    className="w-full pl-4 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 text-sm lg:text-base"
                  />
                  <Package className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 lg:h-5 lg:w-5" />
                </div>
                
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium text-sm lg:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => acceptOrReject(order._id, "tracking")}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium text-sm lg:text-base"
                  >
                    Save Tracking
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="hidden">
        <div ref={invoiceRef} className="p-8 font-sans text-gray-800 text-sm">
          <div className="flex justify-between items-start mb-8">
            <div className="text-left">
              <h1 className="text-3xl font-bold text-blue-800">Darsh</h1>
              <p className="text-xs mt-1">
               Nilkuthidanga, Purulia, West bengal, PIN: 723101
              </p>
              <p className="text-xs">
                Contact No: 7363054510
              </p>
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-bold text-blue-800">TAX INVOICE</h2>
              <p className="text-sm mt-2">
                <span className="font-semibold">Invoice No:</span>{" "}
                {order?._id.slice(18)}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Order ID:</span> {order?._id}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Date:</span>{" "}
                {new Date(order.orderDate).toLocaleDateString("en-GB")}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Transaction ID:</span>{" "}
                {order?.transactionId || "N/A"}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Payment Status:</span>{" "}
                {order?.payStatus}
              </p>
            </div>
          </div>

          <div className="border border-gray-300 p-4 mb-8 rounded-lg shadow-sm">
            <h3 className="font-bold text-lg text-gray-800 mb-4">
              Customer Information
            </h3>
            <div className="text-sm space-y-4">
              {/* Billing Information */}
              <div>
                <p className="font-bold text-blue-700 mb-3">
                  Billing Information
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
                  {/* Left column */}
                  <div className="space-y-2">
                    <p className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-600" />
                      <span className="font-semibold">Name:</span>&nbsp;
                      {order?.userShipping?.FullName}
                    </p>

                    <p className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-600" />
                      <span className="font-semibold">Phone:</span>&nbsp;
                      {order?.userShipping?.Phone}
                    </p>

                    <p className="flex items-center">
                      <Home className="h-4 w-4 mr-2 text-gray-600" />
                      <span className="font-semibold">Street:</span>&nbsp;
                      {order?.userShipping?.Add}
                    </p>
                  </div>

                  {/* Right column */}
                  <div className="space-y-2">
                    <p className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-gray-600" />
                      <span className="font-semibold">City/Village:</span>&nbsp;
                      {order?.userShipping?.VillorCity}
                    </p>

                    <p className="flex items-center">
                      <Globe className="h-4 w-4 mr-2 text-gray-600" />
                      <span className="font-semibold">District:</span>&nbsp;
                      {order?.userShipping?.Dist}
                    </p>

                    <p className="flex items-center">
                      <Flag className="h-4 w-4 mr-2 text-gray-600" />
                      <span className="font-semibold">State:</span>&nbsp;
                      {order?.userShipping?.State}
                    </p>

                    <p className="flex items-center">
                      <Hash className="h-4 w-4 mr-2 text-gray-600" />
                      <span className="font-semibold">PIN:</span>&nbsp;
                      {order?.userShipping?.Pin}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Table */}
          <table className="w-full text-left border-collapse mb-8">
            <thead>
              <tr className="bg-gray-100 border-b border-t border-gray-300 text-xs font-semibold text-gray-700">
                <th className="p-2 w-10">S.No</th>
                <th className="p-2">Description</th>
                <th className="p-2 text-center w-16">Qty</th>
                <th className="p-2 text-right w-20">Price</th>
                <th className="p-2 text-right w-24">Total</th>
              </tr>
            </thead>
            <tbody>
              {order?.orderItems?.map((item, i) => (
                <tr key={i} className="border-b border-gray-200 text-xs">
                  <td className="p-2">{i + 1}</td>
                  <td className="p-2">{item.title}</td>
                  <td className="p-2 text-center">{item.qty}</td>
                  <td className="p-2 text-right">₹{item.price / item.qty}</td>
                  <td className="p-2 text-right">₹{item.price}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals Section */}
          <div className="flex justify-end mb-12">
            <div className="w-full max-w-xs text-right text-sm">
              <div className="flex justify-between mb-1">
                <span className="font-semibold">Taxable Value:</span>
                <span>₹{subTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t-2 border-gray-400 pt-2 mt-2">
                <span>Total Invoice Value:</span>
                <span>₹{totalInvoiceValue.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Authorized Signatory */}
          <div className="flex justify-end mb-2">
            <div className="text-right">
              <p className="font-semibold">FOR Darsh</p>
              <p className="text-sm">Proprietor - Darsh</p>
              <div className="mt-8 h-px w-48 bg-gray-400 ml-auto"></div>
              <p className="font-semibold text-sm mt-2">Authorized Signatory</p>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-8 text-xs text-gray-600">
            <p>Thank you for your business!</p>
            <p className="mt-1">
              Note: This is a system-generated invoice and does not require a
              physical signature.
            </p>
          </div>
        </div>
      </div>

      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default OrderDetails;