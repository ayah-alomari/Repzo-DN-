import { useState, useCallback } from "react";
import { X, Search, GripVertical, RotateCcw, Save } from "lucide-react";

interface Column {
  key: string;
  label: string;
  defaultVisible: boolean;
  width: number;
}

interface ColumnCustomizerProps {
  open: boolean;
  onClose: () => void;
  columns: Column[];
  visibleColumns: string[];
  columnOrder: string[];
  onToggleColumn: (key: string) => void;
  onReorder: (order: string[]) => void;
  onReset: () => void;
}

export function ColumnCustomizer({
  open,
  onClose,
  columns,
  visibleColumns,
  columnOrder,
  onToggleColumn,
  onReorder,
  onReset,
}: ColumnCustomizerProps) {
  const [search, setSearch] = useState("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);

  const orderedColumns = columnOrder
    .map((key) => columns.find((c) => c.key === key)!)
    .filter(Boolean);

  const filteredColumns = orderedColumns.filter((c) =>
    c.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleDragStart = useCallback((index: number) => {
    setDragIndex(index);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    const newOrder = [...columnOrder];
    const [moved] = newOrder.splice(dragIndex, 1);
    newOrder.splice(index, 0, moved);
    onReorder(newOrder);
    setDragIndex(index);
  }, [dragIndex, columnOrder, onReorder]);

  const handleDragEnd = useCallback(() => {
    setDragIndex(null);
  }, []);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-[340px] bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#e8e8ec]">
          <h3 className="text-[14px] text-[#1a1a2e]" style={{ fontWeight: 600 }}>
            Customize Columns
          </h3>
          <button onClick={onClose} className="p-1 text-[#8b8b9e] hover:text-[#4a4a5a] cursor-pointer">
            <X size={16} />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 px-2.5 py-1.5 bg-[#f5f5f7] rounded-md border border-[#e8e8ec]">
            <Search size={13} className="text-[#8b8b9e]" />
            <input
              type="text"
              placeholder="Search columns..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 text-[12px] text-[#1a1a2e] bg-transparent outline-none placeholder:text-[#b0b0be]"
            />
          </div>
          <div className="text-[10px] text-[#8b8b9e] mt-2" style={{ fontWeight: 400 }}>
            {visibleColumns.length} of {columns.length} columns visible · Drag to reorder
          </div>
        </div>

        {/* Column List */}
        <div className="flex-1 overflow-y-auto px-4">
          {filteredColumns.map((col, index) => {
            const isVisible = visibleColumns.includes(col.key);
            return (
              <div
                key={col.key}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-2 px-2 py-2 rounded-md mb-0.5 transition-colors group
                  ${dragIndex === index ? "bg-[#f0eef5] opacity-60" : "hover:bg-[#f9f9fb]"}
                `}
              >
                <GripVertical
                  size={13}
                  className="text-[#d0d0de] group-hover:text-[#8b8b9e] cursor-grab flex-shrink-0"
                />
                <label className="flex items-center gap-2.5 flex-1 cursor-pointer min-w-0">
                  <div
                    onClick={(e) => {
                      e.preventDefault();
                      onToggleColumn(col.key);
                    }}
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer
                      ${isVisible
                        ? "bg-[#7c3aed] border-[#7c3aed]"
                        : "border-[#d0d0de] hover:border-[#8b8b9e]"
                      }
                    `}
                  >
                    {isVisible && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span className="text-[12px] text-[#4a4a5a] truncate" style={{ fontWeight: 400 }}>
                    {col.label}
                  </span>
                </label>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-[#e8e8ec] px-4 py-3 flex items-center gap-2">
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-[#8b8b9e] border border-[#e8e8ec] rounded-md hover:bg-[#f5f5f7] cursor-pointer"
            style={{ fontWeight: 500 }}
          >
            <RotateCcw size={12} />
            Reset
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-white bg-[#7c3aed] rounded-md hover:bg-[#6d28d9] cursor-pointer ml-auto"
            style={{ fontWeight: 500 }}
          >
            <Save size={12} />
            {saved ? "Saved!" : "Save as Default"}
          </button>
        </div>
      </div>
    </>
  );
}
