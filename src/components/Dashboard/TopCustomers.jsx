export default function TopCustomers({ customers }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm">
      <h3 className="font-semibold text-gray-700 mb-3">Top Customers</h3>
      <ul className="space-y-2 text-sm">
        {customers.map((c, idx) => (
          <li key={idx} className="flex justify-between">
            <span>{c.name}</span>
            <strong>{c.amount}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}
