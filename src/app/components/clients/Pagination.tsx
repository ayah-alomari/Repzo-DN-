import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  total: number;
  page: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
}

export function Pagination({ total, page, perPage, onPageChange, onPerPageChange }: PaginationProps) {
  const totalPages = Math.ceil(total / perPage);
  const perPageOptions = [10, 20, 50, 100];

  const getVisiblePages = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-between px-1 py-3">
      <div className="text-[12px] text-[#8b8b9e]" style={{ fontWeight: 400 }}>
        Total: <span style={{ fontWeight: 500 }} className="text-[#4a4a5a]">{total.toLocaleString()}</span> results.
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="p-1 rounded text-[#8b8b9e] hover:bg-[#f5f5f7] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
        >
          <ChevronLeft size={14} />
        </button>

        {getVisiblePages().map((p, i) =>
          p === "..." ? (
            <span key={`dots-${i}`} className="px-1 text-[12px] text-[#8b8b9e]">···</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={`w-7 h-7 rounded text-[12px] cursor-pointer transition-colors
                ${page === p
                  ? "bg-[#7c3aed] text-white"
                  : "text-[#4a4a5a] hover:bg-[#f5f5f7]"
                }
              `}
              style={{ fontWeight: page === p ? 600 : 400 }}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="p-1 rounded text-[#8b8b9e] hover:bg-[#f5f5f7] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <select
          value={perPage}
          onChange={(e) => {
            onPerPageChange(Number(e.target.value));
            onPageChange(1);
          }}
          className="px-2 py-1 text-[12px] text-[#4a4a5a] border border-[#e8e8ec] rounded-md bg-white cursor-pointer"
          style={{ fontWeight: 400 }}
        >
          {perPageOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt} / page
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1">
          <span className="text-[11px] text-[#8b8b9e]">Go to</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            placeholder={String(page)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const v = parseInt((e.target as HTMLInputElement).value);
                if (v >= 1 && v <= totalPages) {
                  onPageChange(v);
                  (e.target as HTMLInputElement).value = "";
                }
              }
            }}
            className="w-12 px-1.5 py-1 text-[12px] text-center border border-[#e8e8ec] rounded-md bg-white outline-none focus:border-[#7c3aed]"
          />
        </div>
      </div>
    </div>
  );
}
