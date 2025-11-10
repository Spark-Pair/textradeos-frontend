// Loader.jsx
import { motion, AnimatePresence } from "framer-motion";
import { useLoader } from "../context/LoaderContext";

export default function Loader() {
  const { loading } = useLoader();

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
        >
          <div className="w-16 h-16 border-4 border-t-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
