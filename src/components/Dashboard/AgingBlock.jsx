export default function AgingBlock({ aging }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm">
      <h3 className="font-semibold text-gray-700 mb-3">Receivables Aging</h3>
      <div className="space-y-2 text-sm">
        <p>0–7 days: <strong>{aging.d0_7}</strong></p>
        <p>8–30 days: <strong>{aging.d8_30}</strong></p>
        <p className="text-red-600">30+ days: <strong>{aging.d30plus}</strong></p>
      </div>
    </div>
  );
}
