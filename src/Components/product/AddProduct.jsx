import { useMemo, useState } from "react";
import { useAppContext } from "../../context/Context";
import axios from "axios";

/* =========================================================
   SMALL ICON SYSTEM
   No extra package required.
========================================================= */

const Icon = ({ name, size = 18, strokeWidth = 1.8 }) => {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  const paths = {
    arrowLeft: (
      <>
        <path d="M19 12H5" />
        <path d="m12 19-7-7 7-7" />
      </>
    ),
    image: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="m21 15-5-5L5 21" />
      </>
    ),
    plus: (
      <>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </>
    ),
    x: (
      <>
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
      </>
    ),
    check: (
      <>
        <path d="m5 12 4 4L19 6" />
      </>
    ),
    alert: (
      <>
        <path d="M10.3 3.2 2.7 17a2 2 0 0 0 1.75 3h15.1a2 2 0 0 0 1.75-3L13.7 3.2a2 2 0 0 0-3.4 0Z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </>
    ),
    sparkle: (
      <>
        <path d="m12 3-1.4 5.6L5 10l5.6 1.4L12 17l1.4-5.6L19 10l-5.6-1.4L12 3Z" />
        <path d="m19 16-.7 2.3L16 19l2.3.7L19 22l.7-2.3L22 19l-2.3-.7L19 16Z" />
      </>
    ),
    chevron: <path d="m7 10 5 5 5-5" />,
    package: (
      <>
        <path d="m21 8-9 5-9-5" />
        <path d="M3 8l9-5 9 5v8l-9 5-9-5V8Z" />
        <path d="M12 13v8" />
      </>
    ),
    indianRupee: (
      <>
        <path d="M6 3h12" />
        <path d="M6 8h12" />
        <path d="M8 8c.5 4 2.5 6 7 6" />
        <path d="m8 8 8 13" />
      </>
    ),
    refresh: (
      <>
        <path d="M20 11a8 8 0 0 0-14.8-4L3 10" />
        <path d="M3 5v5h5" />
        <path d="M4 13a8 8 0 0 0 14.8 4L21 14" />
        <path d="M21 19v-5h-5" />
      </>
    ),
    trash: (
      <>
        <path d="M3 6h18" />
        <path d="M8 6V4h8v2" />
        <path d="M19 6l-1 15H6L5 6" />
        <path d="M10 11v6M14 11v6" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="4" width="18" height="17" rx="3" />
        <path d="M16 2v4M8 2v4M3 10h18" />
        <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
      </>
    ),
    eye: (
      <>
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
        <circle cx="12" cy="12" r="2.5" />
      </>
    ),
    close: (
      <>
        <path d="M6 6l12 12" />
        <path d="M18 6 6 18" />
      </>
    ),
  };

  return <svg {...common}>{paths[name]}</svg>;
};

/* =========================================================
   NOTIFICATION
========================================================= */

const Notification = ({ message, type, onClose }) => {
  const success = type === "success";

  return (
    <div className={`ap-notification ${success ? "is-success" : "is-error"}`}>
      <div className="ap-notification-icon">
        <Icon name={success ? "check" : "alert"} size={18} />
      </div>

      <div className="ap-notification-content">
        <strong>{success ? "Success" : "Something went wrong"}</strong>
        <span>{message}</span>
      </div>

      <button
        type="button"
        className="ap-notification-close"
        onClick={onClose}
        aria-label="Close notification"
      >
        <Icon name="x" size={16} />
      </button>
    </div>
  );
};

/* =========================================================
   ADD PRODUCT
========================================================= */

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
    preBooking: false,
    description: "",
    specification: "",
    images: [null, null],
    imageUrls: [null, null],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const categories = [
    "Pujo Special",
    "Designer Saree",
    "Handstitch",
    "Royal Bengal Tussar",
    "Tussar kantha",
    "Bengal Tussar",
    "Pure Silk",
    "Pure Handloom",
    "Silk Replica",
    "Pure Dhonekhali",
    "Banarasi",
    "Kanthastitch",
    "Kanjivaram",
    "Cotton Handloom",
    "Bandhani",
    "Festive Edit",
    "Bridal collection",
    "Pure Silk Replica",
    "Fancy Saree",
    "Handloom Saree",
    "Dhonekhali",
    "Run kantha",
    "Bangalore Silk ",
    "Bapta Batik",
    "Dhakai",
    "Chanderi Cotton",
    "Khesh Kantha",
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

  const showNotification = (type, message) => {
    setNotification({ type, message });

    window.clearTimeout(showNotification.timer);
    showNotification.timer = window.setTimeout(() => {
      setNotification(null);
    }, 4200);
  };

  const updateField = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    updateField(name, value);
  };

  const handleImageChange = (e, index) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showNotification("error", "Please select a valid image file.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showNotification("error", "Image size must be 5MB or smaller.");
      e.target.value = "";
      return;
    }

    const oldUrl = formData.imageUrls[index];

    if (oldUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(oldUrl);
    }

    const newImages = [...formData.images];
    const newImageUrls = [...formData.imageUrls];

    newImages[index] = file;
    newImageUrls[index] = URL.createObjectURL(file);

    setFormData((prev) => ({
      ...prev,
      images: newImages,
      imageUrls: newImageUrls,
    }));

    e.target.value = "";
  };

  const handleClearImage = (index) => {
    const imageUrl = formData.imageUrls[index];

    if (imageUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(imageUrl);
    }

    const newImages = [...formData.images];
    const newImageUrls = [...formData.imageUrls];

    newImages[index] = null;
    newImageUrls[index] = null;

    setFormData((prev) => ({
      ...prev,
      images: newImages,
      imageUrls: newImageUrls,
    }));
  };

  const handleReset = () => {
    formData.imageUrls.forEach((imageUrl) => {
      if (imageUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(imageUrl);
      }
    });

    setFormData({
      productName: "",
      price: "",
      originalPrice: "",
      size: "",
      category: "",
      color: "",
      blouseAvaliable: "",
      stock: "",
      hotSell: false,
      preBooking: false,
      description: "",
      specification: "",
      images: [null, null],
      imageUrls: [null, null],
    });

    setNotification(null);
  };

  const pricing = useMemo(() => {
    const price = Number(formData.price) || 0;
    const originalPrice = Number(formData.originalPrice) || 0;

    const margin = price - originalPrice;

    const discount =
      originalPrice > 0 && price < originalPrice
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : 0;

    return {
      price,
      originalPrice,
      margin,
      discount,
    };
  }, [formData.price, formData.originalPrice]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLoading) return;

    if (!formData.productName.trim()) {
      showNotification("error", "Please enter a product name.");
      return;
    }

    if (!formData.price || Number(formData.price) < 0) {
      showNotification("error", "Please enter a valid selling price.");
      return;
    }

    if (
      formData.originalPrice !== "" &&
      Number(formData.originalPrice) < 0
    ) {
      showNotification("error", "Original price cannot be negative.");
      return;
    }

    if (!formData.stock || Number(formData.stock) < 0) {
      showNotification("error", "Please enter a valid stock quantity.");
      return;
    }

    if (!formData.category) {
      showNotification("error", "Please select a category.");
      return;
    }

    if (!formData.color) {
      showNotification("error", "Please select a colour.");
      return;
    }

    if (!formData.blouseAvaliable) {
      showNotification("error", "Please select blouse availability.");
      return;
    }

    if (!formData.description.trim()) {
      showNotification("error", "Please enter a product description.");
      return;
    }

    if (!formData.specification.trim()) {
      showNotification("error", "Please enter product specifications.");
      return;
    }

    setIsLoading(true);
    setNotification(null);

    const sendData = new FormData();

    /*
      IMPORTANT:
      These field names intentionally match the existing
      AddProduct API contract, including blouseAvaliable.
    */
    sendData.append("productName", formData.productName.trim());
    sendData.append("price", formData.price);
    sendData.append("originalPrice", formData.originalPrice);
    sendData.append("size", formData.size.trim());
    sendData.append("category", formData.category);
    sendData.append("color", formData.color);
    sendData.append("blouseAvaliable", formData.blouseAvaliable);
    sendData.append("stock", formData.stock);
    sendData.append("hotSell", String(Boolean(formData.hotSell)));
    sendData.append("preBooking", String(Boolean(formData.preBooking)));
    sendData.append("description", formData.description.trim());
    sendData.append("specification", formData.specification.trim());

    if (formData.images[0]) {
      sendData.append("image", formData.images[0]);
    }

    if (formData.images[1]) {
      sendData.append("image1", formData.images[1]);
    }

    try {
      const res = await axios.post(
        `${url}/api/product/addProduct`,
        sendData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      showNotification(
        "success",
        res.data?.message || "Product created successfully!"
      );

      await getProduct();

      window.setTimeout(() => {
        setTab(2);
      }, 1000);
    } catch (err) {
      console.error(
        "ADD PRODUCT ERROR:",
        err.response?.data || err.message
      );

      showNotification(
        "error",
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Error occurred while creating product."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="add-product-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        .add-product-page {
          --ap-bg: #0a0a0a;
          --ap-card: #171717;
          --ap-card-2: #1b1b1b;
          --ap-input: #111111;
          --ap-border: #303030;
          --ap-border-soft: #252525;
          --ap-text: #f5f5f5;
          --ap-muted: #9a9a9a;
          --ap-muted-2: #707070;
          --ap-accent: #d6a82c;
          --ap-accent-2: #f0c85b;
          --ap-accent-soft: rgba(214, 168, 44, .12);

          min-height: 100vh;
          width: 100%;
          padding: 28px 20px 100px;
          color: var(--ap-text);
          background:
            radial-gradient(circle at 8% -10%, rgba(214,168,44,.09), transparent 28%),
            radial-gradient(circle at 92% 0%, rgba(255,255,255,.035), transparent 24%),
            var(--ap-bg);
          overflow: hidden;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          animation: ap-page-in .45s ease both;
        }

        .add-product-page button,
        .add-product-page input,
        .add-product-page textarea,
        .add-product-page select {
          font: inherit;
        }

        .ap-shell {
          width: min(1480px, 100%);
          margin: 0 auto;
        }

        .ap-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 24px;
          animation: ap-slide-down .55s ease both;
        }

        .ap-heading-wrap {
          display: flex;
          gap: 14px;
          align-items: flex-start;
        }

        .ap-back {
          width: 42px;
          height: 42px;
          flex: 0 0 42px;
          margin-top: 2px;
          display: grid;
          place-items: center;
          color: #c9c9c9;
          background: #141414;
          border: 1px solid var(--ap-border);
          border-radius: 12px;
          cursor: pointer;
          transition: .25s ease;
        }

        .ap-back:hover {
          color: var(--ap-accent-2);
          border-color: rgba(214,168,44,.5);
          background: #1d1d1d;
          transform: translateX(-3px);
        }

        .ap-title {
          margin: 0;
          font-size: clamp(27px, 3vw, 38px);
          line-height: 1.05;
          letter-spacing: -.035em;
          font-weight: 750;
        }

        .ap-title span {
          background: linear-gradient(90deg, #fff 0%, #e9c65d 48%, #fff 100%);
          background-size: 220% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: ap-shimmer 5s linear infinite;
        }

        .ap-subtitle {
          margin: 7px 0 0;
          color: #858585;
          font-size: 14px;
        }

        .ap-header-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 12px;
          border: 1px solid rgba(214,168,44,.22);
          border-radius: 999px;
          background: rgba(214,168,44,.07);
          color: #d8bd70;
          font-size: 12px;
          font-weight: 650;
          white-space: nowrap;
        }

        .ap-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.55fr) minmax(330px, .8fr);
          gap: 16px;
          align-items: start;
        }

        .ap-left,
        .ap-right {
          display: grid;
          gap: 16px;
        }

        .ap-card {
          position: relative;
          background: linear-gradient(145deg, rgba(255,255,255,.025), transparent 36%), var(--ap-card);
          border: 1px solid var(--ap-border);
          border-radius: 14px;
          box-shadow: 0 18px 50px rgba(0,0,0,.22);
          overflow: hidden;
          animation: ap-card-in .55s ease both;
        }

        .ap-card:nth-child(2) { animation-delay: .07s; }
        .ap-card:nth-child(3) { animation-delay: .14s; }

        .ap-card::before {
          content: "";
          position: absolute;
          inset: 0 0 auto;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(214,168,44,.45), transparent);
          opacity: .8;
        }

        .ap-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 19px 20px 0;
        }

        .ap-card-title-wrap {
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .ap-section-icon {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          color: var(--ap-accent-2);
          background: var(--ap-accent-soft);
          border: 1px solid rgba(214,168,44,.22);
          border-radius: 10px;
        }

        .ap-card-title {
          margin: 0;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: -.01em;
        }

        .ap-card-description {
          margin: 3px 0 0;
          color: #747474;
          font-size: 12px;
        }

        .ap-section-badge {
          color: #777;
          font-size: 10px;
          font-weight: 750;
          text-transform: uppercase;
          letter-spacing: .12em;
        }

        .ap-card-body {
          padding: 20px;
        }

        .ap-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .ap-field {
          min-width: 0;
        }

        .ap-field.full {
          grid-column: 1 / -1;
        }

        .ap-label {
          display: flex;
          align-items: center;
          gap: 5px;
          margin: 0 0 7px;
          color: #dedede;
          font-size: 12px;
          font-weight: 650;
        }

        .ap-required {
          color: var(--ap-accent-2);
        }

        .ap-optional {
          margin-left: 4px;
          color: #666;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: .02em;
        }

        .ap-input,
        .ap-select,
        .ap-textarea {
          width: 100%;
          color: #ededed;
          background: var(--ap-input);
          border: 1px solid var(--ap-border);
          outline: none;
          transition: border-color .22s ease, box-shadow .22s ease, background .22s ease, transform .22s ease;
        }

        .ap-input,
        .ap-select {
          height: 44px;
          padding: 0 13px;
          border-radius: 8px;
          font-size: 13px;
        }

        .ap-textarea {
          min-height: 105px;
          padding: 12px 13px;
          resize: vertical;
          border-radius: 8px;
          font-size: 13px;
          line-height: 1.6;
        }

        .ap-input::placeholder,
        .ap-textarea::placeholder {
          color: #5c5c5c;
        }

        .ap-input:hover,
        .ap-select:hover,
        .ap-textarea:hover {
          border-color: #3c3c3c;
          background: #131313;
        }

        .ap-input:focus,
        .ap-select:focus,
        .ap-textarea:focus {
          border-color: rgba(214,168,44,.72);
          box-shadow: 0 0 0 3px rgba(214,168,44,.08), 0 0 22px rgba(214,168,44,.04);
          background: #121212;
        }

        .ap-input:focus,
        .ap-select:focus {
          transform: translateY(-1px);
        }

        .ap-select-wrap {
          position: relative;
        }

        .ap-select {
          appearance: none;
          padding-right: 38px;
          cursor: pointer;
        }

        .ap-select-arrow {
          position: absolute;
          right: 13px;
          top: 50%;
          transform: translateY(-50%);
          color: #777;
          pointer-events: none;
          transition: .2s ease;
        }

        .ap-select-wrap:focus-within .ap-select-arrow {
          color: var(--ap-accent-2);
          transform: translateY(-50%) rotate(180deg);
        }

        .ap-divider {
          height: 1px;
          margin: 20px 0;
          background: var(--ap-border-soft);
        }

        /* Image upload */

        .ap-upload-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .ap-upload {
          position: relative;
          min-height: 190px;
          display: grid;
          place-items: center;
          border: 1px dashed #3b3b3b;
          border-radius: 12px;
          background:
            radial-gradient(circle at 50% 35%, rgba(214,168,44,.05), transparent 38%),
            #101010;
          cursor: pointer;
          overflow: hidden;
          transition: .28s ease;
        }

        .ap-upload:hover {
          border-color: rgba(214,168,44,.65);
          background:
            radial-gradient(circle at 50% 35%, rgba(214,168,44,.10), transparent 40%),
            #131313;
          transform: translateY(-2px);
        }

        .ap-upload input {
          display: none;
        }

        .ap-upload-empty {
          display: grid;
          justify-items: center;
          gap: 9px;
          color: #777;
          text-align: center;
          padding: 20px;
        }

        .ap-upload-icon {
          width: 46px;
          height: 46px;
          display: grid;
          place-items: center;
          color: #c8a846;
          background: rgba(214,168,44,.08);
          border: 1px solid rgba(214,168,44,.18);
          border-radius: 12px;
          transition: .28s ease;
        }

        .ap-upload:hover .ap-upload-icon {
          transform: translateY(-4px) scale(1.04);
          box-shadow: 0 8px 24px rgba(214,168,44,.12);
        }

        .ap-upload-title {
          color: #ddd;
          font-size: 13px;
          font-weight: 650;
        }

        .ap-upload-hint {
          color: #666;
          font-size: 11px;
        }

        .ap-upload-preview {
          position: absolute;
          inset: 0;
          background: #0d0d0d;
        }

        .ap-upload-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform .5s ease;
        }

        .ap-upload:hover .ap-upload-preview img {
          transform: scale(1.035);
        }

        .ap-upload-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          padding: 10px;
          background: linear-gradient(transparent 55%, rgba(0,0,0,.78));
          opacity: 0;
          transition: .25s ease;
        }

        .ap-upload:hover .ap-upload-overlay {
          opacity: 1;
        }

        .ap-image-index {
          color: #ddd;
          font-size: 10px;
          font-weight: 700;
          background: rgba(0,0,0,.6);
          border: 1px solid rgba(255,255,255,.12);
          padding: 5px 8px;
          border-radius: 999px;
        }

        .ap-remove-image {
          width: 31px;
          height: 31px;
          display: grid;
          place-items: center;
          color: #fff;
          background: rgba(20,20,20,.82);
          border: 1px solid rgba(255,255,255,.16);
          border-radius: 9px;
          cursor: pointer;
          transition: .2s ease;
        }

        .ap-remove-image:hover {
          color: #ff8f8f;
          border-color: rgba(255,90,90,.5);
          transform: scale(1.06);
        }

        /* Hot sell */

        .ap-hot-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          min-height: 70px;
          padding: 13px 14px;
          border: 1px solid var(--ap-border);
          border-radius: 10px;
          background: #111;
        }

        .ap-hot-info strong {
          display: block;
          color: #ddd;
          font-size: 12px;
        }

        .ap-hot-info span {
          display: block;
          margin-top: 4px;
          color: #666;
          font-size: 11px;
        }

        .ap-switch {
          position: relative;
          width: 48px;
          height: 27px;
          flex: 0 0 48px;
        }

        .ap-switch input {
          position: absolute;
          opacity: 0;
          pointer-events: none;
        }

        .ap-switch-track {
          position: absolute;
          inset: 0;
          border-radius: 999px;
          background: #2c2c2c;
          border: 1px solid #404040;
          cursor: pointer;
          transition: .25s ease;
        }

        .ap-switch-track::after {
          content: "";
          position: absolute;
          width: 19px;
          height: 19px;
          top: 3px;
          left: 3px;
          border-radius: 50%;
          background: #8b8b8b;
          box-shadow: 0 2px 8px rgba(0,0,0,.35);
          transition: .25s ease;
        }

        .ap-switch input:checked + .ap-switch-track {
          background: rgba(214,168,44,.2);
          border-color: rgba(214,168,44,.65);
        }

        .ap-switch input:checked + .ap-switch-track::after {
          transform: translateX(21px);
          background: var(--ap-accent-2);
          box-shadow: 0 0 15px rgba(214,168,44,.35);
        }

        /* Pre-booking */

        .ap-prebooking-card {
          transition:
            border-color .25s ease,
            background .25s ease,
            box-shadow .25s ease;
        }

        .ap-prebooking-card.is-active {
          border-color: rgba(214,168,44,.48);
          background:
            linear-gradient(135deg, rgba(214,168,44,.09), rgba(17,17,17,.96));
          box-shadow: inset 0 0 0 1px rgba(214,168,44,.04);
        }

        .ap-prebooking-card.is-active .ap-hot-info strong {
          color: #ead06d;
        }

        .ap-prebooking-note {
          display: flex;
          align-items: center;
          gap: 11px;
          margin-top: 16px;
          padding: 12px 13px;
          border: 1px solid rgba(214,168,44,.28);
          border-radius: 10px;
          background: rgba(214,168,44,.055);
        }

        .ap-prebooking-note-icon {
          width: 34px;
          height: 34px;
          flex: 0 0 34px;
          display: grid;
          place-items: center;
          color: #e7c85e;
          border: 1px solid rgba(214,168,44,.25);
          border-radius: 9px;
          background: rgba(214,168,44,.08);
        }

        .ap-prebooking-note strong {
          display: block;
          color: #e8cf70;
          font-size: 12px;
        }

        .ap-prebooking-note span {
          display: block;
          margin-top: 3px;
          color: #777;
          font-size: 11px;
          line-height: 1.45;
        }

        .ap-prebooking-note b {
          color: #bca65f;
          font-weight: 700;
        }

        /* Pricing */

        .ap-pricing-strip {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          margin-top: 16px;
          border: 1px solid var(--ap-border);
          border-radius: 10px;
          overflow: hidden;
          background: #111;
        }

        .ap-price-stat {
          min-width: 0;
          padding: 13px 14px;
          border-right: 1px solid var(--ap-border);
        }

        .ap-price-stat:last-child {
          border-right: 0;
        }

        .ap-price-stat span {
          display: block;
          color: #727272;
          font-size: 11px;
        }

        .ap-price-stat strong {
          display: block;
          margin-top: 5px;
          color: #e9c65d;
          font-size: 14px;
          font-weight: 700;
        }

        /* Preview */

        .ap-preview-card {
          position: sticky;
          top: 18px;
        }

        .ap-preview-stage {
          min-height: 430px;
          display: grid;
          place-items: center;
          padding: 14px;
          border: 1px solid var(--ap-border);
          border-radius: 11px;
          background:
            radial-gradient(circle at 50% 30%, rgba(214,168,44,.055), transparent 40%),
            #101010;
          overflow: hidden;
        }

        .ap-preview-image-wrap {
          width: 100%;
          aspect-ratio: 4 / 5;
          max-height: 540px;
          display: grid;
          place-items: center;
          overflow: hidden;
          border-radius: 9px;
          background:
            linear-gradient(135deg, rgba(255,255,255,.02), transparent),
            #0c0c0c;
          border: 1px solid #242424;
        }

        .ap-preview-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          animation: ap-preview-in .35s ease both;
        }

        .ap-preview-placeholder {
          display: grid;
          justify-items: center;
          gap: 10px;
          color: #666;
          text-align: center;
        }

        .ap-preview-placeholder .ap-section-icon {
          width: 52px;
          height: 52px;
          border-radius: 14px;
        }

        .ap-preview-placeholder strong {
          color: #888;
          font-size: 13px;
        }

        .ap-preview-placeholder span {
          color: #555;
          font-size: 11px;
        }

        .ap-preview-info {
          padding: 15px 2px 2px;
        }

        .ap-preview-kicker {
          color: #8d7440;
          font-size: 10px;
          font-weight: 750;
          text-transform: uppercase;
          letter-spacing: .12em;
        }

        .ap-preview-name {
          margin: 5px 0 0;
          color: #eee;
          font-size: 17px;
          font-weight: 700;
          line-height: 1.3;
        }

        .ap-preview-description {
          margin: 6px 0 0;
          color: #727272;
          font-size: 11px;
          line-height: 1.55;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .ap-preview-bottom {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 12px;
          margin-top: 12px;
        }

        .ap-preview-price {
          color: #e9c65d;
          font-size: 20px;
          font-weight: 750;
        }

        .ap-preview-original {
          margin-top: 3px;
          color: #666;
          font-size: 11px;
          text-decoration: line-through;
        }

        .ap-preview-badges {
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-end;
          gap: 6px;
        }

        .ap-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 8px;
          color: #a9a9a9;
          background: #171717;
          border: 1px solid #2c2c2c;
          border-radius: 999px;
          font-size: 10px;
        }

        .ap-badge.gold {
          color: #e2c35f;
          border-color: rgba(214,168,44,.25);
          background: rgba(214,168,44,.07);
        }

        /* Actions */

        .ap-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 9px;
          padding: 15px 20px;
          border-top: 1px solid var(--ap-border);
          background: rgba(0,0,0,.12);
        }

        .ap-btn {
          min-height: 40px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 0 14px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: .24s ease;
        }

        .ap-btn:disabled {
          opacity: .55;
          cursor: not-allowed;
          transform: none !important;
        }

        .ap-btn-secondary {
          color: #a0a0a0;
          background: #151515;
          border: 1px solid #303030;
        }

        .ap-btn-secondary:hover:not(:disabled) {
          color: #eee;
          border-color: #4a4a4a;
          background: #1b1b1b;
        }

        .ap-btn-primary {
          position: relative;
          overflow: hidden;
          color: #17120a;
          background: linear-gradient(135deg, #d2a42b, #efca62);
          border: 1px solid #e2b844;
          box-shadow: 0 7px 24px rgba(214,168,44,.14);
        }

        .ap-btn-primary::after {
          content: "";
          position: absolute;
          top: 0;
          left: -80%;
          width: 55%;
          height: 100%;
          transform: skewX(-20deg);
          background: rgba(255,255,255,.3);
          transition: left .65s ease;
        }

        .ap-btn-primary:hover:not(:disabled)::after {
          left: 130%;
        }

        .ap-btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(214,168,44,.22);
        }

        .ap-btn-primary:active:not(:disabled) {
          transform: translateY(0);
        }

        .ap-loading-dot {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(23,18,10,.35);
          border-top-color: #17120a;
          border-radius: 50%;
          animation: ap-spin .7s linear infinite;
        }

        /* Notification */

        .ap-notification {
          position: fixed;
          right: 22px;
          top: 22px;
          z-index: 9999;
          width: min(390px, calc(100vw - 32px));
          display: flex;
          align-items: flex-start;
          gap: 11px;
          padding: 13px;
          color: #eee;
          background: rgba(23,23,23,.94);
          border: 1px solid #383838;
          border-radius: 12px;
          box-shadow: 0 20px 55px rgba(0,0,0,.45);
          backdrop-filter: blur(16px);
          animation: ap-notification-in .38s cubic-bezier(.2,.8,.2,1) both;
        }

        .ap-notification.is-success {
          border-color: rgba(214,168,44,.35);
        }

        .ap-notification.is-error {
          border-color: rgba(220,80,80,.38);
        }

        .ap-notification-icon {
          width: 32px;
          height: 32px;
          flex: 0 0 32px;
          display: grid;
          place-items: center;
          border-radius: 9px;
        }

        .is-success .ap-notification-icon {
          color: #e4c35e;
          background: rgba(214,168,44,.1);
        }

        .is-error .ap-notification-icon {
          color: #ff9090;
          background: rgba(220,80,80,.1);
        }

        .ap-notification-content {
          min-width: 0;
          display: grid;
          gap: 3px;
          padding-top: 1px;
        }

        .ap-notification-content strong {
          font-size: 12px;
        }

        .ap-notification-content span {
          color: #999;
          font-size: 11px;
          line-height: 1.45;
        }

        .ap-notification-close {
          margin-left: auto;
          width: 28px;
          height: 28px;
          display: grid;
          place-items: center;
          color: #777;
          background: transparent;
          border: 0;
          border-radius: 7px;
          cursor: pointer;
        }

        .ap-notification-close:hover {
          color: #eee;
          background: #252525;
        }

        /* Responsive */

        @media (max-width: 1050px) {
          .ap-layout {
            grid-template-columns: 1fr;
          }

          /*
            Responsive order:
            1. Media
            2. Basic details + Pricing
            3. Live preview

            This keeps the important image-upload area visible first
            on tablets and phones without changing the desktop layout.
          */
          .ap-right {
            display: contents;
          }

          .ap-media-card {
            order: -3;
          }

          .ap-left {
            order: -2;
          }

          .ap-preview-card {
            order: -1;
            position: relative;
            top: auto;
          }

          .ap-preview-stage {
            min-height: 360px;
          }

          .ap-preview-image-wrap {
            max-width: 420px;
          }
        }

        @media (max-width: 680px) {
          .ap-prebooking-note {
            align-items: flex-start;
          }

          .ap-prebooking-card {
            min-height: 78px;
          }

          .add-product-page {
            padding: 18px 12px 70px;
          }

          .ap-header {
            margin-bottom: 17px;
          }

          .ap-header-badge {
            display: none;
          }

          .ap-heading-wrap {
            gap: 10px;
          }

          .ap-back {
            width: 38px;
            height: 38px;
            flex-basis: 38px;
          }

          .ap-card-body,
          .ap-card-header {
            padding-left: 14px;
            padding-right: 14px;
          }

          .ap-grid,
          .ap-upload-grid {
            grid-template-columns: 1fr;
          }

          .ap-media-card {
            margin-bottom: 0;
          }

          .ap-field.full {
            grid-column: auto;
          }

          .ap-upload {
            min-height: 205px;
          }

          .ap-pricing-strip {
            grid-template-columns: 1fr;
          }

          .ap-price-stat {
            border-right: 0;
            border-bottom: 1px solid var(--ap-border);
          }

          .ap-price-stat:last-child {
            border-bottom: 0;
          }

          .ap-actions {
            flex-direction: column-reverse;
            padding: 13px 14px;
          }

          .ap-btn {
            width: 100%;
          }

          .ap-preview-stage {
            min-height: 300px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .add-product-page *,
          .add-product-page *::before,
          .add-product-page *::after {
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: .01ms !important;
            scroll-behavior: auto !important;
          }
        }

        @keyframes ap-page-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes ap-slide-down {
          from { opacity: 0; transform: translateY(-12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes ap-card-in {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes ap-preview-in {
          from { opacity: 0; transform: scale(1.02); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes ap-shimmer {
          0% { background-position: 220% center; }
          100% { background-position: -20% center; }
        }

        @keyframes ap-spin {
          to { transform: rotate(360deg); }
        }

        @keyframes ap-notification-in {
          from { opacity: 0; transform: translate3d(30px, -10px, 0) scale(.97); }
          to { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
        }
      `}</style>

      <div className="ap-shell">
        {/* =====================================================
            HEADER
        ===================================================== */}
        <header className="ap-header">
          <div className="ap-heading-wrap">
            <button
              type="button"
              className="ap-back"
              onClick={() => setTab(2)}
              aria-label="Back to products"
            >
              <Icon name="arrowLeft" size={19} />
            </button>

            <div>
              <h1 className="ap-title">
                <span>Upload product</span>
              </h1>
              <p className="ap-subtitle">
                Add a new saree to the DARSH catalogue
              </p>
            </div>
          </div>

          <div className="ap-header-badge">
            <Icon name="sparkle" size={14} />
            Premium catalogue
          </div>
        </header>

        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="ap-layout">
            {/* =================================================
                LEFT
            ================================================= */}
            <div className="ap-left">
             {/* Media */}
              <section className="ap-card ">
                <div className="ap-card-header">
                  <div className="ap-card-title-wrap">
                    <div className="ap-section-icon">
                      <Icon name="image" size={17} />
                    </div>
                    <div>
                      <h2 className="ap-card-title">Media</h2>
                      <p className="ap-card-description">
                        Add up to two product images.
                      </p>
                    </div>
                  </div>
                  <span className="ap-section-badge">2 Images</span>
                </div>

                <div className="ap-card-body">
                  <div className="ap-upload-grid">
                    {[0, 1].map((index) => (
                      <label
                        key={index}
                        className="ap-upload"
                        htmlFor={`product-image-${index}`}
                      >
                        <input
                          id={`product-image-${index}`}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageChange(e, index)}
                        />

                        {!formData.imageUrls[index] ? (
                          <div className="ap-upload-empty">
                            <div className="ap-upload-icon">
                              <Icon name="plus" size={22} />
                            </div>

                            <span className="ap-upload-title">
                              Upload image {index + 1}
                            </span>

                            <span className="ap-upload-hint">
                              JPG, PNG or WEBP • max 5MB
                            </span>
                          </div>
                        ) : (
                          <div className="ap-upload-preview">
                            <img
                              src={formData.imageUrls[index]}
                              alt={`Product ${index + 1}`}
                            />

                            <div className="ap-upload-overlay">
                              <span className="ap-image-index">
                                Image {index + 1}
                              </span>

                              <button
                                type="button"
                                className="ap-remove-image"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleClearImage(index);
                                }}
                                aria-label={`Remove image ${index + 1}`}
                              >
                                <Icon name="trash" size={15} />
                              </button>
                            </div>
                          </div>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              </section>
              {/* Basic details */}
              <section className="ap-card ap-media-card">
                <div className="ap-card-header">
                  <div className="ap-card-title-wrap">
                    <div className="ap-section-icon">
                      <Icon name="package" size={17} />
                    </div>
                    <div>
                      <h2 className="ap-card-title">Basic details</h2>
                      <p className="ap-card-description">
                        Core information for the product listing.
                      </p>
                    </div>
                  </div>
                  <span className="ap-section-badge">Product</span>
                </div>

                <div className="ap-card-body">
                  <div className="ap-grid">
                    <div className="ap-field full">
                      <label className="ap-label" htmlFor="productName">
                        Product name
                        <span className="ap-required">*</span>
                      </label>

                      <input
                        id="productName"
                        className="ap-input"
                        type="text"
                        name="productName"
                        value={formData.productName}
                        onChange={handleInputChange}
                        placeholder="Enter product name"
                        autoComplete="new-password"
                        required
                      />
                    </div>

                    <div className="ap-field">
                      <label className="ap-label" htmlFor="size">
                        Size
                        <span className="ap-optional">Optional</span>
                      </label>

                      <input
                        id="size"
                        className="ap-input"
                        type="text"
                        name="size"
                        value={formData.size}
                        onChange={handleInputChange}
                        placeholder="e.g. Free Size (optional)"
                      />
                    </div>

                    <div className="ap-field">
                      <label className="ap-label" htmlFor="category">
                        Category
                        <span className="ap-required">*</span>
                      </label>

                      <div className="ap-select-wrap">
                        <select
                          id="category"
                          className="ap-select"
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select category</option>
                          {categories.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>

                        <span className="ap-select-arrow">
                          <Icon name="chevron" size={16} />
                        </span>
                      </div>
                    </div>

                    <div className="ap-field">
                      <label className="ap-label" htmlFor="color">
                        Colour
                        <span className="ap-required">*</span>
                      </label>

                      <div className="ap-select-wrap">
                        <select
                          id="color"
                          className="ap-select"
                          name="color"
                          value={formData.color}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select colour</option>
                          {colors.map((color) => (
                            <option key={color} value={color}>
                              {color}
                            </option>
                          ))}
                        </select>

                        <span className="ap-select-arrow">
                          <Icon name="chevron" size={16} />
                        </span>
                      </div>
                    </div>

                    <div className="ap-field">
                      <label className="ap-label" htmlFor="blouseAvaliable">
                        Blouse available
                        <span className="ap-required">*</span>
                      </label>

                      <div className="ap-select-wrap">
                        <select
                          id="blouseAvaliable"
                          className="ap-select"
                          name="blouseAvaliable"
                          value={formData.blouseAvaliable}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select</option>
                          {blouseOptions.map((item) => (
                            <option key={item} value={item}>
                              {item === "yes"
                                ? "Yes — included"
                                : "No — not included"}
                            </option>
                          ))}
                        </select>

                        <span className="ap-select-arrow">
                          <Icon name="chevron" size={16} />
                        </span>
                      </div>
                    </div>

                    <div className="ap-field full">
                      <label className="ap-label" htmlFor="description">
                        Description
                        <span className="ap-required">*</span>
                      </label>

                      <textarea
                        id="description"
                        className="ap-textarea"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Describe the weave, blouse piece, design, finish and other useful product details..."
                        required
                      />
                    </div>

                    <div className="ap-field full">
                      <label className="ap-label" htmlFor="specification">
                        Specification
                        <span className="ap-required">*</span>
                      </label>

                      <textarea
                        id="specification"
                        className="ap-textarea"
                        name="specification"
                        value={formData.specification}
                        onChange={handleInputChange}
                        placeholder="Add fabric, length, work, wash care, origin and other specifications..."
                        required
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Pricing */}
              <section className="ap-card">
                <div className="ap-card-header">
                  <div className="ap-card-title-wrap">
                    <div className="ap-section-icon">
                      <Icon name="indianRupee" size={17} />
                    </div>
                    <div>
                      <h2 className="ap-card-title">Pricing, tax & stock</h2>
                      <p className="ap-card-description">
                        Manage price and available inventory.
                      </p>
                    </div>
                  </div>
                  <span className="ap-section-badge">Finance</span>
                </div>

                <div className="ap-card-body">
                  <div className="ap-grid">
                    <div className="ap-field">
                      <label className="ap-label" htmlFor="price">
                        Selling price (₹)
                        <span className="ap-required">*</span>
                      </label>

                      <input
                        id="price"
                        className="ap-input"
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="0"
                        min="0"
                        required
                      />
                    </div>

                    <div className="ap-field">
                      <label className="ap-label" htmlFor="originalPrice">
                        Original price (₹)
                      </label>

                      <input
                        id="originalPrice"
                        className="ap-input"
                        type="number"
                        name="originalPrice"
                        value={formData.originalPrice}
                        onChange={handleInputChange}
                        placeholder="0"
                        min="0"
                      />
                    </div>

                    <div className="ap-field">
                      <label className="ap-label" htmlFor="stock">
                        Stock quantity
                        <span className="ap-required">*</span>
                      </label>

                      <input
                        id="stock"
                        className="ap-input"
                        type="number"
                        name="stock"
                        value={formData.stock}
                        onChange={handleInputChange}
                        placeholder="0"
                        min="0"
                        required
                      />
                    </div>

                    <div className="ap-field">
                      <label className="ap-label">
                        Hot sell
                        <span className="ap-required">*</span>
                      </label>

                      <div className="ap-hot-card">
                        <div className="ap-hot-info">
                          <strong>
                            {formData.hotSell
                              ? "Hot selling product"
                              : "Normal product"}
                          </strong>
                          <span>
                            {formData.hotSell
                              ? "Featured as a fast-moving item."
                              : "Enable this to highlight the product."}
                          </span>
                        </div>

                        <label className="ap-switch">
                          <input
                            type="checkbox"
                            checked={Boolean(formData.hotSell)}
                            onChange={(e) =>
                              updateField("hotSell", e.target.checked)
                            }
                          />
                          <span className="ap-switch-track" />
                        </label>
                      </div>
                    </div>

                    <div className="ap-field">
                      <label className="ap-label">
                        Pre-booking
                        <span className="ap-optional">Optional</span>
                      </label>

                      <div className={`ap-hot-card ap-prebooking-card ${formData.preBooking ? "is-active" : ""}`}>
                        <div className="ap-hot-info">
                          <strong>
                            {formData.preBooking
                              ? "Pre-booking enabled"
                              : "Regular purchase"}
                          </strong>
                          <span>
                            {formData.preBooking
                              ? "Customers can reserve this product before stock arrives."
                              : "Enable this for upcoming or made-to-order sarees."}
                          </span>
                        </div>

                        <label className="ap-switch">
                          <input
                            type="checkbox"
                            checked={Boolean(formData.preBooking)}
                            onChange={(e) =>
                              updateField("preBooking", e.target.checked)
                            }
                            aria-label="Enable pre-booking"
                          />
                          <span className="ap-switch-track" />
                        </label>
                      </div>
                    </div>
                  </div>

                  {formData.preBooking && (
                    <div className="ap-prebooking-note">
                      <div className="ap-prebooking-note-icon">
                        <Icon name="calendar" size={16} />
                      </div>
                      <div>
                        <strong>Pre-booking mode is ON</strong>
                      </div>
                    </div>
                  )}

                  <div className="ap-pricing-strip">
                    <div className="ap-price-stat">
                      <span>Price difference</span>
                      <strong>
                        ₹
                        {Math.max(
                          pricing.originalPrice - pricing.price,
                          0
                        ).toLocaleString("en-IN")}
                      </strong>
                    </div>

                    <div className="ap-price-stat">
                      <span>Discount</span>
                      <strong>{pricing.discount}%</strong>
                    </div>

                    <div className="ap-price-stat">
                      <span>Selling price</span>
                      <strong>
                        ₹{pricing.price.toLocaleString("en-IN")}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="ap-actions">
                  <button
                    type="button"
                    className="ap-btn ap-btn-secondary"
                    onClick={handleReset}
                    disabled={isLoading}
                  >
                    <Icon name="refresh" size={15} />
                    Reset
                  </button>

                  <button
                    type="button"
                    className="ap-btn ap-btn-secondary"
                    onClick={() => setTab(2)}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="ap-btn ap-btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="ap-loading-dot" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Icon name="check" size={16} />
                        Create product
                      </>
                    )}
                  </button>
                </div>
              </section>
            </div>

            {/* =================================================
                RIGHT
            ================================================= */}
            <div className="ap-right">
             

              {/* Live preview */}
              <section className="ap-card ap-preview-card">
                <div className="ap-card-header">
                  <div className="ap-card-title-wrap">
                    <div className="ap-section-icon">
                      <Icon name="eye" size={17} />
                    </div>
                    <div>
                      <h2 className="ap-card-title">Live preview</h2>
                      <p className="ap-card-description">
                        See how the listing will feel.
                      </p>
                    </div>
                  </div>
                  <span className="ap-section-badge">Preview</span>
                </div>

                <div className="ap-card-body">
                  <div className="ap-preview-stage">
                    <div className="ap-preview-image-wrap">
                      {formData.imageUrls[0] ? (
                        <img
                          key={formData.imageUrls[0]}
                          className="ap-preview-image"
                          src={formData.imageUrls[0]}
                          alt="Product preview"
                        />
                      ) : (
                        <div className="ap-preview-placeholder">
                          <div className="ap-section-icon">
                            <Icon name="image" size={22} />
                          </div>
                          <strong>Image preview</strong>
                          <span>Upload your main product image</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="ap-preview-info">
                    <div className="ap-preview-kicker">
                      {formData.category || "DARSH COLLECTION"}
                    </div>

                    <h3 className="ap-preview-name">
                      {formData.productName || "Product name"}
                    </h3>

                    <p className="ap-preview-description">
                      {formData.description ||
                        "Your product description will appear here."}
                    </p>

                    <div className="ap-preview-bottom">
                      <div>
                        <div className="ap-preview-price">
                          ₹
                          {(Number(formData.price) || 0).toLocaleString(
                            "en-IN"
                          )}
                        </div>

                        {formData.originalPrice && (
                          <div className="ap-preview-original">
                            ₹
                            {Number(formData.originalPrice).toLocaleString(
                              "en-IN"
                            )}
                          </div>
                        )}
                      </div>

                      <div className="ap-preview-badges">
                        {formData.blouseAvaliable === "yes" && (
                          <span className="ap-badge gold">
                            Blouse included
                          </span>
                        )}

                        {formData.hotSell && (
                          <span className="ap-badge gold">
                            Hot sell
                          </span>
                        )}

                        {formData.preBooking && (
                          <span className="ap-badge gold">
                            <Icon name="calendar" size={11} />
                            Pre-booking
                          </span>
                        )}

                        {formData.stock !== "" && (
                          <span className="ap-badge">
                            Stock {formData.stock}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </form>
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