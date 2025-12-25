import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import axiosClient from "../../api/axiosClient";

import { Building2, Users, Banknote, Calendar } from "lucide-react";

import StatTile from "../../components/Dashboard/StatTile.jsx";
import Table from "../../components/Table.jsx";

export default function DeveloperDashboard() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [devStats, setDevStats] = useState(null);
  const [activeUsers, setActiveUsers] = useState([]);

  useEffect(() => {
    document.title = "Developer Dashboard | TexTradeOS";

    const fetchDashboard = async () => {
      try {
        setLoading(true);
        
        // Dono requests ko parallel chalaein (Faster performance)
        const [statsRes, usersRes] = await Promise.all([
          axiosClient.get("/dashboard/stats"),
          axiosClient.get("/dashboard/getloggedinusers")
        ]);

        setDevStats(statsRes.data);

        // Login time ko readable format mein convert karna
        const formattedUsers = usersRes.data.map(user => ({
          ...user,
          // Readable format: "Dec 25, 2:30 PM"
          formattedLoginTime: new Date(user.loginTime).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          })
        }));

        setActiveUsers(formattedUsers);
      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) return <div className="p-5">Loading...</div>;

  
  const columns = [
    { label: "#", render: (_, i) => i + 1, width: "3%" },
    { label: "Username", field: "name", width: "16%" },
    { label: "Business", field: "businessName", width: "auto" },
    { label: "Login Time", field: "formattedLoginTime", width: "20%" },
    { label: "IP Address", field: "ipAddress", width: "20%", align: "center" },
  ];

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
      value: `PKR ${devStats.totalRevenue?.toLocaleString()}`,
      icon: Banknote,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-3 min-h-screen">
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
      <div className="bg-white rounded-2xl p-6 shadow border border-gray-300">
        <h2 className="text-2xl font-semibold mb-4">Active Users</h2>

        {activeUsers.length === 0 ? (
          <p className="text-gray-500">No users currently logged in.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table
                columns={columns}
                data={activeUsers}
                bottomGap={false}
              />
          </div>
        )}
      </div>
    </div>
  );
}
