import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ArrowRight } from "lucide-react"; // Icons for warning
import MenuModal from "../components/MenuModal";
import FloatingNavbar from "../components/FloatingNavbar";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const handleMenuClick = () => setIsMenuOpen(true);

  return (
    <div className="h-screen flex flex-col bg-[#eef5f5] overflow-hidden relative">
      
      {/* ⚠️ Read-Only Mode Warning Bar */}
      <AnimatePresence>
        {user?.isReadOnly && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden p-3 fixed left-1/2 -translate-x-1/2"
          >
            <div className="rounded-full mx-auto p-2 pe-3.5 flex items-center justify-between gap-4 bg-red-500 text-white">
              <div className="flex items-center gap-2">
                <AlertCircle size={22} />
                <p className="text-[11px] md:text-sm font-medium tracking-wide">
                  Subscription Expired — You are in Read-Only mode
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔹 Animated Main Content */}
      <AnimatePresence mode="wait" initial={true}>
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 25, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className={`p-5 h-full overflow-y-auto scrollbar-hide ${user?.isReadOnly ? 'pt-2' : ''}`}
        >
          {children || <Outlet />}
        </motion.div>
      </AnimatePresence>

      {/* 🔹 Floating Navbar */}
      <FloatingNavbar onMenuClick={handleMenuClick} />

      {/* 🔹 Menu Modal */}
      <AnimatePresence>
        {isMenuOpen && <MenuModal onClose={() => setIsMenuOpen(false)} />}
      </AnimatePresence>

      {/* 🔹 Global Loader */}
      <Loader />
    </div>
  );
}