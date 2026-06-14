import React, { useState, useEffect } from "react";
import { getProductFamily, getBaseUnit, toBase, getUnitFactor } from "./measurementUnits";
import {
  useAppData,
  type DeliveryNote, type Reservation,
  type InvoiceRecord, type SOAuditEntry,
} from "../../context/AppDataContext";
import {
  Pencil, Paperclip, Printer, Settings,
  Box, Truck, FileText, ArrowLeftRight,
  Clock, X, Check, User, AlertCircle,
  CheckCircle2, Bookmark, History as HistoryIcon,
  ImageIcon, Eye, ChevronRight,
  Maximize2, Minimize2,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { ConvertInvoiceModal } from "./ConvertInvoiceModal";
import { CreateDeliveryNoteModal } from "./CreateDeliveryNoteModal";
import { ReservationDetailsModal } from "./ReservationDetailsModal";
import { CreateReservationModal } from "./CreateReservationModal";
import { ApproveOrderModal } from "./ApproveOrderModal";
import { SOHistoryModal } from "./SOHistoryModal";

// Standalone grouped delivery-note view — used for item-level drill-down from Order Items tab.
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
    { key: "canceled",  label: "Canceled",   notes: relevant.filter(dn => dn.status === "CANCELED"),  dot: "bg-red-400",   bg: "bg-red-50/50",    text: "text-red-600"  },
  ].filter(b => b.notes.length > 0);

  const buckets = raw.map(b => ({ ...b, totalQty: b.notes.reduce((s, dn) => s + getQty(dn), 0) }));

  const [expanded,  setExpanded]  = useState<Set<string>>(() => new Set(buckets.filter(b => b.notes.length <= 3).map(b => b.key)));
  const [showAll,   setShowAll]   = useState<Set<string>>(new Set());

  const toggle = (key: string) => setExpanded(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });

  if (relevant.length === 0) {
    return <div className="flex items-center justify-center py-10"><p className="text-[12px] text-gray-400">No delivery notes found for this item</p></div>;
  }

  return (
    <div className="divide-y divide-gray-100">
      {buckets.map(bucket => {
        const isExpanded = expanded.has(bucket.key);
        const isShowAll  = showAll.has(bucket.key);
        const visible    = isShowAll ? bucket.notes : bucket.notes.slice(0, 5);
        const hasMore    = !isShowAll && bucket.notes.length > 5;
        return (
          <div key={bucket.key}>
            <button
              onClick={() => toggle(bucket.key)}
              className={`w-full flex items-center gap-2.5 px-5 py-2.5 ${bucket.bg} hover:opacity-90 transition-opacity text-left`}
            >
              <ChevronRight className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform duration-150 ${isExpanded ? "rotate-90" : ""}`} />
              <div className={`w-2 h-2 rounded-full shrink-0 ${bucket.dot}`} />
              <span className={`text-[12px] font-bold ${bucket.text}`}>{bucket.label}</span>
              <span className="text-[11px] text-gray-500 font-medium">
                &nbsp;·&nbsp;{bucket.notes.length} note{bucket.notes.length !== 1 ? "s" : ""}&nbsp;·&nbsp;{bucket.totalQty}&nbsp;{itemUnit}
              </span>
            </button>
            {isExpanded && (
              <div className="divide-y divide-gray-50">
                {visible.map(dn => (
                  <div key={dn.id} onClick={() => onNavigateToDN?.(dn.id)}
                    className="flex items-center gap-3 px-9 py-2.5 hover:bg-[#f5f7ff] cursor-pointer group transition-colors"
                  >
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${bucket.dot}`} />
                    <span className="text-[12px] font-bold text-gray-900 group-hover:text-[#4f6ef7] transition-colors flex-1">{dn.id}</span>
                    <span className="text-[12px] font-semibold text-gray-700 shrink-0">{getQty(dn)} <span className="font-normal text-gray-400">{itemUnit}</span></span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#4f6ef7] shrink-0" />
                  </div>
                ))}
                {hasMore && (
                  <button
                    onClick={() => setShowAll(prev => { const n = new Set(prev); n.add(bucket.key); return n; })}
                    className="w-full px-9 py-2 text-left text-[11px] font-semibold text-[#4f6ef7] hover:bg-[#f0f4ff] transition-colors"
                  >
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

interface Props {
  orderId: string | null;
  onBack?: () => void;
  onNavigateToDN?: (dnId: string) => void;
  onNavigateToInvoice?: (invoiceId: string) => void;
  onNavigateToTransfer?: (transferId: string) => void;
  onViewV1?: () => void;
}

export function SalesOrderDetailsV2({
  orderId, onBack, onNavigateToDN, onNavigateToInvoice, onNavigateToTransfer, onViewV1,
}: Props) {
  const {
    orderItems, setOrderItems,
    deliveryNotes, setDeliveryNotes,
    reservations, setReservations,
    soStatus: status, setSoStatus: setStatus,
    approvalStep, setApprovalStep,
    cycle, setCycle,
    setPaymentStatus,
    salesOrders, setSalesOrders,
    setInvoices,
    dnList, setDnList,
    transferList, setTransferList,
    allowSOApprovalWithoutStock,
    preventInvoiceReservations,
    allowMultiWarehouseReservation,
    soAuditLog, setSOAuditLog,
  } = useAppData();

  const soRecord = salesOrders.find(s => s.id === orderId || s.orderNo === orderId);
  const soId = soRecord?.id ?? orderId ?? "";
  const soReservations = reservations.filter(r => r.sourceSOId === soId);

  const [linkedInvoiceId, setLinkedInvoiceId] = useState<string | null>(null);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [isDNModalOpen, setIsDNModalOpen] = useState(false);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [isCreateResModalOpen, setIsCreateResModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isApprovalCollapsed, setIsApprovalCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<"items" | "delivery">("items");
  const [expandedDNs, setExpandedDNs] = useState<Set<string>>(new Set());
  const toggleDN = (id: string) => setExpandedDNs(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const [dnItemFilter, setDnItemFilter] = useState<string | null>(null);
  const filterDNsByItem = (itemId: string) => { setDnItemFilter(itemId); setActiveTab("delivery"); };

  useEffect(() => {
    if (!isFullscreen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setIsFullscreen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isFullscreen]);

  useEffect(() => {
    if (soRecord) {
      if (soRecord.itemsData) setOrderItems(soRecord.itemsData);
      setStatus(soRecord.status.toUpperCase());
      if (soRecord.linkedInvoiceId) setLinkedInvoiceId(soRecord.linkedInvoiceId);
    }
  }, [orderId, soRecord]);

  useEffect(() => {
    const soDns = dnList.filter(d => d.sourceSOId === soId).map(d => ({
      id: d.id, rep: d.rep, warehouse: d.warehouse, status: d.status,
      adminTransfer: (d.adminTransfer === "DONE" ? "DONE" : "NONE") as "DONE" | "NONE",
      repTransfer: (d.repTransfer === "CONFIRMED" ? "CONFIRMED" : "NONE") as "CONFIRMED" | "NONE",
      date: d.createdDate,
      items: (d.itemsData ?? []).map(i => ({ id: i.id, qty: i.qty, unit: i.unit, qtyBase: i.qtyBase, warehouse: i.warehouse })),
      cancelReason: d.cancelReason,
    } as DeliveryNote));
    setDeliveryNotes(soDns);
  }, [soId, dnList]);

  const addSOAudit = (entry: Omit<SOAuditEntry, "id" | "soId" | "timestamp" | "date">) => {
    setSOAuditLog(prev => [...prev, {
      ...entry, id: `SOA-${Date.now()}`, soId, timestamp: Date.now(),
      date: new Date().toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }),
    }]);
  };

  const updateSoGlobal = (updates: any) =>
    setSalesOrders(prev => prev.map(so => (so.id === orderId || so.orderNo === orderId) ? { ...so, ...updates } : so));

  const dnNotedQty = React.useMemo<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    deliveryNotes.filter(d => d.status === "PENDING" || d.status === "PROCESSING")
      .forEach(d => d.items.forEach(i => { map[i.id] = (map[i.id] ?? 0) + (i.qtyBase ?? i.qty); }));
    return map;
  }, [deliveryNotes]);

  const dnDeliveredQty = React.useMemo<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    deliveryNotes.filter(d => d.status === "APPROVED")
      .forEach(d => d.items.forEach(i => { map[i.id] = (map[i.id] ?? 0) + (i.qtyBase ?? i.qty); }));
    return map;
  }, [deliveryNotes]);

  const getDeliveryStatus = () => {
    const total = orderItems.reduce((a, i) => a + i.totalQty, 0);
    const delivered = orderItems.reduce((a, i) => a + (dnDeliveredQty[i.id] ?? 0), 0);
    if (delivered >= total && total > 0) return "Delivered";
    if (delivered > 0) return "Partially Delivered";
    return "Undelivered";
  };

  const handleApprove = () => {
    if (approvalStep === 0) {
      setApprovalStep(1);
      addSOAudit({ action: "approved_1st", by: "Admin" });
    } else {
      addSOAudit({ action: "approved_2nd", by: "Admin" });
      if (allowSOApprovalWithoutStock) { setStatus("APPROVED"); updateSoGlobal({ status: "approved" }); addSOAudit({ action: "approved", by: "Admin" }); }
      setIsApproveModalOpen(true);
    }
  };

  const handleReject = () => {
    setStatus("REJECTED"); updateSoGlobal({ status: "rejected" });
    setCycle(prev => prev + 1); setApprovalStep(0);
    addSOAudit({ action: "rejected", by: "Admin" });
  };

  const handleConfirmApproval = (autoReserve: boolean, warehouse: string, hasShortage: boolean) => {
    if (!allowSOApprovalWithoutStock && hasShortage) { setIsApproveModalOpen(false); return; }
    if (!allowSOApprovalWithoutStock) { setStatus("APPROVED"); updateSoGlobal({ status: "approved" }); addSOAudit({ action: "approved", by: "Admin" }); }
    if (autoReserve && warehouse) {
      const groupId = !allowMultiWarehouseReservation ? `RESGRP-${Date.now()}` : undefined;
      const newRes: Reservation[] = orderItems
        .filter(item => { const f = getProductFamily(item.id); const tb = f ? toBase(item.totalQty, item.unit, f) : item.totalQty; return tb - item.deliveredQty - item.notedQty > 0; })
        .map((item, idx) => { const f = getProductFamily(item.id); const tb = f ? toBase(item.totalQty, item.unit, f) : item.totalQty; return { id: `RES-AUTO-${idx}-${Math.floor(Math.random()*1000)}`, itemId: item.id, itemName: item.name, qty: item.totalQty, unit: item.unit, qtyBase: tb - item.deliveredQty - item.notedQty, warehouse, status: "ACTIVE" as const, date: new Date().toLocaleDateString(), type: "AUTO" as const, sourceSOId: soId, groupId }; });
      setReservations(prev => [...prev, ...newRes]);
    }
    setIsApproveModalOpen(false);
  };

  const handleCreateDN = (data: { rep: string; items: { id: string; qty: number; unit: string; qtyBase: number; warehouse: string }[]; isManual: boolean }, navigate: boolean) => {
    if (!soRecord) return;
    const newDN: DeliveryNote = { id: `DN-${Math.floor(Math.random()*9000+1000)}`, status: "PENDING", rep: data.rep, adminTransfer: "NONE", repTransfer: "NONE", date: new Date().toLocaleDateString("en-GB"), items: data.items, isManual: data.isManual };
    setDeliveryNotes(prev => [newDN, ...prev]);
    setDnList(prev => [{ id: newDN.id, dnNumber: newDN.id, status: "PENDING", sourceSOId: soId, sourceSONumber: soRecord.orderNo, clientName: soRecord.clientName, rep: data.rep, createdBy: "Admin", warehouse: data.items[0]?.warehouse || "-", items: data.items.length, createdDate: new Date().toLocaleDateString("en-GB"), isManual: data.isManual, itemsData: data.items.map(di => { const oi = orderItems.find(o => o.id === di.id); return { id: di.id, name: oi?.name ?? di.id, sku: oi?.sku ?? "-", qty: di.qty, unit: di.unit, qtyBase: di.qtyBase, soQty: oi?.totalQty ?? di.qty, soUnit: oi?.unit ?? di.unit, delivered: 0, warehouse: di.warehouse }; }) }, ...prev]);
    const newTransferId = `TR-${Math.floor(Math.random()*9000+1000)}`;
    setTransferList(prev => [{ id: newTransferId, serialNo: newTransferId, createdAt: new Date().toLocaleDateString("en-GB"), createdBy: "Admin", from: data.items[0]?.warehouse || "-", to: `${data.rep} Van Warehouse`, type: "LOAD", status: "PENDING", numberOfProducts: data.items.length, sourceDNId: newDN.id, sourceDNNumber: newDN.id, items: data.items.map(di => { const oi = orderItems.find(o => o.id === di.id); return { id: di.id, productId: di.id, sku: oi?.sku ?? "-", productName: oi?.name ?? di.id, variantName: "-", measureUnit: di.unit, quantity: di.qty, originQty: 0, destQty: 0 }; }) }, ...prev]);
    setOrderItems(prev => prev.map(item => { const added = data.items.filter(di => di.id === item.id).reduce((s, di) => s + di.qtyBase, 0); return added > 0 ? { ...item, notedQty: item.notedQty + added } : item; }));
    setReservations(prev => { const next: any[] = []; prev.forEach(r => { const dnItem = data.items.find(di => di.id === r.itemId && di.warehouse === r.warehouse && r.sourceSOId === soId && r.status === "ACTIVE"); if (dnItem) { const f = getProductFamily(r.itemId); const factor = f ? getUnitFactor(r.unit, f) : 1; const resBase = r.qtyBase || r.qty; if (dnItem.qtyBase < resBase) { const dnQtyInUnit = factor > 0 ? dnItem.qtyBase / factor : dnItem.qtyBase; const remBase = resBase - dnItem.qtyBase; const remUnit = factor > 0 ? remBase / factor : remBase; next.push({ ...r, id: `${r.id}-noted-${Date.now()}`, qty: dnQtyInUnit, qtyBase: dnItem.qtyBase, linkedDNId: newDN.id, linkedDNNumber: newDN.id }); next.push({ ...r, qty: remUnit, qtyBase: remBase }); } else { next.push({ ...r, linkedDNId: newDN.id, linkedDNNumber: newDN.id }); } } else { next.push(r); } }); return next; });
    setSalesOrders(prev => prev.map(so => { if (so.id !== soId) return so; return { ...so, itemsData: (so.itemsData ?? []).map(item => { const added = data.items.filter(di => di.id === item.id).reduce((s, di) => s + di.qtyBase, 0); return added > 0 ? { ...item, notedQty: item.notedQty + added } : item; }) }; }));
    setIsDNModalOpen(false);
    addSOAudit({ action: "dn_created", by: "Admin", linkedId: newDN.id, linkedLabel: newDN.id });
    if (navigate && onNavigateToDN) onNavigateToDN(newDN.id);
  };

  const handleConfirmManualReservation = (lines: { itemId: string; itemName: string; qty: number; unit: string; qtyBase: number; warehouse: string }[]) => {
    const newRes: Reservation[] = lines.map((line, idx) => ({ id: `RES-MANUAL-${idx}-${Math.floor(Math.random()*1000)}`, itemId: line.itemId, itemName: line.itemName, qty: line.qty, unit: line.unit, qtyBase: line.qtyBase, status: "ACTIVE" as const, date: new Date().toLocaleDateString(), warehouse: line.warehouse, type: "MANUAL" as const, sourceSOId: soId }));
    setReservations(prev => [...prev, ...newRes]);
    setIsCreateResModalOpen(false);
    setIsReservationModalOpen(true);
    addSOAudit({ action: "reservation_created", by: "Admin", note: `${lines.length} item(s) reserved manually` });
  };

  const handleCancelReservation = (id: string) => {
    const target = reservations.find(r => r.id === id);
    const toCancel = target?.groupId ? reservations.filter(r => r.groupId === target.groupId && r.status === "ACTIVE") : target ? [target] : [];
    setReservations(prev => prev.map(r => toCancel.some(c => c.id === r.id) ? { ...r, status: "CANCELED" as const } : r));
    addSOAudit({ action: "reservation_canceled", by: "Admin", linkedId: id, linkedLabel: id });
  };

  const handleEditReservation = (id: string, newQty: number) => {
    const target = reservations.find(r => r.id === id);
    if (!target) return;
    const f = getProductFamily(target.itemId);
    setReservations(prev => prev.map(r => r.id === id ? { ...r, qty: newQty, qtyBase: f ? toBase(newQty, target.unit, f) : newQty } : r));
  };

  const onConfirmConversion = (data: any) => {
    const newInvoiceId = `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random()*900)+100)}`;
    setLinkedInvoiceId(newInvoiceId);
    setStatus("INVOICED");
    setPaymentStatus(data.paymentStatus || "UNPAID");
    const total = orderItems.reduce((sum, i) => sum + i.price * i.totalQty, 0);
    let balance = total;
    if (data.paymentStatus === "PAID") balance = 0;
    else if (data.paymentStatus === "PARTIAL") balance = total / 2;
    const newInvoice: InvoiceRecord = { id: newInvoiceId, serialNo: newInvoiceId, externalSerial: "-", issueDate: new Date().toLocaleDateString("en-GB"), creator: data.rep || "Admin", clientName: soRecord?.clientName ?? "-", items: orderItems.length, total: `JOD ${total.toFixed(2)}`, balance: `JOD ${balance.toFixed(2)}`, paymentType: data.paymentStatus === "UNPAID" ? "Credit" : "Cash", status: "PENDING", delivery: data.markAsDelivered ? "Delivered" : "No Delivery Note", comment: "", sourceSOId: soId || undefined };
    setInvoices(prev => [newInvoice, ...prev]);
    updateSoGlobal({ status: "invoiced", linkedInvoiceId: newInvoiceId });
    setIsConvertModalOpen(false);
    addSOAudit({ action: "converted_to_invoice", by: "Admin", linkedId: newInvoiceId, linkedLabel: newInvoiceId });
    if (onNavigateToInvoice) onNavigateToInvoice(newInvoiceId);
  };

  const warehouses = ["Mohammad test", "Dream Warehouse", "Maram", "Zarqaa Warehouse", "Khald Warehouse", "Main Branch"];

  if (!soRecord) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f5f5f7]">
        <div className="bg-white border border-gray-200 rounded-xl p-8 max-w-sm text-center shadow-sm">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-base font-bold text-gray-900 mb-1">Sales Order Not Found</h3>
          <button onClick={onBack} className="mt-4 px-5 py-2 rounded-md bg-[#1a1a2e] text-white text-[13px] font-medium">Go Back</button>
        </div>
      </div>
    );
  }

  const deliveryStatus = getDeliveryStatus();
  const allItemsDelivered = orderItems.every(item => item.totalQty - (dnDeliveredQty[item.id] ?? 0) <= 0);
  const showDNButton = soRecord?.status === "approved" && !allItemsDelivered;
  const grandTotal = orderItems.reduce((acc, i) => acc + i.totalQty * i.price, 0);
  const statusColor = status === "REJECTED" ? { bg: "#fee2e2", text: "#991b1b" } : (status === "APPROVED" || status === "INVOICED") ? { bg: "#dcfce7", text: "#166534" } : { bg: "#fef0c7", text: "#dc6803" };

  // Compact DN list for sidebar — show up to 3, "+N more" for the rest

  // Mock attachments — PNG renders as image, others as file chip
  const mockAttachments = [
    { id: "att-1", name: "signature.png",   mime: "image/png" },
    { id: "att-2", name: "order_terms.pdf", mime: "application/pdf" },
  ];

  return (
    <div className={isFullscreen ? "fixed inset-0 z-50 flex flex-col bg-[#fbfbfe] overflow-hidden" : "flex-1 flex flex-col h-full bg-[#fbfbfe] overflow-hidden"}>

      {/* ── Header ── */}
      <div className="shrink-0 flex items-center gap-3 px-6 py-3 bg-white border-b border-[#e8e8ec]">
        {onBack && <button onClick={onBack} className="text-[12px] text-gray-400 hover:text-gray-700 font-medium shrink-0 transition-colors">← Orders</button>}
        {onBack && <span className="text-gray-200 shrink-0">/</span>}
        <h1 className="text-[17px] font-bold text-[#1a1a2e] truncate">{soRecord.orderNo || orderId}</h1>
        <span className="inline-flex shrink-0 items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold" style={{ backgroundColor: statusColor.bg, color: statusColor.text }}>
          {status === "INVOICED" ? "Approved" : status.charAt(0) + status.slice(1).toLowerCase()}
        </span>
        {cycle > 1 && <span className="text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full shrink-0">Cycle {cycle}</span>}
        <div className="flex items-center gap-0.5 ml-auto text-[#5a5a6a] shrink-0">
          <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium rounded-md hover:bg-gray-100 hover:text-[#1a1a2e] transition-colors"><Pencil className="w-3.5 h-3.5" /> Edit</button>
          <button className="p-1.5 rounded-md hover:bg-gray-100 hover:text-[#1a1a2e] transition-colors" title="Attachments"><Paperclip className="w-4 h-4" /></button>
          <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium rounded-md hover:bg-gray-100 hover:text-[#1a1a2e] transition-colors"><Printer className="w-3.5 h-3.5" /> Print</button>
          <button onClick={() => setIsHistoryOpen(true)} className="flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium rounded-md hover:bg-gray-100 hover:text-[#1a1a2e] transition-colors"><HistoryIcon className="w-3.5 h-3.5" /> History</button>
          <button className="p-1.5 rounded-md hover:bg-gray-100 hover:text-[#1a1a2e] transition-colors" title="Settings"><Settings className="w-4 h-4" /></button>
          <button onClick={() => setIsFullscreen(f => !f)} title={isFullscreen ? "Exit fullscreen (Esc)" : "Fullscreen"} className="p-1.5 rounded-md hover:bg-gray-100 hover:text-[#1a1a2e] transition-colors">
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          {onViewV1 && (
            <button onClick={onViewV1} className="ml-1 px-3 py-1.5 text-[12px] font-medium text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              View V1
            </button>
          )}
          <div className="w-px h-5 bg-gray-200 mx-1.5" />
          {status === "APPROVED" && (
            <button onClick={() => setIsConvertModalOpen(true)} className="flex items-center gap-1.5 text-white px-3.5 py-1.5 rounded-[6px] text-[12px] font-semibold hover:bg-[#111827] active:scale-95 transition-all bg-[#1a1a2e]"><Box className="w-3.5 h-3.5 text-gray-300" /> Convert to Invoice</button>
          )}
          {status === "INVOICED" && linkedInvoiceId && (
            <button onClick={() => onNavigateToInvoice?.(linkedInvoiceId)} className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] text-[12px] font-semibold hover:bg-indigo-100 active:scale-95 transition-all bg-indigo-50 text-indigo-700 border border-indigo-200"><Box className="w-3.5 h-3.5" /> View Invoice</button>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── Left sidebar ── */}
        <div className="w-[220px] shrink-0 border-r border-[#e8e8ec] bg-white overflow-y-auto">

          {/* Details */}
          <div className="px-5 pt-5 pb-4 border-b border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-4">Details</p>
            <div className="space-y-3.5">
              <div>
                <p className="text-[10px] text-gray-400 mb-0.5">Client</p>
                <p className="text-[13px] font-semibold text-gray-900 leading-snug">{soRecord.clientName}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 mb-0.5">Order Date</p>
                <p className="text-[13px] text-gray-700">{soRecord.issueDate}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 mb-0.5">Created by</p>
                <p className="text-[13px] text-gray-700 leading-snug">{soRecord.creator}</p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Status</p>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[12px] text-gray-500 shrink-0">Order</p>
                <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-bold uppercase" style={{ backgroundColor: statusColor.bg, color: statusColor.text }}>
                  {status === "INVOICED" ? "Approved" : status.charAt(0) + status.slice(1).toLowerCase()}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-[12px] text-gray-500 shrink-0">Delivery</p>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-bold uppercase ${deliveryStatus === "Delivered" ? "bg-green-50 text-green-700" : deliveryStatus === "Partially Delivered" ? "bg-amber-50 text-amber-700" : "bg-gray-50 text-gray-400"}`}>
                  {deliveryStatus}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-[12px] text-gray-500 shrink-0">Reservations</p>
                {soReservations.filter(r => r.status === "ACTIVE").length > 0 ? (
                  <button onClick={() => setIsReservationModalOpen(true)} className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:underline">
                    <Bookmark className="w-3 h-3" />{soReservations.filter(r => r.status === "ACTIVE").length} active
                  </button>
                ) : (
                  <span className="text-[11px] text-gray-400">None</span>
                )}
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-[12px] text-gray-500 shrink-0">Invoice</p>
                {linkedInvoiceId ? (
                  <button onClick={() => onNavigateToInvoice?.(linkedInvoiceId)} className="text-[11px] font-bold text-[#4f6ef7] flex items-center gap-1 hover:underline">
                    <FileText className="w-3 h-3" />{linkedInvoiceId}
                  </button>
                ) : (
                  <span className="text-[11px] text-gray-400">—</span>
                )}
              </div>
            </div>
          </div>

          {/* Attachments */}
          <div className="px-5 py-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Attachments</p>
            <div className="flex flex-col gap-2">
              {mockAttachments.map(att => att.mime.startsWith("image/") ? (
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

        {/* ── Main: scrollable ── */}
        <div className="flex-1 overflow-auto bg-[#f9fafb] p-6">
          <div className="space-y-5">

          {/* Approval Cycle card — collapsible after approved */}
          <div className="bg-white border border-gray-200 rounded-[8px] shadow-sm overflow-hidden">
            <div
              onClick={() => (status === "APPROVED" || status === "INVOICED") && setIsApprovalCollapsed(c => !c)}
              className={`flex items-center gap-3 px-5 py-3.5 ${(status === "APPROVED" || status === "INVOICED") ? "cursor-pointer hover:bg-gray-50 transition-colors select-none" : ""}`}
            >
              <h2 className="text-[12px] font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
                <HistoryIcon className="w-3.5 h-3.5 text-gray-400" />
                Approval Cycle{cycle > 1 ? ` — Cycle ${cycle}` : ""}
              </h2>
              {status === "PENDING" && (
                <span className="text-[11px] text-amber-600 font-semibold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  Awaiting {approvalStep === 0 ? "1st" : "2nd"} Approval
                </span>
              )}
              {(status === "APPROVED" || status === "INVOICED") && (
                <span className="flex items-center gap-1 text-[11px] text-green-600 font-semibold bg-green-50 border border-green-100 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> Approved
                </span>
              )}
              <div className="ml-auto flex items-center gap-2">
                {status === "PENDING" && (
                  <>
                    <button onClick={e => { e.stopPropagation(); handleReject(); }} className="flex items-center gap-1 text-white px-3 py-1 rounded-[6px] text-[12px] font-semibold hover:opacity-90 active:scale-95 transition-all bg-[#e41e3f]"><X className="w-3 h-3" /> Reject</button>
                    <button onClick={e => { e.stopPropagation(); handleApprove(); }} className="flex items-center gap-1 text-white px-3 py-1 rounded-[6px] text-[12px] font-semibold hover:opacity-90 active:scale-95 transition-all bg-[#12b76a]"><Check className="w-3 h-3" /> Approve</button>
                  </>
                )}
                {(status === "APPROVED" || status === "INVOICED") && (
                  <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isApprovalCollapsed ? "" : "rotate-90"}`} />
                )}
              </div>
            </div>
            {!isApprovalCollapsed && (
              <div className="px-7 pb-5">
                <div className="flex items-center gap-0 px-2">
                  {(["1st Approval", "2nd Approval", "Approved"] as const).map((label, index) => {
                    const isFullyApproved = status === "APPROVED" || status === "INVOICED";
                    const isCompleted = index === 0 ? (approvalStep >= 1 || isFullyApproved) : index === 1 ? isFullyApproved : isFullyApproved;
                    const isActive = index === 0 ? (approvalStep === 0 && status === "PENDING") : index === 1 ? (approvalStep === 1 && status === "PENDING") : status === "APPROVED";
                    const lineGreen = index === 0 ? (approvalStep >= 1 || isFullyApproved) : index === 1 ? isFullyApproved : false;
                    return (
                      <React.Fragment key={label}>
                        <div className="flex flex-col items-center">
                          <div className={isCompleted ? "w-8 h-8 rounded-full bg-[#12b76a] flex items-center justify-center text-white shadow-sm" : isActive ? "w-8 h-8 rounded-full bg-[#12b76a] flex items-center justify-center text-white shadow-md ring-4 ring-green-100" : "w-8 h-8 rounded-full border-2 border-gray-200 bg-white flex items-center justify-center"}>
                            {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-[10px] font-bold text-gray-400">{index + 1}</span>}
                          </div>
                          <span className={isActive ? "text-[11px] font-bold text-green-700 mt-2 text-center whitespace-nowrap" : isCompleted ? "text-[11px] font-semibold text-green-500 mt-2 text-center whitespace-nowrap" : "text-[11px] font-medium text-gray-400 mt-2 text-center whitespace-nowrap"}>{label}</span>
                        </div>
                        {index < 2 && <div className={`flex-1 h-0.5 mx-1 mb-4 ${lineGreen ? "bg-[#12b76a]" : "bg-gray-200"}`} />}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Tabbed card: Order Items + Delivery Notes */}
          <div className="bg-white border border-gray-200 rounded-[8px] shadow-sm">

            {/* Tab bar */}
            <div className="flex items-center border-b border-gray-100">
              <button
                onClick={() => setActiveTab("items")}
                className={`px-5 py-3.5 text-[12px] font-bold uppercase tracking-wide border-b-2 -mb-px transition-colors ${activeTab === "items" ? "border-[#4f6ef7] text-[#4f6ef7]" : "border-transparent text-gray-400 hover:text-gray-600"}`}
              >
                Order Items
              </button>
              <button
                onClick={() => setActiveTab("delivery")}
                className={`px-5 py-3.5 text-[12px] font-bold uppercase tracking-wide border-b-2 -mb-px transition-colors flex items-center gap-1.5 ${activeTab === "delivery" ? "border-[#4f6ef7] text-[#4f6ef7]" : "border-transparent text-gray-400 hover:text-gray-600"}`}
              >
                Delivery Notes
                {deliveryNotes.length > 0 && (
                  <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold ${activeTab === "delivery" ? "bg-[#4f6ef7] text-white" : "bg-gray-200 text-gray-500"}`}>
                    {deliveryNotes.length}
                  </span>
                )}
              </button>
              <div className="ml-auto flex items-center gap-2 pr-5">

                {activeTab === "items" && (
                  <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-md transition-colors"><Eye className="w-3.5 h-3.5 text-gray-400" /> Columns</button>
                )}
                {status === "APPROVED" && (
                  <button onClick={() => setIsCreateResModalOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[12px] font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 transition-colors"><Bookmark className="w-3.5 h-3.5" /> Reservations</button>
                )}
                {showDNButton && (
                  <button onClick={() => setIsDNModalOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[12px] font-medium text-[#4f6ef7] bg-[#f0f4ff] hover:bg-[#e0e7ff] border border-[#d0d7ff] transition-colors"><Truck className="w-3.5 h-3.5" /> Create Delivery Note</button>
                )}
              </div>
            </div>

            {/* ── Order Items tab ── */}
            {activeTab === "items" && (
              <>
                <div className="overflow-hidden border-b border-gray-100">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/60">
                        <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider w-[35%]">Item</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">Unit</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">Total Qty</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">Free</th>
                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-center bg-indigo-50 text-indigo-500">Noted</th>
                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-center bg-green-50 text-green-600">Delivered</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Unit Price</th>
                        <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-50">
                      {orderItems.map(item => {
                        const family = getProductFamily(item.id);
                        const baseUnit = family ? getBaseUnit(family) : null;
                        const totalBase = family ? toBase(item.totalQty, item.unit, family) : item.totalQty;
                        const noted = dnNotedQty[item.id] ?? 0;
                        const delivered = dnDeliveredQty[item.id] ?? 0;
                        const reservedBase = soReservations.filter(r => r.itemId === item.id && r.status === "ACTIVE").reduce((s, r) => s + r.qtyBase, 0);
                        const freeBase = Math.max(0, totalBase - noted - delivered - reservedBase);
                        return (
                          <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-2 mb-0.5">
                                <p className="text-[13px] font-bold text-gray-900">{item.name}</p>
                                {soReservations.some(r => r.itemId === item.id && r.status === "ACTIVE") && (
                                  <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100">Reserved</span>
                                )}
                              </div>
                              <p className="text-[11px] text-gray-400 font-medium">{item.sku}</p>
                            </td>
                            <td className="px-4 py-3.5 text-center text-[12px] text-gray-500">{item.unit}</td>
                            <td className="px-4 py-3.5 text-center text-[13px] font-bold text-gray-900">{item.totalQty}</td>
                            <td className="px-4 py-3.5 text-center">
                              <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-green-50 text-green-700 border border-green-100">{freeBase} {baseUnit?.name ?? item.unit}</span>
                            </td>
                            <td className="px-4 py-3.5 text-center bg-indigo-50/40">
                              {noted > 0
                                ? <button onClick={() => filterDNsByItem(item.id)} className="text-[13px] font-bold text-indigo-600 hover:underline transition-colors">{noted}</button>
                                : <span className="text-[13px] font-bold text-indigo-200">{noted}</span>}
                            </td>
                            <td className="px-4 py-3.5 text-center bg-green-50/40">
                              {delivered > 0
                                ? <button onClick={() => filterDNsByItem(item.id)} className="text-[13px] font-bold text-green-600 hover:underline transition-colors">{delivered}</button>
                                : <span className="text-[13px] font-bold text-green-200">{delivered}</span>}
                            </td>
                            <td className="px-4 py-3.5 text-right text-[13px] font-semibold text-gray-700">JOD {item.price.toFixed(2)}</td>
                            <td className="px-5 py-3.5 text-right text-[13px] font-bold text-gray-900">JOD {(item.price * item.totalQty).toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-between items-start px-5 py-4">
                  <div className="text-[12px] text-gray-500 mt-1">
                    Total in Words: <span className="font-semibold text-gray-900 ml-1">Four JOD Only</span>
                  </div>
                  <div className="w-72 space-y-2 text-[12px]">
                    <div className="flex justify-between"><span className="text-gray-500">Discount Amount</span><span className="text-gray-600">JOD 0.00</span></div>
                    <div className="flex justify-between pb-2 border-b border-gray-100">
                      <span className="text-[13px] font-bold text-gray-900">Grand Total</span>
                      <span className="text-[14px] font-bold text-gray-900">JOD {grandTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between"><span className="text-gray-500">Tax Amount</span><span className="text-gray-600">JOD 0.55</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Net Total</span><span className="font-semibold text-gray-700">JOD {(grandTotal + 0.55).toFixed(2)}</span></div>
                  </div>
                </div>
              </>
            )}

            {/* ── Delivery Notes tab ── */}
            {activeTab === "delivery" && (
              <>
                {/* Filter chip */}
                {dnItemFilter && (() => {
                  const filteredItem = orderItems.find(i => i.id === dnItemFilter);
                  return (
                    <div className="px-5 py-2.5 border-b border-[#d0d7ff] bg-[#f8f9ff] flex items-center gap-2">
                      <span className="text-[11px] text-gray-400">Filtered by:</span>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f0f4ff] border border-[#d0d7ff]">
                        <span className="text-[12px] font-semibold text-[#4f6ef7]">{filteredItem?.name ?? dnItemFilter}</span>
                        <button onClick={() => setDnItemFilter(null)} className="text-[#4f6ef7] hover:text-[#1a1a2e] ml-0.5 transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-[11px] text-gray-400 ml-1">— showing notes for this item only</span>
                    </div>
                  );
                })()}

                {/* Filtered view: grouped by status */}
                {dnItemFilter ? (
                  <DNGroupedView
                    notes={deliveryNotes}
                    itemId={dnItemFilter}
                    itemUnit={orderItems.find(i => i.id === dnItemFilter)?.unit ?? ""}
                    onNavigateToDN={onNavigateToDN}
                  />
                ) : deliveryNotes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-14 text-center">
                    <Truck className="w-10 h-10 text-gray-200 mb-3" />
                    <p className="text-[13px] font-medium text-gray-400 mb-1">No delivery notes yet</p>
                    <p className="text-[11px] text-gray-300">Create a delivery note to start tracking shipments</p>
                    {showDNButton && (
                      <button onClick={() => setIsDNModalOpen(true)} className="mt-4 flex items-center gap-1.5 px-3.5 py-2 rounded-[6px] text-[12px] font-medium text-[#4f6ef7] bg-[#f0f4ff] hover:bg-[#e0e7ff] border border-[#d0d7ff] transition-colors">
                        <Truck className="w-3.5 h-3.5" /> Create Delivery Note
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {deliveryNotes.map(dn => {
                      const s = dn.status === "APPROVED"   ? { dot: "bg-green-400",  badge: "bg-green-50 text-green-700 border-green-200",  label: "Delivered" }
                              : dn.status === "CANCELED"   ? { dot: "bg-red-400",    badge: "bg-red-50 text-red-700 border-red-200",        label: "Canceled" }
                              : dn.status === "PROCESSING" ? { dot: "bg-blue-400",   badge: "bg-blue-50 text-blue-700 border-blue-200",     label: "In Delivery" }
                              :                              { dot: "bg-amber-400",  badge: "bg-amber-50 text-amber-700 border-amber-200",  label: "Pending" };
                      const isExpanded = expandedDNs.has(dn.id);
                      const itemCount = dn.items?.length ?? 0;
                      return (
                        <div key={dn.id}>
                          {/* Compact row */}
                          <div className="px-5 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                            {/* Expand toggle */}
                            <button
                              onClick={() => toggleDN(dn.id)}
                              className="shrink-0 text-gray-300 hover:text-gray-500 transition-colors"
                            >
                              <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-150 ${isExpanded ? "rotate-90" : ""}`} />
                            </button>
                            {/* Status dot + ID */}
                            <div className={`w-2 h-2 rounded-full shrink-0 ${s.dot}`} />
                            <span
                              onClick={() => onNavigateToDN?.(dn.id)}
                              className="text-[13px] font-bold text-gray-900 hover:text-[#4f6ef7] cursor-pointer transition-colors shrink-0"
                            >
                              {dn.id}
                            </span>
                            {/* Meta */}
                            <span className="flex items-center gap-1 text-[11px] text-gray-400 shrink-0">
                              <Clock className="w-3 h-3" />{dn.date}
                            </span>
                            <span className="flex items-center gap-1 text-[11px] text-gray-400 truncate">
                              <User className="w-3 h-3 shrink-0" />{dn.rep}
                            </span>
                            <span className="text-[11px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded shrink-0">
                              {itemCount} item{itemCount !== 1 ? "s" : ""}
                            </span>
                            {/* Transfer link */}
                            {(() => {
                              const t = transferList.find(t => t.sourceDNId === dn.id);
                              return t && onNavigateToTransfer ? (
                                <button
                                  onClick={e => { e.stopPropagation(); onNavigateToTransfer(t.id); }}
                                  className="flex items-center gap-1 text-[11px] font-semibold text-[#4f6ef7] hover:underline shrink-0 ml-auto"
                                >
                                  <ArrowLeftRight className="w-3 h-3" />{t.serialNo}
                                </button>
                              ) : null;
                            })()}
                            {/* Status badge */}
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${s.badge}`}>
                              {s.label}
                            </span>
                          </div>
                          {/* Expanded item breakdown */}
                          {isExpanded && dn.items && dn.items.length > 0 && (
                            <div className="mx-5 mb-2 rounded-[6px] border border-gray-100 bg-gray-50/60 divide-y divide-gray-100">
                              {dn.items.map((dnItem: { id: string; qty: number; unit: string; qtyBase?: number }) => {
                                const orderItem = orderItems.find(i => i.id === dnItem.id);
                                return (
                                  <div key={dnItem.id} className="flex items-center gap-3 px-4 py-2">
                                    <span className="text-[12px] text-gray-700 flex-1 truncate">{orderItem?.name ?? dnItem.id}</span>
                                    <span className="text-[12px] font-semibold text-gray-900 shrink-0">{dnItem.qty} <span className="font-normal text-gray-400">{dnItem.unit}</span></span>
                                  </div>
                                );
                              })}
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

          </div>{/* end space-y-5 */}
        </div>{/* end main scrollable */}


      </div>{/* end body */}

      {/* Modals */}
      <ConvertInvoiceModal isOpen={isConvertModalOpen} onClose={() => setIsConvertModalOpen(false)} onConfirm={onConfirmConversion} orderId={orderId || ""} warehouses={warehouses} reservations={soReservations} items={orderItems} soCreatedBy={soRecord.creator || "Admin"} skipReservations={preventInvoiceReservations} />
      <CreateDeliveryNoteModal isOpen={isDNModalOpen} onClose={() => setIsDNModalOpen(false)} onConfirm={handleCreateDN} orderId={orderId || ""} items={orderItems} reps={["Ahmad Alshaikh", "REP khaled", "REP Ahmad Abudre"]} warehouses={warehouses} reservations={soReservations} soCreatedBy={soRecord.creator || "Admin"} forceReservationTab={status === "INVOICED" && soReservations.some(r => r.status === "ACTIVE" && r.warehouse)} manualDnItemIds={new Set(dnList.filter(d => d.sourceSOId === soId && d.status !== "CANCELED").flatMap(d => d.itemsData?.map(i => i.id) || []))} />
      <ReservationDetailsModal isOpen={isReservationModalOpen} onClose={() => setIsReservationModalOpen(false)} reservations={soReservations.map(r => ({ ...r, warehouse: r.warehouse ?? "" }))} onRevoke={handleCancelReservation} onEdit={handleEditReservation} />
      <CreateReservationModal isOpen={isCreateResModalOpen} onClose={() => setIsCreateResModalOpen(false)} onConfirm={handleConfirmManualReservation} orderItems={orderItems} warehouses={warehouses} hideLinkTabs={true} />
      <ApproveOrderModal isOpen={isApproveModalOpen} onClose={() => setIsApproveModalOpen(false)} onConfirm={handleConfirmApproval} warehouses={warehouses} orderItems={orderItems} requireFullStock={!allowSOApprovalWithoutStock} />
      <SOHistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} entries={soAuditLog.filter(e => e.soId === soId)} soNumber={soRecord.orderNo || orderId || ""} soCreator={soRecord.creator || "Admin"} soCreatedDate={soRecord.issueDate || ""} />
    </div>
  );
}
