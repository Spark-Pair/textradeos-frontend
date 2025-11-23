export default function QuickAction({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold shadow hover:bg-blue-700 active:scale-[0.98] touch-manipulation whitespace-nowrap"
    >
      {label}
    </button>
  );
}