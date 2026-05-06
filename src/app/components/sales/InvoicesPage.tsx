import React, { useState, useEffect } from "react";
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
import { Badge } from "../ui/badge";

interface InvoicesPageProps {
  onInvoiceClick?: (id: string) => void;
  onSOClick?: (id: string) => void;
  onCreateInvoice?: () => void;
}


interface FailedInvoiceData {
  id: string;
  serialNo: string;
  issueDate: string;
  creator: string;
  clientName: string;
  status: "Failed";
  reason: string;
}

interface VoidedInvoiceData {
  id: string;
  serialNo: string;
  issueDate: string;
  creator: string;
  clientName: string;
  status: "Voided";
  reason: string;
}


const mockFailed: FailedInvoiceData[] = [
  {
    id: "FAIL-001",
    serialNo: "INV-2026-F001",
    issueDate: "05/04/2026",
    creator: "ADMIN Ayah Al-Ori",
    clientName: "test 666 11717",
    status: "Failed",
    reason: "ERP sync error - duplicate entry",
  },
  {
    id: "FAIL-002",
    serialNo: "INV-2026-F002",
    issueDate: "03/04/2026",
    creator: "REP Ahmad Alshaikh",
    clientName: "Gaza",
    status: "Failed",
    reason: "Invalid client tax number",
  },
  {
    id: "FAIL-003",
    serialNo: "INV-2026-F003",
    issueDate: "01/04/2026",
    creator: "ADMIN M.htaht",
    clientName: "Karak Tes",
    status: "Failed",
    reason: "Network timeout during submission",
  },
];

const mockVoided: VoidedInvoiceData[] = [
  {
    id: "VOID-001",
    serialNo: "INV-2026-V001",
    issueDate: "20/03/2026",
    creator: "ADMIN Yousef1",
    clientName: "99ik",
    status: "Voided",
    reason: "Client returned all goods",
  },
  {
    id: "VOID-002",
    serialNo: "INV-2026-V002",
    issueDate: "15/03/2026",
    creator: "REP khaled",
    clientName: "new m2",
    status: "Voided",
    reason: "Duplicate invoice created in error",
  },
];

const StatusBadge = ({ status }: { status: "PENDING" | "APPROVED" | "CANCELED" }) => {
  if (status === "PENDING") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-medium bg-[#fcfbd7] text-[#e0a800]">
        PENDING
      </span>
    );
  }
  if (status === "APPROVED") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-medium bg-[#ecfdf3] text-[#12b76a]">
        APPROVED
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-medium bg-[#fff1f0] text-[#e41e3f]">
      CANCELED
    </span>
  );
};

const DeliveryBadge = ({ delivery }: { delivery: "No DN" | "Has DN" | "Delivered" }) => {
  if (delivery === "Delivered") {
    return (
      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-[10px] font-bold px-1.5 py-0 rounded">
        Delivered
      </Badge>
    );
  }
  if (delivery === "Has DN") {
    return (
      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 text-[10px] font-bold px-1.5 py-0 rounded">
        Has DN
      </Badge>
    );
  }
  return (
    <Badge className="bg-gray-100 text-gray-500 hover:bg-gray-100 text-[10px] font-bold px-1.5 py-0 rounded">
      No DN
    </Badge>
  );
};

type TabType = "invoices" | "failed" | "voided";

export function InvoicesPage({ onInvoiceClick, onSOClick, onCreateInvoice }: InvoicesPageProps) {
  const { invoices } = useAppData();
  const [activeTab, setActiveTab] = useState<TabType>("invoices");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<{ id: string; field: string; value: string }[]>([]);
  const [tempFilters, setTempFilters] = useState<{ id: string; field: string; value: string }[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

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

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    let matchesFilters = true;
    if (filters.length > 0) {
      matchesFilters = filters.every((f) => {
        if (!f.value) return true;
        const v = f.value.toLowerCase();
        if (f.field === "Status") return inv.status.toLowerCase() === v;
        if (f.field === "Payment Type") return inv.paymentType.toLowerCase() === v;
        if (f.field === "Delivery") return inv.delivery.toLowerCase() === v;
        if (f.field === "Serial #") return inv.serialNo.toLowerCase().includes(v);
        if (f.field === "External #") return inv.externalSerial.toLowerCase().includes(v);
        if (f.field === "Issue Date") return inv.issueDate.toLowerCase().includes(v);
        if (f.field === "Creator") return inv.creator.toLowerCase().includes(v);
        if (f.field === "Client Name") return inv.clientName.toLowerCase().includes(v);
        if (f.field === "Total") return inv.total.toLowerCase().includes(v);
        if (f.field === "Balance") return inv.balance.toLowerCase().includes(v);
        if (f.field === "Comment") return inv.comment.toLowerCase().includes(v);
        return true;
      });
    }
    let matchesSearch = true;
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      matchesSearch = Object.values(inv).some((val) =>
        String(val).toLowerCase().includes(q)
      );
    }
    return matchesFilters && matchesSearch;
  });

  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    if (!sortField) return 0;
    const getVal = (item: typeof a) => {
      const map: Record<string, string> = {
        "Serial #":     item.serialNo,
        "Issue Date":   item.issueDate,
        "Creator":      item.creator,
        "Client":       item.clientName,
        "Total":        item.total,
        "Balance":      item.balance,
        "Payment Type": item.paymentType,
        "Status":       item.status,
        "Delivery":     item.delivery,
      };
      return String(map[sortField] ?? "").toLowerCase();
    };
    const aVal = getVal(a), bVal = getVal(b);
    return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
  });

  const filteredFailed = mockFailed.filter((inv) => {
    if (searchQuery.trim() === "") return true;
    const q = searchQuery.toLowerCase();
    return Object.values(inv).some((val) => String(val).toLowerCase().includes(q));
  });

  const filteredVoided = mockVoided.filter((inv) => {
    if (searchQuery.trim() === "") return true;
    const q = searchQuery.toLowerCase();
    return Object.values(inv).some((val) => String(val).toLowerCase().includes(q));
  });

  const currentList =
    activeTab === "invoices"
      ? filteredInvoices
      : activeTab === "failed"
      ? filteredFailed
      : filteredVoided;

  const toggleSelectAll = () => {
    if (selectedIds.size === currentList.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(currentList.map((o) => o.id)));
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

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSelectedIds(new Set());
    setSearchQuery("");
    setFilters([]);
  };

  const getFieldSuggestions = (field: string): string[] => {
    const map: Record<string, () => string[]> = {
      'Serial #':    () => invoices.map(i => i.serialNo),
      'External #':  () => invoices.map(i => i.externalSerial),
      'Issue Date':  () => invoices.map(i => i.issueDate),
      'Creator':     () => invoices.map(i => i.creator),
      'Client Name': () => invoices.map(i => i.clientName),
      'Total':       () => invoices.map(i => i.total),
      'Balance':     () => invoices.map(i => i.balance),
      'Comment':     () => invoices.map(i => i.comment),
    };
    return [...new Set((map[field]?.() ?? []).filter(Boolean))].sort();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden relative">
      {/* Top Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#e8e8ec]">
        <div className="flex items-center gap-4">
          <Menu className="w-5 h-5 text-[#4a4a5a] cursor-pointer" />
          {/* Tab pill switcher */}
          <div className="flex items-center bg-[#f7f7f9] p-1 rounded-full text-[13px] font-medium text-[#4a4a5a]">
            <button
              onClick={() => handleTabChange("invoices")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-colors ${
                activeTab === "invoices"
                  ? "bg-white shadow-sm text-[#1a1a2e]"
                  : "hover:bg-gray-100 text-[#8b8b9e]"
              }`}
            >
              Invoices
              <span
                className={`text-[10px] font-bold px-1.5 py-0 rounded-full ${
                  activeTab === "invoices"
                    ? "bg-[#4f6ef7] text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {invoices.length}
              </span>
            </button>
            <button
              onClick={() => handleTabChange("failed")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-colors ${
                activeTab === "failed"
                  ? "bg-white shadow-sm text-[#1a1a2e]"
                  : "hover:bg-gray-100 text-[#8b8b9e]"
              }`}
            >
              Failed Invoices
              <span
                className={`text-[10px] font-bold px-1.5 py-0 rounded-full ${
                  activeTab === "failed"
                    ? "bg-[#e41e3f] text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {mockFailed.length}
              </span>
            </button>
            <button
              onClick={() => handleTabChange("voided")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-colors ${
                activeTab === "voided"
                  ? "bg-white shadow-sm text-[#1a1a2e]"
                  : "hover:bg-gray-100 text-[#8b8b9e]"
              }`}
            >
              Voided Invoices
              <span
                className={`text-[10px] font-bold px-1.5 py-0 rounded-full ${
                  activeTab === "voided"
                    ? "bg-gray-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {mockVoided.length}
              </span>
            </button>
          </div>
        </div>
        <div className="flex flex-1 justify-end items-center gap-4">
          <button className="flex items-center gap-2 px-4 py-2 border border-[#e8e8ec] rounded-md text-[13px] font-medium text-[#1a1a2e] hover:bg-[#f7f7f9] transition-colors">
            <Download className="w-4 h-4 text-[#4a4a5a]" />
            Export to Excel
          </button>
          <button 
            onClick={onCreateInvoice}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#a855f7] hover:bg-[#9333ea] text-white text-[13px] font-medium transition-colors shadow-sm"
          >
            Create Invoice
          </button>
        </div>
      </div>

      <div className="flex flex-col flex-1 p-6 overflow-hidden">
        {/* Title */}
        <h1 className="text-[20px] font-bold text-[#1a1a2e] mb-6">Invoices</h1>

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
                    <h4 className="text-[13px] font-medium text-[#1a1a2e] mb-2">Popular Filters</h4>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-[13px] font-medium text-[#1a1a2e]">Current Filters</h4>
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
                                onChange={(e) => updateTempFilter(f.id, "field", e.target.value)}
                                className="h-8 border border-[#e8e8ec] text-[13px] rounded-md px-2 w-[140px] outline-none hover:border-[#b0b0be] cursor-pointer"
                              >
                                <option value="Status">Status</option>
                                <option value="Payment Type">Payment Type</option>
                                <option value="Delivery">Delivery</option>
                                <option value="Serial #">Serial #</option>
                                <option value="External #">External #</option>
                                <option value="Issue Date">Issue Date</option>
                                <option value="Creator">Creator</option>
                                <option value="Client Name">Client Name</option>
                                <option value="Total">Total</option>
                                <option value="Balance">Balance</option>
                                <option value="Comment">Comment</option>
                              </select>
                              <span className="text-[12px] px-3 py-1.5 rounded-md border border-[#e8e8ec] text-[#1a1a2e]">
                                {['Status', 'Payment Type', 'Delivery'].includes(f.field) ? 'equals' : 'contains'}
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
                                onChange={(e) => updateTempFilter(f.id, "value", e.target.value)}
                                className="h-8 border border-[#e8e8ec] text-[13px] rounded-md px-2 w-[160px] outline-none shadow-[0_1px_2px_rgba(0,0,0,0.05)] cursor-pointer"
                              >
                                <option value="">Select an option</option>
                                <option value="PENDING">Pending</option>
                                <option value="APPROVED">Approved</option>
                                <option value="CANCELED">Canceled</option>
                              </select>
                            ) : f.field === "Payment Type" ? (
                              <select
                                value={f.value}
                                onChange={(e) => updateTempFilter(f.id, "value", e.target.value)}
                                className="h-8 border border-[#e8e8ec] text-[13px] rounded-md px-2 w-[160px] outline-none shadow-[0_1px_2px_rgba(0,0,0,0.05)] cursor-pointer"
                              >
                                <option value="">Select an option</option>
                                <option value="Cash">Cash</option>
                                <option value="Credit">Credit</option>
                                <option value="Deferred">Deferred</option>
                              </select>
                            ) : f.field === "Delivery" ? (
                              <select
                                value={f.value}
                                onChange={(e) => updateTempFilter(f.id, "value", e.target.value)}
                                className="h-8 border border-[#e8e8ec] text-[13px] rounded-md px-2 w-[160px] outline-none shadow-[0_1px_2px_rgba(0,0,0,0.05)] cursor-pointer"
                              >
                                <option value="">Select an option</option>
                                <option value="No DN">No DN</option>
                                <option value="Has DN">Has DN</option>
                                <option value="Delivered">Delivered</option>
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
            Total Records {currentList.length}
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

        {/* Table Container */}
        <div className="flex-1 overflow-hidden border border-[#e8e8ec] rounded-lg shadow-sm bg-white flex flex-col">
          <div className="flex-1 overflow-auto custom-scrollbar">
            {activeTab === "invoices" && (
              <Table className="min-w-max w-full">
                <TableHeader className="bg-[#f7f7f9] sticky top-0 z-10 border-b border-[#e8e8ec]">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-12 text-center text-[#8b8b9e]">
                      <div className="flex items-center justify-center p-1">
                        <Checkbox
                          checked={
                            selectedIds.size === filteredInvoices.length &&
                            filteredInvoices.length > 0
                          }
                          onCheckedChange={toggleSelectAll}
                          className="rounded-[4px] border-[#d0d0dc]"
                        />
                      </div>
                    </TableHead>
                    <TableHead 
                      onClick={() => handleSort("Serial #")}
                      className="text-[11px] font-medium text-[#8b8b9e] tracking-wider uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Menu className="w-3 h-3" /> SERIAL # 
                        {sortField === "Serial #" ? (sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-[#4f6ef7]"/> : <ChevronDown className="w-3 h-3 text-[#4f6ef7]"/>) : <Menu className="w-3 h-3 text-[#d0d0dc]"/>}
                      </div>
                    </TableHead>
                    <TableHead className="text-[11px] font-medium text-[#8b8b9e] tracking-wider uppercase">
                      <div className="flex items-center gap-2">
                        <Menu className="w-3 h-3 text-[#d0d0dc]" /> EXTERNAL # <Menu className="w-3 h-3 text-[#d0d0dc]" />
                      </div>
                    </TableHead>
                    <TableHead 
                      onClick={() => handleSort("Issue Date")}
                      className="text-[11px] font-medium text-[#8b8b9e] tracking-wider uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Menu className="w-3 h-3 text-[#d0d0dc]" /> ISSUE DATE 
                        {sortField === "Issue Date" ? (sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-[#4f6ef7]"/> : <ChevronDown className="w-3 h-3 text-[#4f6ef7]"/>) : <Menu className="w-3 h-3 text-[#d0d0dc]"/>}
                      </div>
                    </TableHead>
                    <TableHead 
                      onClick={() => handleSort("Creator")}
                      className="text-[11px] font-medium text-[#8b8b9e] tracking-wider uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Menu className="w-3 h-3 text-[#d0d0dc]" /> CREATOR 
                        {sortField === "Creator" ? (sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-[#4f6ef7]"/> : <ChevronDown className="w-3 h-3 text-[#4f6ef7]"/>) : <Menu className="w-3 h-3 text-[#d0d0dc]"/>}
                      </div>
                    </TableHead>
                    <TableHead 
                      onClick={() => handleSort("Client")}
                      className="text-[11px] font-medium text-[#8b8b9e] tracking-wider uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Menu className="w-3 h-3 text-[#d0d0dc]" /> CLIENT NAME 
                        {sortField === "Client" ? (sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-[#4f6ef7]"/> : <ChevronDown className="w-3 h-3 text-[#4f6ef7]"/>) : <Menu className="w-3 h-3 text-[#d0d0dc]"/>}
                      </div>
                    </TableHead>
                    <TableHead className="text-[11px] font-medium text-[#8b8b9e] tracking-wider uppercase">
                      <div className="flex items-center gap-2">
                        <Menu className="w-3 h-3 text-[#d0d0dc]" /> ITEMS <Menu className="w-3 h-3 text-[#d0d0dc]" />
                      </div>
                    </TableHead>
                    <TableHead 
                      onClick={() => handleSort("Total")}
                      className="text-[11px] font-medium text-[#8b8b9e] tracking-wider uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Menu className="w-3 h-3 text-[#d0d0dc]" /> TOTAL 
                        {sortField === "Total" ? (sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-[#4f6ef7]"/> : <ChevronDown className="w-3 h-3 text-[#4f6ef7]"/>) : <Menu className="w-3 h-3 text-[#d0d0dc]"/>}
                      </div>
                    </TableHead>
                    <TableHead 
                      onClick={() => handleSort("Balance")}
                      className="text-[11px] font-medium text-[#8b8b9e] tracking-wider uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Menu className="w-3 h-3 text-[#d0d0dc]" /> BALANCE 
                        {sortField === "Balance" ? (sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-[#4f6ef7]"/> : <ChevronDown className="w-3 h-3 text-[#4f6ef7]"/>) : <Menu className="w-3 h-3 text-[#d0d0dc]"/>}
                      </div>
                    </TableHead>
                    <TableHead 
                      onClick={() => handleSort("Payment Type")}
                      className="text-[11px] font-medium text-[#8b8b9e] tracking-wider uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Menu className="w-3 h-3 text-[#d0d0dc]" /> PAYMENT TYPE 
                        {sortField === "Payment Type" ? (sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-[#4f6ef7]"/> : <ChevronDown className="w-3 h-3 text-[#4f6ef7]"/>) : <Menu className="w-3 h-3 text-[#d0d0dc]"/>}
                      </div>
                    </TableHead>
                    <TableHead 
                      onClick={() => handleSort("Status")}
                      className="text-[11px] font-medium text-[#8b8b9e] tracking-wider uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Menu className="w-3 h-3 text-[#d0d0dc]" /> STATUS 
                        {sortField === "Status" ? (sortDir === "asc" ? <ChevronUp className="w-3 h-3 text-[#4f6ef7]"/> : <ChevronDown className="w-3 h-3 text-[#4f6ef7]"/>) : <Menu className="w-3 h-3 text-[#d0d0dc]"/>}
                      </div>
                    </TableHead>
                    <TableHead 
                      onClick={() => handleSort("Delivery")}
                      className="text-[11px] font-medium text-[#8b8b9e] tracking-wider uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2 text-[#4f6ef7]">
                        <Truck className="w-3 h-3" /> DELIVERY 
                        {sortField === "Delivery" ? (sortDir === "asc" ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>) : <Menu className="w-3 h-3 text-[#d0d0dc]"/>}
                      </div>
                    </TableHead>
                    <TableHead className="text-[11px] font-medium text-[#8b8b9e] tracking-wider uppercase">
                      <div className="flex items-center gap-2">
                        <Menu className="w-3 h-3 text-[#d0d0dc]" /> COMMENT <Menu className="w-3 h-3 text-[#d0d0dc]" />
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedInvoices.length > 0 ? (
                    sortedInvoices.map((inv) => (
                      <TableRow
                        key={inv.id}
                        className="border-b border-[#f0f0f3] hover:bg-[#f7f7f9] text-[13px] text-[#4a4a5a]"
                      >
                        <TableCell className="w-12">
                          <div className="flex items-center justify-center p-1">
                            <Checkbox
                              checked={selectedIds.has(inv.id)}
                              onCheckedChange={() => toggleSelect(inv.id)}
                              className="rounded-[4px] border-[#d0d0dc]"
                            />
                          </div>
                        </TableCell>
                        <TableCell
                          onClick={() => onInvoiceClick && onInvoiceClick(inv.id)}
                          className="font-medium text-[#4f6ef7] hover:underline cursor-pointer"
                        >
                          {inv.serialNo}
                        </TableCell>
                        <TableCell className="text-[#8b8b9e]">{inv.externalSerial}</TableCell>
                        <TableCell>{inv.issueDate}</TableCell>
                        <TableCell>{inv.creator}</TableCell>
                        <TableCell>{inv.clientName}</TableCell>
                        <TableCell className="font-medium text-[#1a1a2e]">{inv.items}</TableCell>
                        <TableCell className="font-medium text-[#1a1a2e]">{inv.total}</TableCell>
                        <TableCell
                          className={`font-medium ${
                            inv.balance === "JOD 0.00" ? "text-[#8b8b9e]" : "text-[#e0a800]"
                          }`}
                        >
                          {inv.balance}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-medium bg-gray-100 text-gray-600">
                            {inv.paymentType}
                          </span>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={inv.status} />
                        </TableCell>
                        <TableCell>
                          <DeliveryBadge delivery={inv.delivery} />
                        </TableCell>
                        <TableCell className="text-[#8b8b9e] max-w-[160px] truncate">
                          {inv.comment}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={13} className="text-center py-12 text-[#8b8b9e]">
                        No results match your filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}

            {activeTab === "failed" && (
              <Table className="min-w-max w-full">
                <TableHeader className="bg-[#f7f7f9] sticky top-0 z-10 border-b border-[#e8e8ec]">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-12 text-center text-[#8b8b9e]">
                      <div className="flex items-center justify-center p-1">
                        <Checkbox
                          checked={
                            selectedIds.size === filteredFailed.length &&
                            filteredFailed.length > 0
                          }
                          onCheckedChange={toggleSelectAll}
                          className="rounded-[4px] border-[#d0d0dc]"
                        />
                      </div>
                    </TableHead>
                    <TableHead className="text-[11px] font-medium text-[#8b8b9e] tracking-wider uppercase">
                      <div className="flex items-center gap-2">
                        <Menu className="w-3 h-3" /> SERIAL # <Menu className="w-3 h-3 text-[#d0d0dc]" />
                      </div>
                    </TableHead>
                    <TableHead className="text-[11px] font-medium text-[#8b8b9e] tracking-wider uppercase">
                      <div className="flex items-center gap-2">
                        <Menu className="w-3 h-3 text-[#d0d0dc]" /> ISSUE DATE <Menu className="w-3 h-3 text-[#d0d0dc]" />
                      </div>
                    </TableHead>
                    <TableHead className="text-[11px] font-medium text-[#8b8b9e] tracking-wider uppercase">
                      <div className="flex items-center gap-2">
                        <Menu className="w-3 h-3 text-[#d0d0dc]" /> CREATOR <Menu className="w-3 h-3 text-[#d0d0dc]" />
                      </div>
                    </TableHead>
                    <TableHead className="text-[11px] font-medium text-[#8b8b9e] tracking-wider uppercase">
                      <div className="flex items-center gap-2">
                        <Menu className="w-3 h-3 text-[#d0d0dc]" /> CLIENT NAME <Menu className="w-3 h-3 text-[#d0d0dc]" />
                      </div>
                    </TableHead>
                    <TableHead className="text-[11px] font-medium text-[#8b8b9e] tracking-wider uppercase">
                      <div className="flex items-center gap-2">
                        <Menu className="w-3 h-3 text-[#d0d0dc]" /> STATUS <Menu className="w-3 h-3 text-[#d0d0dc]" />
                      </div>
                    </TableHead>
                    <TableHead className="text-[11px] font-medium text-[#8b8b9e] tracking-wider uppercase">
                      <div className="flex items-center gap-2">
                        <Menu className="w-3 h-3 text-[#d0d0dc]" /> REASON <Menu className="w-3 h-3 text-[#d0d0dc]" />
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFailed.length > 0 ? (
                    filteredFailed.map((inv) => (
                      <TableRow
                        key={inv.id}
                        className="border-b border-[#f0f0f3] hover:bg-[#f7f7f9] text-[13px] text-[#4a4a5a]"
                      >
                        <TableCell className="w-12">
                          <div className="flex items-center justify-center p-1">
                            <Checkbox
                              checked={selectedIds.has(inv.id)}
                              onCheckedChange={() => toggleSelect(inv.id)}
                              className="rounded-[4px] border-[#d0d0dc]"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-[#1a1a2e]">{inv.serialNo}</TableCell>
                        <TableCell>{inv.issueDate}</TableCell>
                        <TableCell>{inv.creator}</TableCell>
                        <TableCell>{inv.clientName}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-medium bg-[#fff1f0] text-[#e41e3f]">
                            Failed
                          </span>
                        </TableCell>
                        <TableCell className="text-[#8b8b9e] max-w-[240px] truncate">
                          {inv.reason}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-[#8b8b9e]">
                        No failed invoices found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}

            {activeTab === "voided" && (
              <Table className="min-w-max w-full">
                <TableHeader className="bg-[#f7f7f9] sticky top-0 z-10 border-b border-[#e8e8ec]">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-12 text-center text-[#8b8b9e]">
                      <div className="flex items-center justify-center p-1">
                        <Checkbox
                          checked={
                            selectedIds.size === filteredVoided.length &&
                            filteredVoided.length > 0
                          }
                          onCheckedChange={toggleSelectAll}
                          className="rounded-[4px] border-[#d0d0dc]"
                        />
                      </div>
                    </TableHead>
                    <TableHead className="text-[11px] font-medium text-[#8b8b9e] tracking-wider uppercase">
                      <div className="flex items-center gap-2">
                        <Menu className="w-3 h-3" /> SERIAL # <Menu className="w-3 h-3 text-[#d0d0dc]" />
                      </div>
                    </TableHead>
                    <TableHead className="text-[11px] font-medium text-[#8b8b9e] tracking-wider uppercase">
                      <div className="flex items-center gap-2">
                        <Menu className="w-3 h-3 text-[#d0d0dc]" /> ISSUE DATE <Menu className="w-3 h-3 text-[#d0d0dc]" />
                      </div>
                    </TableHead>
                    <TableHead className="text-[11px] font-medium text-[#8b8b9e] tracking-wider uppercase">
                      <div className="flex items-center gap-2">
                        <Menu className="w-3 h-3 text-[#d0d0dc]" /> CREATOR <Menu className="w-3 h-3 text-[#d0d0dc]" />
                      </div>
                    </TableHead>
                    <TableHead className="text-[11px] font-medium text-[#8b8b9e] tracking-wider uppercase">
                      <div className="flex items-center gap-2">
                        <Menu className="w-3 h-3 text-[#d0d0dc]" /> CLIENT NAME <Menu className="w-3 h-3 text-[#d0d0dc]" />
                      </div>
                    </TableHead>
                    <TableHead className="text-[11px] font-medium text-[#8b8b9e] tracking-wider uppercase">
                      <div className="flex items-center gap-2">
                        <Menu className="w-3 h-3 text-[#d0d0dc]" /> STATUS <Menu className="w-3 h-3 text-[#d0d0dc]" />
                      </div>
                    </TableHead>
                    <TableHead className="text-[11px] font-medium text-[#8b8b9e] tracking-wider uppercase">
                      <div className="flex items-center gap-2">
                        <Menu className="w-3 h-3 text-[#d0d0dc]" /> REASON <Menu className="w-3 h-3 text-[#d0d0dc]" />
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVoided.length > 0 ? (
                    filteredVoided.map((inv) => (
                      <TableRow
                        key={inv.id}
                        className="border-b border-[#f0f0f3] hover:bg-[#f7f7f9] text-[13px] text-[#4a4a5a]"
                      >
                        <TableCell className="w-12">
                          <div className="flex items-center justify-center p-1">
                            <Checkbox
                              checked={selectedIds.has(inv.id)}
                              onCheckedChange={() => toggleSelect(inv.id)}
                              className="rounded-[4px] border-[#d0d0dc]"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-[#1a1a2e]">{inv.serialNo}</TableCell>
                        <TableCell>{inv.issueDate}</TableCell>
                        <TableCell>{inv.creator}</TableCell>
                        <TableCell>{inv.clientName}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-medium bg-gray-100 text-gray-600">
                            Voided
                          </span>
                        </TableCell>
                        <TableCell className="text-[#8b8b9e] max-w-[240px] truncate">
                          {inv.reason}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-[#8b8b9e]">
                        No voided invoices found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
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
