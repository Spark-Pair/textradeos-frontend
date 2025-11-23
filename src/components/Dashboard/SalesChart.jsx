import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function SalesChart({ data }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm h-72">
      <h3 className="font-semibold text-gray-700 mb-3">Sales Trend</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data ?? []}>
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="amount" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
