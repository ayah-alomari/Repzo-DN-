import { useState, useEffect } from "react";
import { useAppData } from "../../context/AppDataContext";
import {
  Download,
  Search,
  Filter,
  Settings2,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  PackageX,
  CheckCircle2,
  Clock,
  Warehouse,
  Menu,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "../ui/table";
import { Checkbox } from "../ui/checkbox";
import { BulkActionBar } from "./BulkActionBar";

import { UnloadRecord } from "../../context/AppDataContext";

interface UnloadPageProps {
  onUnloadClick?: (unloadId: string) => void;
}

const StatusBadge = ({ status }: { status: UnloadRecord["status"] }) => {
  if (status === "Pending Unload")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
        <Clock className="w-3 h-3" /> Pending Unload
      </span>
    );
  if (status === "Unloaded" || status === "Accepted")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[11px] font-medium bg-green-50 text-green-700 border border-green-200">
        <CheckCircle2 className="w-3 h-3" /> {status}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[11px] font-medium bg-red-50 text-red-700 border border-red-200">
      {status}
    </span>
  );
};

export function UnloadPage({ onUnloadClick }: UnloadPageProps) {
  const { unloadList: records } = useAppData();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<{ id: string; field: string; value: string }[]>([]);
  const [tempFilters, setTempFilters] = useState<{ id: string; field: string; value: string }[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    if (isFilterOpen) setTempFilters([...filters]);
  }, [isFilterOpen, filters]);

  const addFilter = () =>
    setTempFilters([...tempFilters, { id: Math.random().toString(), field: "Status", value: "" }]);
  const updateTempFilter = (id: string, key: "field" | "value", val: string) =>
    setTempFilters(tempFilters.map(f => (f.id === id ? { ...f, [key]: val } : f)));
  const removeTempFilter = (id: string) =>
    setTempFilters(tempFilters.filter(f => f.id !== id));
  const applyFilters = () => { setFilters(tempFilters); setIsFilterOpen(false); };
  const resetFilters = () => { setFilters([]); setTempFilters([]); };

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

  const [quickFilter, setQuickFilter] = useState<"all" | "pending" | "failed">("all");

  const filtered = records.filter(r => {
    if (quickFilter === "pending" && r.status !== "Pending Unload") return false;
    if (quickFilter === "failed" && r.status !== "Rejected") return false;
    if (filters.length > 0) {
      const match = filters.every(f => {
        if (!f.value) return true;
        const v = f.value.toLowerCase();
        if (f.field === "Status") return r.status.toLowerCase() === v;
        if (f.field === "Rep") return r.rep.toLowerCase().includes(v);
        if (f.field === "DN Number") return r.dnNumber.toLowerCase().includes(v);
        if (f.field === "Original Warehouse") return r.originalWarehouse.toLowerCase().includes(v);
        if (f.field === "Unload Warehouse") return r.unloadWarehouse.toLowerCase().includes(v);
        if (f.field === "Created By") return r.createdBy.toLowerCase().includes(v);
        if (f.field === "Client") return r.client.toLowerCase().includes(v);
        if (f.field === "Date") return r.date.toLowerCase().includes(v);
        if (f.field === "Cancellation Reason") return (r.cancellationReason ?? "").toLowerCase().includes(v);
        return true;
      });
      if (!match) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return r.dnNumber.toLowerCase().includes(q) || r.rep.toLowerCase().includes(q) || r.client.toLowerCase().includes(q);
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (!sortField) return 0;
    const getVal = (item: typeof a) => {
      const map: Record<string, string> = {
        "DN Number":          item.dnNumber,
        "Rep":                item.rep,
        "Created By":         item.createdBy,
        "Client":             item.client,
        "Status":             item.status,
        "Date":               item.date,
        "Original Warehouse": item.originalWarehouse,
        "Unload Warehouse":   item.unloadWarehouse,
      };
      return String(map[sortField] ?? "").toLowerCase();
    };
    const aVal = getVal(a), bVal = getVal(b);
    return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSelectAll = () => {
    if (selectedIds.size === paginated.length && paginated.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginated.map((r) => r.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const getFieldSuggestions = (field: string): string[] => {
    const map: Record<string, () => string[]> = {
      'DN Number':           () => records.map(r => r.dnNumber),
      'Original Warehouse':  () => records.map(r => r.originalWarehouse),
      'Unload Warehouse':    () => records.map(r => r.unloadWarehouse),
      'Created By':          () => records.map(r => r.createdBy),
      'Client':              () => records.map(r => r.client),
      'Date':                () => records.map(r => r.date),
      'Cancellation Reason': () => records.map(r => r.cancellationReason ?? ""),
    };
    return [...new Set((map[field]?.() ?? []).filter(Boolean))].sort();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden relative">
      {/* Top Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#e8e8ec]">
        <div className="flex items-center gap-4">
          <Menu className="w-5 h-5 text-[#4a4a5a] cursor-pointer" />
          <div className="flex items-center bg-[#f7f7f9] p-1 rounded-full text-[13px] font-medium text-[#4a4a5a]">
            <button className="px-4 py-1.5 rounded-full bg-white shadow-sm text-[#1a1a2e]">DN Unloads</button>
          </div>
        </div>
        <div className="flex flex-1 justify-end items-center gap-4">
          <button className="flex items-center gap-2 px-4 py-2 border border-[#e8e8ec] rounded-md text-[13px] font-medium text-[#1a1a2e] hover:bg-[#f7f7f9] transition-colors">
            <Download className="w-4 h-4 text-[#4a4a5a]" /> Export to Excel
          </button>
        </div>
      </div>

      <div className="flex flex-col flex-1 p-6 overflow-hidden">
        <h1 className="text-[20px] font-bold text-[#1a1a2e] mb-6">DN Unloads</h1>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b8b9e]" />
            <input
              type="text"
              placeholder="Search DN, rep, client..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-md border border-[#e8e8ec] text-[13px] placeholder:text-[#b0b0be] outline-none focus:border-[#4f6ef7]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <PopoverTrigger asChild>
                <button className={`p-2 border border-[#e8e8ec] rounded-md text-[#4a4a5a] hover:bg-[#f7f7f9] transition-colors ${filters.length > 0 ? "bg-[#f0f4ff] border-[#4f6ef7] text-[#4f6ef7]" : ""}`}>
                  <Filter className="w-4 h-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0 shadow-lg border border-[#e8e8ec] rounded-lg bg-white" align="end" sideOffset={6}>
                <div className="p-4 border-b border-[#e8e8ec] flex items-center justify-between">
                  <h3 className="font-semibold text-[#1a1a2e] text-[15px]">Filters</h3>
                  {filters.length > 0 && (
                    <button onClick={resetFilters} className="text-[#ff4d4f] text-[12px] hover:underline">Clear all</button>
                  )}
                </div>
                <div className="p-4 space-y-3">
                  {tempFilters.map(f => (
                    <div key={f.id} className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <select value={f.field} onChange={e => updateTempFilter(f.id, "field", e.target.value)}
                          className="h-8 border border-[#e8e8ec] text-[13px] rounded-md px-2 w-[130px] outline-none cursor-pointer">
                          <option value="Status">Status</option>
                          <option value="Rep">Rep</option>
                          <option value="DN Number">DN Number</option>
                          <option value="Original Warehouse">Original Warehouse</option>
                          <option value="Unload Warehouse">Unload Warehouse</option>
                          <option value="Created By">Created By</option>
                          <option value="Client">Client</option>
                          <option value="Date">Date</option>
                          <option value="Cancellation Reason">Cancellation Reason</option>
                        </select>
                        <span className="text-[12px] px-2 py-1 rounded border border-[#e8e8ec] text-[#1a1a2e]">{['Status', 'Rep'].includes(f.field) ? 'equals' : 'contains'}</span>
                        <button onClick={() => removeTempFilter(f.id)} className="text-[#b0b0be] hover:text-[#ff4d4f]">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      {f.field === "Status" ? (
                        <select value={f.value} onChange={e => updateTempFilter(f.id, "value", e.target.value)}
                          className="h-8 border border-[#e8e8ec] text-[13px] rounded-md px-2 w-full outline-none cursor-pointer">
                          <option value="">Select an option</option>
                          <option value="Pending Unload">Pending Unload</option>
                          <option value="Unloaded">Unloaded</option>
                          <option value="Accepted">Accepted</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      ) : f.field === "Rep" ? (
                        <select value={f.value} onChange={e => updateTempFilter(f.id, "value", e.target.value)}
                          className="h-8 border border-[#e8e8ec] text-[13px] rounded-md px-2 w-full outline-none cursor-pointer">
                          <option value="">Select an option</option>
                          {Array.from(new Set(records.map(r => r.rep))).map(r => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      ) : (
                        <>
                          <input
                            type="text"
                            value={f.value}
                            onChange={e => updateTempFilter(f.id, "value", e.target.value)}
                            list={`filter-list-${f.id}`}
                            placeholder="Type to filter..."
                            className="h-8 border border-[#e8e8ec] text-[13px] rounded-md px-2 w-full outline-none focus:border-[#4f6ef7]"
                          />
                          <datalist id={`filter-list-${f.id}`}>
                            {getFieldSuggestions(f.field).map(v => <option key={v} value={v} />)}
                          </datalist>
                        </>
                      )}
                    </div>
                  ))}
                  <button onClick={addFilter} className="text-[13px] text-[#4f6ef7] hover:underline font-medium">
                    + Add filter
                  </button>
                </div>
                <div className="p-4 border-t border-[#e8e8ec] flex justify-end gap-2">
                  <button onClick={() => setIsFilterOpen(false)} className="px-4 py-1.5 text-[13px] text-[#4a4a5a] hover:bg-[#f7f7f9] rounded-md border border-[#e8e8ec]">
                    Cancel
                  </button>
                  <button onClick={applyFilters} className="px-4 py-1.5 text-[13px] text-white bg-[#1a1a2e] hover:bg-[#2a2a3e] rounded-md">
                    Apply
                  </button>
                </div>
              </PopoverContent>
            </Popover>
            <button className="p-2 border border-[#e8e8ec] rounded-md text-[#4a4a5a] hover:bg-[#f7f7f9] transition-colors">
              <Settings2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List Info & Pagination Header */}
        <div className="flex items-center justify-between mb-4 mt-2">
          <div className="text-[13px] font-medium text-[#1a1a2e]">
            Total Records {filtered.length}
          </div>
          <div className="flex items-center gap-4">
            <select className="text-[12px] border border-[#e8e8ec] rounded-md px-2 py-1.5 outline-none text-[#4a4a5a]">
              <option>50 Records Per Page</option>
              <option>100 Records Per Page</option>
            </select>
            <div className="flex items-center gap-1 text-[13px] text-[#4a4a5a]">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 hover:bg-[#f7f7f9] rounded text-[#b0b0be] disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-medium px-1">{currentPage}</span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1 hover:bg-[#f7f7f9] rounded disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <BulkActionBar
          isAllChecked={selectedIds.size === paginated.length && paginated.length > 0}
          onCheckAll={toggleSelectAll}
          activeFilter={quickFilter}
          onFilterChange={setQuickFilter}
        />

        {/* Table */}
        <div className="flex-1 overflow-auto rounded-[8px] border border-[#e8e8ec] shadow-sm bg-white flex flex-col">
          <Table>
            <TableHeader className="bg-[#f7f7f9] sticky top-0 z-10 border-b border-[#e8e8ec]">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12 text-center text-[#8b8b9e]">
                  <div className="flex items-center justify-center p-1">
                    <Checkbox 
                      checked={selectedIds.size === paginated.length && paginated.length > 0}
                      onCheckedChange={toggleSelectAll}
                      className="rounded-[4px] border-[#d0d0dc]"
                    />
                  </div>
                </TableHead>
                <TableHead
                  onClick={() => handleSort("DN Number")}
                  className="cursor-pointer select-none hover:bg-[#f5f5f7] transition-colors text-[11px] font-medium text-[#8b8b9e] uppercase tracking-wider whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    DN NUMBER
                    {sortField === "DN Number"
                      ? sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-[#4f6ef7]" /> : <ChevronDown className="w-3 h-3 text-[#4f6ef7]" />
                      : <ChevronUp className="w-3 h-3 text-[#d0d0dc]" />
                    }
                  </div>
                </TableHead>
                <TableHead
                  onClick={() => handleSort("Original Warehouse")}
                  className="cursor-pointer select-none hover:bg-[#f5f5f7] transition-colors text-[11px] font-medium text-[#8b8b9e] uppercase tracking-wider whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    ORIGINAL WAREHOUSE
                    {sortField === "Original Warehouse"
                      ? sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-[#4f6ef7]" /> : <ChevronDown className="w-3 h-3 text-[#4f6ef7]" />
                      : <ChevronUp className="w-3 h-3 text-[#d0d0dc]" />
                    }
                  </div>
                </TableHead>
                <TableHead
                  onClick={() => handleSort("Unload Warehouse")}
                  className="cursor-pointer select-none hover:bg-[#f5f5f7] transition-colors text-[11px] font-medium text-[#8b8b9e] uppercase tracking-wider whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    UNLOAD WAREHOUSE
                    {sortField === "Unload Warehouse"
                      ? sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-[#4f6ef7]" /> : <ChevronDown className="w-3 h-3 text-[#4f6ef7]" />
                      : <ChevronUp className="w-3 h-3 text-[#d0d0dc]" />
                    }
                  </div>
                </TableHead>
                <TableHead
                  onClick={() => handleSort("Rep")}
                  className="cursor-pointer select-none hover:bg-[#f5f5f7] transition-colors text-[11px] font-medium text-[#8b8b9e] uppercase tracking-wider whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    REP
                    {sortField === "Rep"
                      ? sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-[#4f6ef7]" /> : <ChevronDown className="w-3 h-3 text-[#4f6ef7]" />
                      : <ChevronUp className="w-3 h-3 text-[#d0d0dc]" />
                    }
                  </div>
                </TableHead>
                <TableHead
                  onClick={() => handleSort("Created By")}
                  className="cursor-pointer select-none hover:bg-[#f5f5f7] transition-colors text-[11px] font-medium text-[#8b8b9e] uppercase tracking-wider whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    CREATED BY
                    {sortField === "Created By"
                      ? sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-[#4f6ef7]" /> : <ChevronDown className="w-3 h-3 text-[#4f6ef7]" />
                      : <ChevronUp className="w-3 h-3 text-[#d0d0dc]" />
                    }
                  </div>
                </TableHead>
                <TableHead
                  onClick={() => handleSort("Client")}
                  className="cursor-pointer select-none hover:bg-[#f5f5f7] transition-colors text-[11px] font-medium text-[#8b8b9e] uppercase tracking-wider whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    CLIENT
                    {sortField === "Client"
                      ? sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-[#4f6ef7]" /> : <ChevronDown className="w-3 h-3 text-[#4f6ef7]" />
                      : <ChevronUp className="w-3 h-3 text-[#d0d0dc]" />
                    }
                  </div>
                </TableHead>
                <TableHead className="text-[11px] font-medium text-[#8b8b9e] tracking-wider uppercase text-center"><div className="flex items-center justify-center gap-2"><Menu className="w-3 h-3 text-[10px] text-[#d0d0dc]"/> ITEMS <Menu className="w-3 h-3 text-[#d0d0dc]"/></div></TableHead>
                <TableHead
                  onClick={() => handleSort("Status")}
                  className="cursor-pointer select-none hover:bg-[#f5f5f7] transition-colors text-[11px] font-medium text-[#8b8b9e] uppercase tracking-wider whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    STATUS
                    {sortField === "Status"
                      ? sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-[#4f6ef7]" /> : <ChevronDown className="w-3 h-3 text-[#4f6ef7]" />
                      : <ChevronUp className="w-3 h-3 text-[#d0d0dc]" />
                    }
                  </div>
                </TableHead>
                <TableHead className="text-[11px] font-medium text-[#8b8b9e] tracking-wider uppercase"><div className="flex items-center gap-2"><Menu className="w-3 h-3 text-[10px] text-[#d0d0dc]"/> CANCELLATION REASON <Menu className="w-3 h-3 text-[#d0d0dc]"/></div></TableHead>
                <TableHead
                  onClick={() => handleSort("Date")}
                  className="cursor-pointer select-none hover:bg-[#f5f5f7] transition-colors text-[11px] font-medium text-[#8b8b9e] uppercase tracking-wider whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    DATE
                    {sortField === "Date"
                      ? sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-[#4f6ef7]" /> : <ChevronDown className="w-3 h-3 text-[#4f6ef7]" />
                      : <ChevronUp className="w-3 h-3 text-[#d0d0dc]" />
                    }
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center text-[13px] text-gray-400 py-12">
                    No unload records found.
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map(record => (
                  <TableRow
                    key={record.id}
                    onClick={() => onUnloadClick && onUnloadClick(record.id)}
                    className="hover:bg-[#f7f7f9] transition-colors cursor-pointer group border-b border-[#f0f0f3] text-[13px] text-[#4a4a5a]"
                  >
                    <TableCell className="w-12 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center p-1">
                        <Checkbox 
                          checked={selectedIds.has(record.id)}
                          onCheckedChange={() => toggleSelect(record.id)}
                          className="rounded-[4px] border-[#d0d0dc]"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-[13px] font-semibold text-[#4f6ef7] group-hover:underline">
                        {record.dnNumber}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Warehouse className="w-3.5 h-3.5 text-[#8b8b9e] shrink-0" />
                        <span className="text-[13px] text-[#4a4a5a]">{record.originalWarehouse}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Warehouse className={`w-3.5 h-3.5 shrink-0 ${record.unloadWarehouse !== record.originalWarehouse ? "text-indigo-400" : "text-[#8b8b9e]"}`} />
                        <span className={`text-[13px] font-medium ${record.unloadWarehouse !== record.originalWarehouse ? "text-indigo-600" : "text-[#4a4a5a]"}`}>
                          {record.unloadWarehouse}
                        </span>
                        {record.unloadWarehouse !== record.originalWarehouse && (
                          <span className="text-[9px] font-bold text-indigo-500 bg-indigo-50 px-1 py-0.5 rounded border border-indigo-100">different</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-[13px] text-[#1a1a2e] font-medium">{record.rep}</TableCell>
                    <TableCell className="text-[13px] text-[#4a4a5a]">{record.createdBy}</TableCell>
                    <TableCell className="text-[13px] text-[#4a4a5a]">{record.client}</TableCell>
                    <TableCell className="text-center">
                      <span className="inline-block px-2 py-0.5 bg-gray-100 text-[#4a4a5a] text-[11px] font-bold rounded">
                        {record.itemsCount}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={record.status} />
                    </TableCell>
                    <TableCell className="text-[13px] text-[#6a6a7a] italic max-w-[200px] truncate">
                      {record.cancellationReason ?? <span className="not-italic text-gray-300">—</span>}
                    </TableCell>
                    <TableCell className="text-[13px] text-[#8b8b9e]">{record.date}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

      </div>
    </div>
  );
}
