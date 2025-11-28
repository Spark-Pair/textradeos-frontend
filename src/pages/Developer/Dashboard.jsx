import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import axiosClient from "../../api/axiosClient";

import { Building2, Users, Banknote, Calendar } from "lucide-react";

import StatTile from "../../components/Dashboard/StatTile.jsx";

export default function DeveloperDashboard() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [devStats, setDevStats] = useState(null);
  const [activeUsers, setActiveUsers] = useState([]);

  useEffect(() => {
    document.title = "Developer Dashboard | TexTradeOS";

    const fetchDashboard = async () => {
      try {
        // Stats
        const res = await axiosClient.get("/dashboard/stats");
        setDevStats(res.data);

        // Logged-in users
        const usersRes = await axiosClient.get("/dashboard/getloggedinusers");
        console.log(usersRes);
        
        setActiveUsers(usersRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) return <div className="p-5">Loading...</div>;

  const devTileData = [
    {
      label: "Total Businesses",
      value: devStats.totalBusinesses,
      icon: Building2,
      color: "text-blue-500",
      bgColor: "bg-blue-100",
    },
    {
      label: "Active Businesses",
      value: devStats.activeBusinesses,
      icon: Building2,
      color: "text-green-500",
      bgColor: "bg-green-100",
    },
    {
      label: "Expired Subscriptions",
      value: devStats.expiredSubscriptions,
      icon: Calendar,
      color: "text-red-500",
      bgColor: "bg-red-100",
    },
    {
      label: "Total Users",
      value: devStats.totalUsers,
      icon: Users,
      color: "text-purple-500",
      bgColor: "bg-purple-100",
    },
    {
      label: "Total Revenue",
      value: `PKR ${devStats.totalRevenue.toLocaleString()}`,
      icon: Banknote,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
  ];

  return (
    <div className="space-y-6 p-3 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Developer Dashboard</h1>
        <p className="text-lg">Welcome, {user?.name}</p>
      </div>

      {/* Stats Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {devTileData.map((stat, index) => (
          <StatTile key={index} {...stat} />
        ))}
      </div>

      {/* Logged-in Users List */}
      <div className="bg-white rounded-2xl p-6 shadow border">
        <h2 className="text-2xl font-semibold mb-4">Active Users</h2>

        {activeUsers.length === 0 ? (
          <p className="text-gray-500">No users currently logged in.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-4 py-2 border-b">User Name</th>
                  <th className="text-left px-4 py-2 border-b">Business</th>
                  <th className="text-left px-4 py-2 border-b">Login Time</th>
                  <th className="text-left px-4 py-2 border-b">IP Address</th>
                  <th className="text-left px-4 py-2 border-b">User Agent</th>
                </tr>
              </thead>
              <tbody>
                {activeUsers.map((u, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border-b">{u.name}</td>
                    <td className="px-4 py-2 border-b">{u.businessName}</td>
                    <td className="px-4 py-2 border-b">
                      {new Date(u.loginTime).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 border-b">{u.ipAddress || "-"}</td>
                    <td className="px-4 py-2 border-b">{u.userAgent || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
