import { useState } from "react";
import {
  Search,
  ExternalLink,
  Download,
  Printer,
  MoreHorizontal,
  MoreVertical,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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
import { useAppData, type ReservationAuditEntry } from "../../context/AppDataContext";

interface ReservationDetailsPageV2Props {
  onNavigateToSO?: (soId: string) => void;
  onNavigateToDN?: (dnId: string) => void;
  onNavigateToInvoice?: (invoiceId: string) => void;
}

type StatusFilter = "all" | "ACTIVE" | "CANCELED" | "REVOKED";

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: "all",      label: "All" },
  { key: "ACTIVE",   label: "Active" },
  { key: "CANCELED", label: "Canceled" },
  { key: "REVOKED",  label: "Revoked" },
];

const EVENT_COLORS: Record<ReservationAuditEntry["eventType"], string> = {
  "Used in delivery note": "bg-amber-50 text-amber-700 border-amber-200",
  "Manually Deleted":      "bg-red-50 text-red-600 border-red-200",
  "Created":               "bg-green-50 text-green-700 border-green-200",
  "Warehouse Transfer":    "bg-blue-50 text-blue-700 border-blue-200",
  "Edited":                "bg-teal-50 text-teal-700 border-teal-200",
};

export function ReservationDetailsPageV2({
  onNavigateToSO,
  onNavigateToDN,
  onNavigateToInvoice,
}: ReservationDetailsPageV2Props) {
  const { reservationAuditLog } = useAppData();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;

  const visibleLog = reservationAuditLog.filter(e => {
    if (statusFilter !== "all" && e.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        e.itemName.toLowerCase().includes(q) ||
        e.sku.toLowerCase().includes(q) ||
        (e.linkedDNNumber ?? "").toLowerCase().includes(q) ||
        (e.sourceSONumber ?? "").toLowerCase().includes(q) ||
        (e.sourceInvoiceNumber ?? "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(visibleLog.length / pageSize));
  const paginated = visibleLog.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSelectAll = () => {
    if (selectedIds.size === paginated.length && paginated.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginated.map(e => e.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  const isAllChecked = selectedIds.size === paginated.length && paginated.length > 0;

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden relative">
      {/* Top Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#e8e8ec]">
        <div className="flex items-center gap-4">
          <Menu className="w-5 h-5 text-[#4a4a5a] cursor-pointer" />
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-[#e8e8ec] rounded-md text-[13px] font-medium text-[#1a1a2e] hover:bg-[#f7f7f9] transition-colors">
            <Download className="w-4 h-4 text-[#4a4a5a]" /> Export to Excel
          </button>
        </div>
      </div>

      <div className="flex flex-col flex-1 p-6 overflow-hidden">
        <h1 className="text-[20px] font-bold text-[#1a1a2e] mb-6">Reservation Audit Log</h1>

        {/* Search */}
        <div className="mb-4">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b8b9e]" />
            <input
              type="text"
              placeholder="Search item, SKU, source, linked DN..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-2 rounded-md border border-[#e8e8ec] text-[13px] placeholder:text-[#b0b0be] outline-none focus:border-[#4f6ef7]"
            />
          </div>
        </div>

        {/* Total + Pagination header */}
        <div className="flex items-center justify-between mb-3 mt-1">
          <div className="text-[13px] font-medium text-[#1a1a2e]">
            Total Records {visibleLog.length}
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
                className="p-1 hover:bg-[#f7f7f9] rounded disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-medium px-1">{currentPage}</span>
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

        {/* BulkActionBar-style filter row */}
        <div className="flex items-center justify-between mb-4 bg-white border border-gray-100 rounded-[8px] p-1.5 shadow-sm">
          <div className="flex items-center gap-4">
            {/* Status tabs */}
            <div className="flex items-center bg-white border border-gray-100 rounded-[6px] overflow-hidden shadow-sm">
              {STATUS_TABS.map((tab, i) => (
                <button
                  key={tab.key}
                  onClick={() => { setStatusFilter(tab.key); setCurrentPage(1); }}
                  className={`px-5 py-1.5 text-[12px] font-semibold transition-colors ${i > 0 ? "border-l border-gray-100" : ""} ${
                    statusFilter === tab.key
                      ? "bg-[#e8a0fa] text-white"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Check All */}
            <label className="flex items-center gap-2 cursor-pointer ml-1">
              <div className="relative flex items-center justify-center w-[15px] h-[15px] bg-[#a855f7] rounded-[3px]">
                <div className="w-1.5 h-1.5 bg-white rounded-[1px]" />
                <input
                  type="checkbox"
                  className="absolute opacity-0 cursor-pointer w-full h-full"
                  checked={isAllChecked}
                  onChange={toggleSelectAll}
                />
              </div>
              <span className="text-[13px] font-medium text-[#4a4a5a] pt-0.5">Check All</span>
            </label>
          </div>

          <div className="flex items-center gap-2 pr-1">
            <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-[6px] text-[12px] font-medium text-[#4a4a5a] hover:bg-gray-50 transition-colors">
              <Printer className="w-3.5 h-3.5 text-gray-400" /> Print
            </button>
            <button className="flex items-center justify-center px-1.5 py-1.5 border border-gray-200 rounded-[6px] text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
            <button className="flex items-center justify-center w-7 h-7 border border-gray-200 rounded-full text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors ml-1">
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
            <button className="flex items-center justify-center w-8 h-8 bg-[#4f6ef7] hover:bg-[#3b5bdb] rounded-full text-white shadow-sm transition-colors ml-1">
              <Filter className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto rounded-[8px] border border-[#e8e8ec]">
          <Table>
            <TableHeader className="bg-[#f7f7f9] sticky top-0 z-10 border-b border-[#e8e8ec]">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12 text-center">
                  <div className="flex items-center justify-center p-1">
                    <Checkbox
                      checked={isAllChecked}
                      onCheckedChange={toggleSelectAll}
                      className="rounded-[4px] border-[#d0d0dc]"
                    />
                  </div>
                </TableHead>
                <TableHead className="text-[11px] font-medium text-[#8b8b9e] tracking-wider uppercase">Admin</TableHead>
                <TableHead className="text-[11px] font-medium text-[#8b8b9e] tracking-wider uppercase">Warehouse</TableHead>
                <TableHead className="text-[11px] font-medium text-[#8b8b9e] tracking-wider uppercase">Date & Time</TableHead>
                <TableHead className="text-[11px] font-medium text-[#8b8b9e] tracking-wider uppercase">Source</TableHead>
                <TableHead className="text-[11px] font-medium text-[#8b8b9e] tracking-wider uppercase">Item</TableHead>
                <TableHead className="text-[11px] font-medium text-[#8b8b9e] tracking-wider uppercase">SKU</TableHead>
                <TableHead className="text-[11px] font-medium text-[#8b8b9e] tracking-wider uppercase">Type</TableHead>
                <TableHead className="text-[11px] font-medium text-[#8b8b9e] tracking-wider uppercase">Status</TableHead>
                <TableHead className="text-[11px] font-medium text-[#8b8b9e] tracking-wider uppercase text-right">Qty</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center text-[13px] text-gray-400 py-16">
                    No audit entries found.
                  </TableCell>
                </TableRow>
              ) : paginated.map(entry => (
                <TableRow key={entry.id} className="hover:bg-[#f7f7f9] transition-colors border-b border-[#f0f0f3] text-[13px] text-[#4a4a5a]">
                  <TableCell className="w-12">
                    <div className="flex items-center justify-center p-1">
                      <Checkbox
                        checked={selectedIds.has(entry.id)}
                        onCheckedChange={() => toggleSelect(entry.id)}
                        className="rounded-[4px] border-[#d0d0dc]"
                      />
                    </div>
                  </TableCell>
                  {/* Admin + event badge */}
                  <TableCell className="py-3">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-[#1a1a2e] whitespace-nowrap">{entry.triggeredBy}</span>
                      <span className={`inline-flex items-center self-start px-1.5 py-0.5 rounded text-[10px] font-semibold border ${EVENT_COLORS[entry.eventType]}`}>
                        {entry.eventType}
                      </span>
                    </div>
                  </TableCell>
                  {/* Warehouse */}
                  <TableCell className="whitespace-nowrap">{entry.warehouse}</TableCell>
                  {/* Date & Time */}
                  <TableCell className="whitespace-nowrap">
                    <span className="text-[#1a1a2e] font-medium">{entry.date}</span>
                    {entry.time && <span className="block text-[11px] text-[#8b8b9e]">{entry.time}</span>}
                  </TableCell>
                  {/* Source */}
                  <TableCell>
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
                  <TableCell className="font-medium text-[#1a1a2e] whitespace-nowrap">{entry.itemName}</TableCell>
                  {/* SKU */}
                  <TableCell className="text-[#8b8b9e] font-mono">{entry.sku}</TableCell>
                  {/* Reservation Type */}
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                      entry.reservationType === "AUTO"
                        ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                        : "bg-gray-50 text-gray-600 border-gray-200"
                    }`}>
                      {entry.reservationType === "AUTO" ? "Stock" : "Manual"}
                    </span>
                  </TableCell>
                  {/* Status */}
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                      entry.status === "ACTIVE"  ? "bg-green-50 text-green-700 border-green-200" :
                      entry.status === "REVOKED" ? "bg-blue-50 text-blue-700 border-blue-200" :
                                                   "bg-amber-50 text-amber-700 border-amber-200"
                    }`}>
                      {entry.status === "ACTIVE" ? "Active" : entry.status === "REVOKED" ? "Revoked" : "Canceled"}
                    </span>
                  </TableCell>
                  {/* Qty */}
                  <TableCell className="text-right whitespace-nowrap">
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
  );
}
