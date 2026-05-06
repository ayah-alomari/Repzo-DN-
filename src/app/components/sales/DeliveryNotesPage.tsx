import { useState, useEffect } from "react";
import { useAppData } from "../../context/AppDataContext";
import {
  Download,
  Search,
  Filter,
  Settings2,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Menu,
  X,
  Truck,
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

interface DeliveryNotesPageProps {
  onDNClick?: (id: string) => void;
  onSOClick?: (id: string) => void;
  onNavigateToTransferDetails?: (id: string) => void;
}


const DNStatusBadge = ({ status }: { status: string }) => {
  if (status === "PENDING")
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
        Waiting for Transfer
      </span>
    );
  if (status === "PROCESSING")
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
        Noted for Delivery
      </span>
    );
  if (status === "APPROVED")
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-medium bg-green-50 text-green-700 border border-green-200">
        Delivered
      </span>
    );
  if (status === "CANCELED")
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-medium bg-red-50 text-red-700 border border-red-200">
        Canceled
      </span>
    );
  return <span>{status}</span>;
};

export function DeliveryNotesPage({ onDNClick, onSOClick, onNavigateToTransferDetails }: DeliveryNotesPageProps) {
  const { dnList, setDnList, setTransferList } = useAppData();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filter state
  const [filters, setFilters] = useState<{ id: string; field: string; value: string }[]>([]);
  const [tempFilters, setTempFilters] = useState<{ id: string; field: string; value: string }[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [quickFilter, setQuickFilter] = useState<"all" | "pending" | "failed">("all");
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

  useEffect(() => {
    if (isFilterOpen) {
      setTempFilters([...filters]);
    }
  }, [isFilterOpen, filters]);

  const addFilter = () =>
    setTempFilters([...tempFilters, { id: Math.random().toString(), field: "Status", value: "" }]);

  const updateTempFilter = (id: string, key: "field" | "value", val: string) => {
    setTempFilters(tempFilters.map((f) => (f.id === id ? { ...f, [key]: val } : f)));
  };

  const removeTempFilter = (id: string) =>
    setTempFilters(tempFilters.filter((f) => f.id !== id));

  const applyFilters = () => {
    setFilters(tempFilters);
    setIsFilterOpen(false);
  };

  const resetFilters = () => {
    setFilters([]);
    setTempFilters([]);
  };

  const filteredDNs = dnList.filter((dn) => {
    if (quickFilter === "pending" && dn.status !== "PENDING") return false;
    if (quickFilter === "failed" && dn.status !== "CANCELED") return false;
    let matchesFilters = true;
    if (filters.length > 0) {
      matchesFilters = filters.every((f) => {
        if (!f.value) return true;
        const v = f.value.toLowerCase();
        if (f.field === "Status") return dn.status.toLowerCase() === v;
        if (f.field === "Rep") return dn.rep.toLowerCase().includes(v);
        if (f.field === "DN Number") return dn.dnNumber.toLowerCase().includes(v);
        if (f.field === "Source SO") return (dn.sourceSONumber ?? "").toLowerCase().includes(v);
        if (f.field === "Client Name") return dn.clientName.toLowerCase().includes(v);
        if (f.field === "Created By") return dn.createdBy.toLowerCase().includes(v);
        if (f.field === "Warehouse") return dn.warehouse.toLowerCase().includes(v);
        if (f.field === "Created Date") return dn.createdDate.toLowerCase().includes(v);
        return true;
      });
    }

    let matchesSearch = true;
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      matchesSearch = Object.values(dn).some((val) =>
        String(val).toLowerCase().includes(q)
      );
    }

    return matchesFilters && matchesSearch;
  });

  const sortedDNs = [...filteredDNs].sort((a, b) => {
    if (!sortField) return 0;
    const getVal = (item: typeof a) => {
      const map: Record<string, string> = {
        "DN Number":    item.dnNumber,
        "Status":       item.status,
        "Source SO":    item.sourceSONumber ?? "",
        "Client":       item.clientName,
        "Rep":          item.rep,
        "Created By":   item.createdBy,
        "Warehouse":    item.warehouse,
        "Created Date": item.createdDate,
      };
      return String(map[sortField] ?? "").toLowerCase();
    };
    const aVal = getVal(a), bVal = getVal(b);
    return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
  });

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredDNs.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredDNs.map((d) => d.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const selectedDNs = dnList.filter(dn => selectedIds.has(dn.id));
  const canBulkTransfer = 
    selectedDNs.length > 0 && 
    selectedDNs.every(dn => dn.status === "PENDING") &&
    new Set(selectedDNs.map(dn => dn.rep)).size === 1 &&
    new Set(selectedDNs.map(dn => dn.warehouse)).size === 1;

  const handleBulkTransfer = () => {
    if (!canBulkTransfer) return;

    // 1. Collect and aggregate items
    const allItems: any[] = [];
    selectedDNs.forEach(dn => {
      dn.itemsData?.forEach(item => {
        allItems.push(item);
      });
    });

    // Group items by SKU to aggregate quantities
    const groupedItemsMap = new Map<string, any>();
    allItems.forEach(item => {
      if (groupedItemsMap.has(item.sku)) {
        const existing = groupedItemsMap.get(item.sku);
        existing.qty += item.qty;
        existing.qtyBase += (item.qtyBase || item.qty);
      } else {
        groupedItemsMap.set(item.sku, { ...item });
      }
    });

    const aggregatedItems = Array.from(groupedItemsMap.values()).map((item, index) => ({
      id: `tr-item-${Date.now()}-${index}`,
      productId: item.id, // using item id as productId
      sku: item.sku,
      productName: item.name,
      variantName: item.name,
      measureUnit: item.unit,
      quantity: item.qty,
      originQty: item.qty, // current stock in origin
      destQty: 0,
    }));

    // 2. Create the Transfer Record
    const newTransfer = {
      id: `TRN-BULK-${Date.now()}`,
      serialNo: `TRN-BULK-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toLocaleString(),
      createdBy: "System (Bulk)",
      from: selectedDNs[0].warehouse,
      to: `${selectedDNs[0].rep} Van`,
      type: "LOAD" as const,
      status: "PENDING" as const,
      numberOfProducts: aggregatedItems.length,
      items: aggregatedItems,
      sourceDNId: selectedDNs.map(dn => dn.id).join(", "),
      sourceDNNumber: selectedDNs.map(dn => dn.dnNumber).join(", "),
    };

    // 3. Update state
    setTransferList(prev => [newTransfer, ...prev]);
    setDnList(prev => prev.map(dn => {
      if (!selectedIds.has(dn.id) || dn.status !== "PENDING") return dn;
      return { ...dn, adminTransfer: "DONE", repTransfer: "CONFIRMED", status: "PROCESSING" };
    }));
    setSelectedIds(new Set());
    
    // 4. Navigate to the specific transfer details
    if (onNavigateToTransferDetails) {
      onNavigateToTransferDetails(newTransfer.id);
    }
  };

  const getFieldSuggestions = (field: string): string[] => {
    const map: Record<string, () => string[]> = {
      'DN Number':    () => dnList.map(d => d.dnNumber),
      'Source SO':    () => dnList.map(d => d.sourceSONumber ?? ""),
      'Client Name':  () => dnList.map(d => d.clientName),
      'Created By':   () => dnList.map(d => d.createdBy),
      'Warehouse':    () => dnList.map(d => d.warehouse),
      'Created Date': () => dnList.map(d => d.createdDate),
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
            <button className="px-4 py-1.5 rounded-full bg-white shadow-sm text-[#1a1a2e]">
              Delivery notes summary
            </button>
            <button className="px-4 py-1.5 rounded-full hover:bg-gray-100 transition-colors text-[#8b8b9e]">
              Delivery notes report
            </button>
          </div>
        </div>
        <div className="flex flex-1 justify-end items-center gap-4">
          <button className="flex items-center gap-2 px-4 py-2 border border-[#e8e8ec] rounded-md text-[13px] font-medium text-[#1a1a2e] hover:bg-[#f7f7f9] transition-colors">
            <Download className="w-4 h-4 text-[#4a4a5a]" />
            Export to Excel
          </button>
        </div>
      </div>

      <div className="flex flex-col flex-1 p-6 overflow-hidden">
        {/* Title */}
        <h1 className="text-[20px] font-bold text-[#1a1a2e] mb-6 flex items-center gap-2">
          <Truck className="w-5 h-5 text-[#4f6ef7]" />
          Delivery Notes
        </h1>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b8b9e]" />
            <input
              type="text"
              placeholder="Search .."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-md border border-[#e8e8ec] text-[13px] placeholder:text-[#b0b0be] outline-none focus:border-[#4f6ef7]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <PopoverTrigger asChild>
                <button className="p-2 border border-[#e8e8ec] rounded-md text-[#4a4a5a] hover:bg-[#f7f7f9] data-[state=open]:bg-[#f7f7f9]">
                  <Filter className="w-4 h-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[340px] p-0 shadow-lg border border-[#e8e8ec] rounded-lg bg-white"
                align="start"
                sideOffset={6}
              >
                <div className="p-4 border-b border-[#e8e8ec]">
                  <h3 className="font-semibold text-[#1a1a2e] text-[15px]">Filters</h3>
                </div>

                <div className="p-4 overflow-y-auto" style={{ maxHeight: "400px" }}>
                  <div className="mb-5">
                    <h4 className="text-[13px] font-medium text-[#1a1a2e] mb-2">
                      Popular Filters
                    </h4>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-[13px] font-medium text-[#1a1a2e]">
                        Current Filters
                      </h4>
                      {tempFilters.length > 0 && (
                        <button
                          onClick={() => setTempFilters([])}
                          className="text-[#ff4d4f] text-[12px] hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    {tempFilters.length > 0 && (
                      <div className="space-y-3 mb-4">
                        {tempFilters.map((f) => (
                          <div key={f.id} className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <select
                                value={f.field}
                                onChange={(e) =>
                                  updateTempFilter(f.id, "field", e.target.value)
                                }
                                className="h-8 border border-[#e8e8ec] text-[13px] rounded-md px-2 w-[140px] outline-none hover:border-[#b0b0be] cursor-pointer"
                              >
                                <option value="Status">Status</option>
                                <option value="Rep">Rep</option>
                                <option value="DN Number">DN Number</option>
                                <option value="Source SO">Source SO</option>
                                <option value="Client Name">Client Name</option>
                                <option value="Created By">Created By</option>
                                <option value="Warehouse">Warehouse</option>
                                <option value="Created Date">Created Date</option>
                              </select>
                              <span className="text-[12px] px-3 py-1.5 rounded-md border border-[#e8e8ec] text-[#1a1a2e]">
                                {['Status', 'Rep'].includes(f.field) ? 'equals' : 'contains'}
                              </span>
                              <button
                                onClick={() => removeTempFilter(f.id)}
                                className="text-[#b0b0be] hover:text-[#ff4d4f] ml-1"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            {f.field === "Status" ? (
                              <select
                                value={f.value}
                                onChange={(e) =>
                                  updateTempFilter(f.id, "value", e.target.value)
                                }
                                className="h-8 border border-[#e8e8ec] text-[13px] rounded-md px-2 w-[160px] outline-none shadow-[0_1px_2px_rgba(0,0,0,0.05)] cursor-pointer"
                              >
                                <option value="">Select an option</option>
                                <option value="PENDING">Waiting for Transfer</option>
                                <option value="PROCESSING">Noted for Delivery</option>
                                <option value="APPROVED">Delivered</option>
                                <option value="CANCELED">Canceled</option>
                              </select>
                            ) : f.field === "Rep" ? (
                              <select
                                value={f.value}
                                onChange={(e) =>
                                  updateTempFilter(f.id, "value", e.target.value)
                                }
                                className="h-8 border border-[#e8e8ec] text-[13px] rounded-md px-2 w-[160px] outline-none shadow-[0_1px_2px_rgba(0,0,0,0.05)] cursor-pointer"
                              >
                                <option value="">Select an option</option>
                                <option value="REP Ahmad Alshaikh">REP Ahmad Alshaikh</option>
                                <option value="REP khaled">REP khaled</option>
                                <option value="REP Ahmad Abudre">REP Ahmad Abudre</option>
                                <option value="ADMIN Yousef1">ADMIN Yousef1</option>
                                <option value="ADMIN Maram Alsl">ADMIN Maram Alsl</option>
                              </select>
                            ) : (
                              <>
                                <input
                                  type="text"
                                  value={f.value}
                                  onChange={(e) => updateTempFilter(f.id, "value", e.target.value)}
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
                      </div>
                    )}

                    <button
                      onClick={addFilter}
                      className="text-[12px] border border-[#e8e8ec] rounded-md px-3 py-1.5 hover:bg-[#f7f7f9] text-[#1a1a2e] font-medium shadow-sm"
                    >
                      Add filter
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border-t border-[#e8e8ec]">
                  <button
                    onClick={resetFilters}
                    className="text-[13px] border border-[#e8e8ec] bg-white rounded-md px-4 py-2 font-medium text-[#1a1a2e] hover:bg-[#f7f7f9] flex-1 mr-2 text-center transition-colors"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="text-[13px] border border-[#e8e8ec] bg-white rounded-md px-4 py-2 font-medium text-[#1a1a2e] hover:bg-[#f7f7f9] flex-1 mx-1 text-center transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={applyFilters}
                    className="text-[13px] bg-[#2d2d2d] text-white rounded-md px-4 py-2 font-medium hover:bg-[#1a1a2e] flex-1 ml-2 text-center transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </PopoverContent>
            </Popover>
            <button className="p-2 border border-[#e8e8ec] rounded-md text-[#4a4a5a] hover:bg-[#f7f7f9]">
              <Settings2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List Info & Pagination Header */}
        <div className="flex items-center justify-between mb-4 mt-2">
          <div className="text-[13px] font-medium text-[#1a1a2e]">
            Total Records {filteredDNs.length}
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
              <span className="font-medium px-1">1</span>
              <button className="p-1 hover:bg-[#f7f7f9] rounded">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <BulkActionBar
          isAllChecked={selectedIds.size === filteredDNs.length && filteredDNs.length > 0}
          onCheckAll={toggleSelectAll}
          activeFilter={quickFilter}
          onFilterChange={setQuickFilter}
          selectedCount={selectedIds.size}
          canBulkTransfer={canBulkTransfer}
          onBulkTransfer={handleBulkTransfer}
        />

        {/* Table Container */}
        <div className="flex-1 overflow-hidden border border-[#e8e8ec] rounded-lg shadow-sm bg-white flex flex-col">
          <div className="flex-1 overflow-auto custom-scrollbar">
            <Table className="min-w-max w-full">
              <TableHeader className="bg-[#f7f7f9] sticky top-0 z-10 border-b border-[#e8e8ec]">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-12 text-center text-[#8b8b9e]">
                    <div className="flex items-center justify-center p-1">
                      <Checkbox
                        checked={
                          selectedIds.size === filteredDNs.length &&
                          filteredDNs.length > 0
                        }
                        onCheckedChange={toggleSelectAll}
                        className="rounded-[4px] border-[#d0d0dc]"
                      />
                    </div>
                  </TableHead>
                  <TableHead 
                    onClick={() => handleSort("DN Number")}
                    className="text-[11px] font-medium text-[#8b8b9e] tracking-wider uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Menu className="w-3 h-3" /> DN NUMBER{" "}
                      {sortField === "DN Number" ? (sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-[#4f6ef7]"/> : <ChevronDown className="w-3 h-3 text-[#4f6ef7]"/>) : <Menu className="w-3 h-3 text-[#d0d0dc]"/>}
                    </div>
                  </TableHead>
                  <TableHead 
                    onClick={() => handleSort("Status")}
                    className="text-[11px] font-medium text-[#8b8b9e] tracking-wider uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Menu className="w-3 h-3 text-[#d0d0dc]" /> STATUS{" "}
                      {sortField === "Status" ? (sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-[#4f6ef7]"/> : <ChevronDown className="w-3 h-3 text-[#4f6ef7]"/>) : <Menu className="w-3 h-3 text-[#d0d0dc]"/>}
                    </div>
                  </TableHead>
                  <TableHead 
                    onClick={() => handleSort("Source SO")}
                    className="text-[11px] font-medium text-[#8b8b9e] tracking-wider uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Menu className="w-3 h-3 text-[#d0d0dc]" /> SOURCE SO{" "}
                      {sortField === "Source SO" ? (sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-[#4f6ef7]"/> : <ChevronDown className="w-3 h-3 text-[#4f6ef7]"/>) : <Menu className="w-3 h-3 text-[#d0d0dc]"/>}
                    </div>
                  </TableHead>
                  <TableHead 
                    onClick={() => handleSort("Client")}
                    className="text-[11px] font-medium text-[#8b8b9e] tracking-wider uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Menu className="w-3 h-3 text-[#d0d0dc]" /> CLIENT NAME{" "}
                      {sortField === "Client" ? (sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-[#4f6ef7]"/> : <ChevronDown className="w-3 h-3 text-[#4f6ef7]"/>) : <Menu className="w-3 h-3 text-[#d0d0dc]"/>}
                    </div>
                  </TableHead>
                  <TableHead 
                    onClick={() => handleSort("Rep")}
                    className="text-[11px] font-medium text-[#8b8b9e] tracking-wider uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Menu className="w-3 h-3 text-[#d0d0dc]" /> ASSIGNED REP{" "}
                      {sortField === "Rep" ? (sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-[#4f6ef7]"/> : <ChevronDown className="w-3 h-3 text-[#4f6ef7]"/>) : <Menu className="w-3 h-3 text-[#d0d0dc]"/>}
                    </div>
                  </TableHead>
                  <TableHead 
                    onClick={() => handleSort("Created By")}
                    className="text-[11px] font-medium text-[#8b8b9e] tracking-wider uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Menu className="w-3 h-3 text-[#d0d0dc]" /> CREATED BY{" "}
                      {sortField === "Created By" ? (sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-[#4f6ef7]"/> : <ChevronDown className="w-3 h-3 text-[#4f6ef7]"/>) : <Menu className="w-3 h-3 text-[#d0d0dc]"/>}
                    </div>
                  </TableHead>
                  <TableHead 
                    onClick={() => handleSort("Warehouse")}
                    className="text-[11px] font-medium text-[#8b8b9e] tracking-wider uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Menu className="w-3 h-3 text-[#d0d0dc]" /> WAREHOUSE{" "}
                      {sortField === "Warehouse" ? (sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-[#4f6ef7]"/> : <ChevronDown className="w-3 h-3 text-[#4f6ef7]"/>) : <Menu className="w-3 h-3 text-[#d0d0dc]"/>}
                    </div>
                  </TableHead>
                  <TableHead className="text-[11px] font-medium text-[#8b8b9e] tracking-wider uppercase">
                    <div className="flex items-center gap-2">
                      <Menu className="w-3 h-3 text-[#d0d0dc]" /> ITEMS{" "}
                      <Menu className="w-3 h-3 text-[#d0d0dc]" />
                    </div>
                  </TableHead>
                  <TableHead 
                    onClick={() => handleSort("Created Date")}
                    className="text-[11px] font-medium text-[#8b8b9e] tracking-wider uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Menu className="w-3 h-3 text-[#d0d0dc]" /> CREATED DATE{" "}
                      {sortField === "Created Date" ? (sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-[#4f6ef7]"/> : <ChevronDown className="w-3 h-3 text-[#4f6ef7]"/>) : <Menu className="w-3 h-3 text-[#d0d0dc]"/>}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedDNs.length > 0 ? (
                  sortedDNs.map((dn) => (
                    <TableRow
                      key={dn.id}
                      className="border-b border-[#f0f0f3] hover:bg-[#f7f7f9] text-[13px] text-[#4a4a5a]"
                    >
                      <TableCell className="w-12">
                        <div className="flex items-center justify-center p-1">
                          <Checkbox
                            checked={selectedIds.has(dn.id)}
                            onCheckedChange={() => toggleSelect(dn.id)}
                            className="rounded-[4px] border-[#d0d0dc]"
                          />
                        </div>
                      </TableCell>
                      <TableCell
                        onClick={() => onDNClick && onDNClick(dn.dnNumber)}
                        className="font-medium text-[#4f6ef7] hover:underline cursor-pointer"
                      >
                        {dn.dnNumber}
                      </TableCell>
                      <TableCell>
                        <DNStatusBadge status={dn.status} />
                      </TableCell>
                      <TableCell
                        onClick={() => onSOClick && dn.sourceSOId && onSOClick(dn.sourceSOId)}
                        className="font-medium text-[#4f6ef7] hover:underline cursor-pointer"
                      >
                        {dn.sourceSONumber}
                      </TableCell>
                      <TableCell>{dn.clientName}</TableCell>
                      <TableCell>{dn.rep}</TableCell>
                      <TableCell>{dn.createdBy}</TableCell>
                      <TableCell>{dn.warehouse}</TableCell>
                      <TableCell className="font-medium text-[#1a1a2e]">
                        {dn.items}
                      </TableCell>
                      <TableCell>{dn.createdDate}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center py-12 text-[#8b8b9e]"
                    >
                      No results match your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f7f7f9;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d0d0dc;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #b0b0be;
        }
      `}</style>
    </div>
  );
}
