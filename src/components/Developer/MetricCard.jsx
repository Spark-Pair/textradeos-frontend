export default function MetricCard({ label, value, helper, Icon, tone = "teal" }) {
  const tones = {
    teal: "bg-[#e8f4f4] text-[#0c5f60]",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-rose-50 text-rose-700",
    blue: "bg-sky-50 text-sky-700",
    gray: "bg-slate-100 text-slate-700",
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase text-gray-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 truncate">{value}</p>
          {helper && <p className="mt-1 text-xs text-gray-500 truncate">{helper}</p>}
        </div>
        {Icon && (
          <div className={`shrink-0 rounded-lg p-2 ${tones[tone] || tones.teal}`}>
            <Icon size={18} />
          </div>
        )}
      </div>
    </div>
  );
}
