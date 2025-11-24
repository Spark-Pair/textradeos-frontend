import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Notifications from "../components/Notifications";
import MenuModal from "../components/MenuModal";
import FloatingNavbar from "../components/FloatingNavbar";
import Loader from "../components/Loader";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";

export default function Layout({ children }) {
  const socket = useSocket();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!socket) return;

    socket.on("business-status-changed", (data) => {
      if (data.isActive == false && data.businessId == user.businessId) {
        logout();
      }
    });

    return () => socket.off("business-status-changed");
  }, [socket]);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation(); // ✅ detect path changes

  const handleMenuClick = () => setIsMenuOpen(true);

  return (
    <div className="h-screen flex flex-col bg-[#eef5f5] overflow-hidden relative">
      {/* 🔹 Animated Main Content */}
      <AnimatePresence mode="wait" initial={true}>
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 25, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="p-5 h-full overflow-y-auto scrollbar-hide"
        >
          {children || <Outlet />}
        </motion.div>
      </AnimatePresence>

      {/* 🔹 Notifications */}
      <Notifications />

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
