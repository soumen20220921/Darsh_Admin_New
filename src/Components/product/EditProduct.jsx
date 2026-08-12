import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  FileText,
  Flame,
  ImagePlus,
  Info,
  IndianRupee,
  Loader2,
  Package,
  RefreshCcw,
  Save,
  X,
} from "lucide-react";

import { useAppContext } from "../../context/Context";

/* =========================================================
   NOTIFICATION
========================================================= */

const Notification = ({ message, type, onClose }) => {
  const isSuccess = type === "success";

  return (
    <div
      className={`ep-notification ${
        isSuccess
          ? "ep-notification-success"
          : "ep-notification-error"
      }`}
    >
      <div className="ep-notification-icon">
        {isSuccess ? (
          <CheckCircle2 size={20} />
        ) : (
          <AlertCircle size={20} />
        )}
      </div>

      <div className="ep-notification-content">
        <strong>
          {isSuccess ? "Success" : "Something went wrong"}
        </strong>

        <span>{message}</span>
      </div>

      <button
        type="button"
        className="ep-notification-close"
        onClick={onClose}
        aria-label="Close notification"
      >
        <X size={17} />
      </button>
    </div>
  );
};

/* =========================================================
   SECTION HEADER
========================================================= */

const SectionHeader = ({
  icon,
  title,
  description,
  badge,
}) => {
  return (
    <div className="ep-section-header">
      <div className="ep-section-icon">{icon}</div>

      <div className="ep-section-heading">
        <div className="ep-section-title-row">
          <h2>{title}</h2>

          {badge && (
            <span className="ep-section-badge">
              {badge}
            </span>
          )}
        </div>

        {description && (
          <p>{description}</p>
        )}
      </div>
    </div>
  );
};

/* =========================================================
   SELECT FIELD
========================================================= */

const SelectField = ({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder,
  required = false,
  disabled = false,
  className = "",
}) => {
  return (
    <div className={`ep-field ${className}`}>
      <label htmlFor={name}>
        {label}

        {required && (
          <span className="ep-required">*</span>
        )}
      </label>

      <div className="ep-select-wrap">
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
        >
          <option value="">
            {placeholder || `Select ${label}`}
          </option>

          {options.map((item) => (
            <option
              key={item}
              value={item}
            >
              {item}
            </option>
          ))}
        </select>

        <ChevronDown
          className="ep-select-arrow"
          size={15}
        />
      </div>
    </div>
  );
};

/* =========================================================
   EDIT PRODUCT
========================================================= */

const EditProduct = ({
  product,
  onSave,
  onCancel,
}) => {
  const {
    getProduct,
    url,
  } = useAppContext();

  /* =======================================================
     CATEGORIES
  ======================================================= */

  const categories = [
    "Pujo Special",
    "Banarasi",
    "Kanthastitch",
    "Kanjivaram",
    "Pure Silk",
    "Cotton Handloom",
    "Bandhani",
    "Festive Edit",
    "Bridal collection",
    "Pure Silk Replica",
    "Fancy Saree",
    "Handloom Saree",
    "Other Saree",
  ];

  const colors = [
     "red",
    "white",
    "yellow",
    "blue",
    "black",
    "green",
    "pink",
    "orange",
    "purple",
    "brown",
    "grey",
    "maroon",
    "beige",
  ];

 const blouseOptions = ["yes", "no"];

/* =======================================================
   BLOUSE VALUE NORMALIZER

   Backend field:
   blouseAvaliable

   Always convert API values to:
   "yes" | "no" | ""
   ======================================================= */
const normalizeBlouseValue = (value) => {
  if (value === true) return "yes";
  if (value === false) return "no";

  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();

  if (
    normalized === "yes" ||
    normalized === "true" ||
    normalized === "available" ||
    normalized === "1"
  ) {
    return "yes";
  }

  if (
    normalized === "no" ||
    normalized === "false" ||
    normalized === "not available" ||
    normalized === "unavailable" ||
    normalized === "0"
  ) {
    return "no";
  }

  return "";
};

  /* =======================================================
     HELPER
  ======================================================= */

  const getInitialImageUrl = (index) => {
    if (!product?.images?.[index]) {
      return null;
    }

    const image = product.images[index];

    if (
      typeof image === "string" &&
      (image.startsWith("http://") ||
        image.startsWith("https://"))
    ) {
      return image;
    }

    return `${url}/img/${image}`;
  };

  /* =======================================================
     FORM DATA
  ======================================================= */

  const [formData, setFormData] = useState({
    productName: product?.productName || "",
    price: product?.price ?? "",
    originalPrice: product?.originalPrice ?? "",
    size: product?.size || "",
    category: product?.category || "",
    color: product?.color || "",
    blouseAvaliable: normalizeBlouseValue(
  product?.blouseAvaliable ??
    product?.blouseAvailable
),
    stock: product?.stock ?? "",
    hotSell:
      product?.hotSell === true ||
      product?.hotSell === "true",
    description: product?.description || "",
    specification:
      product?.specification || "",

    images: [
      null,
      null,
    ],

    imageUrls: [
      getInitialImageUrl(0),
      getInitialImageUrl(1),
    ],
  });

  const [isLoading, setIsLoading] =
    useState(false);

  const [notification, setNotification] =
    useState(null);

  const [isChanged, setIsChanged] =
    useState(false);

  /* =======================================================
     CLEANUP OBJECT URL
  ======================================================= */

  useEffect(() => {
    return () => {
      formData.imageUrls.forEach((imageUrl) => {
        if (
          imageUrl &&
          imageUrl.startsWith("blob:")
        ) {
          URL.revokeObjectURL(imageUrl);
        }
      });
    };
  }, []);

  /* =======================================================
     PRICE CALCULATION
  ======================================================= */

  const pricing = useMemo(() => {
    const price =
      Number(formData.price) || 0;

    const originalPrice =
      Number(formData.originalPrice) || 0;

    let discount = 0;

    if (
      originalPrice > 0 &&
      price < originalPrice
    ) {
      discount = Math.round(
        ((originalPrice - price) /
          originalPrice) *
          100
      );
    }

    const difference =
      originalPrice > price
        ? originalPrice - price
        : 0;

    return {
      price,
      originalPrice,
      discount,
      difference,
    };
  }, [
    formData.price,
    formData.originalPrice,
  ]);

  /* =======================================================
     INPUT CHANGE
  ======================================================= */

  const handleInputChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setIsChanged(true);
  };

  /* =======================================================
     HOT SELL
  ======================================================= */

  const handleHotSellChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      hotSell:
        e.target.checked,
    }));

    setIsChanged(true);
  };

 
  /* =======================================================
     NOTIFICATION
  ======================================================= */

  const showNotification = (
    type,
    message
  ) => {
    setNotification({
      type,
      message,
    });
  };

  /* =======================================================
     RESET FORM
  ======================================================= */

  const handleReset = () => {
    formData.imageUrls.forEach(
      (imageUrl) => {
        if (
          imageUrl?.startsWith(
            "blob:"
          )
        ) {
          URL.revokeObjectURL(
            imageUrl
          );
        }
      }
    );

    setFormData({
      productName:
        product?.productName || "",
      price:
        product?.price ?? "",
      originalPrice:
        product?.originalPrice ?? "",
      size:
        product?.size || "",
      category:
        product?.category || "",
      color:
        product?.color || "",
      blouseAvaliable:
        product?.blouseAvaliable ||
        "",
      stock:
        product?.stock ?? "",
      hotSell:
        product?.hotSell === true ||
        product?.hotSell === "true",
      description:
        product?.description || "",
      specification:
        product?.specification || "",
      images: [
        null,
        null,
      ],
      imageUrls: [
        getInitialImageUrl(0),
        getInitialImageUrl(1),
      ],
    });

    setIsChanged(false);

    showNotification(
      "success",
      "All changes have been reset."
    );
  };

  /* =======================================================
     SUBMIT
  ======================================================= */

  const handleSubmit = async (
    e
  ) => {
    e.preventDefault();

    if (!product?._id) {
      showNotification(
        "error",
        "Product ID is missing."
      );

      return;
    }

    if (
      !formData.productName.trim()
    ) {
      showNotification(
        "error",
        "Please enter product name."
      );

      return;
    }

    if (!formData.category) {
      showNotification(
        "error",
        "Please select a category."
      );

      return;
    }

    if (!formData.color) {
      showNotification(
        "error",
        "Please select a colour."
      );

      return;
    }

    if (
      formData.stock === "" ||
      Number(formData.stock) < 0
    ) {
      showNotification(
        "error",
        "Please enter a valid stock quantity."
      );

      return;
    }

    if (
      formData.price === "" ||
      Number(formData.price) < 0
    ) {
      showNotification(
        "error",
        "Please enter a valid selling price."
      );

      return;
    }

    setIsLoading(true);
    setNotification(null);

    try {
      /*
       * =====================================================
       * IMAGE CHANGED
       *
       * Use FormData exactly like AddProduct.
       * AddProduct sends:
       * image
       * image1
       * =====================================================
       */

      const hasNewImage =
        formData.images.some(
          (image) => image !== null
        );

      if (hasNewImage) {
        const sendData =
          new FormData();

        sendData.append(
          "productName",
          formData.productName
        );

        sendData.append(
          "price",
          formData.price
        );

        sendData.append(
          "originalPrice",
          formData.originalPrice
        );

        sendData.append(
          "size",
          formData.size
        );

        sendData.append(
          "category",
          formData.category
        );

        sendData.append(
          "color",
          formData.color
        );

        sendData.append(
          "blouseAvaliable",
          formData.blouseAvaliable
        );

        sendData.append(
          "stock",
          formData.stock
        );

        sendData.append(
          "hotSell",
          formData.hotSell
        );

        sendData.append(
          "description",
          formData.description
        );

        sendData.append(
          "specification",
          formData.specification
        );

        /*
         * Same field names as AddProduct
         */
        if (formData.images[0]) {
          sendData.append(
            "image",
            formData.images[0]
          );
        }

        if (formData.images[1]) {
          sendData.append(
            "image1",
            formData.images[1]
          );
        }

        await axios.put(
          `${url}/api/product/${product._id}`,
          sendData
        );
      } else {
        /*
         * =================================================
         * NO NEW IMAGE
         *
         * Normal JSON request.
         * =================================================
         */

        const updatedData = {
          productName:
            formData.productName,

          price:
            formData.price,

          originalPrice:
            formData.originalPrice,

          size:
            formData.size,

          category:
            formData.category,

          color:
            formData.color,

          blouseAvaliable:
            formData.blouseAvaliable,

          stock:
            formData.stock,

          hotSell:
            Boolean(formData.hotSell),

          description:
            formData.description,

          specification:
            formData.specification,
        };

        await axios.put(
          `${url}/api/product/${product._id}`,
          updatedData,
          {
            headers: {
              "Content-Type":
                "application/json",
            },
          }
        );
      }

      setIsChanged(false);

      showNotification(
        "success",
        "Product updated successfully! 🎉"
      );

      /*
       * Refresh product list
       */
      await getProduct();

      setTimeout(() => {
        onSave();
      }, 1200);
    } catch (err) {
      console.error(
        "UPDATE PRODUCT ERROR:",
        err.response?.data ||
          err.message
      );

      showNotification(
        "error",
        err.response?.data?.message ||
          "Unable to update product."
      );
    } finally {
      setIsLoading(false);
    }
  };

  /* =======================================================
     FORMAT
  ======================================================= */

  const formatNumber = (
    value
  ) => {
    return Number(
      value || 0
    ).toLocaleString("en-IN");
  };

  const productCode =
    product?.sku ||
    product?.productCode ||
    product?._id
      ?.slice(-8)
      .toUpperCase();

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="edit-product-page">

      <style>{`

        * {
          box-sizing: border-box;
        }

        /* ==================================================
           PAGE
        ================================================== */

        .edit-product-page {
          min-height: 100vh;
          width: 100%;
          background:
            radial-gradient(
              circle at 10% 0%,
              rgba(255,255,255,.035),
              transparent 28%
            ),
            radial-gradient(
              circle at 90% 0%,
              rgba(255,255,255,.025),
              transparent 28%
            ),
            #0b0b0b;
          color: #f4f4f4;
          padding: 25px 18px 115px;
          overflow-x: hidden;
          animation: epPage .45s ease;
        }

        .ep-container {
          max-width: 1180px;
          width: 100%;
          margin: auto;
        }

        /* ==================================================
           HEADER
        ================================================== */

        .ep-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 25px;
          animation: epFadeUp .55s ease;
        }

        .ep-header-left {
          min-width: 0;
        }

        .ep-title-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .ep-back {
          width: 41px;
          height: 41px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 11px;
          border: 1px solid #303030;
          background: #171717;
          color: #aaa;
          cursor: pointer;
          transition: .2s ease;
        }

        .ep-back:hover {
          background: #222;
          border-color: #4b4b4b;
          color: white;
          transform: translateX(-3px);
        }

        .ep-title {
          margin: 0;
          color: #f4f4f4;
          font-size: clamp(25px, 3vw, 35px);
          line-height: 1.1;
          font-weight: 800;
          letter-spacing: -.7px;
        }

        .ep-subtitle {
          margin: 8px 0 0 53px;
          color: #777;
          font-size: 13px;
        }

        .ep-subtitle strong {
          color: #aaa;
          font-weight: 500;
        }

        .ep-change-status {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 13px;
          border-radius: 999px;
          background: #151515;
          border: 1px solid #303030;
          color: #777;
          font-size: 11px;
          white-space: nowrap;
        }

        .ep-status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #555;
        }

        .ep-change-status.changed {
          color: #ddd;
          border-color: #454545;
        }

        .ep-change-status.changed
        .ep-status-dot {
          background: #eee;
          box-shadow:
            0 0 12px rgba(255,255,255,.65);
          animation: epPulse 1.5s infinite;
        }

        /* ==================================================
           FORM
        ================================================== */

        .ep-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .ep-card {
          background: #181818;
          border: 1px solid #303030;
          border-radius: 14px;
          padding: 23px 19px 19px;
          box-shadow:
            0 18px 40px rgba(0,0,0,.18),
            inset 0 1px 0 rgba(255,255,255,.015);
          animation: epCard .6s ease both;
        }

        .ep-card:nth-child(2) {
          animation-delay: .07s;
        }

        .ep-card:nth-child(3) {
          animation-delay: .14s;
        }

        .ep-card:nth-child(4) {
          animation-delay: .21s;
        }

        /* ==================================================
           SECTION HEADER
        ================================================== */

        .ep-section-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 21px;
        }

        .ep-section-icon {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: #ddd;
          background: #232323;
          border: 1px solid #353535;
          border-radius: 10px;
        }

        .ep-section-heading {
          min-width: 0;
        }

        .ep-section-title-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
        }

        .ep-section-title-row h2 {
          margin: 0;
          color: #eee;
          font-size: 16px;
          font-weight: 700;
        }

        .ep-section-heading p {
          margin: 4px 0 0;
          color: #727272;
          font-size: 11px;
        }

        .ep-section-badge {
          padding: 3px 8px;
          border-radius: 999px;
          border: 1px solid #353535;
          background: #202020;
          color: #888;
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: .5px;
        }

        /* ==================================================
           GRID
        ================================================== */

        .ep-grid {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 18px 15px;
        }

        .ep-full {
          grid-column: 1 / -1;
        }

        /* ==================================================
           FIELD
        ================================================== */

        .ep-field {
          min-width: 0;
        }

        .ep-field label {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-bottom: 7px;
          color: #dedede;
          font-size: 12px;
          font-weight: 500;
        }

        .ep-required {
          color: #999;
        }

        .ep-input,
        .ep-select-wrap select,
        .ep-textarea {
          width: 100%;
          border: 1px solid #343434;
          outline: none;
          border-radius: 6px;
          background: #181818;
          color: #f1f1f1;
          font-size: 13px;
          transition:
            border-color .2s ease,
            background .2s ease,
            box-shadow .2s ease;
        }

        .ep-input {
          height: 35px;
          padding: 0 11px;
        }

        .ep-input::placeholder,
        .ep-textarea::placeholder {
          color: #5d5d5d;
        }

        .ep-input:hover,
        .ep-select-wrap select:hover,
        .ep-textarea:hover {
          border-color: #4a4a4a;
          background: #1b1b1b;
        }

        .ep-input:focus,
        .ep-select-wrap select:focus,
        .ep-textarea:focus {
          border-color: #666;
          background: #1c1c1c;
          box-shadow:
            0 0 0 3px rgba(255,255,255,.04);
        }

        /* ==================================================
           SELECT
        ================================================== */

        .ep-select-wrap {
          position: relative;
        }

        .ep-select-wrap select {
          height: 35px;
          padding: 0 35px 0 11px;
          appearance: none;
          cursor: pointer;
        }

        .ep-select-wrap select:disabled {
          cursor: not-allowed;
          opacity: .45;
        }

        .ep-select-arrow {
          position: absolute;
          right: 11px;
          top: 50%;
          transform: translateY(-50%);
          color: #707070;
          pointer-events: none;
        }

        /* ==================================================
           TEXTAREA
        ================================================== */

        .ep-textarea {
          min-height: 105px;
          padding: 11px 12px;
          resize: vertical;
          line-height: 1.55;
        }

        /* ==================================================
           IMAGE UPLOAD
        ================================================== */

        .ep-images-grid {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 15px;
        }

        .ep-image-box {
          position: relative;
          min-height: 220px;
          overflow: hidden;
          border: 1px dashed #3b3b3b;
          border-radius: 10px;
          background:
            linear-gradient(
              135deg,
              rgba(255,255,255,.025),
              transparent
            ),
            #131313;
          transition: .25s ease;
        }

        .ep-image-box:hover {
          border-color: #666;
          background: #171717;
        }

        .ep-image-label {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .ep-file-input {
          display: none;
        }

        .ep-upload-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          color: #777;
          transition: .25s ease;
        }

        .ep-upload-content svg {
          color: #666;
        }

        .ep-upload-content span {
          font-size: 12px;
        }

        .ep-image-label:hover
        .ep-upload-content {
          color: #ddd;
          transform: translateY(-3px);
        }

        .ep-image-preview {
          position: absolute;
          inset: 0;
        }

        .ep-image-preview img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          transition: transform .5s ease;
        }

        .ep-image-box:hover
        .ep-image-preview img {
          transform: scale(1.035);
        }

        .ep-image-overlay {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          padding: 10px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background:
            linear-gradient(
              transparent,
              rgba(0,0,0,.85)
            );
        }

        .ep-image-name {
          color: white;
          font-size: 10px;
          max-width: 75%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .ep-image-actions {
          display: flex;
          gap: 6px;
        }

        .ep-image-action {
          width: 31px;
          height: 31px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255,255,255,.18);
          border-radius: 8px;
          background: rgba(0,0,0,.65);
          color: #ddd;
          cursor: pointer;
          transition: .2s ease;
        }

        .ep-image-action:hover {
          background: rgba(255,255,255,.12);
          color: white;
        }

        .ep-image-number {
          position: absolute;
          top: 10px;
          left: 10px;
          z-index: 3;
          padding: 5px 8px;
          border-radius: 999px;
          background: rgba(0,0,0,.65);
          border: 1px solid rgba(255,255,255,.12);
          color: #ccc;
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: .4px;
        }

        /* ==================================================
           PRICE SUMMARY
        ================================================== */

        .ep-price-summary {
          display: grid;
          grid-template-columns:
            repeat(3, 1fr);
          margin-top: 17px;
          overflow: hidden;
          border: 1px solid #303030;
          border-radius: 7px;
          background: #151515;
        }

        .ep-price-item {
          min-height: 48px;
          display: flex;
          align-items: center;
          padding: 10px 15px;
          color: #777;
          font-size: 11px;
          border-right: 1px solid #303030;
        }

        .ep-price-item:last-child {
          border-right: 0;
        }

        .ep-price-item strong {
          margin-left: 5px;
          color: #eee;
          font-size: 12px;
        }

        /* ==================================================
           HOT SELL
        ================================================== */

        .ep-hot-box {
          min-height: 35px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 0 10px 0 12px;
          border: 1px solid #343434;
          border-radius: 6px;
          background: #181818;
        }

        .ep-hot-left {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #ccc;
          font-size: 12px;
        }

        .ep-hot-left svg {
          color: #F18216;
        }

        .ep-switch {
          position: relative;
          width: 42px;
          height: 23px;
          flex-shrink: 0;
        }

        .ep-switch input {
          display: none;
        }

        .ep-switch-track {
          position: absolute;
          inset: 0;
          border-radius: 999px;
          background: #343434;
          cursor: pointer;
          transition: .25s ease;
        }

        .ep-switch-thumb {
          position: absolute;
          top: 3px;
          left: 3px;
          width: 17px;
          height: 17px;
          border-radius: 50%;
          background: #aaa;
          pointer-events: none;
          transition: .25s ease;
        }

        .ep-switch input:checked
        + .ep-switch-track {
          background: #777;
        }

        .ep-switch input:checked
        + .ep-switch-track
        .ep-switch-thumb {
          transform: translateX(19px);
          background: white;
        }

        /* ==================================================
           PREVIEW
        ================================================== */

        .ep-preview {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 14px;
          border: 1px solid #303030;
          border-radius: 10px;
          background: #151515;
        }

        .ep-preview-left {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .ep-preview-image {
          width: 52px;
          height: 52px;
          flex-shrink: 0;
          border-radius: 9px;
          overflow: hidden;
          border: 1px solid #383838;
          background: #202020;
        }

        .ep-preview-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .ep-preview-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
        }

        .ep-preview-info {
          min-width: 0;
        }

        .ep-preview-info h3 {
          margin: 0;
          color: #eee;
          font-size: 13px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .ep-preview-info p {
          margin: 4px 0 0;
          color: #707070;
          font-size: 10px;
        }

        .ep-preview-price {
          flex-shrink: 0;
          color: #eee;
          font-size: 13px;
          font-weight: 700;
        }

        /* ==================================================
           ACTION BAR
        ================================================== */

        .ep-action-wrapper {
          position: sticky;
          z-index: 30;
          bottom: 12px;
          margin-top: 2px;
        }

        .ep-action-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 10px 12px;
          border: 1px solid #343434;
          border-radius: 13px;
          background: rgba(19,19,19,.92);
          backdrop-filter: blur(17px);
          -webkit-backdrop-filter: blur(17px);
          box-shadow:
            0 20px 50px rgba(0,0,0,.5);
        }

        .ep-action-info {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #707070;
          font-size: 10px;
        }

        .ep-action-info svg {
          color: #888;
        }

        .ep-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .ep-btn {
          min-height: 38px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 0 15px;
          border-radius: 7px;
          font-size: 11px;
          font-weight: 650;
          cursor: pointer;
          transition: .2s ease;
        }

        .ep-btn:hover:not(:disabled) {
          transform: translateY(-1px);
        }

        .ep-btn:disabled {
          opacity: .4;
          cursor: not-allowed;
        }

        .ep-btn-reset {
          border: 1px solid #333;
          background: transparent;
          color: #888;
        }

        .ep-btn-reset:hover:not(:disabled) {
          color: #ddd;
          background: #202020;
        }

        .ep-btn-cancel {
          border: 1px solid #383838;
          background: #202020;
          color: #bbb;
        }

        .ep-btn-cancel:hover:not(:disabled) {
          background: #292929;
          color: white;
        }

        .ep-btn-save {
          border: 1px solid #eee;
          background: #eee;
          color: #0b0b0b;
        }

        .ep-btn-save:hover:not(:disabled) {
          background: white;
          box-shadow:
            0 7px 25px rgba(255,255,255,.12);
        }

        /* ==================================================
           NOTIFICATION
        ================================================== */

        .ep-notification {
          position: fixed;
          right: 20px;
          bottom: 20px;
          z-index: 9999;
          width: min(390px, calc(100vw - 40px));
          display: flex;
          align-items: flex-start;
          gap: 11px;
          padding: 13px;
          border: 1px solid #3b3b3b;
          border-radius: 12px;
          background: rgba(22,22,22,.97);
          box-shadow:
            0 20px 60px rgba(0,0,0,.55);
          backdrop-filter: blur(15px);
          animation:
            epNotification .4s
            cubic-bezier(.2,.8,.2,1);
        }

        .ep-notification-success {
          border-left: 3px solid #aaa;
        }

        .ep-notification-error {
          border-left: 3px solid #777;
        }

        .ep-notification-icon {
          width: 33px;
          height: 33px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border-radius: 8px;
          background: #242424;
          color: #eee;
        }

        .ep-notification-content {
          flex: 1;
          min-width: 0;
        }

        .ep-notification-content strong {
          display: block;
          color: #eee;
          font-size: 12px;
        }

        .ep-notification-content span {
          display: block;
          margin-top: 3px;
          color: #888;
          font-size: 10px;
          line-height: 1.5;
        }

        .ep-notification-close {
          width: 27px;
          height: 27px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 0;
          border-radius: 7px;
          background: transparent;
          color: #666;
          cursor: pointer;
        }

        .ep-notification-close:hover {
          background: #2a2a2a;
          color: white;
        }

        /* ==================================================
           LOADING
        ================================================== */

        .ep-loading {
          animation: epSpin 1s linear infinite;
        }

        /* ==================================================
           ANIMATIONS
        ================================================== */

        @keyframes epPage {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        @keyframes epFadeUp {
          from {
            opacity: 0;
            transform: translateY(14px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes epCard {
          from {
            opacity: 0;
            transform: translateY(18px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes epPulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }

          50% {
            opacity: .45;
            transform: scale(.75);
          }
        }

        @keyframes epSpin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes epNotification {
          from {
            opacity: 0;
            transform:
              translateX(35px)
              scale(.97);
          }

          to {
            opacity: 1;
            transform:
              translateX(0)
              scale(1);
          }
        }

        /* ==================================================
           TABLET
        ================================================== */

        @media (max-width: 850px) {

          .ep-grid {
            grid-template-columns: 1fr;
          }

          .ep-full {
            grid-column: auto;
          }

          .ep-price-summary {
            grid-template-columns: 1fr;
          }

          .ep-price-item {
            border-right: 0;
            border-bottom: 1px solid #303030;
          }

          .ep-price-item:last-child {
            border-bottom: 0;
          }

          .ep-action-info {
            display: none;
          }
        }

        /* ==================================================
           MOBILE
        ================================================== */

        @media (max-width: 620px) {

          .edit-product-page {
            padding:
              16px
              10px
              100px;
          }

          .ep-header {
            margin-bottom: 18px;
          }

          .ep-change-status {
            display: none;
          }

          .ep-back {
            width: 37px;
            height: 37px;
          }

          .ep-title {
            font-size: 23px;
          }

          .ep-subtitle {
            margin-left: 49px;
            max-width: 250px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-size: 10px;
          }

          .ep-card {
            padding:
              18px
              13px
              15px;
            border-radius: 11px;
          }

          .ep-section-header {
            margin-bottom: 17px;
          }

          .ep-section-icon {
            width: 34px;
            height: 34px;
          }

          .ep-section-heading p {
            display: none;
          }

          .ep-images-grid {
            grid-template-columns: 1fr;
          }

          .ep-image-box {
            min-height: 200px;
          }

          .ep-action-wrapper {
            bottom: 7px;
          }

          .ep-action-bar {
            padding: 8px;
          }

          .ep-actions {
            width: 100%;
          }

          .ep-btn {
            flex: 1;
            padding: 0 9px;
            min-height: 40px;
          }

          .ep-btn-reset {
            display: none;
          }

          .ep-notification {
            left: 10px;
            right: 10px;
            bottom: 10px;
            width: auto;
          }
        }

        @media (max-width: 390px) {

          .ep-title {
            font-size: 21px;
          }

          .ep-btn {
            font-size: 10px;
          }

          .ep-btn svg {
            width: 15px;
            height: 15px;
          }
        }

        @media (prefers-reduced-motion: reduce) {

          .edit-product-page,
          .ep-header,
          .ep-card,
          .ep-notification {
            animation: none !important;
          }
        }
      `}</style>

      <div className="ep-container">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="ep-header">

          <div className="ep-header-left">

            <div className="ep-title-row">

              <button
                type="button"
                className="ep-back"
                onClick={onCancel}
                aria-label="Go back"
              >
                <ArrowLeft size={19} />
              </button>

              <h1 className="ep-title">
                Edit Product
              </h1>
            </div>

            <p className="ep-subtitle">
              {formData.productName ||
                "Product"}

              {productCode && (
                <>
                  {" "}
                  <strong>
                    • {productCode}
                  </strong>
                </>
              )}
            </p>
          </div>

          <div
            className={`ep-change-status ${
              isChanged
                ? "changed"
                : ""
            }`}
          >
            <span className="ep-status-dot" />

            {isChanged
              ? "Unsaved changes"
              : "All changes saved"}
          </div>
        </header>

        {/* =================================================
            FORM
        ================================================= */}

        <form
          className="ep-form"
          onSubmit={handleSubmit}
        >

         

          {/* =================================================
              BASIC DETAILS
          ================================================= */}

          <section className="ep-card">

            <SectionHeader
              icon={
                <Package size={19} />
              }
              title="Basic details"
              description="Update the main information of your product."
              badge="Product"
            />

            <div className="ep-grid">

              {/* PRODUCT NAME */}

              <div className="ep-field ep-full">
                <label htmlFor="productName">
                  Product name
                  <span className="ep-required">
                    *
                  </span>
                </label>

                <input
                  id="productName"
                  className="ep-input"
                  type="text"
                  name="productName"
                  value={
                    formData.productName
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="Enter product name"
                  required
                />
              </div>

              {/* SIZE */}

              <div className="ep-field">
                <label htmlFor="size">
                  Size
                </label>

                <input
                  id="size"
                  className="ep-input"
                  type="text"
                  name="size"
                  value={
                    formData.size
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="e.g. Free Size"
                />
              </div>

              {/* CATEGORY */}

              <SelectField
                label="Category"
                name="category"
                value={
                  formData.category
                }
                onChange={
                  handleInputChange
                }
                options={categories}
                placeholder="Select category"
                required
              />

              {/* COLOR */}

              <SelectField
                label="Colour"
                name="color"
                value={
                  formData.color
                }
                onChange={
                  handleInputChange
                }
                options={colors}
                placeholder="Select colour"
                required
              />

              {/* BLOUSE */}

              <SelectField
                label="Blouse available"
                name="blouseAvaliable"
                value={
                  formData.blouseAvaliable
                }
                onChange={
                  handleInputChange
                }
                options={
                  blouseOptions
                }
                placeholder="Select"
                required
              />
            </div>
          </section>

          {/* =================================================
              PRICING
          ================================================= */}

          <section className="ep-card">

            <SectionHeader
              icon={
                <IndianRupee size={19} />
              }
              title="Pricing, tax & stock"
              description="Manage pricing and available inventory."
              badge="Finance"
            />

            <div className="ep-grid">

              {/* SELLING PRICE */}

              <div className="ep-field">
                <label htmlFor="price">
                  Selling price (₹)
                  <span className="ep-required">
                    *
                  </span>
                </label>

                <input
                  id="price"
                  className="ep-input"
                  type="number"
                  name="price"
                  value={
                    formData.price
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="0"
                  min="0"
                  required
                />
              </div>

              {/* ORIGINAL PRICE */}

              <div className="ep-field">
                <label htmlFor="originalPrice">
                  Original price (₹)
                </label>

                <input
                  id="originalPrice"
                  className="ep-input"
                  type="number"
                  name="originalPrice"
                  value={
                    formData.originalPrice
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="0"
                  min="0"
                />
              </div>

              {/* STOCK */}

              <div className="ep-field">
                <label htmlFor="stock">
                  Stock quantity
                  <span className="ep-required">
                    *
                  </span>
                </label>

                <input
                  id="stock"
                  className="ep-input"
                  type="number"
                  name="stock"
                  value={
                    formData.stock
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="0"
                  min="0"
                  required
                />
              </div>

              {/* HOT SELL */}

              <div className="ep-field">
                <label>
                  Hot sell
                </label>

                <div className="ep-hot-box">

                  <div className="ep-hot-left">
                    <Flame size={16} />

                    <span>
                      Feature as hot selling
                    </span>
                  </div>

                  <label className="ep-switch">
                    <input
                      type="checkbox"
                      checked={
                        formData.hotSell
                      }
                      onChange={
                        handleHotSellChange
                      }
                    />

                    <span className="ep-switch-track">
                      <span className="ep-switch-thumb" />
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* PRICE SUMMARY */}

            <div className="ep-price-summary">

              <div className="ep-price-item">
                Selling price:

                <strong>
                  ₹
                  {formatNumber(
                    pricing.price
                  )}
                </strong>
              </div>

              <div className="ep-price-item">
                {pricing.discount > 0
                  ? "Discount:"
                  : "Price difference:"}

                <strong>
                  {pricing.discount > 0
                    ? `${pricing.discount}%`
                    : `₹${formatNumber(
                        pricing.difference
                      )}`}
                </strong>
              </div>

              <div className="ep-price-item">
                Stock:

                <strong>
                  {formData.stock || 0} units
                </strong>
              </div>
            </div>
          </section>

          {/* =================================================
              DESCRIPTION
          ================================================= */}

          <section className="ep-card">

            <SectionHeader
              icon={
                <FileText size={19} />
              }
              title="Description & specifications"
              description="Keep the product information clear and useful for customers."
              badge="Content"
            />

            <div className="ep-grid">

              <div className="ep-field ep-full">
                <label htmlFor="description">
                  Description
                  <span className="ep-required">
                    *
                  </span>
                </label>

                <textarea
                  id="description"
                  className="ep-textarea"
                  name="description"
                  value={
                    formData.description
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="Enter product description..."
                  rows={5}
                  required
                />
              </div>

              <div className="ep-field ep-full">
                <label htmlFor="specification">
                  Specification
                </label>

                <textarea
                  id="specification"
                  className="ep-textarea"
                  name="specification"
                  value={
                    formData.specification
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="Enter product specifications..."
                  rows={5}
                />
              </div>
            </div>
          </section>

          {/* =================================================
              REVIEW
          ================================================= */}

          <section className="ep-card">

            <SectionHeader
              icon={
                <Info size={19} />
              }
              title="Quick review"
              description="Check the important details before saving."
              badge="Preview"
            />

            <div className="ep-preview">

              <div className="ep-preview-left">

                <div className="ep-preview-image">

                  {formData.imageUrls[0] ? (
                    <img
                      src={
                        formData.imageUrls[0]
                      }
                      alt="Product preview"
                    />
                  ) : (
                    <div className="ep-preview-placeholder">
                      <ImagePlus
                        size={19}
                      />
                    </div>
                  )}
                </div>

                <div className="ep-preview-info">

                  <h3>
                    {formData.productName ||
                      "Product name"}
                  </h3>

                  <p>
                    {formData.category ||
                      "Category"}

                    {" • "}

                    {formData.color ||
                      "Colour"}

                    {" • "}

                    {formData.blouseAvaliable ===
                    "yes"
                      ? "Blouse available"
                      : "No blouse"}
                  </p>
                </div>
              </div>

              <div className="ep-preview-price">
                ₹
                {formatNumber(
                  formData.price
                )}
              </div>
            </div>
          </section>

          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="ep-action-wrapper">

            <div className="ep-action-bar">

              <div className="ep-action-info">
                <Info size={14} />

                {isChanged
                  ? "You have unsaved changes."
                  : "Product is up to date."}
              </div>

              <div className="ep-actions">

                <button
                  type="button"
                  className="ep-btn ep-btn-reset"
                  onClick={handleReset}
                  disabled={
                    isLoading ||
                    !isChanged
                  }
                >
                  <RefreshCcw
                    size={14}
                  />

                  Reset
                </button>

                <button
                  type="button"
                  className="ep-btn ep-btn-cancel"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="ep-btn ep-btn-save"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2
                        size={15}
                        className="ep-loading"
                      />

                      Updating...
                    </>
                  ) : (
                    <>
                      <Save size={15} />

                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* =================================================
          NOTIFICATION
      ================================================= */}

      {notification && (
        <Notification
          message={
            notification.message
          }
          type={
            notification.type
          }
          onClose={() =>
            setNotification(null)
          }
        />
      )}
    </div>
  );
};

export default EditProduct;