import { useEffect, useCallback, useRef, useState, useMemo } from "react";
import { Search, Building2, Users, LayoutDashboard, Shirt, ReceiptText, BanknoteArrowDown } from "lucide-react";
import NavItem from "./NavItem";
import { useNavigate } from "react-router-dom";
import Modal from "./Modal";
import { useAuth } from "../context/AuthContext";

export default function MenuModal({ onClose }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const searchRef = useRef(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  const handleNavigate = useCallback(
    (path) => {
      navigate(path);
      onClose();
    },
    [navigate, onClose]
  );

  const hasRole = (roles) => roles.includes(user?.role);

  // List of all navigation items
  const navItems = useMemo(
    () => [
      {
        label: "Dashboard",
        icon: <LayoutDashboard size={18} />,
        roles: ["developer", "user"],
        path: "/dashboard",
      },
      {
        label: "Businesses",
        icon: <Building2 size={18} />,
        roles: ["developer"],
        path: "/businesses",
      },
      {
        label: "Customers",
        icon: <Users size={18} />,
        roles: ["user"],
        path: "/customers",
      },
      {
        label: "Articles",
        icon: <Shirt size={18} />,
        roles: ["user"],
        path: "/articles",
      },
      {
        label: "Invoices",
        icon: <ReceiptText size={18} />,
        roles: ["user"],
        path: "/invoices",
      },
      {
        label: "Payments",
        icon: <BanknoteArrowDown size={18} />,
        roles: ["user"],
        path: "/payments",
      },
    ],
    []
  );

  // Filter items based on role and search query
  const filteredItems = navItems.filter(
    (item) => hasRole(item.roles) && item.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Modal title="Main Menu" onClose={onClose}>
      {/* 🔹 Search bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        <input
          ref={searchRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search..."
          className="w-full pl-10 pr-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#127475] focus:border-transparent text-gray-700"
        />
      </div>

      {/* 🔹 Navigation */}
      <div className="h-60 overflow-y-auto">
        <div className="space-y-2">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <>
                <NavItem
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  onClick={() => handleNavigate(item.path)}
                />
              </>
            ))
          ) : (
            <p className="text-gray-500 text-sm text-center">No results found</p>
          )}
        </div>
      </div>
    </Modal>
  );
}
