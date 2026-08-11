import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Download,
  Eye,
  IndianRupee,
  Loader2,
  Package,
  PackageOpen,
  PieChart,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  Star,
  TrendingUp,
  Truck,
  Users,
  XCircle,
} from "lucide-react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { useAppContext } from "../../context/Context";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend
);

const COLORS = {
  bg: "#0b0b0b",
  card: "#171717",
  card2: "#121212",
  amber: "#f5a90b",
  blue: "#4ea5e8",
  green: "#3db878",
  pink: "#f25d75",
  purple: "#a879d0",
  gray: "#8b8b8b",
};

const currency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;

const compactCurrency = (value) => {
  const n = Number(value || 0);
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
};

const orderDate = (order) =>
  new Date(
    order?.orderDate ||
      order?.createdAt ||
      order?.date ||
      Date.now()
  );

const statusOf = (status) =>
  String(status || "pending")
    .toLowerCase()
    .trim()
    .replace(/[_-]/g, " ");

const quantityOf = (item) => Number(item?.quantity) || 1;

const priceOf = (item) =>
  Number(item?.price) ||
  Number(item?.rate) ||
  Number(item?.amount) ||
  0;

const productIdOf = (item) =>
  item?.product ||
  item?.productId ||
  item?._id ||
  item?.id ||
  null;

const getStock = (product) =>
  Number(
    product?.stock ??
      product?.quantity ??
      product?.availableStock ??
      product?.inventory ??
      0
  );

const AnimatedNumber = ({ value = 0, prefix = "", duration = 900 }) => {
  const [display, setDisplay] = useState(0);
  const target = Number(value) || 0;

  useEffect(() => {
    let frame;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(target * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return (
    <>
      {prefix}
      {display.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
    </>
  );
};

const Card = ({ children, className = "", hover = true }) => (
  <div
    className={`relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#171717] ${
      hover
        ? "transition-all duration-500 hover:-translate-y-0.5 hover:border-white/[0.13] hover:shadow-2xl"
        : ""
    } ${className}`}
  >
    {children}
  </div>
);

const StatCard = ({
  title,
  value,
  icon: Icon,
  growth,
  subtitle,
  accent = "amber",
  currencyValue = false,
  delay = 0,
}) => {
  const accentMap = {
    amber: {
      text: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      glow: "group-hover:shadow-amber-500/10",
    },
    blue: {
      text: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      glow: "group-hover:shadow-blue-500/10",
    },
    green: {
      text: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      glow: "group-hover:shadow-emerald-500/10",
    },
  };

  const theme = accentMap[accent] || accentMap.amber;
  const positive = Number(growth) >= 0;

  return (
    <Card
      className={`group animate-[fadeUp_.55s_ease_both] ${theme.glow}`}
    >
      <div
        className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-40"
        style={{ animationDelay: `${delay}ms` }}
      />
      <div className="absolute -right-14 -top-14 h-32 w-32 rounded-full bg-amber-500/[0.035] blur-3xl transition-all duration-700 group-hover:bg-amber-500/[0.08]" />

      <div className="relative p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#8b8b8b]">
              {title}
            </p>

            <p className="mt-4 text-[30px] font-bold tracking-tight text-white sm:text-[34px]">
              {currencyValue ? (
                <AnimatedNumber value={value} prefix="₹" />
              ) : (
                <AnimatedNumber value={value} />
              )}
            </p>

            <div className="mt-3 flex items-center gap-2">
              {growth !== undefined && growth !== null && (
                <span
                  className={`inline-flex items-center gap-1 text-xs font-semibold ${
                    positive ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {positive ? (
                    <ArrowUpRight size={13} />
                  ) : (
                    <ArrowDownRight size={13} />
                  )}
                  {Math.abs(Number(growth)).toFixed(1)}%
                </span>
              )}
              <span className="text-xs text-[#737373]">{subtitle}</span>
            </div>
          </div>

          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl border ${theme.bg} ${theme.text} ${theme.border} transition duration-500 group-hover:scale-110 group-hover:rotate-3`}
          >
            <Icon size={21} strokeWidth={1.8} />
          </div>
        </div>
      </div>
    </Card>
  );
};

const chartBase = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 1200, easing: "easeOutQuart" },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "#202020",
      borderColor: "rgba(255,255,255,.10)",
      borderWidth: 1,
      titleColor: "#fff",
      bodyColor: "#bdbdbd",
      padding: 12,
      displayColors: false,
    },
  },
};

const Dashboard = () => {
  const {
    allProduct,
    orders,
    allUser,
    getProduct,
    fetchOrders,
    getUsers,
    setTab
  } = useAppContext();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [range, setRange] = useState(30);
  const [rangeOpen, setRangeOpen] = useState(false);
  // 🔽 Default to "paid" so only paid orders appear first
  const [orderTab, setOrderTab] = useState("paid");

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        await Promise.all([
          getProduct ? getProduct() : Promise.resolve(),
          fetchOrders ? fetchOrders() : Promise.resolve(),
          getUsers ? getUsers() : Promise.resolve(),
        ]);
      } catch (error) {
        console.error("Dashboard loading error:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const refreshData = async () => {
    try {
      setRefreshing(true);
      await Promise.all([
        getProduct ? getProduct() : Promise.resolve(),
        fetchOrders ? fetchOrders() : Promise.resolve(),
        getUsers ? getUsers() : Promise.resolve(),
      ]);
    } catch (error) {
      console.error("Dashboard refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const allOrders = useMemo(() => {
    if (!Array.isArray(orders)) return [];

    return orders.map((order) => {
      const status = statusOf(
        order?.payStatus ||
          order?.paymentStatus ||
          order?.status
      );

      const itemCount = Array.isArray(order?.products)
        ? order.products.reduce(
            (sum, item) => sum + quantityOf(item),
            0
          )
        : 0;

      return {
        ...order,
        normalizedStatus: status,
        itemCount,
        orderDate: orderDate(order),
      };
    });
  }, [orders]);

  const paidOrders = useMemo(
    () =>
      allOrders.filter(
        (o) =>
          o.normalizedStatus === "paid" ||
          o.normalizedStatus === "payment successful"
      ),
    [allOrders]
  );

  const pendingOrders = useMemo(
    () =>
      allOrders.filter(
        (o) =>
          !["paid", "payment successful", "failed", "cancelled"].includes(
            o.normalizedStatus
          )
      ),
    [allOrders]
  );

  const failedOrders = useMemo(
    () =>
      allOrders.filter(
        (o) =>
          o.normalizedStatus === "failed" ||
          o.normalizedStatus === "cancelled"
      ),
    [allOrders]
  );

  const totalUsers = Array.isArray(allUser) ? allUser.length : 0;
  const totalProducts = Array.isArray(allProduct)
    ? allProduct.length
    : 0;
  const totalOrders = paidOrders.length;

  const totalRevenue = useMemo(
    () =>
      paidOrders.reduce(
        (sum, order) => sum + (Number(order?.amount) || 0),
        0
      ),
    [paidOrders]
  );

  const rangeStart = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - range + 1);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [range]);

  const previousPeriod = useMemo(() => {
    const end = new Date(rangeStart);
    const start = new Date(rangeStart);
    end.setDate(end.getDate() + range);
    start.setDate(start.getDate() - range);
    return { start, end };
  }, [rangeStart, range]);

  const rangeOrders = useMemo(
    () => paidOrders.filter((o) => o.orderDate >= rangeStart),
    [paidOrders, rangeStart]
  );

  const rangeRevenue = useMemo(
    () =>
      rangeOrders.reduce(
        (sum, order) => sum + (Number(order?.amount) || 0),
        0
      ),
    [rangeOrders]
  );

  const previousRevenue = useMemo(
    () =>
      paidOrders
        .filter(
          (o) =>
            o.orderDate >= previousPeriod.start &&
            o.orderDate < previousPeriod.end
        )
        .reduce(
          (sum, order) => sum + (Number(order?.amount) || 0),
          0
        ),
    [paidOrders, previousPeriod]
  );

  const previousOrders = useMemo(
    () =>
      paidOrders.filter(
        (o) =>
          o.orderDate >= previousPeriod.start &&
          o.orderDate < previousPeriod.end
      ).length,
    [paidOrders, previousPeriod]
  );

  const growth = (current, previous) =>
    previous
      ? ((current - previous) / previous) * 100
      : current > 0
      ? 100
      : 0;

  const revenueGrowth = growth(rangeRevenue, previousRevenue);
  const orderGrowth = growth(rangeOrders.length, previousOrders);

  const avgOrderValue = totalOrders
    ? totalRevenue / totalOrders
    : 0;

  const paymentSuccessRate = allOrders.length
    ? (paidOrders.length / allOrders.length) * 100
    : 0;

  const todayRevenue = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    return paidOrders
      .filter((o) => o.orderDate >= start && o.orderDate <= end)
      .reduce(
        (sum, order) => sum + (Number(order?.amount) || 0),
        0
      );
  }, [paidOrders]);

  const todayOrders = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    return paidOrders.filter(
      (o) => o.orderDate >= start && o.orderDate <= end
    ).length;
  }, [paidOrders]);

  const revenueChart = useMemo(() => {
    const labels = [];
    const values = [];

    for (let i = range - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);

      const next = new Date(d);
      next.setDate(next.getDate() + 1);

      const value = paidOrders
        .filter((o) => o.orderDate >= d && o.orderDate < next)
        .reduce(
          (sum, order) => sum + (Number(order?.amount) || 0),
          0
        );

      labels.push(
        d.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
        })
      );
      values.push(value);
    }

    return { labels, values };
  }, [paidOrders, range]);

  const revenueData = {
    labels: revenueChart.labels,
    datasets: [
      {
        label: "Revenue",
        data: revenueChart.values,
        borderColor: COLORS.amber,
        backgroundColor: "rgba(245,169,11,.10)",
        fill: true,
        tension: 0.45,
        borderWidth: 2.5,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: COLORS.amber,
        pointHoverBorderColor: "#171717",
        pointHoverBorderWidth: 3,
      },
    ],
  };

  const revenueOptions = {
    ...chartBase,
    interaction: { intersect: false, mode: "index" },
    plugins: {
      ...chartBase.plugins,
      tooltip: {
        ...chartBase.plugins.tooltip,
        callbacks: {
          label: (ctx) => `Revenue: ${currency(ctx.raw)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          color: "#6f6f6f",
          font: { size: 10 },
          maxTicksLimit: range === 30 ? 7 : 10,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(255,255,255,.055)",
        },
        border: { display: false },
        ticks: {
          color: "#6f6f6f",
          font: { size: 10 },
          callback: (v) => compactCurrency(v),
        },
      },
    },
  };

  const categoryEntries = useMemo(() => {
    const map = {};

    if (Array.isArray(allProduct)) {
      allProduct.forEach((product) => {
        const category =
          product?.category ||
          product?.subCategory ||
          "Other";
        map[category] = (map[category] || 0) + 1;
      });
    }

    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7);
  }, [allProduct]);

  const categoryColors = [
    COLORS.amber,
    COLORS.blue,
    COLORS.green,
    COLORS.pink,
    COLORS.purple,
    "#8b8b8b",
    "#e4a14b",
  ];

  const categoryData = {
    labels: categoryEntries.map(([name]) => name),
    datasets: [
      {
        data: categoryEntries.map(([, value]) => value),
        backgroundColor: categoryColors,
        borderColor: "#171717",
        borderWidth: 4,
        hoverOffset: 8,
      },
    ],
  };

  const categoryOptions = {
    ...chartBase,
    cutout: "68%",
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1200,
    },
  };

  const ordersPerDay = useMemo(() => {
    const labels = [];
    const values = [];
    const days = 14;

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);

      const next = new Date(d);
      next.setDate(next.getDate() + 1);

      const count = paidOrders.filter(
        (o) => o.orderDate >= d && o.orderDate < next
      ).length;

      labels.push(
        d.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
        })
      );
      values.push(count);
    }

    return { labels, values };
  }, [paidOrders]);

  const orderBarData = {
    labels: ordersPerDay.labels,
    datasets: [
      {
        label: "Orders",
        data: ordersPerDay.values,
        backgroundColor: COLORS.blue,
        borderRadius: 7,
        maxBarThickness: 24,
      },
    ],
  };

  const orderBarOptions = {
    ...chartBase,
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: "#707070", font: { size: 10 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(255,255,255,.05)" },
        border: { display: false },
        ticks: { color: "#707070", precision: 0 },
      },
    },
  };

  const uploadData = useMemo(() => {
    const labels = [];
    const values = [];

    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);

      const next = new Date(d);
      next.setDate(next.getDate() + 1);

      const count = Array.isArray(allProduct)
        ? allProduct.filter((p) => {
            const created = new Date(
              p?.createdAt ||
                p?.createdDate ||
                p?.date ||
                0
            );
            return created >= d && created < next;
          }).length
        : 0;

      labels.push(
        d.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
        })
      );
      values.push(count);
    }

    return { labels, values };
  }, [allProduct]);

  const uploadChartData = {
    labels: uploadData.labels,
    datasets: [
      {
        label: "Uploads",
        data: uploadData.values,
        backgroundColor: COLORS.green,
        borderRadius: 7,
        maxBarThickness: 24,
      },
    ],
  };

  const uploadChartOptions = {
    ...orderBarOptions,
    scales: {
      ...orderBarOptions.scales,
      y: {
        ...orderBarOptions.scales.y,
        ticks: { color: "#707070", precision: 0 },
      },
    },
  };

  const topProducts = useMemo(() => {
    if (!Array.isArray(allProduct)) return [];

    const revenueMap = {};

    paidOrders.forEach((order) => {
      if (!Array.isArray(order?.products)) return;

      order.products.forEach((item) => {
        const id = productIdOf(item);
        if (!id) return;

        revenueMap[id] =
          (revenueMap[id] || 0) +
          priceOf(item) * quantityOf(item);
      });
    });

    return Object.entries(revenueMap)
      .map(([id, revenue]) => {
        const product = allProduct.find(
          (p) =>
            String(p?._id) === String(id) ||
            String(p?.id) === String(id)
        );

        return {
          id,
          revenue,
          name: product?.name || "Unknown Product",
          image:
            product?.image ||
            product?.images?.[0] ||
            null,
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);
  }, [allProduct, paidOrders]);

  const awaitingDispatch = useMemo(
    () =>
      allOrders.filter((order) => {
        const status = statusOf(
          order?.deliveryStatus ||
            order?.orderStatus ||
            order?.status
        );
        return (
          status.includes("pending") ||
          status.includes("packing") ||
          status.includes("processing") ||
          status.includes("dispatch")
        );
      }),
    [allOrders]
  );

  const packingCount = useMemo(
    () =>
      allOrders.filter((order) =>
        statusOf(
          order?.deliveryStatus ||
            order?.orderStatus ||
            order?.status
        ).includes("packing")
      ).length,
    [allOrders]
  );

  const stockAlerts = useMemo(() => {
    if (!Array.isArray(allProduct)) return [];

    return allProduct
      .map((product) => ({
        ...product,
        stockValue: getStock(product),
      }))
      .filter((product) => product.stockValue <= 3)
      .sort((a, b) => a.stockValue - b.stockValue)
      .slice(0, 5);
  }, [allProduct]);

  // 🔽 Recent orders – now uses the selected tab (default "paid")
  const recentOrders = useMemo(() => {
    const list =
      orderTab === "paid"
        ? paidOrders
        : orderTab === "pending"
        ? pendingOrders
        : orderTab === "failed"
        ? failedOrders
        : allOrders;

    return [...list]
      .sort((a, b) => b.orderDate - a.orderDate)
      .slice(0, 7);
  }, [
    orderTab,
    allOrders,
    paidOrders,
    pendingOrders,
    failedOrders,
  ]);

  const goToOrders = useCallback(() => {
       setTab(3);
     }, [setTab]);

    const goToUpload = useCallback(() => {
       setTab(4);
     }, [setTab]);

  const exportDashboardData = async () => {
    try {
      setExporting(true);

      const rows = [
        ["DARSH Dashboard Analytics"],
        ["Export Date", new Date().toLocaleString("en-IN")],
        ["Revenue", totalRevenue],
        ["Orders", totalOrders],
        ["Products", totalProducts],
        ["Users", totalUsers],
        ["Average Order Value", avgOrderValue],
        ["Payment Success Rate", `${paymentSuccessRate.toFixed(1)}%`],
        ["Revenue Growth", `${revenueGrowth.toFixed(1)}%`],
        ["Order Growth", `${orderGrowth.toFixed(1)}%`],
      ];

      const csv = rows
        .map((row) =>
          row
            .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
            .join(",")
        )
        .join("\n");

      const blob = new Blob([csv], {
        type: "text/csv;charset=utf-8;",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `darsh-dashboard-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);
    } finally {
      setTimeout(() => setExporting(false), 400);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] px-4 py-6 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1600px] animate-pulse space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-9 w-48 rounded-lg bg-white/[0.06]" />
              <div className="mt-3 h-4 w-72 rounded bg-white/[0.04]" />
            </div>
            <div className="h-11 w-40 rounded-xl bg-white/[0.06]" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-40 rounded-2xl border border-white/[0.06] bg-[#171717]"
              />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
            <div className="h-[430px] rounded-2xl bg-[#171717] xl:col-span-2" />
            <div className="h-[430px] rounded-2xl bg-[#171717]" />
          </div>

          <div className="fixed inset-0 flex items-center justify-center">
            <div className="flex items-center gap-3 rounded-full border border-white/10 bg-[#171717]/95 px-5 py-3 shadow-2xl">
              <Loader2
                size={18}
                className="animate-spin text-amber-400"
              />
              <span className="text-sm text-white">
                Loading DARSH dashboard...
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b0b] px-4 py-5 text-white sm:px-6 lg:px-8">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(120%); }
        }
        .dashboard-scroll::-webkit-scrollbar { width: 5px; height: 5px; }
        .dashboard-scroll::-webkit-scrollbar-track { background: transparent; }
        .dashboard-scroll::-webkit-scrollbar-thumb { background: #303030; border-radius: 999px; }
      `}</style>

      <div className="mx-auto max-w-[1600px]">
        {/* Header */}
        <header className="mb-7 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-[30px] font-bold tracking-tight text-white sm:text-[38px]">
                  Dashboard
                </h1>
                <p className="mt-1 text-sm text-[#858585]">
                  {paidOrders.length} orders · {totalProducts} products in the
                  DARSH catalogue
                </p>
              </div>

              <div className="hidden h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 sm:flex">
                <Sparkles size={17} />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="hidden items-center gap-2 rounded-xl border border-white/[0.08] bg-[#141414] px-4 py-3 lg:flex">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </span>
              <span className="text-xs font-medium text-[#9a9a9a]">
                Live analytics
              </span>
            </div>

            <button
              type="button"
              onClick={refreshData}
              disabled={refreshing}
              className="group flex h-11 items-center gap-2 rounded-xl border border-white/[0.09] bg-[#151515] px-4 text-sm font-medium text-[#c9c9c9] transition hover:border-amber-500/30 hover:bg-[#1b1b1b] hover:text-white disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={
                  refreshing
                    ? "animate-spin text-amber-400"
                    : "transition-transform duration-500 group-hover:rotate-180"
                }
              />
              <span className="hidden sm:inline">
                {refreshing ? "Refreshing..." : "Refresh"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                goToOrders();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="flex h-11 items-center gap-2 rounded-xl border border-white/[0.1] bg-[#151515] px-5 text-sm font-medium text-white transition hover:border-white/20 hover:bg-[#202020]"
            >
              <ShoppingBag size={17} />
              View orders
            </button>

            <button
              type="button"
              onClick={() => {
                goToUpload();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="group relative flex h-11 items-center gap-2 overflow-hidden rounded-xl bg-[#f5a90b] px-5 text-sm font-semibold text-black shadow-[0_8px_30px_rgba(245,169,11,.16)] transition hover:-translate-y-0.5 hover:bg-[#ffb51b] hover:shadow-[0_12px_35px_rgba(245,169,11,.24)]"
            >
              <PackageOpen size={17} />
              Upload product
              <span className="absolute inset-0 -translate-x-full skew-x-[-15deg] bg-white/20 transition-transform duration-700 group-hover:translate-x-full" />
            </button>
          </div>
        </header>

        {/* KPI */}
        <section className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title={`Revenue (${range}D)`}
            value={rangeRevenue}
            currencyValue
            icon={IndianRupee}
            growth={revenueGrowth}
            subtitle="vs previous period"
            delay={50}
          />
          <StatCard
            title={`Orders (${range}D)`}
            value={rangeOrders.length}
            icon={ShoppingBag}
            growth={orderGrowth}
            subtitle="vs previous period"
            delay={100}
          />
          <StatCard
            title="Avg order value"
            value={avgOrderValue}
            currencyValue
            icon={TrendingUp}
            accent="blue"
            subtitle={`last ${range} days`}
            delay={150}
          />
          <StatCard
            title="Awaiting dispatch"
            value={awaitingDispatch.length}
            icon={Truck}
            subtitle={`${packingCount} packing`}
            delay={200}
          />
        </section>

        {/* Today mini stats */}
        <section className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            [
              "Today revenue",
              currency(todayRevenue),
              IndianRupee,
              "text-amber-400",
            ],
            ["Today orders", todayOrders, ShoppingBag, "text-blue-400"],
            [
              "Success rate",
              `${paymentSuccessRate.toFixed(1)}%`,
              CheckCircle2,
              "text-emerald-400",
            ],
            ["Total users", totalUsers, Users, "text-purple-400"],
          ].map(([label, value, Icon, color]) => (
            <div
              key={label}
              className="group rounded-xl border border-white/[0.06] bg-[#121212] px-4 py-3.5 transition hover:border-white/[0.12] hover:bg-[#151515]"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.12em] text-[#686868]">
                    {label}
                  </p>
                  <p className={`mt-1 text-base font-bold ${color}`}>{value}</p>
                </div>
                <Icon
                  size={18}
                  className={`${color} opacity-70 transition group-hover:scale-110`}
                />
              </div>
            </div>
          ))}
        </section>

        {/* Main charts */}
        <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          <Card className="p-5 sm:p-6 xl:col-span-2">
            <div className="absolute -right-24 -top-24 h-60 w-60 rounded-full bg-amber-500/[0.035] blur-3xl" />

            <div className="relative mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold">Revenue trend</h2>
                  <TrendingUp size={17} className="text-amber-400" />
                </div>
                <p className="mt-1 text-xs text-[#777]">
                  Daily GST-inclusive sales, last {range} days
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setRangeOpen((v) => !v)}
                    className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-[#111] px-3 py-2 text-xs text-[#a1a1a1] transition hover:border-amber-500/20 hover:text-white"
                  >
                    <CalendarDays size={14} />
                    {range} Days
                    <ChevronDown size={13} />
                  </button>

                  {rangeOpen && (
                    <div className="absolute right-0 top-full z-30 mt-2 w-32 overflow-hidden rounded-xl border border-white/[0.08] bg-[#1b1b1b] p-1 shadow-2xl">
                      {[7, 30, 90].map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => {
                            setRange(item);
                            setRangeOpen(false);
                          }}
                          className={`flex w-full rounded-lg px-3 py-2 text-left text-xs transition ${
                            range === item
                              ? "bg-amber-500/10 text-amber-400"
                              : "text-[#999] hover:bg-white/[0.05] hover:text-white"
                          }`}
                        >
                          {item} Days
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <p className="text-[11px] text-[#696969]">Total</p>
                  <p className="text-xl font-bold text-amber-400">
                    {currency(rangeRevenue)}
                  </p>
                </div>
              </div>
            </div>

            <div className="h-[300px] sm:h-[340px]">
              <Line data={revenueData} options={revenueOptions} />
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-4">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,.6)]" />
                <span className="text-xs text-[#737373]">Revenue</span>
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                {revenueGrowth >= 0 ? (
                  <ArrowUpRight size={14} className="text-emerald-400" />
                ) : (
                  <ArrowDownRight size={14} className="text-rose-400" />
                )}
                <span
                  className={
                    revenueGrowth >= 0 ? "text-emerald-400" : "text-rose-400"
                  }
                >
                  {Math.abs(revenueGrowth).toFixed(1)}%
                </span>
                <span className="text-[#656565]">vs previous</span>
              </div>
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <div className="mb-5">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">Revenue by category</h2>
                <PieChart size={17} className="text-amber-400" />
              </div>
              <p className="mt-1 text-xs text-[#777]">
                Share of products in catalogue
              </p>
            </div>

            <div className="relative mx-auto h-[270px] max-w-[300px]">
              {categoryEntries.length ? (
                <>
                  <Doughnut data={categoryData} options={categoryOptions} />
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-3xl font-bold">{totalProducts}</p>
                      <p className="mt-1 text-[10px] uppercase tracking-[.15em] text-[#737373]">
                        Products
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-[#666]">
                  No category data
                </div>
              )}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
              {categoryEntries.map(([name, value], index) => (
                <div key={name} className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{
                      backgroundColor:
                        categoryColors[index % categoryColors.length],
                    }}
                  />
                  <span className="truncate text-[11px] text-[#8a8a8a]">
                    {name}
                  </span>
                  <span className="ml-auto text-[11px] font-semibold text-[#b8b8b8]">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* Screenshot-style middle analytics */}
        <section className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Card className="p-5 sm:p-6">
            <div className="mb-5">
              <h2 className="text-lg font-bold">Daily product uploads</h2>
              <p className="mt-1 text-xs text-[#707070]">
                Catalogue activity, last 14 days
              </p>
            </div>
            <div className="h-[290px]">
              <Bar data={uploadChartData} options={uploadChartOptions} />
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <div className="mb-5">
              <h2 className="text-lg font-bold">Orders per day</h2>
              <p className="mt-1 text-xs text-[#707070]">
                Paid order volume, last 14 days
              </p>
            </div>
            <div className="h-[290px]">
              <Bar data={orderBarData} options={orderBarOptions} />
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Best sellers</h2>
                <p className="mt-1 text-xs text-[#707070]">By revenue</p>
              </div>
              <Star size={18} className="text-amber-400" />
            </div>

            <div className="space-y-4">
              {topProducts.length ? (
                topProducts.slice(0, 6).map((product, index) => (
                  <div
                    key={product.id}
                    className="group flex items-center gap-3"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-xs font-bold text-amber-400">
                      {index + 1}
                    </div>

                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-10 w-10 shrink-0 rounded-lg border border-white/[0.08] object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-[#666]">
                        <Package size={17} />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-[#dedede]">
                        {product.name}
                      </p>
                      <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/[0.05]">
                        <div
                          className="h-full rounded-full bg-amber-500 transition-all duration-700"
                          style={{
                            width: `${
                              topProducts[0]?.revenue
                                ? Math.max(
                                    8,
                                    (product.revenue / topProducts[0].revenue) *
                                      100,
                                  )
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    <span className="shrink-0 text-xs font-semibold text-white">
                      {compactCurrency(product.revenue)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex h-64 items-center justify-center text-sm text-[#666]">
                  No product sales yet
                </div>
              )}
            </div>
          </Card>
        </section>

        {/* Orders + stock */}
        <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <div className="flex flex-col gap-4 border-b border-white/[0.06] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <h2 className="text-lg font-bold">Recent orders</h2>
                <p className="mt-1 text-xs text-[#707070]">
                  Latest customer activity
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                goToOrders();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
                className="flex items-center gap-1.5 text-xs font-medium text-amber-400 transition hover:text-amber-300"
              >
                See all
                <ArrowUpRight size={13} />
              </button>
            </div>

            <div className="flex gap-2 overflow-x-auto border-b border-white/[0.06] px-5 py-3 sm:px-6">
              {[
                ["paid", "Paid", paidOrders.length],
                ["pending", "Pending", pendingOrders.length],
                ["failed", "Failed", failedOrders.length],
                ["all", "All", allOrders.length],
              ].map(([key, label, count]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setOrderTab(key)}
                  className={`rounded-full px-3 py-1.5 text-[11px] font-medium transition ${
                    orderTab === key
                      ? "bg-amber-500/10 text-amber-400"
                      : "text-[#777] hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  {label} {count}
                </button>
              ))}
            </div>

            <div className="dashboard-scroll overflow-x-auto">
              <div className="min-w-[650px]">
                <div className="grid grid-cols-[1.6fr_1fr_1fr_.8fr] gap-4 border-b border-white/[0.06] px-5 py-3 text-[10px] uppercase tracking-[.12em] text-[#5f5f5f] sm:px-6">
                  <span>Order</span>
                  <span>Date</span>
                  <span>Amount</span>
                  <span>Status</span>
                </div>

                <div className="divide-y divide-white/[0.05]">
                  {recentOrders.length ? (
                    recentOrders.map((order, index) => {
                      const paid =
                        order.normalizedStatus === "paid" ||
                        order.normalizedStatus === "payment successful";
                      const failed =
                        order.normalizedStatus === "failed" ||
                        order.normalizedStatus === "cancelled";

                      return (
                        <div
                          key={order?._id || order?.id || index}
                          className="grid grid-cols-[1.6fr_1fr_1fr_.8fr] items-center gap-4 px-5 py-4 transition hover:bg-white/[0.025] sm:px-6"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                                paid
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : failed
                                    ? "bg-rose-500/10 text-rose-400"
                                    : "bg-amber-500/10 text-amber-400"
                              }`}
                            >
                              {paid ? (
                                <CheckCircle2 size={17} />
                              ) : failed ? (
                                <XCircle size={17} />
                              ) : (
                                <Clock3 size={17} />
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-white">
                                Order #
                                {String(order?._id || order?.id || "N/A").slice(
                                  0,
                                  10,
                                )}
                              </p>
                              <p className="mt-0.5 text-[10px] text-[#656565]">
                                {order.itemCount} items
                              </p>
                            </div>
                          </div>

                          <span className="text-xs text-[#777]">
                            {order.orderDate.toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                            })}
                          </span>

                          <span className="text-sm font-semibold text-white">
                            {currency(order?.amount)}
                          </span>

                          <span
                            className={`inline-flex w-fit rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                              paid
                                ? "bg-emerald-500/10 text-emerald-400"
                                : failed
                                  ? "bg-rose-500/10 text-rose-400"
                                  : "bg-amber-500/10 text-amber-400"
                            }`}
                          >
                            {paid ? "Paid" : failed ? "Failed" : "Pending"}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-14 text-center text-sm text-[#666]">
                      No orders found
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* 🔽 Enhanced Stock Alerts Card with Refresh Button & Timestamps */}
          <Card className="p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Stock alerts</h2>
                  <p className="mt-1 text-xs text-[#707070]">
                    {stockAlerts.filter((p) => p.stockValue === 0).length} out
                    of stock ·{" "}
                    {
                      stockAlerts.filter(
                        (p) => p.stockValue > 0 && p.stockValue <= 3,
                      ).length
                    }{" "}
                    running low
                  </p>
                </div>
              </div>
              <button
                onClick={refreshData}
                disabled={refreshing}
                className="text-amber-400 hover:text-amber-300 transition disabled:opacity-50"
                title="Refresh stock data"
              >
                <RefreshCw
                  size={16}
                  className={refreshing ? "animate-spin" : ""}
                />
              </button>
            </div>

            <div className="space-y-1">
              {stockAlerts.length ? (
                stockAlerts.map((product) => (
                  <div
                    key={product?._id || product?.id || product?.productName}
                    className="flex items-center justify-between rounded-xl px-3 py-3 transition hover:bg-white/[0.035]"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">
                        {product?.productName || "Unnamed product"}
                      </p>
                      <p className="mt-0.5 text-[10px] text-[#656565]">
                        {product?.sku || product?._id || "DARSH product"} ·
                        Updated:{" "}
                        {new Date(
                          product?.updatedAt || product?.createdAt,
                        ).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 text-sm font-bold ${
                        product.stockValue === 0
                          ? "text-rose-400"
                          : "text-amber-400"
                      }`}
                    >
                      {product.stockValue === 0
                        ? "Out"
                        : `${product.stockValue} left`}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex min-h-[260px] flex-col items-center justify-center text-center">
                  <CheckCircle2 size={28} className="text-emerald-400" />
                  <p className="mt-3 text-sm font-medium text-white">
                    Stock looks healthy
                  </p>
                  <p className="mt-1 text-xs text-[#666]">
                    No low-stock products detected.
                  </p>
                </div>
              )}
            </div>
          </Card>
        </section>

        {/* Bottom analytics */}
        <section className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Card className="p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold">Store performance</h2>
                <p className="mt-1 text-xs text-[#707070]">
                  Key business indicators
                </p>
              </div>
              <BarChart3 size={18} className="text-amber-400" />
            </div>

            <div className="space-y-5">
              {[
                [
                  "Payment success",
                  paymentSuccessRate,
                  "bg-emerald-400",
                  "text-emerald-400",
                ],
                [
                  "Orders / users",
                  totalUsers
                    ? Math.min(100, (totalOrders / totalUsers) * 100)
                    : 0,
                  "bg-blue-400",
                  "text-blue-400",
                ],
                [
                  "Products available",
                  totalProducts ? 100 : 0,
                  "bg-amber-400",
                  "text-amber-400",
                ],
              ].map(([label, value, bar, text]) => (
                <div key={label}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs text-[#858585]">{label}</span>
                    <span className={`text-xs font-semibold ${text}`}>
                      {Number(value).toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className={`h-full rounded-full ${bar} transition-all duration-1000`}
                      style={{
                        width: `${Math.min(100, Math.max(0, value))}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold">Customer overview</h2>
                <p className="mt-1 text-xs text-[#707070]">
                  Current store snapshot
                </p>
              </div>
              <Users size={18} className="text-purple-400" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                ["Customers", totalUsers, "text-purple-400"],
                ["Products", totalProducts, "text-amber-400"],
                ["Paid orders", totalOrders, "text-emerald-400"],
                ["Dispatch", awaitingDispatch.length, "text-blue-400"],
              ].map(([label, value, color]) => (
                <div
                  key={label}
                  className="rounded-xl border border-white/[0.06] bg-[#121212] p-4"
                >
                  <p className="text-[10px] uppercase tracking-[.1em] text-[#666]">
                    {label}
                  </p>
                  <p className={`mt-2 text-2xl font-bold ${color}`}>{value}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <div className="mb-5">
              <h2 className="text-base font-bold">Quick actions</h2>
              <p className="mt-1 text-xs text-[#707070]">
                Manage your store faster
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                goToUpload();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
                className="group rounded-xl border border-white/[0.06] bg-[#121212] p-4 text-left transition hover:-translate-y-0.5 hover:border-amber-500/25 hover:bg-amber-500/[0.04]"
              >
                <PackageOpen
                  size={19}
                  className="text-amber-400 transition group-hover:scale-110"
                />
                <p className="mt-3 text-xs font-semibold">Add product</p>
                <p className="mt-1 text-[10px] text-[#646464]">
                  New catalogue item
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                goToOrders();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
                className="group rounded-xl border border-white/[0.06] bg-[#121212] p-4 text-left transition hover:-translate-y-0.5 hover:border-blue-500/25 hover:bg-blue-500/[0.04]"
              >
                <Eye
                  size={19}
                  className="text-blue-400 transition group-hover:scale-110"
                />
                <p className="mt-3 text-xs font-semibold">View orders</p>
                <p className="mt-1 text-[10px] text-[#646464]">
                  Manage customer orders
                </p>
              </button>

              <button
                type="button"
                onClick={exportDashboardData}
                disabled={exporting}
                className="group rounded-xl border border-white/[0.06] bg-[#121212] p-4 text-left transition hover:-translate-y-0.5 hover:border-purple-500/25 hover:bg-purple-500/[0.04] disabled:opacity-50"
              >
                {exporting ? (
                  <Loader2 size={19} className="animate-spin text-purple-400" />
                ) : (
                  <Download
                    size={19}
                    className="text-purple-400 transition group-hover:scale-110"
                  />
                )}
                <p className="mt-3 text-xs font-semibold">
                  {exporting ? "Exporting..." : "Export data"}
                </p>
                <p className="mt-1 text-[10px] text-[#646464]">
                  Download analytics
                </p>
              </button>

              <button
                type="button"
                onClick={refreshData}
                disabled={refreshing}
                className="group rounded-xl border border-white/[0.06] bg-[#121212] p-4 text-left transition hover:-translate-y-0.5 hover:border-emerald-500/25 hover:bg-emerald-500/[0.04] disabled:opacity-50"
              >
                <RefreshCw
                  size={19}
                  className={`text-emerald-400 ${
                    refreshing
                      ? "animate-spin"
                      : "transition group-hover:rotate-180"
                  }`}
                />
                <p className="mt-3 text-xs font-semibold">Sync data</p>
                <p className="mt-1 text-[10px] text-[#646464]">
                  Refresh dashboard
                </p>
              </button>
            </div>
          </Card>
        </section>

        <footer className="mt-6 flex flex-col gap-3 border-t border-white/[0.06] py-5 text-xs text-[#5f5f5f] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Dashboard connected to live store data
          </div>
          <div>DARSH Admin · {new Date().getFullYear()}</div>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;