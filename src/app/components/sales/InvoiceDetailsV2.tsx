import React, { useState, useEffect, useRef } from "react";
import { getProductFamily, getBaseUnit, toBase, getUnitFactor } from "./measurementUnits";
import {
  useAppData,
  type DeliveryNote,
} from "../../context/AppDataContext";
import {
  Pencil, Paperclip, Printer, Settings,
  FileText, Truck, ArrowLeftRight,
  Clock, X, User, AlertCircle,
  History as HistoryIcon,
  ImageIcon, Eye, ChevronRight, ChevronDown,
  Maximize2, Minimize2, Send,
  ExternalLink, RotateCcw, Bookmark,
} from "lucide-react";
import { CreateDeliveryNoteModal } from "./CreateDeliveryNoteModal";

const REPS   = ["Ahmad Alshaikh", "REP khaled", "REP Ahmad Abudre"];
const WHS    = ["Mohammad test", "Dream Warehouse", "Maram", "Zarqaa Warehouse", "Khald Warehouse", "Main Branch"];
const TAX_RATE = 0.16;
const parseJOD = (s: string) => parseFloat(s.replace(/[^0-9.]/g, "")) || 0;

// ─── Reused from SO V2 ────────────────────────────────────────────────────────
function DNGroupedView({ notes, itemId, itemUnit, onNavigateToDN }: {
  notes: DeliveryNote[];
  itemId: string;
  itemUnit: string;
  onNavigateToDN?: (id: string) => void;
}) {
  const getQty = (dn: DeliveryNote) => dn.items?.find(i => i.id === itemId)?.qty ?? 0;
  const relevant = notes.filter(dn => dn.items?.some(i => i.id === itemId));
  const raw = [
    { key: "pending",   label: "Pending",   notes: relevant.filter(dn => dn.status === "PENDING" || dn.status === "PROCESSING"), dot: "bg-amber-400", bg: "bg-amber-50/60", text: "text-amber-700" },
    { key: "delivered", label: "Delivered",  notes: relevant.filter(dn => dn.status === "APPROVED"),  dot: "bg-green-400", bg: "bg-green-50/60",  text: "text-green-700" },
    { key: "canceled",  label: "Canceled",   notes: relevant.filter(dn => dn.status === "CANCELED"),  dot: "bg-red-400",   bg: "bg-red-50/50",    text: "text-red-600" },
  ].filter(b => b.notes.length > 0);
  const buckets = raw.map(b => ({ ...b, totalQty: b.notes.reduce((s, dn) => s + getQty(dn), 0) }));
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(buckets.filter(b => b.notes.length <= 3).map(b => b.key)));
  const [showAll,  setShowAll]  = useState<Set<string>>(new Set());
  const toggle = (key: string) => setExpanded(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });
  if (relevant.length === 0) return (
    <div className="flex items-center justify-center py-10">
      <p className="text-[12px] text-gray-400">No delivery notes for this item</p>
    </div>
  );
  return (
    <div className="divide-y divide-gray-100">
      {buckets.map(bucket => {
        const isExp    = expanded.has(bucket.key);
        const isShowAll = showAll.has(bucket.key);
        const visible  = isShowAll ? bucket.notes : bucket.notes.slice(0, 5);
        const hasMore  = !isShowAll && bucket.notes.length > 5;
        return (
          <div key={bucket.key}>
            <button onClick={() => toggle(bucket.key)} className={`w-full flex items-center gap-2.5 px-5 py-2.5 ${bucket.bg} hover:opacity-90 transition-opacity text-left`}>
              <ChevronRight className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform duration-150 ${isExp ? "rotate-90" : ""}`} />
              <div className={`w-2 h-2 rounded-full shrink-0 ${bucket.dot}`} />
              <span className={`text-[12px] font-bold ${bucket.text}`}>{bucket.label}</span>
              <span className="text-[11px] text-gray-500 font-medium">&nbsp;·&nbsp;{bucket.notes.length} note{bucket.notes.length !== 1 ? "s" : ""}&nbsp;·&nbsp;{bucket.totalQty}&nbsp;{itemUnit}</span>
            </button>
            {isExp && (
              <div className="divide-y divide-gray-50">
                {visible.map(dn => (
                  <div key={dn.id} onClick={() => onNavigateToDN?.(dn.id)}
                    className="flex items-center gap-3 px-9 py-2.5 hover:bg-[#f5f7ff] cursor-pointer group transition-colors">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${bucket.dot}`} />
                    <span className="text-[12px] font-bold text-gray-900 group-hover:text-[#4f6ef7] transition-colors flex-1">{dn.id}</span>
                    <span className="text-[12px] font-semibold text-gray-700 shrink-0">{getQty(dn)} <span className="font-normal text-gray-400">{itemUnit}</span></span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#4f6ef7] shrink-0" />
                  </div>
                ))}
                {hasMore && (
                  <button onClick={() => setShowAll(prev => { const n = new Set(prev); n.add(bucket.key); return n; })}
                    className="w-full px-9 py-2 text-left text-[11px] font-semibold text-[#4f6ef7] hover:bg-[#f0f4ff] transition-colors">
                    Show all {bucket.notes.length} notes
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Column management ────────────────────────────────────────────────────────
type ColKey = "unit" | "qty" | "free" | "noted" | "delivered" | "price" | "total";
const COL_DEFS: { key: ColKey; label: string }[] = [
  { key: "unit",      label: "Unit" },
  { key: "qty",       label: "Qty" },
  { key: "free",      label: "Free" },
  { key: "noted",     label: "Noted" },
  { key: "delivered", label: "Delivered" },
  { key: "price",     label: "Price" },
  { key: "total",     label: "Total" },
];

// ─── Small sidebar field ──────────────────────────────────────────────────────
function SideField({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div>
      <p className="text-[10px] text-gray-400 mb-0.5">{label}</p>
      <p className={`text-[13px] leading-snug ${bold ? "font-semibold text-gray-900" : "text-gray-700"}`}>{value || "—"}</p>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  invoiceId: string | null;
  onBack?: () => void;
  onNavigateToSO?: (soId: string) => void;
  onNavigateToDN?: (dnId: string) => void;
  onNavigateToTransfer?: (transferId: string) => void;
  onViewV1?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function InvoiceDetailsV2({
  invoiceId, onBack, onNavigateToSO, onNavigateToDN, onNavigateToTransfer, onViewV1,
}: Props) {
  const {
    invoices,
    dnList, setDnList,
    reservations, setReservations,
    transferList, setTransferList,
    salesOrders,
  } = useAppData();

  const record = invoices.find(inv => inv.id === invoiceId || inv.serialNo === invoiceId);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [isFullscreen,       setIsFullscreen]       = useState(false);
  const [activeTab,          setActiveTab]          = useState<"items" | "delivery" | "reservations">("items");
  const [expandedDNs,        setExpandedDNs]        = useState<Set<string>>(new Set());
  const [expandedBatches,    setExpandedBatches]    = useState<Set<string>>(new Set());
  const [dnItemFilter,       setDnItemFilter]       = useState<string | null>(null);
  const [showColumnsPanel,   setShowColumnsPanel]   = useState(false);
  const [showCreditBalance,  setShowCreditBalance]  = useState(false);
  const [showCreateDN,       setShowCreateDN]       = useState(false);
  const [visibleCols, setVisibleCols] = useState<Set<ColKey>>(
    () => new Set<ColKey>(["unit", "qty", "free", "noted", "delivered", "price", "total"])
  );
  const colsPanelRef = useRef<HTMLDivElement>(null);

  const toggleDN     = (id: string) => setExpandedDNs(prev    => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleBatch  = (id: string) => setExpandedBatches(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const filterByItem = (itemId: string) => { setDnItemFilter(itemId); setActiveTab("delivery"); };
  const switchTab    = (tab: "items" | "delivery" | "reservations") => { setActiveTab(tab); setShowColumnsPanel(false); };

  // ── Derived delivery notes ────────────────────────────────────────────────
  const [deliveryNotes, setDeliveryNotes] = useState<DeliveryNote[]>([]);
  useEffect(() => {
    if (!record) return;
    setDeliveryNotes(
      dnList
        .filter(d => (record.sourceSOId && d.sourceSOId === record.sourceSOId) || d.sourceInvoiceId === record.id)
        .map(d => ({
          id: d.id, rep: d.rep, warehouse: d.warehouse, status: d.status,
          adminTransfer: "NONE" as const, repTransfer: "NONE" as const,
          date: d.createdDate,
          items: (d.itemsData ?? []).map(i => ({ id: i.id, qty: i.qty, unit: i.unit, qtyBase: i.qtyBase, warehouse: i.warehouse })),
          cancelReason: d.cancelReason,
        }))
    );
  }, [dnList, invoiceId]);

  // ── Keyboard / outside-click handlers ────────────────────────────────────
  useEffect(() => {
    if (!isFullscreen) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setIsFullscreen(false); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [isFullscreen]);

  useEffect(() => {
    if (!showColumnsPanel) return;
    const h = (e: MouseEvent) => {
      if (colsPanelRef.current && !colsPanelRef.current.contains(e.target as Node))
        setShowColumnsPanel(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [showColumnsPanel]);

  // ── Not found ─────────────────────────────────────────────────────────────
  if (!record) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f5f5f7]">
        <div className="bg-white border border-gray-200 rounded-xl p-8 max-w-sm text-center shadow-sm">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-base font-bold text-gray-900 mb-1">Invoice Not Found</h3>
          <button onClick={onBack} className="mt-4 px-5 py-2 rounded-md bg-[#1a1a2e] text-white text-[13px] font-medium">Go Back</button>
        </div>
      </div>
    );
  }

  // ── Derived values ────────────────────────────────────────────────────────
  const sourceSORecord = salesOrders.find(so => so.id === record.sourceSOId);
  const items = (record.itemsData && record.itemsData.length > 0)
    ? record.itemsData
    : (sourceSORecord?.itemsData ?? []);
  const subtotal = items.reduce((acc, i) => acc + i.price * i.totalQty, 0);
  const discount = 0;
  const taxAmt   = (subtotal - discount) * TAX_RATE;
  const total    = subtotal - discount + taxAmt;
  const balance  = parseJOD(record.balance);
  const paid     = Math.max(0, total - balance);

  const paymentStatus: "Paid" | "Partially Paid" | "Unpaid" =
    balance <= 0 ? "Paid" : paid > 0 ? "Partially Paid" : "Unpaid";

  const dnNotedQty = React.useMemo<Record<string, number>>(() => {
    const m: Record<string, number> = {};
    deliveryNotes.filter(d => d.status === "PENDING" || d.status === "PROCESSING")
      .forEach(d => d.items?.forEach(i => { m[i.id] = (m[i.id] ?? 0) + (i.qtyBase ?? i.qty); }));
    return m;
  }, [deliveryNotes]);

  const dnDeliveredQty = React.useMemo<Record<string, number>>(() => {
    const m: Record<string, number> = {};
    deliveryNotes.filter(d => d.status === "APPROVED")
      .forEach(d => d.items?.forEach(i => { m[i.id] = (m[i.id] ?? 0) + (i.qtyBase ?? i.qty); }));
    return m;
  }, [deliveryNotes]);

  // ── Status colours ────────────────────────────────────────────────────────
  const invColor =
    record.status === "APPROVED" ? { bg: "#dcfce7", text: "#166534" } :
    record.status === "CANCELED" ? { bg: "#fee2e2", text: "#991b1b" } :
                                   { bg: "#fef0c7", text: "#dc6803" };

  const payColor =
    paymentStatus === "Paid"           ? { bg: "#dcfce7", text: "#166534" } :
    paymentStatus === "Partially Paid" ? { bg: "#fff7ed", text: "#c2410c" } :
                                         { bg: "#fee2e2", text: "#991b1b" };

  const delLabel =
    record.delivery === "Delivered"         ? "Delivered" :
    record.delivery === "Has Delivery Note" ? "In Progress" : "None";
  const delColor =
    record.delivery === "Delivered"         ? { bg: "#dcfce7", text: "#166534" } :
    record.delivery === "Has Delivery Note" ? { bg: "#fef0c7", text: "#dc6803" } :
                                              { bg: "#f3f4f6", text: "#6b7280" };

  const showDNButton = record.delivery !== "Delivered";

  // ── Create DN ─────────────────────────────────────────────────────────────
  const handleCreateDN = (
    data: { rep: string; items: { id: string; qty: number; unit: string; qtyBase: number; warehouse: string }[]; isManual: boolean },
    navigate: boolean
  ) => {
    const newId = `DN-INV-${Math.floor(Math.random() * 9000 + 1000)}`;
    const today = new Date().toLocaleDateString("en-GB");
    setDnList(prev => [{
      id: newId, dnNumber: newId, status: "PENDING",
      sourceSOId: record.sourceSOId || record.id,
      sourceInvoiceId: record.id,
      sourceSONumber: record.serialNo,
      clientName: record.clientName, rep: data.rep, createdBy: "Admin",
      warehouse: data.items[0]?.warehouse || "-",
      items: data.items.length, createdDate: today, isManual: data.isManual,
      itemsData: data.items.map(di => {
        const inv = items.find(i => i.id === di.id);
        return { id: di.id, name: inv?.name ?? di.id, sku: inv?.sku ?? "-", qty: di.qty, unit: di.unit, qtyBase: di.qtyBase, soQty: inv?.totalQty ?? di.qty, soUnit: inv?.unit ?? di.unit, delivered: 0, warehouse: di.warehouse };
      }),
    }, ...prev]);
    const trId = `TR-${Math.floor(Math.random() * 9000 + 1000)}`;
    setTransferList(prev => [{
      id: trId, serialNo: trId, createdAt: today, createdBy: "Admin",
      from: data.items[0]?.warehouse || "-", to: `${data.rep} Van Warehouse`,
      type: "LOAD", status: "PENDING", numberOfProducts: data.items.length,
      sourceDNId: newId, sourceDNNumber: newId,
      items: data.items.map(di => { const inv = items.find(i => i.id === di.id); return { id: di.id, productId: di.id, sku: inv?.sku ?? "-", productName: inv?.name ?? di.id, variantName: "-", measureUnit: di.unit, quantity: di.qty, originQty: 0, destQty: 0 }; }),
    }, ...prev]);
    // Consume any linked reservations
    setReservations(prev => {
      let rs = [...prev];
      data.items.forEach(di => {
        let rem = di.qtyBase;
        rs = rs.map(r => {
          if (rem <= 0 || r.itemId !== di.id || r.warehouse !== di.warehouse || r.status !== "ACTIVE") return r;
          if (r.sourceInvoiceId !== record.id && !(record.sourceSOId && r.sourceSOId === record.sourceSOId)) return r;
          const consume = Math.min(rem, r.qtyBase);
          rem -= consume;
          const newBase = r.qtyBase - consume;
          if (newBase <= 0) return { ...r, qty: 0, qtyBase: 0, status: "REVOKED" as const, linkedDNId: newId };
          const fam = getProductFamily(r.itemId);
          const fac = fam ? getUnitFactor(r.unit, fam) : 1;
          return { ...r, qty: fac > 0 ? newBase / fac : newBase, qtyBase: newBase };
        });
      });
      return rs;
    });
    setShowCreateDN(false);
    if (navigate && onNavigateToDN) onNavigateToDN(newId);
  };

  const dnStyle = (s: string) =>
    s === "APPROVED"   ? { dot: "bg-green-400", badge: "bg-green-50 text-green-700 border-green-200",  label: "Delivered" }  :
    s === "CANCELED"   ? { dot: "bg-red-400",   badge: "bg-red-50 text-red-700 border-red-200",        label: "Canceled" }   :
    s === "PROCESSING" ? { dot: "bg-blue-400",  badge: "bg-blue-50 text-blue-700 border-blue-200",     label: "In Delivery" }:
                         { dot: "bg-amber-400", badge: "bg-amber-50 text-amber-700 border-amber-200",  label: "Pending" };

  const colCount = 1 + COL_DEFS.filter(c => visibleCols.has(c.key)).length;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className={isFullscreen
      ? "fixed inset-0 z-50 flex flex-col bg-[#fbfbfe] overflow-hidden"
      : "flex-1 flex flex-col h-full bg-[#fbfbfe] overflow-hidden"}>

      {/* ════ Global header — invariant across tabs ════════════════════════ */}
      <div className="shrink-0 flex items-center gap-3 px-6 py-3 bg-white border-b border-[#e8e8ec]">
        {onBack && (
          <>
            <button onClick={onBack} className="text-[12px] text-gray-400 hover:text-gray-700 font-medium shrink-0 transition-colors">← Invoices</button>
            <span className="text-gray-200 shrink-0">/</span>
          </>
        )}
        <h1 className="text-[17px] font-bold text-[#1a1a2e] truncate">{record.serialNo}</h1>
        {/* Single document-status pill */}
        <span className="inline-flex shrink-0 items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold"
          style={{ backgroundColor: invColor.bg, color: invColor.text }}>
          {record.status.charAt(0) + record.status.slice(1).toLowerCase()}
        </span>

        {/* Action cluster — never changes between tabs */}
        <div className="flex items-center gap-0.5 ml-auto text-[#5a5a6a] shrink-0">
          <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium rounded-md hover:bg-gray-100 hover:text-[#1a1a2e] transition-colors"><Pencil className="w-3.5 h-3.5" /> Edit</button>
          <button className="p-1.5 rounded-md hover:bg-gray-100 hover:text-[#1a1a2e] transition-colors" title="Attachments"><Paperclip className="w-4 h-4" /></button>
          <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium rounded-md hover:bg-gray-100 hover:text-[#1a1a2e] transition-colors"><Printer className="w-3.5 h-3.5" /> Print</button>
          <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium rounded-md hover:bg-gray-100 hover:text-[#1a1a2e] transition-colors"><HistoryIcon className="w-3.5 h-3.5" /> History</button>
          <button className="p-1.5 rounded-md hover:bg-gray-100 hover:text-[#1a1a2e] transition-colors" title="Settings"><Settings className="w-4 h-4" /></button>
          <button onClick={() => setIsFullscreen(f => !f)} title={isFullscreen ? "Exit fullscreen (Esc)" : "Fullscreen"}
            className="p-1.5 rounded-md hover:bg-gray-100 hover:text-[#1a1a2e] transition-colors">
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          {onViewV1 && (
            <button onClick={onViewV1} className="ml-1 px-3 py-1.5 text-[12px] font-medium text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              View V1
            </button>
          )}
          <div className="w-px h-5 bg-gray-200 mx-1.5" />
          <button className="flex items-center gap-1.5 text-white px-3.5 py-1.5 rounded-[6px] text-[12px] font-semibold hover:opacity-90 active:scale-95 transition-all bg-[#1a1a2e]">
            <Send className="w-3.5 h-3.5" /> Send
          </button>
        </div>
      </div>

      {/* ════ Body ═════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── Left sidebar (210px) ───────────────────────────────────────── */}
        <div className="w-[210px] shrink-0 border-r border-[#e8e8ec] bg-white overflow-y-auto">

          {/* Details */}
          <div className="px-5 pt-5 pb-4 border-b border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-4">Details</p>
            <div className="space-y-3">
              <SideField label="Client"       value={record.clientName} bold />
              {record.externalSerial && record.externalSerial !== "-" && (
                <SideField label="Adv. serial" value={record.externalSerial} />
              )}
              <SideField label="Issue date"    value={record.issueDate} />
              <SideField label="Created by"    value={record.creator} />
              <SideField label="Impl. by"      value="—" />
              {record.warehouse && (
                <SideField label="Warehouse" value={record.warehouse} />
              )}
              <SideField label="Payment type"  value={record.paymentType || "—"} />
            </div>
          </div>

          {/* Status — single authoritative location */}
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Status</p>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[12px] text-gray-500 shrink-0">Invoice</p>
                <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-bold"
                  style={{ backgroundColor: invColor.bg, color: invColor.text }}>
                  {record.status.charAt(0) + record.status.slice(1).toLowerCase()}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-[12px] text-gray-500 shrink-0">Payment</p>
                <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-bold"
                  style={{ backgroundColor: payColor.bg, color: payColor.text }}>
                  {paymentStatus}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-[12px] text-gray-500 shrink-0">Delivery</p>
                <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-bold"
                  style={{ backgroundColor: delColor.bg, color: delColor.text }}>
                  {delLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Related */}
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Related</p>
            <div className="space-y-2.5">

              {/* Payments */}
              <div className="flex items-center justify-between gap-2">
                <p className="text-[12px] text-gray-500 shrink-0">Payments</p>
                <span className={`text-[12px] font-semibold ${paid > 0 ? "text-green-600" : "text-gray-400"}`}>
                  {paid > 0 ? `JOD ${paid.toFixed(2)}` : "None"}
                </span>
              </div>

              {/* Returns */}
              <div className="flex items-center justify-between gap-2">
                <p className="text-[12px] text-gray-500 shrink-0">Returns</p>
                <span className="text-[12px] text-gray-400">No returns</span>
              </div>

              {/* Credit & balance — collapsible */}
              <div>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[12px] text-gray-500 shrink-0">Credit & balance</p>
                  <button onClick={() => setShowCreditBalance(v => !v)}
                    className="text-[11px] font-semibold text-[#4f6ef7] hover:underline flex items-center gap-0.5">
                    {showCreditBalance ? "Hide" : "Show"}
                    <ChevronDown className={`w-3 h-3 transition-transform duration-150 ${showCreditBalance ? "rotate-180" : ""}`} />
                  </button>
                </div>
                {showCreditBalance && (
                  <div className="mt-2 ml-1 space-y-1.5 text-[11px]">
                    <div className="flex justify-between text-gray-500">
                      <span>Credit limit</span>
                      <span className="font-semibold text-gray-700">JOD 5,000.00</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>Balance</span>
                      <span className={`font-bold ${balance <= 0 ? "text-green-600" : "text-red-600"}`}>
                        JOD {Math.max(0, balance).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Source SO card */}
              {record.sourceSOId && (
                <div className="pt-1.5 border-t border-gray-100">
                  <p className="text-[10px] text-gray-400 mb-1.5">Source</p>
                  <button onClick={() => onNavigateToSO?.(record.sourceSOId!)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 hover:bg-[#f0f4ff] hover:border-[#d0d7ff] transition-colors group">
                    <FileText className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#4f6ef7] shrink-0" />
                    <span className="text-[12px] font-semibold text-gray-700 group-hover:text-[#4f6ef7] flex-1 text-left truncate">{record.sourceSOId}</span>
                    <ExternalLink className="w-3 h-3 text-gray-300 group-hover:text-[#4f6ef7] shrink-0" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Attachments */}
          <div className="px-5 py-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Attachments</p>
            <div className="flex flex-col gap-2">
              {[
                { id: "a1", name: "invoice_scan.png", mime: "image/png" },
                { id: "a2", name: "payment_terms.pdf", mime: "application/pdf" },
              ].map(att => att.mime.startsWith("image/") ? (
                <div key={att.id} className="w-full aspect-[2/1] rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center gap-1">
                  <ImageIcon className="w-4 h-4 text-gray-300" />
                  <span className="text-[9px] text-gray-400 font-medium">{att.name}</span>
                </div>
              ) : (
                <div key={att.id} className="flex items-center gap-2 px-2.5 py-2 rounded-lg border border-gray-200 bg-gray-50">
                  <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="text-[11px] text-gray-600 font-medium truncate">{att.name}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ── Main content ───────────────────────────────────────────────── */}
        <div className="flex-1 overflow-auto bg-[#f9fafb] p-6">
          <div className="bg-white border border-gray-200 rounded-[8px] shadow-sm">

            {/* Tab bar + toolbar */}
            <div className="flex items-center border-b border-gray-100">
              <button onClick={() => switchTab("items")}
                className={`px-5 py-3.5 text-[12px] font-bold uppercase tracking-wide border-b-2 -mb-px transition-colors ${activeTab === "items" ? "border-[#4f6ef7] text-[#4f6ef7]" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
                Invoice Items
              </button>
              <button onClick={() => switchTab("delivery")}
                className={`px-5 py-3.5 text-[12px] font-bold uppercase tracking-wide border-b-2 -mb-px transition-colors flex items-center gap-1.5 ${activeTab === "delivery" ? "border-[#4f6ef7] text-[#4f6ef7]" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
                Delivery Notes
                {deliveryNotes.length > 0 && (
                  <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold ${activeTab === "delivery" ? "bg-[#4f6ef7] text-white" : "bg-gray-200 text-gray-500"}`}>
                    {deliveryNotes.length}
                  </span>
                )}
              </button>
              {(() => {
                const invReservations = reservations.filter(r =>
                  r.sourceInvoiceId === record.id ||
                  (record.sourceSOId && r.sourceSOId === record.sourceSOId)
                );
                const activeCount = invReservations.filter(r => r.status === "ACTIVE").length;
                return (
                  <button onClick={() => switchTab("reservations")}
                    className={`px-5 py-3.5 text-[12px] font-bold uppercase tracking-wide border-b-2 -mb-px transition-colors flex items-center gap-1.5 ${activeTab === "reservations" ? "border-[#4f6ef7] text-[#4f6ef7]" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
                    Reservations
                    {invReservations.length > 0 && (
                      <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold ${activeTab === "reservations" ? "bg-[#4f6ef7] text-white" : activeCount > 0 ? "bg-amber-100 text-amber-700" : "bg-gray-200 text-gray-500"}`}>
                        {activeCount > 0 ? activeCount : invReservations.length}
                      </span>
                    )}
                  </button>
                );
              })()}

              {/* Per-tab toolbar — consistent right-aligned position */}
              <div className="ml-auto flex items-center gap-2 pr-5">
                {/* Columns — items tab */}
                {activeTab === "items" && (
                  <div className="relative" ref={colsPanelRef}>
                    <button onClick={() => setShowColumnsPanel(v => !v)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium border rounded-md transition-colors ${showColumnsPanel ? "bg-[#f0f4ff] border-[#d0d7ff] text-[#4f6ef7]" : "text-gray-600 bg-white border-gray-200 hover:bg-gray-50"}`}>
                      <Eye className="w-3.5 h-3.5" /> Columns
                    </button>
                    {showColumnsPanel && (
                      <div className="absolute right-0 top-full mt-1.5 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
                        <div className="px-3 py-2 border-b border-gray-100">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Toggle columns</p>
                        </div>
                        {COL_DEFS.map(col => (
                          <label key={col.key} className="flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 cursor-pointer select-none">
                            <input type="checkbox" checked={visibleCols.has(col.key)}
                              onChange={() => setVisibleCols(prev => { const n = new Set(prev); n.has(col.key) ? n.delete(col.key) : n.add(col.key); return n; })}
                              className="accent-[#4f6ef7] w-3.5 h-3.5 rounded" />
                            <span className="text-[12px] text-gray-700">{col.label}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {/* Return — items tab */}
                {activeTab === "items" && (
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[12px] font-medium text-[#00c897] bg-[#f0fdf9] hover:bg-[#dcfce7] border border-[#a7f3d0] transition-colors">
                    <RotateCcw className="w-3.5 h-3.5" /> Return
                  </button>
                )}
                {/* Create DN — both tabs */}
                {showDNButton && (
                  <button onClick={() => setShowCreateDN(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[12px] font-medium text-[#4f6ef7] bg-[#f0f4ff] hover:bg-[#e0e7ff] border border-[#d0d7ff] transition-colors">
                    <Truck className="w-3.5 h-3.5" /> Create Delivery Note
                  </button>
                )}
              </div>
            </div>

            {/* ══ Invoice Items tab ══════════════════════════════════════════ */}
            {activeTab === "items" && (
              <>
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <FileText className="w-10 h-10 text-gray-200 mb-3" />
                    <p className="text-[13px] font-medium text-gray-400 mb-1">No items on this invoice</p>
                    <p className="text-[11px] text-gray-300">This may indicate a data load issue rather than a valid empty invoice</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto border-b border-gray-100">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-gray-100 bg-gray-50/60">
                            {/* Product always visible */}
                            <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Product</th>
                            {visibleCols.has("unit")      && <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">Unit</th>}
                            {visibleCols.has("qty")       && <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">Qty</th>}
                            {visibleCols.has("free")      && <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">Free</th>}
                            {visibleCols.has("noted")     && <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-center bg-indigo-50 text-indigo-500">Noted</th>}
                            {visibleCols.has("delivered") && <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-center bg-green-50 text-green-600">Delivered</th>}
                            {visibleCols.has("price")     && <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Price</th>}
                            {visibleCols.has("total")     && <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Total</th>}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-50">
                          {items.map(item => {
                            const family    = getProductFamily(item.id);
                            const baseUnit  = family ? getBaseUnit(family) : null;
                            const totalBase = family ? toBase(item.totalQty, item.unit, family) : item.totalQty;
                            const noted     = dnNotedQty[item.id]     ?? 0;
                            const delivered = dnDeliveredQty[item.id] ?? 0;
                            const free      = Math.max(0, totalBase - noted - delivered);
                            const hasBatches    = false; // extend here when batch data is available
                            const batchExpanded = expandedBatches.has(item.id);
                            return (
                              <React.Fragment key={item.id}>
                                <tr className="hover:bg-gray-50/50 transition-colors">
                                  {/* Product cell */}
                                  <td className="px-5 py-3.5">
                                    <div className="flex items-center gap-2">
                                      {hasBatches ? (
                                        <button onClick={() => toggleBatch(item.id)} className="shrink-0 text-gray-300 hover:text-gray-500 transition-colors">
                                          <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-150 ${batchExpanded ? "rotate-90" : ""}`} />
                                        </button>
                                      ) : <div className="w-3.5 shrink-0" />}
                                      <div>
                                        <p className="text-[13px] font-bold text-gray-900">{item.name}</p>
                                        <p className="text-[11px] text-gray-400 font-medium">{item.sku}</p>
                                      </div>
                                    </div>
                                  </td>
                                  {visibleCols.has("unit") && (
                                    <td className="px-4 py-3.5 text-center text-[12px] text-gray-500">{item.unit}</td>
                                  )}
                                  {visibleCols.has("qty") && (
                                    <td className="px-4 py-3.5 text-center text-[13px] font-bold text-gray-900">{item.totalQty}</td>
                                  )}
                                  {visibleCols.has("free") && (
                                    <td className="px-4 py-3.5 text-center">
                                      {free > 0
                                        ? <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-green-50 text-green-700 border border-green-100">{free} {baseUnit?.name ?? item.unit}</span>
                                        : <span className="text-[12px] font-bold text-gray-200">0</span>}
                                    </td>
                                  )}
                                  {visibleCols.has("noted") && (
                                    <td className="px-4 py-3.5 text-center bg-indigo-50/40">
                                      {noted > 0
                                        ? <button onClick={() => filterByItem(item.id)} className="text-[13px] font-bold text-indigo-600 hover:underline transition-colors">{noted}</button>
                                        : <span className="text-[13px] font-bold text-indigo-200">0</span>}
                                    </td>
                                  )}
                                  {visibleCols.has("delivered") && (
                                    <td className="px-4 py-3.5 text-center bg-green-50/40">
                                      {delivered > 0
                                        ? <button onClick={() => filterByItem(item.id)} className="text-[13px] font-bold text-green-600 hover:underline transition-colors">{delivered}</button>
                                        : <span className="text-[13px] font-bold text-green-200">0</span>}
                                    </td>
                                  )}
                                  {visibleCols.has("price") && (
                                    <td className="px-4 py-3.5 text-right text-[13px] font-semibold text-gray-700">JOD {item.price.toFixed(2)}</td>
                                  )}
                                  {visibleCols.has("total") && (
                                    <td className="px-5 py-3.5 text-right text-[13px] font-bold text-gray-900">JOD {(item.price * item.totalQty).toFixed(2)}</td>
                                  )}
                                </tr>
                                {/* Batch rows — placeholder infrastructure */}
                                {hasBatches && batchExpanded && (
                                  <tr className="bg-gray-50/40">
                                    <td colSpan={colCount} className="px-10 py-2">
                                      <span className="text-[11px] text-gray-400 italic">No batch data available</span>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* ── Totals block ── */}
                    <div className="flex justify-end px-5 py-4">
                      <div className="w-64 space-y-1.5 text-[12px]">
                        {/* Group 1: document math */}
                        <div className="flex justify-between text-gray-500">
                          <span>Subtotal</span>
                          <span>JOD {subtotal.toFixed(2)}</span>
                        </div>
                        {discount > 0 && (
                          <div className="flex justify-between text-gray-500">
                            <span>Discount</span>
                            <span>− JOD {discount.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-gray-500">
                          <span>Tax ({(TAX_RATE * 100).toFixed(0)}%)</span>
                          <span>JOD {taxAmt.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between pt-1.5 border-t border-gray-100">
                          <span className="font-bold text-gray-900">Total</span>
                          <span className="font-bold text-gray-900">JOD {total.toFixed(2)}</span>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-gray-100 !my-3" />

                        {/* Group 2: payment reconciliation */}
                        <div className="flex justify-between text-gray-500">
                          <span>Paid</span>
                          <span className="font-semibold text-green-600">JOD {paid.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={`font-bold ${balance <= 0 ? "text-green-700" : "text-red-600"}`}>Balance</span>
                          <span className={`font-bold ${balance <= 0 ? "text-green-700" : "text-red-600"}`}>
                            JOD {Math.max(0, balance).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            {/* ══ Reservations tab ══════════════════════════════════════════ */}
            {activeTab === "reservations" && (() => {
              const invReservations = reservations.filter(r =>
                r.sourceInvoiceId === record.id ||
                (record.sourceSOId && r.sourceSOId === record.sourceSOId)
              );
              const statusStyle = (s: string) =>
                s === "ACTIVE"  ? { dot: "bg-amber-400", badge: "bg-amber-50 text-amber-700 border-amber-200",  label: "Active" }  :
                s === "REVOKED" ? { dot: "bg-green-400", badge: "bg-green-50 text-green-700 border-green-200",  label: "Consumed" } :
                                  { dot: "bg-red-400",   badge: "bg-red-50 text-red-700 border-red-200",        label: "Canceled" };
              const activeCount = invReservations.filter(r => r.status === "ACTIVE").length;
              if (invReservations.length === 0 || activeCount === 0) return (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <Bookmark className="w-10 h-10 text-gray-200 mb-3" />
                  <p className="text-[13px] font-medium text-gray-400 mb-1">No active reservations</p>
                  <p className="text-[11px] text-gray-300">Any active stock holds for this invoice will appear here</p>
                </div>
              );
              return (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/60">
                        <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Item</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">Qty</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Warehouse</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">Type</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Linked DN</th>
                        <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-50">
                      {invReservations.map(r => {
                        const s = statusStyle(r.status);
                        return (
                          <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
                                <div>
                                  <p className="text-[13px] font-bold text-gray-900">{r.itemName}</p>
                                  <p className="text-[10px] text-gray-400 font-medium">{r.id}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-center">
                              <span className="text-[13px] font-bold text-gray-900">{r.qty}</span>
                              <span className="text-[11px] text-gray-400 ml-1">{r.unit}</span>
                            </td>
                            <td className="px-4 py-3.5 text-[12px] text-gray-600">{r.warehouse ?? "—"}</td>
                            <td className="px-4 py-3.5 text-[12px] text-gray-500 whitespace-nowrap">{r.date}</td>
                            <td className="px-4 py-3.5 text-center">
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${r.type === "AUTO" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-purple-50 text-purple-700 border-purple-200"}`}>
                                {r.type}
                              </span>
                            </td>
                            <td className="px-4 py-3.5">
                              {r.linkedDNId ? (
                                <button onClick={() => onNavigateToDN?.(r.linkedDNId!)}
                                  className="flex items-center gap-1 text-[12px] font-semibold text-[#4f6ef7] hover:underline transition-colors">
                                  <Truck className="w-3 h-3" />
                                  {r.linkedDNNumber ?? r.linkedDNId}
                                </button>
                              ) : <span className="text-[12px] text-gray-300">—</span>}
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${s.badge}`}>{s.label}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {/* Summary footer */}
                  <div className="px-5 py-3 border-t border-gray-100 flex items-center gap-4 text-[11px] text-gray-400">
                    <span><span className="font-bold text-amber-600">{invReservations.filter(r => r.status === "ACTIVE").length}</span> active</span>
                    <span><span className="font-bold text-green-600">{invReservations.filter(r => r.status === "REVOKED").length}</span> consumed</span>
                    <span><span className="font-bold text-red-500">{invReservations.filter(r => r.status === "CANCELED").length}</span> canceled</span>
                    <span className="ml-auto">{invReservations.length} total reservation{invReservations.length !== 1 ? "s" : ""}</span>
                  </div>
                </div>
              );
            })()}

            {/* ══ Delivery Notes tab ════════════════════════════════════════ */}
            {activeTab === "delivery" && (
              <>
                {/* Item filter chip */}
                {dnItemFilter && (() => {
                  const fi = items.find(i => i.id === dnItemFilter);
                  return (
                    <div className="px-5 py-2.5 border-b border-[#d0d7ff] bg-[#f8f9ff] flex items-center gap-2">
                      <span className="text-[11px] text-gray-400">Filtered by:</span>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f0f4ff] border border-[#d0d7ff]">
                        <span className="text-[12px] font-semibold text-[#4f6ef7]">{fi?.name ?? dnItemFilter}</span>
                        <button onClick={() => setDnItemFilter(null)} className="text-[#4f6ef7] hover:text-[#1a1a2e] ml-0.5 transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-[11px] text-gray-400 ml-1">— showing notes for this item only</span>
                    </div>
                  );
                })()}

                {/* Filtered: grouped rollup */}
                {dnItemFilter ? (
                  <DNGroupedView
                    notes={deliveryNotes}
                    itemId={dnItemFilter}
                    itemUnit={items.find(i => i.id === dnItemFilter)?.unit ?? ""}
                    onNavigateToDN={onNavigateToDN}
                  />
                ) : deliveryNotes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-14 text-center">
                    <Truck className="w-10 h-10 text-gray-200 mb-3" />
                    <p className="text-[13px] font-medium text-gray-400 mb-1">No delivery notes yet</p>
                    <p className="text-[11px] text-gray-300">Create a delivery note to start tracking shipments</p>
                    {showDNButton && (
                      <button onClick={() => setShowCreateDN(true)}
                        className="mt-4 flex items-center gap-1.5 px-3.5 py-2 rounded-[6px] text-[12px] font-medium text-[#4f6ef7] bg-[#f0f4ff] hover:bg-[#e0e7ff] border border-[#d0d7ff] transition-colors">
                        <Truck className="w-3.5 h-3.5" /> Create Delivery Note
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {deliveryNotes.map(dn => {
                      const s          = dnStyle(dn.status);
                      const isExpanded = expandedDNs.has(dn.id);
                      const dnRecord   = dnList.find(d => d.id === dn.id || d.dnNumber === dn.id);
                      return (
                        <div key={dn.id}>
                          <div className="px-5 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                            <button onClick={() => toggleDN(dn.id)} className="shrink-0 text-gray-300 hover:text-gray-500 transition-colors">
                              <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-150 ${isExpanded ? "rotate-90" : ""}`} />
                            </button>
                            <div className={`w-2 h-2 rounded-full shrink-0 ${s.dot}`} />
                            <span onClick={() => onNavigateToDN?.(dn.id)}
                              className="text-[13px] font-bold text-gray-900 hover:text-[#4f6ef7] cursor-pointer transition-colors shrink-0">
                              {dn.id}
                            </span>
                            <span className="flex items-center gap-1 text-[11px] text-gray-400 shrink-0"><Clock className="w-3 h-3" />{dn.date}</span>
                            <span className="flex items-center gap-1 text-[11px] text-gray-400 truncate"><User className="w-3 h-3 shrink-0" />{dn.rep}</span>
                            {(() => {
                              const t = transferList.find(t => t.sourceDNId === dn.id);
                              return t && onNavigateToTransfer ? (
                                <button onClick={e => { e.stopPropagation(); onNavigateToTransfer(t.id); }}
                                  className="flex items-center gap-1 text-[11px] font-semibold text-[#4f6ef7] hover:underline shrink-0 ml-auto">
                                  <ArrowLeftRight className="w-3 h-3" />{t.serialNo}
                                </button>
                              ) : null;
                            })()}
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${s.badge}`}>{s.label}</span>
                          </div>
                          {isExpanded && dnRecord?.itemsData && dnRecord.itemsData.length > 0 && (
                            <div className="mx-5 mb-2 rounded-[6px] border border-gray-100 bg-gray-50/60 divide-y divide-gray-100">
                              {dnRecord.itemsData.map((di: any) => (
                                <div key={di.id} className="flex items-center gap-3 px-4 py-2">
                                  <span className="text-[12px] text-gray-700 flex-1 truncate">{di.name ?? di.id}</span>
                                  <span className="text-[12px] font-semibold text-gray-900 shrink-0">{di.qty} <span className="font-normal text-gray-400">{di.unit}</span></span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

          </div>
          <div className="h-4" />
        </div>

      </div>

      {/* Create Delivery Note modal */}
      <CreateDeliveryNoteModal
        isOpen={showCreateDN}
        onClose={() => setShowCreateDN(false)}
        onConfirm={handleCreateDN}
        orderId={record.id}
        items={items}
        reps={REPS}
        warehouses={WHS}
        reservations={reservations.filter(r => r.sourceInvoiceId === record.id || (record.sourceSOId && r.sourceSOId === record.sourceSOId))}
        soCreatedBy={record.creator}
        forceReservationTab={false}
        manualDnItemIds={new Set(
          dnList
            .filter(d => (record.sourceSOId && d.sourceSOId === record.sourceSOId) || d.sourceInvoiceId === record.id)
            .filter(d => d.status !== "CANCELED")
            .flatMap(d => d.itemsData?.map(i => i.id) ?? [])
        )}
      />

    </div>
  );
}
