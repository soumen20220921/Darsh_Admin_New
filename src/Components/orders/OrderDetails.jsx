import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  MapPin,
  Loader2,
  User,
  Phone,
  Home,
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
  FileText,
  MessageCircle,
  ChevronDown,
  ChevronRight,
  Play,
  Pause,
  MoreVertical,
  ShieldCheck,
  ReceiptIndianRupee,
  Building2,
  Landmark,
  Printer,
  Search,
} from "lucide-react";
import axios from "axios";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAppContext } from "../../context/Context";
import html2pdf from "html2pdf.js";

/* =========================================================
   DARSH — ORDER DETAILS
   Dark admin UI + GST tax invoice / GST pad bill
   ========================================================= */

const SELLER = {
  name: "DARSH",
  address: "6VJG+23H, Ichlabad, Bardhaman, West Bengal 713103, Burdwan, India, 713103",
  phone: "99078 04710",
  email: "contactdarsh9@gmail.com",
  state: "West Bengal",
  stateCode: "19",
};

const DEFAULT_SHIPPING = 0;
const COURIER_OPTIONS = ["DTDC", "India Post"];

const COURIER_TRACKING_URLS = {
  DTDC: "https://www.dtdc.com/track-your-shipment/",
  "India Post": "https://www.tracktry.com/couriers/india-post",
};

const normalizeCourier = (value) => {
  const courier = String(value || "").trim();
  return COURIER_OPTIONS.includes(courier) ? courier : "DTDC";
};


const money = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const numberValue = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const firstNumber = (...values) => {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== "" && Number.isFinite(Number(value))) {
      return Number(value);
    }
  }
  return 0;
};

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const formatDateTime = (date) =>
  date
    ? new Date(date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const statusMeta = (order) => {
  if (order?.orderReject) {
    return {
      label: "Rejected",
      icon: XCircle,
      tone: "red",
      stage: 0,
    };
  }

  if (order?.trackingId) {
    return {
      label: "Delivered",
      icon: CheckCircle,
      tone: "green",
      stage: 4,
    };
  }

  if (order?.orderDispatch) {
    return {
      label: "Dispatched",
      icon: Truck,
      tone: "amber",
      stage: 3,
    };
  }

  if (order?.orderAccept) {
    return {
      label: "Accepted",
      icon: CheckCircle,
      tone: "blue",
      stage: 2,
    };
  }

  return {
    label: "Processing",
    icon: Clock,
    tone: "amber",
    stage: 1,
  };
};

const getToneClasses = (tone) => {
  const map = {
    green: "bg-emerald-400/10 text-emerald-300 border-emerald-400/20",
    red: "bg-red-400/10 text-red-300 border-red-400/20",
    amber: "bg-amber-400/10 text-amber-300 border-amber-400/20",
    blue: "bg-blue-400/10 text-blue-300 border-blue-400/20",
  };

  return map[tone] || map.blue;
};

const Notification = ({ type, message, onClose }) => {
  const config = {
    success: {
      icon: CheckCircle,
      color: "text-emerald-300",
      bar: "from-emerald-400 to-cyan-400",
    },
    error: {
      icon: XCircle,
      color: "text-red-300",
      bar: "from-red-400 to-orange-400",
    },
    info: {
      icon: Info,
      color: "text-blue-300",
      bar: "from-blue-400 to-violet-400",
    },
  };

  const item = config[type] || config.info;
  const Icon = item.icon;

  return (
    <div className="fixed right-4 top-4 z-[100] w-[calc(100%-2rem)] max-w-md animate-[toastIn_.35s_ease-out]">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#171717]/95 shadow-2xl shadow-black/40 backdrop-blur-xl">
        <div className="flex items-center gap-3 p-4">
          <Icon className={`h-5 w-5 shrink-0 ${item.color}`} />
          <p className="flex-1 text-sm font-medium text-white">{message}</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/40 transition hover:bg-white/5 hover:text-white"
          >
            <XCircle className="h-4 w-4" />
          </button>
        </div>
        <div className="h-0.5 bg-white/5">
          <div className={`h-full animate-[toastProgress_4s_linear] bg-gradient-to-r ${item.bar}`} />
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, accent = "amber" }) => {
  const accentMap = {
    amber: "from-amber-400/20 to-orange-400/5 text-amber-300",
    green: "from-emerald-400/20 to-cyan-400/5 text-emerald-300",
    blue: "from-blue-400/20 to-violet-400/5 text-blue-300",
  };

  return (
    <div className="group rounded-2xl border border-white/10 bg-[#171717] p-4 transition duration-300 hover:-translate-y-0.5 hover:border-white/15 hover:bg-[#1a1a1a]">
      <div className="flex items-center gap-3">
        <div
          className={`rounded-xl bg-gradient-to-br p-2.5 ${accentMap[accent] || accentMap.amber}`}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.16em] text-white/40">{label}</p>
          <p className="mt-1 truncate text-base font-semibold text-white">{value}</p>
        </div>
      </div>
    </div>
  );
};

const SectionCard = ({ title, icon: Icon, children, action }) => (
  <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#171717] shadow-[0_18px_50px_rgba(0,0,0,.18)]">
    <div className="flex items-center justify-between border-b border-white/10 px-4 py-4 sm:px-5">
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="rounded-lg bg-amber-400/10 p-2 text-amber-300">
          <Icon className="h-4 w-4" />
        </div>
        <h2 className="truncate text-sm font-semibold text-white sm:text-base">{title}</h2>
      </div>
      {action}
    </div>
    <div className="p-4 sm:p-5">{children}</div>
  </section>
);

const DetailRow = ({ icon: Icon, label, value, copyable, copied, onCopy }) => (
  <div
    className={`flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-[#111111] px-3 py-3 ${
      copyable ? "cursor-pointer transition hover:border-white/10 hover:bg-[#151515]" : ""
    }`}
    onClick={copyable ? onCopy : undefined}
  >
    <div className="flex min-w-0 items-center gap-2.5">
      <Icon className="h-4 w-4 shrink-0 text-white/35" />
      <span className="text-xs text-white/45">{label}</span>
    </div>
    <div className="flex min-w-0 items-center gap-2">
      <span className="max-w-[58vw] truncate text-right text-xs font-medium text-white sm:max-w-[260px]">
        {value || "—"}
      </span>
      {copyable && (
        <Copy className={`h-3.5 w-3.5 shrink-0 ${copied ? "text-emerald-300" : "text-white/25"}`} />
      )}
    </div>
  </div>
);

const OrderDetails = ({ order, onClose }) => {
  const { fetchOrders, url } = useAppContext();

  const [loading, setLoading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const [isJourneyPlaying, setIsJourneyPlaying] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [trackingViewOpen, setTrackingViewOpen] = useState(false);
  const [trackingInput, setTrackingInput] = useState("");
  const [courierInput, setCourierInput] = useState("DTDC");
  const [selectedImage, setSelectedImage] = useState(null);
  const [notification, setNotification] = useState(null);
  const [copiedField, setCopiedField] = useState("");
  const invoiceRef = useRef(null);
  const signSrc = "/IMG/sign.png";

  useEffect(() => {
    if (!notification) return undefined;
    const timer = setTimeout(() => setNotification(null), 4000);
    return () => clearTimeout(timer);
  }, [notification]);

  useEffect(() => {
    setTrackingInput(String(order?.trackingId || "").trim());
    setCourierInput(
      normalizeCourier(order?.courierPartner || order?.courier || "DTDC")
    );
  }, [order]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedImage(null);
        setTrackingModalOpen(false);
        setTrackingViewOpen(false);
        setIsMobileMenuOpen(false);
        setIsShareMenuOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  /*
   * IMPORTANT:
   * Keep ALL React hooks above any conditional return.
   * `useMemo` was previously below `if (!order) return null`, which caused:
   * React Hook "useMemo" is called conditionally.
   */
  const items = order?.orderItems || [];

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => numberValue(sum) + numberValue(item?.price), 0);

   

    const discount = firstNumber(
      order?.discount,
      order?.discountAmount,
      order?.couponDiscount
    );

    const shipping = firstNumber(
      order?.shippingCharge,
      order?.shipping,
      DEFAULT_SHIPPING
    );


    const amountFromOrder = numberValue(order?.amount);
    const calculatedGrandTotal = Math.max(
        shipping,
      0
    );

    return {
      subtotal,
      discount,
      shipping,
     
      grandTotal: amountFromOrder > 0 ? amountFromOrder : calculatedGrandTotal,
    };
  }, [items, order]);

  // Safe early return AFTER all hooks have been executed.
  if (!order) return null;

  const progress = statusMeta(order);
  const ProgressIcon = progress.icon;

  const showNotification = (type, message) => {
    setNotification({ type, message });
  };

  const copyToClipboard = async (text, field) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(String(text));
      setCopiedField(field);
      showNotification("success", `${field} copied`);
      setTimeout(() => setCopiedField(""), 1800);
    } catch {
      showNotification("error", "Could not copy to clipboard");
    }
  };

  const imageUrl = (item) =>
    item?.imgSrc
      ? `${url}/img/${item.imgSrc}`
      : "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=300&h=300&fit=crop";

  const acceptOrReject = async (id, action) => {
    setLoading(true);

    try {
      let payload = {};

      if (action === "accept") {
        payload = {
          ...order,
          orderAccept: true,
          orderReject: false,
          orderDispatch: false,
        };
      } else if (action === "reject") {
        payload = {
          ...order,
          orderReject: true,
          orderAccept: false,
          orderDispatch: false,
        };
      } else if (action === "dispatch") {
        payload = { ...order, orderDispatch: true };
      } else if (action === "tracking") {
        payload = {
          ...order,
          trackingId: trackingInput.trim(),
          courierPartner: normalizeCourier(courierInput),
          courier: normalizeCourier(courierInput),
        };
      }

      await axios.put(`${url}/api/payment/dispatch/${id}`, payload);
      await fetchOrders?.();

      const messages = {
        accept: ["success", "Order accepted successfully"],
        reject: ["error", "Order rejected"],
        dispatch: ["info", "Order dispatched"],
        tracking: ["success", `Tracking ID ${trackingInput.trim()} saved`],
      };

      const message = messages[action] || ["success", "Order updated"];
      showNotification(message[0], message[1]);

      setLoading(false);
      setTrackingModalOpen(false);

      // Accept / Dispatch / Reject are list-level actions.
      // Close the details screen immediately after the API succeeds so the
      // admin returns to the order list with the refreshed status.
      if (["accept", "dispatch", "reject", "tracking"].includes(action)) {
        setTimeout(() => onClose?.(), 250);
        return;
      }

      if (action === "tracking") {
        setTrackingViewOpen(true);
      }
    } catch (error) {
      setLoading(false);
      showNotification("error", error?.response?.data?.message || error.message || "Update failed");
    }
  };

  const shareOrder = async (method = "link") => {
    const orderId = order?._id || "";
    const shortId = orderId.slice(-8).toUpperCase();
    const customer = order?.userShipping?.FullName || "Customer";
    const text = `Order #${shortId} - ${customer} - ${money(order?.amount)} - ${progress.label}`;
    const shareUrl = `${window.location.origin}/orders/${orderId}`;

    try {
      if (method === "whatsapp") {
        window.open(
          `https://wa.me/?text=${encodeURIComponent(`${text}\n${shareUrl}`)}`,
          "_blank",
          "noopener,noreferrer"
        );
      } else if (method === "email") {
        window.open(
          `mailto:?subject=${encodeURIComponent(`Order ${shortId}`)}&body=${encodeURIComponent(
            `${text}\n${shareUrl}`
          )}`
        );
      } else {
        await navigator.clipboard.writeText(shareUrl);
        showNotification("success", "Order link copied");
      }
    } catch {
      showNotification("error", "Unable to share order");
    }

    setIsShareMenuOpen(false);
  };

  const handlePrintInvoice = async () => {
    if (!invoiceRef.current) return;

    setIsPrinting(true);

    const customerName =
      order?.userShipping?.FullName?.replace(/[^a-z0-9]+/gi, "_") || "Customer";
    const invoiceNo = `DARSH-${String(order?._id || "ORDER").slice(-8).toUpperCase()}`;

    const options = {
      margin: [7, 7, 7, 7],
      filename: `${invoiceNo}_${customerName}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
      pagebreak: { mode: ["css", "legacy"] },
    };

    try {
      await html2pdf().set(options).from(invoiceRef.current).save();
      showNotification("success", "Invoice generated successfully");
    } catch (error) {
      showNotification("error", `Invoice generation failed: ${error.message}`);
    } finally {
      setIsPrinting(false);
    }
  };

  const handlePrintBrowser = () => {
    const node = invoiceRef.current;
    if (!node) return;

    const printWindow = window.open("", "_blank", "width=900,height=1000");
    if (!printWindow) {
      showNotification("error", "Please allow pop-ups to print the invoice");
      return;
    }

    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>Tax Invoice</title>
          <meta charset="utf-8" />
          <style>
            * { box-sizing: border-box; }
            body { margin: 0; padding: 24px; background: #fff; color: #111; font-family: Arial, sans-serif; }
            @media print {
              body { padding: 0; }
              @page { size: A4; margin: 8mm; }
            }
          </style>
        </head>
        <body>${node.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 350);
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: Eye },
    { id: "products", label: "Products", icon: Package },
    { id: "customer", label: "Customer", icon: User },
    { id: "shipping", label: "Shipping", icon: Truck },
    { id: "invoice", label: "Invoice", icon: ReceiptIndianRupee },
  ];

  const journey = [
    { stage: 1, label: "Placed", description: "Order received", icon: Clock },
    { stage: 2, label: "Accepted", description: "Order confirmed", icon: CheckCircle },
    { stage: 3, label: "Dispatched", description: "Shipped out", icon: Truck },
    { stage: 4, label: "Delivered", description: "Delivery completed", icon: ShieldCheck },
  ];

  const InvoicePreview = () => (
    <SectionCard
      title="Invoice"
      icon={ReceiptIndianRupee}
      action={
        <div className="flex items-center gap-2">
          <span className="hidden text-[11px] text-white/35 sm:inline">A4 • GST PAD</span>
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
        </div>
      }
    >
      <div className="rounded-2xl border border-white/10 bg-[#101010] p-3 sm:p-5">
        <div className="mb-5 flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400 text-black shadow-lg shadow-amber-400/10">
                <ReceiptIndianRupee className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-black tracking-tight text-white">TAX INVOICE</p>
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/35">Invoice / Bill</p>
              </div>
            </div>
          </div>

          <div className="sm:text-right">
            <p className="text-xs text-white/40">Invoice No.</p>
            <p className="font-mono text-sm font-semibold text-amber-300">
              DARSH-{String(order?._id || "").slice(-8).toUpperCase()}
            </p>
            <p className="mt-1 text-xs text-white/40">Date: {formatDate(order?.orderDate)}</p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-[#171717] p-4">
            <div className="mb-3 flex items-center gap-2 text-amber-300">
              <Building2 className="h-4 w-4" />
              <p className="text-xs font-bold uppercase tracking-wider">Seller</p>
            </div>
            <p className="font-semibold text-white">{SELLER.name}</p>
            <p className="mt-1 text-xs leading-5 text-white/50">{SELLER.address}</p>
            <p className="mt-1 text-xs text-white/50">Phone: {SELLER.phone}</p>
            
          </div>

          <div className="rounded-xl border border-white/10 bg-[#171717] p-4">
            <div className="mb-3 flex items-center gap-2 text-amber-300">
              <User className="h-4 w-4" />
              <p className="text-xs font-bold uppercase tracking-wider">Bill To</p>
            </div>
            <p className="font-semibold text-white">{order?.userShipping?.FullName || "Customer"}</p>
            <p className="mt-1 text-xs text-white/50">{order?.userShipping?.Phone || "—"}</p>
            <p className="mt-1 text-xs leading-5 text-white/50">{order?.userShipping?.Add || "—"}</p>
            <p className="mt-1 text-xs text-white/50">
              {[order?.userShipping?.VillorCity, order?.userShipping?.Dist, order?.userShipping?.State]
                .filter(Boolean)
                .join(", ")}
              {order?.userShipping?.Pin ? ` - ${order.userShipping.Pin}` : ""}
            </p>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
          <div className="overflow-x-auto">
            <table className="min-w-[680px] w-full border-collapse text-left">
              <thead>
                <tr className="bg-white/[0.04] text-[10px] uppercase tracking-[0.14em] text-white/40">
                  <th className="px-3 py-3">#</th>
                  <th className="px-3 py-3">Description</th>
                  <th className="px-3 py-3 text-center">HSN</th>
                  <th className="px-3 py-3 text-center">Qty</th>
                  <th className="px-3 py-3 text-right">Rate</th>
                  <th className="px-3 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => {
                  const qty = Math.max(numberValue(item?.qty), 1);
                  const amount = numberValue(item?.price);
                  const rate = amount / qty;

                  return (
                    <tr key={item?._id || `${item?.title}-${index}`} className="border-t border-white/10 text-xs text-white/75">
                      <td className="px-3 py-3 text-white/40">{index + 1}</td>
                      <td className="px-3 py-3">
                        <p className="font-semibold text-white">{item?.title || "Product"}</p>
                        <p className="mt-0.5 text-[10px] text-white/35">
                          {item?.size ? `Size: ${item.size}` : "Darsh product"}
                        </p>
                      </td>
                      <td className="px-3 py-3 text-center text-white/45">{item?.hsn || "5407"}</td>
                      <td className="px-3 py-3 text-center">{qty}</td>
                      <td className="px-3 py-3 text-right">{money(rate)}</td>
                      <td className="px-3 py-3 text-right font-semibold text-white">{money(amount)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:justify-end">
          <div className="w-full max-w-sm rounded-xl border border-white/10 bg-[#171717] p-4">
            <div className="flex justify-between py-1.5 text-xs">
              <span className="text-white/45">Subtotal</span>
              <span className="font-medium text-white">{money(totals.subtotal)}</span>
            </div>
            {totals.discount > 0 && (
              <div className="flex justify-between py-1.5 text-xs">
                <span className="text-emerald-300">Discount</span>
                <span className="font-medium text-emerald-300">-{money(totals.discount)}</span>
              </div>
            )}
            <div className="flex justify-between py-1.5 text-xs">
              <span className="text-white/45">Taxable value</span>
              <span className="font-medium text-white">{money(totals.taxableValue)}</span>
            </div>
            <div className="flex justify-between py-1.5 text-xs">
              <span className="text-white/45">Shipping</span>
              <span className="font-medium text-white">
                {totals.shipping ? money(totals.shipping) : "Free"}
              </span>
            </div>
            <div className="my-2 border-t border-white/10" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white">Grand Total</span>
              <span className="text-xl font-black text-amber-300">{money(totals.grandTotal)}</span>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2 border-t border-white/10 pt-4 text-[10px] text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <span>Payment: {order?.paymentMethod || "Online Payment"} • Status: {order?.payStatus || "—"}</span>
          <span>Computer generated invoice</span>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={handlePrintInvoice}
          disabled={isPrinting}
          className="group flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-3 text-sm font-bold text-black transition hover:-translate-y-0.5 hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPrinting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {isPrinting ? "Generating Bill..." : "Download Invoice"}
        </button>

        <button
          type="button"
          onClick={handlePrintBrowser}
          className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/[0.06]"
        >
          <Printer className="h-4 w-4" />
          Print Invoice
        </button>
      </div>
    </SectionCard>
  );

  return (
    <div className="min-h-screen bg-[#0b0b0b] pb-24 text-white selection:bg-amber-400 selection:text-black">
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(-12px) scale(.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes toastProgress {
          from { width: 100%; }
          to { width: 0%; }
        }
        @keyframes floatIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(251,191,36,.0); }
          50% { box-shadow: 0 0 0 7px rgba(251,191,36,.08); }
        }
        .order-fade-in { animation: floatIn .45s ease-out both; }
        .amber-glow { animation: pulseGlow 2.4s ease-in-out infinite; }
        .scrollbar-dark::-webkit-scrollbar { height: 5px; width: 5px; }
        .scrollbar-dark::-webkit-scrollbar-track { background: #111; }
        .scrollbar-dark::-webkit-scrollbar-thumb { background: #343434; border-radius: 999px; }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b0b0b]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-[1500px] px-3 py-3 sm:px-5 lg:px-7">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="group rounded-xl border border-white/10 bg-white/[0.03] p-2.5 transition hover:border-amber-400/30 hover:bg-amber-400/10"
                aria-label="Back"
              >
                <ArrowLeft className="h-4 w-4 text-white/70 transition group-hover:-translate-x-0.5 group-hover:text-amber-300" />
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="truncate text-lg font-bold tracking-tight text-white sm:text-xl">
                    Order Details
                  </h1>
                  <span className="hidden rounded-md border border-amber-400/20 bg-amber-400/10 px-2 py-1 font-mono text-[10px] font-semibold text-amber-300 sm:inline">
                    #{String(order?._id || "").slice(-8).toUpperCase()}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-[10px] text-white/35 sm:text-xs">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(order?.orderDate)}
                  <span>•</span>
                  <Clock className="h-3.5 w-3.5" />
                  {order?.orderDate ? new Date(order.orderDate).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—"}
                </div>
              </div>
            </div>

            <div className="hidden items-center gap-2 lg:flex">
              <div className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${getToneClasses(progress.tone)}`}>
                <ProgressIcon className="h-4 w-4" />
                <span className="text-xs font-semibold">{progress.label}</span>
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsShareMenuOpen((value) => !value)}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-xs font-semibold text-white/80 transition hover:border-white/20 hover:bg-white/[0.06]"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                  <ChevronDown className={`h-3.5 w-3.5 transition ${isShareMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {isShareMenuOpen && (
                  <div className="absolute right-0 top-[calc(100%+8px)] w-52 overflow-hidden rounded-xl border border-white/10 bg-[#171717] p-1.5 shadow-2xl shadow-black/50">
                    <button
                      type="button"
                      onClick={() => shareOrder("link")}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs text-white/70 transition hover:bg-white/5 hover:text-white"
                    >
                      <Copy className="h-4 w-4" />
                      Copy Order Link
                    </button>
                    <button
                      type="button"
                      onClick={() => shareOrder("whatsapp")}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs text-white/70 transition hover:bg-white/5 hover:text-white"
                    >
                      <MessageCircle className="h-4 w-4 text-emerald-400" />
                      Share WhatsApp
                    </button>
                    <button
                      type="button"
                      onClick={() => shareOrder("email")}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs text-white/70 transition hover:bg-white/5 hover:text-white"
                    >
                      <Mail className="h-4 w-4 text-blue-400" />
                      Share Email
                    </button>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handlePrintInvoice}
                disabled={isPrinting}
                className="flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-bold text-black shadow-lg shadow-amber-400/10 transition hover:-translate-y-0.5 hover:bg-amber-300 disabled:opacity-60"
              >
                {isPrinting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                {isPrinting ? "Generating..." : "Invoice"}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((value) => !value)}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5 text-white/70 lg:hidden"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="mx-auto max-w-[1500px] px-3 pt-3 sm:px-5 lg:px-7">
        <div className="scrollbar-dark flex overflow-x-auto rounded-xl border border-white/10 bg-[#121212] p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-[11px] font-semibold transition sm:px-4 sm:text-xs ${
                  active
                    ? "bg-amber-400 text-black shadow-lg shadow-amber-400/10"
                    : "text-white/45 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <main className="mx-auto max-w-[1500px] px-3 pb-10 pt-3 sm:px-5 lg:px-7">
        {activeTab === "invoice" ? (
          <div className="order-fade-in">
            <InvoicePreview />
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_370px]">
            {/* Main column */}
            <div className="min-w-0 space-y-4">
              {/* Summary strip */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <StatCard icon={ReceiptIndianRupee} label="Grand Total" value={money(totals.grandTotal)} />
                <StatCard icon={Package} label="Items" value={`${items.length} product${items.length === 1 ? "" : "s"}`} accent="blue" />
                <StatCard icon={CreditCard} label="Payment" value={order?.payStatus || "Pending"} accent="green" />
              </div>

              {/* Journey */}
              {activeTab === "overview" && (
                <SectionCard
                  title="Order Journey"
                  icon={Truck}
                  action={
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsJourneyPlaying((value) => !value)}
                        className="rounded-lg border border-white/10 bg-white/[0.03] p-1.5 text-white/45 transition hover:text-white"
                      >
                        {isJourneyPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                      </button>
                      <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${getToneClasses(progress.tone)}`}>
                        {progress.label}
                      </span>
                    </div>
                  }
                >
                  <div className="relative">
                    <div className="grid grid-cols-4 gap-1">
                      {journey.map((step, index) => {
                        const StepIcon = step.icon;
                        const complete = progress.stage >= step.stage;
                        const current = progress.stage === step.stage;

                        return (
                          <div key={step.stage} className="relative text-center">
                            {index < journey.length - 1 && (
                              <div className="absolute left-1/2 right-[-50%] top-5 -z-0 h-px bg-white/10">
                                <div
                                  className={`h-full origin-left transition-all duration-700 ${
                                    progress.stage > step.stage ? "w-full bg-amber-400" : "w-0"
                                  }`}
                                />
                              </div>
                            )}

                            <div
                              className={`relative mx-auto flex h-10 w-10 items-center justify-center rounded-xl border transition duration-500 sm:h-11 sm:w-11 ${
                                complete
                                  ? "border-amber-400/20 bg-amber-400 text-black shadow-lg shadow-amber-400/10"
                                  : "border-white/10 bg-[#111] text-white/25"
                              } ${current && isJourneyPlaying ? "amber-glow" : ""}`}
                            >
                              <StepIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${current && isJourneyPlaying ? "animate-pulse" : ""}`} />
                            </div>
                            <p className={`mt-2 text-[10px] font-semibold sm:text-xs ${complete ? "text-white" : "text-white/35"}`}>
                              {step.label}
                            </p>
                            <p className="mt-0.5 hidden text-[10px] text-white/25 sm:block">{step.description}</p>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-5 h-1 overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 transition-all duration-700"
                        style={{ width: `${Math.min((Math.max(progress.stage, 0) / 4) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-5 grid gap-2 sm:grid-cols-2">
                    {order?.orderDispatch ? (
                      <button
                        type="button"
                        onClick={() => setTrackingModalOpen(true)}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-3 text-xs font-bold text-black transition hover:bg-amber-300 disabled:opacity-50 sm:col-span-2"
                      >
                        <MapPin className="h-4 w-4" />
                        Add / Update Tracking
                      </button>
                    ) : order?.orderAccept ? (
                      <button
                        type="button"
                        onClick={() => acceptOrReject(order._id, "dispatch")}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-3 text-xs font-bold text-black transition hover:bg-amber-300 disabled:opacity-50 sm:col-span-2"
                      >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Truck className="h-4 w-4" />}
                        Dispatch Order
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => acceptOrReject(order._id, "accept")}
                          disabled={loading}
                          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-xs font-bold text-black transition hover:bg-emerald-400 disabled:opacity-50"
                        >
                          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                          Accept Order
                        </button>
                        <button
                          type="button"
                          onClick={() => acceptOrReject(order._id, "reject")}
                          disabled={loading}
                          className="flex items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-xs font-bold text-red-300 transition hover:bg-red-400/15 disabled:opacity-50"
                        >
                          <XCircle className="h-4 w-4" />
                          Reject Order
                        </button>
                      </>
                    )}
                  </div>
                </SectionCard>
              )}

              {/* Dedicated Dispatch & Tracking panel */}
              {(activeTab === "overview" || activeTab === "shipping") && (
                <SectionCard
                  title="Dispatch & Tracking"
                  icon={Truck}
                  action={
                    <span
                      className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
                        order?.trackingId
                          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                          : "border-amber-400/20 bg-amber-400/10 text-amber-300"
                      }`}
                    >
                      {order?.trackingId ? "Tracking Added" : "Not Dispatched"}
                    </span>
                  }
                >
                  <div className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-[#111] p-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded-xl bg-amber-400/10 p-3 text-amber-300">
                            <Truck className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] uppercase tracking-[0.16em] text-white/35">
                              Courier partner
                            </p>
                            <p className="mt-1 truncate text-sm font-bold text-white">
                              {order?.courierPartner || order?.courier || "Not assigned"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-[#111] p-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded-xl bg-emerald-400/10 p-3 text-emerald-300">
                            <MapPin className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] uppercase tracking-[0.16em] text-white/35">
                              Tracking ID
                            </p>
                            {order?.trackingId ? (
                              <button
                                type="button"
                                onClick={() => setTrackingViewOpen(true)}
                                className="mt-1 flex max-w-full items-center gap-1.5 text-left font-mono text-sm font-bold text-amber-300 hover:text-amber-200"
                              >
                                <span className="truncate">{order.trackingId}</span>
                                <ChevronRight className="h-4 w-4 shrink-0" />
                              </button>
                            ) : (
                              <p className="mt-1 text-sm font-semibold text-white/30">
                                Not added
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-amber-400/15 bg-gradient-to-br from-amber-400/[0.08] via-[#151515] to-[#101010] p-4 sm:p-5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-300">
                              Dispatch control
                            </p>
                          </div>
                          <p className="mt-1 text-xs leading-5 text-white/40">
                            Dispatch the paid order first, then add or update courier and tracking information.
                          </p>
                        </div>

                        <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
                          {!order?.orderDispatch && !order?.orderReject && (
                            <button
                              type="button"
                              onClick={() => acceptOrReject(order._id, "dispatch")}
                              disabled={loading || !order?.orderAccept}
                              className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-3 text-xs font-bold text-black transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
                              title={!order?.orderAccept ? "Accept the order before dispatching" : "Dispatch order"}
                            >
                              {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Truck className="h-4 w-4" />
                              )}
                              Dispatch Order
                            </button>
                          )}

                          {order?.orderDispatch && (
                            <button
                              type="button"
                              onClick={() => setTrackingModalOpen(true)}
                              disabled={loading}
                              className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-3 text-xs font-bold text-black transition hover:-translate-y-0.5 hover:bg-amber-300 disabled:opacity-50 sm:flex-none"
                            >
                              <MapPin className="h-4 w-4" />
                              {order?.trackingId ? "Update Tracking" : "Add Tracking"}
                            </button>
                          )}

                          {order?.trackingId && (
                            <button
                              type="button"
                              onClick={() => setTrackingViewOpen(true)}
                              className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs font-semibold text-white transition hover:border-amber-400/25 hover:bg-amber-400/5 sm:flex-none"
                            >
                              <Eye className="h-4 w-4 text-amber-300" />
                              View Tracking
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-3">
                      <div className="rounded-xl border border-white/5 bg-[#111] px-3 py-3">
                        <p className="text-[10px] uppercase tracking-wider text-white/30">Order status</p>
                        <p className="mt-1 text-xs font-semibold text-white">{progress.label}</p>
                      </div>
                      <div className="rounded-xl border border-white/5 bg-[#111] px-3 py-3">
                        <p className="text-[10px] uppercase tracking-wider text-white/30">Dispatch</p>
                        <p className={`mt-1 text-xs font-semibold ${order?.orderDispatch ? "text-emerald-300" : "text-white/40"}`}>
                          {order?.orderDispatch ? "Dispatched" : "Waiting"}
                        </p>
                      </div>
                      <div className="rounded-xl border border-white/5 bg-[#111] px-3 py-3">
                        <p className="text-[10px] uppercase tracking-wider text-white/30">Tracking</p>
                        <p className={`mt-1 truncate text-xs font-semibold ${order?.trackingId ? "text-emerald-300" : "text-white/40"}`}>
                          {order?.trackingId || "Not added"}
                        </p>
                      </div>
                    </div>
                  </div>
                </SectionCard>
              )}

              {/* Products */}
              {(activeTab === "overview" || activeTab === "products") && (
                <SectionCard
                  title={`Products in this order (${items.length})`}
                  icon={Package}
                  action={<span className="text-xs font-semibold text-amber-300">{money(totals.grandTotal)}</span>}
                >
                  <div className="overflow-hidden rounded-xl border border-white/10">
                    <div className="hidden grid-cols-[minmax(0,1fr)_100px_70px_100px] gap-3 border-b border-white/10 bg-[#111] px-4 py-3 text-[10px] uppercase tracking-wider text-white/35 sm:grid">
                      <span>Item</span>
                      <span>Rate</span>
                      <span>Qty</span>
                      <span className="text-right">Amount</span>
                    </div>

                    <div className="divide-y divide-white/10">
                      {items.length === 0 ? (
                        <div className="p-8 text-center text-xs text-white/35">No products found in this order.</div>
                      ) : (
                        items.map((item, index) => {
                          const qty = Math.max(numberValue(item?.qty), 1);
                          const amount = numberValue(item?.price);
                          const src = imageUrl(item);

                          return (
                            <div
                              key={item?._id || `${item?.title}-${index}`}
                              className="group grid grid-cols-1 gap-3 bg-[#151515] p-3 transition hover:bg-[#181818] sm:grid-cols-[minmax(0,1fr)_100px_70px_100px] sm:items-center sm:gap-3 sm:px-4"
                            >
                              <div className="flex min-w-0 items-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => setSelectedImage({ src, title: item?.title || "Product" })}
                                  className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black transition hover:scale-[1.03] hover:border-amber-400/30"
                                >
                                  <img src={src} alt={item?.title || "Product"} className="h-full w-full object-cover" />
                                  <span className="absolute bottom-1 right-1 rounded-md bg-black/80 px-1.5 py-0.5 text-[9px] font-bold text-white">
                                    {qty}
                                  </span>
                                </button>

                                <div className="min-w-0">
                                  <p className="truncate text-xs font-semibold text-white sm:text-sm">{item?.title || "Product"}</p>
                                  <p className="mt-1 text-[10px] text-white/35">
                                    {item?.size ? `Size: ${item.size} • ` : ""}
                                    SKU: {item?.sku || item?.productCode || "—"}
                                  </p>
                                  <div className="mt-1.5 flex flex-wrap gap-2 sm:hidden">
                                    <span className="text-[10px] text-white/45">Rate {money(amount / qty)}</span>
                                    <span className="text-[10px] text-amber-300">Total {money(amount)}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="hidden text-xs text-white/60 sm:block">{money(amount / qty)}</div>
                              <div className="hidden text-xs text-white/60 sm:block">{qty}</div>
                              <div className="hidden text-right text-xs font-bold text-white sm:block">{money(amount)}</div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-white/10 bg-[#111] p-4">
                      <p className="text-[10px] uppercase tracking-wider text-white/35">Payment method</p>
                      <div className="mt-2 flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-amber-300" />
                        <span className="text-xs font-semibold text-white">{order?.paymentMethod || "Online Payment"}</span>
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-[#111] p-4">
                      <p className="text-[10px] uppercase tracking-wider text-white/35">Payment status</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${String(order?.payStatus).toLowerCase() === "paid" ? "bg-emerald-400" : "bg-amber-400"}`} />
                        <span className="text-xs font-semibold text-white">{order?.payStatus || "Pending"}</span>
                      </div>
                    </div>
                  </div>
                </SectionCard>
              )}

              {/* Customer / shipping on mobile and overview */}
              {(activeTab === "customer" || activeTab === "overview") && (
                <SectionCard title="Customer Details" icon={User}>
                  <div className="space-y-2">
                    <DetailRow
                      icon={User}
                      label="Name"
                      value={order?.userShipping?.FullName}
                      copyable
                      copied={copiedField === "Customer Name"}
                      onCopy={() => copyToClipboard(order?.userShipping?.FullName, "Customer Name")}
                    />
                    <DetailRow
                      icon={Phone}
                      label="Phone"
                      value={order?.userShipping?.Phone}
                      copyable
                      copied={copiedField === "Phone"}
                      onCopy={() => copyToClipboard(order?.userShipping?.Phone, "Phone")}
                    />
                    {order?.userShipping?.Email && (
                      <DetailRow
                        icon={Mail}
                        label="Email"
                        value={order?.userShipping?.Email}
                        copyable
                        copied={copiedField === "Email"}
                        onCopy={() => copyToClipboard(order?.userShipping?.Email, "Email")}
                      />
                    )}
                  </div>
                </SectionCard>
              )}

              {(activeTab === "shipping" || activeTab === "overview") && (
                <SectionCard title="Shipping Address" icon={MapPin}>
                  <div className="rounded-xl border border-amber-400/10 bg-amber-400/[0.04] p-4">
                    <div className="flex items-start gap-3">
                      <Home className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                      <p className="text-xs leading-6 text-white/75">{order?.userShipping?.Add || "Address not available"}</p>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-white/5 bg-[#111] p-3">
                      <p className="text-[10px] text-white/35">City / Village</p>
                      <p className="mt-1 truncate text-xs font-semibold text-white">{order?.userShipping?.VillorCity || "—"}</p>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-[#111] p-3">
                      <p className="text-[10px] text-white/35">District</p>
                      <p className="mt-1 truncate text-xs font-semibold text-white">{order?.userShipping?.Dist || "—"}</p>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-[#111] p-3">
                      <p className="text-[10px] text-white/35">State</p>
                      <p className="mt-1 truncate text-xs font-semibold text-white">{order?.userShipping?.State || "—"}</p>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-[#111] p-3">
                      <p className="text-[10px] text-white/35">PIN</p>
                      <p className="mt-1 text-xs font-semibold text-white">{order?.userShipping?.Pin || "—"}</p>
                    </div>
                  </div>
                </SectionCard>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-4">
              <SectionCard title="Order Information" icon={FileText}>
                <div className="space-y-2">
                  <DetailRow
                    icon={Hash}
                    label="Order ID"
                    value={order?._id}
                    copyable
                    copied={copiedField === "Order ID"}
                    onCopy={() => copyToClipboard(order?._id, "Order ID")}
                  />
                  <DetailRow icon={Calendar} label="Placed" value={formatDateTime(order?.orderDate)} />
                  <DetailRow icon={CreditCard} label="Payment" value={order?.paymentMethod || "Online Payment"} />
                  <DetailRow icon={ShieldCheck} label="Status" value={progress.label} />
                  {order?.transactionId && (
                    <DetailRow
                      icon={ReceiptIndianRupee}
                      label="Transaction"
                      value={order.transactionId}
                      copyable
                      copied={copiedField === "Transaction ID"}
                      onCopy={() => copyToClipboard(order.transactionId, "Transaction ID")}
                    />
                  )}
                </div>
              </SectionCard>

              <SectionCard
                title="Shipment Summary"
                icon={Truck}
                action={order?.trackingId ? <span className="h-2 w-2 rounded-full bg-emerald-400" /> : null}
              >
                <div className="rounded-xl border border-white/10 bg-[#111] p-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-white/35">Courier</p>
                      <p className="mt-1 text-xs font-semibold text-white">
                        {order?.courierPartner || order?.courier || "Not assigned"}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-wider text-white/35">Tracking ID</p>
                      {order?.trackingId ? (
                        <button
                          type="button"
                          onClick={() => setTrackingViewOpen(true)}
                          className="mt-1 flex max-w-full items-center gap-1.5 text-left font-mono text-xs font-semibold text-amber-300 transition hover:text-amber-200"
                          title="Open tracking details"
                        >
                          <span className="truncate">{order.trackingId}</span>
                          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                        </button>
                      ) : (
                        <p className="mt-1 truncate font-mono text-xs font-semibold text-white/35">Not added</p>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setTrackingModalOpen(true)}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs font-semibold text-white transition hover:border-amber-400/25 hover:bg-amber-400/5"
                >
                  <MapPin className="h-4 w-4 text-amber-300" />
                  {order?.trackingId ? "Update Tracking" : "Add Tracking"}
                </button>
              </SectionCard>

              <SectionCard title="GST Billing Summary" icon={Landmark}>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-white/40">Taxable value</span>
                    <span className="font-semibold text-white">{money(totals.taxableValue)}</span>
                  </div>
                  <div className="my-2 border-t border-white/10" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">Grand total</span>
                    <span className="text-lg font-black text-amber-300">{money(totals.grandTotal)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab("invoice")}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-3 text-xs font-bold text-black transition hover:bg-amber-300"
                >
                  <ReceiptIndianRupee className="h-4 w-4" />
                  Open Invoice
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </SectionCard>
            </aside>
          </div>
        )}
      </main>

      {/* Mobile actions */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0b0b0b]/95 p-3 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-2xl gap-2">
          <button
            type="button"
            onClick={handlePrintInvoice}
            disabled={isPrinting}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-400 px-3 py-3 text-xs font-bold text-black disabled:opacity-60"
          >
            {isPrinting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Invoice
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("invoice")}
            className="flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-4 text-white/80"
          >
            <ReceiptIndianRupee className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((value) => !value)}
            className="flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-4 text-white/80"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-x-3 bottom-[76px] z-50 rounded-2xl border border-white/10 bg-[#171717] p-2 shadow-2xl shadow-black/60 lg:hidden">
          <button
            type="button"
            onClick={() => {
              setIsMobileMenuOpen(false);
              setActiveTab("invoice");
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-xs text-white/75 hover:bg-white/5"
          >
            <ReceiptIndianRupee className="h-4 w-4 text-amber-300" />
            Open Invoice
          </button>
          <button
            type="button"
            onClick={() => {
              setIsMobileMenuOpen(false);
              setIsShareMenuOpen(true);
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-xs text-white/75 hover:bg-white/5"
          >
            <Share2 className="h-4 w-4" />
            Share order
          </button>
        </div>
      )}

      {/* Image viewer */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-[#151515] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <p className="truncate pr-4 text-sm font-semibold text-white">{selectedImage.title}</p>
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="rounded-lg p-1.5 text-white/45 hover:bg-white/5 hover:text-white"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <div className="flex max-h-[80vh] items-center justify-center bg-black p-4">
              <img
                src={selectedImage.src}
                alt={selectedImage.title}
                className="max-h-[72vh] max-w-full rounded-xl object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Compact tracking details popup */}
      {trackingViewOpen && order?.trackingId && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setTrackingViewOpen(false);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#141414] shadow-[0_30px_100px_rgba(0,0,0,.65)]">
            <div className="h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-emerald-400" />
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-4 sm:px-5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300">
                  <Truck className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-300">Shipment</p>
                  <h2 className="truncate text-sm font-bold text-white">Tracking Details</h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTrackingViewOpen(false)}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-2 text-white/45 hover:text-white"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 p-4 sm:p-5">
              <div className="rounded-2xl border border-amber-400/15 bg-amber-400/[0.05] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-white/35">Tracking ID</p>
                    <p className="mt-2 break-all font-mono text-base font-black text-amber-300 sm:text-lg">
                      {order.trackingId}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[9px] font-bold text-emerald-300">
                    Active
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-white/10 bg-[#101010] p-3">
                  <p className="text-[9px] uppercase tracking-wider text-white/30">Courier</p>
                  <p className="mt-1 truncate text-xs font-bold text-white">
                    {normalizeCourier(order?.courierPartner || order?.courier)}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#101010] p-3">
                  <p className="text-[9px] uppercase tracking-wider text-white/30">Order</p>
                  <p className="mt-1 truncate font-mono text-xs font-bold text-white">
                    #{String(order?._id || "").slice(-8).toUpperCase()}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => copyToClipboard(order.trackingId, "Tracking ID")}
                  className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs font-bold text-white hover:bg-white/[0.06]"
                >
                  <Copy className="h-4 w-4" />
                  Copy Tracking ID
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const courier = normalizeCourier(order?.courierPartner || order?.courier);
                    window.open(
                      COURIER_TRACKING_URLS[courier],
                      "_blank",
                      "noopener,noreferrer"
                    );
                  }}
                  className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-3 text-xs font-black text-black hover:bg-amber-300"
                >
                  <MapPin className="h-4 w-4" />
                  Open Tracking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compact Add / Update Tracking popup */}
      {trackingModalOpen && (
        <div
          className="fixed inset-0 z-[125] flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !loading) setTrackingModalOpen(false);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#141414] shadow-[0_30px_100px_rgba(0,0,0,.65)]">
            <div className="h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300" />

            <div className="flex items-center justify-between border-b border-white/10 px-4 py-4 sm:px-5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300">
                  <Truck className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-white sm:text-base">
                    {order?.trackingId ? "Update Tracking" : "Add Tracking"}
                  </h2>
                  <p className="mt-0.5 text-[10px] text-white/35">
                    Only DTDC and India Post
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !loading && setTrackingModalOpen(false)}
                disabled={loading}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-2 text-white/45 hover:text-white disabled:opacity-40"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>

            <form
              className="space-y-4 p-4 sm:p-5"
              onSubmit={(event) => {
                event.preventDefault();
                if (!trackingInput.trim()) {
                  showNotification("error", "Enter a tracking number");
                  return;
                }
                acceptOrReject(order._id, "tracking");
              }}
            >
              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
                  Courier Partner
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {COURIER_OPTIONS.map((courier) => {
                    const active = normalizeCourier(courierInput) === courier;
                    return (
                      <button
                        key={courier}
                        type="button"
                        onClick={() => setCourierInput(courier)}
                        disabled={loading}
                        className={`flex min-h-12 items-center justify-center gap-2 rounded-xl border px-3 py-3 text-xs font-bold transition ${
                          active
                            ? "border-amber-400/50 bg-amber-400 text-black shadow-lg shadow-amber-400/10"
                            : "border-white/10 bg-white/[0.03] text-white/55 hover:bg-white/[0.06] hover:text-white"
                        } disabled:opacity-50`}
                      >
                        <Truck className="h-4 w-4" />
                        {courier}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label htmlFor="tracking-id-input" className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
                  Tracking ID
                </label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
                  <input
                    id="tracking-id-input"
                    value={trackingInput}
                    onChange={(event) => setTrackingInput(event.target.value.replace(/\s+/g, " ").trimStart())}
                    placeholder="Enter tracking / AWB number"
                    autoComplete="off"
                    autoCapitalize="characters"
                    disabled={loading}
                    className="h-12 w-full rounded-xl border border-white/10 bg-[#0d0d0d] pl-10 pr-3 font-mono text-sm font-semibold tracking-wide text-white outline-none placeholder:text-white/20 focus:border-amber-400/40 focus:ring-2 focus:ring-amber-400/10 disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-white/5 bg-[#0e0e0e] px-3 py-2.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] text-white/35">Tracking page</span>
                  <span className="truncate text-[10px] font-medium text-white/55">
                    {COURIER_TRACKING_URLS[normalizeCourier(courierInput)]}
                  </span>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setTrackingModalOpen(false)}
                  disabled={loading}
                  className="min-h-11 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs font-semibold text-white/60 hover:bg-white/[0.06] hover:text-white disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !trackingInput.trim()}
                  className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-xs font-bold text-black hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  {loading ? "Saving..." : order?.trackingId ? "Update Tracking" : "Save Tracking"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          Hidden A4 GST PAD BILL
          This is intentionally white and print/PDF friendly.
          ===================================================== */}
      <div className="pointer-events-none fixed left-[-100000px] top-0 opacity-0">
        <div
          ref={invoiceRef}
          style={{
            width: "794px",
            minHeight: "1123px",
            background: "#fff",
            color: "#111",
            padding: "34px",
            fontFamily: "Arial, Helvetica, sans-serif",
            fontSize: "11px",
          }}
        >
          <div style={{ border: "1px solid #222", minHeight: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "22px 24px", borderBottom: "2px solid #111" }}>
              <div>
                <div style={{ fontSize: "28px", fontWeight: 900, letterSpacing: "-1px" }}>{SELLER.name}</div>
                <div style={{ marginTop: "5px", fontSize: "10px", lineHeight: 1.5 }}>
                  {SELLER.address}
                </div>
                <div style={{ marginTop: "3px", fontSize: "10px" }}>Phone: {SELLER.phone}</div>
                <div style={{ marginTop: "3px", fontSize: "10px" }}>
                  State: {SELLER.state} | State Code: {SELLER.stateCode}
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "22px", fontWeight: 900 }}>TAX INVOICE</div>
                <div style={{ marginTop: "8px", fontSize: "10px" }}>
                  <b>Invoice No:</b> DARSH-{String(order?._id || "").slice(-8).toUpperCase()}
                </div>
                <div style={{ marginTop: "4px", fontSize: "10px" }}>
                  <b>Order ID:</b> {order?._id || "—"}
                </div>
                <div style={{ marginTop: "4px", fontSize: "10px" }}>
                  <b>Date:</b> {formatDate(order?.orderDate)}
                </div>
                <div style={{ marginTop: "4px", fontSize: "10px" }}>
                  <b>Payment:</b> {order?.payStatus || "—"}
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: "1px solid #222" }}>
              <div style={{ padding: "15px 18px", borderRight: "1px solid #222" }}>
                <div style={{ fontWeight: 800, marginBottom: "7px" }}>BILL TO</div>
                <div style={{ fontWeight: 700 }}>{order?.userShipping?.FullName || "Customer"}</div>
                <div style={{ marginTop: "4px" }}>{order?.userShipping?.Phone || "—"}</div>
                <div style={{ marginTop: "4px", lineHeight: 1.5 }}>{order?.userShipping?.Add || "—"}</div>
                <div style={{ marginTop: "4px" }}>
                  {[order?.userShipping?.VillorCity, order?.userShipping?.Dist, order?.userShipping?.State]
                    .filter(Boolean)
                    .join(", ")}
                  {order?.userShipping?.Pin ? ` - ${order.userShipping.Pin}` : ""}
                </div>
              </div>

              <div style={{ padding: "15px 18px" }}>
                <div style={{ fontWeight: 800, marginBottom: "7px" }}>DELIVERY / PAYMENT</div>
                <div style={{ marginBottom: "4px" }}>
                  <b>Courier:</b> {order?.courierPartner || order?.courier || "—"}
                </div>
                <div style={{ marginBottom: "4px" }}>
                  <b>Tracking:</b> {order?.trackingId || "—"}
                </div>
                <div style={{ marginBottom: "4px" }}>
                  <b>Method:</b> {order?.paymentMethod || "Online Payment"}
                </div>
                <div>
                  <b>Transaction:</b> {order?.transactionId || "—"}
                </div>
              </div>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f1f1f1" }}>
                  {["S.No", "Description", "HSN", "Qty", "Rate", "Amount"].map((heading, index) => (
                    <th
                      key={heading}
                      style={{
                        border: "1px solid #222",
                        padding: "8px 6px",
                        textAlign: index === 1 ? "left" : index === 0 || index === 2 || index === 3 || index === 5 ? "center" : "right",
                        fontSize: "9px",
                      }}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => {
                  const qty = Math.max(numberValue(item?.qty), 1);
                  const amount = numberValue(item?.price);
                  const rate = amount / qty;

                  return (
                    <tr key={item?._id || `${item?.title}-${index}`}>
                      <td style={{ border: "1px solid #222", padding: "8px 6px", textAlign: "center" }}>{index + 1}</td>
                      <td style={{ border: "1px solid #222", padding: "8px 6px" }}>
                        <b>{item?.title || "Product"}</b>
                        {item?.size ? <div style={{ fontSize: "8px", marginTop: "3px" }}>Size: {item.size}</div> : null}
                      </td>
                      <td style={{ border: "1px solid #222", padding: "8px 6px", textAlign: "center" }}>{item?.hsn || "5407"}</td>
                      <td style={{ border: "1px solid #222", padding: "8px 6px", textAlign: "center" }}>{qty}</td>
                      <td style={{ border: "1px solid #222", padding: "8px 6px", textAlign: "right" }}>{money(rate)}</td>
                      <td style={{ border: "1px solid #222", padding: "8px 6px", textAlign: "right", fontWeight: 700 }}>{money(amount)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div style={{ display: "flex", justifyContent: "flex-end", padding: "18px" }}>
              <table style={{ width: "300px", borderCollapse: "collapse" }}>
                <tbody>
                  <tr>
                    <td style={{ padding: "5px 0" }}>Subtotal</td>
                    <td style={{ padding: "5px 0", textAlign: "right" }}>{money(totals.subtotal)}</td>
                  </tr>
                  {totals.discount > 0 && (
                    <tr>
                      <td style={{ padding: "5px 0" }}>Discount</td>
                      <td style={{ padding: "5px 0", textAlign: "right" }}>-{money(totals.discount)}</td>
                    </tr>
                  )}
                  <tr>
                    <td style={{ padding: "5px 0" }}>Shipping</td>
                    <td style={{ padding: "5px 0", textAlign: "right" }}>{totals.shipping ? money(totals.shipping) : "Free"}</td>
                  </tr>
                  <tr>
                    <td style={{ borderTop: "2px solid #111", padding: "8px 0", fontWeight: 900 }}>TOTAL</td>
                    <td style={{ borderTop: "2px solid #111", padding: "8px 0", textAlign: "right", fontWeight: 900, fontSize: "14px" }}>
                      {money(totals.grandTotal)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ padding: "0 18px 18px" }}>
              <div style={{ border: "1px solid #999", padding: "10px", fontSize: "9px", lineHeight: 1.5 }}>
                <b>Amount in words:</b> {money(totals.grandTotal)} only.
                <br />
                <b>Note:</b> This is a computer-generated invoice. Please retain this bill for your records.
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "36px" }}>
                <div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 700 }}>For {SELLER.name}</div>
                  <img src={signSrc} alt="Authorized Signatory" style={{ marginTop: "8px", maxWidth: "120px" }} />
                  <div style={{ borderTop: "1px solid #555", width: "180px", marginLeft: "auto" }} />
                  <div style={{ marginTop: "5px", fontSize: "9px" }}>Authorized Signatory</div>
                </div>
              </div>
            </div>

            <div style={{ borderTop: "1px solid #222", padding: "8px 18px", textAlign: "center", fontSize: "8px" }}>
              Thank you for shopping with {SELLER.name}.
            </div>
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