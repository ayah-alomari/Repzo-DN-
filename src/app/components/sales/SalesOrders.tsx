import { useState, useEffect, useId } from "react";
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
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from "../ui/table";
import { Checkbox } from "../ui/checkbox";
import { BulkActionBar } from "./BulkActionBar";
import { useAppData } from "../../context/AppDataContext";

// ── Track indicator dot ──────────────────────────────────────────────────────
type DotState = "empty" | "partial" | "full";

function TrackDot({ state, color, label }: { state: DotState; color: string; label: string }) {
  const uid = useId();
  const clipId = `td${uid.replace(/:/g, "")}`;

  if (state === "full") {
    return (
      <div className="flex items-center justify-center" title={label}>
        <svg width="14" height="14" viewBox="0 0 14 14">
          <circle cx="7" cy="7" r="5.5" fill={color} />
        </svg>
      </div>
    );
  }

  if (state === "partial") {
    return (
      <div className="flex items-center justify-center" title={label}>
        <svg width="14" height="14" viewBox="0 0 14 14">
          <defs>
            <clipPath id={clipId}>
              <rect x="0" y="0" width="7" height="14" />
            </clipPath>
          </defs>
          <circle cx="7" cy="7" r="5.5" fill="none" stroke={color} strokeWidth="1.5" />
          <circle cx="7" cy="7" r="5.5" fill={color} clipPath={`url(#${clipId})`} />
        </svg>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center" title={label}>
      <svg width="14" height="14" viewBox="0 0 14 14">
        <circle cx="7" cy="7" r="5.5" fill="none" stroke="#d1d5db" strokeWidth="1.5" />
      </svg>
    </div>
  );
}


export function SalesOrders({ onOrderClick, onCreateSO }: { onOrderClick?: (id: string) => void; onCreateSO?: () => void }) {
  const { salesOrders, invoices, dnList, transferList } = useAppData();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filter State
  const [filters, setFilters] = useState<{ id: string; field: string; value: string }[]>([]);
  const [tempFilters, setTempFilters] = useState<{ id: string; field: string; value: string }[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [quickFilter, setQuickFilter] = useState<"all" | "pending" | "failed">("all");

  useEffect(() => {
    if (isFilterOpen) {
      setTempFilters([...filters]);
    }
  }, [isFilterOpen, filters]);

  const addFilter = () => setTempFilters([...tempFilters, { id: Math.random().toString(), field: 'Status', value: '' }]);
  const updateTempFilter = (id: string, key: 'field' | 'value', val: string) => {
    setTempFilters(tempFilters.map(f => f.id === id ? { ...f, [key]: val } : f));
  };
  const removeTempFilter = (id: string) => setTempFilters(tempFilters.filter(f => f.id !== id));
  
  const applyFilters = () => {
    setFilters(tempFilters);
    setIsFilterOpen(false);
  };
  const resetFilters = () => {
    setFilters([]);
    setTempFilters([]);
  };

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

  const filteredOrders = salesOrders.filter(order => {
    if (quickFilter === "pending" && order.status.toLowerCase() !== "pending") return false;
    if (quickFilter === "failed" && order.status.toLowerCase() !== "rejected") return false;
    let matchesFilters = true;
    if (filters.length > 0) {
      matchesFilters = filters.every(f => {
        if (!f.value) return true;
        const v = f.value.toLowerCase();
        if (f.field === 'Status') return order.status.toLowerCase() === v;
        if (f.field === 'Delivery Status') return order.deliveryStatus.toLowerCase() === v;
        if (f.field === 'Order No') return order.orderNo.toLowerCase().includes(v);
        if (f.field === 'Issue Date') return order.issueDate.toLowerCase().includes(v);
        if (f.field === 'Creator') return order.creator.toLowerCase().includes(v);
        if (f.field === 'Client Name') return order.clientName.toLowerCase().includes(v);
        if (f.field === 'Visit ID') return order.visitId.toLowerCase().includes(v);
        return true;
      });
    }

    let matchesSearch = true;
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      matchesSearch = Object.values(order).some(val => 
        String(val).toLowerCase().includes(q)
      );
    }

    return matchesFilters && matchesSearch;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (!sortField) return 0;
    const map: Record<string, string> = {
      "Order No":   a.orderNo,
      "Issue Date": a.issueDate,
      "Creator":    a.creator,
      "Client":     a.clientName,
      "Total":      a.total,
      "Status":     a.status,
      "Delivery":   a.deliveryStatus,
    };
    const bMap: Record<string, string> = {
      "Order No":   b.orderNo,
      "Issue Date": b.issueDate,
      "Creator":    b.creator,
      "Client":     b.clientName,
      "Total":      b.total,
      "Status":     b.status,
      "Delivery":   b.deliveryStatus,
    };
    const aVal = String(map[sortField] ?? "").toLowerCase();
    const bVal = String(bMap[sortField] ?? "").toLowerCase();
    return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
  });

  const toggleSelectAll = () => {
    if (selectedIds.size === sortedOrders.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedOrders.map(o => o.id)));
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

  const StatusBadge = ({ status }: { status: string }) => {
    if (status === "pending") {
      return <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-medium bg-[#fcfbd7] text-[#e0a800]">pending</span>;
    }
    if (status === "approved" || status === "invoiced") {
      return <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-medium bg-[#ecfdf3] text-[#12b76a]">approved</span>;
    }
    if (status === "rejected") {
      return <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-medium bg-[#fff1f2] text-[#e41e3f]">rejected</span>;
    }
    return <span>{status}</span>;
  };

  const getFieldSuggestions = (field: string): string[] => {
    const map: Record<string, () => string[]> = {
      'Order No':    () => salesOrders.map(o => o.orderNo),
      'Issue Date':  () => salesOrders.map(o => o.issueDate),
      'Creator':     () => salesOrders.map(o => o.creator),
      'Client Name': () => salesOrders.map(o => o.clientName),
      'Visit ID':    () => salesOrders.map(o => o.visitId),
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
            <button className="px-4 py-1.5 rounded-full bg-white shadow-sm text-[#1a1a2e]">Sales orders summary</button>
            <button className="px-4 py-1.5 rounded-full hover:bg-gray-100 transition-colors text-[#8b8b9e]">Sales orders report</button>
          </div>
        </div>
        <div className="flex flex-1 justify-end items-center gap-4">
          <button className="flex items-center gap-2 px-4 py-2 border border-[#e8e8ec] rounded-md text-[13px] font-medium text-[#1a1a2e] hover:bg-[#f7f7f9] transition-colors">
            <Download className="w-4 h-4 text-[#4a4a5a]" />
            Export to Excel
          </button>
          <button 
            onClick={onCreateSO}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#a855f7] hover:bg-[#9333ea] text-white text-[13px] font-medium transition-colors shadow-sm"
          >
            Create Sales Order
          </button>
        </div>
      </div>

      <div className="flex flex-col flex-1 p-6 overflow-hidden">
        {/* Title */}
        <h1 className="text-[20px] font-bold text-[#1a1a2e] mb-6">Sales Orders</h1>
        
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
              <PopoverContent className="w-[340px] p-0 shadow-lg border border-[#e8e8ec] rounded-lg bg-white" align="start" sideOffset={6}>
                <div className="p-4 border-b border-[#e8e8ec]">
                  <h3 className="font-semibold text-[#1a1a2e] text-[15px]">Filters</h3>
                </div>
                
                <div className="p-4 overflow-y-auto" style={{ maxHeight: "400px" }}>
                  <div className="mb-5">
                    <h4 className="text-[13px] font-medium text-[#1a1a2e] mb-2">Popular Filters</h4>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-[13px] font-medium text-[#1a1a2e]">Current Filters</h4>
                      {tempFilters.length > 0 && (
                        <button onClick={() => setTempFilters([])} className="text-[#ff4d4f] text-[12px] hover:underline">Remove</button>
                      )}
                    </div>
                    
                    {tempFilters.length > 0 && (
                      <div className="space-y-3 mb-4">
                        {tempFilters.map((f) => (
                          <div key={f.id} className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <select 
                                value={f.field} 
                                onChange={(e) => updateTempFilter(f.id, 'field', e.target.value)}
                                className="h-8 border border-[#e8e8ec] text-[13px] rounded-md px-2 w-[140px] outline-none hover:border-[#b0b0be] cursor-pointer"
                              >
                                <option value="Status">Status</option>
                                <option value="Delivery Status">Delivery Status</option>
                                <option value="Order No">Order No</option>
                                <option value="Issue Date">Issue Date</option>
                                <option value="Creator">Creator</option>
                                <option value="Client Name">Client Name</option>
                                <option value="Visit ID">Visit ID</option>
                              </select>
                              <span className="text-[12px] px-3 py-1.5 rounded-md border border-[#e8e8ec] text-[#1a1a2e]">{['Status', 'Delivery Status'].includes(f.field) ? 'equals' : 'contains'}</span>
                              <button onClick={() => removeTempFilter(f.id)} className="text-[#b0b0be] hover:text-[#ff4d4f] ml-1"><X className="w-4 h-4" /></button>
                            </div>
                            {['Status', 'Delivery Status'].includes(f.field) ? (
                              <select
                                value={f.value}
                                onChange={(e) => updateTempFilter(f.id, 'value', e.target.value)}
                                className="h-8 border border-[#e8e8ec] text-[13px] rounded-md px-2 w-[160px] outline-none shadow-[0_1px_2px_rgba(0,0,0,0.05)] cursor-pointer"
                              >
                                <option value="">Select an option</option>
                                {f.field === 'Delivery Status' ? (
                                  <>
                                    <option value="Undelivered">Undelivered</option>
                                    <option value="Partially Delivered">Partially Delivered</option>
                                    <option value="Delivered">Delivered</option>
                                  </>
                                ) : (
                                  <>
                                    <option value="Draft">Draft</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Cancelled">Cancelled</option>
                                  </>
                                )}
                              </select>
                            ) : (
                              <>
                                <input
                                  type="text"
                                  value={f.value}
                                  onChange={(e) => updateTempFilter(f.id, 'value', e.target.value)}
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
                    
                    <button onClick={addFilter} className="text-[12px] border border-[#e8e8ec] rounded-md px-3 py-1.5 hover:bg-[#f7f7f9] text-[#1a1a2e] font-medium shadow-sm">
                      Add filter
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 border-t border-[#e8e8ec]">
                  <button onClick={resetFilters} className="text-[13px] border border-[#e8e8ec] bg-white rounded-md px-4 py-2 font-medium text-[#1a1a2e] hover:bg-[#f7f7f9] flex-1 mr-2 text-center transition-colors">Reset</button>
                  <button onClick={() => setIsFilterOpen(false)} className="text-[13px] border border-[#e8e8ec] bg-white rounded-md px-4 py-2 font-medium text-[#1a1a2e] hover:bg-[#f7f7f9] flex-1 mx-1 text-center transition-colors">Cancel</button>
                  <button onClick={applyFilters} className="text-[13px] bg-[#2d2d2d] text-white rounded-md px-4 py-2 font-medium hover:bg-[#1a1a2e] flex-1 ml-2 text-center transition-colors">Apply</button>
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
            Total Records 2767
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
          isAllChecked={selectedIds.size === filteredOrders.length && filteredOrders.length > 0}
          onCheckAll={toggleSelectAll}
          activeFilter={quickFilter}
          onFilterChange={setQuickFilter}
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
                        checked={selectedIds.size === filteredOrders.length && filteredOrders.length > 0} 
                        onCheckedChange={toggleSelectAll} 
                        className="rounded-[4px] border-[#d0d0dc]"
                      />
                    </div>
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("Order No")}
                    className="text-[11px] font-medium text-[#8b8b9e] tracking-wider uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Menu className="w-3 h-3"/> ORDER NO.
                      {sortField === "Order No" ? (sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-[#4f6ef7]"/> : <ChevronDown className="w-3 h-3 text-[#4f6ef7]"/>) : <Menu className="w-3 h-3 text-[#d0d0dc]"/>}
                    </div>
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("Status")}
                    className="text-[11px] font-medium text-[#8b8b9e] tracking-wider uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Menu className="w-3 h-3 text-[#d0d0dc]"/> STATUS
                      {sortField === "Status" ? (sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-[#4f6ef7]"/> : <ChevronDown className="w-3 h-3 text-[#4f6ef7]"/>) : <Menu className="w-3 h-3 text-[#d0d0dc]"/>}
                    </div>
                  </TableHead>
                  <TableHead className="text-center text-[11px] font-medium text-[#8b8b9e] tracking-wider uppercase w-[72px]">INVOICED</TableHead>
                  <TableHead className="text-center text-[11px] font-medium text-[#8b8b9e] tracking-wider uppercase w-[72px]">NOTED</TableHead>
                  <TableHead className="text-center text-[11px] font-medium text-[#8b8b9e] tracking-wider uppercase w-[72px]">DELIVERED</TableHead>
                  <TableHead
                    onClick={() => handleSort("Issue Date")}
                    className="text-[11px] font-medium text-[#8b8b9e] tracking-wider uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Menu className="w-3 h-3 text-[#d0d0dc]"/> ISSUE DATE
                      {sortField === "Issue Date" ? (sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-[#4f6ef7]"/> : <ChevronDown className="w-3 h-3 text-[#4f6ef7]"/>) : <Menu className="w-3 h-3 text-[#d0d0dc]"/>}
                    </div>
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("Creator")}
                    className="text-[11px] font-medium text-[#8b8b9e] tracking-wider uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Menu className="w-3 h-3 text-[#d0d0dc]"/> CREATOR
                      {sortField === "Creator" ? (sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-[#4f6ef7]"/> : <ChevronDown className="w-3 h-3 text-[#4f6ef7]"/>) : <Menu className="w-3 h-3 text-[#d0d0dc]"/>}
                    </div>
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("Client")}
                    className="text-[11px] font-medium text-[#8b8b9e] tracking-wider uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Menu className="w-3 h-3 text-[#d0d0dc]"/> CLIENT NAME
                      {sortField === "Client" ? (sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-[#4f6ef7]"/> : <ChevronDown className="w-3 h-3 text-[#4f6ef7]"/>) : <Menu className="w-3 h-3 text-[#d0d0dc]"/>}
                    </div>
                  </TableHead>
                  <TableHead className="text-[11px] font-medium text-[#8b8b9e] tracking-wider uppercase"><div className="flex items-center gap-2"><Menu className="w-3 h-3 text-[#d0d0dc]"/> ITEMS <Menu className="w-3 h-3 text-[#d0d0dc]"/></div></TableHead>
                  <TableHead
                    onClick={() => handleSort("Total")}
                    className="text-[11px] font-medium text-[#8b8b9e] tracking-wider uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Menu className="w-3 h-3 text-[#d0d0dc]"/> TOTAL
                      {sortField === "Total" ? (sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-[#4f6ef7]"/> : <ChevronDown className="w-3 h-3 text-[#4f6ef7]"/>) : <Menu className="w-3 h-3 text-[#d0d0dc]"/>}
                    </div>
                  </TableHead>
                  <TableHead className="text-[11px] font-medium text-[#8b8b9e] tracking-wider uppercase"><div className="flex items-center gap-2"><Menu className="w-3 h-3 text-[#d0d0dc]"/> VISIT ID <Menu className="w-3 h-3 text-[#d0d0dc]"/></div></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedOrders.length > 0 ? sortedOrders.map((order) => (
                  <TableRow key={order.id} className="border-b border-[#f0f0f3] hover:bg-[#f7f7f9] text-[13px] text-[#4a4a5a]">
                    <TableCell className="w-12">
                      <div className="flex items-center justify-center p-1">
                        <Checkbox 
                          checked={selectedIds.has(order.id)} 
                          onCheckedChange={() => toggleSelect(order.id)}
                          className="rounded-[4px] border-[#d0d0dc]"
                        />
                      </div>
                    </TableCell>
                    <TableCell onClick={() => onOrderClick && onOrderClick(order.orderNo)} className="font-medium text-[#4f6ef7] hover:underline cursor-pointer">{order.orderNo}</TableCell>
                    <TableCell><StatusBadge status={order.status} /></TableCell>
                    {(() => {
                      // INVOICED — binary: non-canceled invoice exists?
                      const inv = invoices.find(i => (i.sourceSOId === order.id || i.id === order.linkedInvoiceId) && i.status !== "CANCELED");

                      // NOTED — DN exists AND has a transfer; partial if not all SO items covered
                      const activeDns = dnList.filter(d => d.sourceSOId === order.id && d.status !== "CANCELED");
                      const dnsWithTransfer = activeDns.filter(d => transferList.some(t => t.sourceDNId === d.id));
                      const notedItems = dnsWithTransfer.reduce((s, d) => s + d.items, 0);
                      const notedState: DotState = dnsWithTransfer.length === 0 ? "empty" : notedItems >= order.items ? "full" : "partial";

                      // DELIVERED — based on APPROVED DNs covering all SO items
                      const approvedDns = activeDns.filter(d => d.status === "APPROVED");
                      const deliveredItems = approvedDns.reduce((s, d) => s + d.items, 0);
                      const delivState: DotState = deliveredItems === 0 ? "empty" : deliveredItems >= order.items ? "full" : "partial";

                      return (
                        <>
                          <TableCell className="text-center"><TrackDot state={inv ? "full" : "empty"} color="#4f6ef7" label={inv ? "Invoiced" : "Not invoiced"} /></TableCell>
                          <TableCell className="text-center"><TrackDot state={notedState} color="#4f6ef7" label={notedState === "full" ? "All items noted & transferred" : notedState === "partial" ? "Partially noted" : "No delivery note / no transfer"} /></TableCell>
                          <TableCell className="text-center"><TrackDot state={delivState} color="#4f6ef7" label={delivState === "full" ? "Fully delivered" : delivState === "partial" ? "Partially delivered" : "Not delivered"} /></TableCell>
                        </>
                      );
                    })()}
                    <TableCell>{order.issueDate}</TableCell>
                    <TableCell>{order.creator}</TableCell>
                    <TableCell>{order.clientName}</TableCell>
                    <TableCell className="font-medium text-[#1a1a2e]">{order.items}</TableCell>
                    <TableCell className="font-medium text-[#1a1a2e]">{order.total}</TableCell>
                    <TableCell>{order.visitId}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-12 text-[#8b8b9e]">
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
