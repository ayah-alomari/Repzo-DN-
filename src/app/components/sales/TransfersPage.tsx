import { useState } from "react";
import { useAppData } from "../../context/AppDataContext";
import { Download, Search, Filter, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Eye, ArrowLeftRight } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../ui/table";
import { Checkbox } from "../ui/checkbox";
import { BulkActionBar } from "./BulkActionBar";
import type { TransferStatus, TransferType } from "../../context/AppDataContext";

interface TransfersPageProps {
  onTransferClick?: (id: string) => void;
}

const TypeBadge = ({ type }: { type: TransferType }) => {
  const map: Record<TransferType, string> = {
    LOAD:     "bg-blue-50 text-blue-700 border-blue-200",
    UNLOAD:   "bg-purple-50 text-purple-700 border-purple-200",
    TRANSFER: "bg-teal-50 text-teal-700 border-teal-200",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-semibold border ${map[type]}`}>
      {type}
    </span>
  );
};

const StatusBadge = ({ status }: { status: TransferStatus }) => {
  const map: Record<TransferStatus, string> = {
    PENDING:   "bg-amber-50 text-amber-700 border-amber-200",
    COMPLETED: "bg-green-50 text-green-700 border-green-200",
    CANCELED:  "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-semibold border ${map[status]}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
};

const PAGE_SIZE = 10;

export function TransfersPage({ onTransferClick }: TransfersPageProps) {
  const { transferList } = useAppData();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [quickFilter, setQuickFilter] = useState<"all" | "pending" | "failed">("all");
  const [filters, setFilters] = useState<{ id: string; field: string; value: string }[]>([]);
  const [tempFilters, setTempFilters] = useState<{ id: string; field: string; value: string }[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const addFilter = () =>
    setTempFilters([...tempFilters, { id: Math.random().toString(), field: "Status", value: "" }]);
  const updateTempFilter = (id: string, key: "field" | "value", val: string) =>
    setTempFilters(tempFilters.map(f => f.id === id ? { ...f, [key]: val } : f));
  const removeTempFilter = (id: string) =>
    setTempFilters(tempFilters.filter(f => f.id !== id));
  const applyFilters = () => { setFilters(tempFilters); setIsFilterOpen(false); };
  const resetFilters = () => { setFilters([]); setTempFilters([]); };

  const filtered = transferList.filter(t => {
    if (quickFilter === "pending" && t.status !== "PENDING") return false;
    if (quickFilter === "failed" && t.status !== "CANCELED") return false;
    if (filters.length > 0) {
      const match = filters.every(f => {
        if (!f.value) return true;
        const v = f.value.toLowerCase();
        if (f.field === "Status") return t.status.toLowerCase() === v;
        if (f.field === "Type") return t.type.toLowerCase() === v;
        if (f.field === "Serial #") return t.serialNo.toLowerCase().includes(v);
        if (f.field === "Created At") return t.createdAt.toLowerCase().includes(v);
        if (f.field === "Created By") return t.createdBy.toLowerCase().includes(v);
        if (f.field === "From") return t.from.toLowerCase().includes(v);
        if (f.field === "To") return t.to.toLowerCase().includes(v);
        if (f.field === "Custom Status") return (t.customStatus ?? "").toLowerCase().includes(v);
        return true;
      });
      if (!match) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.serialNo.toLowerCase().includes(q) ||
        t.createdBy.toLowerCase().includes(q) ||
        t.from.toLowerCase().includes(q) ||
        t.to.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (!sortField) return 0;
    const getVal = (item: typeof a) => {
      const map: Record<string, string> = {
        "Serial #":      item.serialNo,
        "Created At":    item.createdAt,
        "Created By":    item.createdBy,
        "From":          item.from,
        "To":            item.to,
        "Type":          item.type,
        "Status":        item.status,
        "Custom Status": item.customStatus ?? "",
        "Products":      String(item.numberOfProducts),
      };
      return String(map[sortField] ?? "").toLowerCase();
    };
    const aVal = getVal(a), bVal = getVal(b);
    return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const toggleSelectAll = () => {
    if (selectedIds.size === paginated.length && paginated.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginated.map(t => t.id)));
    }
  };
  const toggleSelect = (id: string) => {
    const s = new Set(selectedIds);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelectedIds(s);
  };

  const getFieldSuggestions = (field: string): string[] => {
    const map: Record<string, () => string[]> = {
      'Serial #':      () => transferList.map(t => t.serialNo),
      'Created At':    () => transferList.map(t => t.createdAt),
      'Created By':    () => transferList.map(t => t.createdBy),
      'From':          () => transferList.map(t => t.from),
      'To':            () => transferList.map(t => t.to),
      'Custom Status': () => transferList.map(t => t.customStatus ?? ""),
    };
    return [...new Set((map[field]?.() ?? []).filter(Boolean))].sort();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#e8e8ec]">
        <div className="flex items-center gap-3">
          <ArrowLeftRight className="w-5 h-5 text-[#4a4a5a]" />
          <span className="text-[14px] font-semibold text-[#1a1a2e]">Transfers</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-[#e8e8ec] rounded-md text-[13px] font-medium text-[#1a1a2e] hover:bg-[#f7f7f9] transition-colors">
            <Download className="w-4 h-4 text-[#4a4a5a]" /> Export to Excel
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#4f6ef7] hover:bg-[#3b5bdb] text-white rounded-md text-[13px] font-semibold transition-colors shadow-sm">
            + Create Transfer
          </button>
        </div>
      </div>

      <div className="flex flex-col flex-1 p-6 overflow-hidden">
        <h1 className="text-[20px] font-bold text-[#1a1a2e] mb-6 flex items-center gap-2">
          <ArrowLeftRight className="w-5 h-5 text-[#4f6ef7]" />
          Transfers
        </h1>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b8b9e]" />
            <input
              type="text"
              placeholder="Search transfers..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-2 rounded-md border border-[#e8e8ec] text-[13px] placeholder:text-[#b0b0be] outline-none focus:border-[#4f6ef7]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Popover open={isFilterOpen} onOpenChange={open => { setIsFilterOpen(open); if (open) setTempFilters([...filters]); }}>
              <PopoverTrigger asChild>
                <button className="p-2 border border-[#e8e8ec] rounded-md text-[#4a4a5a] hover:bg-[#f7f7f9] data-[state=open]:bg-[#f7f7f9]">
                  <Filter className="w-4 h-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0 shadow-lg border border-[#e8e8ec] rounded-lg bg-white" align="end" sideOffset={6}>
                <div className="p-4 border-b border-[#e8e8ec]">
                  <h3 className="font-semibold text-[#1a1a2e] text-[15px]">Filters</h3>
                </div>
                <div className="p-4 space-y-3">
                  {tempFilters.map(f => (
                    <div key={f.id} className="flex items-center gap-2">
                      <select
                        value={f.field}
                        onChange={e => updateTempFilter(f.id, "field", e.target.value)}
                        className="flex-1 border border-[#e8e8ec] rounded-md px-2 py-1.5 text-[12px] outline-none"
                      >
                        <option>Status</option>
                        <option>Type</option>
                        <option>Serial #</option>
                        <option>Created At</option>
                        <option>Created By</option>
                        <option>From</option>
                        <option>To</option>
                        <option>Custom Status</option>
                      </select>
                      {(f.field === "Status" || f.field === "Type") ? (
                        <select
                          value={f.value}
                          onChange={e => updateTempFilter(f.id, "value", e.target.value)}
                          className="flex-1 border border-[#e8e8ec] rounded-md px-2 py-1.5 text-[12px] outline-none"
                        >
                          <option value="">Any</option>
                          {f.field === "Status" && <>
                            <option>PENDING</option>
                            <option>COMPLETED</option>
                            <option>CANCELED</option>
                          </>}
                          {f.field === "Type" && <>
                            <option>LOAD</option>
                            <option>UNLOAD</option>
                            <option>TRANSFER</option>
                          </>}
                        </select>
                      ) : (
                        <>
                          <input
                            type="text"
                            value={f.value}
                            onChange={e => updateTempFilter(f.id, "value", e.target.value)}
                            list={`filter-list-${f.id}`}
                            placeholder="Type to filter..."
                            className="flex-1 border border-[#e8e8ec] rounded-md px-2 py-1.5 text-[12px] outline-none"
                          />
                          <datalist id={`filter-list-${f.id}`}>
                            {getFieldSuggestions(f.field).map(v => <option key={v} value={v} />)}
                          </datalist>
                        </>
                      )}
                      <button onClick={() => removeTempFilter(f.id)} className="text-red-400 hover:text-red-600 text-[18px] leading-none">&times;</button>
                    </div>
                  ))}
                  <button onClick={addFilter} className="text-[12px] text-[#4f6ef7] hover:underline">+ Add filter</button>
                </div>
                <div className="flex items-center justify-between p-4 border-t border-[#e8e8ec]">
                  <button onClick={resetFilters} className="text-[12px] text-red-500 hover:underline">Reset</button>
                  <button onClick={applyFilters} className="px-4 py-1.5 bg-[#4f6ef7] text-white text-[12px] font-semibold rounded-md hover:bg-[#3b5bdb]">Apply</button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[12px] text-[#8b8b9e]">Total Records</span>
          <span className="text-[12px] font-semibold text-[#1a1a2e]">{filtered.length}</span>
        </div>

        <BulkActionBar
          isAllChecked={selectedIds.size === paginated.length && paginated.length > 0}
          onCheckAll={toggleSelectAll}
          activeFilter={quickFilter}
          onFilterChange={f => { setQuickFilter(f); setCurrentPage(1); }}
        />

        {/* Table */}
        <div className="flex-1 overflow-hidden border border-[#e8e8ec] rounded-lg shadow-sm bg-white flex flex-col">
          <div className="flex-1 overflow-auto custom-scrollbar">
            <Table className="min-w-max w-full">
              <TableHeader className="bg-[#f7f7f9] sticky top-0 z-10 border-b border-[#e8e8ec]">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-10 text-center">
                    <Checkbox
                      checked={selectedIds.size === paginated.length && paginated.length > 0}
                      onCheckedChange={toggleSelectAll}
                      className="mx-auto"
                    />
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("Serial #")}
                    className="cursor-pointer select-none text-[11px] font-bold text-[#4a4a5a] uppercase tracking-wide hover:bg-[#ededf3] transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      Serial #
                      {sortField === "Serial #"
                        ? sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-[#4f6ef7]" /> : <ChevronDown className="w-3 h-3 text-[#4f6ef7]" />
                        : <ChevronUp className="w-3 h-3 text-[#c0c0ce]" />
                      }
                    </div>
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("Created At")}
                    className="cursor-pointer select-none text-[11px] font-bold text-[#4a4a5a] uppercase tracking-wide hover:bg-[#ededf3] transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      Created At
                      {sortField === "Created At"
                        ? sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-[#4f6ef7]" /> : <ChevronDown className="w-3 h-3 text-[#4f6ef7]" />
                        : <ChevronUp className="w-3 h-3 text-[#c0c0ce]" />
                      }
                    </div>
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("Created By")}
                    className="cursor-pointer select-none text-[11px] font-bold text-[#4a4a5a] uppercase tracking-wide hover:bg-[#ededf3] transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      Created By
                      {sortField === "Created By"
                        ? sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-[#4f6ef7]" /> : <ChevronDown className="w-3 h-3 text-[#4f6ef7]" />
                        : <ChevronUp className="w-3 h-3 text-[#c0c0ce]" />
                      }
                    </div>
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("From")}
                    className="cursor-pointer select-none text-[11px] font-bold text-[#4a4a5a] uppercase tracking-wide hover:bg-[#ededf3] transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      From
                      {sortField === "From"
                        ? sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-[#4f6ef7]" /> : <ChevronDown className="w-3 h-3 text-[#4f6ef7]" />
                        : <ChevronUp className="w-3 h-3 text-[#c0c0ce]" />
                      }
                    </div>
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("To")}
                    className="cursor-pointer select-none text-[11px] font-bold text-[#4a4a5a] uppercase tracking-wide hover:bg-[#ededf3] transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      To
                      {sortField === "To"
                        ? sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-[#4f6ef7]" /> : <ChevronDown className="w-3 h-3 text-[#4f6ef7]" />
                        : <ChevronUp className="w-3 h-3 text-[#c0c0ce]" />
                      }
                    </div>
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("Type")}
                    className="cursor-pointer select-none text-[11px] font-bold text-[#4a4a5a] uppercase tracking-wide hover:bg-[#ededf3] transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      Type
                      {sortField === "Type"
                        ? sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-[#4f6ef7]" /> : <ChevronDown className="w-3 h-3 text-[#4f6ef7]" />
                        : <ChevronUp className="w-3 h-3 text-[#c0c0ce]" />
                      }
                    </div>
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("Status")}
                    className="cursor-pointer select-none text-[11px] font-bold text-[#4a4a5a] uppercase tracking-wide hover:bg-[#ededf3] transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      Status
                      {sortField === "Status"
                        ? sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-[#4f6ef7]" /> : <ChevronDown className="w-3 h-3 text-[#4f6ef7]" />
                        : <ChevronUp className="w-3 h-3 text-[#c0c0ce]" />
                      }
                    </div>
                  </TableHead>
                  <TableHead className="text-[11px] font-bold text-[#4a4a5a] uppercase tracking-wide">Custom Status</TableHead>
                  <TableHead className="text-[11px] font-bold text-[#4a4a5a] uppercase tracking-wide">Process Time</TableHead>
                  <TableHead
                    onClick={() => handleSort("Products")}
                    className="cursor-pointer select-none text-[11px] font-bold text-[#4a4a5a] uppercase tracking-wide text-right hover:bg-[#ededf3] transition-colors"
                  >
                    <div className="flex items-center justify-end gap-1">
                      Products
                      {sortField === "Products"
                        ? sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-[#4f6ef7]" /> : <ChevronDown className="w-3 h-3 text-[#4f6ef7]" />
                        : <ChevronUp className="w-3 h-3 text-[#c0c0ce]" />
                      }
                    </div>
                  </TableHead>
                  <TableHead className="text-[11px] font-bold text-[#4a4a5a] uppercase tracking-wide text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center text-[13px] text-[#8b8b9e] py-12">
                      No transfers found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map(t => (
                    <TableRow
                      key={t.id}
                      className="hover:bg-[#f7f8ff] transition-colors cursor-pointer border-b border-[#f0f0f4]"
                      onClick={() => onTransferClick?.(t.id)}
                    >
                      <TableCell className="text-center" onClick={e => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedIds.has(t.id)}
                          onCheckedChange={() => toggleSelect(t.id)}
                          className="mx-auto"
                        />
                      </TableCell>
                      <TableCell className="text-[13px] font-semibold text-[#4f6ef7]">{t.serialNo}</TableCell>
                      <TableCell className="text-[12px] text-[#4a4a5a]">{t.createdAt}</TableCell>
                      <TableCell className="text-[12px] text-[#4a4a5a]">{t.createdBy}</TableCell>
                      <TableCell className="text-[12px] text-[#4a4a5a]">{t.from}</TableCell>
                      <TableCell className="text-[12px] text-[#4a4a5a]">{t.to}</TableCell>
                      <TableCell><TypeBadge type={t.type} /></TableCell>
                      <TableCell><StatusBadge status={t.status} /></TableCell>
                      <TableCell className="text-[12px] text-[#8b8b9e]">{t.customStatus ?? "—"}</TableCell>
                      <TableCell className="text-[12px] text-[#4a4a5a]">{t.processTime ?? "—"}</TableCell>
                      <TableCell className="text-[12px] font-semibold text-[#4a4a5a] text-right">{t.numberOfProducts}</TableCell>
                      <TableCell className="text-center" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => onTransferClick?.(t.id)}
                          className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#e8e8ec] bg-white shrink-0">
            <span className="text-[12px] text-[#8b8b9e]">
              Showing {filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length} records
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 hover:bg-[#f7f7f9] rounded disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[12px] font-semibold text-[#1a1a2e] px-2">{currentPage} / {totalPages}</span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1 hover:bg-[#f7f7f9] rounded disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
