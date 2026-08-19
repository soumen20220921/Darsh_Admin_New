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
  ChevronRight,
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
    className={`relative w-full min-w-0 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#171717] ${
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
    setTab,
    url
  } = useAppContext();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [range, setRange] = useState(7);
  const rangeLabel = (value) => {
    if (value === "today") return "Today";
    if (value === "yesterday") return "Yesterday";
    if (value === "todayYesterday") return "Today + Yesterday";
    return `${value} Days`;
  };
  const [rangeOpen, setRangeOpen] = useState(false);
  // 🔽 Default to "paid" so only paid orders appear first
  const [orderTab, setOrderTab] = useState("paid");
  const [dashboardPopup, setDashboardPopup] = useState(null);

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

  const rangeConfig = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    if (range === "today") {
      return {
        start: todayStart,
        end: tomorrowStart,
        days: 1,
        label: "Today",
      };
    }

    if (range === "yesterday") {
      return {
        start: yesterdayStart,
        end: todayStart,
        days: 1,
        label: "Yesterday",
      };
    }

    if (range === "todayYesterday") {
      return {
        start: yesterdayStart,
        end: tomorrowStart,
        days: 2,
        label: "Today + Yesterday",
      };
    }

    const days = Number(range) || 7;
    const start = new Date(todayStart);
    start.setDate(start.getDate() - days + 1);

    return {
      start,
      end: tomorrowStart,
      days,
      label: `${days} Days`,
    };
  }, [range]);

  const previousPeriod = useMemo(() => {
    const duration = rangeConfig.days;
    const end = new Date(rangeConfig.start);
    const start = new Date(rangeConfig.start);
    start.setDate(start.getDate() - duration);
    return { start, end };
  }, [rangeConfig]);

  const rangeOrders = useMemo(
    () =>
      paidOrders.filter(
        (o) =>
          o.orderDate >= rangeConfig.start &&
          o.orderDate < rangeConfig.end
      ),
    [paidOrders, rangeConfig]
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
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    return paidOrders
      .filter((o) => o.orderDate >= start && o.orderDate < end)
      .reduce((sum, order) => sum + (Number(order?.amount) || 0), 0);
  }, [paidOrders]);

  const yesterdayRevenue = useMemo(() => {
    const end = new Date();
    end.setHours(0, 0, 0, 0);
    const start = new Date(end);
    start.setDate(start.getDate() - 1);

    return paidOrders
      .filter((o) => o.orderDate >= start && o.orderDate < end)
      .reduce((sum, order) => sum + (Number(order?.amount) || 0), 0);
  }, [paidOrders]);

  const todayOrders = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    return paidOrders.filter(
      (o) => o.orderDate >= start && o.orderDate < end
    ).length;
  }, [paidOrders]);

  const yesterdayOrders = useMemo(() => {
    const end = new Date();
    end.setHours(0, 0, 0, 0);
    const start = new Date(end);
    start.setDate(start.getDate() - 1);

    return paidOrders.filter(
      (o) => o.orderDate >= start && o.orderDate < end
    ).length;
  }, [paidOrders]);

  const sevenDayRevenue = useMemo(() => {
    const end = new Date();
    end.setHours(0, 0, 0, 0);
    end.setDate(end.getDate() + 1);
    const start = new Date(end);
    start.setDate(start.getDate() - 7);

    return paidOrders
      .filter((o) => o.orderDate >= start && o.orderDate < end)
      .reduce((sum, order) => sum + (Number(order?.amount) || 0), 0);
  }, [paidOrders]);

  const revenueChart = useMemo(() => {
    const labels = [];
    const values = [];
    const days = rangeConfig.days;

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(rangeConfig.end);
      d.setDate(d.getDate() - 1 - i);
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
  }, [paidOrders, rangeConfig]);

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
          maxTicksLimit: rangeConfig.days > 30 ? 8 : rangeConfig.days > 14 ? 10 : rangeConfig.days,
          autoSkip: true,
        },
      },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(255,255,255,.055)" },
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
    interaction: { intersect: true, mode: "nearest" },
    onClick: (_event, elements) => {
      if (!elements?.length) return;
      const index = elements[0].index;
      const daysAgo = 13 - index;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      const dayOrders = paidOrders
        .filter((o) => o.orderDate >= startDate && o.orderDate < endDate)
        .sort((a, b) => b.orderDate - a.orderDate);
      setDashboardPopup({ type: "orders-day", date: startDate, orders: dayOrders });
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: "#707070", font: { size: 10 }, maxTicksLimit: 7 },
      },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(255,255,255,.05)" },
        border: { display: false },
        ticks: { color: "#707070", precision: 0 },
      },
    },
    plugins: {
      ...chartBase.plugins,
      tooltip: {
        ...chartBase.plugins.tooltip,
        callbacks: {
          label: (ctx) => `${ctx.raw || 0} paid order${Number(ctx.raw) === 1 ? "" : "s"} · Click to view`,
        },
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
    onClick: (_event, elements) => {
      if (!elements?.length) return;
      const index = elements[0].index;
      const daysAgo = 13 - index;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      const products = (Array.isArray(allProduct) ? allProduct : [])
        .filter((product) => {
          const created = new Date(product?.createdAt || product?.createdDate || product?.date || 0);
          return created >= startDate && created < endDate;
        })
        .sort((a, b) => new Date(b.createdAt || b.createdDate || b.date || 0) - new Date(a.createdAt || a.createdDate || a.date || 0));
      setDashboardPopup({ type: "uploads-day", date: startDate, products });
    },
    scales: {
      ...orderBarOptions.scales,
      y: {
        ...orderBarOptions.scales.y,
        ticks: { color: "#707070", precision: 0 },
      },
    },
    plugins: {
      ...orderBarOptions.plugins,
      tooltip: {
        ...orderBarOptions.plugins.tooltip,
        callbacks: {
          label: (ctx) => `${ctx.raw || 0} product upload${Number(ctx.raw) === 1 ? "" : "s"} · Click to view`,
        },
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
          name: product?.productName || product?.name || product?.title || "Unknown Product",
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

  const getOrderCustomerName = useCallback((order) =>
    order?.userShipping?.FullName ||
    order?.userShipping?.fullName ||
    order?.customerName ||
    order?.user?.name ||
    order?.userId ||
    "Guest customer", []);

  const getOrderItems = useCallback((order) => {
    const source = Array.isArray(order?.products)
      ? order.products
      : Array.isArray(order?.orderItems)
      ? order.orderItems
      : [];
    return source.map((item) => ({
      id: productIdOf(item),
      name: item?.productName || item?.name || item?.title || item?.product?.productName || "Unnamed product",
      qty: quantityOf(item),
      price: priceOf(item),
    }));
  }, []);

  const openStockProduct = useCallback((product) => {
    const productId = product?._id || product?.id;
    if (!productId) return;
    try {
      localStorage.setItem("darsh:dashboard-stock-product", JSON.stringify({ id: productId }));
    } catch (error) {
      console.warn("Could not save stock product", error);
    }
    window.dispatchEvent(new CustomEvent("darsh:open-stock-product", { detail: { productId } }));
    setTab(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [setTab]);

  const openBestSeller = useCallback((product) => {
    const matching = paidOrders.filter((order) =>
      getOrderItems(order).some((item) => String(item.id || "") === String(product.id || ""))
    ).sort((a, b) => b.orderDate - a.orderDate);
    setDashboardPopup({ type: "best-seller", product, orders: matching });
  }, [getOrderItems, paidOrders]);

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
    <div className="dashboard-touch min-h-screen overflow-x-hidden bg-[#0b0b0b] px-3 py-4 text-white sm:px-6 sm:py-5 lg:px-8">
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
        .dashboard-scroll { scrollbar-width: thin; -webkit-overflow-scrolling: touch; }
        .dashboard-touch { -webkit-tap-highlight-color: transparent; touch-action: manipulation; }
        .dashboard-safe-bottom { padding-bottom: max(1rem, env(safe-area-inset-bottom)); }
        @media (max-width: 639px) {
          .dashboard-chart-label { font-size: 9px !important; }
        }
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
            title={`Revenue · ${rangeConfig.label}`}
            value={rangeRevenue}
            currencyValue
            icon={IndianRupee}
            growth={revenueGrowth}
            subtitle="vs previous period"
            delay={50}
          />
          <StatCard
            title={`Orders · ${rangeConfig.label}`}
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
            subtitle={rangeConfig.label}
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

        {/* Revenue quick range cards */}
        <section className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Today",
              value: currency(todayRevenue),
              meta: `${todayOrders} paid order${todayOrders === 1 ? "" : "s"}`,
              icon: IndianRupee,
              color: "text-amber-400",
              valueKey: "today",
            },
            {
              label: "Yesterday",
              value: currency(yesterdayRevenue),
              meta: `${yesterdayOrders} paid order${yesterdayOrders === 1 ? "" : "s"}`,
              icon: Clock3,
              color: "text-blue-400",
              valueKey: "yesterday",
            },
            {
              label: "Last 7 days",
              value: currency(sevenDayRevenue),
              meta: "Default revenue range",
              icon: CalendarDays,
              color: "text-emerald-400",
              valueKey: 7,
            },
            {
              label: "Payment success",
              value: `${paymentSuccessRate.toFixed(1)}%`,
              meta: `${paidOrders.length} of ${allOrders.length} orders paid`,
              icon: CheckCircle2,
              color: "text-purple-400",
              valueKey: null,
            },
          ].map(({ label, value, meta, icon: Icon, color, valueKey }) => {
            const active = valueKey !== null && range === valueKey;

            return (
              <button
                key={label}
                type="button"
                disabled={valueKey === null}
                onClick={() => {
                  if (valueKey !== null) {
                    setRange(valueKey);
                    setRangeOpen(false);
                  }
                }}
                className={`group rounded-2xl border px-4 py-4 text-left transition-all duration-300 ${
                  active
                    ? "border-amber-500/30 bg-amber-500/[0.07] shadow-[0_10px_35px_rgba(245,169,11,.06)]"
                    : "border-white/[0.06] bg-[#121212] hover:-translate-y-0.5 hover:border-white/[0.12] hover:bg-[#151515]"
                } ${valueKey === null ? "cursor-default" : "cursor-pointer"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#777]">
                        {label}
                      </p>
                      {active && (
                        <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[9px] font-semibold text-amber-400">
                          Selected
                        </span>
                      )}
                    </div>
                    <p className={`mt-2 truncate text-xl font-bold sm:text-2xl ${color}`}>
                      {value}
                    </p>
                    <p className="mt-1 text-[11px] text-[#6f6f6f]">{meta}</p>
                  </div>
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] ${color}`}>
                    <Icon size={18} />
                  </div>
                </div>
              </button>
            );
          })}
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
                  Daily GST-inclusive sales · {rangeConfig.label}
                </p>
              </div>

              <div className="flex w-full flex-wrap items-center justify-between gap-3 sm:w-auto sm:justify-end">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setRangeOpen((v) => !v)}
                    className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-[#111] px-3 py-2 text-xs text-[#a1a1a1] transition hover:border-amber-500/20 hover:text-white"
                  >
                    <CalendarDays size={14} />
                    {rangeLabel(range)}
                    <ChevronDown size={13} />
                  </button>

                  {rangeOpen && (
                    <div className="absolute  top-full z-30 mt-2 w-44 overflow-hidden rounded-xl border border-white/[0.08] bg-[#1b1b1b] p-1 shadow-2xl">
                      {["todayYesterday", 7, 14, 30, 90].map((item) => (
                        <button
                          key={String(item)}
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
                          {rangeLabel(item)}
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
                Catalogue activity, last 14 days · <span className="text-emerald-400/80">click a bar to view products</span>
              </p>
            </div>
            <div className="h-[250px] sm:h-[290px]">
              <Bar data={uploadChartData} options={uploadChartOptions} />
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <div className="mb-5">
              <h2 className="text-lg font-bold">Orders per day</h2>
              <p className="mt-1 text-xs text-[#707070]">
                Paid order volume, last 14 days · <span className="text-blue-400/80">click a bar to view orders</span>
              </p>
            </div>
            <div className="h-[250px] sm:h-[290px]">
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
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => openBestSeller(product)}
                    className="group flex w-full items-center gap-3 rounded-xl px-2 py-1.5 text-left transition hover:bg-white/[0.035]"
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
                    <ChevronRight size={14} className="shrink-0 text-[#4f4f4f] transition group-hover:text-amber-400" />
                  </button>
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

            {/* Desktop order table */}
            <div className="dashboard-scroll hidden overflow-x-auto sm:block">
              <div className="min-w-[760px]">
                <div className="grid grid-cols-[1.35fr_1.5fr_1fr_.75fr_.7fr] gap-4 border-b border-white/[0.06] px-5 py-3 text-[10px] uppercase tracking-[.12em] text-[#5f5f5f] sm:px-6">
                  <span>Customer / Order</span><span>Items</span><span>Date</span><span>Amount</span><span>Status</span>
                </div>
                <div className="divide-y divide-white/[0.05]">
                  {recentOrders.length ? recentOrders.map((order, index) => {
                    const paid = order.normalizedStatus === "paid" || order.normalizedStatus === "payment successful";
                    const failed = order.normalizedStatus === "failed" || order.normalizedStatus === "cancelled";
                    const items = getOrderItems(order);
                    const customer = getOrderCustomerName(order);
                    return (
                      <button
                        key={order?._id || order?.id || index}
                        type="button"
                        onClick={() => setDashboardPopup({ type: "order", order })}
                        className="grid w-full grid-cols-[1.35fr_1.5fr_1fr_.75fr_.7fr] items-center gap-4 px-5 py-4 text-left transition hover:bg-white/[0.035] sm:px-6"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-white">{customer}</p>
                          <p className="mt-0.5 truncate text-[10px] text-[#656565]">Order #{String(order?._id || order?.id || "N/A").slice(0, 10)}</p>
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs text-[#d8d8d8]">{items.slice(0,2).map((item) => `${item.name} ×${item.qty}`).join(" · ") || "No items"}</p>
                          <p className="mt-1 text-[10px] text-[#5f5f5f]">{order.itemCount} {order.itemCount === 1 ? "item" : "items"}</p>
                        </div>
                        <span className="text-xs text-[#777]">{order.orderDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                        <span className="text-sm font-semibold text-white">{currency(order?.amount)}</span>
                        <span className={`inline-flex w-fit rounded-full px-2.5 py-1 text-[10px] font-semibold ${paid ? "bg-emerald-500/10 text-emerald-400" : failed ? "bg-rose-500/10 text-rose-400" : "bg-amber-500/10 text-amber-400"}`}>
                          {paid ? "Paid" : failed ? "Failed" : "Pending"}
                        </span>
                      </button>
                    );
                  }) : <div className="py-14 text-center text-sm text-[#666]">No orders found</div>}
                </div>
              </div>
            </div>

            {/* Mobile order cards */}
            <div className="space-y-2 p-3 sm:hidden">
              {recentOrders.length ? recentOrders.map((order, index) => {
                const paid = order.normalizedStatus === "paid" || order.normalizedStatus === "payment successful";
                const failed = order.normalizedStatus === "failed" || order.normalizedStatus === "cancelled";
                const items = getOrderItems(order);
                const customer = getOrderCustomerName(order);
                return (
                  <button
                    key={order?._id || order?.id || index}
                    type="button"
                    onClick={() => setDashboardPopup({ type: "order", order })}
                    className="group w-full rounded-2xl border border-white/[0.06] bg-[#121212] p-3.5 text-left transition active:scale-[0.99] hover:border-white/[0.12] hover:bg-[#151515]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">{customer}</p>
                        <p className="mt-1 truncate text-[10px] text-[#626262]">
                          #{String(order?._id || order?.id || "N/A").slice(0, 14)}
                        </p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[9px] font-bold ${
                        paid ? "bg-emerald-500/10 text-emerald-400" :
                        failed ? "bg-rose-500/10 text-rose-400" :
                        "bg-amber-500/10 text-amber-400"
                      }`}>
                        {paid ? "Paid" : failed ? "Failed" : "Pending"}
                      </span>
                    </div>
                    <div className="mt-3 flex items-end justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] text-[#b5b5b5]">
                          {items.slice(0, 2).map((item) => `${item.name} ×${item.qty}`).join(" · ") || "No items"}
                        </p>
                        <p className="mt-1 text-[10px] text-[#5e5e5e]">
                          {order.itemCount} {order.itemCount === 1 ? "item" : "items"} · {order.orderDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="text-sm font-bold text-white">{currency(order?.amount)}</span>
                        <ChevronRight size={14} className="text-[#4f4f4f] transition group-hover:text-amber-400" />
                      </div>
                    </div>
                  </button>
                );
              }) : <div className="py-12 text-center text-sm text-[#666]">No orders found</div>}
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
                  <button
                    key={product?._id || product?.id || product?.productName}
                    type="button"
                    onClick={() => openStockProduct(product)}
                    className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition active:scale-[0.99] hover:bg-white/[0.035]"
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
                    <ChevronRight size={14} className="ml-2 shrink-0 text-[#4f4f4f] transition group-hover:text-amber-400" />
                  </button>
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

        {dashboardPopup && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/75 p-0 backdrop-blur-md sm:items-center sm:p-4 md:p-6" onClick={() => setDashboardPopup(null)}>
            <div className="dashboard-safe-bottom flex max-h-[94dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-[1.75rem] border border-white/10 bg-[#151515] shadow-[0_24px_90px_rgba(0,0,0,.55)] sm:max-h-[90dvh] sm:rounded-3xl" onClick={(event) => event.stopPropagation()}>
              <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/[0.07] px-4 py-3.5 sm:px-6 sm:py-4">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[.14em] text-[#666]">
                    {dashboardPopup.type === "uploads-day" ? "Daily product uploads" : dashboardPopup.type === "orders-day" ? "Orders per day" : dashboardPopup.type === "best-seller" ? "Best seller orders" : "Order details"}
                  </p>
                  <h3 className="mt-1 truncate text-base font-bold text-white sm:text-lg">
                    {dashboardPopup.type === "uploads-day" || dashboardPopup.type === "orders-day"
                      ? dashboardPopup.date?.toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })
                      : dashboardPopup.type === "best-seller"
                      ? dashboardPopup.product?.name
                      : getOrderCustomerName(dashboardPopup.order)}
                  </h3>
                </div>
                <button type="button" onClick={() => setDashboardPopup(null)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-[#888] hover:text-white"><XCircle size={18}/></button>
              </div>
              <div className="dashboard-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 pb-4 sm:p-5">
                {dashboardPopup.type === "uploads-day" ? (
                  dashboardPopup.products?.length ? (
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {dashboardPopup.products.map((product) => (
                        <button key={product?._id || product?.id} type="button" onClick={() => { setDashboardPopup(null); openStockProduct({ ...product, stock: product.stock }); }} className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-[#111] p-3 text-left hover:border-emerald-500/20">
                          <div className="h-14 w-12 shrink-0 overflow-hidden rounded-xl bg-white/[0.04]">
                            {product?.images?.[0] ? (
                              <img src={String(product.images[0]).startsWith("http") ? product.images[0] : `${url}/img/${product.images[0]}`} alt={product?.productName || "Product"} className="h-full w-full object-cover" />
                            ) : (
                              <Package className="mx-auto mt-4 h-5 w-5 text-[#555]" />
                            )}
                          </div>
                          <div className="min-w-0"><p className="truncate text-sm font-semibold text-white">{product?.productName || product?.name || "Untitled product"}</p><p className="mt-1 text-[10px] text-[#666]">{product?.category || "Uncategorized"} · Stock {getStock(product)}</p></div>
                          <ChevronRight size={15} className="ml-auto shrink-0 text-[#555]" />
                        </button>
                      ))}
                    </div>
                  ) : <div className="flex min-h-[250px] items-center justify-center text-sm text-[#666]">No products uploaded on this day.</div>
                ) : (
                  <div className="space-y-2">
                    {(dashboardPopup.type === "best-seller" ? dashboardPopup.orders : dashboardPopup.type === "orders-day" ? dashboardPopup.orders : [dashboardPopup.order]).filter(Boolean).map((order, index) => {
                      const items = getOrderItems(order);
                      return <div key={order?._id || order?.id || index} className="rounded-2xl border border-white/[0.06] bg-[#111] p-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-sm font-semibold text-white">{getOrderCustomerName(order)}</p><p className="mt-1 text-[10px] text-[#666]">Order #{String(order?._id || order?.id || "N/A").slice(0,14)} · {order.orderDate.toLocaleString("en-IN", { day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit" })}</p></div><p className="text-sm font-bold text-amber-400">{currency(order.amount)}</p></div>
                        <div className="mt-3 flex flex-wrap gap-2">{items.map((item, i) => <span key={`${item.id || item.name}-${i}`} className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1.5 text-[10px] text-[#aaa]">{item.name} ×{item.qty}</span>)}</div>
                      </div>;
                    })}
                    {!(dashboardPopup.type === "best-seller" ? dashboardPopup.orders : dashboardPopup.orders || [dashboardPopup.order]).length && <div className="flex min-h-[250px] items-center justify-center text-sm text-[#666]">No matching orders found.</div>}
                  </div>
                )}
              </div>
              <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-white/[0.07] bg-[#121212] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6"><span className="text-[10px] text-[#666]">Tap outside or close to dismiss</span><button type="button" onClick={() => { setDashboardPopup(null); goToOrders(); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-3 py-2 text-[10px] font-bold text-black hover:bg-amber-400">Open Orders <ChevronRight size={13}/></button></div>
            </div>
          </div>
        )}

        {/* Responsive dashboard insights */}
        <section className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-amber-500/10 bg-gradient-to-br from-amber-500/[0.07] to-transparent p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[.14em] text-amber-400">Revenue focus</p>
            <p className="mt-2 text-sm font-semibold text-white">7-day view is your default snapshot.</p>
            <p className="mt-1 text-[10px] leading-5 text-[#707070]">Use Today or Yesterday for quick daily checks.</p>
          </div>
          <div className="rounded-2xl border border-blue-500/10 bg-gradient-to-br from-blue-500/[0.06] to-transparent p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[.14em] text-blue-400">Drill down</p>
            <p className="mt-2 text-sm font-semibold text-white">Charts and orders are interactive.</p>
            <p className="mt-1 text-[10px] leading-5 text-[#707070]">Tap a bar, order, best seller, or alert to see more.</p>
          </div>
          <div className="rounded-2xl border border-emerald-500/10 bg-gradient-to-br from-emerald-500/[0.06] to-transparent p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[.14em] text-emerald-400">Inventory</p>
            <p className="mt-2 text-sm font-semibold text-white">Low-stock items stay one tap away.</p>
            <p className="mt-1 text-[10px] leading-5 text-[#707070]">Open a stock alert to jump to that exact product.</p>
          </div>
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