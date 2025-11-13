import Button from "./Button";
import SlidingButtons from "./SlidingButtons";
import { Building2, LayoutDashboard, Menu, ReceiptText, Shirt, User, Users } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import Dropdown from "./Dropdown";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useLoader } from "../context/LoaderContext";

function FloatingNavbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const { showLoader, hideLoader } = useLoader();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  // ✅ simple helper for readability
  const hasRole = (roles) => roles.includes(user?.role);

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 flex items-center justify-between space-x-1 bg-[#f8fbfb] shadow-md border border-gray-300 p-1 rounded-2xl z-50">
      {/* Menu */}
      <Button variant="normal-btn" onClick={onMenuClick}>
        <Menu size={20} />
      </Button>

      <div className="w-px h-5 bg-gray-300" />

      <SlidingButtons>
        {/* 🔹 Dashboard – accessible to both developer and user */}
        {hasRole(["developer", "user"]) && (
          <Button
            variant="normal-btn"
            active={currentPath === "/dashboard"}
            onClick={() => navigate("/dashboard")}
          >
            <LayoutDashboard size={20} />
          </Button>
        )}

        {/* 🔹 Businesses – developer only */}
        {hasRole(["developer"]) && (
          <Button
            variant="normal-btn"
            active={currentPath === "/businesses"}
            onClick={() => navigate("/businesses")}
          >
            <Building2 size={20} />
          </Button>
        )}

        {/* 🔹 Customers – user only */}
        {hasRole(["user"]) && (
          <Button
            variant="normal-btn"
            active={currentPath === "/customers"}
            onClick={() => navigate("/customers")}
          >
            <Users size={20} />
          </Button>
        )}

        {/* 🔹 Customers – user only */}
        {hasRole(["user"]) && (
          <Button
            variant="normal-btn"
            active={currentPath === "/articles"}
            onClick={() => navigate("/articles")}
          >
            <Shirt size={20} />
          </Button>
        )}

        {/* 🔹 Customers – user only */}
        {hasRole(["user"]) && (
          <Button
            variant="normal-btn"
            active={currentPath === "/invoices"}
            onClick={() => navigate("/invoices")}
          >
            <ReceiptText size={20} />
          </Button>
        )}
      </SlidingButtons>

      <div className="w-px h-5 bg-gray-300" />

      {/* Profile dropdown */}
      <Dropdown icon={<User size={20} />}>
        <div className="px-3 py-1.5 text-gray-600 rounded-md cursor-default">
          {user?.name ? `Hi, ${user.name}` : "Account"}
        </div>
        <div className="px-3 py-1.5 bg-red-50 text-red-800 rounded-md cursor-pointer">
          <button
            className="w-full text-left"
            onClick={async () => {
              showLoader();
              try {
                await logout();
                addToast("Logout Successfully!", "success");
                navigate("/login");
              } finally {
                hideLoader();
              }
            }}
          >
            Logout
          </button>
        </div>
      </Dropdown>
    </div>
  );
}

export default FloatingNavbar;
