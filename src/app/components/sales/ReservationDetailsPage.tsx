import { useState, useEffect } from "react";
import {
  Search,
  Trash2,
  ExternalLink,
  Plus,
  Download,
  Filter,
  Settings2,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  X,
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
import { Menu } from "lucide-react";
import { BulkActionBar } from "./BulkActionBar";
import { CreateReservationModal } from "./CreateReservationModal";

interface ReservationDetailsPageProps {
  onNavigateToSO?: (soId: string) => void;
  onNavigateToDN?: (dnId: string) => void;
  onNavigateToInvoice?: (invoiceId: string) => void;
}

interface ReservationData {
  id: string;
  itemName: string;
  sku: string;
  reservedQty: number;
  unit: string;
  warehouse: string;
  client: string;
  sourceType: "SO" | "Invoice";
  sourceId: string;
  sourceNumber: string;
  linkedDN: string | null;
  reservationType: "Stock" | "Free";
  status: "Active" | "Revoked" | "Consumed" | "Manually Deleted";
  createdDate: string;
}


import { useAppData, type ReservationAuditEntry } from "../../context/AppDataContext";

const MOCK_ITEMS = [
  { id: "itm1", name: "Wireless Headphones Pro", sku: "WHP-001", totalQty: 100, deliveredQty: 0, notedQty: 0 },
  { id: "itm2", name: "USB-C Charging Cable", sku: "UCC-045", totalQty: 500, deliveredQty: 0, notedQty: 0 },
  { id: "itm3", name: "Laptop Stand Aluminum", sku: "LSA-012", totalQty: 50, deliveredQty: 0, notedQty: 0 },
];

const ALL_WAREHOUSES = ["Main Branch", "Zarqaa Warehouse", "Dream Warehouse"];

const StatusBadge = ({ status }: { status: ReservationData["status"] }) => {
  if (status === "Active")
    return <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-medium bg-green-50 text-green-700 border border-green-200">Active</span>;
  if (status === "Consumed")
    return <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">Consumed (In DN)</span>;
  if (status === "Revoked")
    return <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">Revoked</span>;
  return <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-medium bg-red-50 text-red-700 border border-red-200">Manually Deleted</span>;
};

const TypeBadge = ({ type }: { type: ReservationData["reservationType"] }) => {
  if (type === "Stock")
    return <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">Stock</span>;
  return <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200">Free</span>;
};

export default function ReservationDetailsPage({
  onNavigateToSO,
  onNavigateToDN,
  onNavigateToInvoice,
}: ReservationDetailsPageProps) {
  const { reservations: globalReservations, setReservations: setGlobalReservations, reservationAuditLog } = useAppData();
  
  const [activeTab, setActiveTab] = useState<"list" | "history">("list");
  
  // Map global reservations to local UI model
  const reservations = globalReservations.map(r => ({
    id: r.id,
    itemName: r.itemName,
    sku: MOCK_ITEMS.find(mi => mi.id === r.itemId)?.sku || "N/A",
    reservedQty: r.qty,
    unit: r.unit,
    warehouse: r.warehouse || "—",
    client: "—",
    sourceType: (r.sourceSOId ? "SO" : "Invoice") as "SO" | "Invoice",
    sourceId: r.sourceSOId || r.sourceInvoiceId || "—",
    sourceNumber: r.sourceSOId || r.sourceInvoiceId || "—",
    linkedDN: r.linkedDNNumber || null,
    reservationType: r.type === "AUTO" ? "Stock" as const : "Free" as const,
    status: (r.status === "ACTIVE" ? "Active" : r.status === "CONSUMED" ? "Consumed" : "Revoked") as ReservationData["status"],
    createdDate: r.date,
  }));

  const [historyEventFilter, setHistoryEventFilter] = useState<"all" | "Used in DN" | "Manually Deleted" | "Created" | "Warehouse Transfer">("all");
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<{ id: string; field: string; value: string }[]>([]);
  const [tempFilters, setTempFilters] = useState<{ id: string; field: string; value: string }[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    if (isFilterOpen) setTempFilters([...filters]);
  }, [isFilterOpen, filters]);

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
    setTempFilters(tempFilters.map(f => (f.id === id ? { ...f, [key]: val } : f)));
  const removeTempFilter = (id: string) =>
    setTempFilters(tempFilters.filter(f => f.id !== id));
  const applyFilters = () => { setFilters(tempFilters); setIsFilterOpen(false); };
  const resetFilters = () => { setFilters([]); setTempFilters([]); };

  const [quickFilter, setQuickFilter] = useState<"all" | "pending" | "failed">("all");

  const getFieldSuggestions = (field: string): string[] => {
    const map: Record<string, () => string[]> = {
      'Item Name':    () => reservations.map(r => r.itemName),
      'SKU':          () => reservations.map(r => r.sku),
      'Unit':         () => reservations.map(r => r.unit),
      'Client':       () => reservations.map(r => r.client),
      'Warehouse':    () => reservations.map(r => r.warehouse),
      'Created Date': () => reservations.map(r => r.createdDate),
    };
    return [...new Set((map[field]?.() ?? []).filter(v => Boolean(v) && v !== "—"))].sort();
  };

  const filtered = reservations.filter(r => {
    if (quickFilter === "pending" && r.status !== "Active") return false;
    if (quickFilter === "failed" && r.status !== "Revoked") return false;
    if (filters.length > 0) {
      const match = filters.every(f => {
        if (!f.value) return true;
        const v = f.value.toLowerCase();
        if (f.field === "Status") return r.status.toLowerCase() === v;
        if (f.field === "Type") return r.reservationType.toLowerCase() === v;
        if (f.field === "Client") return r.client.toLowerCase().includes(v);
        if (f.field === "Warehouse") return r.warehouse.toLowerCase().includes(v);
        if (f.field === "Item Name") return r.itemName.toLowerCase().includes(v);
        if (f.field === "SKU") return r.sku.toLowerCase().includes(v);
        if (f.field === "Unit") return r.unit.toLowerCase().includes(v);
        if (f.field === "Created Date") return r.createdDate.toLowerCase().includes(v);
        return true;
      });
      if (!match) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.itemName.toLowerCase().includes(q) ||
        r.sku.toLowerCase().includes(q) ||
        r.sourceNumber.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const sortedReservations = [...filtered].sort((a, b) => {
    if (!sortField) return 0;
    const getVal = (item: typeof a) => {
      const map: Record<string, string> = {
        "Item Name":    item.itemName,
        "SKU":          item.sku,
        "Reserved Qty": String(item.reservedQty),
        "Unit":         item.unit,
        "Warehouse":    item.warehouse,
        "Type":         item.reservationType,
        "Status":       item.status,
        "Created Date": item.createdDate,
      };
      return String(map[sortField] ?? "").toLowerCase();
    };
    const aVal = getVal(a), bVal = getVal(b);
    return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = sortedReservations.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this reservation?")) {
      const target = globalReservations.find(r => r.id === id);
      if (target) {
        const auditEntry: ReservationAuditEntry = {
          id: `AUDIT-${Math.floor(Math.random() * 10000)}`,
          reservationId: target.id,
          itemName: target.itemName,
          sku: MOCK_ITEMS.find(mi => mi.id === target.itemId)?.sku || "N/A",
          qty: target.qty,
          unit: target.unit,
          warehouse: target.warehouse || "—",
          sourceSOId: target.sourceSOId,
          eventType: "Manually Deleted",
          triggeredBy: "ADMIN Ayah Al-Ori", // In a real app, this would be the current user
          date: new Date().toISOString().split("T")[0],
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setReservationAuditLog(prev => [auditEntry, ...prev]);
      }
      setGlobalReservations(prev => prev.filter(r => r.id !== id));
    }
  };

  // ── audit log helpers (used in history tab) ──────────────────────────────
  const EVENT_COLORS: Record<ReservationAuditEntry["eventType"], string> = {
    "Used in DN":       "bg-amber-50 text-amber-700 border-amber-200",
    "Manually Deleted": "bg-red-50 text-red-600 border-red-200",
    "Created":          "bg-green-50 text-green-700 border-green-200",
    "Warehouse Transfer": "bg-blue-50 text-blue-700 border-blue-200",
  };
  const auditQ = searchQuery.trim().toLowerCase();
  const visibleLog = reservationAuditLog.filter(e => {
    if (historyEventFilter !== "all" && e.eventType !== historyEventFilter) return false;
    if (auditQ) return (
      e.itemName.toLowerCase().includes(auditQ) ||
      e.sku.toLowerCase().includes(auditQ) ||
      (e.linkedDNNumber ?? "").toLowerCase().includes(auditQ)
    );
    return true;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden relative">
      {/* Top Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#e8e8ec]">
        <div className="flex items-center gap-4">
          <Menu className="w-5 h-5 text-[#4a4a5a] cursor-pointer" />
          <div className="flex items-center bg-[#f7f7f9] p-1 rounded-full text-[13px] font-medium text-[#4a4a5a]">
            <button
              onClick={() => setActiveTab("list")}
              className={`px-4 py-1.5 rounded-full transition-colors ${activeTab === "list" ? "bg-white shadow-sm text-[#1a1a2e]" : "text-[#8b8b9e] hover:text-[#1a1a2e]"}`}
            >
              Reservation List
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-4 py-1.5 rounded-full transition-colors ${activeTab === "history" ? "bg-white shadow-sm text-[#1a1a2e]" : "text-[#8b8b9e] hover:text-[#1a1a2e]"}`}
            >
              Reservation Audit Log
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-[#e8e8ec] rounded-md text-[13px] font-medium text-[#1a1a2e] hover:bg-[#f7f7f9] transition-colors">
            <Download className="w-4 h-4 text-[#4a4a5a]" /> Export to Excel
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#1a1a2e] text-white rounded-md text-[13px] font-medium hover:bg-[#2a2a3e] transition-all shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4" /> Create Reservation
          </button>
        </div>
      </div>

      <div className="flex flex-col flex-1 p-6 overflow-hidden">
        <h1 className="text-[20px] font-bold text-[#1a1a2e] mb-6">
          {activeTab === "list" ? "Reservation Details" : "Reservation Audit Log"}
        </h1>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b8b9e]" />
            <input
              type="text"
              placeholder={activeTab === "list" ? "Search item, SKU, source..." : "Search..."}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-md border border-[#e8e8ec] text-[13px] placeholder:text-[#b0b0be] outline-none focus:border-[#4f6ef7]"
            />
          </div>
          {activeTab === "list" && (
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
                            <option value="Type">Type</option>
                            <option value="Client">Client</option>
                            <option value="Warehouse">Warehouse</option>
                            <option value="Item Name">Item Name</option>
                            <option value="SKU">SKU</option>
                            <option value="Unit">Unit</option>
                            <option value="Created Date">Created Date</option>
                          </select>
                          <span className="text-[12px] px-2 py-1 rounded border border-[#e8e8ec] text-[#1a1a2e]">equals</span>
                          <button onClick={() => removeTempFilter(f.id)} className="text-[#b0b0be] hover:text-[#ff4d4f]">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        {f.field === "Status" ? (
                          <select value={f.value} onChange={e => updateTempFilter(f.id, "value", e.target.value)}
                            className="h-8 border border-[#e8e8ec] text-[13px] rounded-md px-2 w-full outline-none cursor-pointer">
                            <option value="">Select an option</option>
                            <option value="Active">Active</option>
                            <option value="Revoked">Revoked</option>
                            <option value="Manually Deleted">Manually Deleted</option>
                          </select>
                        ) : f.field === "Type" ? (
                          <select value={f.value} onChange={e => updateTempFilter(f.id, "value", e.target.value)}
                            className="h-8 border border-[#e8e8ec] text-[13px] rounded-md px-2 w-full outline-none cursor-pointer">
                            <option value="">Select an option</option>
                            <option value="Stock">Stock</option>
                            <option value="Free">Free</option>
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
          )}
        </div>

        {activeTab === "list" && (
          <>
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
                  <button className="p-1 hover:bg-[#f7f7f9] rounded text-[#b0b0be]">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-medium px-1">{currentPage}</span>
                  <button className="p-1 hover:bg-[#f7f7f9] rounded">
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
          </>
        )}

        {/* Table */}
        {activeTab === "list" ? (
        <div className="flex-1 overflow-auto rounded-[8px] border border-[#e8e8ec]">
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
                    onClick={() => handleSort("Item Name")}
                    className="cursor-pointer select-none hover:bg-[#f5f5f7] transition-colors text-[11px] font-medium text-[#8b8b9e] tracking-wider uppercase"
                  >
                    <div className="flex items-center gap-1.5">
                      ITEM NAME
                      {sortField === "Item Name"
                        ? sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-[#4f6ef7]" /> : <ChevronDown className="w-3 h-3 text-[#4f6ef7]" />
                        : <ChevronUp className="w-3 h-3 text-[#d0d0dc]" />
                      }
                    </div>
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("SKU")}
                    className="cursor-pointer select-none hover:bg-[#f5f5f7] transition-colors text-[11px] font-medium text-[#8b8b9e] tracking-wider uppercase"
                  >
                    <div className="flex items-center gap-1.5">
                      SKU
                      {sortField === "SKU"
                        ? sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-[#4f6ef7]" /> : <ChevronDown className="w-3 h-3 text-[#4f6ef7]" />
                        : <ChevronUp className="w-3 h-3 text-[#d0d0dc]" />
                      }
                    </div>
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("Reserved Qty")}
                    className="cursor-pointer select-none hover:bg-[#f5f5f7] transition-colors text-[11px] font-medium text-[#8b8b9e] tracking-wider uppercase"
                  >
                    <div className="flex items-center gap-1.5">
                      RESERVED QTY
                      {sortField === "Reserved Qty"
                        ? sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-[#4f6ef7]" /> : <ChevronDown className="w-3 h-3 text-[#4f6ef7]" />
                        : <ChevronUp className="w-3 h-3 text-[#d0d0dc]" />
                      }
                    </div>
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("Unit")}
                    className="cursor-pointer select-none hover:bg-[#f5f5f7] transition-colors text-[11px] font-medium text-[#8b8b9e] tracking-wider uppercase"
                  >
                    <div className="flex items-center gap-1.5">
                      UNIT
                      {sortField === "Unit"
                        ? sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-[#4f6ef7]" /> : <ChevronDown className="w-3 h-3 text-[#4f6ef7]" />
                        : <ChevronUp className="w-3 h-3 text-[#d0d0dc]" />
                      }
                    </div>
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("Warehouse")}
                    className="cursor-pointer select-none hover:bg-[#f5f5f7] transition-colors text-[11px] font-medium text-[#8b8b9e] tracking-wider uppercase"
                  >
                    <div className="flex items-center gap-1.5">
                      WAREHOUSE
                      {sortField === "Warehouse"
                        ? sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-[#4f6ef7]" /> : <ChevronDown className="w-3 h-3 text-[#4f6ef7]" />
                        : <ChevronUp className="w-3 h-3 text-[#d0d0dc]" />
                      }
                    </div>
                  </TableHead>
                  <TableHead className="text-[11px] font-medium text-[#8b8b9e] tracking-wider uppercase"><div className="flex items-center gap-2"><Menu className="w-3 h-3 text-[10px] text-[#d0d0dc]"/> CLIENT</div></TableHead>
                  <TableHead className="text-[11px] font-medium text-[#8b8b9e] tracking-wider uppercase"><div className="flex items-center gap-2"><Menu className="w-3 h-3 text-[10px] text-[#d0d0dc]"/> SOURCE</div></TableHead>
                  <TableHead className="text-[11px] font-medium text-[#8b8b9e] tracking-wider uppercase"><div className="flex items-center gap-2"><Menu className="w-3 h-3 text-[10px] text-[#d0d0dc]"/> LINKED DN</div></TableHead>
                  <TableHead
                    onClick={() => handleSort("Type")}
                    className="cursor-pointer select-none hover:bg-[#f5f5f7] transition-colors text-[11px] font-medium text-[#8b8b9e] tracking-wider uppercase"
                  >
                    <div className="flex items-center gap-1.5">
                      TYPE
                      {sortField === "Type"
                        ? sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-[#4f6ef7]" /> : <ChevronDown className="w-3 h-3 text-[#4f6ef7]" />
                        : <ChevronUp className="w-3 h-3 text-[#d0d0dc]" />
                      }
                    </div>
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("Status")}
                    className="cursor-pointer select-none hover:bg-[#f5f5f7] transition-colors text-[11px] font-medium text-[#8b8b9e] tracking-wider uppercase"
                  >
                    <div className="flex items-center gap-1.5">
                      STATUS
                      {sortField === "Status"
                        ? sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-[#4f6ef7]" /> : <ChevronDown className="w-3 h-3 text-[#4f6ef7]" />
                        : <ChevronUp className="w-3 h-3 text-[#d0d0dc]" />
                      }
                    </div>
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("Created Date")}
                    className="cursor-pointer select-none hover:bg-[#f5f5f7] transition-colors text-[11px] font-medium text-[#8b8b9e] tracking-wider uppercase"
                  >
                    <div className="flex items-center gap-1.5">
                      CREATED DATE
                      {sortField === "Created Date"
                        ? sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-[#4f6ef7]" /> : <ChevronDown className="w-3 h-3 text-[#4f6ef7]" />
                        : <ChevronUp className="w-3 h-3 text-[#d0d0dc]" />
                      }
                    </div>
                  </TableHead>
                  <TableHead className="text-[11px] font-medium text-[#8b8b9e] tracking-wider uppercase"><div className="flex items-center gap-2"><Menu className="w-3 h-3 text-[10px] text-[#d0d0dc]"/> ACTIONS</div></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center text-[13px] text-gray-400 py-12">
                      No reservations found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map(r => (
                    <TableRow key={r.id} className="hover:bg-[#f7f7f9] transition-colors border-b border-[#f0f0f3] text-[13px] text-[#4a4a5a]">
                      <TableCell className="w-12">
                        <div className="flex items-center justify-center p-1">
                          <Checkbox 
                            checked={selectedIds.has(r.id)}
                            onCheckedChange={() => toggleSelect(r.id)}
                            className="rounded-[4px] border-[#d0d0dc]"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-[13px] text-[#4f6ef7] font-medium whitespace-nowrap cursor-pointer hover:underline">{r.itemName}</TableCell>
                      <TableCell className="text-[13px] text-[#8b8b9e] font-mono">{r.sku}</TableCell>
                      <TableCell className="text-[13px] text-[#1a1a2e] text-right">{r.reservedQty}</TableCell>
                      <TableCell className="text-[13px] text-[#4a4a5a]">{r.unit}</TableCell>
                      <TableCell className="text-[13px] text-[#4a4a5a] whitespace-nowrap">{r.warehouse}</TableCell>
                      <TableCell className="text-[13px] text-[#4a4a5a] whitespace-nowrap">{r.client}</TableCell>
                      <TableCell>
                        <button
                          onClick={() => r.sourceType === "SO" ? onNavigateToSO?.(r.sourceId) : onNavigateToInvoice?.(r.sourceId)}
                          className="flex items-center gap-1 text-[13px] text-[#4f6ef7] hover:underline whitespace-nowrap"
                        >
                          {r.sourceNumber} <ExternalLink className="w-3 h-3" />
                        </button>
                      </TableCell>
                      <TableCell>
                        {r.linkedDN ? (
                          <button
                            onClick={() => onNavigateToDN?.(r.linkedDN!)}
                            className="flex items-center gap-1 text-[13px] text-[#4f6ef7] hover:underline whitespace-nowrap"
                          >
                            {r.linkedDN} <ExternalLink className="w-3 h-3" />
                          </button>
                        ) : (
                          <span className="text-[13px] text-[#b0b0be]">-</span>
                        )}
                      </TableCell>
                      <TableCell><TypeBadge type={r.reservationType} /></TableCell>
                      <TableCell><StatusBadge status={r.status} /></TableCell>
                      <TableCell className="text-[13px] text-[#8b8b9e] whitespace-nowrap">{r.createdDate}</TableCell>
                      <TableCell>
                        {r.status === "Active" && (
                          <button
                            onClick={() => handleDelete(r.id)}
                            className="p-1.5 rounded text-[#b0b0be] hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete reservation"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        ) : (
        /* ── Reservation Audit Log tab ───────────────────────────────────── */
        <div className="flex flex-col flex-1 overflow-hidden">

          {/* Stats + filter pills bar */}
          <div className="flex items-center justify-between mb-3 px-1">
            <p className="text-[13px] font-medium text-[#1a1a2e]">
              Total Entries <span className="text-[#4f6ef7]">{visibleLog.length}</span>
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              {(["all", "Used in DN", "Manually Deleted", "Created", "Warehouse Transfer"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setHistoryEventFilter(f)}
                  className={`px-3 py-1 rounded-full text-[12px] font-semibold border transition-colors ${
                    historyEventFilter === f
                      ? "bg-[#1a1a2e] text-white border-[#1a1a2e]"
                      : "bg-white text-[#4a4a5a] border-[#e8e8ec] hover:bg-[#f7f7f9]"
                  }`}
                >
                  {f === "all" ? "All Events" : f}
                  {f !== "all" && (
                    <span className="ml-1.5 text-[10px] opacity-70">
                      {reservationAuditLog.filter(e => e.eventType === f).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Table container */}
          <div className="flex-1 overflow-hidden border border-[#e8e8ec] rounded-lg shadow-sm bg-white flex flex-col">
            <div className="flex-1 overflow-auto custom-scrollbar">
              <Table className="min-w-max w-full">
                <TableHeader className="bg-[#f7f7f9] sticky top-0 z-10 border-b border-[#e8e8ec]">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="px-4 py-3 text-[11px] font-semibold text-[#8b8b9e] uppercase tracking-wide whitespace-nowrap">Admin</TableHead>
                    <TableHead className="px-4 py-3 text-[11px] font-semibold text-[#8b8b9e] uppercase tracking-wide whitespace-nowrap">Warehouse</TableHead>
                    <TableHead className="px-4 py-3 text-[11px] font-semibold text-[#8b8b9e] uppercase tracking-wide whitespace-nowrap">Date & Time</TableHead>
                    <TableHead className="px-4 py-3 text-[11px] font-semibold text-[#8b8b9e] uppercase tracking-wide whitespace-nowrap">Source</TableHead>
                    <TableHead className="px-4 py-3 text-[11px] font-semibold text-[#8b8b9e] uppercase tracking-wide whitespace-nowrap">Item</TableHead>
                    <TableHead className="px-4 py-3 text-[11px] font-semibold text-[#8b8b9e] uppercase tracking-wide whitespace-nowrap">SKU</TableHead>
                    <TableHead className="px-4 py-3 text-[11px] font-semibold text-[#8b8b9e] uppercase tracking-wide whitespace-nowrap text-right">Qty</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleLog.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-[13px] text-gray-400 py-16">
                        No audit entries found.
                      </TableCell>
                    </TableRow>
                  ) : visibleLog.map(entry => (
                    <TableRow key={entry.id} className="hover:bg-[#f7f7f9] transition-colors border-b border-[#f0f0f3] text-[13px]">
                      {/* Admin */}
                      <TableCell className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-[#1a1a2e] whitespace-nowrap">{entry.triggeredBy}</span>
                          <span className={`inline-flex items-center self-start px-1.5 py-0.5 rounded text-[10px] font-semibold border ${EVENT_COLORS[entry.eventType]}`}>
                            {entry.eventType}
                          </span>
                        </div>
                      </TableCell>
                      {/* Warehouse */}
                      <TableCell className="px-4 py-3 text-[#4a4a5a] whitespace-nowrap">{entry.warehouse}</TableCell>
                      {/* Date & Time */}
                      <TableCell className="px-4 py-3 whitespace-nowrap">
                        <span className="text-[#1a1a2e] font-medium">{entry.date}</span>
                        {entry.time && <span className="block text-[11px] text-[#8b8b9e]">{entry.time}</span>}
                      </TableCell>
                      {/* Source */}
                      <TableCell className="px-4 py-3">
                        {entry.sourceInvoiceNumber ? (
                          <button onClick={() => entry.sourceInvoiceId && onNavigateToInvoice?.(entry.sourceInvoiceId)}
                            className="flex items-center gap-1 text-[#4f6ef7] hover:underline whitespace-nowrap font-medium text-[12px]">
                            {entry.sourceInvoiceNumber} <ExternalLink className="w-3 h-3" />
                          </button>
                        ) : entry.sourceSONumber ? (
                          <button onClick={() => entry.sourceSOId && onNavigateToSO?.(entry.sourceSOId)}
                            className="flex items-center gap-1 text-[#4f6ef7] hover:underline whitespace-nowrap font-medium text-[12px]">
                            {entry.sourceSONumber} <ExternalLink className="w-3 h-3" />
                          </button>
                        ) : <span className="text-[#c0c0cc]">—</span>}
                      </TableCell>
                      {/* Item */}
                      <TableCell className="px-4 py-3 font-medium text-[#1a1a2e] whitespace-nowrap">{entry.itemName}</TableCell>
                      {/* SKU */}
                      <TableCell className="px-4 py-3 text-[#8b8b9e] font-mono">{entry.sku}</TableCell>
                      {/* Qty */}
                      <TableCell className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex flex-col items-end">
                          <div>
                            <span className="font-semibold text-[#1a1a2e]">{entry.qty}</span>
                            <span className="text-[11px] font-normal text-[#8b8b9e] ml-1">{entry.unit}</span>
                          </div>
                          {entry.note && (
                            <span className="text-[10px] text-[#8b8b9e] italic leading-tight mt-1">{entry.note}</span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

        </div>
        )}

        {/* Pagination (list tab only) */}
        {activeTab === "list" && (
          <div className="flex items-center justify-between mt-4 shrink-0">
            <span className="text-[13px] text-[#8b8b9e]">
              Showing {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} records
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded border border-[#e8e8ec] text-[#4a4a5a] hover:bg-[#f7f7f9] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-8 h-8 rounded border text-[13px] font-medium transition-colors ${
                    p === currentPage
                      ? "bg-[#1a1a2e] text-white border-[#1a1a2e]"
                      : "border-[#e8e8ec] text-[#4a4a5a] hover:bg-[#f7f7f9]"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded border border-[#e8e8ec] text-[#4a4a5a] hover:bg-[#f7f7f9] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Reservation Modal */}
      <CreateReservationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onConfirm={(newResArray, source) => {
          const newEntries: ReservationAuditEntry[] = [];
          const formatted = newResArray.map(nr => {
            const resId = `RES-${Math.floor(Math.random() * 10000)}`;
            
            newEntries.push({
              id: `AUDIT-${Math.floor(Math.random() * 10000)}`,
              reservationId: resId,
              itemName: nr.itemName,
              sku: MOCK_ITEMS.find(mi => mi.id === nr.itemId)?.sku || "N/A",
              qty: nr.qty,
              unit: nr.unit,
              warehouse: nr.warehouse,
              sourceSOId: source?.type === "SO" ? source.number : undefined,
              sourceSONumber: source?.type === "SO" ? source.number : undefined,
              sourceInvoiceId: source?.type === "Invoice" ? source.number : undefined,
              sourceInvoiceNumber: source?.type === "Invoice" ? source.number : undefined,
              eventType: "Created",
              triggeredBy: "ADMIN Ayah Al-Ori",
              date: new Date().toISOString().split("T")[0],
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            });

            return {
              id: resId,
              itemId: nr.itemId,
              itemName: nr.itemName,
              qty: nr.qty,
              unit: nr.unit,
              qtyBase: nr.qty,
              warehouse: nr.warehouse,
              status: "ACTIVE" as const,
              date: new Date().toISOString().split("T")[0],
              type: "MANUAL" as const,
              sourceSOId: source?.type === "SO" ? source.number : undefined,
              sourceInvoiceId: source?.type === "Invoice" ? source.number : undefined,
            };
          });
          setGlobalReservations(prev => [...formatted, ...prev]);
          setReservationAuditLog(prev => [...newEntries, ...prev]);
        }}
        orderItems={MOCK_ITEMS}
        warehouses={ALL_WAREHOUSES}
      />
    </div>
  );
}
