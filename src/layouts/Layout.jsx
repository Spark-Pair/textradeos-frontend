import { Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Button from "../components/Button";
import Notifications from "../components/Notifications";
import MenuModal from "../components/MenuModal";
import { Bell, Building2, LayoutDashboard, Menu, User, Users } from "lucide-react";

export default function Layout({ children }) {
  const navigate = useNavigate();
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

      <Notifications />

      {/* 🔹 Floating Bottom Bar */}
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 flex items-center justify-between space-x-1 bg-[#f8fbfb] shadow-md border border-gray-300 p-1 rounded-2xl z-50">
        <Button variant="normal-btn" onClick={handleMenuClick}>
          <Menu size={20} />
        </Button>

        <div className="w-px h-5 bg-gray-300" />

        <Button variant="normal-btn" onClick={() => navigate("/dashboard")}>
          <LayoutDashboard size={20} />
        </Button>
        <Button variant="normal-btn" onClick={() => navigate("/businesses")}>
          <Building2 size={20} />
        </Button>
        <Button variant="normal-btn" onClick={() => navigate("/customers")}>
          <Users size={20} />
        </Button>

        <div className="w-px h-5 bg-gray-300" />

        <Button variant="normal-btn">
          <User size={20} />
        </Button>
      </div>

      {/* 🔹 Menu Modal */}
      <AnimatePresence>
        {isMenuOpen && <MenuModal onClose={() => setIsMenuOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}
