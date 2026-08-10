import React, { useEffect, useMemo, useState } from "react";
import {
  ShoppingBag,
  Users,
  Package,
  IndianRupee,
  TrendingUp,
  Calendar,
  ArrowUp,
  ArrowDown,
  Star,
  CreditCard,
  PieChart,
  RefreshCw,
  Filter,
  XCircle,
  CheckCircle,
  AlertCircle,
  Download,
  Sparkles,
  Zap,
  BarChart3,
  LineChart
} from "lucide-react";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { useAppContext } from "../../context/Context";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Helper functions
const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString()}`;
const getOrderDate = (order) => new Date(order.orderDate || order.createdAt || Date.now());

const Dashboard = () => {
  const { allProduct, orders, allUser, getProduct, fetchOrders, getUsers } = useAppContext();
  const [timeRange, setTimeRange] = useState("month");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshPulse, setRefreshPulse] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [activeOrderTab, setActiveOrderTab] = useState("all");
  const [mobileView, setMobileView] = useState(false);

  // Auto-refresh pulse effect
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

  const normalizeStatus = (s) => (s ? String(s).toLowerCase() : "not paid");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        if (getProduct) await getProduct();
        if (fetchOrders) await fetchOrders();
        if (getUsers) await getUsers();
      } catch (e) {
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (allProduct !== null && orders !== null && allUser !== null) {
      setRefreshing(false);
      setLoading(false);
    }
  }, [allProduct, orders, allUser]);

  const refreshData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        getProduct ? getProduct() : Promise.resolve(),
        fetchOrders ? fetchOrders() : Promise.resolve(),
        getUsers ? getUsers() : Promise.resolve(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const exportDashboardData = async () => {
    setExporting(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      const reportData = {
        'Report Type': 'Dashboard Analytics Export',
        'Export Date': new Date().toLocaleDateString('en-IN'),
        'Export Time': new Date().toLocaleTimeString('en-IN'),
        'Time Range': timeRange === 'week' ? 'Last 7 Days' : timeRange === 'month' ? 'Last 6 Months' : 'Last 12 Months',
        
        'Total Revenue': formatCurrency(totalRevenue),
        'Total Paid Orders': totalOrders,
        'Total Users': totalUsers,
        'Total Products': totalProducts,
        'Today Revenue': formatCurrency(todaysRevenue),
        'Today Orders': todaysPaidOrders.length,
        'Average Order Value': formatCurrency(avgOrderValue),
        'Payment Success Rate': `${paymentSuccessRate}%`,
        'Conversion Rate': `${totalUsers > 0 ? ((totalOrders / totalUsers) * 100).toFixed(1) : 0}%`,
        
        'Revenue Growth': `${revenueGrowth.toFixed(1)}%`,
        'Order Growth': `${orderGrowth.toFixed(1)}%`,
        'User Growth': `${userGrowth.toFixed(1)}%`,
        
        'All Orders': orderStatusCounts.all,
        'Paid Orders': orderStatusCounts.paid,
        'Pending Orders': orderStatusCounts.pending,
        'Failed Orders': orderStatusCounts.failed,
        
        'Chart Period Labels': processChartData.labels.join('; '),
        'Revenue Data': processChartData.salesData.map(d => d.revenue).join('; '),
        'Order Count Data': processChartData.orderCountData.map(d => d.count).join('; '),
        'User Growth Data': processChartData.userData.map(d => d.users).join('; '),
        
        'Product Categories': Object.keys(processChartData.categoryData).join('; '),
        'Category Counts': Object.values(processChartData.categoryData).join('; '),
        
        // Top Products
        'Top Products': topProducts.map(p => p.name).join('; '),
        'Top Products Revenue': topProducts.map(p => p.revenue).join('; '),
        
        'Records Count': `Users: ${totalUsers}, Orders: ${allOrders.length}, Products: ${totalProducts}`
      };

      const csvContent = Object.entries(reportData)
        .map(([key, value]) => `"${key}","${value}"`)
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().split('T')[0];
      
      link.setAttribute('href', downloadUrl);
      link.setAttribute('download', `dashboard_export_${timestamp}_analytics.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
      
      setTimeout(() => setExporting(false), 500);
    } catch (error) {
      console.error('Export error:', error);
      setExporting(false);
    }
  };

  const allOrders = useMemo(() => {
    if (!orders) return [];
    return orders.map((order) => {
      const productCount = order.products
        ? order.products.reduce((total, p) => total + (Number(p.quantity) || 1), 0)
        : 0;
      const payStatus = normalizeStatus(order.payStatus);
      let statusColor = "text-yellow-600";
      let statusBg = "bg-yellow-100";
      if (payStatus === "paid") {
        statusColor = "text-green-600";
        statusBg = "bg-green-100";
      } else if (payStatus === "failed") {
        statusColor = "text-red-600";
        statusBg = "bg-red-100";
      }
      return {
        ...order,
        payStatusNormalized: payStatus,
        productCount,
        statusColor,
        statusBg,
      };
    });
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (activeOrderTab === "all") return allOrders;
    return allOrders.filter((o) => {
      if (activeOrderTab === "pending") return o.payStatusNormalized !== "paid" && o.payStatusNormalized !== "failed";
      return o.payStatusNormalized === activeOrderTab;
    });
  }, [allOrders, activeOrderTab]);

  const paidOrders = useMemo(() => allOrders.filter((o) => o.payStatusNormalized === "paid"), [allOrders]);

  const totalUsers = allUser?.length || 0;
  const totalOrders = paidOrders.length;
  const totalProducts = allProduct?.length || 0;
  const totalRevenue = useMemo(() => paidOrders.reduce((s, o) => s + (Number(o.amount) || 0), 0), [paidOrders]);

  const todayStart = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const todayEnd = useMemo(() => {
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    return d;
  }, []);

  const todaysPaidOrders = useMemo(() =>
    paidOrders.filter((o) => {
      const od = getOrderDate(o);
      return od >= todayStart && od <= todayEnd;
    }) || [],
  [paidOrders, todayStart, todayEnd]);

  const todaysRevenue = useMemo(() => todaysPaidOrders.reduce((s, o) => s + (Number(o.amount) || 0), 0), [todaysPaidOrders]);

  const processChartData = useMemo(() => {
    const now = new Date();
    const salesData = [];
    const orderCountData = [];
    const userData = [];
    const categoryData = {};

    let dataPoints = 6;
    let timeUnit = "month";

    if (timeRange === "week") {
      dataPoints = 7;
      timeUnit = "day";
    } else if (timeRange === "year") {
      dataPoints = 12;
      timeUnit = "month";
    }

    const labels = [];
    for (let i = dataPoints - 1; i >= 0; i--) {
      if (timeUnit === "day") {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString("en-US", { weekday: "short" }));
      } else {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        labels.push(date.toLocaleDateString("en-US", { month: "short" }));
      }
    }

    for (let i = 0; i < dataPoints; i++) {
      const startDate = new Date(now);
      if (timeUnit === "day") {
        startDate.setDate(startDate.getDate() - (dataPoints - 1 - i));
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);

        const dailySales = paidOrders
          .filter((order) => {
            const od = getOrderDate(order);
            return od >= startDate && od < endDate;
          })
          .reduce((sum, order) => sum + (Number(order.amount) || 0), 0);

        const dailyOrders = paidOrders.filter((order) => {
          const od = getOrderDate(order);
          return od >= startDate && od < endDate;
        }).length;

        salesData.push({ period: labels[i], revenue: dailySales });
        orderCountData.push({ period: labels[i], count: dailyOrders });
      } else {
        startDate.setMonth(startDate.getMonth() - (dataPoints - 1 - i));
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);

        const monthlySales = paidOrders
          .filter((order) => {
            const od = getOrderDate(order);
            return od >= startDate && od < endDate;
          })
          .reduce((sum, order) => sum + (Number(order.amount) || 0), 0);

        const monthlyOrders = allOrders.filter((order) => {
          const od = getOrderDate(order);
          return od >= startDate && od < endDate;
        }).length;

        salesData.push({ period: labels[i], revenue: monthlySales });
        orderCountData.push({ period: labels[i], count: monthlyOrders });
      }
    }

    if (allUser && allUser.length) {
      for (let i = 0; i < dataPoints; i++) {
        const startDate = new Date(now);
        if (timeUnit === "day") {
          startDate.setDate(startDate.getDate() - (dataPoints - 1 - i));
          startDate.setHours(0, 0, 0, 0);
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 1);
          const dailyUsers = allUser.filter((user) => {
            const ud = new Date(user.createdAt || user.joinedDate || 0);
            return ud >= startDate && ud < endDate;
          }).length;
          userData.push({ period: labels[i], users: dailyUsers });
        } else {
          startDate.setMonth(startDate.getMonth() - (dataPoints - 1 - i));
          startDate.setDate(1);
          startDate.setHours(0, 0, 0, 0);
          const endDate = new Date(startDate);
          endDate.setMonth(endDate.getMonth() + 1);
          const monthlyUsers = allUser.filter((user) => {
            const ud = new Date(user.createdAt || user.joinedDate || 0);
            return ud >= startDate && ud < endDate;
          }).length;
          userData.push({ period: labels[i], users: monthlyUsers });
        }
      }
    }

    if (allProduct) {
      allProduct.forEach((product) => {
        const category = product.category || "Uncategorized";
        categoryData[category] = (categoryData[category] || 0) + 1;
      });
    }

    return { salesData, orderCountData, userData, labels, categoryData };
  }, [paidOrders, allOrders, allUser, timeRange, allProduct]);

  const calculateGrowth = (data, key) => {
    if (!data || data.length < 2) return 0;
    const current = data[data.length - 1][key] || 0;
    const previous = data[data.length - 2][key] || 0;
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const revenueGrowth = calculateGrowth(processChartData.salesData, "revenue");
  const userGrowth = calculateGrowth(processChartData.userData, "users");
  const orderGrowth = calculateGrowth(processChartData.orderCountData, "count");

  const avgOrderValue = totalOrders ? (totalRevenue / totalOrders).toFixed(2) : 0;
  const paymentSuccessRate = allOrders.length ? ((paidOrders.length / allOrders.length) * 100).toFixed(1) : 0;

  const stats = [
    {
      name: "Total Revenue",
      value: formatCurrency(totalRevenue),
      icon: IndianRupee,
      color: "text-green-600",
      bg: "bg-gradient-to-r from-green-100 to-green-200",
      growth: revenueGrowth,
      period: timeRange,
    },
    {
      name: "Total Paid Orders",
      value: totalOrders,
      icon: ShoppingBag,
      color: "text-blue-600",
      bg: "bg-gradient-to-r from-blue-100 to-blue-200",
      growth: orderGrowth,
      period: timeRange,
    },
    {
      name: "Total Users",
      value: totalUsers,
      icon: Users,
      color: "text-purple-600",
      bg: "bg-gradient-to-r from-purple-100 to-purple-200",
      growth: userGrowth,
      period: timeRange,
    },
    {
      name: "Total Products",
      value: totalProducts,
      icon: Package,
      color: "text-orange-600",
      bg: "bg-gradient-to-r from-orange-100 to-orange-200",
    },
  ];

  const orderStatusCounts = useMemo(() => ({
    all: allOrders.length,
    paid: allOrders.filter((order) => order.payStatusNormalized === "paid").length,
    pending: allOrders.filter((order) => order.payStatusNormalized !== "paid" && order.payStatusNormalized !== "failed").length,
    failed: allOrders.filter((order) => order.payStatusNormalized === "failed").length,
  }), [allOrders]);

  const salesChartData = {
    labels: processChartData.labels || [],
    datasets: [
      {
        label: "Revenue (₹)",
        data: processChartData.salesData.map((d) => d.revenue),
        borderColor: "rgb(251, 146, 60)",
        backgroundColor: "rgba(251, 146, 60, 0.08)",
        fill: true,
        tension: 0.35,
        pointStyle: "circle",
        pointRadius: 3,
        pointHoverRadius: 6,
        yAxisID: "y",
      },
      {
        label: "Orders",
        data: processChartData.orderCountData.map((d) => d.count),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.06)",
        fill: true,
        tension: 0.35,
        pointStyle: "rect",
        pointRadius: 3,
        pointHoverRadius: 6,
        yAxisID: "y1",
      },
    ],
  };

  const userChartData = {
    labels: processChartData.labels || [],
    datasets: [
      {
        label: "New Users",
        data: processChartData.userData.map((d) => d.users),
        backgroundColor: "rgba(139, 92, 246, 0.7)",
        borderRadius: 6,
      },
    ],
  };

  const categoryChartData = {
    labels: Object.keys(processChartData.categoryData),
    datasets: [
      {
        label: "Products by Category",
        data: Object.values(processChartData.categoryData),
        backgroundColor: [
          "rgba(255, 99, 132, 0.7)",
          "rgba(54, 162, 235, 0.7)",
          "rgba(255, 206, 86, 0.7)",
          "rgba(75, 192, 192, 0.7)",
          "rgba(153, 102, 255, 0.7)",
          "rgba(255, 159, 64, 0.7)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      y: {
        type: "linear",
        display: true,
        position: "left",
        title: { display: true, text: "Revenue (₹)" },
        grid: { color: "rgba(0, 0, 0, 0.04)" },
      },
      y1: {
        type: "linear",
        display: true,
        position: "right",
        title: { display: true, text: "Orders" },
        grid: { drawOnChartArea: false },
      },
      x: { grid: { display: false } },
    },
    maintainAspectRatio: false,
  };

  // Top products by revenue
  const topProducts = useMemo(() => {
    if (!allProduct || !paidOrders) return [];
    const productRevenue = {};
    paidOrders.forEach((order) => {
      if (order.products) {
        order.products.forEach((item) => {
          const pid = item.product || item.productId || item._id || "unknown";
          const price = Number(item.price) || Number(item.rate) || 0;
          const qty = Number(item.quantity) || 1;
          productRevenue[pid] = (productRevenue[pid] || 0) + price * qty;
        });
      }
    });

    return Object.entries(productRevenue)
      .map(([productId, revenue]) => {
        const product = allProduct.find((p) => p._id === productId || p.id === productId);
        return { name: product ? product.name : "Unknown Product", revenue, id: productId };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [allProduct, paidOrders]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Action Buttons */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-4 flex-1">
  <div className="block md:hidden p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl shadow-lg animate-pulse">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-8 w-8 text-white"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 13h8V3H3v10zm10 8h8v-6h-8v6zM3 21h8v-4H3v4zm10-8h8V3h-8v10z"
      />
    </svg>
  </div>

  <div>
    <h1 className="text-xl lg:text-3xl whitespace-nowrap font-bold text-gray-900 bg-gradient-to-r from-indigo-600 to-pink-500 bg-clip-text text-transparent">
      Dashboard Analytics
    </h1>
    <p className="text-xs md:text-sm text-gray-600">Complete overview of your store performance</p>
  </div>
</div>

        
        {/* Action Buttons Group */}
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          {/* Export Button */}
          <button
            onClick={exportDashboardData}
            disabled={exporting}
            className={`
              relative flex items-center justify-center gap-2 md:gap-3 px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl font-semibold text-sm md:text-base
              transition-all duration-500 ease-out transform hover:scale-105 hover:shadow-2xl
              ${exporting 
                ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg' 
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
                  <span className="text-xs md:text-sm">Export Data</span>
                  <BarChart3 className="w-3 h-3 md:w-4 md:h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </>
              )}
            </div>
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

         {/* Time Range Selector */}
<div className="relative flex items-center gap-3 bg-gradient-to-r from-indigo-50 via-white to-blue-50 rounded-xl shadow-md p-3 border border-indigo-100 transition-all duration-300 hover:shadow-lg">
  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 shadow-sm">
    <Calendar size={18} className="text-white" />
  </div>

  <div className="flex flex-col">
    <label className="text-xs text-gray-500 font-medium tracking-wide">
      Select Duration
    </label>
    <select
      value={timeRange}
      onChange={(e) => setTimeRange(e.target.value)}
      className="bg-transparent text-sm font-semibold text-gray-700 focus:outline-none focus:ring-0 appearance-none cursor-pointer hover:text-blue-600 transition-colors"
    >
      <option value="week">📅 Last 7 Days</option>
      <option value="month">📆 Last 6 Months</option>
      <option value="year">📊 Last 12 Months</option>
    </select>
  </div>

  {/* Decorative dropdown arrow */}
  <div className="absolute right-3 text-indigo-400 pointer-events-none">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  </div>
</div>

        </div>
      </div>

      {/* Results Count */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <p className="text-sm text-gray-600">
            Showing analytics for {timeRange === 'week' ? 'last 7 days' : timeRange === 'month' ? 'last 6 months' : 'last 12 months'}
          </p>
          {mobileView && (
            <span className="block text-xs text-blue-600 font-medium mt-1">
              Mobile-optimized dashboard
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
          <div className={`w-2 h-2 rounded-full ${refreshing ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`} />
          <span>Live Analytics Updates</span>
        </div>
      </div>

      {/* Today's Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl shadow border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Today Revenue</p>
              <p className="text-lg font-bold text-green-700">{formatCurrency(todaysRevenue)}</p>
            </div>
            <TrendingUp className="text-green-600" size={20} />
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl shadow border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Today's Orders</p>
              <p className="text-lg font-bold text-blue-700">{todaysPaidOrders.length}</p>
            </div>
            <ShoppingBag className="text-blue-600" size={20} />
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl shadow border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Success Rate</p>
              <p className="text-lg font-bold text-purple-700">{paymentSuccessRate}%</p>
            </div>
            <CheckCircle className="text-purple-600" size={20} />
          </div>
        </div>
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-xl shadow border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Avg. Order</p>
              <p className="text-lg font-bold text-orange-700">{formatCurrency(avgOrderValue)}</p>
            </div>
            <LineChart className="text-orange-600" size={20} />
          </div>
        </div>
      </div>

     {/* Stats Cards */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
  {stats.map((stat, index) => (
    <div
      key={index}
      className="relative overflow-hidden bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-md p-5 flex items-center justify-between transition-all duration-500 hover:scale-[1.02] hover:shadow-xl"
    >
      {/* Gradient background accent */}
      <div className="absolute inset-0 opacity-10 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 pointer-events-none"></div>

      <div className="flex items-center space-x-4 z-10">
        {/* Icon container with glow effect */}
        <div
          className={`p-3 rounded-2xl shadow-md ${stat.bg} transition-transform duration-500 transform group-hover:rotate-12`}
        >
          <stat.icon
            className={`h-7 w-7 ${stat.color} drop-shadow-md transition-all duration-300`}
          />
        </div>

        <div>
          <p className="text-gray-600 text-sm font-medium tracking-wide">
            {stat.name}
          </p>
          <p className="text-xl font-extrabold text-gray-900 mt-1">
            {stat.value}
          </p>

          {stat.growth !== undefined && (
            <div
              className={`flex items-center text-xs mt-1 font-semibold ${
                stat.growth >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {stat.growth >= 0 ? (
                <ArrowUp size={13} className="mr-1" />
              ) : (
                <ArrowDown size={13} className="mr-1" />
              )}
              <span>
                {Math.abs(stat.growth).toFixed(1)}% {stat.period}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  ))}
</div>


      {/* Order Summary */}
      <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Orders Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { key: 'all', label: 'All Orders', icon: ShoppingBag },
            { key: 'paid', label: 'Paid', icon: CheckCircle },
            { key: 'pending', label: 'Pending', icon: AlertCircle },
            { key: 'failed', label: 'Failed', icon: XCircle },
          ].map((tab) => (
            <div
              key={tab.key}
              role="button"
              tabIndex={0}
              onClick={() => setActiveOrderTab(tab.key)}
              onKeyDown={(e) => (e.key === 'Enter' ? setActiveOrderTab(tab.key) : null)}
              className={`p-4 rounded-lg cursor-pointer transition-all ${activeOrderTab === tab.key ? "bg-blue-50 border border-blue-200" : "bg-gray-50 hover:bg-gray-100"}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{tab.label}</span>
                <tab.icon size={16} className="text-gray-500" />
              </div>
              <p className="text-xl font-bold text-gray-900 mt-1">{orderStatusCounts[tab.key]}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <TrendingUp className="text-orange-500" /> Sales Overview
            </h2>
            <div className="text-sm text-gray-500 mt-1 md:mt-0">
              {timeRange === 'week' ? 'Last 7 Days' : timeRange === 'month' ? 'Last 6 Months' : 'Last 12 Months'}
            </div>
          </div>
          <div className="h-72">
            <Line data={salesChartData} options={chartOptions} />
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <CreditCard size={20} className="text-blue-500" /> Recent Orders
            </h2>
            <Filter size={18} className="text-gray-400" />
          </div>
          <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
            {filteredOrders.length > 0 ? (
              filteredOrders
                .slice()
                .sort((a, b) => getOrderDate(b) - getOrderDate(a))
                .slice(0, 8)
                .map((order) => (
                  <div
                    key={order._id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${order.statusBg}`}>
                        {order.payStatusNormalized === "paid" ? (
                          <CheckCircle size={16} className="text-green-600" />
                        ) : order.payStatusNormalized === "failed" ? (
                          <XCircle size={16} className="text-red-600" />
                        ) : (
                          <AlertCircle size={16} className="text-yellow-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Order #{String(order._id).substring(0, 8)}...</p>
                        <p className="text-xs text-gray-500">{getOrderDate(order).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-gray-900">{formatCurrency(order.amount)}</span>
                      <p className={`text-xs ${order.statusColor}`}>{order.payStatusNormalized.charAt(0).toUpperCase() + order.payStatusNormalized.slice(1)}</p>
                    </div>
                  </div>
                ))
            ) : (
              <p className="text-gray-500 text-center py-4">No orders found</p>
            )}
          </div>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {/* User Growth */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">User Growth</h2>
          <div className="h-56 mb-4">
            <Bar data={userChartData} options={{...chartOptions, plugins: {...chartOptions.plugins, legend: {display:false}}}} />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-gray-600 text-sm">Total: <span className="font-bold">{totalUsers}</span></p>
            <div className={`flex items-center text-xs ${userGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {userGrowth >= 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
              <span>{Math.abs(userGrowth).toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Product Categories */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2"><PieChart size={20} className="text-purple-500" /> Product Categories</h2>
          <div className="h-56 flex items-center justify-center">
            {Object.keys(processChartData.categoryData).length > 0 ? (
              <Doughnut data={categoryChartData} options={{...chartOptions, plugins:{...chartOptions.plugins, legend:{position:'bottom'}}}} />
            ) : (
              <p className="text-gray-500">No category data available</p>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2"><Star className="text-yellow-500" /> Top Products</h2>
          <div className="space-y-4">
            {topProducts.length > 0 ? (
              topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                      <span className="text-xs font-bold text-orange-600">{index + 1}</span>
                    </div>
                    <span className="text-sm text-gray-700 truncate max-w-[160px]">{product.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{formatCurrency(product.revenue)}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No product data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Average Order Value */}
        <div className="bg-white rounded-xl shadow-sm p-5 text-center">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <ShoppingBag size={20} className="text-indigo-600" />
          </div>
          <h3 className="text-sm text-gray-600 mb-1">Avg. Order Value</h3>
          <p className="text-xl font-bold text-indigo-600">{formatCurrency(avgOrderValue)}</p>
          <p className="text-xs text-gray-500 mt-1">Across {totalOrders} orders</p>
        </div>

        {/* Payment Success Rate */}
        <div className="bg-white rounded-xl shadow-sm p-5 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <CreditCard size={20} className="text-green-600" />
          </div>
          <h3 className="text-sm text-gray-600 mb-1">Payment Success Rate</h3>
          <p className="text-xl font-bold text-green-600">{paymentSuccessRate}%</p>
          <p className="text-xs text-gray-500 mt-1">{paidOrders.length} of {allOrders.length} orders</p>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white rounded-xl shadow-sm p-5 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <TrendingUp size={20} className="text-blue-600" />
          </div>
          <h3 className="text-sm text-gray-600 mb-1">Conversion Rate</h3>
          <p className="text-xl font-bold text-blue-600">{totalUsers > 0 ? ((totalOrders / totalUsers) * 100).toFixed(1) : 0}%</p>
          <p className="text-xs text-gray-500 mt-1">Orders per user</p>
        </div>

        {/* Inventory Status */}
        <div className="bg-white rounded-xl shadow-sm p-5 text-center">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Package size={20} className="text-orange-600" />
          </div>
          <h3 className="text-sm text-gray-600 mb-1">Inventory Status</h3>
          <p className="text-xl font-bold text-orange-600">{totalProducts}</p>
          <p className="text-xs text-gray-500 mt-1">Products in stock</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;