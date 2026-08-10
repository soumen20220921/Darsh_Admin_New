import { useState } from "react";
import { useAppContext } from "../../context/Context";
import axios from "axios";

const Notification = ({ message, type, onClose }) => {
  const bgColor =
    type === "success"
      ? "bg-green-100 border-green-400 text-green-700"
      : "bg-red-100 border-red-400 text-red-700";

  const iconColor = type === "success" ? "text-green-500" : "text-red-500";

  return (
    <div
      className={`fixed top-6 right-6 p-4 rounded-xl shadow-lg border-l-4 ${bgColor}
        animate-slide-in-right transition-opacity duration-500`}
    >
      <div className="flex items-center space-x-2">
        <div className={`mr-2 ${iconColor}`}>
          {type === "success" ? (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
        </div>

        <p className="font-semibold">{message}</p>

        <button
          onClick={onClose}
          className="ml-auto text-gray-500 hover:text-gray-800 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

const AddProduct = () => {
  const { setTab, getProduct, url } = useAppContext();

  const [formData, setFormData] = useState({
    productName: "",
    price: "",
    originalPrice: "",
    size: "",
    category: "",
    color: "",
    blouseAvaliable: "",
    stock: "",
    hotSell: false,
    description: "",
    specification: "",
    images: [null, null],
    imageUrls: [null, null],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Only categories
  const categories = [
    "Kanjivaram",
    "Banarasi",
   "Handloom Cotton",
   "Bandhani",
    "Bridal collection",
    "Kanthastitch",
    "Saraswati Pujo Special",
    "Pure Silk Replica",
    "Pure Silk",
    "Fancy Saree",
    "All saree",
  ];

  const colors = ["green", "blue", "red", "yellow", "black", "white", "pink"];
  const blouseAvaliable = ["yes", "no"];

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e, index) => {
    const file = e.target.files[0];

    if (file) {
      const newImageUrls = [...formData.imageUrls];
      const newImages = [...formData.images];

      newImages[index] = file;
      newImageUrls[index] = URL.createObjectURL(file);

      setFormData((prev) => ({
        ...prev,
        images: newImages,
        imageUrls: newImageUrls,
      }));
    }
  };

  const handleClearImage = (index) => {
    setFormData((prev) => {
      const newImages = [...prev.images];
      const newImageUrls = [...prev.imageUrls];

      newImages[index] = null;
      newImageUrls[index] = null;

      return {
        ...prev,
        images: newImages,
        imageUrls: newImageUrls,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    setNotification(null);

    const hotSellValue = formData.hotSell === "true" ? true : false;

    const sendData = new FormData();

    sendData.append("productName", formData.productName);
    sendData.append("price", formData.price);
    sendData.append("originalPrice", formData.originalPrice);
    sendData.append("size", formData.size);
    sendData.append("category", formData.category);
    sendData.append("color", formData.color);
    sendData.append("blouseAvaliable", formData.blouseAvaliable);
    sendData.append("stock", formData.stock);
    sendData.append("hotSell", hotSellValue);
    sendData.append("description", formData.description);
    sendData.append("specification", formData.specification);

    if (formData.images[0]) {
      sendData.append("image", formData.images[0]);
    }

    if (formData.images[1]) {
      sendData.append("image1", formData.images[1]);
    }

    try {
      const res = await axios.post(`${url}/api/product/addProduct`, sendData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setNotification({
        message: res.data.message || "Product created successfully!",
        type: "success",
      });

      getProduct();

      setTimeout(() => {
        setTab(2);
      }, 1500);
    } catch (err) {
      console.error(err.response?.data || err.message);

      setNotification({
        message:
          err.response?.data?.message ||
          "Error occurred while creating product",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4 animate-slide-in-down">
        <button
          onClick={() => setTab(2)}
          type="button"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 bg-gradient-to-r from-indigo-600 to-pink-500 text-transparent bg-clip-text">
            Add New Product
          </h1>

          <p className="text-gray-600 text-sm">
            Create and preview your product listing
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-all animate-fade-in">
          <form className="p-6 space-y-8" onSubmit={handleSubmit}>
            {/* Image Upload */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Product Images
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[0, 1].map((index) => (
                  <div key={index} className="flex flex-col items-center">
                    <label className="h-full border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-blue-500 transition-all duration-300 text-gray-500 hover:text-blue-600 min-h-[10rem] w-full cursor-pointer relative overflow-hidden group">
                      {!formData.imageUrls[index] ? (
                        <>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleImageChange(e, index)}
                          />

                          <svg
                            className="h-10 w-10 mb-2 opacity-60 group-hover:opacity-100 transition"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 4v16h16V4H4zm8 4v8m-4-4h8"
                            />
                          </svg>

                          <span className="text-sm">
                            Upload Image {index + 1}
                          </span>
                        </>
                      ) : (
                        <div className="relative w-full h-full">
                          <img
                            src={formData.imageUrls[index]}
                            alt={`Product ${index + 1}`}
                            className="object-cover w-full h-full rounded-lg transform hover:scale-105 transition duration-500"
                          />

                          <button
                            type="button"
                            onClick={() => handleClearImage(index)}
                            className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md text-gray-500 hover:text-red-500 transition"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <hr className="my-6 border-gray-200" />

            {/* Product Details */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Product Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    name="productName"
                    value={formData.productName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter product name"
                    required
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (₹) <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Original Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Original Price (₹)
                  </label>

                  <input
                    type="number"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Hot Sell */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hot Sell <span className="text-red-500">*</span>
                  </label>

                  <div className="flex items-center gap-6">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.hotSell === "true"}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            hotSell: e.target.checked ? "true" : "false",
                          }))
                        }
                        className="sr-only peer"
                      />

                      <div className="w-14 h-8 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-500 transition-all"></div>

                      <div className="absolute left-1 top-1 bg-white w-6 h-6 rounded-full peer-checked:translate-x-6 transition-transform"></div>
                    </label>

                    <span
                      className={`font-semibold ${
                        formData.hotSell === "true"
                          ? "text-red-600"
                          : "text-gray-500"
                      }`}
                    >
                      {formData.hotSell === "true"
                        ? "Hot Selling"
                        : "Not Hot Selling"}
                    </span>
                  </div>
                </div>

                {/* Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Size <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    name="size"
                    value={formData.size}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter size (e.g., S, M, L, XL)"
                  />
                </div>

                {/* Category ONLY */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>

                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Category</option>

                    {categories.map((cat, i) => (
                      <option key={i} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <hr className="my-6 border-gray-200" />
            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color <span className="text-red-500">*</span>
              </label>

              <select
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Color</option>

                {colors.map((color, index) => (
                  <option key={index} value={color}>
                    {color}
                  </option>
                ))}
              </select>
            </div>

            {/* Blouse Available */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Blouse Available <span className="text-red-500">*</span>
              </label>

              <select
                name="blouseAvaliable"
                value={formData.blouseAvaliable}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select</option>

                {blouseAvaliable.map((item, index) => (
                  <option key={index} value={item}>
                    {item === "yes" ? "Yes" : "No"}
                  </option>
                ))}
              </select>
            </div>
            {/* Description */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Description & Specs
              </h2>

              <div className="grid grid-cols-1 gap-6">
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Enter description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />

                <textarea
                  name="specification"
                  value={formData.specification}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Enter specification"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => setTab(1)}
                type="button"
                className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-md transition disabled:from-blue-300 disabled:to-indigo-400 disabled:cursor-not-allowed"
              >
                {isLoading ? "Creating..." : "Create Product"}
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 animate-slide-in-right">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Live Preview
          </h3>

          <div className="border rounded-xl overflow-hidden shadow-sm">
            <img
              src={
                formData.imageUrls[0] ||
                "https://via.placeholder.com/400x300?text=Product+Image"
              }
              alt="Preview"
              className="w-full h-48 object-cover"
            />

            <div className="p-4">
              <h4 className="font-semibold text-lg text-gray-900 truncate">
                {formData.productName || "Product Name"}
              </h4>

              <p className="text-gray-500 text-sm">
                {formData.description || "Short description"}
              </p>

              <div className="flex items-center justify-between mt-3">
                <p className="text-blue-600 font-bold">
                  ₹{formData.price || "0"}
                </p>

                {formData.originalPrice && (
                  <p className="text-sm line-through text-gray-400">
                    ₹{formData.originalPrice}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

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

export default AddProduct;
