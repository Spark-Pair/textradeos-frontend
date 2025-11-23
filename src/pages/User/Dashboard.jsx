import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { getDateNDaysAgo, generateMockData } from "../../utils";
import { DollarSign, ShoppingBag, Clock, Users, Calendar, } from "lucide-react";
import StatTile from "../../components/Dashboard/StatTile.jsx";

const SalesChart = ({ data }) => {
  const width = 800;
  const height = 250;
  const padding = 30;

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No sales data available for this date range.
      </div>
    );
  }

  const amounts = data.map(d => d.amount);
  const minAmount = Math.min(...amounts) * 0.9;
  const maxAmount = Math.max(...amounts) * 1.1;

  const getX = (index) => padding + (index / (data.length - 1)) * (width - 2 * padding);
  const getY = (amount) => height - padding - ((amount - minAmount) / (maxAmount - minAmount)) * (height - 2 * padding);

  // Generate SVG path string
  const pathData = data.map((d, i) => {
    const x = getX(i);
    const y = getY(d.amount);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  // Format Y-axis labels
  const formatAmount = (num) => {
    if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
    return num.toLocaleString();
  };

  const yAxisTicks = [minAmount, (minAmount + maxAmount) / 2, maxAmount].map(
    (n) => ({ value: n, y: getY(n) })
  );

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        {/* Y-Axis Lines and Labels */}
        {yAxisTicks.map((tick, index) => (
          <g key={index}>
            <line
              x1={padding}
              y1={tick.y}
              x2={width - padding}
              y2={tick.y}
              stroke="#e5e7eb" // Tailwind gray-200
              strokeDasharray={index === 0 || index === 2 ? '0' : '4 4'}
            />
            <text
              x={padding - 5}
              y={tick.y + 4}
              fontSize="12"
              fill="#6b7280" // Tailwind gray-500
              textAnchor="end"
            >
              {formatAmount(tick.value)}
            </text>
          </g>
        ))}

        {/* X-Axis Labels (Dates) */}
        {data.map((d, i) => {
          const x = getX(i);
          return (
            <text
              key={i}
              x={x}
              y={height - padding + 15}
              fontSize="10"
              fill="#6b7280"
              textAnchor="middle"
            >
              {d.date.substring(5).replace('-', '/')} {/* MM/DD */}
            </text>
          );
        })}

        {/* The Line */}
        <path
          d={pathData}
          fill="none"
          stroke="#4f46e5" // Indigo-600
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Points and Tooltips */}
        {data.map((d, i) => {
          const x = getX(i);
          const y = getY(d.amount);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="4"
              fill="#4f46e5" // Indigo-600
              stroke="#ffffff"
              strokeWidth="2"
              className="cursor-pointer transition-all duration-100 hover:r-6 hover:fill-indigo-400"
              title={`Date: ${d.date}, Sales: PKR ${d.amount.toLocaleString()}`}
            />
          );
        })}
      </svg>
    </div>
  );
};

// --- AgingBlock Component ---
const AgingBlock = ({ aging }) => {
  const total = aging.d0_7 + aging.d8_30 + aging.d30plus;

  const getColor = (key) => {
    if (key === "d0_7") return "bg-green-500";
    if (key === "d8_30") return "bg-yellow-500";
    if (key === "d30plus") return "bg-red-500";
    return "bg-gray-200";
  };

  const agingItems = [
    { label: "0-7 Days", key: "d0_7", amount: aging.d0_7 },
    { label: "8-30 Days", key: "d8_30", amount: aging.d8_30 },
    { label: "30+ Days (Critical)", key: "d30plus", amount: aging.d30plus },
  ];

  return (
    <div className="space-y-4">
      <div className="w-full h-3 flex rounded-full overflow-hidden">
        {Object.keys(aging).map((key) => (
          <div
            key={key}
            className={`${getColor(key)}`}
            style={{ width: `${(aging[key] / total) * 100}%` }}
            title={`${key}: PKR ${aging[key]}`}
          ></div>
        ))}
      </div>
      <div className="space-y-3">
        {agingItems.map((item) => (
          <div
            key={item.key}
            className="flex justify-between items-center text-sm"
          >
            <div className="flex items-center">
              <span
                className={`w-3 h-3 rounded-full ${getColor(item.key)} mr-2`}
              ></span>
              <span className="text-gray-700">{item.label}</span>
            </div>
            <span className="font-semibold text-gray-800">
              PKR {item.amount.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
      <p className="text-sm pt-2 text-gray-500">
        Total Outstanding: PKR {total.toLocaleString()}
      </p>
    </div>
  );
};

// --- LowStockList Component ---
const LowStockList = ({ items }) => {
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div
          key={index}
          className="flex justify-between items-center p-3 border border-red-200 bg-red-50 rounded-lg"
        >
          <span className="text-sm font-medium text-red-700">{item.name}</span>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono text-red-500">Qty:</span>
            <span className="text-lg font-bold text-red-800">{item.qty}</span>
          </div>
        </div>
      ))}
      <button className="w-full mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition duration-150 text-center">
        View All Stock Alerts
      </button>
    </div>
  );
};

// --- TopCustomers Component ---
const TopCustomers = ({ customers }) => {
  return (
    <div className="space-y-3">
      {customers.map((customer, index) => (
        <div
          key={index}
          className="flex justify-between items-center p-3 border-b last:border-b-0"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm">
              {customer.name.charAt(0)}
            </div>
            <span className="text-sm font-medium text-gray-800">
              {customer.name}
            </span>
          </div>
          <span className="text-md font-semibold text-green-600">
            {customer.amount}
          </span>
        </div>
      ))}
      <button className="w-full mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition duration-150 text-center">
        Analyze All Customers
      </button>
    </div>
  );
};

// --- ActivityFeed Component ---
const ActivityFeed = ({ logs }) => {
  return (
    <div className="space-y-4">
      {logs.map((log, index) => (
        <div key={index} className="flex items-start space-x-3">
          <div className="w-2 h-2 mt-2 rounded-full bg-indigo-500 flex-shrink-0"></div>
          <p className="text-sm text-gray-700">
            <span className="font-medium">{log}</span>
            <span className="text-gray-500 ml-2 text-xs">just now</span>
          </p>
        </div>
      ))}
      <button className="w-full mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition duration-150 text-center">
        View Full Audit Log
      </button>
    </div>
  );
};

// --- MAIN DASHBOARD COMPONENT ---
export default function Dashboard() {
  // Use the mock hook
  const { user } = useAuth();

  // --- Date Filtering State ---
  const today = getDateNDaysAgo(0);
  const oneWeekAgo = getDateNDaysAgo(6); // Default: Last 7 days including today

  const [startDate, setStartDate] = useState(oneWeekAgo);
  const [endDate, setEndDate] = useState(today);

  // --- Mock Data (unchanged) ---
  const [stats] = useState({
    todaySales: 12500,
    monthlySales: 320000,
    pendingPayments: 145000,
    customers: 82,
  });

  const [chartData] = useState([
    { day: "Mon", amount: 12000 },
    { day: "Tue", amount: 8000 },
    { day: "Wed", amount: 15000 },
    { day: "Thu", amount: 6000 },
    { day: "Fri", amount: 18000 },
    { day: "Sat", amount: 20000 },
  ]);

  const [aging] = useState({
    d0_7: 45000,
    d8_30: 60000,
    d30plus: 40000,
  });
  
  // Generate 30 days of mock data
  const [allChartData] = useState(generateMockData(30));

  // Filter chart data based on selected dates
  const filteredChartData = useMemo(() => {
    return allChartData.filter(d => {
      // Check if data date is between startDate (inclusive) and endDate (inclusive)
      return d.date >= startDate && d.date <= endDate;
    }).sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort data chronologically
  }, [allChartData, startDate, endDate]);

  const [lowStock] = useState([
    { name: "Blue Denim Roll", qty: 4 },
    { name: "Cotton White XL", qty: 2 },
  ]);

  const [topCustomers] = useState([
    { name: "Al-Hammad Traders", amount: "PKR 85,000" },
    { name: "Zain Garments", amount: "PKR 62,000" },
  ]);

  const [logs] = useState([
    "Invoice #124 created",
    "Payment received from Zain Garments",
    "Added new article: Linen Maroon",
  ]);

  useEffect(() => {
    document.title = "Dashboard | TexTradeOS";
  }, []);
  // --- End Mock Data ---

  const statTilesData = [
    {
      label: "Today's Sales",
      value: `PKR ${stats.todaySales.toLocaleString()}`,
      icon: DollarSign, // Replaced
      color: "text-blue-500",
      bgColor: "bg-blue-100",
    },
    {
      label: "Monthly Sales",
      value: `PKR ${stats.monthlySales.toLocaleString()}`,
      icon: ShoppingBag, // Replaced
      color: "text-green-500",
      bgColor: "bg-green-100",
    },
    {
      label: "Pending Payments",
      value: `PKR ${stats.pendingPayments.toLocaleString()}`,
      icon: Clock, // Replaced
      color: "text-red-500",
      bgColor: "bg-red-100",
    },
    {
      label: "Total Customers",
      value: stats.customers.toLocaleString(),
      icon: Users, // Replaced
      color: "text-orange-500",
      bgColor: "bg-orange-100",
    },
  ];

  return (
    <div className="space-y-4 p-2.5 min-h-screen">
      
      {/* Modern Welcome Card - Shadow reduced, border added */}
      <div className="flex items-center justify-between px-1.5 border-b border-gray-300 pb-3">
        <h1 className="text-3xl font-bold text-gray-800">
          Dashboard
        </h1>
        <p className="text-xl text-gray-800">
          Welcome back,{" "}
          <strong className="text-indigo-600 font-semibold">{user?.name}</strong>
        </p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statTilesData.map((stat, index) => (
          <StatTile
            key={index}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            bgColor={stat.bgColor}
          />
        ))}
      </div>

      {/* Main Content Grid: Chart + Aging */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sales Chart with Date Filters */}
        <div className="lg:col-span-2 bg-white shadow-md rounded-2xl p-6 border border-gray-300">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Weekly Sales Performance
          </h2>
          
          {/* Date Range Selectors */}
          <div className="flex flex-wrap items-end gap-4 mb-6">
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
                  className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  max={endDate} // Cannot select a date after the end date
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
                  className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  min={startDate} // Cannot select a date before the start date
                  max={today}
                />
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            
            {/* Quick Select Buttons */}
            <button
              onClick={() => {
                setEndDate(today);
                setStartDate(getDateNDaysAgo(6));
              }}
              className="px-3 py-2 bg-indigo-100 text-indigo-600 text-sm font-medium rounded-lg hover:bg-indigo-200 transition"
            >
              Last 7 Days (Default)
            </button>
          </div>

          <SalesChart data={filteredChartData} />
        </div>

        {/* Aging Block - Shadow reduced, border added */}
        <div className="lg:col-span-1 bg-white shadow-md rounded-2xl p-6 border border-gray-300">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Accounts Aging
          </h2>
          <AgingBlock aging={aging} />
        </div>
      </div>

      {/* Secondary Content Grid: Low Stock, Top Customers, Activity Log */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Low Stock (1/3) - Shadow reduced, border added */}
        <div className="bg-white shadow-md rounded-2xl p-6 lg:col-span-1 border border-gray-300">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            🚨 Low Stock Alerts
          </h2>
          <LowStockList items={lowStock} />
        </div>

        {/* Top Customers (1/3) - Shadow reduced, border added */}
        <div className="bg-white shadow-md rounded-2xl p-6 lg:col-span-1 border border-gray-300">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            💎 Top Customers (MTD)
          </h2>
          <TopCustomers customers={topCustomers} />
        </div>

        {/* Activity Log (1/3) - Shadow reduced, border added */}
        <div className="bg-white shadow-md rounded-2xl p-6 lg:col-span-1 border border-gray-300">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            🚀 Recent Activity
          </h2>
          <ActivityFeed logs={logs} />
        </div>
      </div>
    </div>
  );
}