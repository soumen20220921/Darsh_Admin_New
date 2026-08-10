import { X, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { useAppContext } from "../../context/Context";

const DeleteModal = ({ product, onConfirm, onCancel }) => {
  const {url} = useAppContext();
  useEffect(() => {
    const handleKey = (e) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onCancel]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel} 
      >
        <motion.div
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md p-6 sm:p-8"
          initial={{ opacity: 0, scale: 0.85, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()} 
        >
          {/* Close Button */}
          <button
            onClick={onCancel}
            className="absolute top-3 right-3 p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Trash Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Trash2 className="mx-auto h-14 w-14 text-red-500" />
          </motion.div>

          {/* Title */}
          <h3 className="mt-4 text-xl sm:text-2xl font-bold text-gray-900 text-center">
            Confirm Deletion
          </h3>

          {/* Product Preview */}
          {product && (
            <div className="mt-4 flex items-center gap-4 bg-gray-50 p-3 rounded-lg border">
              <img
                src={
                  product.images && product.images.length > 0
                    ? `${url}/img/${product.images[0]}`
                    : "https://placehold.co/60x60?text=No+Img"
                }
                alt={product.productName}
                className="w-14 h-14 object-cover rounded-lg border"
              />
              <div className="flex-1">
                <p className="font-semibold text-gray-900 truncate">
                  {product.productName || "Unnamed Product"}
                </p>
                <p className="text-sm text-gray-500">₹{product.price}</p>
              </div>
            </div>
          )}

          {/* Warning Text */}
          <p className="mt-4 text-sm sm:text-base text-gray-600 text-center">
            This action cannot be undone. Do you really want to delete{" "}
            <span className="font-semibold text-gray-900">
              {product?.productName || "this product"}
            </span>
            ?
          </p>

          {/* Actions */}
          <div className="mt-6 flex flex-col sm:flex-row justify-center sm:space-x-4 space-y-3 sm:space-y-0">
            <button
              onClick={onCancel}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all duration-200 w-full sm:w-auto"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg shadow-md hover:bg-red-700 hover:shadow-lg transform hover:scale-105 transition-all duration-200 w-full sm:w-auto"
            >
              Delete
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DeleteModal;
