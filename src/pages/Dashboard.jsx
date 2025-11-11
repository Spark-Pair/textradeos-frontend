// src/pages/RoleBasedDashboard.jsx
import DeveloperDashboard from "./Developer/Dashboard";
import UserDashboard from "./User/Dashboard";
import { useAuth } from "../context/AuthContext";

export default function RoleBasedDashboard() {
  const { user } = useAuth();

  if (user?.role === "developer") return <DeveloperDashboard />;
  if (user?.role === "user") return <UserDashboard />;

  return <div>Unknown role</div>;
}
