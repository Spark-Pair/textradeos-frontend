import { useEffect, useCallback } from "react";
import { X, Home, Settings, User, LogOut, Search, Building2, Users } from "lucide-react";
import NavItem from "./NavItem";
import { useNavigate } from "react-router-dom";
import Modal from "./Modal";
import { useAuth } from "../context/AuthContext";

export default function MenuModal({ onClose }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  // ✅ Helper function
  const handleNavigate = useCallback(
    (path) => {
      navigate(path);
      onClose();
    },
    [navigate, onClose]
  );

  // ✅ Role check shortcut
  const hasRole = (roles) => roles.includes(user?.role);

  return (
    <Modal title="Main Menu" onClose={onClose}>
      {/* 🔹 Search bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search..."
          className="w-full pl-10 pr-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#127475] focus:border-transparent text-gray-700"
        />
      </div>

      {/* 🔹 Navigation */}
      <div className="space-y-2">
        {/* Dashboard — visible to all */}
        {hasRole(["developer", "user"]) && (
          <NavItem
            icon={<Home size={18} />}
            label="Dashboard"
            onClick={() =>
              handleNavigate(
                user?.role === "developer"
                  ? "/developer/dashboard"
                  : "/dashboard"
              )
            }
          />
        )}

        {/* Businesses — developer only */}
        {hasRole(["developer"]) && (
          <NavItem
            icon={<Building2 size={18} />}
            label="Businesses"
            onClick={() => handleNavigate("/businesses")}
          />
        )}

        {/* Customers — user only */}
        {hasRole(["user"]) && (
          <NavItem
            icon={<Users size={18} />}
            label="Customers"
            onClick={() => handleNavigate("/customers")}
          />
        )}

        {/* Optional Settings (both) */}
        {hasRole(["developer", "user"]) && (
          <NavItem
            icon={<Settings size={18} />}
            label="Settings"
            onClick={() => handleNavigate("/settings")}
          />
        )}
      </div>
    </Modal>
  );
}
