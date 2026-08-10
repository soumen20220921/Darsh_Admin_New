import React, { useState, useEffect, useMemo } from "react";
import {
  ShoppingCart,
  Eye,
  Search,
  Package,
  CalendarDays,
  Filter,
  X,
  Download,
  RefreshCw,
  Zap,
  Sparkles,
  IndianRupee,
  User,
  Phone,
  MapPin,
  Box
} from "lucide-react";
import OrderDetails from "./OrderDetails";
import { useAppContext } from "../../context/Context";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const StatusBadge = ({ status }) => {
  const statusStyles = {
    Paid: "bg-green-100 text-green-800",
    Unpaid: "bg-yellow-100 text-yellow-800",
    New: "bg-blue-100 text-blue-800",
    Accepted: "bg-purple-100 text-purple-800",
    Dispatched: "bg-indigo-100 text-indigo-800",
    Rejected: "bg-red-100 text-red-800",
    Completed: "bg-gray-100 text-gray-800",
  };
  const text = status === "Not Paid" ? "Unpaid" : status;
  return (
    <span
      className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
        statusStyles[text] || "bg-gray-100 text-gray-800"
      }`}
    >
      {text}
    </span>
  );
};

export default function OrderListDesign() {
  const [activeTab, setActiveTab] = useState("All Orders");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [tabSignals, setTabSignals] = useState({});
  const [filterPayment, setFilterPayment] = useState("All");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshPulse, setRefreshPulse] = useState(false);
  const [mobileView, setMobileView] = useState(false);

  const { orders, getOrders } = useAppContext();
  const safeOrders = useMemo(
    () => (Array.isArray(orders) ? orders : []),
    [orders]
  );  

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
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const paidOrders = useMemo(
    () => safeOrders.filter((o) => o.payStatus === "paid"),
    [safeOrders]
  );
  
  const tabCounts = useMemo(() => {
    const unpaidOrders = safeOrders.filter((o) => o.payStatus !== "paid");

    return {
      New: paidOrders.filter((o) => !o.orderAccept && !o.orderReject).length,
      Accepted: paidOrders.filter((o) => o.orderAccept && !o.orderDispatch).length,
      Dispatched: paidOrders.filter((o) => o.orderDispatch && !o.trackingId).length,
      Rejected: paidOrders.filter((o) => o.orderReject).length,
      "All Orders": paidOrders.filter(
        (o) => o.orderAccept && !o.orderReject && o.orderDispatch && o.trackingId !== ""
      ).length,
      Unpaid: unpaidOrders.length,
    };
  }, [paidOrders, safeOrders]);

  useEffect(() => {
    setTabSignals((prevSignals) => {
      const newSignals = { ...prevSignals };
      Object.keys(tabCounts).forEach((tab) => {
        if (tabCounts[tab] > (prevSignals[tab]?.lastCount || 0)) {
          newSignals[tab] = {
            ...newSignals[tab],
            signal: true,
            lastCount: tabCounts[tab],
          };
        } else {
          newSignals[tab] = {
            ...newSignals[tab],
            lastCount: tabCounts[tab],
          };
        }
      });
      return newSignals;
    });
  }, [tabCounts]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setTabSignals((prev) => ({
      ...prev,
      [tab]: { ...prev[tab], signal: false },
    }));
  };

  const handleClearFilters = () => {
    setFilterPayment("All");
    setDateRange({ from: "", to: "" });
    setSearchTerm("");
  };

  const refreshData = async () => {
    setRefreshing(true);
    try {
      await getOrders();
      setTimeout(() => setRefreshing(false), 1000);
      toast.success("Orders refreshed successfully! 🔄", { theme: "colored" });
    } catch (error) {
      setRefreshing(false);
      toast.error("Failed to refresh orders", { theme: "colored" });
    }
  };

  // Enhanced export function with comprehensive order details
  const exportOrders = async () => {
    setExporting(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      const ordersToExport = groupedOrders.paid.concat(groupedOrders.unpaid);
      
      const data = ordersToExport.map(order => {
        const getOrderStatus = (order) => {
          if (order.orderReject) return "Rejected";
          if (order.orderDispatch && order.trackingId) return "Completed";
          if (order.orderDispatch) return "Dispatched";
          if (order.orderAccept) return "Accepted";
          return "New";
        };

        const productDetails = order.orderItems?.map(item => 
          `${item.title} (Qty: ${item.qty}, Price: ₹${item.price})`
        ).join('; ') || 'No items';

        const productsBreakdown = order.orderItems?.map((item, index) => 
          `Product ${index + 1}: ${item.title} | Qty: ${item.qty} | Unit Price: ₹${(item.price / item.qty).toFixed(2)} | Total: ₹${item.price}`
        ).join('\n') || 'No products';

        return {
          'Order ID': order._id,
          'Order Date': new Date(order.orderDate).toLocaleDateString('en-IN'),
          'Order Time': new Date(order.orderDate).toLocaleTimeString('en-IN'),
          'Order Status': getOrderStatus(order),
          'Payment Status': order.payStatus === "paid" ? "Paid" : "Unpaid",
          'Total Amount': `${order.amount?.toFixed(2) || '0.00'}`,
          'Items Count': order.orderItems?.length || 0,
          'Transaction ID': order.transactionId || 'N/A',
          
          'Customer Name': order.userShipping?.FullName || 'N/A',
          'Customer Phone': order.userShipping?.Phone || 'N/A',
          
          'Shipping Address': order.userShipping?.Add || 'N/A',
          'City/Village': order.userShipping?.VillorCity || 'N/A',
          'District': order.userShipping?.Dist || 'N/A',
          'State': order.userShipping?.State || 'N/A',
          'PIN Code': order.userShipping?.Pin || 'N/A',
          'Full Address': order.userShipping?.Add ? 
            `${order.userShipping.Add}, ${order.userShipping.VillorCity}, ${order.userShipping.Dist}, ${order.userShipping.State} - ${order.userShipping.Pin}` : 
            'N/A',
          
          'Order Accepted': order.orderAccept ? 'Yes' : 'No',
          'Order Rejected': order.orderReject ? 'Yes' : 'No',
          'Order Dispatched': order.orderDispatch ? 'Yes' : 'No',
          'Tracking ID': order.trackingId || 'Not Assigned',
          
          'Products Summary': productDetails,
          'Total Products Value': `${order.amount?.toFixed(2) || '0.00'}`,
          
          'Products Detailed': productsBreakdown,
          
          'Export Date': new Date().toLocaleDateString('en-IN'),
          'Export Time': new Date().toLocaleTimeString('en-IN'),
          'Records Count': ordersToExport.length
        };
      });

      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => {
            const value = row[header];
            if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().split('T')[0];
      
      link.setAttribute('href', url);
      link.setAttribute('download', `orders_export_${timestamp}_${ordersToExport.length}_records.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setTimeout(() => setExporting(false), 500);
      toast.success(`Exported ${ordersToExport.length} orders successfully! 📊`, { 
        theme: "colored",
        autoClose: 3000 
      });
    } catch (error) {
      console.error('Export error:', error);
      setExporting(false);
      toast.error("Failed to export orders. Please try again.", { 
        theme: "colored",
        autoClose: 3000 
      });
    }
  };

  const groupedOrders = useMemo(() => {
    const filtered = safeOrders.filter((order) => {
      let tabMatch = false;
      const isPaid = order.payStatus === "paid";

      if (activeTab === "Unpaid") {
        tabMatch = !isPaid;
      } else {
        if (!isPaid) return false;

        if (activeTab === "New") tabMatch = !order.orderAccept && !order.orderReject;
        else if (activeTab === "Accepted") tabMatch = order.orderAccept && !order.orderDispatch;
        else if (activeTab === "Rejected") tabMatch = order.orderReject;
        else if (activeTab === "Dispatched") tabMatch = order.orderDispatch && !order.trackingId;
        else if (activeTab === "All Orders")
          tabMatch = order.orderAccept && !order.orderReject && order.orderDispatch && order.trackingId !== "";
        else tabMatch = true; 
      }

      if (!tabMatch) return false;

      // Search and other filters
      const matchesSearch =
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.userShipping?.FullName?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPayment =
        filterPayment === "All" ||
        (filterPayment === "Paid" && isPaid) ||
        (filterPayment === "Not Paid" && !isPaid);

      const orderDate = new Date(order.orderDate);
      const fromDate = dateRange.from ? new Date(dateRange.from) : null;
      const toDate = dateRange.to ? new Date(dateRange.to) : null;
      if (fromDate) fromDate.setHours(0, 0, 0, 0); 
      if (toDate) toDate.setHours(23, 59, 59, 999); 

      const matchesDate =
        (!fromDate || orderDate >= fromDate) && (!toDate || orderDate <= toDate);

      return matchesSearch && matchesPayment && matchesDate;
    });

    return filtered.reduce(
      (acc, order) => {
        if (order.payStatus === "paid") {
          acc.paid.push(order);
        } else {
          acc.unpaid.push(order);
        }
        return acc;
      },
      { paid: [], unpaid: [] }
    );
  }, [safeOrders, activeTab, searchTerm, filterPayment, dateRange]);

  const getOrderStatus = (order) => {
    if (order.orderReject) return "Rejected";
    if (order.orderDispatch && order.trackingId) return "Completed";
    if (order.orderDispatch) return "Dispatched";
    if (order.orderAccept) return "Accepted";
    return "New";
  };

  const totalFilteredCount = groupedOrders.paid.length + groupedOrders.unpaid.length;
  
  const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
  
  const dispatchedPaidOrders = paidOrders.filter((o) => o.orderDispatch).length || 0;

  if (selectedOrder) {
    return <OrderDetails order={selectedOrder} onClose={() => setSelectedOrder(null)} />;
  }

  return (
    <div className="space-y-6">
      {/* Header with Action Buttons */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 bg-gradient-to-r from-indigo-600 to-pink-500 text-transparent bg-clip-text">
            Order Management
          </h1>
          <p className="text-gray-600">Manage and track customer orders ({safeOrders.length} total)</p>
        </div>
        
        {/* Action Buttons Group */}
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          {/* Enhanced Export Button */}
          <button
            onClick={exportOrders}
            disabled={exporting || totalFilteredCount === 0}
            className={`
              relative flex items-center justify-center gap-2 md:gap-3 px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl font-semibold text-sm md:text-base
              transition-all duration-500 ease-out transform hover:scale-105 hover:shadow-2xl
              ${exporting 
                ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg' 
                : totalFilteredCount === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-purple-500/25'
              }
              overflow-hidden group
            `}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            
            <div className="relative flex items-center gap-2 md:gap-3">
              {exporting ? (
                <>
                  <div className="animate-spin">
                    <RefreshCw className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <span className="text-xs md:text-sm">Exporting...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:scale-110" />
                  <span className="text-xs md:text-sm">Export CSV</span>
                  <Sparkles className="w-3 h-3 md:w-4 md:h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </>
              )}
            </div>
            
            {/* Export Info Badge */}
            {!exporting && totalFilteredCount > 0 && (
              <div className="absolute -top-0 right-1 bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                {totalFilteredCount}
              </div>
            )}
          </button>

          {/* Refresh Button */}
          <button
            onClick={refreshData}
            disabled={refreshing}
            className={`
              relative flex items-center justify-center gap-2 md:gap-3 px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl font-semibold text-sm md:text-base
              transition-all duration-500 ease-out transform hover:scale-105 hover:shadow-2xl
              ${refreshing
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                : refreshPulse
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg ring-2 ring-blue-300 ring-opacity-50'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-blue-500/25'
              }
              overflow-hidden group
            `}
          >
            {refreshPulse && !refreshing && (
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-2xl animate-pulse" />
            )}
            
            <div className="relative flex items-center gap-2 md:gap-3">
              <RefreshCw 
                className={`w-4 h-4 md:w-5 md:h-5 transition-all duration-300 ${
                  refreshing ? 'animate-spin' : refreshPulse ? 'animate-bounce' : 'group-hover:rotate-180'
                }`} 
              />
              <span className="text-xs md:text-sm">
                {refreshing ? 'Refreshing...' : refreshPulse ? 'New Data!' : 'Refresh'}
              </span>
            </div>
            
            <div className="absolute -top-1 -right-1">
              <div className={`w-2 h-2 rounded-full ${
                refreshing ? 'bg-yellow-400 animate-ping' : 
                refreshPulse ? 'bg-green-400 animate-pulse' : 
                'bg-green-400'
              }`} />
            </div>
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <p className="text-xs md:text-sm text-gray-600">
            Showing {totalFilteredCount} of {safeOrders.length} orders
          </p>
          {mobileView && (
            <span className="block text-xs text-blue-600 font-medium mt-1">
              Mobile-optimized view
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 whitespace-nowrap text-xs md:text-sm text-blue-600 font-medium">
          <div className={`w-2 h-2 rounded-full ${refreshing ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`} />
          <span>Live Order Updates</span>
        </div>
      </div>

      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 shadow-lg rounded-2xl p-2 md:p-5 text-center transform hover:scale-105 hover:shadow-xl transition duration-300 group cursor-pointer">
          <div className="flex items-center justify-center mb-3">
            <ShoppingCart className=" hidden md:block text-blue-600 animate-bounce group-hover:scale-110 transition-transform" size={26} />
          </div>
          <h3 className="text-sm text-gray-600">Total Paid Orders</h3>
          <p className="text-2xl font-bold text-blue-700">{paidOrders.length}</p>
          <p className="hidden md:block text-xs text-gray-500 mt-1">Ready for processing</p>
        </div>

        <div className="hidden md:block bg-gradient-to-r from-purple-50 to-purple-100 shadow-lg rounded-2xl p-5 text-center transform hover:rotate-1 hover:scale-105 transition duration-300 group cursor-pointer">
          <div className="flex items-center justify-center mb-3">
            <Package className="text-purple-600 animate-pulse group-hover:scale-110 transition-transform" size={26} />
          </div>
          <h3 className="text-sm text-gray-600">New Paid Orders</h3>
          <p className="text-2xl font-bold text-purple-700">{tabCounts.New || 0}</p>
          <p className="text-xs text-gray-500 mt-1">Awaiting action</p>
        </div>

        <div className="hidden md:block bg-gradient-to-r from-green-50 to-green-100 shadow-lg rounded-2xl p-5 text-center transform hover:scale-105 hover:shadow-xl transition duration-300 group cursor-pointer">
          <div className="flex items-center justify-center mb-3">
            <IndianRupee className="text-green-600 animate-bounce group-hover:scale-110 transition-transform" size={26} />
          </div>
          <h3 className="text-sm text-gray-600">Total Revenue</h3>
          <p className="text-2xl font-bold text-green-700">₹{totalRevenue.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">All time earnings</p>
        </div>

        <div className="hidden md:block bg-gradient-to-r from-pink-50 to-pink-100 shadow-lg rounded-2xl p-5 text-center transform hover:scale-105 hover:-rotate-1 transition duration-300 group cursor-pointer">
          <div className="flex items-center justify-center mb-3">
            <Box className="text-pink-600 animate-pulse group-hover:scale-110 transition-transform" size={26} />
          </div>
          <h3 className="text-sm text-gray-600">Dispatched Orders</h3>
          <p className="text-2xl font-bold text-pink-700">{dispatchedPaidOrders}</p>
          <p className="text-xs text-gray-500 mt-1">On the way to customers</p>
        </div>
      </div>

        {/* Main Content Area */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto">
            {Object.keys(tabCounts).map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={`relative flex-shrink-0 whitespace-nowrap py-4 px-6 text-sm font-medium transition-all ${
                  activeTab === tab
                    ? "border-b-2 border-blue-600 text-blue-600 bg-blue-50/50"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                {tab}
                {tabCounts[tab] > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 font-semibold">
                    {tabCounts[tab]}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Filters and Search Bar */}
        <div className="p-4 border-b border-gray-200 bg-white flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Order ID or User Name..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-gray-50"
            />
          </div>
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="md:hidden flex items-center justify-center gap-2 px-4 py-3 w-full border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Filter size={20} /> Filters
          </button>
          <div className="hidden md:flex flex-row items-center gap-4">
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              className="py-2.5 px-4 border border-gray-300 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-gray-50"
            />
            <p className="text-gray-500">-</p>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              className="py-2.5 px-4 border border-gray-300 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-gray-50"
            />
            <button
              onClick={handleClearFilters}
              className="text-sm text-gray-500 hover:text-red-500 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Filter Modal for Mobile */}
        {isFilterModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end bg-black bg-opacity-50 backdrop-blur-sm">
           <div className="bg-white rounded-t-2xl p-6 w-full max-h-[80%] overflow-y-auto transform transition-transform ease-out duration-300 translate-y-0">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-800">Filters</h3>
                <button
                  onClick={() => setIsFilterModalOpen(false)}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Range
                  </label>
                  <div className="space-y-4">
                    <div className="relative">
                      <CalendarDays
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={20}
                      />
                      <input
                        type="date"
                        value={dateRange.from}
                        onChange={(e) =>
                          setDateRange({ ...dateRange, from: e.target.value })
                        }
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-700 shadow-sm"
                      />
                    </div>
                    <div className="relative">
                      <CalendarDays
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={20}
                      />
                      <input
                        type="date"
                        value={dateRange.to}
                        onChange={(e) =>
                          setDateRange({ ...dateRange, to: e.target.value })
                        }
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-700 shadow-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-3">
                <button
                  onClick={() => {
                    handleClearFilters();
                  }}
                  className="w-full py-3 px-4 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                >
                  Clear Filters
                </button>
                <button
                  onClick={() => setIsFilterModalOpen(false)}
                  className="w-full py-3 px-4 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="p-4 space-y-6">
          {totalFilteredCount > 0 ? (
            <>
              {groupedOrders.unpaid.length > 0 && (
                <section>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-1.5 h-6 bg-yellow-400 rounded-full"></div>
                    <h2 className="text-lg font-bold text-gray-700">Unpaid Orders</h2>
                    <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                      {groupedOrders.unpaid.length}
                    </span>
                  </div>
                  <div className="space-y-4">
                    {groupedOrders.unpaid.map((order) => (
                      <OrderCard
                        key={order._id}
                        order={order}
                        setSelectedOrder={setSelectedOrder}
                        getOrderStatus={getOrderStatus}
                        mobileView={mobileView}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* PAID Orders Section */}
              {groupedOrders.paid.length > 0 && (
                <section>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-1.5 h-6 bg-green-500 rounded-full"></div>
                    <h2 className="text-lg font-bold text-gray-700">Paid Orders</h2>
                    <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                      {groupedOrders.paid.length}
                    </span>
                  </div>
                  <div className="space-y-4">
                    {groupedOrders.paid.map((order) => (
                      <OrderCard
                        key={order._id}
                        order={order}
                        setSelectedOrder={setSelectedOrder}
                        getOrderStatus={getOrderStatus}
                        mobileView={mobileView}
                      />
                    ))}
                  </div>
                </section>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <Package className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700">No Orders Found</h3>
              <p className="mt-2 text-sm text-gray-500">
                Try adjusting your filters or search terms.
              </p>
            </div>
          )}
        </div>
      </div>
      <ToastContainer position="bottom-right" autoClose={2000} newestOnTop={true} />
    </div>
  );
}

const OrderCard = ({ order, setSelectedOrder, getOrderStatus, mobileView }) => {
  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-300 active:scale-[0.98]">
      <div className={`${mobileView ? 'space-y-3' : 'grid grid-cols-1 md:grid-cols-12 gap-4 items-center'}`}>
        {/* Order & User Info */}
        <div className={mobileView ? "space-y-2" : "md:col-span-5"}>
          <p className="font-bold text-gray-800 truncate text-sm md:text-base">Order #{order._id}</p>
          <p className="text-sm text-gray-600">
            {order.userShipping?.FullName || order.userId}
          </p>
          <p className="text-xs text-gray-500">
            {new Date(order.orderDate).toLocaleString()}
          </p>
        </div>

        {/* Statuses */}
        <div className={mobileView ? "flex flex-wrap gap-2" : "md:col-span-4 flex flex-wrap gap-2"}>
          <StatusBadge status={getOrderStatus(order)} />
          <StatusBadge status={order.payStatus === "paid" ? "Paid" : "Unpaid"} />
        </div>

        {/* Amount & Actions */}
        <div className={mobileView ? "flex items-center justify-between" : "md:col-span-3 flex items-center justify-between md:justify-end gap-4"}>
          <div className="text-right">
            <p className="text-lg font-bold text-gray-800">₹{order.amount?.toFixed(2) || '0.00'}</p>
            <p className="text-sm text-gray-500">{order.orderItems?.length || 0} items</p>
          </div>
          <button
            onClick={() => {
              setSelectedOrder(order);
              toast.info(`Opening order #${order._id}`, { theme: "colored" });
            }}
            className="bg-blue-50 text-blue-600 p-3 rounded-full hover:bg-blue-100 transition-colors active:scale-95"
          >
            <Eye size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};