import { X, Trash2, Package, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useAppContext } from "../../context/Context";

const DeleteModal = ({ product, onConfirm, onCancel }) => {
  const { url } = useAppContext();

  const [deleting, setDeleting] = useState(false);
  const deleteButtonRef = useRef(null);

  /*
  =========================================================
  MODAL EFFECTS
  =========================================================
  */

  useEffect(() => {
    if (!product) return;

    // Prevent background page scrolling
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      // ESC → Cancel
      if (event.key === "Escape" && !deleting) {
        event.preventDefault();
        onCancel();
        return;
      }

      // ENTER → Delete
      if (
        event.key === "Enter" &&
        !deleting &&
        document.activeElement?.tagName !== "BUTTON"
      ) {
        event.preventDefault();
        handleDelete();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Focus delete button after modal opens
    const timer = setTimeout(() => {
      deleteButtonRef.current?.focus();
    }, 300);

    return () => {
      document.body.style.overflow = originalOverflow;

      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timer);
    };
  }, [product, deleting]);

  /*
  =========================================================
  NO PRODUCT
  =========================================================
  */

  if (!product) return null;

  /*
  =========================================================
  PRODUCT DATA
  =========================================================
  */

  const image =
    product.images && product.images.length > 0
      ? `${url}/img/${product.images[0]}`
      : null;

  const stock = Math.max(Number(product.stock || 0), 0);

  /*
  =========================================================
  DELETE HANDLER
  =========================================================
  */

  const handleDelete = async () => {
    if (deleting) return;

    try {
      setDeleting(true);

      await Promise.resolve(onConfirm());
    } catch (error) {
      console.error("Delete error:", error);

      setDeleting(false);
    }
  };

  /*
  =========================================================
  UI
  =========================================================
  */

  return (
    <AnimatePresence>
      <motion.div
        className="
          fixed
          inset-0
          z-[9999]
          flex
          items-center
          justify-center
          overflow-y-auto
          bg-black/55
          mt-5
          p-4
          backdrop-blur-xl
          supports-[backdrop-filter]:bg-black/45
        "
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{
          duration: 0.25,
          ease: "easeOut",
        }}
        onMouseDown={(e) => {
          // Click outside modal → close
          if (e.target === e.currentTarget && !deleting) {
            onCancel();
          }
        }}
      >
        {/* =================================================
            BACKGROUND AMBIENT GLOW
        ================================================= */}

        <motion.div
          className="
            pointer-events-none
            absolute
            left-1/2
            top-1/2
            h-[420px]
            w-[420px]
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            bg-red-600/[0.08]
            blur-[120px]
          "
          initial={{
            opacity: 0,
            scale: 0.7,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            duration: 0.6,
            ease: "easeOut",
          }}
        />

        {/* =================================================
            SECOND SOFT GLOW
        ================================================= */}

        <motion.div
          className="
            pointer-events-none
            absolute
            left-[50%]
            top-[50%]
            h-[180px]
            w-[180px]
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            bg-red-500/[0.06]
            blur-[70px]
          "
          animate={{
            scale: [1, 1.12, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* =================================================
            MODAL
        ================================================= */}

        <motion.div
          className="
            relative
            my-auto
            w-full
            max-w-[420px]
            overflow-hidden
            rounded-2xl
            border
            border-white/[0.08]
            bg-[#151515]/95
            shadow-[0_30px_100px_rgba(0,0,0,0.8)]
            backdrop-blur-sm
          "
          initial={{
            opacity: 0,
            scale: 0.88,
            y: 30,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            scale: 0.94,
            y: 20,
          }}
          transition={{
            type: "spring",
            stiffness: 380,
            damping: 28,
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* =================================================
              TOP DANGER LINE
          ================================================= */}

          <div className="h-[3px] w-full bg-gradient-to-r from-red-700 via-red-500 to-red-700" />

          {/* =================================================
              CLOSE BUTTON
          ================================================= */}

          <motion.button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            aria-label="Close delete modal"
            whileHover={!deleting ? { rotate: 90 } : {}}
            whileTap={!deleting ? { scale: 0.9 } : {}}
            className="
              absolute
              right-4
              top-4
              z-20
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-full
              border
              border-[#333]
              bg-[#1c1c1c]
              text-zinc-500
              transition-all
              duration-200
              hover:border-[#555]
              hover:bg-[#252525]
              hover:text-white
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            <X className="h-4 w-4" />
          </motion.button>

          {/* =================================================
              CONTENT
          ================================================= */}

          <div className="p-5 sm:p-6">
            {/* =================================================
                DELETE ICON
            ================================================= */}

            <div className="flex justify-center">
              <motion.div
                initial={{
                  scale: 0,
                  rotate: -20,
                }}
                animate={{
                  scale: 1,
                  rotate: 0,
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 18,
                  delay: 0.05,
                }}
                className="
                  relative
                  flex
                  h-[64px]
                  w-[64px]
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-red-500/20
                  bg-red-500/10
                  shadow-[0_0_35px_rgba(239,68,68,0.08)]
                "
              >
                {/* Pulse ring */}

                <motion.div
                  className="
                    absolute
                    inset-0
                    rounded-2xl
                    border
                    border-red-500/30
                  "
                  animate={{
                    scale: [1, 1.18, 1],
                    opacity: [0.8, 0, 0.8],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                {/* Second pulse */}

                <motion.div
                  className="
                    absolute
                    inset-[-5px]
                    rounded-[20px]
                    border
                    border-red-500/10
                  "
                  animate={{
                    scale: [1, 1.08, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                <Trash2 className="relative h-7 w-7 text-red-400" />
              </motion.div>
            </div>

            {/* =================================================
                TITLE
            ================================================= */}

            <motion.div
              initial={{
                opacity: 0,
                y: 8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.12,
              }}
              className="mt-4 text-center"
            >
              <h2 className="text-xl font-bold tracking-tight text-white">
                Delete product?
              </h2>

              <p className="mt-1.5 text-sm text-zinc-500">
                This action cannot be undone.
              </p>
            </motion.div>

            {/* =================================================
                PRODUCT PREVIEW
            ================================================= */}

            <motion.div
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.18,
                duration: 0.25,
              }}
              className="
                mt-5
                rounded-xl
                border
                border-[#303030]
                bg-[#101010]
                p-3
                transition-colors
                duration-200
                hover:border-[#3a3a3a]
              "
            >
              <div className="flex items-center gap-3">
                {/* =================================================
                    PRODUCT IMAGE
                ================================================= */}

                <div
                  className="
                    relative
                    h-14
                    w-14
                    shrink-0
                    overflow-hidden
                    rounded-lg
                    border
                    border-[#383838]
                    bg-[#202020]
                  "
                >
                  {image ? (
                    <img
                      src={image}
                      alt={product.productName || "Product"}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Package className="h-6 w-6 text-zinc-600" />
                    </div>
                  )}

                  {/* Hot badge */}

                  {product.hotSell && (
                    <span
                      className="
                        absolute
                        right-1
                        top-1
                        rounded-full
                        bg-[#f5ad0b]
                        p-1
                        text-black
                      "
                    >
                      <AlertTriangle className="h-2.5 w-2.5" />
                    </span>
                  )}
                </div>

                {/* =================================================
                    PRODUCT INFORMATION
                ================================================= */}

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-zinc-100">
                    {product.productName || "Unnamed Product"}
                  </p>

                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#f5ad0b]">
                      ₹
                      {Number(product.price || 0).toLocaleString("en-IN")}
                    </span>

                    <span className="text-zinc-700">•</span>

                    <span className="truncate text-[11px] text-zinc-500">
                      {product.category || "Product"}
                    </span>
                  </div>

                  {/* Stock */}

                  <div className="mt-1">
                    <span
                      className={`text-[10px] font-medium ${
                        stock > 0
                          ? "text-emerald-400"
                          : "text-red-400"
                      }`}
                    >
                      {stock > 0
                        ? `${stock} in stock`
                        : "Out of stock"}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* =================================================
                WARNING
            ================================================= */}

            <motion.div
              initial={{
                opacity: 0,
                y: 5,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.25,
              }}
              className="
                mt-4
                flex
                items-start
                gap-2.5
                rounded-lg
                border
                border-red-500/10
                bg-red-500/[0.04]
                px-3
                py-2.5
              "
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />

              <p className="text-[12px] leading-5 text-zinc-500">
                You are about to permanently remove{" "}
                <span className="font-semibold text-zinc-300">
                  {product.productName || "this product"}
                </span>{" "}
                from your catalog.
              </p>
            </motion.div>

            {/* =================================================
                ACTION BUTTONS
            ================================================= */}

            <div className="mt-5 grid grid-cols-2 gap-3">
              {/* =================================================
                  CANCEL
              ================================================= */}

              <motion.button
                type="button"
                onClick={onCancel}
                disabled={deleting}
                whileHover={!deleting ? { y: -1 } : {}}
                whileTap={!deleting ? { scale: 0.97 } : {}}
                className="
                  h-11
                  rounded-lg
                  border
                  border-[#383838]
                  bg-[#1b1b1b]
                  text-sm
                  font-medium
                  text-zinc-300
                  transition-all
                  duration-200
                  hover:border-[#505050]
                  hover:bg-[#222]
                  hover:text-white
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                Cancel
              </motion.button>

              {/* =================================================
                  DELETE
              ================================================= */}

              <motion.button
                ref={deleteButtonRef}
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                whileHover={!deleting ? { y: -1 } : {}}
                whileTap={!deleting ? { scale: 0.97 } : {}}
                className="
                  group
                  relative
                  flex
                  h-11
                  items-center
                  justify-center
                  gap-2
                  overflow-hidden
                  rounded-lg
                  bg-red-600
                  text-sm
                  font-semibold
                  text-white
                  shadow-lg
                  shadow-red-900/20
                  transition-all
                  duration-200
                  hover:bg-red-500
                  hover:shadow-red-900/30
                  disabled:cursor-not-allowed
                  disabled:opacity-70
                "
              >
                {/* Shine animation */}

                {!deleting && (
                  <span
                    className="
                      absolute
                      inset-y-0
                      -left-20
                      w-12
                      skew-x-[-20deg]
                      bg-white/20
                      transition-all
                      duration-700
                      group-hover:left-[120%]
                    "
                  />
                )}

                {deleting ? (
                  <>
                    <span
                      className="
                        h-4
                        w-4
                        animate-spin
                        rounded-full
                        border-2
                        border-white/30
                        border-t-white
                      "
                    />

                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />

                    <span>Delete</span>
                  </>
                )}
              </motion.button>
            </div>

            {/* =================================================
                KEYBOARD HINT
            ================================================= */}

            <div
              className="
                mt-4
                hidden
                items-center
                justify-center
                gap-2
                text-[10px]
                text-zinc-600
                sm:flex
              "
            >
              <span>ESC</span>
              <span>to cancel</span>

              <span className="mx-1">•</span>

              <span>ENTER</span>
              <span>to delete</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DeleteModal;