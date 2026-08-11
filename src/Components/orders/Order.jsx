import React, { useEffect, useMemo, useState } from "react";
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
  IndianRupee,
  User,
  MapPin,
  Box,
  Truck,
  Clock3,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import OrderDetails from "./OrderDetails";
import { useAppContext } from "../../context/Context";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* =========================================================
   DARK ORDER MANAGEMENT
   - Inspired by the supplied dark order-table reference
   - Keeps the existing order/filter/export/detail workflow
   - Desktop: compact table
   - Mobile: responsive order cards
========================================================= */

const STATUS_CONFIG = {
  New: {
    label: "ACCEPTED",
    className:
      "border-blue-500/30 bg-blue-500/10 text-blue-400 shadow-[0_0_18px_rgba(59,130,246,0.08)]",
    dot: "bg-blue-400",
  },
  Accepted: {
    label: "ACCEPTED",
    className:
      "border-blue-500/30 bg-blue-500/10 text-blue-400 shadow-[0_0_18px_rgba(59,130,246,0.08)]",
    dot: "bg-blue-400",
  },
  Packed: {
    label: "PACKED",
    className:
      "border-violet-500/30 bg-violet-500/10 text-violet-300 shadow-[0_0_18px_rgba(139,92,246,0.08)]",
    dot: "bg-violet-400",
  },
  Dispatched: {
    label: "DISPATCHED",
    className:
      "border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-[0_0_18px_rgba(245,158,11,0.08)]",
    dot: "bg-amber-400",
  },
  Completed: {
    label: "COMPLETED",
    className:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-[0_0_18px_rgba(16,185,129,0.08)]",
    dot: "bg-emerald-400",
  },
  Rejected: {
    label: "REJECTED",
    className:
      "border-red-500/30 bg-red-500/10 text-red-400 shadow-[0_0_18px_rgba(239,68,68,0.08)]",
    dot: "bg-red-400",
  },
  Pending: {
    label: "PENDING",
    className:
      "border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-[0_0_18px_rgba(245,158,11,0.08)]",
    dot: "bg-amber-400",
  },
};

const getStatusConfig = (status) =>
  STATUS_CONFIG[status] || STATUS_CONFIG.Pending;

const StatusBadge = ({ status, compact = false }) => {
  const config = getStatusConfig(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 border rounded-full font-semibold tracking-wide whitespace-nowrap ${
        compact ? "px-2.5 py-1 text-[10px]" : "px-3 py-1.5 text-[11px]"
      } ${config.className}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${config.dot} ${
          status === "Pending" || status === "New" ? "animate-pulse" : ""
        }`}
      />
      {config.label}
    </span>
  );
};

const PaymentBadge = ({ order }) => {
  const paid = order.payStatus === "paid";

  const paymentType =
    order.paymentMethod ||
    order.paymentType ||
    order.paymentMode ||
    order.paymentMethodName ||
    (order.transactionId ? "Prepaid" : "COD");

  const normalizedType = String(paymentType).toLowerCase();
  const displayType = normalizedType.includes("cod") ? "COD" : "Prepaid";

  return (
    <span
      className={`inline-flex items-center gap-1.5 border rounded-full px-3 py-1.5 text-[11px] font-semibold tracking-wide whitespace-nowrap ${
        paid
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
          : "border-amber-500/30 bg-amber-500/10 text-amber-400"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          paid ? "bg-emerald-400" : "bg-amber-400 animate-pulse"
        }`}
      />
      {displayType} · {paid ? "PAID" : "PENDING"}
    </span>
  );
};

const formatCurrency = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;

const formatDate = (date) => {
  if (!date) return "—";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
};

const getPaymentType = (order) => {
  const value =
    order.paymentMethod ||
    order.paymentType ||
    order.paymentMode ||
    order.paymentMethodName ||
    (order.transactionId ? "Prepaid" : "COD");

  return String(value).toLowerCase().includes("cod") ? "COD" : "Prepaid";
};

export default function OrderListDesign() {
  const [activeTab, setActiveTab] = useState("New");
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

      const timeout = setTimeout(() => setRefreshPulse(false), 1200);

      return () => clearTimeout(timeout);
    }, 30000);

    return () => clearInterval(pulseInterval);
  }, []);

  useEffect(() => {
    const checkScreenSize = () => setMobileView(window.innerWidth < 768);

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    if (!isFilterModalOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isFilterModalOpen]);

  const paidOrders = useMemo(
    () => safeOrders.filter((order) => order.payStatus === "paid"),
    [safeOrders]
  );

  const tabCounts = useMemo(() => {
    const unpaidOrders = safeOrders.filter(
      (order) => order.payStatus !== "paid"
    );

    return {
      New: paidOrders.filter(
        (order) => !order.orderAccept && !order.orderReject
      ).length,
      Accepted: paidOrders.filter(
        (order) => order.orderAccept && !order.orderDispatch
      ).length,
      Dispatched: paidOrders.filter(
        (order) => order.orderDispatch && !order.trackingId
      ).length,
      Rejected: paidOrders.filter((order) => order.orderReject).length,
      "All Orders": paidOrders.filter(
        (order) =>
          order.orderAccept &&
          !order.orderReject &&
          order.orderDispatch &&
          order.trackingId !== ""
      ).length,
      Unpaid: unpaidOrders.length,
    };
  }, [paidOrders, safeOrders]);

  useEffect(() => {
    setTabSignals((previous) => {
      const next = { ...previous };

      Object.keys(tabCounts).forEach((tab) => {
        const previousCount = previous[tab]?.lastCount || 0;

        next[tab] = {
          signal: tabCounts[tab] > previousCount,
          lastCount: tabCounts[tab],
        };
      });

      return next;
    });
  }, [tabCounts]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setTabSignals((previous) => ({
      ...previous,
      [tab]: {
        ...previous[tab],
        signal: false,
      },
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

      setTimeout(() => setRefreshing(false), 800);

      toast.success("Orders refreshed successfully", {
        theme: "dark",
      });
    } catch (error) {
      setRefreshing(false);

      toast.error("Failed to refresh orders", {
        theme: "dark",
      });
    }
  };

  const getOrderStatus = (order) => {
    if (order.orderReject) return "Rejected";
    if (order.orderDispatch && order.trackingId) return "Completed";
    if (order.orderDispatch) return "Dispatched";
    if (order.orderAccept) return "Accepted";
    return "New";
  };

  const exportOrders = async () => {
    setExporting(true);

    await new Promise((resolve) => setTimeout(resolve, 900));

    try {
      const ordersToExport = groupedOrders.paid.concat(groupedOrders.unpaid);

      if (!ordersToExport.length) {
        toast.info("There are no orders to export", { theme: "dark" });
        setExporting(false);
        return;
      }

      const data = ordersToExport.map((order) => {
        const productDetails =
          order.orderItems
            ?.map(
              (item) =>
                `${item.title} (Qty: ${item.qty}, Price: ₹${item.price})`
            )
            .join("; ") || "No items";

        const productsBreakdown =
          order.orderItems
            ?.map(
              (item, index) =>
                `Product ${index + 1}: ${item.title} | Qty: ${
                  item.qty
                } | Unit Price: ₹${(item.price / item.qty).toFixed(
                  2
                )} | Total: ₹${item.price}`
            )
            .join("\n") || "No products";

        return {
          "Order ID": order._id,
          "Order Date": order.orderDate
            ? new Date(order.orderDate).toLocaleDateString("en-IN")
            : "N/A",
          "Order Time": order.orderDate
            ? new Date(order.orderDate).toLocaleTimeString("en-IN")
            : "N/A",
          "Order Status": getOrderStatus(order),
          "Payment Status": order.payStatus === "paid" ? "Paid" : "Unpaid",
          "Payment Type": getPaymentType(order),
          "Total Amount": Number(order.amount || 0).toFixed(2),
          "Items Count": order.orderItems?.length || 0,
          "Transaction ID": order.transactionId || "N/A",
          "Customer Name": order.userShipping?.FullName || "N/A",
          "Customer Phone": order.userShipping?.Phone || "N/A",
          "Shipping Address": order.userShipping?.Add || "N/A",
          "City/Village": order.userShipping?.VillorCity || "N/A",
          District: order.userShipping?.Dist || "N/A",
          State: order.userShipping?.State || "N/A",
          "PIN Code": order.userShipping?.Pin || "N/A",
          "Order Accepted": order.orderAccept ? "Yes" : "No",
          "Order Rejected": order.orderReject ? "Yes" : "No",
          "Order Dispatched": order.orderDispatch ? "Yes" : "No",
          "Tracking ID": order.trackingId || "Not Assigned",
          "Products Summary": productDetails,
          "Total Products Value": Number(order.amount || 0).toFixed(2),
          "Products Detailed": productsBreakdown,
          "Export Date": new Date().toLocaleDateString("en-IN"),
          "Export Time": new Date().toLocaleTimeString("en-IN"),
          "Records Count": ordersToExport.length,
        };
      });

      const headers = Object.keys(data[0]);

      const csvContent = [
        headers.join(","),
        ...data.map((row) =>
          headers
            .map((header) => {
              const value = row[header];

              if (
                typeof value === "string" &&
                (value.includes(",") ||
                  value.includes('"') ||
                  value.includes("\n"))
              ) {
                return `"${value.replace(/"/g, '""')}"`;
              }

              return value;
            })
            .join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const timestamp = new Date().toISOString().split("T")[0];

      link.href = url;
      link.download = `orders_export_${timestamp}_${ordersToExport.length}_records.csv`;
      link.style.visibility = "hidden";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setTimeout(() => setExporting(false), 500);

      toast.success(`Exported ${ordersToExport.length} orders successfully`, {
        theme: "dark",
        autoClose: 2500,
      });
    } catch (error) {
      console.error("Export error:", error);
      setExporting(false);

      toast.error("Failed to export orders. Please try again.", {
        theme: "dark",
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

        if (activeTab === "New") {
          tabMatch = !order.orderAccept && !order.orderReject;
        } else if (activeTab === "Accepted") {
          tabMatch = order.orderAccept && !order.orderDispatch;
        } else if (activeTab === "Rejected") {
          tabMatch = order.orderReject;
        } else if (activeTab === "Dispatched") {
          tabMatch = order.orderDispatch && !order.trackingId;
        } else if (activeTab === "All Orders") {
          // All Orders = every paid order, regardless of workflow status.
          tabMatch = true;
        } else {
          tabMatch = true;
        }
      }

      if (!tabMatch) return false;

      const search = searchTerm.trim().toLowerCase();

      const matchesSearch =
        !search ||
        String(order._id || "")
          .toLowerCase()
          .includes(search) ||
        String(order.userShipping?.FullName || "")
          .toLowerCase()
          .includes(search);

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
        (!fromDate || orderDate >= fromDate) &&
        (!toDate || orderDate <= toDate);

      return matchesSearch && matchesPayment && matchesDate;
    });

    const grouped = filtered.reduce(
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

    // UX:
    // • All Orders  → newest first (today → yesterday → older)
    // • Every other tab → oldest first (older → yesterday → today)
    const sortByDate = (a, b) => {
      const aTime = new Date(a.orderDate).getTime();
      const bTime = new Date(b.orderDate).getTime();

      const safeA = Number.isFinite(aTime) ? aTime : 0;
      const safeB = Number.isFinite(bTime) ? bTime : 0;

      return activeTab === "All Orders"
        ? safeB - safeA
        : safeA - safeB;
    };

    grouped.paid.sort(sortByDate);
    grouped.unpaid.sort(sortByDate);

    return grouped;
  }, [safeOrders, activeTab, searchTerm, filterPayment, dateRange]);

  const visibleOrders = useMemo(() => {
    const merged = [...groupedOrders.unpaid, ...groupedOrders.paid];

    return merged.sort((a, b) => {
      const aTime = new Date(a.orderDate).getTime();
      const bTime = new Date(b.orderDate).getTime();

      const safeA = Number.isFinite(aTime) ? aTime : 0;
      const safeB = Number.isFinite(bTime) ? bTime : 0;

      return activeTab === "All Orders"
        ? safeB - safeA
        : safeA - safeB;
    });
  }, [groupedOrders, activeTab]);

  const totalFilteredCount = visibleOrders.length;

  const totalRevenue = paidOrders.reduce(
    (sum, order) => sum + Number(order.amount || 0),
    0
  );

  const dispatchedPaidOrders = paidOrders.filter(
    (order) => order.orderDispatch
  ).length;

  // Workflow-first tab order:
  // New → Accepted → Dispatched → Rejected → All Orders → Unpaid
  const tabs = [
    "New",
    "Accepted",
    "Dispatched",
    "All Orders",
    "Rejected",
    "Unpaid",
  ];

  if (selectedOrder) {
    return (
      <OrderDetails
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    );
  }

  return (
    <div className="min-h-full w-full bg-[#101010] text-white">
      <div className="mx-auto w-full max-w-[1800px] space-y-5 p-3 sm:p-5 lg:p-6">
        {/* =====================================================
            HEADER
        ====================================================== */}
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#151515] px-4 py-4 shadow-[0_20px_60px_rgba(0,0,0,0.28)] sm:px-6">
          <div className="pointer-events-none absolute -right-20 -top-24 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10">
                  <ShoppingCart className="h-4 w-4 text-blue-400" />
                </div>

                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                    Order Management
                  </h1>
                  <span className="hidden rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/50 sm:inline-flex">
                    Live
                  </span>
                </div>
              </div>

              <p className="pl-0 text-xs text-white/45 sm:pl-11">
                Manage, review and track customer orders · {safeOrders.length}{" "}
                total
              </p>
            </div>

            <div className="flex w-full gap-2 sm:w-auto">
              <button
                onClick={refreshData}
                disabled={refreshing}
                className={`group relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all duration-300 sm:flex-none ${
                  refreshing || refreshPulse
                    ? "border-blue-400/30 bg-blue-500/10 text-blue-300"
                    : "border-white/10 bg-white/[0.03] text-white/70 hover:border-blue-400/30 hover:bg-blue-500/10 hover:text-blue-300"
                }`}
              >
                <RefreshCw
                  className={`h-4 w-4 transition-transform duration-500 ${
                    refreshing
                      ? "animate-spin"
                      : "group-hover:rotate-180"
                  }`}
                />
                <span>{refreshing ? "Refreshing..." : "Refresh"}</span>

                <span
                  className={`absolute right-2 top-2 h-1.5 w-1.5 rounded-full ${
                    refreshing
                      ? "animate-ping bg-amber-400"
                      : "bg-emerald-400"
                  }`}
                />
              </button>

              <button
                onClick={exportOrders}
                disabled={exporting || totalFilteredCount === 0}
                className="group relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-2.5 text-xs font-semibold text-blue-300 transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-400/50 hover:bg-blue-500/20 hover:shadow-[0_10px_30px_rgba(59,130,246,0.12)] disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
              >
                <div className="absolute inset-y-0 left-0 w-16 -translate-x-20 -skew-x-12 bg-white/10 transition-transform duration-700 group-hover:translate-x-[300px]" />

                {exporting ? (
                  <RefreshCw className="relative h-4 w-4 animate-spin" />
                ) : (
                  <Download className="relative h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
                )}

                <span className="relative">
                  {exporting ? "Exporting..." : "Export CSV"}
                </span>

                {!exporting && totalFilteredCount > 0 && (
                  <span className="relative rounded-full bg-blue-400/15 px-1.5 py-0.5 text-[9px] text-blue-300">
                    {totalFilteredCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* =====================================================
            KPI STRIP
        ====================================================== */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          <StatCard
            icon={ShoppingCart}
            label="Paid Orders"
            value={paidOrders.length}
            helper="Ready for processing"
            accent="blue"
          />

          <StatCard
            icon={Package}
            label="New Orders"
            value={tabCounts.New || 0}
            helper="Awaiting action"
            accent="violet"
          />

          <StatCard
            icon={IndianRupee}
            label="Revenue"
            value={formatCurrency(totalRevenue)}
            helper="All time earnings"
            accent="emerald"
          />

          <StatCard
            icon={Truck}
            label="Dispatched"
            value={dispatchedPaidOrders}
            helper="On the way"
            accent="amber"
          />
        </div>

        {/* =====================================================
            MAIN PANEL
        ====================================================== */}
        <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#151515] shadow-[0_25px_70px_rgba(0,0,0,0.28)]">
          {/* Tabs */}
          <div className="border-b border-white/[0.08] bg-[#141414]">
            <div className="scrollbar-none flex overflow-x-auto px-2 sm:px-4">
              {tabs.map((tab) => {
                const count = tabCounts[tab] || 0;
                const active = activeTab === tab;
                const signal = tabSignals[tab]?.signal;

                return (
                  <button
                    key={tab}
                    onClick={() => handleTabClick(tab)}
                    className={`relative flex shrink-0 items-center gap-2 px-3 py-3.5 text-[11px] font-semibold uppercase tracking-wide transition-all duration-300 sm:px-4 ${
                      active
                        ? "text-blue-400"
                        : "text-white/40 hover:text-white/75"
                    }`}
                  >
                    {tab}

                    <span
                      className={`min-w-[22px] rounded-full px-1.5 py-0.5 text-center text-[9px] ${
                        active
                          ? "bg-blue-500/15 text-blue-300"
                          : "bg-white/[0.05] text-white/35"
                      }`}
                    >
                      {count}
                    </span>

                    {signal && (
                      <span className="absolute right-1 top-2 h-1.5 w-1.5 animate-ping rounded-full bg-blue-400" />
                    )}

                    <span
                      className={`absolute bottom-0 left-2 right-2 h-0.5 origin-center rounded-full bg-blue-400 transition-all duration-300 ${
                        active ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search / Filter Toolbar */}
          <div className="border-b border-white/[0.08] bg-[#151515] p-3 sm:p-4">
            <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
              <div className="relative min-w-0 flex-1">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search order ID or customer..."
                  className="h-11 w-full rounded-xl border border-white/[0.08] bg-[#101010] pl-10 pr-10 text-xs text-white outline-none transition-all placeholder:text-white/25 focus:border-blue-500/40 focus:bg-[#111111] focus:ring-2 focus:ring-blue-500/10"
                />

                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-white/30 transition hover:bg-white/5 hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="hidden items-center gap-2 lg:flex">
                <DateInput
                  value={dateRange.from}
                  onChange={(value) =>
                    setDateRange((previous) => ({
                      ...previous,
                      from: value,
                    }))
                  }
                />

                <span className="text-white/20">—</span>

                <DateInput
                  value={dateRange.to}
                  onChange={(value) =>
                    setDateRange((previous) => ({
                      ...previous,
                      to: value,
                    }))
                  }
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsFilterModalOpen(true)}
                  className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-[#101010] px-4 text-xs font-semibold text-white/60 transition hover:border-blue-500/30 hover:bg-blue-500/5 hover:text-blue-300 lg:flex-none"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                  {filterPayment !== "All" ||
                  dateRange.from ||
                  dateRange.to ? (
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                  ) : null}
                </button>

                {(searchTerm ||
                  filterPayment !== "All" ||
                  dateRange.from ||
                  dateRange.to) && (
                  <button
                    onClick={handleClearFilters}
                    className="h-11 rounded-xl border border-red-500/15 bg-red-500/5 px-4 text-xs font-semibold text-red-400 transition hover:bg-red-500/10"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Results Header */}
          <div className="flex flex-col gap-2 border-b border-white/[0.06] bg-[#121212] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              <p className="text-[11px] font-medium text-white/45">
                Showing{" "}
                <span className="font-semibold text-white/80">
                  {totalFilteredCount}
                </span>{" "}
                of {safeOrders.length} orders
                <span className="ml-2 hidden text-white/25 sm:inline">
                  · {activeTab === "All Orders" ? "Newest first" : "Oldest first"}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-white/30">
              <Clock3 className="h-3.5 w-3.5" />
              Live order updates
            </div>
          </div>

          {/* Orders */}
          <div className="relative">
            {mobileView ? (
              <MobileOrders
                orders={visibleOrders}
                setSelectedOrder={setSelectedOrder}
                getOrderStatus={getOrderStatus}
              />
            ) : (
              <DesktopOrderTable
                orders={visibleOrders}
                setSelectedOrder={setSelectedOrder}
                getOrderStatus={getOrderStatus}
              />
            )}
          </div>
        </section>
      </div>

      {/* =====================================================
          FULL-SCREEN RESPONSIVE FILTER
          - Mobile: complete viewport filter experience
          - Tablet/Desktop: centered glass panel with backdrop
      ====================================================== */}
      {isFilterModalOpen && (
        <div
          className="fixed inset-0 z-[100] bg-[#080808]/95 backdrop-blur-xl"
          onClick={() => setIsFilterModalOpen(false)}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="flex h-[100dvh] w-full flex-col bg-[#111111] animate-[filterIn_.28s_ease-out]"
          >
            {/* Filter Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-white/[0.08] bg-[#151515] px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10">
                  <Filter className="h-4 w-4 text-blue-400" />
                </div>

                <div>
                  <h3 className="text-base font-bold text-white sm:text-lg">
                    Filter Orders
                  </h3>
                  <p className="mt-0.5 text-[10px] text-white/35 sm:text-[11px]">
                    Refine your order list
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsFilterModalOpen(false)}
                aria-label="Close filters"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/50 transition hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Filter Content */}
            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="mx-auto w-full max-w-5xl p-4 sm:p-6 lg:p-8">
                <div className="mb-5 rounded-2xl border border-blue-500/10 bg-blue-500/[0.04] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-300/70">
                        Current View
                      </p>
                      <p className="mt-1 text-sm font-bold text-white">
                        {activeTab}
                      </p>
                    </div>

                    <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-[10px] font-semibold text-white/45">
                      {totalFilteredCount} results
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  {/* Payment Filter */}
                  <div className="rounded-2xl border border-white/[0.08] bg-[#151515] p-4 sm:p-5">
                    <div className="mb-4">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-white/35">
                        Payment Status
                      </p>
                      <p className="mt-1 text-xs text-white/25">
                        Choose which payment state should be displayed.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                      {["All", "Paid", "Not Paid"].map((option) => {
                        const active = filterPayment === option;

                        return (
                          <button
                            key={option}
                            onClick={() => setFilterPayment(option)}
                            className={`flex min-h-12 items-center justify-between rounded-xl border px-4 text-xs font-semibold transition-all duration-200 ${
                              active
                                ? "border-blue-500/35 bg-blue-500/10 text-blue-300 shadow-[0_0_25px_rgba(59,130,246,0.08)]"
                                : "border-white/[0.08] bg-[#101010] text-white/45 hover:border-white/15 hover:text-white/75"
                            }`}
                          >
                            <span>{option}</span>
                            {active && (
                              <CheckCircle2 className="h-4 w-4 text-blue-400" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Date Filter */}
                  <div className="rounded-2xl border border-white/[0.08] bg-[#151515] p-4 sm:p-5">
                    <div className="mb-4">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-white/35">
                        Date Range
                      </p>
                      <p className="mt-1 text-xs text-white/25">
                        Select the start and end dates for orders.
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-[10px] font-medium text-white/35">
                          From
                        </label>
                        <DateInput
                          value={dateRange.from}
                          onChange={(value) =>
                            setDateRange((previous) => ({
                              ...previous,
                              from: value,
                            }))
                          }
                          fullWidth
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-[10px] font-medium text-white/35">
                          To
                        </label>
                        <DateInput
                          value={dateRange.to}
                          onChange={(value) =>
                            setDateRange((previous) => ({
                              ...previous,
                              to: value,
                            }))
                          }
                          fullWidth
                        />
                      </div>
                    </div>
                  </div>

                  {/* Quick Dates */}
                  <div className="rounded-2xl border border-white/[0.08] bg-[#151515] p-4 sm:p-5 lg:col-span-2">
                    <div className="mb-4">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-white/35">
                        Quick Date Filters
                      </p>
                      <p className="mt-1 text-xs text-white/25">
                        Quickly set a common date range.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {[
                        { label: "Today", days: 0 },
                        { label: "Last 7 Days", days: 7 },
                        { label: "Last 30 Days", days: 30 },
                        { label: "Clear Date", days: null },
                      ].map((option) => (
                        <button
                          key={option.label}
                          onClick={() => {
                            if (option.days === null) {
                              setDateRange({ from: "", to: "" });
                              return;
                            }

                            const today = new Date();
                            const from = new Date(today);
                            from.setDate(today.getDate() - option.days);

                            const toInput = (date) => {
                              const year = date.getFullYear();
                              const month = String(
                                date.getMonth() + 1
                              ).padStart(2, "0");
                              const day = String(date.getDate()).padStart(
                                2,
                                "0"
                              );
                              return `${year}-${month}-${day}`;
                            };

                            setDateRange({
                              from: toInput(from),
                              to: toInput(today),
                            });
                          }}
                          className="min-h-11 rounded-xl border border-white/[0.08] bg-[#101010] px-3 text-[11px] font-semibold text-white/45 transition hover:border-blue-500/25 hover:bg-blue-500/5 hover:text-blue-300"
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Bottom Actions */}
            <div className="shrink-0 border-t border-white/[0.08] bg-[#151515]/95 p-3 backdrop-blur-xl sm:px-6 sm:py-4 lg:px-8">
              <div className="mx-auto flex w-full max-w-5xl gap-2">
                <button
                  onClick={() => {
                    handleClearFilters();
                    setIsFilterModalOpen(false);
                  }}
                  className="flex-1 rounded-xl border border-red-500/15 bg-red-500/5 py-3.5 text-xs font-semibold text-red-400 transition hover:bg-red-500/10 sm:flex-none sm:px-8"
                >
                  Clear Filters
                </button>

                <button
                  onClick={() => setIsFilterModalOpen(false)}
                  className="flex-1 rounded-xl bg-blue-500 py-3.5 text-xs font-bold text-white shadow-[0_10px_30px_rgba(59,130,246,0.18)] transition hover:bg-blue-400 active:scale-[0.99] sm:flex-none sm:px-10"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer
        position="bottom-right"
        autoClose={2000}
        newestOnTop
        theme="dark"
      />

      {/* Small component-scoped animation helpers */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(25px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes filterIn {
          from { opacity: 0; transform: scale(0.985); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes rowIn {
          from { opacity: 0; transform: translateY(7px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }

        .scrollbar-none {
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({ icon: Icon, label, value, helper, accent }) {
  const accentMap = {
    blue: {
      icon: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/15",
    },
    violet: {
      icon: "text-violet-400",
      bg: "bg-violet-500/10",
      border: "border-violet-500/15",
    },
    emerald: {
      icon: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/15",
    },
    amber: {
      icon: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/15",
    },
  };

  const colors = accentMap[accent];

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#151515] p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/15 hover:shadow-[0_15px_45px_rgba(0,0,0,0.25)] sm:p-4`}
    >
      <div
        className={`absolute -right-5 -top-5 h-20 w-20 rounded-full ${colors.bg} opacity-40 blur-2xl transition-transform duration-500 group-hover:scale-150`}
      />

      <div className="relative flex items-center gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${colors.border} ${colors.bg}`}
        >
          <Icon className={`h-4 w-4 ${colors.icon}`} />
        </div>

        <div className="min-w-0">
          <p className="truncate text-[9px] font-semibold uppercase tracking-wider text-white/30">
            {label}
          </p>
          <p className="mt-0.5 truncate text-lg font-bold text-white sm:text-xl">
            {value}
          </p>
        </div>
      </div>

      <p className="relative mt-2 hidden truncate text-[10px] text-white/25 sm:block">
        {helper}
      </p>
    </div>
  );
}

/* =========================================================
   DATE INPUT
========================================================= */

function DateInput({ value, onChange, fullWidth = false }) {
  return (
    <div
      className={`relative ${
        fullWidth ? "w-full" : "w-[145px]"
      }`}
    >
      <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/25" />

      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-xl border border-white/[0.08] bg-[#101010] pl-9 pr-2 text-[11px] text-white/60 outline-none transition focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10 [color-scheme:dark]"
      />
    </div>
  );
}

/* =========================================================
   DESKTOP TABLE
========================================================= */

function DesktopOrderTable({
  orders,
  setSelectedOrder,
  getOrderStatus,
}) {
  if (!orders.length) {
    return <EmptyOrders />;
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[1050px] border-collapse">
        <thead>
          <tr className="border-b border-white/[0.08] bg-[#121212] text-left">
            <TableHead>Order</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Tracking</TableHead>
            <TableHead>Status</TableHead>
            <TableHead align="right">Total</TableHead>
            <TableHead align="right">Action</TableHead>
          </tr>
        </thead>

        <tbody>
          {orders.map((order, index) => (
            <DesktopOrderRow
              key={order._id || index}
              order={order}
              index={index}
              setSelectedOrder={setSelectedOrder}
              getOrderStatus={getOrderStatus}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TableHead({ children, align = "left" }) {
  return (
    <th
      className={`px-4 py-3.5 text-[10px] font-medium uppercase tracking-wider text-white/35 ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

function DesktopOrderRow({
  order,
  index,
  setSelectedOrder,
  getOrderStatus,
}) {
  const status = getOrderStatus(order);
  const customerName =
    order.userShipping?.FullName || order.userId || "Unknown customer";

  const city =
    order.userShipping?.VillorCity ||
    order.userShipping?.City ||
    order.userShipping?.city ||
    "—";

  const trackingId = order.trackingId || "—";

  return (
    <tr
      className="group border-b border-white/[0.065] bg-[#151515] transition-all duration-300 hover:bg-[#1a1a1a]"
      style={{
        animation: `rowIn .35s ease-out ${Math.min(index, 8) * 35}ms both`,
      }}
    >
      {/* Order */}
      <td className="px-4 py-4">
        <div className="min-w-[130px]">
          <button
            onClick={() => setSelectedOrder(order)}
            className="text-left text-xs font-bold text-white transition hover:text-blue-400"
          >
            {order._id || "—"}
          </button>

          <p className="mt-1 text-[10px] text-white/35">
            {formatDate(order.orderDate)}
          </p>
        </div>
      </td>

      {/* Customer */}
      <td className="px-4 py-4">
        <div className="min-w-[150px]">
          <p className="truncate text-xs font-semibold text-white/90">
            {customerName}
          </p>

          <p className="mt-1 flex items-center gap-1 text-[10px] text-white/35">
            <MapPin className="h-3 w-3" />
            {city}
          </p>
        </div>
      </td>

      {/* Items */}
      <td className="px-4 py-4">
        <span className="text-xs font-medium text-white/55">
          {order.orderItems?.length || 0}
        </span>
      </td>

      {/* Payment */}
      <td className="px-4 py-4">
        <PaymentBadge order={order} />
      </td>

      {/* Tracking */}
      <td className="px-4 py-4">
        <div className="min-w-[150px]">
          <p className="max-w-[180px] truncate text-[11px] font-medium text-white/70">
            {trackingId}
          </p>

          <p className="mt-1 text-[10px] text-white/30">
            {order.courierName ||
              order.courier ||
              order.shippingPartner ||
              "—"}
          </p>
        </div>
      </td>

      {/* Status */}
      <td className="px-4 py-4">
        <StatusBadge status={status} compact />
      </td>

      {/* Total */}
      <td className="px-4 py-4 text-right">
        <p className="text-xs font-bold text-white">
          {formatCurrency(order.amount)}
        </p>
      </td>

      {/* Action */}
      <td className="px-4 py-4 text-right">
        <button
          onClick={() => {
            setSelectedOrder(order);
            toast.info(`Opening order #${order._id}`, {
              theme: "dark",
            });
          }}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/10 bg-[#101010] px-3 text-[10px] font-semibold text-white/65 transition-all duration-300 hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.08)]"
        >
          Open
          <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </td>
    </tr>
  );
}

/* =========================================================
   MOBILE ORDERS
========================================================= */

function MobileOrders({
  orders,
  setSelectedOrder,
  getOrderStatus,
}) {
  if (!orders.length) {
    return <EmptyOrders />;
  }

  return (
    <div className="space-y-2.5 p-3">
      {orders.map((order, index) => (
        <MobileOrderCard
          key={order._id || index}
          order={order}
          index={index}
          setSelectedOrder={setSelectedOrder}
          getOrderStatus={getOrderStatus}
        />
      ))}
    </div>
  );
}

function MobileOrderCard({
  order,
  index,
  setSelectedOrder,
  getOrderStatus,
}) {
  const status = getOrderStatus(order);
  const customerName =
    order.userShipping?.FullName || order.userId || "Unknown customer";

  const city =
    order.userShipping?.VillorCity ||
    order.userShipping?.City ||
    order.userShipping?.city ||
    "—";

  return (
    <div
      className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#151515] transition-all duration-300 active:scale-[0.99]"
      style={{
        animation: `rowIn .35s ease-out ${Math.min(index, 8) * 35}ms both`,
      }}
    >
      <div className="flex items-start justify-between gap-3 border-b border-white/[0.06] p-4">
        <div className="min-w-0">
          <button
            onClick={() => setSelectedOrder(order)}
            className="block max-w-[210px] truncate text-xs font-bold text-white hover:text-blue-400"
          >
            {order._id || "—"}
          </button>

          <p className="mt-1 text-[10px] text-white/35">
            {formatDate(order.orderDate)}
          </p>
        </div>

        <StatusBadge status={status} compact />
      </div>

      <div className="grid grid-cols-2 gap-3 p-4">
        <MiniInfo
          icon={User}
          label="Customer"
          value={customerName}
        />

        <MiniInfo
          icon={MapPin}
          label="Location"
          value={city}
        />

        <MiniInfo
          icon={Box}
          label="Items"
          value={`${order.orderItems?.length || 0}`}
        />

        <MiniInfo
          icon={Truck}
          label="Tracking"
          value={order.trackingId || "Not assigned"}
        />
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-white/[0.06] bg-[#121212] p-3">
        <PaymentBadge order={order} />

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[9px] uppercase tracking-wider text-white/25">
              Total
            </p>
            <p className="text-sm font-bold text-white">
              {formatCurrency(order.amount)}
            </p>
          </div>

          <button
            onClick={() => {
              setSelectedOrder(order);
              toast.info(`Opening order #${order._id}`, {
                theme: "dark",
              });
            }}
            className="flex h-9 items-center gap-1.5 rounded-xl border border-blue-500/25 bg-blue-500/10 px-3 text-[10px] font-bold text-blue-300 transition hover:bg-blue-500/20"
          >
            <Eye className="h-3.5 w-3.5" />
            Open
          </button>
        </div>
      </div>
    </div>
  );
}

function MiniInfo({ icon: Icon, label, value }) {
  return (
    <div className="min-w-0">
      <div className="mb-1 flex items-center gap-1.5 text-white/25">
        <Icon className="h-3 w-3" />
        <span className="text-[9px] font-semibold uppercase tracking-wider">
          {label}
        </span>
      </div>

      <p className="truncate text-[11px] font-medium text-white/70">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyOrders() {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center px-6 py-16 text-center">
      <div className="relative mb-5">
        <div className="absolute inset-0 animate-pulse rounded-2xl bg-blue-500/10 blur-xl" />

        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-[#101010]">
          <Package className="h-7 w-7 text-white/20" />
        </div>
      </div>

      <h3 className="text-sm font-bold text-white/75">
        No Orders Found
      </h3>

      <p className="mt-2 max-w-xs text-[11px] leading-5 text-white/30">
        Try adjusting your search, payment filter or date range.
      </p>
    </div>
  );
}