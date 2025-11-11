// src/routes/PrivateRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth();

  // 🔹 Wait for auth to initialize
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        Loading...
      </div>
    );
  }

  // 🔹 Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 🔹 Role-based restriction
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 🔹 All good
  return children;
}
