import { useEffect, useCallback } from "react";
import { X, Home, Settings, User, LogOut, Search, Building2 } from "lucide-react";
import NavItem from "./NavItem";
import { useNavigate } from "react-router-dom";
import Modal from "./Modal";

export default function MenuModal({ onClose }) {
  const navigate = useNavigate();

  // ✅ Handle navigation and close modal
  const handleNavigate = useCallback(
    (path) => {
      navigate(path);
      onClose();
    },
    [navigate, onClose]
  );

  return (
    <Modal title="Main Menu" onClose={onClose}>
      {/* Search bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search..."
          className="w-full pl-10 pr-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#127475] focus:border-transparent text-gray-700"
        />
      </div>

      {/* Navigation */}
      <div className="space-y-2">
        <NavItem icon={<Home size={18} />} label="Dashboard" onClick={() => handleNavigate("/")} />
        <NavItem icon={<Building2 size={18} />} label="Businesses" onClick={() => handleNavigate("/businesses")} />
      </div>
    </Modal>
  );
}
