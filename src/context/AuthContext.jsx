import { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { prefetchAllData } from "../offline/prefetch";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔁 RUNS ON APP LOAD
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);

      const token = localStorage.getItem("token");
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const { data } = await axiosClient.get("/auth/status");

        // ❌ Business inactive OR invalid response
        if (!data?.user || !data?.user?.businessId?.isActive && data.user.role !== 'developer') {
          await logout(false);
          return;
        }

        setUser(data.user); // includes isReadOnly, sessionActive
      } catch (err) {
        await logout(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data));
    localStorage.setItem("sessionId", data.sessionId);

    setUser(data);
    const bizId = data.businessId?._id || data.businessId || null;
    prefetchAllData({ axiosClient, role: data.role, bizId });
    navigate("/dashboard", { replace: true });
  };

  const logout = async (redirect = true) => {
    const sessionId = localStorage.getItem("sessionId");

    if (sessionId) {
      try {
        await axiosClient.post("/users/logout", { sessionId });
      } catch (err) {
        console.log("Logout failed:", err.message);
      }
    }

    localStorage.clear();
    setUser(null);

    if (redirect) {
      navigate("/login", { replace: true });
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
