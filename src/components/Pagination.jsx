export default function Pagination({
  page,
  totalPages,
  onPageChange,
}) {
  if (totalPages <= 1) return null;

  const safePage = Math.min(Math.max(1, page), totalPages);
  const go = (p) => onPageChange(Math.min(Math.max(1, p), totalPages));

  const visible = [];
  const start = Math.max(1, safePage - 1);
  const end = Math.min(totalPages, safePage + 1);

  if (start > 1) visible.push(1);
  for (let i = start; i <= end; i += 1) visible.push(i);
  if (end < totalPages) visible.push(totalPages);

  return (
    <div className="flex items-center justify-between gap-3 px-2 py-3 mb-20">
      <button
        className="px-4 py-2 rounded-xl bg-white border border-gray-300 text-gray-700 font-semibold active:scale-[0.98]"
        onClick={() => go(safePage - 1)}
        disabled={safePage === 1}
      >
        Prev
      </button>

      <div className="flex items-center gap-2">
        <input
          type="number"
          min="1"
          max={totalPages}
          value={safePage}
          onChange={(e) => go(Number(e.target.value || safePage))}
          className="w-[84px] px-2 py-2 rounded-xl border border-gray-300 text-sm font-semibold text-center"
        />
        <span className="text-sm font-semibold text-gray-500">/ {totalPages}</span>
      </div>

      <button
        className="px-4 py-2 rounded-xl bg-white border border-gray-300 text-gray-700 font-semibold active:scale-[0.98]"
        onClick={() => go(safePage + 1)}
        disabled={safePage === totalPages}
      >
        Next
      </button>
    </div>
  );
}
