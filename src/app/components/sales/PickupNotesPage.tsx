import React, { useState, useEffect } from "react";
import { Download, Search, Filter, Settings2, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, X, Menu, Truck, Warehouse } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../ui/table";
import { Checkbox } from "../ui/checkbox";
import { BulkActionBar } from "./BulkActionBar";

import { useAppData } from "../../context/AppDataContext";

interface PickupNotesPageProps {
  onRNClick?: (id: string) => void;
  onSOClick?: (id: string) => void;
  onDNClick?: (id: string) => void;
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; border: string; label: string }> = {
  PENDING:    { bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200",  label: "Pending" },
  PROCESSING: { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200",   label: "Processing" },
  RECEIVED:   { bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200",  label: "Received" },
  CANCELED:   { bg: "bg-red-50",    text: "text-red-700",    border: "border-red-200",    label: "Canceled" },
};

const StatusBadge = ({ status }: { status: string }) => {
  const c = STATUS_CONFIG[status] ?? { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200", label: status };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-[10px] font-bold border ${c.bg} ${c.text} ${c.border}`}>{c.label}</span>;
};

const DestBadge = ({ dest, rep }: { dest: string; rep?: string }) => {
  if (dest === "Rep Van")
    return (
      <div className="flex items-center gap-1.5">
        <Truck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
        <span className="text-[12px] font-medium text-indigo-700">{rep ?? "Rep Van"}</span>
        <span className="text-[9px] font-bold text-indigo-500 bg-indigo-50 px-1 py-0.5 rounded border border-indigo-100">Van</span>
      </div>
    );
  return (
    <div className="flex items-center gap-1.5">
      <Warehouse className="w-3.5 h-3.5 text-gray-400 shrink-0" />
      <span className="text-[12px] text-gray-700">Main Warehouse</span>
    </div>
  );
};

export function PickupNotesPage({ onRNClick, onSOClick, onDNClick }: PickupNotesPageProps) {
  const { pnList } = useAppData();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [quickFilter, setQuickFilter] = useState<"all" | "pending" | "failed">("all");
  const [filters, setFilters] = useState<{ id: string; field: string; value: string }[]>([]);
  const [tempFilters, setTempFilters] = useState<{ id: string; field: string; value: string }[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  useEffect(() => { if (isFilterOpen) setTempFilters([...filters]); }, [isFilterOpen, filters]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const addFilter = () => setTempFilters([...tempFilters, { id: Math.random().toString(), field: "Status", value: "" }]);
  const updateTempFilter = (id: string, key: "field" | "value", val: string) => setTempFilters(tempFilters.map(f => f.id === id ? { ...f, [key]: val } : f));
  const removeTempFilter = (id: string) => setTempFilters(tempFilters.filter(f => f.id !== id));
  const applyFilters = () => { setFilters(tempFilters); setIsFilterOpen(false); };
  const resetFilters = () => { setFilters([]); setTempFilters([]); };

  const baseFiltered = pnList.filter(pn => {
    if (quickFilter === "pending" && pn.status !== "PENDING") return false;
    if (quickFilter === "failed" && pn.status !== "CANCELED") return false;
    if (filters.length > 0) {
      const ok = filters.every(f => {
        if (!f.value) return true;
        const v = f.value.toLowerCase();
        if (f.field === "Status") return pn.status.toLowerCase() === v;
        if (f.field === "Rep") return pn.rep.toLowerCase().includes(v);
        if (f.field === "Destination") return pn.destinationWarehouse.toLowerCase().includes(v);
        if (f.field === "Return Note Number") return pn.rnNumber.toLowerCase().includes(v);
        if (f.field === "Original Source") return ((pn.sourceSONumber ?? pn.sourceInvoiceNumber ?? "")).toLowerCase().includes(v);
        if (f.field === "Client") return pn.clientName.toLowerCase().includes(v);
        if (f.field === "Date") return pn.createdDate.toLowerCase().includes(v);
        return true;
      });
      if (!ok) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return Object.values(pn).some(v => String(v).toLowerCase().includes(q));
    }
    return true;
  });

  const sortedPNs = [...baseFiltered].sort((a, b) => {
    if (!sortField) return 0;
    const getVal = (item: typeof a) => {
      const map: Record<string, string> = {
        "Return Note Number":   item.rnNumber,
        "Status":      item.status,
        "Client":      item.clientName,
        "Rep":         item.rep,
        "Destination": item.destinationWarehouse,
        "Date":        item.createdDate,
        "Items":       String(item.items),
      };
      return String(map[sortField] ?? "").toLowerCase();
    };
    const aVal = getVal(a), bVal = getVal(b);
    return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
  });

  const toggleAll = () => selectedIds.size === baseFiltered.length && baseFiltered.length > 0 ? setSelectedIds(new Set()) : setSelectedIds(new Set(baseFiltered.map(p => p.id)));
  const toggleOne = (id: string) => { const s = new Set(selectedIds); s.has(id) ? s.delete(id) : s.add(id); setSelectedIds(s); };

  const getFieldSuggestions = (field: string): string[] => {
    const map: Record<string, () => string[]> = {
      'Rep':       () => pnList.map(p => p.rep),
      'Return Note Number': () => pnList.map(p => p.rnNumber),
      'Original Source': () => pnList.map(p => p.sourceSONumber ?? p.sourceInvoiceNumber ?? ""),
      'Client':    () => pnList.map(p => p.clientName),
      'Date':      () => pnList.map(p => p.createdDate),
    };
    return [...new Set((map[field]?.() ?? []).filter(Boolean))].sort();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden relative">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#e8e8ec]">
        <div className="flex items-center gap-3">
          <Menu className="w-5 h-5 text-[#4a4a5a] cursor-pointer" />
          <h1 className="text-[18px] font-bold text-[#1a1a2e]">Return Notes</h1>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-[#e8e8ec] rounded-md text-[13px] font-medium text-[#1a1a2e] hover:bg-[#f7f7f9] transition-colors">
          <Download className="w-4 h-4 text-[#4a4a5a]" /> Export to Excel
        </button>
      </div>

      <div className="flex flex-col flex-1 p-6 overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b8b9e]" />
            <input type="text" placeholder="Search Return Note, client, rep..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 rounded-md border border-[#e8e8ec] text-[13px] placeholder:text-[#b0b0be] outline-none focus:border-[#4f6ef7]" />
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
                  {filters.length > 0 && <button onClick={resetFilters} className="text-[#ff4d4f] text-[12px] hover:underline">Clear all</button>}
                </div>
                <div className="p-4 space-y-3">
                  {tempFilters.map(f => (
                    <div key={f.id} className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <select value={f.field} onChange={e => updateTempFilter(f.id, "field", e.target.value)} className="h-8 border border-[#e8e8ec] text-[13px] rounded-md px-2 w-[130px] outline-none cursor-pointer">
                          <option value="Status">Status</option>
                          <option value="Rep">Rep</option>
                          <option value="Destination">Destination</option>
                          <option value="Return Note Number">Return Note Number</option>
                          <option value="Original Source">Original Source</option>
                          <option value="Client">Client</option>
                          <option value="Date">Date</option>
                        </select>
                        <span className="text-[12px] px-2 py-1 rounded border border-[#e8e8ec] text-[#1a1a2e]">equals</span>
                        <button onClick={() => removeTempFilter(f.id)} className="text-[#b0b0be] hover:text-[#ff4d4f]"><X className="w-4 h-4" /></button>
                      </div>
                      {f.field === "Status" ? (
                        <select value={f.value} onChange={e => updateTempFilter(f.id, "value", e.target.value)} className="h-8 border border-[#e8e8ec] text-[13px] rounded-md px-2 w-full outline-none cursor-pointer">
                          <option value="">Select status</option>
                          <option value="PENDING">Pending</option>
                          <option value="PROCESSING">Processing</option>
                          <option value="RECEIVED">Received</option>
                          <option value="CANCELED">Canceled</option>
                        </select>
                      ) : f.field === "Destination" ? (
                        <select value={f.value} onChange={e => updateTempFilter(f.id, "value", e.target.value)} className="h-8 border border-[#e8e8ec] text-[13px] rounded-md px-2 w-full outline-none cursor-pointer">
                          <option value="">Select destination</option>
                          <option value="Main Warehouse">Main Warehouse</option>
                          <option value="Rep Van">Rep Van</option>
                        </select>
                      ) : f.field === "Rep" ? (
                        <>
                          <input
                            type="text"
                            value={f.value}
                            onChange={e => updateTempFilter(f.id, "value", e.target.value)}
                            list={`filter-list-${f.id}`}
                            placeholder="Type rep name..."
                            className="h-8 border border-[#e8e8ec] text-[13px] rounded-md px-2 w-full outline-none"
                          />
                          <datalist id={`filter-list-${f.id}`}>
                            {getFieldSuggestions(f.field).map(v => <option key={v} value={v} />)}
                          </datalist>
                        </>
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
                  <button onClick={addFilter} className="text-[13px] text-[#4f6ef7] hover:underline font-medium">+ Add filter</button>
                </div>
                <div className="p-4 border-t border-[#e8e8ec] flex justify-end gap-2">
                  <button onClick={() => setIsFilterOpen(false)} className="px-4 py-1.5 text-[13px] text-[#4a4a5a] hover:bg-[#f7f7f9] rounded-md border border-[#e8e8ec]">Cancel</button>
                  <button onClick={applyFilters} className="px-4 py-1.5 text-[13px] text-white bg-[#1a1a2e] hover:bg-[#2a2a3e] rounded-md">Apply</button>
                </div>
              </PopoverContent>
            </Popover>
            <button className="p-2 border border-[#e8e8ec] rounded-md text-[#4a4a5a] hover:bg-[#f7f7f9] transition-colors"><Settings2 className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Records / Pagination */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-[13px] font-medium text-[#1a1a2e]">Total Records {baseFiltered.length}</div>
          <div className="flex items-center gap-4">
            <select className="text-[12px] border border-[#e8e8ec] rounded-md px-2 py-1.5 outline-none text-[#4a4a5a]"><option>50 Records Per Page</option><option>100 Records Per Page</option></select>
            <div className="flex items-center gap-1 text-[13px] text-[#4a4a5a]">
              <button className="p-1 hover:bg-[#f7f7f9] rounded text-[#b0b0be]"><ChevronLeft className="w-4 h-4" /></button>
              <span className="font-medium px-1">1</span>
              <button className="p-1 hover:bg-[#f7f7f9] rounded"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        </div>

        <BulkActionBar isAllChecked={selectedIds.size === baseFiltered.length && baseFiltered.length > 0} onCheckAll={toggleAll} showCreditNoteAction={true} activeFilter={quickFilter} onFilterChange={setQuickFilter} />

        {/* Table */}
        <div className="flex-1 overflow-hidden border border-[#e8e8ec] rounded-lg shadow-sm bg-white flex flex-col">
          <div className="flex-1 overflow-auto custom-scrollbar">
            <Table className="min-w-max w-full">
              <TableHeader className="bg-[#f7f7f9] sticky top-0 z-10 border-b border-[#e8e8ec]">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-12 text-center">
                    <div className="flex items-center justify-center p-1">
                      <Checkbox checked={selectedIds.size === baseFiltered.length && baseFiltered.length > 0} onCheckedChange={toggleAll} className="rounded-[4px] border-[#d0d0dc]" />
                    </div>
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("PN Number")}
                    className="cursor-pointer select-none hover:bg-[#f5f5f7] transition-colors text-[11px] font-medium text-[#8b8b9e] uppercase tracking-wider whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1">
                      RETURN NOTE NUMBER
                      {sortField === "PN Number"
                        ? sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-[#4f6ef7]" /> : <ChevronDown className="w-3 h-3 text-[#4f6ef7]" />
                        : <ChevronUp className="w-3 h-3 text-[#d0d0dc]" />
                      }
                    </div>
                  </TableHead>
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
                  <TableHead className="text-[11px] font-medium text-[#8b8b9e] uppercase tracking-wider whitespace-nowrap">FINANCIAL IMPACT</TableHead>
                  <TableHead className="text-[11px] font-medium text-[#8b8b9e] uppercase tracking-wider whitespace-nowrap">SOURCE DELIVERY NOTE</TableHead>
                  <TableHead className="text-[11px] font-medium text-[#8b8b9e] uppercase tracking-wider whitespace-nowrap">ORIGINAL SOURCE</TableHead>
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
                    onClick={() => handleSort("Destination")}
                    className="cursor-pointer select-none hover:bg-[#f5f5f7] transition-colors text-[11px] font-medium text-[#8b8b9e] uppercase tracking-wider whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1">
                      DESTINATION
                      {sortField === "Destination"
                        ? sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-[#4f6ef7]" /> : <ChevronDown className="w-3 h-3 text-[#4f6ef7]" />
                        : <ChevronUp className="w-3 h-3 text-[#d0d0dc]" />
                      }
                    </div>
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("Items")}
                    className="cursor-pointer select-none hover:bg-[#f5f5f7] transition-colors text-[11px] font-medium text-[#8b8b9e] uppercase tracking-wider whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1">
                      ITEMS
                      {sortField === "Items"
                        ? sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-[#4f6ef7]" /> : <ChevronDown className="w-3 h-3 text-[#4f6ef7]" />
                        : <ChevronUp className="w-3 h-3 text-[#d0d0dc]" />
                      }
                    </div>
                  </TableHead>
                  <TableHead className="text-[11px] font-medium text-[#8b8b9e] uppercase tracking-wider whitespace-nowrap">RETURN REASON</TableHead>
                  <TableHead className="text-[11px] font-medium text-[#8b8b9e] uppercase tracking-wider whitespace-nowrap">RESERVED</TableHead>
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
                {sortedPNs.length === 0 ? (
                  <TableRow><TableCell colSpan={13} className="text-center py-12 text-[#8b8b9e]">No records found.</TableCell></TableRow>
                ) : sortedPNs.map(pn => (
                  <TableRow key={pn.id} className="border-b border-[#f0f0f3] hover:bg-[#f7f7f9] text-[13px] text-[#4a4a5a]">
                    <TableCell className="w-12" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-center p-1">
                        <Checkbox checked={selectedIds.has(pn.id)} onCheckedChange={() => toggleOne(pn.id)} className="rounded-[4px] border-[#d0d0dc]" />
                      </div>
                    </TableCell>
                    <TableCell onClick={() => onRNClick && onRNClick(pn.id)} className="font-semibold text-[#4f6ef7] hover:underline cursor-pointer">{pn.rnNumber}</TableCell>
                    <TableCell><StatusBadge status={pn.status} /></TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-[10px] font-bold w-fit border ${
                        pn.invoicePaymentStatus === "Paid" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        pn.invoicePaymentStatus === "Partially Paid" ? "bg-amber-50 text-amber-700 border-amber-200" :
                        pn.invoicePaymentStatus === "Invoiced Not Paid" ? "bg-red-50 text-red-600 border-red-200" :
                        "bg-gray-50 text-gray-500 border-gray-200"
                      }`}>
                        {pn.invoicePaymentStatus}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        {pn.sourceDN ? (
                          <button onClick={() => onDNClick && onDNClick(pn.sourceDN!.id)} className="text-[12px] font-medium text-[#4f6ef7] hover:underline text-left">{pn.sourceDN.number}</button>
                        ) : <span className="text-[12px] text-gray-400">—</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {pn.sourceSOId && pn.sourceSONumber ? (
                        <button onClick={() => onSOClick && onSOClick(pn.sourceSOId!)} className="text-[12px] font-medium text-[#4f6ef7] hover:underline">{pn.sourceSONumber}</button>
                      ) : pn.sourceInvoiceNumber ? (
                        <span className="text-[12px] font-medium text-[#4f6ef7]">{pn.sourceInvoiceNumber}</span>
                      ) : <span className="text-[12px] text-gray-400">—</span>}
                    </TableCell>
                    <TableCell>{pn.clientName}</TableCell>
                    <TableCell className="font-medium text-[#1a1a2e]">{pn.rep}</TableCell>
                    <TableCell><DestBadge dest={pn.destinationWarehouse} rep={pn.destinationRep} /></TableCell>
                    <TableCell className="font-medium text-[#1a1a2e] text-center">{pn.items}</TableCell>
                    <TableCell>
                      {pn.returnReason
                        ? <span className="text-[12px] text-gray-700">{pn.returnReason}</span>
                        : <span className="text-gray-300 text-[12px]">—</span>
                      }
                    </TableCell>
                    <TableCell>
                      {pn.reservedCount > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          🔒 {pn.reservedCount} Reserved
                        </span>
                      ) : <span className="text-gray-300 text-[12px]">—</span>}
                    </TableCell>
                    <TableCell className="text-[#8b8b9e]">{pn.createdDate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f7f7f9; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #d0d0dc; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #b0b0be; }
      `}</style>
    </div>
  );
}
