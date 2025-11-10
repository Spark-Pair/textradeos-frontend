// Layout.jsx
import { Outlet } from "react-router-dom";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Notifications from "../components/Notifications";
import MenuModal from "../components/MenuModal";
import FloatingNavbar from "../components/FloatingNavbar";
import Loader from "../components/Loader"; // ✅ import loader

export default function Layout({ children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuClick = () => {
    setIsMenuOpen(true);
  };

  return (
    <div className="h-screen flex flex-col bg-[#eef5f5] overflow-hidden relative">
      {/* 🔹 Animated Main Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={window.location.pathname} // animates on route change
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="p-5 h-full overflow-y-auto"
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
      <Loader />  {/* 🔹 add this here */}
    </div>
  );
}
