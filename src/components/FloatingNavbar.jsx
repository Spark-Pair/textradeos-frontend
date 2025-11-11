import React from "react";
import Button from "./Button";
import { Building2, LayoutDashboard, Menu, User, Users } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import Dropdown from "./Dropdown";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useLoader } from "../context/LoaderContext";

function FloatingNavbar({ onMenuClick }) {
  const { logout } = useAuth();
  const { addToast } = useToast();
  const { showLoader, hideLoader } = useLoader();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 flex items-center justify-between space-x-1 bg-[#f8fbfb] shadow-md border border-gray-300 p-1 rounded-2xl z-50">
      <Button variant="normal-btn" onClick={onMenuClick}>
        <Menu size={20} />
      </Button>

      <div className="w-px h-5 bg-gray-300" />

      <Button
        variant="normal-btn"
        active={currentPath === "/dashboard"}
        onClick={() => navigate("/dashboard")}
      >
        <LayoutDashboard size={20} />
      </Button>

      <Button
        variant="normal-btn"
        active={currentPath === "/businesses"}
        onClick={() => navigate("/businesses")}
      >
        <Building2 size={20} />
      </Button>

      <Button
        variant="normal-btn"
        active={currentPath === "/customers"}
        onClick={() => navigate("/customers")}
      >
        <Users size={20} />
      </Button>

      <div className="w-px h-5 bg-gray-300" />

      <Dropdown icon={<User size={20} />}>
        <div className="px-3 py-1.5 rounded-md cursor-pointer">Hello</div>
        <div className="px-3 py-1.5 rounded-md cursor-pointer">Hello</div>
        <div className="px-3 py-1.5 bg-red-50 text-red-800 rounded-md cursor-pointer">
          <button
            className="w-full text-left"
            onClick={async () => {
              showLoader();
              try {
                await logout();
                addToast("Logout Successfully!", "success");
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
