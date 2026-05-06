import { useState, useCallback, useRef } from "react";
import {
  ArrowUp,
  ArrowDown,
  Tag,
  UserCheck,
  Download,
  Link2,
  GitMerge,
  Trash2,
  User,
  X,
} from "lucide-react";
import type { Client } from "./clientData";
import type { ALL_COLUMNS } from "./clientData";

interface TableViewProps {
  clients: Client[];
  visibleColumns: string[];
  columnOrder: string[];
  allColumns: typeof ALL_COLUMNS;
  columnWidths: Record<string, number>;
  onColumnResize: (key: string, width: number) => void;
  onClientClick?: (client: Client) => void;
}

function isRecent(dateStr: string): boolean {
  const d = new Date(dateStr.replace(", ", "T").replace(" AM", "").replace(" PM", ""));
  const now = new Date("2026-02-24");
  const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
  return diff < 30;
}

function getCellValue(client: Client, key: string): string {
  const val = (client as Record<string, unknown>)[key];
  if (Array.isArray(val)) return val.join(", ");
  if (typeof val === "boolean") return val ? "Yes" : "No";
  if (typeof val === "number") {
    if (key === "integratedClientBalance" || key === "creditLimit")
      return `$${val.toLocaleString()}`;
    return String(val);
  }
  return String(val ?? "");
}

export function TableView({
  clients,
  visibleColumns,
  columnOrder,
  allColumns,
  columnWidths,
  onColumnResize,
  onClientClick,
}: TableViewProps) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const resizingRef = useRef<{ key: string; startX: number; startWidth: number } | null>(null);

  const orderedVisibleColumns = columnOrder
    .filter((k) => visibleColumns.includes(k))
    .map((k) => allColumns.find((c) => c.key === k)!)
    .filter(Boolean);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortedClients = [...clients].sort((a, b) => {
    if (!sortKey) return 0;
    const aVal = getCellValue(a, sortKey);
    const bVal = getCellValue(b, sortKey);
    const cmp = aVal.localeCompare(bVal, undefined, { numeric: true });
    return sortDir === "asc" ? cmp : -cmp;
  });

  const toggleRow = (id: number) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedRows.size === sortedClients.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(sortedClients.map((c) => c.id)));
    }
  };

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, key: string) => {
      e.preventDefault();
      const startX = e.clientX;
      const startWidth = columnWidths[key] || 150;
      resizingRef.current = { key, startX, startWidth };

      const handleMouseMove = (ev: MouseEvent) => {
        if (!resizingRef.current) return;
        const diff = ev.clientX - resizingRef.current.startX;
        const newWidth = Math.max(60, resizingRef.current.startWidth + diff);
        onColumnResize(resizingRef.current.key, newWidth);
      };

      const handleMouseUp = () => {
        resizingRef.current = null;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [columnWidths, onColumnResize]
  );

  const bulkActions = [
    { label: "Assign", icon: UserCheck },
    { label: "Add Tags", icon: Tag },
    { label: "Export", icon: Download },
    { label: "Add to Chain", icon: Link2 },
    { label: "Merge", icon: GitMerge },
    { label: "Delete", icon: Trash2, danger: true },
  ];

  return (
    <div className="flex flex-col flex-1 min-h-0 min-w-0">
      {/* Bulk actions bar */}
      {selectedRows.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-2 bg-[#f3f0ff] border border-[#7c3aed]/20 rounded-lg mb-3">
          <span className="text-[12px] text-[#7c3aed]" style={{ fontWeight: 600 }}>
            {selectedRows.size} selected
          </span>
          <div className="w-px h-4 bg-[#7c3aed]/20" />
          {bulkActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                className={`flex items-center gap-1 px-2.5 py-1 text-[11px] rounded-md transition-colors cursor-pointer
                  ${action.danger
                    ? "text-[#ef4444] hover:bg-[#fef2f2]"
                    : "text-[#4a4a5a] hover:bg-white"
                  }
                `}
                style={{ fontWeight: 500 }}
              >
                <Icon size={12} />
                {action.label}
              </button>
            );
          })}
          <button
            onClick={() => setSelectedRows(new Set())}
            className="ml-auto p-1 text-[#8b8b9e] hover:text-[#4a4a5a] cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 border border-[#e8e8ec] rounded-lg bg-white overflow-auto">
        <table className="border-collapse" style={{ minWidth: "max-content", width: "max-content" }}>
          <thead className="sticky top-0 z-10">
            <tr className="bg-[#fafafa]">
              <th className="sticky left-0 z-20 bg-[#fafafa] w-10 px-3 py-2.5 border-b border-[#e8e8ec]">
                <input
                  type="checkbox"
                  checked={selectedRows.size === sortedClients.length && sortedClients.length > 0}
                  onChange={toggleAll}
                  className="w-3.5 h-3.5 rounded accent-[#7c3aed] cursor-pointer"
                />
              </th>
              <th className="sticky left-10 z-20 bg-[#fafafa] w-10 px-2 py-2.5 border-b border-[#e8e8ec]" />
              {orderedVisibleColumns.map((col) => (
                <th
                  key={col.key}
                  className="px-3 py-2.5 text-left border-b border-[#e8e8ec] relative group"
                  style={{ width: columnWidths[col.key] || col.width, minWidth: 60 }}
                >
                  <button
                    onClick={() => handleSort(col.key)}
                    className="flex items-center gap-1 text-[11px] text-[#8b8b9e] hover:text-[#4a4a5a] cursor-pointer"
                    style={{ fontWeight: 600 }}
                  >
                    <span className="uppercase tracking-wider">{col.label}</span>
                    {sortKey === col.key && (
                      sortDir === "asc"
                        ? <ArrowUp size={10} />
                        : <ArrowDown size={10} />
                    )}
                  </button>
                  {/* Resize handle */}
                  <div
                    onMouseDown={(e) => handleMouseDown(e, col.key)}
                    className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-[#7c3aed]/30 transition-colors"
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedClients.map((client) => {
              const isSelected = selectedRows.has(client.id);
              return (
                <tr
                  key={client.id}
                  onClick={() => onClientClick?.(client)}
                  className={`border-b border-[#f0f0f3] transition-colors cursor-pointer
                    ${isSelected ? "bg-[#f8f6ff]" : "hover:bg-[#fafafa]"}
                  `}
                >
                  <td className="sticky left-0 z-10 bg-inherit w-10 px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleRow(client.id)}
                      className="w-3.5 h-3.5 rounded accent-[#7c3aed] cursor-pointer"
                    />
                  </td>
                  <td className="sticky left-10 z-10 bg-inherit w-10 px-2 py-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#f0eef5] flex items-center justify-center">
                      <User size={12} className="text-[#8b8b9e]" />
                    </div>
                  </td>
                  {orderedVisibleColumns.map((col) => {
                    const value = getCellValue(client, col.key);

                    // Special renders
                    if (col.key === "name") {
                      return (
                        <td key={col.key} className="px-3 py-2.5">
                          <span className="text-[13px] text-[#7c3aed] hover:underline cursor-pointer" style={{ fontWeight: 500 }}>
                            {value}
                          </span>
                        </td>
                      );
                    }
                    if (col.key === "isChain") {
                      const isChain = client.isChain;
                      return (
                        <td key={col.key} className="px-3 py-2.5">
                          <span
                            className={`px-2 py-[2px] text-[10px] rounded-full ${
                              isChain
                                ? "bg-[#f3f0ff] text-[#7c3aed]"
                                : "bg-[#f0f0f3] text-[#8b8b9e]"
                            }`}
                            style={{ fontWeight: 600 }}
                          >
                            {isChain ? "Yes" : "No"}
                          </span>
                        </td>
                      );
                    }
                    if (col.key === "integratedClientBalance") {
                      const overLimit = client.integratedClientBalance > client.creditLimit;
                      return (
                        <td key={col.key} className="px-3 py-2.5">
                          <span
                            className={`text-[12px] ${overLimit ? "text-[#ef4444]" : "text-[#4a4a5a]"}`}
                            style={{ fontWeight: overLimit ? 600 : 400 }}
                          >
                            {value}
                            {overLimit && (
                              <span className="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-[#ef4444]" />
                            )}
                          </span>
                        </td>
                      );
                    }
                    if (col.key === "creditLimit") {
                      const overLimit = client.integratedClientBalance > client.creditLimit;
                      return (
                        <td key={col.key} className="px-3 py-2.5">
                          <span className={`text-[12px] ${overLimit ? "text-[#f59e0b]" : "text-[#4a4a5a]"}`} style={{ fontWeight: 400 }}>
                            {value}
                          </span>
                        </td>
                      );
                    }
                    if (col.key === "lastSalesInvoiceTime" || col.key === "lastSalesOrderTime") {
                      const recent = isRecent(value);
                      return (
                        <td key={col.key} className="px-3 py-2.5">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${recent ? "bg-[#22c55e]" : "bg-[#ef4444]"}`} />
                            <span className="text-[12px] text-[#4a4a5a]" style={{ fontWeight: 400 }}>{value}</span>
                          </div>
                        </td>
                      );
                    }
                    if (col.key === "address" && !value) {
                      return (
                        <td key={col.key} className="px-3 py-2.5">
                          <span className="text-[12px] text-[#b0b0be] italic" style={{ fontWeight: 400 }}>No location</span>
                        </td>
                      );
                    }
                    if (col.key === "clientTags") {
                      return (
                        <td key={col.key} className="px-3 py-2.5">
                          <div className="flex gap-1 flex-wrap">
                            {client.clientTags.map((tag) => (
                              <span
                                key={tag}
                                className="px-1.5 py-[1px] bg-[#f0f0f3] text-[#4a4a5a] text-[10px] rounded"
                                style={{ fontWeight: 500 }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>
                      );
                    }

                    return (
                      <td key={col.key} className="px-3 py-2.5">
                        <span className="text-[12px] text-[#4a4a5a]" style={{ fontWeight: 400 }}>
                          {value || <span className="text-[#d0d0de]">—</span>}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}