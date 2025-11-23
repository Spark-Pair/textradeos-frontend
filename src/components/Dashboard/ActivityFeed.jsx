export default function ActivityFeed({ logs }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm">
      <h3 className="font-semibold text-gray-700 mb-3">Recent Activity</h3>
      {logs.length === 0 ? (
        <p className="text-gray-500 text-sm">No activity yet.</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {logs.map((l, idx) => (
            <li key={idx} className="border-b pb-1">{l}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
