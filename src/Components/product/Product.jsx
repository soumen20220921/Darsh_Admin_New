import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Package,
  Flame,
  CheckCircle,
  XCircle,
  Download,
  RefreshCw,
  ChevronDown,
  ArrowUpDown,
  X,
} from "lucide-react";
import { useAppContext } from "../../context/Context";
import ViewProduct from "./ViewProduct";
import EditProduct from "./EditProduct";
import DeleteModal from "./DeleteModal";
import axios from "axios";

/*
  DARSH ADMIN - PRODUCT CATALOG
  Dark luxury dashboard inspired by the supplied reference image.
  Uses Tailwind CSS + lucide-react.
*/

const Notification = ({ message, type, onClose }) => {
  const success = type === "success";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-[fadeIn_.25s_ease-out]">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#151515] p-7 shadow-2xl shadow-black/60 animate-[scaleIn_.25s_ease-out]">
        <div
          className={`absolute -right-20 -top-20 h-48 w-48 rounded-full blur-3xl ${
            success ? "bg-emerald-500/10" : "bg-red-500/10"
          }`}
        />

        <div className="relative text-center">
          <div
            className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border ${
              success
                ? "border-emerald-500/30 bg-emerald-500/10"
                : "border-red-500/30 bg-red-500/10"
            }`}
          >
            {success ? (
              <CheckCircle className="h-7 w-7 text-emerald-400" />
            ) : (
              <XCircle className="h-7 w-7 text-red-400" />
            )}
          </div>

          <h3 className="text-xl font-semibold text-white">
            {success ? "Success" : "Something went wrong"}
          </h3>

          <p className="mt-2 text-sm leading-6 text-zinc-400">{message}</p>

          <button
            onClick={onClose}
            className="mt-6 w-full rounded-xl bg-[#f5ad0b] px-4 py-3 text-sm font-semibold text-black transition hover:bg-[#ffc13b] active:scale-[.98]"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

const Product = () => {
  const { setTab, allProduct = [], getProduct, url } = useAppContext();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showSortOptions, setShowSortOptions] = useState(false);

  const [notification, setNotification] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentView, setCurrentView] = useState("list");

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const showNotification = useCallback((message, type = "success") => {
    setNotification({ message, type });
  }, []);

  const handleAddProduct = useCallback(() => {
    setTab(4);
  }, [setTab]);

  const handleViewProduct = useCallback((product) => {
    setSelectedProduct(product);
    setCurrentView("view");
  }, []);

  const handleEditProduct = useCallback((product) => {
    setSelectedProduct(product);
    setCurrentView("edit");
  }, []);

  const handleDeleteClick = useCallback((product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  }, []);

  const handleCancel = useCallback(() => {
    setCurrentView("list");
    setSelectedProduct(null);
  }, []);

  const deleteProduct = async (productId, productName) => {
    try {
      await axios.delete(`${url}/api/product/${productId}`);
      await getProduct();
      setShowDeleteModal(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error("Error deleting product:", error);
      showNotification("Failed to delete product. Please try again.", "error");
    }
  };

  const handleConfirmDelete = () => {
    if (!selectedProduct) return;
    deleteProduct(selectedProduct._id, selectedProduct.productName);
  };

  const handleSaveEdit = () => {
    setCurrentView("list");
    setSelectedProduct(null);
    getProduct();
  };

  const refreshData = async () => {
    if (refreshing) return;

    setRefreshing(true);
    try {
      await getProduct();
      showNotification("Product catalog refreshed.", "success");
    } catch (error) {
      console.error(error);
      showNotification("Failed to refresh products.", "error");
    } finally {
      setTimeout(() => setRefreshing(false), 650);
    }
  };

  const categories = useMemo(() => {
    return [
      ...new Set(
        allProduct
          .map((product) => product.category)
          .filter(Boolean)
          .map(String)
      ),
    ].sort();
  }, [allProduct]);

  const productStats = useMemo(() => {
    return {
      total: allProduct.length,
      active: allProduct.filter((p) => Number(p.stock) > 0).length,
      inactive: allProduct.filter((p) => Number(p.stock) <= 0).length,
      hotSell: allProduct.filter((p) => p.hotSell).length,
    };
  }, [allProduct]);

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    let result = [...allProduct];

    if (term) {
      result = result.filter((product) => {
        const name = String(product.productName || "").toLowerCase();
        const sku = String(
          product.sku || product.productId || product.productCode || ""
        ).toLowerCase();
        const description = String(product.description || "").toLowerCase();

        return (
          name.includes(term) ||
          sku.includes(term) ||
          description.includes(term)
        );
      });
    }

    if (categoryFilter !== "all") {
      result = result.filter(
        (product) => String(product.category || "") === categoryFilter
      );
    }

    if (filterStatus === "active") {
      result = result.filter((product) => Number(product.stock) > 0);
    } else if (filterStatus === "inactive") {
      result = result.filter((product) => Number(product.stock) <= 0);
    } else if (filterStatus === "hotSell") {
      result = result.filter((product) => product.hotSell);
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return String(a.productName || "").localeCompare(
            String(b.productName || "")
          );
        case "price-high":
          return Number(b.price || 0) - Number(a.price || 0);
        case "price-low":
          return Number(a.price || 0) - Number(b.price || 0);
        case "stock":
          return Number(b.stock || 0) - Number(a.stock || 0);
        case "newest":
        default:
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
    });

    return result;
  }, [
    allProduct,
    searchTerm,
    categoryFilter,
    filterStatus,
    sortBy,
  ]);

  const exportProducts = async () => {
    if (!filteredProducts.length || exporting) return;

    setExporting(true);

    try {
      const data = filteredProducts.map((product) => ({
        "Product Name": product.productName || "",
        SKU: product.sku || product.productId || product.productCode || "",
        Category: product.category || "",
        Price: product.price ?? "",
        "Original Price": product.originalPrice ?? "",
        Stock: Math.max(Number(product.stock || 0), 0),
        Status: Number(product.stock || 0) > 0 ? "Active" : "Inactive",
        "Hot Sell": product.hotSell ? "Yes" : "No",
      }));

      const headers = Object.keys(data[0]);
      const csv =
        headers.join(",") +
        "\n" +
        data
          .map((row) =>
            headers
              .map((key) => `"${String(row[key]).replace(/"/g, '""')}"`)
              .join(",")
          )
          .join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = downloadUrl;
      link.download = `darsh-products-${
        new Date().toISOString().split("T")[0]
      }.csv`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      showNotification("Products exported successfully.", "success");
    } catch (error) {
      console.error(error);
      showNotification("Failed to export products.", "error");
    } finally {
      setTimeout(() => setExporting(false), 500);
    }
  };

  const getImage = (product) => {
    if (!product?.images?.length) return null;
    return `${url}/img/${product.images[0]}`;
  };

  const getSku = (product) =>
    product?.sku ||
    product?.productId ||
    product?.productCode ||
    `DRS-${String(product?._id || "").slice(-7).toUpperCase()}`;

  const getAddedDate = (product) => {
    if (!product?.createdAt) return "--";

    const date = new Date(product.createdAt);
    if (Number.isNaN(date.getTime())) return "--";

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });
  };


  const renderView = () => {
    if (currentView === "view" && selectedProduct) {
      return (
        <ViewProduct product={selectedProduct} onBack={handleCancel} />
      );
    }

    if (currentView === "edit" && selectedProduct) {
      return (
        <EditProduct
          product={selectedProduct}
          onSave={handleSaveEdit}
          onCancel={handleCancel}
        />
      );
    }

    return (
      <div className="min-h-screen bg-[#0b0b0b] px-3 py-5 text-white sm:px-5 lg:px-7">
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @keyframes scaleIn {
            from { opacity: 0; transform: scale(.96); }
            to { opacity: 1; transform: scale(1); }
          }

          @keyframes rowIn {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .darsh-product-row {
            animation: rowIn .35s ease both;
          }

          .darsh-scroll::-webkit-scrollbar {
            height: 6px;
            width: 6px;
          }

          .darsh-scroll::-webkit-scrollbar-track {
            background: #111;
          }

          .darsh-scroll::-webkit-scrollbar-thumb {
            background: #333;
            border-radius: 99px;
          }
        `}</style>

        {/* Header */}
        <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-1 rounded-full bg-[#f5ad0b]" />
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-[32px]">
                Products
              </h1>
            </div>

            <p className="mt-1 pl-4 text-sm text-zinc-500">
              {filteredProducts.length} of {allProduct.length} sarees shown
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={refreshData}
              disabled={refreshing}
              className="group inline-flex items-center justify-center gap-2 rounded-lg border border-[#303030] bg-[#171717] px-3.5 py-2.5 text-sm font-medium text-zinc-300 transition-all hover:border-[#464646] hover:bg-[#1d1d1d] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing ? "animate-spin" : "group-hover:rotate-180"
                } transition-transform duration-500`}
              />
              <span className="hidden sm:inline">
                {refreshing ? "Refreshing" : "Refresh"}
              </span>
            </button>

            <button
              onClick={exportProducts}
              disabled={exporting || !filteredProducts.length}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#303030] bg-[#171717] px-3.5 py-2.5 text-sm font-medium text-zinc-300 transition-all hover:border-[#464646] hover:bg-[#1d1d1d] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {exporting ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">
                {exporting ? "Exporting..." : "Export"}
              </span>
            </button>

            <button
              onClick={handleAddProduct}
              className="group inline-flex items-center justify-center gap-2 rounded-lg bg-[#f5ad0b] px-4 py-2.5 text-sm font-semibold text-black shadow-[0_0_25px_rgba(245,173,11,.12)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#ffbd24] hover:shadow-[0_0_30px_rgba(245,173,11,.2)] active:translate-y-0"
            >
              <Plus className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
              <span>Upload product</span>
            </button>
          </div>
        </div>

        {/* Quick stats */}
        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            {
              label: "Total",
              value: productStats.total,
              icon: Package,
              active: filterStatus === "all",
              onClick: () => setFilterStatus("all"),
            },
            {
              label: "Active",
              value: productStats.active,
              icon: CheckCircle,
              active: filterStatus === "active",
              onClick: () => setFilterStatus("active"),
            },
            {
              label: "Out of stock",
              value: productStats.inactive,
              icon: XCircle,
              active: filterStatus === "inactive",
            },
            {
              label: "Hot sell",
              value: productStats.hotSell,
              icon: Flame,
              active: filterStatus === "hotSell",
              onClick: () => setFilterStatus("hotSell"),
            },
          ].map((stat) => {
            const Icon = stat.icon;

            return (
              <button
                key={stat.label}
                onClick={stat.onClick}
                className={`rounded-xl border p-3 text-left transition-all ${
                  stat.active
                    ? "border-[#5a4213] bg-[#17130a]"
                    : "border-[#292929] bg-[#111111] hover:border-[#3a3a3a]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500">{stat.label}</span>
                  <Icon
                    className={`h-4 w-4 ${
                      stat.label === "Hot sell"
                        ? "text-[#f5ad0b]"
                        : stat.label === "Active"
                        ? "text-emerald-400"
                        : stat.label === "Out of stock"
                        ? "text-red-400"
                        : "text-zinc-500"
                    }`}
                  />
                </div>
                <p className="mt-1 text-lg font-semibold text-zinc-100">
                  {stat.value}
                </p>
              </button>
            );
          })}
        </div>

        {/* Search + filters */}
        <div className="mb-4 rounded-xl border border-[#2b2b2b] bg-[#151515] p-3 sm:p-4">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or SKU"
                className="h-11 w-full rounded-lg border border-[#303030] bg-[#1a1a1a] pl-10 pr-10 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-[#555] focus:ring-1 focus:ring-[#444]"
              />

              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 lg:flex">
              <div className="relative min-w-0 lg:w-44">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="h-11 w-full appearance-none rounded-lg border border-[#303030] bg-[#1a1a1a] px-3 pr-9 text-sm text-zinc-300 outline-none transition focus:border-[#555]"
                >
                  <option value="all">All categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              </div>

              <div className="relative min-w-0 lg:w-36">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="h-11 w-full appearance-none rounded-lg border border-[#303030] bg-[#1a1a1a] px-3 pr-9 text-sm text-zinc-300 outline-none transition focus:border-[#555]"
                >
                  <option value="all">All status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Out of stock</option>
                  <option value="hotSell">Hot sell</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Results / sort */}
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="text-xs text-zinc-500 sm:text-sm">
            Showing{" "}
            <span className="font-medium text-zinc-300">
              {filteredProducts.length}
            </span>{" "}
            of{" "}
            <span className="font-medium text-zinc-300">
              {allProduct.length}
            </span>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowSortOptions((v) => !v)}
              className="inline-flex items-center gap-2 rounded-lg border border-[#2c2c2c] bg-[#141414] px-3 py-2 text-xs text-zinc-400 transition hover:border-[#454545] hover:text-white sm:text-sm"
            >
              <ArrowUpDown className="h-3.5 w-3.5" />
              <span>
                Sort:{" "}
                {sortBy === "name"
                  ? "Name"
                  : sortBy === "price-high"
                  ? "Price High"
                  : sortBy === "price-low"
                  ? "Price Low"
                  : sortBy === "stock"
                  ? "Stock"
                  : "Newest"}
              </span>
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${
                  showSortOptions ? "rotate-180" : ""
                }`}
              />
            </button>

            {showSortOptions && (
              <div className="absolute right-0 top-full z-30 mt-2 w-48 overflow-hidden rounded-xl border border-[#303030] bg-[#181818] p-1 shadow-2xl shadow-black/50">
                {[
                  ["newest", "Newest first"],
                  ["name", "Name A-Z"],
                  ["price-high", "Price high to low"],
                  ["price-low", "Price low to high"],
                  ["stock", "Stock level"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => {
                      setSortBy(value);
                      setShowSortOptions(false);
                    }}
                    className={`w-full rounded-lg px-3 py-2.5 text-left text-sm transition ${
                      sortBy === value
                        ? "bg-[#27200f] text-[#f5ad0b]"
                        : "text-zinc-400 hover:bg-[#222] hover:text-white"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Desktop table */}
        {!isMobile ? (
          <div className="darsh-scroll overflow-x-auto rounded-xl border border-[#2b2b2b] bg-[#151515] shadow-2xl shadow-black/10">
            <table className="w-full min-w-[1050px] border-collapse">
              <thead>
                <tr className="border-b border-[#303030] bg-[#181818]">
                  <th className="px-4 py-4 text-left text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                    Product
                  </th>
                  <th className="px-4 py-4 text-left text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                    Category
                  </th>
                  <th className="px-4 py-4 text-left text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                    Price
                  </th>
                  <th className="px-4 py-4 text-left text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                    Stock
                  </th>
                  <th className="px-4 py-4 text-left text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                    Added
                  </th>
                  <th className="px-4 py-4 text-right text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product, index) => {
                    const stock = Math.max(Number(product.stock || 0), 0);
                    const image = getImage(product);

                    return (
                      <tr
                        key={product._id}
                        className="darsh-product-row border-b border-[#2b2b2b] transition-colors last:border-0 hover:bg-[#191919]"
                        style={{ animationDelay: `${index * 25}ms` }}
                      >
                        {/* Product */}
                        <td className="px-4 py-3.5">
                          <div className="flex min-w-[290px] items-center gap-3">
                            <button
                              onClick={() => {
                          handleViewProduct(product);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                              className="group relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-[#383838] bg-[#202020]"
                            >
                              {image ? (
                                <img
                                  src={image}
                                  alt={product.productName}
                                  className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                              ) : (
                                <Package className="mx-auto mt-3 h-5 w-5 text-zinc-600" />
                              )}

                              {product.hotSell && (
                                <span className="absolute right-0.5 top-0.5 rounded-full bg-[#f5ad0b] p-0.5 text-black shadow-lg">
                                  <Flame className="h-2.5 w-2.5" />
                                </span>
                              )}
                            </button>

                            <div className="min-w-0">
                              <button
                                onClick={() => {
                                  handleViewProduct(product);
                                  window.scrollTo({ top: 0, behavior: "smooth" });
                                }}
                                className="block max-w-[270px] truncate text-left text-sm font-semibold text-zinc-100 transition hover:text-[#f5ad0b]"
                              >
                                {product.productName || "Untitled product"}
                              </button>

                              <p className="mt-0.5 text-[11px] text-zinc-500">
                                {getSku(product)}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-4 py-3.5 text-sm text-zinc-400">
                          {product.category || "--"}
                        </td>

                        {/* Price */}
                        <td className="px-4 py-3.5">
                          <div className="text-sm font-semibold text-zinc-100">
                            ₹
                            {Number(product.price || 0).toLocaleString("en-IN")}
                          </div>

                          {product.originalPrice &&
                            Number(product.originalPrice) >
                              Number(product.price || 0) && (
                              <div className="mt-0.5 text-[11px] text-zinc-600 line-through">
                                ₹
                                {Number(product.originalPrice).toLocaleString(
                                  "en-IN",
                                )}
                              </div>
                            )}
                        </td>

                        {/* Stock */}
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                              stock > 0
                                ? "border-emerald-700/60 bg-emerald-500/10 text-emerald-400"
                                : "border-red-700/60 bg-red-500/10 text-red-400"
                            }`}
                          >
                            {stock > 0 ? `${stock} in stock` : "Out of stock"}
                          </span>
                        </td>

                        {/* Added */}
                        <td className="px-4 py-3.5 text-sm text-zinc-500">
                          {getAddedDate(product)}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                handleEditProduct(product);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-[#383838] bg-[#111] px-3 py-1.5 text-xs font-medium text-zinc-300 transition-all hover:border-zinc-500 hover:bg-[#222] hover:text-white"
                            >
                              <Edit className="h-3.5 w-3.5" />
                              Edit
                            </button>

                            <button
                              onClick={() => handleDeleteClick(product)}
                              className="rounded-lg p-2 text-zinc-600 transition hover:bg-red-500/10 hover:text-red-400"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-20 text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#303030] bg-[#1c1c1c]">
                        <Package className="h-6 w-6 text-zinc-600" />
                      </div>
                      <h3 className="mt-4 text-base font-semibold text-zinc-200">
                        No products found
                      </h3>
                      <p className="mx-auto mt-1 max-w-sm text-sm text-zinc-600">
                        Try changing your search or filter, or upload your
                        first product.
                      </p>
                      <button
                        onClick={handleAddProduct}
                        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#f5ad0b] px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-[#ffc13b]"
                      >
                        <Plus className="h-4 w-4" />
                        Upload product
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* Mobile cards */
          <div className="space-y-2.5">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product, index) => {
                const stock = Math.max(Number(product.stock || 0), 0);
                const image = getImage(product);

                return (
                  <div
                    key={product._id}
                    className="darsh-product-row overflow-hidden rounded-xl border border-[#2b2b2b] bg-[#151515] transition hover:border-[#3b3b3b]"
                    style={{ animationDelay: `${index * 25}ms` }}
                  >
                    <div className="flex gap-3 p-3">
                      <button
                        onClick={() => {
                          handleViewProduct(product);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="relative h-[78px] w-[66px] shrink-0 overflow-hidden rounded-lg border border-[#383838] bg-[#202020]"
                      >
                        {image ? (
                          <img
                            src={image}
                            alt={product.productName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Package className="mx-auto mt-7 h-5 w-5 text-zinc-600" />
                        )}

                        {product.hotSell && (
                          <span className="absolute right-1 top-1 rounded-full bg-[#f5ad0b] p-1 text-black">
                            <Flame className="h-2.5 w-2.5" />
                          </span>
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-semibold text-zinc-100">
                              {product.productName || "Untitled product"}
                            </h3>
                            <p className="mt-0.5 truncate text-[11px] text-zinc-600">
                              {getSku(product)}
                            </p>
                          </div>

                          <span
                            className={`shrink-0 rounded-full border px-2 py-1 text-[9px] font-medium ${
                              stock > 0
                                ? "border-emerald-700/60 bg-emerald-500/10 text-emerald-400"
                                : "border-red-700/60 bg-red-500/10 text-red-400"
                            }`}
                          >
                            {stock > 0 ? "In stock" : "Out"}
                          </span>
                        </div>

                        <div className="mt-3 flex items-end justify-between gap-2">
                          <div>
                            <p className="text-sm font-bold text-zinc-100">
                              ₹
                              {Number(product.price || 0).toLocaleString(
                                "en-IN"
                              )}
                            </p>
                            <p className="mt-0.5 text-[10px] text-zinc-600">
                              {product.category || "Uncategorized"} · Stock{" "}
                              {stock}
                            </p>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                             onClick={() => {
                          handleViewProduct(product);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                              className="rounded-lg p-2 text-zinc-500 transition hover:bg-[#242424] hover:text-white"
                            >
                              <Eye className="h-4 w-4" />
                            </button>

                            <button
                              onClick={() => {
                                handleEditProduct(product);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                              className="rounded-lg p-2 text-zinc-500 transition hover:bg-[#242424] hover:text-[#f5ad0b]"
                            >
                              <Edit className="h-4 w-4" />
                            </button>

                            <button
                              onClick={() => handleDeleteClick(product)}
                              className="rounded-lg p-2 text-zinc-500 transition hover:bg-red-500/10 hover:text-red-400"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-xl border border-[#2b2b2b] bg-[#151515] px-5 py-16 text-center">
                <Package className="mx-auto h-10 w-10 text-zinc-700" />
                <h3 className="mt-4 font-semibold text-zinc-200">
                  No products found
                </h3>
                <p className="mt-1 text-sm text-zinc-600">
                  Adjust the search or filters and try again.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Delete modal */}
        {showDeleteModal && selectedProduct && (
          <DeleteModal
            product={selectedProduct}
            onConfirm={handleConfirmDelete}
            onCancel={() => {
              setShowDeleteModal(false);
              setSelectedProduct(null);
            }}
          />
        )}

        {/* Notification */}
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}
      </div>
    );
  };

  return renderView();
};

export default Product;
