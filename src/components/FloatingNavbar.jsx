import Button from "./Button";
import SlidingButtons from "./SlidingButtons";
import { BanknoteArrowDown, Building2, LayoutDashboard, Menu, ReceiptText, Repeat, Shirt, User, Users } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import Dropdown from "./Dropdown";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useLoader } from "../context/LoaderContext";
import axiosClient from "../api/axiosClient";
import { getExportCache, setExportCache } from "../offline/api";
import { useSync } from "../context/SyncContext";

function FloatingNavbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const { showLoader, hideLoader } = useLoader();
  const { outbox } = useSync();
  const pendingCount = outbox?.length || 0;
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  // ✅ simple helper for readability
  const hasRole = (roles) => roles.includes(user?.role);

  const downloadExcel = async () => {
    let blob;
    if (!navigator.onLine) {
      const cached = await getExportCache("last-export");
      if (!cached?.blob) {
        throw new Error("No cached export available offline.");
      }
      blob = cached.blob;
    } else {
      const res = await axiosClient.get("/export-data", {
        responseType: "blob",
      });
      blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      await setExportCache("last-export", { blob, ts: Date.now() });
    }

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${ user?.businessId.name || user?.businessName || "Business" } Data.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

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

        {/* 🔹 Businesses – developer only */}
        {hasRole(["developer"]) && (
          <Button
            variant="normal-btn"
            active={currentPath === "/subscriptions"}
            onClick={() => navigate("/subscriptions")}
          >
            <Repeat size={20} />
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

        {/* 🔹 Paymnet – user only */}
        {hasRole(["user"]) && (
          <Button
            variant="normal-btn"
            active={currentPath === "/payments"}
            onClick={() => navigate("/payments")}
          >
            <BanknoteArrowDown size={20} />
          </Button>
        )}
      </SlidingButtons>

      <div className="w-px h-5 bg-gray-300" />

      {/* Profile dropdown */}
      <Dropdown icon={<User size={20} />}>
        <div className="px-3 py-1.5 text-gray-600 rounded-md cursor-default">
          {user?.name ? `Hi, ${user.name}` : "Account"}
        </div>
        {user?.role != "developer" && (
          <div className="px-3 py-1.5 text-gray-600 rounded-md cursor-pointer">
            <button
              className="w-full text-left"
              onClick={() => navigate('/subscription-status')}
            >
              Subscription Status
            </button>
          </div>
        )}
        <div className="px-3 py-1.5 text-gray-600 rounded-md cursor-pointer">
          <button
            className="w-full text-left"
            onClick={() => navigate('/sync-status')}
          >
            Sync Status {pendingCount > 0 ? `(${pendingCount})` : ""}
          </button>
        </div>
        {user?.role != "developer" && (
          <div className="px-3 py-1.5 text-gray-600 rounded-md cursor-pointer">
          <button
            className="w-full text-left"
            onClick={async () => {
              showLoader();
              try {
                await downloadExcel();
                addToast("Exported Successfully!", "success");
              } catch (err) {
                addToast(err.message || "Export failed", "error");
              } finally {
                hideLoader();
              }
            }}
          >
              Export Data
            </button>
          </div>
        )}
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
