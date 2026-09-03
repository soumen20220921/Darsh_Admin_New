
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Eye,
  Flame,
  ImageOff,
  IndianRupee,
  Package,
  Ruler,
  Shirt,
  Sparkles,
  Tag,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAppContext } from "../../context/Context";

const ViewProduct = ({
  product,
  onBack,
}) => {
  const { url } = useAppContext();

  /* =========================================================
     STATE
  ========================================================= */

  const [activeImage, setActiveImage] =
    useState(0);

  const [imageError, setImageError] =
    useState({});

  const [showImageViewer, setShowImageViewer] =
    useState(false);

  const [copied, setCopied] =
    useState(false);

  /* =========================================================
     PRODUCT IMAGES
  ========================================================= */

  const images = useMemo(() => {
    if (!product) return [];

    /*
      Main structure:
      product.images = [image, image1]
    */

    if (
      Array.isArray(product.images) &&
      product.images.length > 0
    ) {
      return product.images.filter(Boolean);
    }

    /*
      Backend fallback:
      image
      image1
    */

    return [
      product.image,
      product.image1,
    ].filter(Boolean);
  }, [product]);

  /* =========================================================
     IMAGE URL
  ========================================================= */

  const getImageUrl = (image) => {
    if (!image) return "";

    /*
      Already complete URL
    */

    if (
      typeof image === "string" &&
      (
        image.startsWith("http://") ||
        image.startsWith("https://")
      )
    ) {
      return image;
    }

    /*
      Backend object
    */

    if (
      typeof image === "object"
    ) {
      const imageName =
        image.url ||
        image.filename ||
        image.fileName ||
        image.name;

      if (!imageName) {
        return "";
      }

      if (
        imageName.startsWith("http://") ||
        imageName.startsWith("https://")
      ) {
        return imageName;
      }

      return `${url}/img/${imageName}`;
    }

    return `${url}/img/${image}`;
  };

  /* =========================================================
     CURRENT IMAGE
  ========================================================= */

  const currentImage =
    images[activeImage] || null;

  /* =========================================================
     DISCOUNT
  ========================================================= */

  const discount = useMemo(() => {
    const original =
      Number(
        product?.originalPrice
      ) || 0;

    const price =
      Number(
        product?.price
      ) || 0;

    if (
      original > 0 &&
      price > 0 &&
      original > price
    ) {
      return Math.round(
        (
          (original - price) /
          original
        ) * 100
      );
    }

    return 0;
  }, [
    product?.originalPrice,
    product?.price,
  ]);

  /* =========================================================
     SAVING
  ========================================================= */

  const saving = useMemo(() => {
    const original =
      Number(
        product?.originalPrice
      ) || 0;

    const price =
      Number(
        product?.price
      ) || 0;

    if (original > price) {
      return original - price;
    }

    return 0;
  }, [
    product?.originalPrice,
    product?.price,
  ]);

  /* =========================================================
     STOCK
  ========================================================= */

  const stock =
    Number(product?.stock) || 0;

  const isInStock =
    stock > 0;

  const isLowStock =
    stock > 0 &&
    stock <= 5;

  /* =========================================================
     HOT SELL
  ========================================================= */

  const isHotSell =
    product?.hotSell === true ||
    product?.hotSell === "true";

  /* =========================================================
     PRE-BOOKING
     Backend field: preBooking
     Supports boolean / string / numeric API values.
  ========================================================= */

  const isPreBooking =
    product?.preBooking === true ||
    product?.preBooking === "true" ||
    product?.preBooking === 1 ||
    product?.preBooking === "1" ||
    String(product?.preBooking || "")
      .trim()
      .toLowerCase() === "yes";

  /* =========================================================
     BLOUSE
  ========================================================= */
  
/* =========================================================
   BLOUSE AVAILABILITY
   Backend field is: blouseAvaliable
   Supported values:
   yes / no
   Yes / No
   true / false
   ========================================================= */

const blouseRaw =
  product?.blouseAvaliable ??
  product?.blouseAvailable ??
  product?.blouse_available ??
  "";

const blouseStatus = useMemo(() => {
  if (
    blouseRaw === true ||
    String(blouseRaw)
      .trim()
      .toLowerCase() === "true" ||
    String(blouseRaw)
      .trim()
      .toLowerCase() === "yes" ||
    String(blouseRaw)
      .trim()
      .toLowerCase() === "available"
  ) {
    return "available";
  }

  if (
    blouseRaw === false ||
    String(blouseRaw)
      .trim()
      .toLowerCase() === "false" ||
    String(blouseRaw)
      .trim()
      .toLowerCase() === "no" ||
    String(blouseRaw)
      .trim()
      .toLowerCase() === "not available" ||
    String(blouseRaw)
      .trim()
      .toLowerCase() === "unavailable"
  ) {
    return "not_available";
  }

  return "unknown";
}, [blouseRaw]);

  /* =========================================================
     PRODUCT CODE
  ========================================================= */

  const productCode =
    product?.sku ||
    product?.productCode ||
    product?._id ||
    "";

  /* =========================================================
     PRICE FORMAT
  ========================================================= */

  const formatPrice = (value) => {
    return Number(
      value || 0
    ).toLocaleString("en-IN");
  };

  /* =========================================================
     IMAGE CHANGE
  ========================================================= */

  const changeImage = (index) => {
    if (
      index < 0 ||
      index >= images.length
    ) {
      return;
    }

    setActiveImage(index);
  };

  /* =========================================================
     NEXT IMAGE
  ========================================================= */

  const nextImage = () => {
    if (images.length <= 1) {
      return;
    }

    setActiveImage(
      (prev) =>
        (prev + 1) %
        images.length
    );
  };

  /* =========================================================
     PREVIOUS IMAGE
  ========================================================= */

  const previousImage = () => {
    if (images.length <= 1) {
      return;
    }

    setActiveImage(
      (prev) =>
        (
          prev -
          1 +
          images.length
        ) % images.length
    );
  };

  /* =========================================================
     KEYBOARD NAVIGATION
  ========================================================= */

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!showImageViewer) {
        return;
      }

      if (event.key === "Escape") {
        setShowImageViewer(false);
      }

      if (event.key === "ArrowRight") {
        nextImage();
      }

      if (event.key === "ArrowLeft") {
        previousImage();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    showImageViewer,
    images.length,
  ]);

  /* =========================================================
     COPY PRODUCT CODE
  ========================================================= */

  const handleCopy = async () => {
    if (!productCode) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        String(productCode)
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch (error) {
      console.error(
        "Copy failed:",
        error
      );
    }
  };

  /* =========================================================
     IMAGE ERROR
  ========================================================= */

  const handleImageError = (index) => {
    setImageError((prev) => ({
      ...prev,
      [index]: true,
    }));
  };

  /* =========================================================
     PRODUCT NOT FOUND
  ========================================================= */

  if (!product) {
    return (
      <div className="vp-empty-page">

        <div className="vp-empty-card">

          <div className="vp-empty-icon">
            <Package size={30} />
          </div>

          <h2>
            Product not found
          </h2>

          <p>
            The product you're trying
            to view is unavailable.
          </p>

          <button
            type="button"
            onClick={onBack}
            className="vp-back-button"
          >
            <ArrowLeft size={16} />
            Back to Products
          </button>

        </div>

        <style>{emptyStyles}</style>
      </div>
    );
  }

  return (
    <div className="view-product-page">

      <style>{styles}</style>

      <div className="vp-container">

        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="vp-header">

          <div className="vp-header-left">

            <button
              type="button"
              onClick={onBack}
              className="vp-back"
              title="Go back"
            >
              <ArrowLeft size={18} />
            </button>

            <div className="vp-title-wrap">

              <div className="vp-title-row">

                <h1 className="vp-title">
                  {product.productName}
                </h1>

                {isHotSell && (
                  <span className="vp-hot-badge">
                    <Flame size={12} />
                    Hot Sell
                  </span>
                )}

                {isPreBooking && (
                  <span className="vp-prebooking-badge">
                    <CalendarClock size={12} />
                    Pre-Booking
                  </span>
                )}

              </div>

              <div className="vp-subtitle">

                <span>
                  Product overview
                </span>

                {productCode && (
                  <>
                    <span className="vp-dot">
                      •
                    </span>

                    <span className="vp-product-id">

                      ID:
                      {String(
                        productCode
                      ).slice(-14)}

                      <button
                        type="button"
                        className="vp-copy"
                        onClick={handleCopy}
                        title="Copy product ID"
                      >
                        {copied ? (
                          <CheckCircle2
                            size={11}
                          />
                        ) : (
                          <Copy
                            size={11}
                          />
                        )}
                      </button>

                      {copied && (
                        <span className="vp-copied">
                          Copied
                        </span>
                      )}

                    </span>
                  </>
                )}

              </div>

            </div>
          </div>

          <div className="vp-view-label">
            <Eye size={14} />
            Product Preview
          </div>

        </div>

        {/* ===================================================
            MAIN CARD
        =================================================== */}

        <div className="vp-main-card">

          <div className="vp-main-grid">

            {/* =================================================
                GALLERY
            ================================================= */}

            <div className="vp-gallery">

              <div className="vp-gallery-heading">

                <div>
                  <span>
                    PRODUCT IMAGES
                  </span>

                  <strong>
                    Gallery
                  </strong>
                </div>

                <div className="vp-gallery-count">
                  {images.length > 0
                    ? `${activeImage + 1}/${images.length}`
                    : "0"}
                </div>

              </div>

              <div
                className="vp-main-image-wrap"
                onClick={() => {
                  if (
                    currentImage &&
                    !imageError[
                      activeImage
                    ]
                  ) {
                    setShowImageViewer(
                      true
                    );
                  }
                }}
              >

                <div className="vp-image-counter">

                  <ImageOff
                    size={10}
                    style={{
                      display:
                        currentImage
                          ? "none"
                          : "block",
                    }}
                  />

                  {images.length > 0
                    ? `${activeImage + 1} / ${images.length}`
                    : "No image"}

                </div>

                {currentImage &&
                !imageError[
                  activeImage
                ] ? (
                  <img
                    src={getImageUrl(
                      currentImage
                    )}
                    alt={
                      product.productName
                    }
                    className="vp-main-image"
                    onError={() =>
                      handleImageError(
                        activeImage
                      )
                    }
                  />
                ) : (
                  <div className="vp-no-image">

                    <div className="vp-no-image-icon">
                      <ImageOff
                        size={24}
                      />
                    </div>

                    <span>
                      Product image
                      unavailable
                    </span>

                  </div>
                )}

                {/* ZOOM */}

                {currentImage &&
                  !imageError[
                    activeImage
                  ] && (
                    <button
                      type="button"
                      className="vp-zoom-button"
                      onClick={(event) => {
                        event.stopPropagation();

                        setShowImageViewer(
                          true
                        );
                      }}
                      title="View image"
                    >
                      <Eye size={15} />
                    </button>
                  )}

                {/* PREVIOUS */}

                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      className="vp-image-arrow left"
                      onClick={(event) => {
                        event.stopPropagation();
                        previousImage();
                      }}
                    >
                      <ChevronLeft
                        size={18}
                      />
                    </button>

                    <button
                      type="button"
                      className="vp-image-arrow right"
                      onClick={(event) => {
                        event.stopPropagation();
                        nextImage();
                      }}
                    >
                      <ChevronRight
                        size={18}
                      />
                    </button>
                  </>
                )}

              </div>

              {/* THUMBNAILS */}

              {images.length > 0 && (
                <div className="vp-thumbnails">

                  {images.map(
                    (image, index) => (
                      <button
                        key={`${image}-${index}`}
                        type="button"
                        className={`vp-thumbnail ${
                          activeImage === index
                            ? "active"
                            : ""
                        }`}
                        onClick={() =>
                          changeImage(index)
                        }
                      >

                        {!imageError[
                          index
                        ] ? (
                          <img
                            src={getImageUrl(
                              image
                            )}
                            alt={`${product.productName} thumbnail ${
                              index + 1
                            }`}
                            onError={() =>
                              handleImageError(
                                index
                              )
                            }
                          />
                        ) : (
                          <div className="vp-thumbnail-error">
                            <ImageOff
                              size={16}
                            />
                          </div>
                        )}

                        <span className="vp-thumbnail-number">
                          {index + 1}
                        </span>

                      </button>
                    )
                  )}

                </div>
              )}

            </div>

            {/* =================================================
                DETAILS
            ================================================= */}

            <div className="vp-details">

              {/* PRODUCT INTRO */}

              <div className="vp-product-intro">

                <div className="vp-category-label">
                  <Tag size={12} />

                  {product.category ||
                    "Product"}
                </div>

                <h2 className="vp-product-name">
                  {product.productName}
                </h2>

                {product.description && (
                  <p className="vp-description-short">
                    {product.description}
                  </p>
                )}

              </div>

              {/* PRICE */}

              <div className="vp-price-box">

                <div className="vp-price-top">

                  <div>

                    <div className="vp-price-label">
                      SELLING PRICE
                    </div>

                    <div className="vp-price-row">

                      <span className="vp-current-price">
                        ₹
                        {formatPrice(
                          product.price
                        )}
                      </span>

                      {product.originalPrice &&
                        Number(
                          product.originalPrice
                        ) >
                          Number(
                            product.price
                          ) && (
                          <span className="vp-original-price">
                            ₹
                            {formatPrice(
                              product.originalPrice
                            )}
                          </span>
                        )}

                      {discount > 0 && (
                        <span className="vp-discount">
                          {discount}% OFF
                        </span>
                      )}

                    </div>

                    {saving > 0 && (
                      <div className="vp-saving">
                        ↑ Save ₹
                        {formatPrice(
                          saving
                        )}
                      </div>
                    )}

                  </div>

                  <div className="vp-price-icon">
                    <IndianRupee
                      size={19}
                    />
                  </div>

                </div>

              </div>

              {/* INFO */}

              <div>

                <div className="vp-section-heading">
                  <span>
                    Product Information
                  </span>
                </div>

                <div className="vp-info-grid">

                  {/* CATEGORY */}

                  <div className="vp-info-card">

                    <div className="vp-info-top">

                      <div className="vp-info-icon">
                        <Tag
                          size={13}
                        />
                      </div>

                      <span className="vp-info-label">
                        Category
                      </span>

                    </div>

                    <p className="vp-info-value">
                      {product.category ||
                        "N/A"}
                    </p>

                  </div>

                  {/* SIZE */}

                  <div className="vp-info-card">

                    <div className="vp-info-top">

                      <div className="vp-info-icon">
                        <Ruler
                          size={13}
                        />
                      </div>

                      <span className="vp-info-label">
                        Size
                      </span>

                    </div>

                    <p className="vp-info-value">
                      {product.size ||
                        "N/A"}
                    </p>

                  </div>

                  {/* COLOR */}

                  <div className="vp-info-card">

                    <div className="vp-info-top">

                      <div className="vp-info-icon gold">
                        <Sparkles
                          size={13}
                        />
                      </div>

                      <span className="vp-info-label">
                        Colour
                      </span>

                    </div>

                    <p className="vp-info-value">
                      {product.color ||
                        "N/A"}
                    </p>

                  </div>

                  {/* BLOUSE */}

                 {/* BLOUSE */}

<div className="vp-info-card">

  <div className="vp-info-top">

    <div
      className={`vp-info-icon ${
        blouseStatus === "available"
          ? "blouse-available"
          : blouseStatus === "not_available"
          ? "blouse-not-available"
          : ""
      }`}
    >
      <Shirt size={13} />
    </div>

    <span className="vp-info-label">
      Blouse
    </span>

  </div>

  <p
    className={`vp-info-value ${
      blouseStatus === "available"
        ? "success-text"
        : blouseStatus === "not_available"
        ? "danger-text"
        : ""
    }`}
  >
    {blouseStatus === "available"
      ? "Available"
      : blouseStatus === "not_available"
      ? "Not Available"
      : "N/A"}
  </p>

</div>

                </div>

              </div>

              {/* PRE-BOOKING */}

              {isPreBooking && (
                <div className="vp-prebooking-card">
                  <div className="vp-prebooking-left">
                    <div className="vp-prebooking-icon">
                      <CalendarClock size={18} />
                    </div>

                    <div className="vp-prebooking-content">
                      <div className="vp-prebooking-eyebrow">
                        ADVANCE ORDER
                      </div>

                      <div className="vp-prebooking-title">
                        Pre-booking is active
                      </div>

                      <div className="vp-prebooking-description">
                        Customers can reserve this product before regular stock is available.
                      </div>
                    </div>
                  </div>

                  <span className="vp-prebooking-status">
                    <span className="vp-prebooking-status-dot" />
                    Accepting
                  </span>
                </div>
              )}

              {/* STOCK */}

              <div className="vp-stock-card">

                <div className="vp-stock-left">

                  <div
                    className={`vp-stock-icon ${
                      !isInStock
                        ? "empty"
                        : isLowStock
                        ? "low"
                        : ""
                    }`}
                  >
                    <Package
                      size={18}
                    />
                  </div>

                  <div>

                    <p className="vp-stock-label">
                      INVENTORY
                    </p>

                    <p className="vp-stock-value">
                      {stock}{" "}
                      {stock === 1
                        ? "unit"
                        : "units"}{" "}
                      available
                      {isPreBooking && stock <= 0
                        ? " • Pre-booking open"
                        : ""}
                    </p>

                  </div>

                </div>

                <span
                  className={`vp-status ${
                    !isInStock && isPreBooking
                      ? "prebook"
                      : !isInStock
                      ? "out"
                      : isLowStock
                      ? "low"
                      : "active"
                  }`}
                >
                  <span className="vp-status-dot" />

                  {!isInStock && isPreBooking
                    ? "Pre-Booking"
                    : !isInStock
                    ? "Out of Stock"
                    : isLowStock
                    ? "Low Stock"
                    : "In Stock"}
                </span>

              </div>

              {/* DESCRIPTION */}

              {product.description && (
                <div className="vp-section">

                  <h3 className="vp-section-title">

                    <Sparkles
                      size={14}
                      className="vp-section-title-icon"
                    />

                    Product Description

                  </h3>

                  <p className="vp-description">
                    {product.description}
                  </p>

                </div>
              )}

              {/* SPECIFICATION */}

              {product.specification && (
                <div className="vp-section">

                  <h3 className="vp-section-title">

                    <CheckCircle2
                      size={14}
                      className="vp-section-title-icon"
                    />

                    Specifications

                  </h3>

                  <div className="vp-specification">
                    {product.specification}
                  </div>

                </div>
              )}

            </div>

          </div>

        </div>

      </div>

      {/* =====================================================
          FULLSCREEN IMAGE VIEWER
      ===================================================== */}

      {showImageViewer &&
        currentImage &&
        !imageError[
          activeImage
        ] && (
          <div
            className="vp-lightbox"
            onClick={() =>
              setShowImageViewer(false)
            }
          >

            <button
              type="button"
              className="vp-lightbox-close"
              onClick={() =>
                setShowImageViewer(
                  false
                )
              }
            >
              <X size={19} />
            </button>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  className="vp-lightbox-arrow left"
                  onClick={(event) => {
                    event.stopPropagation();
                    previousImage();
                  }}
                >
                  <ChevronLeft
                    size={22}
                  />
                </button>

                <button
                  type="button"
                  className="vp-lightbox-arrow right"
                  onClick={(event) => {
                    event.stopPropagation();
                    nextImage();
                  }}
                >
                  <ChevronRight
                    size={22}
                  />
                </button>
              </>
            )}

            <img
              src={getImageUrl(
                currentImage
              )}
              alt={
                product.productName
              }
              className="vp-lightbox-image"
              onClick={(event) =>
                event.stopPropagation()
              }
            />

            <div className="vp-lightbox-count">
              {activeImage + 1} /{" "}
              {images.length}
            </div>

          </div>
        )}

    </div>
  );
};

/* =========================================================
   DARK ANALYTICS THEME
========================================================= */

const styles = `

  /* =====================================================
     BASE
  ===================================================== */

  .view-product-page {
    width: 100%;
    min-height: 100vh;

    padding:
      20px
      18px
      50px;

    background:
      radial-gradient(
        circle at 0% 0%,
        rgba(245,158,11,.035),
        transparent 25%
      ),
      radial-gradient(
        circle at 100% 10%,
        rgba(245,158,11,.025),
        transparent 25%
      ),
      #0b0b0b;

    color: #f8fafc;

    animation:
      vpPageIn .45s ease;
  }

  .vp-container {
    width: 100%;
    max-width: 1240px;
    margin: 0 auto;
  }

  /* =====================================================
     HEADER
  ===================================================== */

  .vp-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    gap: 18px;

    margin-bottom: 20px;

    animation:
      vpSlideDown .5s ease;
  }

  .vp-header-left {
    min-width: 0;

    display: flex;
    align-items: center;

    gap: 12px;
  }

  .vp-back {
    width: 41px;
    height: 41px;

    flex-shrink: 0;

    display: flex;
    align-items: center;
    justify-content: center;

    border:
      1px solid #2b2b2b;

    border-radius: 10px;

    background: #171717;

    color: #a3a3a3;

    cursor: pointer;

    box-shadow:
      0 6px 18px
      rgba(0,0,0,.18);

    transition:
      .25s ease;
  }

  .vp-back:hover {
    color: #fbbf24;

    border-color:
      #514114;

    background:
      #211d13;

    transform:
      translateX(-3px);
  }

  .vp-title-wrap {
    min-width: 0;
  }

  .vp-title-row {
    display: flex;
    align-items: center;

    flex-wrap: wrap;

    gap: 9px;
  }

  .vp-title {
    margin: 0;

    color: #f8fafc;

    font-size:
      clamp(
        23px,
        3vw,
        31px
      );

    font-weight: 800;

    line-height: 1.15;

    letter-spacing: -.6px;

    overflow-wrap: anywhere;
  }

  .vp-subtitle {
    display: flex;
    align-items: center;

    flex-wrap: wrap;

    gap: 7px;

    margin-top: 5px;

    color: #737373;

    font-size: 10px;
  }

  .vp-dot {
    color: #525252;
  }

  .vp-product-id {
    display: inline-flex;
    align-items: center;

    gap: 4px;

    padding:
      3px 6px;

    border:
      1px solid #2b2b2b;

    border-radius: 5px;

    background: #151515;

    color: #737373;

    font-family: monospace;

    font-size: 9px;
  }

  .vp-copy {
    width: 21px;
    height: 20px;

    display: flex;
    align-items: center;
    justify-content: center;

    border: 0;

    border-radius: 5px;

    background: transparent;

    color: #737373;

    cursor: pointer;

    transition: .2s ease;
  }

  .vp-copy:hover {
    background: #29220e;

    color: #fbbf24;
  }

  .vp-copied {
    color: #22c55e;

    font-size: 9px;

    font-weight: 700;
  }

  /* =====================================================
     HOT SELL
  ===================================================== */

  .vp-hot-badge {
    display: inline-flex;
    align-items: center;

    gap: 5px;

    padding:
      5px 9px;

    border:
      1px solid #55400d;

    border-radius: 999px;

    background:
      #29220e;

    color: #fbbf24;

    font-size: 9px;

    font-weight: 800;

    box-shadow:
      0 5px 15px
      rgba(245,158,11,.06);

    animation:
      vpHotPulse 2.2s infinite;
  }

  /* =====================================================
     PRE-BOOKING
  ===================================================== */

  .vp-prebooking-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 9px;
    border: 1px solid #284b45;
    border-radius: 999px;
    background: #142522;
    color: #5eead4;
    font-size: 9px;
    font-weight: 800;
    box-shadow: 0 5px 15px rgba(45,212,191,.05);
  }

  .vp-prebooking-card {
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px;
    border: 1px solid #284b45;
    border-radius: 10px;
    background:
      linear-gradient(
        135deg,
        rgba(20, 45, 40, .92),
        #181b1a
      );
    box-shadow:
      inset 0 0 0 1px rgba(94,234,212,.015),
      0 8px 24px rgba(0,0,0,.12);
  }

  .vp-prebooking-card::after {
    content: "";
    position: absolute;
    width: 95px;
    height: 95px;
    right: -45px;
    top: -50px;
    border-radius: 50%;
    background: rgba(94,234,212,.045);
    pointer-events: none;
  }

  .vp-prebooking-left {
    position: relative;
    z-index: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .vp-prebooking-icon {
    width: 38px;
    height: 38px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #2f5e55;
    border-radius: 9px;
    background: #17312c;
    color: #5eead4;
  }

  .vp-prebooking-content {
    min-width: 0;
  }

  .vp-prebooking-eyebrow {
    color: #5eead4;
    font-size: 7px;
    font-weight: 800;
    letter-spacing: .55px;
  }

  .vp-prebooking-title {
    margin-top: 2px;
    color: #e7f9f5;
    font-size: 11px;
    font-weight: 800;
  }

  .vp-prebooking-description {
    max-width: 370px;
    margin-top: 3px;
    color: #7fa39b;
    font-size: 8px;
    line-height: 1.55;
  }

  .vp-prebooking-status {
    position: relative;
    z-index: 1;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 8px;
    border-radius: 999px;
    background: #17312c;
    color: #5eead4;
    font-size: 8px;
    font-weight: 750;
  }

  .vp-prebooking-status-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: currentColor;
    box-shadow: 0 0 8px rgba(94,234,212,.55);
    animation: vpPrebookPulse 1.8s infinite;
  }

  .vp-view-label {
    display: inline-flex;
    align-items: center;

    gap: 6px;

    padding:
      8px 10px;

    border:
      1px solid #2b2b2b;

    border-radius: 8px;

    background: #171717;

    color: #737373;

    font-size: 9px;

    font-weight: 600;
  }

  /* =====================================================
     MAIN CARD
  ===================================================== */

  .vp-main-card {
    position: relative;

    overflow: hidden;

    background:
      #171717;

    border:
      1px solid #2b2b2b;

    border-radius: 16px;

    box-shadow:
      0 20px 55px
      rgba(0,0,0,.30);

    animation:
      vpCardIn .55s ease;
  }

  .vp-main-card::before {
    content: "";

    position: absolute;

    top: 0;
    left: 0;
    right: 0;

    height: 2px;

    background:
      linear-gradient(
        90deg,
        #b77900,
        #f59e0b,
        #d89a17
      );
  }

  .vp-main-grid {
    display: grid;

    grid-template-columns:
      minmax(0, 1fr)
      minmax(0, 1fr);

    gap: 0;
  }

  /* =====================================================
     GALLERY
  ===================================================== */

  .vp-gallery {
    min-width: 0;

    padding: 23px;

    border-right:
      1px solid #292929;

    background:
      #151515;
  }

  .vp-gallery-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;

    margin-bottom: 12px;
  }

  .vp-gallery-heading span {
    display: block;

    color: #737373;

    font-size: 8px;

    font-weight: 700;

    letter-spacing: .65px;
  }

  .vp-gallery-heading strong {
    display: block;

    margin-top: 3px;

    color: #e5e5e5;

    font-size: 13px;

    font-weight: 750;
  }

  .vp-gallery-count {
    padding:
      5px 8px;

    border:
      1px solid #4b3a0d;

    border-radius: 6px;

    background: #211d13;

    color: #fbbf24;

    font-size: 8px;

    font-weight: 800;
  }

  /* =====================================================
     MAIN IMAGE
  ===================================================== */

  .vp-main-image-wrap {
    position: relative;

    width: 100%;

    aspect-ratio: 1 / 1;

    overflow: hidden;

    display: flex;
    align-items: center;
    justify-content: center;

    border:
      1px solid #303030;

    border-radius: 13px;

    background:
      radial-gradient(
        circle at center,
        #222222,
        #141414
      );

    cursor: zoom-in;

    box-shadow:
      inset 0 0 45px
      rgba(0,0,0,.28);

    transition:
      .3s ease;
  }

  .vp-main-image-wrap:hover {
    border-color:
      #55440f;

    box-shadow:
      inset 0 0 45px
      rgba(0,0,0,.35),
      0 12px 35px
      rgba(0,0,0,.22);
  }

  .vp-main-image {
    width: 100%;
    height: 100%;

    display: block;

    object-fit: contain;

    padding: 20px;

    transition:
      transform .5s
      cubic-bezier(.2,.8,.2,1);
  }

  .vp-main-image-wrap:hover
  .vp-main-image {
    transform:
      scale(1.025);
  }

  /* =====================================================
     IMAGE COUNTER
  ===================================================== */

  .vp-image-counter {
    position: absolute;

    top: 10px;
    left: 10px;

    z-index: 2;

    display: inline-flex;
    align-items: center;

    gap: 5px;

    padding:
      5px 8px;

    border:
      1px solid #333333;

    border-radius: 999px;

    background:
      rgba(23,23,23,.92);

    color: #a3a3a3;

    font-size: 8px;

    font-weight: 700;

    backdrop-filter:
      blur(8px);
  }

  /* =====================================================
     ZOOM
  ===================================================== */

  .vp-zoom-button {
    position: absolute;

    right: 10px;
    top: 10px;

    width: 32px;
    height: 32px;

    display: flex;
    align-items: center;
    justify-content: center;

    border:
      1px solid #333333;

    border-radius: 8px;

    background:
      rgba(23,23,23,.92);

    color: #a3a3a3;

    cursor: pointer;

    opacity: 0;

    transform:
      translateY(-4px);

    transition:
      .25s ease;
  }

  .vp-main-image-wrap:hover
  .vp-zoom-button {
    opacity: 1;

    transform:
      translateY(0);
  }

  .vp-zoom-button:hover {
    color: #fbbf24;

    border-color:
      #55440f;

    background:
      #211d13;
  }

  /* =====================================================
     IMAGE ARROWS
  ===================================================== */

  .vp-image-arrow {
    position: absolute;

    top: 50%;

    width: 33px;
    height: 33px;

    display: flex;
    align-items: center;
    justify-content: center;

    border:
      1px solid #333333;

    border-radius: 50%;

    background:
      rgba(23,23,23,.94);

    color: #a3a3a3;

    cursor: pointer;

    opacity: 0;

    transform:
      translateY(-50%);

    box-shadow:
      0 6px 15px
      rgba(0,0,0,.3);

    transition:
      .25s ease;
  }

  .vp-main-image-wrap:hover
  .vp-image-arrow {
    opacity: 1;
  }

  .vp-image-arrow:hover {
    color: #fbbf24;

    border-color:
      #55440f;

    background:
      #29220e;
  }

  .vp-image-arrow.left {
    left: 10px;
  }

  .vp-image-arrow.right {
    right: 10px;
  }

  /* =====================================================
     NO IMAGE
  ===================================================== */

  .vp-no-image {
    display: flex;
    flex-direction: column;

    align-items: center;
    justify-content: center;

    gap: 8px;

    color: #666666;

    font-size: 10px;
  }

  .vp-no-image-icon {
    width: 53px;
    height: 53px;

    display: flex;
    align-items: center;
    justify-content: center;

    border:
      1px solid #303030;

    border-radius: 13px;

    background: #1d1d1d;

    color: #737373;
  }

  /* =====================================================
     THUMBNAILS
  ===================================================== */

  .vp-thumbnails {
    display: flex;
    align-items: center;

    gap: 9px;

    margin-top: 11px;

    overflow-x: auto;

    padding:
      2px
      1px
      6px;

    scrollbar-width: thin;

    scrollbar-color:
      #3f3f3f
      transparent;
  }

  .vp-thumbnail {
    position: relative;

    width: 62px;
    height: 62px;

    flex:
      0 0 62px;

    padding: 2px;

    overflow: hidden;

    border:
      2px solid
      transparent;

    border-radius: 9px;

    background: #202020;

    cursor: pointer;

    transition:
      .25s ease;
  }

  .vp-thumbnail:hover {
    border-color:
      #555555;

    transform:
      translateY(-2px);
  }

  .vp-thumbnail.active {
    border-color:
      #f59e0b;

    box-shadow:
      0 0 0 3px
      rgba(245,158,11,.10);
  }

  .vp-thumbnail img {
    width: 100%;
    height: 100%;

    object-fit: cover;

    border-radius: 6px;
  }

  .vp-thumbnail-number {
    position: absolute;

    left: 4px;
    bottom: 4px;

    min-width: 16px;
    height: 16px;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 4px;

    background:
      rgba(0,0,0,.78);

    color: #f5f5f5;

    font-size: 7px;

    font-weight: 700;
  }

  .vp-thumbnail-error {
    width: 100%;
    height: 100%;

    display: flex;
    align-items: center;
    justify-content: center;

    color: #666666;
  }

  /* =====================================================
     DETAILS
  ===================================================== */

  .vp-details {
    min-width: 0;

    padding: 25px;

    display: flex;
    flex-direction: column;

    gap: 17px;

    background: #171717;
  }

  /* =====================================================
     PRODUCT INTRO
  ===================================================== */

  .vp-product-intro {
    padding-bottom: 17px;

    border-bottom:
      1px solid #2b2b2b;
  }

  .vp-category-label {
    display: inline-flex;
    align-items: center;

    gap: 5px;

    margin-bottom: 7px;

    color: #f59e0b;

    font-size: 9px;

    font-weight: 750;

    text-transform:
      uppercase;

    letter-spacing: .6px;
  }

  .vp-product-name {
    margin: 0;

    color: #f5f5f5;

    font-size:
      clamp(
        22px,
        3vw,
        29px
      );

    font-weight: 800;

    line-height: 1.2;

    overflow-wrap:
      anywhere;
  }

  .vp-description-short {
    margin:
      8px 0 0;

    color: #858585;

    font-size: 10px;

    line-height: 1.7;

    display: -webkit-box;

    -webkit-line-clamp: 3;

    -webkit-box-orient:
      vertical;

    overflow: hidden;
  }

  /* =====================================================
     PRICE
  ===================================================== */

  .vp-price-box {
    position: relative;

    overflow: hidden;

    padding: 15px;

    border:
      1px solid #3a321d;

    border-radius: 11px;

    background:
      linear-gradient(
        135deg,
        #1d1b16,
        #181818
      );
  }

  .vp-price-box::after {
    content: "";

    position: absolute;

    width: 100px;
    height: 100px;

    right: -45px;
    top: -50px;

    border-radius: 50%;

    background:
      rgba(245,158,11,.045);
  }

  .vp-price-top {
    position: relative;

    z-index: 1;

    display: flex;
    align-items: center;
    justify-content: space-between;

    gap: 12px;
  }

  .vp-price-label {
    color: #737373;

    font-size: 8px;

    font-weight: 700;

    text-transform:
      uppercase;

    letter-spacing: .5px;
  }

  .vp-price-row {
    display: flex;
    align-items: baseline;

    flex-wrap: wrap;

    gap: 8px;

    margin-top: 2px;
  }

  .vp-current-price {
    color: #f8fafc;

    font-size: 27px;

    font-weight: 800;
  }

  .vp-original-price {
    color: #666666;

    font-size: 11px;

    text-decoration:
      line-through;
  }

  .vp-discount {
    display: inline-flex;
    align-items: center;

    padding:
      4px 6px;

    border-radius: 5px;

    background:
      #1c3a27;

    color: #4ade80;

    font-size: 8px;

    font-weight: 800;
  }

  .vp-saving {
    margin-top: 4px;

    color: #22c55e;

    font-size: 9px;

    font-weight: 650;
  }

  .vp-price-icon {
    width: 38px;
    height: 38px;

    flex-shrink: 0;

    display: flex;
    align-items: center;
    justify-content: center;

    border:
      1px solid #4b3a0d;

    border-radius: 9px;

    background:
      #29220e;

    color: #f59e0b;
  }

  /* =====================================================
     SECTION HEADING
  ===================================================== */

  .vp-section-heading {
    margin-bottom: 8px;
  }

  .vp-section-heading span {
    color: #d4d4d4;

    font-size: 11px;

    font-weight: 750;
  }

  /* =====================================================
     INFO GRID
  ===================================================== */

  .vp-info-grid {
    display: grid;

    grid-template-columns:
      repeat(
        2,
        minmax(0,1fr)
      );

    gap: 8px;
  }

  .vp-info-card {
    min-width: 0;

    padding: 10px;

    border:
      1px solid #2b2b2b;

    border-radius: 9px;

    background:
      #191919;

    transition:
      .25s ease;
  }

  .vp-info-card:hover {
    border-color:
      #4a3b16;

    background:
      #1c1c1c;

    transform:
      translateY(-2px);

    box-shadow:
      0 8px 20px
      rgba(0,0,0,.16);
  }

  .vp-info-top {
    display: flex;
    align-items: center;

    gap: 6px;

    margin-bottom: 5px;
  }

  .vp-info-icon {
    width: 26px;
    height: 26px;

    display: flex;
    align-items: center;
    justify-content: center;

    border:
      1px solid #3b321c;

    border-radius: 6px;

    background:
      #211d13;

    color: #f59e0b;
  }

  .vp-info-icon.gold {
    background:
      #29220e;

    border-color:
      #514114;

    color: #fbbf24;
  }

  .vp-info-icon.pink {
    background:
      #261b20;

    border-color:
      #4a2835;

    color: #f472b6;
  }

  .vp-info-label {
    color: #666666;

    font-size: 8px;

    font-weight: 650;

    text-transform:
      uppercase;

    letter-spacing: .4px;
  }

  .vp-info-value {
    margin: 0;

    color: #e5e5e5;

    font-size: 10px;

    font-weight: 700;

    overflow-wrap:
      anywhere;
  }

  .success-text {
    color: #4ade80 !important;
  }

  .danger-text {
    color: #f87171 !important;
  }

  /* =====================================================
     STOCK
  ===================================================== */

  .vp-stock-card {
    display: flex;
    align-items: center;

    justify-content:
      space-between;

    gap: 12px;

    padding: 11px;

    border:
      1px solid #2b2b2b;

    border-radius: 9px;

    background:
      #191919;
  }

  .vp-stock-left {
    display: flex;
    align-items: center;

    gap: 9px;
  }

  .vp-stock-icon {
    width: 35px;
    height: 35px;

    display: flex;
    align-items: center;
    justify-content: center;

    border:
      1px solid #244b32;

    border-radius: 8px;

    background:
      #16271c;

    color: #4ade80;
  }

  .vp-stock-icon.low {
    border-color:
      #4b3515;

    background:
      #291f12;

    color: #fb923c;
  }

  .vp-stock-icon.empty {
    border-color:
      #4b2727;

    background:
      #281717;

    color: #f87171;
  }

  .vp-stock-label {
    margin: 0;

    color: #666666;

    font-size: 7px;

    text-transform:
      uppercase;

    font-weight: 700;

    letter-spacing: .4px;
  }

  .vp-stock-value {
    margin:
      2px 0 0;

    color: #e5e5e5;

    font-size: 11px;

    font-weight: 750;
  }

  .vp-status {
    display: inline-flex;
    align-items: center;

    gap: 5px;

    padding:
      5px 8px;

    border-radius: 999px;

    font-size: 8px;

    font-weight: 750;
  }

  .vp-status-dot {
    width: 5px;
    height: 5px;

    border-radius: 50%;

    background:
      currentColor;
  }

  .vp-status.active {
    background:
      #17321f;

    color: #4ade80;
  }

  .vp-status.low {
    background:
      #332314;

    color: #fb923c;
  }

  .vp-status.out {
    background:
      #351919;

    color: #f87171;
  }

  .vp-status.prebook {
    background: #17312c;
    color: #5eead4;
  }

  /* =====================================================
     DESCRIPTION
  ===================================================== */

  .vp-section {
    padding-top: 1px;
  }

  .vp-section-title {
    display: flex;
    align-items: center;

    gap: 7px;

    margin:
      0 0 7px;

    color: #d4d4d4;

    font-size: 11px;

    font-weight: 750;
  }

  .vp-section-title-icon {
    color: #f59e0b;
  }

  .vp-description {
    margin: 0;

    color: #858585;

    font-size: 9px;

    line-height: 1.8;

    white-space:
      pre-line;
  }

  /* =====================================================
     SPECIFICATION
  ===================================================== */

  .vp-specification {
    padding: 11px;

    border:
      1px solid #2b2b2b;

    border-radius: 8px;

    background:
      #191919;

    color: #858585;

    font-size: 9px;

    line-height: 1.8;

    white-space:
      pre-line;
  }

  /* =====================================================
     LIGHTBOX
  ===================================================== */

  .vp-lightbox {
    position: fixed;

    inset: 0;

    z-index: 9999;

    display: flex;
    align-items: center;
    justify-content: center;

    padding: 25px;

    background:
      rgba(0,0,0,.91);

    backdrop-filter:
      blur(10px);

    animation:
      vpFadeIn .2s ease;
  }

  .vp-lightbox-image {
    max-width:
      min(90vw, 1000px);

    max-height: 85vh;

    object-fit: contain;

    border:
      1px solid #303030;

    border-radius: 10px;

    box-shadow:
      0 30px 90px
      rgba(0,0,0,.65);

    animation:
      vpZoomIn .25s ease;
  }

  .vp-lightbox-close {
    position: fixed;

    top: 17px;
    right: 17px;

    width: 40px;
    height: 40px;

    display: flex;
    align-items: center;
    justify-content: center;

    border:
      1px solid #393939;

    border-radius: 9px;

    background:
      #181818;

    color: #a3a3a3;

    cursor: pointer;

    transition: .2s ease;
  }

  .vp-lightbox-close:hover {
    color: #fbbf24;

    border-color:
      #55440f;

    background:
      #211d13;

    transform:
      rotate(4deg);
  }

  .vp-lightbox-arrow {
    position: fixed;

    top: 50%;

    width: 43px;
    height: 43px;

    display: flex;
    align-items: center;
    justify-content: center;

    border:
      1px solid #393939;

    border-radius: 50%;

    background:
      #181818;

    color: #a3a3a3;

    cursor: pointer;

    transform:
      translateY(-50%);

    transition: .2s ease;
  }

  .vp-lightbox-arrow:hover {
    color: #fbbf24;

    border-color:
      #55440f;

    background:
      #29220e;
  }

  .vp-lightbox-arrow.left {
    left: 19px;
  }

  .vp-lightbox-arrow.right {
    right: 19px;
  }

  .vp-lightbox-count {
    position: fixed;

    left: 50%;
    bottom: 18px;

    transform:
      translateX(-50%);

    padding:
      5px 9px;

    border:
      1px solid #333333;

    border-radius: 999px;

    background:
      rgba(23,23,23,.92);

    color: #a3a3a3;

    font-size: 8px;
  }

  /* =====================================================
     ANIMATIONS
  ===================================================== */
  @keyframes vpPrebookPulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }

    50% {
      opacity: .45;
      transform: scale(.78);
    }
  }



  @keyframes vpPageIn {
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  }

  @keyframes vpSlideDown {
    from {
      opacity: 0;

      transform:
        translateY(-10px);
    }

    to {
      opacity: 1;

      transform:
        translateY(0);
    }
  }

  @keyframes vpCardIn {
    from {
      opacity: 0;

      transform:
        translateY(15px)
        scale(.99);
    }

    to {
      opacity: 1;

      transform:
        translateY(0)
        scale(1);
    }
  }

  @keyframes vpHotPulse {
    0%,
    100% {
      box-shadow:
        0 5px 12px
        rgba(245,158,11,.06);
    }

    50% {
      box-shadow:
        0 5px 18px
        rgba(245,158,11,.14);
    }
  }

  @keyframes vpFadeIn {
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  }

  @keyframes vpZoomIn {
    from {
      opacity: 0;

      transform:
        scale(.96);
    }

    to {
      opacity: 1;

      transform:
        scale(1);
    }
  }

  /* =====================================================
     TABLET
  ===================================================== */

  @media (max-width: 950px) {

    .vp-main-grid {
      grid-template-columns:
        1fr;
    }

    .vp-gallery {
      border-right: 0;

      border-bottom:
        1px solid #292929;
    }

    .vp-main-image-wrap {
      max-width: 620px;

      margin: 0 auto;
    }

    .vp-thumbnails {
      justify-content: center;
    }

  }

  /* =====================================================
     MOBILE
  ===================================================== */

  @media (max-width: 640px) {

    .view-product-page {
      padding:
        13px
        9px
        35px;
    }

    .vp-header {
      align-items:
        flex-start;
    }

    .vp-view-label {
      display: none;
    }

    .vp-back {
      width: 37px;
      height: 37px;
    }

    .vp-title {
      font-size: 21px;
    }

    .vp-subtitle {
      font-size: 8px;
    }

    .vp-main-card {
      border-radius: 13px;
    }

    .vp-gallery {
      padding: 12px;
    }

    .vp-main-image-wrap {
      border-radius: 11px;
    }

    .vp-main-image {
      padding: 11px;
    }

    .vp-details {
      padding: 15px;

      gap: 15px;
    }

    .vp-product-name {
      font-size: 22px;
    }

    .vp-current-price {
      font-size: 24px;
    }

    .vp-info-grid {
      grid-template-columns:
        repeat(2, 1fr);
    }

    .vp-stock-card {
      align-items:
        flex-start;

      flex-direction:
        column;
    }

    .vp-status {
      align-self:
        flex-start;
    }

    .vp-image-arrow,
    .vp-zoom-button {
      opacity: 1;
    }

    .vp-image-arrow {
      width: 30px;
      height: 30px;
    }

    .vp-lightbox {
      padding: 9px;
    }

    .vp-lightbox-image {
      max-width: 95vw;
      max-height: 80vh;
    }

    .vp-lightbox-arrow {
      width: 37px;
      height: 37px;
    }

    .vp-lightbox-arrow.left {
      left: 7px;
    }

    .vp-lightbox-arrow.right {
      right: 7px;
    }

  }

  /* =====================================================
     SMALL MOBILE
  ===================================================== */

  @media (max-width: 390px) {

    .vp-info-grid {
      grid-template-columns:
        1fr;
    }

    .vp-title {
      font-size: 19px;
    }

    .vp-hot-badge {
      font-size: 8px;
    }

    .vp-thumbnail {
      width: 57px;
      height: 57px;

      flex-basis: 57px;
    }

  }

  /* =====================================================
     REDUCED MOTION
  ===================================================== */

  @media (prefers-reduced-motion: reduce) {

    .view-product-page,
    .vp-header,
    .vp-main-card,
    .vp-hot-badge,
    .vp-lightbox,
    .vp-lightbox-image {
      animation: none !important;
    }

    * {
      scroll-behavior:
        auto !important;

      transition:
        none !important;
    }

  }

`;

/* =========================================================
   EMPTY STATE STYLES
========================================================= */

const emptyStyles = `

  .vp-empty-page {
    min-height: 70vh;

    display: flex;
    align-items: center;
    justify-content: center;

    padding: 30px;

    background:
      #0b0b0b;

    color: white;
  }

  .vp-empty-card {
    width:
      min(420px, 100%);

    padding:
      40px 30px;

    text-align: center;

    background:
      #171717;

    border:
      1px solid #2b2b2b;

    border-radius: 16px;

    box-shadow:
      0 20px 55px
      rgba(0,0,0,.35);
  }

  .vp-empty-icon {
    width: 65px;
    height: 65px;

    margin:
      0 auto 17px;

    display: flex;
    align-items: center;
    justify-content: center;

    border:
      1px solid #4b3a0d;

    border-radius: 16px;

    background:
      #29220e;

    color:
      #f59e0b;
  }

  .vp-empty-card h2 {
    margin: 0;

    color:
      #f5f5f5;

    font-size: 21px;
  }

  .vp-empty-card p {
    margin:
      8px 0 21px;

    color:
      #737373;

    font-size: 11px;
  }

  .vp-back-button {
    display: inline-flex;
    align-items: center;

    gap: 7px;

    padding:
      9px 14px;

    border:
      1px solid #6b4e0a;

    border-radius: 8px;

    background:
      #b77900;

    color:
      #ffffff;

    font-size: 10px;

    font-weight: 700;

    cursor: pointer;

    transition:
      .2s ease;
  }

  .vp-back-button:hover {
    background:
      #d69205;

    transform:
      translateY(-1px);

    box-shadow:
      0 7px 20px
      rgba(245,158,11,.15);
  }


  @media (max-width: 560px) {
    .vp-prebooking-card {
      align-items: flex-start;
      padding: 11px;
    }

    .vp-prebooking-left {
      align-items: flex-start;
    }

    .vp-prebooking-icon {
      width: 34px;
      height: 34px;
    }

    .vp-prebooking-description {
      max-width: 220px;
    }

    .vp-prebooking-status {
      padding: 5px 7px;
      font-size: 7px;
    }
  }

`;

export default ViewProduct;