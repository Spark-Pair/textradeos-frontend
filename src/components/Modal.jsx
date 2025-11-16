import { useEffect } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

export default function Modal({ title, children, onClose, size = "md" }) {
  const sizes = {
    "sm": "max-w-sm",
    "md": "max-w-md",
    "lg": "max-w-lg",
    "xl": "max-w-xl",
    "2xl": "max-w-2xl",
    "4xl": "max-w-4xl",
  };

  // ✅ Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-80 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`bg-[#fefeff] w-full ${sizes[size]} rounded-2xl shadow-xl p-6 relative max-h-[90vh] overflow-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {title && (
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800 capitalize">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl text-gray-600 transition"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Content */}
        {children}
      </motion.div>
    </motion.div>
  );
}