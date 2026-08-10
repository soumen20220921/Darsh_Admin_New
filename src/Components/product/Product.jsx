import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Package,
  Flame,
  CheckCircle,
  XCircle,
  Download,
  RefreshCw,
  Zap,
  Sparkles,
  Grid,
  List,
  ChevronDown,
  ArrowUpDown
} from "lucide-react";
import { useAppContext } from "../../context/Context";
import ViewProduct from "./ViewProduct";
import EditProduct from "./EditProduct";
import DeleteModal from "./DeleteModal";
import axios from "axios";

const Notification = ({ message, type, onClose }) => {
  const isSuccess = type === "success";
  const icon = isSuccess ? (
    <CheckCircle className="h-16 w-16 text-green-400" />
  ) : (
    <XCircle className="h-16 w-16 text-red-400" />
  );
  const title = isSuccess ? "Mission Complete!" : "Something Went Wrong!";
  const buttonBg = isSuccess ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700";

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="relative overflow-hidden w-full max-w-md p-8 bg-white rounded-3xl shadow-2xl transform transition-transform duration-300 ease-out animate-scale-in-vibrant">
        <div className="absolute inset-0 opacity-20">
          <div className={`w-3/4 h-3/4 absolute -top-1/4 -right-1/4 rounded-full ${isSuccess ? 'bg-green-200' : 'bg-red-200'} blur-2xl animate-spin-slow`}></div>
          <div className={`w-2/3 h-2/3 absolute -bottom-1/4 -left-1/4 rounded-full ${isSuccess ? 'bg-blue-200' : 'bg-yellow-200'} blur-2xl animate-pulse`}></div>
        </div>

        {/* Content */}
        <div className="relative text-center space-y-6">
          <div className="mx-auto flex justify-center">{icon}</div>
          <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {title}
          </h3>
          <p className="text-gray-600 text-lg leading-relaxed">{message}</p>
          <button
            onClick={onClose}
            className={`w-full py-3 text-lg font-bold rounded-xl text-white ${buttonBg} transition-all duration-300 transform active:scale-95 shadow-lg hover:shadow-xl`}
          >
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
};

const Product = () => {
  const { setTab, allProduct, getProduct, url } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentView, setCurrentView] = useState("list");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [notification, setNotification] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshPulse, setRefreshPulse] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [mobileView, setMobileView] = useState(false);
  const [sortBy, setSortBy] = useState("name");
  const [showSortOptions, setShowSortOptions] = useState(false);

  useEffect(() => {
    const pulseInterval = setInterval(() => {
      setRefreshPulse(true);
      setTimeout(() => setRefreshPulse(false), 1000);
    }, 30000);

    return () => clearInterval(pulseInterval);
  }, []);

  useEffect(() => {
    const checkScreenSize = () => {
      const isMobile = window.innerWidth < 768;
      setMobileView(isMobile);
      if (isMobile) {
        setViewMode("list");
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleAddProduct = useCallback(() => {
    setTab(4);
  }, [setTab]);

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setCurrentView("view");
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setCurrentView("edit");
  };

  const handleDeleteClick = (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
  };

  const handleConfirmDelete = () => {
    if (selectedProduct) {
      deleteProduct(selectedProduct._id, selectedProduct.productName);
      setShowDeleteModal(false);
      setSelectedProduct(null);
    }
  };

  const handleSaveEdit = () => {
    setCurrentView("list");
    setSelectedProduct(null);
    showNotification("Product updated successfully! 🎉", "success");
  };

  const handleCancel = () => {
    setCurrentView("list");
    setSelectedProduct(null);
  };

  const deleteProduct = async (productId, productName) => {
    try {
      await axios.delete(`${url}/api/product/${productId}`);
      getProduct(); 
      showNotification(`Product '${productName}' deleted successfully! 🎉`, "success");
    } catch (error) {
      console.error("Error deleting product:", error.message);
      showNotification("Failed to delete product. Please try again.", "error");
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    try {
      await getProduct();
      setTimeout(() => setRefreshing(false), 1000);
    } catch (error) {
      setRefreshing(false);
      showNotification("Failed to refresh data", "error");
    }
  };

  const exportProducts = async () => {
    setExporting(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      const data = filteredProducts.map(product => ({
        'Product Name': product.productName,
        'Description': product.description,
        'Price': `${product.price}`,
        'Original Price': product.originalPrice ? `${product.originalPrice}` : 'N/A',
        'Stock': Math.max(product.stock, 0),
        'Status': Math.max(product.stock, 0) > 0 ? 'Active' : 'Inactive',
        'Hot Sell': product.hotSell ? 'Yes ' : 'No',
        'On Sale': product.originalPrice && product.price < product.originalPrice ? 'Yes' : 'No',
        'Category': product.category || 'N/A'
      }));

      const csv = Object.keys(data[0]).join(',') + '\n' +
        data.map(row => Object.values(row).map(field => `"${field}"`).join(',')).join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `products-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      setTimeout(() => setExporting(false), 500);
      showNotification("Products exported successfully! 📊", "success");
    } catch (error) {
      setExporting(false);
      showNotification("Failed to export products", "error");
    }
  };

  const productStats = useMemo(() => {
    return {
      total: allProduct.length,
      active: allProduct.filter((p) => p.stock > 0).length,
      inactive: allProduct.filter((p) => p.stock <= 0).length,
      hotSell: allProduct.filter((p) => p.hotSell).length,
      onSale: allProduct.filter(
        (p) => p.originalPrice && p.price < p.originalPrice
      ).length,
    };
  }, [allProduct]);

  const filteredProducts = useMemo(() => {
    let temp = allProduct;

    if (searchTerm) {
      temp = temp.filter(
        (p) =>
          p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterStatus === "active") {
      temp = temp.filter((p) => p.stock > 0);
    } else if (filterStatus === "inactive") {
      temp = temp.filter((p) => p.stock <= 0);
    } else if (filterStatus === "hotSell") {
      temp = temp.filter((p) => p.hotSell);
    }
  
    if (onSaleOnly)
      temp = temp.filter(
        (p) => p.originalPrice && p.price < p.originalPrice
      );

    // Sort products
    temp.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.productName.localeCompare(b.productName);
        case "price-high":
          return b.price - a.price;
        case "price-low":
          return a.price - b.price;
        case "stock":
          return b.stock - a.stock;
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });

    return temp;
  }, [allProduct, searchTerm, filterStatus, onSaleOnly, sortBy]);

  const MobileProductCard = ({ product }) => (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl active:scale-[0.98]">
      <div className="flex">
        <div className="relative w-24 h-24 bg-gray-100 overflow-hidden flex-shrink-0">
          {product.images && product.images.length > 0 ? (
            <img
              src={`${url}/img/${product.images[0]}`}
              alt={product.productName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-8 w-8 text-gray-300" />
            </div>
          )}
          {product.hotSell && (
            <span className="absolute top-1 right-1 flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-bold bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full">
              <Flame className="h-2 w-2" /> HOT
            </span>
          )}
        </div>

        <div className="flex-1 p-3 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <h3 className="font-bold text-gray-900 text-sm leading-tight truncate flex-1 mr-2">
              {product.productName}
            </h3>
            <span
              className={`px-2 py-1 text-[10px] font-semibold rounded-full whitespace-nowrap ${
                Math.max(product.stock, 0) > 0
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {Math.max(product.stock, 0) > 0 ? "In Stock" : "Out of Stock"}
            </span>
          </div>

          <p className="text-xs text-gray-600 line-clamp-2 mb-2 leading-relaxed">
            {product.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-baseline space-x-1">
              <span className="text-base font-bold text-gray-900">
                ₹{product.price}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-gray-400 line-through">
                  ₹{product.originalPrice}
                </span>
              )}
            </div>
            
            <span className="text-xs text-gray-500 font-medium">
              Stock: {Math.max(product.stock, 0)}
            </span>
          </div>

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handleViewProduct(product)}
                className="p-1.5 text-blue-600 bg-blue-50 rounded-lg transition-all active:scale-95"
                title="View"
              >
                <Eye className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => handleEditProduct(product)}
                className="p-1.5 text-green-600 bg-green-50 rounded-lg transition-all active:scale-95"
                title="Edit"
              >
                <Edit className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => handleDeleteClick(product)}
                className="p-1.5 text-red-600 bg-red-50 rounded-lg transition-all active:scale-95"
                title="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            
            {product.hotSell && (
              <div className="flex items-center space-x-1 bg-orange-50 px-2 py-1 rounded-lg">
                <Flame className="h-3 w-3 text-orange-500" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const DesktopProductCard = ({ product }) => (
    <div
      key={product._id}
      className="bg-white rounded-2xl shadow hover:shadow-2xl border border-gray-100 overflow-hidden transition-all transform hover:-translate-y-1 duration-300 group"
    >
      {/* Image */}
      <div className="relative w-full h-48 bg-gray-100 overflow-hidden group-hover:shadow-inner">
        {product.images && product.images.length > 0 ? (
          <img
            src={`${url}/img/${product.images[0]}`}
            alt={product.productName}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-16 w-16 text-gray-300 group-hover:scale-110 transition-transform duration-300" />
          </div>
        )}
        {product.hotSell && (
          <span className="absolute top-2 right-2 flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full shadow-md animate-pulse">
            <Flame className="h-3 w-3" /> Hot
          </span>
        )}
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300" />
      </div>

      <div className="p-5 space-y-3">
        <h3 className="font-semibold text-gray-900 truncate text-lg group-hover:text-blue-600 transition-colors">
          {product.productName}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        <div className="flex flex-wrap items-center justify-between mt-2">
          <div className="flex items-baseline space-x-2">
            <span className="text-xl font-bold text-gray-900">
              ₹{product.price}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-400 line-through">
                ₹{product.originalPrice}
              </span>
            )}
          </div>
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full animate-pulse ${
              Math.max(product.stock, 0) > 0
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {Math.max(product.stock, 0) > 0 ? "Active" : "Inactive"}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <span className="text-sm text-gray-500">
            Stock:{" "}
            <span className="font-medium">
              {Math.max(product.stock, 0)}
            </span>
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleViewProduct(product)}
              className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-all transform hover:scale-110"
              title="View"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleEditProduct(product)}
              className="p-2 text-gray-400 hover:text-green-600 rounded-full hover:bg-green-50 transition-all transform hover:scale-110"
              title="Edit"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDeleteClick(product)}
              className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-all transform hover:scale-110"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderView = () => {
    if (currentView === "view" && selectedProduct) {
      return <ViewProduct product={selectedProduct} onBack={handleCancel} />;
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
      <div className="space-y-6 relative">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[
            {
              label: "Total",
              value: productStats.total,
              color: "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800",
              icon: (
                <Package className="h-5 w-5 md:h-6 md:w-6 text-gray-500 group-hover:scale-125 transition-transform duration-300" />
              ),
              filter: "all",
            },
            {
              label: "Active",
              value: productStats.active,
              color:
                "bg-gradient-to-r from-green-100 to-green-200 text-green-800",
              icon: (
                <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-green-500 animate-bounce" />
              ),
              filter: "active",
            },
            {
              label: "Inactive",
              value: productStats.inactive,
              color: "bg-gradient-to-r from-red-100 to-red-200 text-red-800",
              icon: <XCircle className="h-5 w-5 md:h-6 md:w-6 text-red-500 animate-pulse" />,
              filter: "inactive",
            },
            {
              label: "Hot Sell",
              value: productStats.hotSell,
              color:
                "bg-gradient-to-r from-orange-100 to-yellow-200 text-orange-800",
              icon: <Flame className="h-5 w-5 md:h-6 md:w-6 text-orange-500 animate-pulse" />,
              filter: "hotSell",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              onClick={() => {
                if (stat.filter === "onSale") {
                  setOnSaleOnly(true);
                  setFilterStatus("all");
                } else {
                  setFilterStatus(stat.filter);
                  setOnSaleOnly(false);
                }
              }}
              className={`group cursor-pointer p-3 md:p-5 rounded-2xl shadow-md ${stat.color} text-center transform hover:-translate-y-1 hover:shadow-xl transition-all active:scale-95`}
            >
              <div className="flex items-center justify-center mb-1 md:mb-2">
                {stat.icon}
              </div>
              <p className="text-xs md:text-sm font-medium">{stat.label}</p>
              <p className="text-lg md:text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex-1">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 bg-gradient-to-r from-indigo-600 to-pink-500 text-transparent bg-clip-text">
              Product Catalog
            </h1>
            <p className="text-gray-600 text-sm md:text-base">Manage your product inventory ({allProduct.length} total)</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <button
              onClick={exportProducts}
              disabled={exporting || filteredProducts.length === 0}
              className={`
                relative flex items-center justify-center gap-2 md:gap-3 px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl font-semibold text-sm md:text-base
                transition-all duration-500 ease-out transform hover:scale-105 hover:shadow-2xl
                ${exporting 
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg' 
                  : filteredProducts.length === 0
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
            </button>

            {/* Add Product Button */}
            <button
              onClick={handleAddProduct}
              className="inline-flex items-center justify-center gap-2 px-4 md:px-6 py-3 md:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 font-semibold text-sm md:text-base group"
            >
              <Plus className="h-4 w-4 md:h-5 md:w-5 transition-transform group-hover:rotate-90" />
              <span>Add Product</span>
            </button>

            {!mobileView && (
              <div className="flex bg-white border border-gray-300 rounded-2xl p-1 shadow-inner">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 md:p-3 rounded-lg md:rounded-xl transition-all duration-300 ${
                    viewMode === "grid"
                      ? "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 shadow-sm"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Grid className="w-3 h-3 md:w-4 md:h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 md:p-3 rounded-lg md:rounded-xl transition-all duration-300 ${
                    viewMode === "list"
                      ? "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 shadow-sm"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <List className="w-3 h-3 md:w-4 md:h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Results Count and Sort */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <p className="text-sm text-gray-600">
            Showing {filteredProducts.length} of {allProduct.length} products
            {mobileView && (
              <span className="block text-xs text-blue-600 font-medium mt-1">
                Mobile-optimized list view
              </span>
            )}
          </p>
          
          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSortOptions(!showSortOptions)}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <ArrowUpDown className="h-4 w-4" />
              Sort: {sortBy === 'name' ? 'Name' : sortBy === 'price-high' ? 'Price High' : sortBy === 'price-low' ? 'Price Low' : sortBy === 'stock' ? 'Stock' : 'Newest'}
              <ChevronDown className={`h-4 w-4 transition-transform ${showSortOptions ? 'rotate-180' : ''}`} />
            </button>
            
            {showSortOptions && (
              <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {[
                  { value: 'name', label: 'Name A-Z' },
                  { value: 'price-high', label: 'Price: High to Low' },
                  { value: 'price-low', label: 'Price: Low to High' },
                  { value: 'stock', label: 'Stock Level' },
                  { value: 'newest', label: 'Newest First' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortBy(option.value);
                      setShowSortOptions(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                      sortBy === option.value ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Search Box */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Desktop Filter Tabs */}
            <div className="hidden md:flex items-center gap-2 bg-gray-50 rounded-lg p-1 border">
              {[
                { value: "all", label: "All" },
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
                { value: "hotSell", label: "Hot Sell 🔥" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilterStatus(opt.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filterStatus === opt.value
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="md:hidden flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors w-full"
              >
                <option value="all">All Products</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
                <option value="hotSell">Hot Sell 🔥</option>
              </select>
            </div>
          </div>
        </div>

        {filteredProducts && filteredProducts.length > 0 ? (
          <div className={`
            ${mobileView 
              ? "space-y-3" 
              : viewMode === "grid" 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"  
                : "space-y-4"  
            }
          `}>
            {filteredProducts.map((product) => 
              mobileView ? (
                <MobileProductCard key={product._id} product={product} />
              ) : viewMode === "grid" ? (
                <DesktopProductCard key={product._id} product={product} />
              ) : (
                // Desktop List View
                <div
                  key={product._id}
                  className="bg-white rounded-2xl shadow hover:shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 group"
                >
                  <div className="flex">
                    <div className="relative w-32 h-32 bg-gray-100 overflow-hidden group-hover:shadow-inner flex-shrink-0">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={`${url}/img/${product.images[0]}`}
                          alt={product.productName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-8 w-8 text-gray-300" />
                        </div>
                      )}
                      {product.hotSell && (
                        <span className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full">
                          <Flame className="h-2 w-2" /> Hot
                        </span>
                      )}
                    </div>

                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 mr-4">
                          <h3 className="font-semibold text-gray-900 text-lg mb-1 group-hover:text-blue-600 transition-colors">
                            {product.productName}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {product.description}
                          </p>
                        </div>
                        <div className="flex items-baseline space-x-2">
                          <span className="text-xl font-bold text-gray-900">
                            ₹{product.price}
                          </span>
                          {product.originalPrice && (
                            <span className="text-sm text-gray-400 line-through">
                              ₹{product.originalPrice}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              Math.max(product.stock, 0) > 0
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {Math.max(product.stock, 0) > 0 ? "Active" : "Inactive"}
                          </span>
                          <span className="text-sm text-gray-500">
                            Stock: <span className="font-medium">{Math.max(product.stock, 0)}</span>
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewProduct(product)}
                            className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-all"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="p-2 text-gray-400 hover:text-green-600 rounded-full hover:bg-green-50 transition-all"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(product)}
                            className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-all"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200 mt-6">
            <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="mt-2 text-xl font-medium text-gray-900">
              No products found
            </h3>
            <p className="mt-1 text-gray-500 max-w-sm mx-auto">
              {searchTerm || filterStatus !== "all" 
                ? "No products match your current filters. Try adjusting your search criteria."
                : "You haven't added any products yet. Get started by adding your first product!"}
            </p>
            <button
              onClick={handleAddProduct}
              className="mt-6 inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-md hover:scale-105 transition-all"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Product
            </button>
          </div>
        )}

        {showDeleteModal && (
          <DeleteModal
            product={selectedProduct}
            onConfirm={handleConfirmDelete}
            onCancel={() => setShowDeleteModal(false)}
          />
        )}
      </div>
    );
  };

  return (
    <>
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      {renderView()}
    </>
  );
};

export default Product;