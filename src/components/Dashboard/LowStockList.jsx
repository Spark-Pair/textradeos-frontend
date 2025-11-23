export default function LowStockList({ items }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm">
      <h3 className="font-semibold text-gray-700 mb-3">Low Stock Alerts</h3>
      {items.length === 0 ? (
        <p className="text-gray-500 text-sm">No low stock items.</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {items.map((i, idx) => (
            <li key={idx} className="flex justify-between">
              <span>{i.name}</span>
              <span className="text-red-600">{i.qty}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
