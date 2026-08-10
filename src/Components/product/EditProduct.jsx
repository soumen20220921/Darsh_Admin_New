import { X, CheckCircle, Info, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAppContext } from "../../context/Context";
import { Loader2 } from "lucide-react";
import { ArrowLeft } from "lucide-react";

const Notification = ({ message, type, onClose }) => {
  let bgColor, icon, title;

  switch (type) {
    case "success":
      bgColor = "bg-green-500";
      icon = <CheckCircle className="w-6 h-6 text-white" />;
      title = "Success!";
      break;
    case "error":
      bgColor = "bg-red-500";
      icon = <AlertCircle className="w-6 h-6 text-white" />;
      title = "Error!";
      break;
    case "info":
      bgColor = "bg-blue-500";
      icon = <Info className="w-6 h-6 text-white" />;
      title = "Information";
      break;
    default:
      bgColor = "bg-gray-500";
      icon = <Info className="w-6 h-6 text-white" />;
      title = "Notification";
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-6 right-6 p-4 rounded-xl shadow-2xl transition-all duration-500 animate-slide-in-right z-[100] transform ${bgColor}`}
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">{icon}</div>
        <div className="flex-1">
          <p className="font-bold text-white text-base leading-snug">{title}</p>
          <p className="text-white text-sm mt-1">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="ml-auto text-white/80 hover:text-white transition-colors self-start p-1 -m-1"
          aria-label="Close notification"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

const EditProduct = ({ product, onSave, onCancel }) => {
  const { getProduct,url  } = useAppContext();
  const [formData, setFormData] = useState({
    productName: product.productName,
    price: product.price,
    originalPrice: product.originalPrice || "",
    category: product.category,
    subCategory: product.subCategory,
    stock: product.stock,
    hotSell: product.hotSell,
    description: product.description,
    specification: product.specification,
    images: [null, null],
    imageUrl: product.images.map((img) => `${url}/img/${img}`),
  });
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const categorySubcategoryMap = {
     saree: [
    "all saree",
    "pure silk",
    "cotton saree",
    "banarasi",
    "handloom",
    "latest saree",
  ],
  blouse: [
    "all blouse",
    "designer blouse",
    "cotton blouse",
    "embroidered blouse",
    "silk blouse",
  ],
  men: [
    "all men",
    "kurta",
    "panjabi",
    "tshirt",
    "formal shirt",
    "casual shirt",
    "jeans",
  ],
  kids: [
    "all kids",
    "frocks",
    "tshirts",
    "shorts",
    "ethnic wear",
    "party wear",
  ],
  jewellery: [
    "all jewellery",
    "handmade",
    "gold plated",
    "silver",
    "artificial",
    "latest",
  ],
  acceceries: [
    "all accessories",
    "bags",
    "wallets",
    "belts",
    "sunglasses",
    "watches",
    "scarves",
  ],
  "home decor": [
    "all home decor",
    "name plates",
    "wall art",
    "lamps",
    "vases",
    "handicrafts",
    "cushions",
  ],
  footwear: [
    "all footwear",
    "sandals",
    "heels",
    "sneakers",
    "formal shoes",
    "flip flops",
  ],
  beauty: [
    "all beauty",
    "makeup",
    "skincare",
    "haircare",
    "fragrances",
    "ayurvedic",
  ],
  electronics: [
    "all electronics",
    "mobiles",
    "laptops",
    "headphones",
    "watches",
    "gadgets",
  ],
  };

  const categories = Object.keys(categorySubcategoryMap);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "category") {
      setFormData((prev) => ({
        ...prev,
        category: value,
        subCategory: "", 
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
  };

  const handleCancel = () => {
    showNotification("info", "Product edit canceled.");
    setTimeout(() => {
      onCancel();
    }, 1200); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const updatedData = {
      productName: formData.productName,
      price: formData.price,
      originalPrice: formData.originalPrice,
      category: formData.category,
      subCategory: formData.subCategory,
      stock: formData.stock,
      hotSell: formData.hotSell, 
      description: formData.description,
      specification: formData.specification,
    };

    try {
      await axios.put(
        `${url}/api/product/${product._id}`,
        updatedData,
        { headers: { "Content-Type": "application/json" } }
      );

      showNotification("success", "Product updated successfully! 🎉");
      setTimeout(() => {
        onSave();
        getProduct();
      }, 1500);
    } catch (err) {
      console.error(err.response?.data || err.message);
      showNotification(
        "error",
        err.response?.data?.message || "Error occurred while updating product 😔"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onCancel}
          className="p-2 rounded-full hover:bg-gray-100 transition-all shadow-sm"
          title="Go back"
        >
          <ArrowLeft className="h-6 w-6 text-gray-600" />
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 lg:p-8 space-y-10 transition-transform hover:scale-[1.01]"
      >
        <hr className="border-gray-200" />

        {/* Product Details */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Product Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="productName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="productName"
                name="productName"
                value={formData.productName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter product name"
                required
              />
            </div>
            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Price <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter price"
                required
              />
            </div>
            <div>
              <label
                htmlFor="originalPrice"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Original Price
              </label>
              <input
                type="number"
                id="originalPrice"
                name="originalPrice"
                value={formData.originalPrice}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter original price (if on discount)"
              />
            </div>

            {/* Category and Subcategory */}
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="subCategory"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Sub Category <span className="text-red-500">*</span>
              </label>
              <select
                id="subCategory"
                name="subCategory"
                value={formData.subCategory}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={!formData.category}
              >
                <option value="">Select a sub-category</option>
                {formData.category &&
                  categorySubcategoryMap[formData.category] &&
                  categorySubcategoryMap[formData.category].map((subCat) => (
                    <option key={subCat} value={subCat}>
                      {subCat.charAt(0).toUpperCase() + subCat.slice(1)}
                    </option>
                  ))}
              </select>
            </div>

            {/* Stock and Hot Sell */}
            <div>
              <label
                htmlFor="stock"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Stock <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="stock"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter stock quantity"
                required
              />
            </div>
            <div>
              <label
                htmlFor="hotSell"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Hot Sell
              </label>
              <select
                id="hotSell"
                name="hotSell"
                value={formData.hotSell ? "true" : "false"}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    hotSell: e.target.value === "true",
                  }))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
            </div>
            {/* Description and Specification */}
            <div className="md:col-span-2">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Write a detailed description of the product"
                rows="4"
                required
              ></textarea>
            </div>
            <div className="md:col-span-2">
              <label
                htmlFor="specification"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Specification
              </label>
              <textarea
                id="specification"
                name="specification"
                value={formData.specification}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter product specifications (e.g., materials, dimensions)"
                rows="4"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-3 rounded-xl text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className={`px-6 py-3 rounded-xl text-white font-semibold flex items-center justify-center transition-colors ${
              isLoading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isLoading && <Loader2 className="animate-spin h-5 w-5 mr-2" />}
            Save Changes
          </button>
        </div>
      </form>

      {/* Render the new notification component */}
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

export default EditProduct;