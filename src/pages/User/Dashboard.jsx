import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { getDateNDaysAgo } from "../../utils";
import { DollarSign, ShoppingBag, Users, Calendar, BanknoteArrowDown } from "lucide-react";
import Button from "../../components/Button.jsx";
import StatTile from "../../components/Dashboard/StatTile.jsx";
import SalesChart from "../../components/Dashboard/SalesChart.jsx";
import axiosClient from "../../api/axiosClient";

export default function Dashboard() {
  const { user } = useAuth();

  // --- Date Filtering State ---
  const today = getDateNDaysAgo(0);
  const oneWeekAgo = getDateNDaysAgo(6); // Last 7 days

  const [startDate, setStartDate] = useState(oneWeekAgo);
  const [endDate, setEndDate] = useState(today);

  // --- State for stats & chart ---
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);

  // --- Fetch Stats ---
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axiosClient.get("/dashboard/stats");
        setStats(res.data);
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };
    fetchStats();
  }, []);

  // --- Fetch Sales Chart Data ---
  useEffect(() => {
    const fetchSales = async () => {
      try {
        const res = await axiosClient.get("/dashboard/sales", {
          params: { start: startDate, end: endDate },
        });
        setChartData(res.data);
      } catch (err) {
        console.error("Error fetching sales:", err);
      }
    };
    fetchSales();
  }, [startDate, endDate]);

  useEffect(() => {
    document.title = "Dashboard | TexTradeOS";
  }, []);

  if (!stats) return <div>Loading...</div>; // You can replace with a loader component

  // --- Stat Tiles ---
  const statTilesData = [
    {
      label: "Today's Sales",
      value: `PKR ${stats.todaySales.toLocaleString()}`,
      icon: DollarSign,
      color: "text-green-500",
      bgColor: "bg-green-100",
    },
    {
      label: "Monthly Sales",
      value: `PKR ${stats.monthlySales.toLocaleString()}`,
      icon: ShoppingBag,
      color: "text-green-500",
      bgColor: "bg-green-100",
    },
    {
      label: "Today Payments",
      value: `PKR ${stats.todayPayments.toLocaleString()}`,
      icon: BanknoteArrowDown,
      color: "text-blue-500",
      bgColor: "bg-blue-100",
    },
    {
      label: "Monthly Payments",
      value: `PKR ${stats.monthlyPayments.toLocaleString()}`,
      icon: BanknoteArrowDown,
      color: "text-blue-500",
      bgColor: "bg-blue-100",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-4 p-2.5 min-h-screen">
      {/* Welcome Card */}
      <div className="flex items-center justify-between px-1.5 border-b border-gray-300 pb-3">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-xl text-gray-800">
          Welcome back,{" "}
          <strong className="text-[#127475] font-semibold">{user?.name}</strong>
        </p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statTilesData.map((stat, index) => (
          <StatTile key={index} {...stat} />
        ))}
      </div>

      {/* Sales Chart Section */}
      <div className="bg-white shadow-sm rounded-2xl p-6 border border-gray-300 space-y-5">
        <h2 className="text-[1.45rem] font-semibold text-gray-800 mb-5 flex justify-between items-center">
          Weekly Sales Performance
          <span className="text-sm font-medium text-[#127475] bg-[#127475]/18 px-5 py-4 rounded-full leading-0">
            {chartData.length} Day View
          </span>
        </h2>

        {/* Date Range Selectors */}
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col">
            <label htmlFor="startDate" className="text-sm font-medium text-gray-700 mb-1">
              Date From
            </label>
            <div className="relative">
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="pl-9 pr-3 py-2 border border-gray-300 rounded-xl text-sm appearance-none"
                max={endDate}
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex flex-col">
            <label htmlFor="endDate" className="text-sm font-medium text-gray-700 mb-1">
              Date To
            </label>
            <div className="relative">
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="pl-9 pr-3 py-2 border border-gray-300 rounded-xl text-sm appearance-none"
                min={startDate}
                max={today}
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Quick Select Buttons */}
          <Button onClick={() => { setEndDate(today); setStartDate(getDateNDaysAgo(6)); }}>
            Last 7 Days
          </Button>
          <Button onClick={() => { setEndDate(today); setStartDate(getDateNDaysAgo(29)); }}>
            Last 30 Days
          </Button>
        </div>

        <SalesChart data={chartData} />
      </div>
    </div>
  );
}