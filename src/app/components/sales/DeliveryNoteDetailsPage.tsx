import React, { useState, useEffect } from "react";
import { ArrowLeft, Check, CheckCircle2, XCircle, Clock, Truck, Package, ArrowRight, ExternalLink, ArrowLeftRight, X, Pencil, RotateCcw, ChevronDown } from "lucide-react";
import { TransferDetailsPage } from "./TransferDetailsPage";
import { Badge } from "../ui/badge";
import { useAppData } from "../../context/AppDataContext";
import { EditDeliveryNoteModal } from "./EditDeliveryNoteModal";

const RETURN_REASONS = [
  "Customer refused delivery",
  "Damaged goods",
  "Wrong items delivered",
  "Excess quantity",
  "Quality issues",
  "Product recall",
  "Other",
] as const;

function ReturnDeliveryModal({
  isOpen,
  dnId,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  dnId: string;
  onClose: () => void;
  onConfirm: (reason: string, navigate: boolean) => void;
}) {
  const [reason, setReason] = useState("");
  const [navigate, setNavigate] = useState(false);

  const handleConfirm = () => {
    if (!reason) return;
    onConfirm(reason, navigate);
    setReason("");
    setNavigate(false);
  };

  const handleClose = () => {
    setReason("");
    setNavigate(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <RotateCcw className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-gray-900">Return Delivery</h3>
              <p className="text-[11px] text-gray-400">{dnId} — a return note will be created</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-4">
          <p className="text-[13px] text-gray-500 leading-relaxed">
            This will create a <strong className="text-gray-700">Return Note</strong> for this delivery.
            The return must be confirmed by admin before items are marked as returned.
          </p>

          <div className="space-y-1.5">
            <label className="text-[12px] font-semibold text-gray-700">Return Reason</label>
            <div className="relative">
              <select
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="w-full h-9 pl-3 pr-8 border border-gray-200 rounded-lg text-[13px] text-gray-800 bg-white outline-none focus:border-indigo-400 appearance-none"
              >
                <option value="" disabled>Select a reason…</option>
                {RETURN_REASONS.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {reason === "Other" && (
            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-gray-700">
                Details <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <textarea
                placeholder="Describe the reason…"
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] text-gray-800 bg-white outline-none focus:border-indigo-400 resize-none"
              />
            </div>
          )}
        </div>

        {/* Navigate checkbox */}
        <div className="px-5 pb-5">
          <label className="flex items-center gap-2.5 cursor-pointer select-none w-fit">
            <input
              type="checkbox"
              checked={navigate}
              onChange={e => setNavigate(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 accent-[#1a1a2e] cursor-pointer"
            />
            <span className="text-[13px] text-gray-600">Navigate to return note after creating</span>
          </label>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-[13px] font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!reason}
            className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold text-white bg-[#1a1a2e] rounded-lg hover:bg-[#2a2a3e] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Create Return Note
          </button>
        </div>

      </div>
    </div>
  );
}

const getRepVanWarehouse = (rep: string) => `${rep} Van Warehouse`;

interface DeliveryNoteDetailsPageProps {
  dnId: string | null;
  onBack: () => void;
  onNavigateToSO?: (soId: string) => void;
  onNavigateToUnload?: () => void;
  onNavigateToPN?: (pnId: string) => void;
  isUnloadContext?: boolean;
  onNavigateToTransfer?: (transferId: string) => void;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  PENDING:    { bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200" },
  PROCESSING: { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200" },
  APPROVED:   { bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200" },
  CANCELED:   { bg: "bg-red-50",    text: "text-red-600",    border: "border-red-200" },
};

const DN_STATUS_LABELS: Record<string, string> = {
  PENDING:    "Waiting for Transfer",
  PROCESSING: "Noted for Delivery",
  APPROVED:   "Delivered",
  CANCELED:   "Canceled",
};

const steps = ["PENDING", "PROCESSING", "APPROVED"] as const;
type DNStatus = "PENDING" | "PROCESSING" | "APPROVED" | "CANCELED";

// Static mock data for DNs that exist on the list page but not in context
const MOCK_DNS: Record<string, any> = {
  "DN-ADM-0041": {
    id: "DN-ADM-0041", rep: "Ahmad Alshaikh", warehouse: "Main Branch",
    status: "PENDING", adminTransfer: "NONE", repTransfer: "NONE",
    date: "Apr 7, 2026",
    items: [{ id: "itm1", name: "American Coffe", sku: "AC-500", qty: 5, unit: "Piece", qtyBase: 5, soQty: 10, soUnit: "Piece", delivered: 0, warehouse: "Main Branch" }],
  },
  "DN-1734-18": {
    id: "DN-1734-18", rep: "Ahmad Alshaikh", warehouse: "Dream Warehouse",
    status: "PROCESSING", adminTransfer: "DONE", repTransfer: "CONFIRMED",
    date: "Apr 7, 2026",
    items: [{ id: "itm2", name: "Croissant", sku: "CR-001", qty: 1, unit: "Box", qtyBase: 6, soQty: 8, soUnit: "Piece", delivered: 0, warehouse: "Dream Warehouse" }],
  },
  "DN-1734-17": {
    id: "DN-1734-17", rep: "REP khaled", warehouse: "Zarqaa Warehouse",
    status: "APPROVED", adminTransfer: "DONE", repTransfer: "CONFIRMED",
    date: "Apr 6, 2026",
    items: [{ id: "itm1", name: "American Coffe", sku: "AC-500", qty: 1, unit: "Carton", qtyBase: 24, soQty: 48, soUnit: "Piece", delivered: 24, warehouse: "Zarqaa Warehouse" }],
  },
  "DN-1734-16": {
    id: "DN-1734-16", rep: "REP Ahmad Abudre", warehouse: "Main Branch",
    status: "CANCELED", adminTransfer: "NONE", repTransfer: "NONE",
    date: "Apr 5, 2026",
    cancelReason: "Canceled",
    items: [{ id: "itm2", name: "Croissant", sku: "CR-001", qty: 3, unit: "Piece", qtyBase: 3, soQty: 5, soUnit: "Piece", delivered: 0, warehouse: "Main Branch" }],
  },
  "DN-1734-15": {
    id: "DN-1734-15", rep: "REP khaled", warehouse: "Khald Warehouse",
    status: "APPROVED", adminTransfer: "DONE", repTransfer: "CONFIRMED",
    date: "Apr 5, 2026",
    items: [{ id: "itm1", name: "American Coffe", sku: "AC-500", qty: 2, unit: "Piece", qtyBase: 2, soQty: 10, soUnit: "Piece", delivered: 2, warehouse: "Khald Warehouse" }],
  },
  "DN-ADM-0040": {
    id: "DN-ADM-0040", rep: "Ahmad Alshaikh", warehouse: "Main Branch",
    status: "PENDING", adminTransfer: "NONE", repTransfer: "NONE",
    date: "Apr 4, 2026",
    items: [{ id: "itm1", name: "American Coffe", sku: "AC-500", qty: 4, unit: "Piece", qtyBase: 4, soQty: 10, soUnit: "Piece", delivered: 0, warehouse: "Main Branch" }],
  },
  "DN-1545-22": {
    id: "DN-1545-22", rep: "REP khaled", warehouse: "Zarqaa Warehouse",
    status: "PROCESSING", adminTransfer: "DONE", repTransfer: "NONE",
    date: "Apr 4, 2026",
    items: [{ id: "itm2", name: "Croissant", sku: "CR-001", qty: 2, unit: "Piece", qtyBase: 2, soQty: 5, soUnit: "Piece", delivered: 0, warehouse: "Zarqaa Warehouse" }],
  },
  "DN-1545-21": {
    id: "DN-1545-21", rep: "REP Ahmad Abudre", warehouse: "Main Branch",
    status: "PENDING", adminTransfer: "NONE", repTransfer: "NONE",
    date: "Apr 3, 2026",
    items: [{ id: "itm1", name: "American Coffe", sku: "AC-500", qty: 6, unit: "Piece", qtyBase: 6, soQty: 10, soUnit: "Piece", delivered: 0, warehouse: "Main Branch" }],
  },
  "DN-1555-09": {
    id: "DN-1555-09", rep: "Ahmad Alshaikh", warehouse: "Main Branch",
    status: "APPROVED", adminTransfer: "DONE", repTransfer: "CONFIRMED",
    date: "Apr 3, 2026",
    items: [{ id: "itm2", name: "Croissant", sku: "CR-001", qty: 5, unit: "Piece", qtyBase: 5, soQty: 5, soUnit: "Piece", delivered: 5, warehouse: "Main Branch" }],
  },
  "DN-ADM-0039": {
    id: "DN-ADM-0039", rep: "REP Ahmad Abudre", warehouse: "Zarqaa Warehouse",
    status: "CANCELED", adminTransfer: "NONE", repTransfer: "NONE",
    date: "Apr 2, 2026",
    cancelReason: "Canceled",
  },
};

function getItemStatus(qtyBase: number, deliveredBase: number): { label: string; color: string } {
  if (deliveredBase === 0) return { label: "Pending",  color: "bg-amber-50 text-amber-700 border border-amber-200" };
  if (deliveredBase >= qtyBase) return { label: "Delivered", color: "bg-green-50 text-green-700 border border-green-200" };
  return { label: "Partial",  color: "bg-blue-50 text-blue-700 border border-blue-200" };
}

export function DeliveryNoteDetailsPage({ dnId, onBack, onNavigateToSO, onNavigateToUnload, onNavigateToPN, isUnloadContext, onNavigateToTransfer }: DeliveryNoteDetailsPageProps) {
  const {
    dnList, setDnList,
    orderItems,
    pnList, setPnList,
    transferList, setTransferList,
    salesOrders, setSalesOrders,
    reservations, setReservations,
    setReservationAuditLog,
    setOrderItems,
  } = useAppData();

  const record = dnList.find(d => d.id === dnId || d.dnNumber === dnId);
  const [dn, setDn] = React.useState<any>(record || null);
  const [showUnloadPrompt, setShowUnloadPrompt] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

  // Tab state must live before any early return (Rules of Hooks)
  const SELF_TYPE = "dn";
  const selfId = dnId ?? "dn";
  const selfLabel = dn?.id ?? dnId ?? "Delivery Note";
  type InnerTab = { type: string; id: string; label: string };
  const SELF_TAB: InnerTab = { type: SELF_TYPE, id: selfId, label: selfLabel };
  const [innerTabs, setInnerTabs] = useState<InnerTab[]>([SELF_TAB]);
  const [activeInnerTab, setActiveInnerTab] = useState<InnerTab>(SELF_TAB);
  useEffect(() => { setInnerTabs([SELF_TAB]); setActiveInnerTab(SELF_TAB); }, [dnId]);

  // Keep local dn in sync when an external action (e.g. Transfer approval) updates dnList
  useEffect(() => {
    const fresh = dnList.find(d => d.id === dnId || d.dnNumber === dnId);
    if (fresh) setDn(fresh);
  }, [dnList]);

  const openTab = (tab: InnerTab) => {
    setInnerTabs(prev => prev.some(t => t.id === tab.id) ? prev : [...prev, tab]);
    setActiveInnerTab(tab);
  };
  const closeTab = (id: string) => {
    const wasActive = activeInnerTab.id === id;
    setInnerTabs(prev => prev.filter(t => t.id !== id));
    if (wasActive) setActiveInnerTab(SELF_TAB);
  };

  if (!dn) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f5f5f7]">
        <p className="text-[13px] text-gray-400">Delivery note not found.</p>
      </div>
    );
  }

  const updateDn = (patch: Partial<any>) => {
    setDn((prev: any) => {
      const next = { ...prev, ...patch };
      setDnList(list => list.map(d => (d.id === dnId || d.dnNumber === dnId) ? { ...d, ...patch } : d));
      return next;
    });
  };

  const handleEditConfirm = (data: { rep: string; warehouse: string; items: { id: string; qty: number; unit: string; qtyBase: number }[] }) => {
    const oldItems: any[] = Array.isArray(dn.itemsData) ? dn.itemsData : Array.isArray(dn.items) ? dn.items : [];
    const updatedItems = oldItems.map((item: any) => {
      const edited = data.items.find(d => d.id === item.id);
      return edited ? { ...item, qty: edited.qty, qtyBase: edited.qtyBase } : item;
    });
    updateDn({ rep: data.rep, warehouse: data.warehouse, items: updatedItems, itemsData: updatedItems });

    // Adjust notedQty on the source SO (delta between old and new qtyBase per item)
    setSalesOrders(prev => prev.map(so => {
      if (so.id !== dn.sourceSOId) return so;
      return {
        ...so,
        itemsData: (so.itemsData ?? []).map(soItem => {
          const oldItem = oldItems.find((i: any) => i.id === soItem.id);
          const newItem = data.items.find(d => d.id === soItem.id);
          if (!oldItem || !newItem) return soItem;
          const delta = newItem.qtyBase - (oldItem.qtyBase ?? oldItem.qty);
          return { ...soItem, notedQty: Math.max(0, soItem.notedQty + delta) };
        }),
      };
    }));

    setIsEditModalOpen(false);
  };

  const relatedTransfers = transferList.filter(t => t.sourceDNId === dn.id || t.sourceDNId === dn.dnNumber);
  const linkedRNs = pnList.filter(p => p.sourceDN?.id === dn.id || p.sourceDN?.id === dn.dnNumber);
  const hasActiveRN = linkedRNs.some(rn => rn.status !== "CANCELED");

  const status: DNStatus = dn.status;
  const adminDone = dn.adminTransfer === "DONE";
  const repDone   = dn.repTransfer === "CONFIRMED";
  const activeStepIndex = status === "CANCELED" ? -1 : steps.indexOf(status as typeof steps[number]);
  const statusColors = STATUS_COLORS[status] ?? STATUS_COLORS["PENDING"];

  const dnItems = (Array.isArray(dn.itemsData) ? dn.itemsData : Array.isArray(dn.items) ? dn.items : []).map((dnItem: any) => {
    const oi = orderItems.find(o => o.id === dnItem.id);
    const isApproved = status === "APPROVED";
    return {
      ...dnItem,
      name: oi?.name ?? dnItem.name ?? dnItem.id,
      sku:  oi?.sku  ?? dnItem.sku ?? "—",
      soQty:  oi?.totalQty ?? dnItem.soQty ?? 0,
      soUnit: oi?.unit ?? dnItem.soUnit ?? "—",
      delivered: isApproved ? (dnItem.qtyBase ?? dnItem.qty) : 0,
    };
  });

  const applyVanWarehouseToReservations = () => {
    const vanWh = getRepVanWarehouse(dn.rep);
    const now = new Date();
    const linked = reservations.filter(
      r => (r.linkedDNId === dn.id || r.linkedDNId === dn.dnNumber) && r.status === "ACTIVE"
    );
    if (linked.length === 0) return;
    setReservations(prev => prev.map(r =>
      linked.some(l => l.id === r.id) ? { ...r, warehouse: vanWh } : r
    ));
    setReservationAuditLog(prev => [
      ...linked.map(r => ({
        id: `AUDIT-${now.getTime()}-${r.id}-TRANSFER`,
        reservationId: r.id,
        itemName: r.itemName,
        sku: "",
        qty: r.qty,
        unit: r.unit,
        warehouse: vanWh,
        linkedDNId: dn.id as string,
        linkedDNNumber: dn.dnNumber as string,
        reservationType: r.type,
        status: "ACTIVE" as const,
        eventType: "Warehouse Transfer" as const,
        triggeredBy: "System",
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString(),
        note: `Moved to ${vanWh} after transfer`,
      })),
      ...prev,
    ]);
  };

  const completeRelatedTransfers = () => {
    const now = new Date();
    const nowStr = now.toLocaleString("en-US", {
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hour12: false,
    });
    setTransferList(prev => prev.map(t => 
      t.sourceDNId === dn.id 
        ? { ...t, status: "COMPLETED", processTime: nowStr } 
        : t
    ));
  };

  const handleAdminTransfer = () => {
    const bothWillBeDone = repDone;
    updateDn({ adminTransfer: "DONE", status: bothWillBeDone ? "PROCESSING" : status });
    if (bothWillBeDone) {
      applyVanWarehouseToReservations();
      completeRelatedTransfers();
    }
  };

  const handleRepTransfer = () => {
    const bothWillBeDone = adminDone;
    updateDn({ repTransfer: "CONFIRMED", status: bothWillBeDone ? "PROCESSING" : status });
    if (bothWillBeDone) {
      applyVanWarehouseToReservations();
      completeRelatedTransfers();
    }
  };



  const handleConfirmDelivery = () => {
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Update orderItems (deliveredQty)
    setOrderItems(prev => prev.map(oi => {
      const dnItem = dnItems.find((di: any) => di.id === oi.id);
      if (dnItem) {
        return { ...oi, deliveredQty: oi.deliveredQty + (dnItem.qtyBase ?? dnItem.qty) };
      }
      return oi;
    }));

    // 2. Consume reservations
    // We look for reservations that match the items in this DN and are linked to the same SO or Invoice
    const consumedReservations: string[] = [];
    const newAuditEntries: any[] = [];

    dnItems.forEach((di: any) => {
      const matchingRes = reservations.find(r => 
        r.status === "ACTIVE" &&
        r.itemId === di.id &&
        (
          (r.sourceSOId && (r.sourceSOId === dn.sourceSOId || r.sourceSOId === dn.sourceInvoiceId)) ||
          (r.sourceInvoiceId && (r.sourceInvoiceId === dn.sourceSOId || r.sourceInvoiceId === dn.sourceInvoiceId))
        )
      );

      if (matchingRes) {
        consumedReservations.push(matchingRes.id);
        newAuditEntries.push({
          id: `AUDIT-${Math.floor(Math.random() * 10000)}`,
          reservationId: matchingRes.id,
          itemName: matchingRes.itemName,
          sku: di.sku || "—",
          qty: matchingRes.qty,
          unit: matchingRes.unit,
          warehouse: matchingRes.warehouse || "—",
          sourceSOId: dn.sourceSOId,
          sourceSONumber: dn.sourceSONumber,
          sourceInvoiceId: dn.sourceInvoiceId,
          linkedDNId: dn.id,
          linkedDNNumber: dn.dnNumber,
          eventType: "Used in delivery note",
          triggeredBy: "ADMIN Ayah Al-Ori",
          date: dateStr,
          time: timeStr,
          note: `Consumed during delivery of ${dn.dnNumber || dn.id}`,
        });
      }
    });

    if (consumedReservations.length > 0) {
      setReservations(prev => prev.filter(r => !consumedReservations.includes(r.id)));
      setReservationAuditLog(prev => [...newAuditEntries, ...prev]);
    }

    // 3. Update DN status
    updateDn({ status: "APPROVED" });
  };

  const handleCancel = () => {
    const reason = status === "PROCESSING" ? "Rejected by Representative" : "Canceled";
    updateDn({ status: "CANCELED", cancelReason: reason });
    if (onNavigateToUnload) setShowUnloadPrompt(true);
  };

  const handleReturnDelivery = (reason: string, navigate: boolean) => {
    if (!dn) return;

    const rnItems = dnItems.map((item: any) => ({
      id: item.id,
      name: item.name,
      sku: item.sku,
      unit: item.unit,
      deliveredQty: item.qtyBase,
      returnQty: item.qtyBase,
      status: "Reserved" as const,
      condition: "Resellable" as const,
    }));

    const newRNId = `RN-${Math.floor(Math.random() * 9000 + 1000)}`;
    const newRN = {
      id: newRNId,
      rnNumber: newRNId,
      status: "PENDING" as const,
      ...(dn.sourceSOId ? { sourceSOId: dn.sourceSOId, sourceSONumber: dn.sourceSONumber } : {}),
      ...(dn.sourceInvoiceId ? { sourceInvoiceId: dn.sourceInvoiceId, sourceInvoiceNumber: dn.sourceInvoiceNumber } : {}),
      sourceDN: { id: dn.id, number: dn.id },
      clientName: dn.clientName || "—",
      rep: dn.rep || "—",
      createdBy: "Admin",
      warehouse: dn.warehouse || "—",
      destinationWarehouse: "Main Warehouse" as const,
      destinationRep: "",
      items: (dn.itemsData || dn.items || []).length,
      reservedCount: (dn.itemsData || dn.items || []).length,
      createdDate: new Date().toLocaleDateString("en-GB"),
      inRepVan: false,
      creditNoteStatus: "N/A" as const,
      invoicePaymentStatus: "Unpaid" as const,
      repConfirmed: false,
      adminConfirmed: false,
      reason,
      itemsData: rnItems,
    };
    setPnList(prev => [newRN, ...prev]);
    setIsReturnModalOpen(false);
    if (navigate) onNavigateToPN?.(newRNId);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#f5f5f7]">

      {/* ── Inner Tab Bar ── */}
      {innerTabs.length > 1 && (
        <div className="flex items-end bg-[#f0f1f4] px-3 pt-2 shrink-0 gap-0.5 border-b border-[#dcdde8] overflow-x-auto">
          {innerTabs.map(tab => {
            const isActive = activeInnerTab.id === tab.id;
            return (
              <div
                key={tab.id}
                onClick={() => setActiveInnerTab(tab)}
                className={`flex items-center gap-2 px-3 py-2 rounded-t-lg cursor-pointer transition-all shrink-0 max-w-[200px] group select-none ${
                  isActive
                    ? "bg-white border border-b-0 border-[#dcdde8] text-gray-800 shadow-sm -mb-px"
                    : "bg-transparent text-gray-500 hover:bg-white/50 hover:text-gray-700"
                }`}
              >
                {tab.type === "dn" ? (
                  <Truck className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-[#4f6ef7]" : "text-gray-400"}`} />
                ) : tab.type === "transfer" ? (
                  <ArrowLeftRight className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-[#4f6ef7]" : "text-gray-400"}`} />
                ) : null}
                <span className="text-[12px] font-medium truncate">{tab.label}</span>
                {tab.type !== SELF_TYPE && (
                  <button
                    onClick={e => { e.stopPropagation(); closeTab(tab.id); }}
                    className={`flex items-center justify-center w-4 h-4 rounded-full shrink-0 ml-0.5 transition-all
                      ${isActive
                        ? "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                        : "text-gray-300 opacity-0 group-hover:opacity-100 hover:text-gray-600"
                      }`}
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeInnerTab.type === "dn" ? (
        <>
      {/* ── Top Nav Bar ── */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-gray-800 font-medium transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <span className="text-gray-300 text-[18px] font-light select-none">|</span>
          <h1 className="text-[18px] font-semibold text-[#1a1a2e]">{dn.dnNumber ?? dn.id}</h1>
        </div>
        <div className="flex items-center gap-3">
          {status === "PENDING" && !adminDone && !repDone && (
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 text-[12px] font-semibold rounded-[4px] transition-colors">
              <Pencil className="w-3.5 h-3.5" /> Edit
            </button>
          )}
          {linkedRNs.length > 0 && linkedRNs.map(rn => (
            <button
              key={rn.id}
              onClick={() => onNavigateToPN?.(rn.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 text-[12px] font-semibold rounded-[4px] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {rn.rnNumber ?? rn.id}
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ml-0.5 ${
                rn.status === "RECEIVED" ? "bg-green-50 text-green-700 border-green-200" :
                rn.status === "CANCELED" ? "bg-red-50 text-red-600 border-red-200" :
                rn.status === "PROCESSING" ? "bg-blue-50 text-blue-700 border-blue-200" :
                "bg-amber-100 text-amber-800 border-amber-300"
              }`}>{rn.status}</span>
            </button>
          ))}
          {status === "APPROVED" && !hasActiveRN && (
            <button
              onClick={() => setIsReturnModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 text-[12px] font-semibold rounded-[4px] transition-colors">
              <RotateCcw className="w-3.5 h-3.5" /> Return Delivery
            </button>
          )}
          <Badge variant="outline" className={`rounded-md px-2.5 py-0.5 text-[11px] font-bold border ${statusColors.bg} ${statusColors.text} ${statusColors.border}`}>
            {DN_STATUS_LABELS[status] ?? status}
          </Badge>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="px-6 py-5 space-y-4">

          {/* ── Status Cycle ── */}
          <div className="bg-white border border-gray-200 rounded-[8px] shadow-sm p-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <h2 className="text-[12px] font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  Delivery status
                </h2>
                {status === "PENDING" && (
                  <span className="text-[11px] text-amber-600 font-semibold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                    Awaiting {!adminDone ? "Admin" : "Rep"} Transfer
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {(status === "PENDING" || status === "PROCESSING") && (
                  <button onClick={handleCancel}
                    className="flex items-center gap-1.5 text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-[4px] text-[12px] font-medium transition-all active:scale-95">
                    <XCircle className="w-3.5 h-3.5" /> Cancel
                  </button>
                )}
                {status === "PENDING" && !adminDone && (
                  <button onClick={handleAdminTransfer}
                    className="flex items-center gap-1.5 text-white px-3 py-1.5 rounded-[4px] text-[12px] font-medium transition-all hover:opacity-90 active:scale-95 bg-[#12b76a]">
                    <Package className="w-3.5 h-3.5" /> Confirm Admin Transfer
                  </button>
                )}
                {status === "PENDING" && !repDone && (
                  <button onClick={handleRepTransfer}
                    className="flex items-center gap-1.5 text-white px-3 py-1.5 rounded-[4px] text-[12px] font-medium transition-all hover:opacity-90 active:scale-95 bg-[#12b76a]">
                    <Truck className="w-3.5 h-3.5" /> Confirm Rep Transfer
                  </button>
                )}
                {status === "PROCESSING" && (
                  <button onClick={handleConfirmDelivery}
                    className="flex items-center gap-1.5 text-white px-3 py-1.5 rounded-[4px] text-[12px] font-medium transition-all hover:opacity-90 active:scale-95 bg-[#12b76a]">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Confirm Delivery
                  </button>
                )}
              </div>
            </div>

            {/* Delivery tracking strip */}
            <div className="w-full px-1 pt-3 pb-4">
              {/* Dot rail */}
              <div className="flex items-center w-full mb-3">
                {steps.map((step, index) => {
                  const isCompleted = activeStepIndex > index;
                  const isActive    = activeStepIndex === index;
                  const isCanceled  = status === "CANCELED";
                  const isDone      = !isCanceled && (isCompleted || isActive);
                  const StepIcon = step === "PENDING" ? Clock : step === "PROCESSING" ? Truck : Package;
                  return (
                    <React.Fragment key={step}>
                      {isDone ? (
                        <div className="w-[28px] h-[28px] rounded-full bg-[#12b76a] flex items-center justify-center shrink-0 shadow-sm">
                          <StepIcon className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                        </div>
                      ) : (
                        <div className="w-[28px] h-[28px] rounded-full border-2 border-gray-200 bg-white flex items-center justify-center shrink-0">
                          <StepIcon className="w-3.5 h-3.5 text-gray-300" strokeWidth={2} />
                        </div>
                      )}
                      {index < steps.length - 1 && (
                        <div className={`flex-1 border-t-2 mx-2 ${
                          !isCanceled && activeStepIndex > index
                            ? "border-solid border-[#12b76a]"
                            : "border-dashed border-gray-200"
                        }`} />
                      )}
                    </React.Fragment>
                  );
                })}
                {status === "CANCELED" && (
                  <>
                    <div className="flex-1 border-t-2 border-dashed border-red-200 mx-2" />
                    <div className="w-[28px] h-[28px] rounded-full bg-red-100 border-2 border-red-300 flex items-center justify-center shrink-0">
                      <XCircle className="w-3.5 h-3.5 text-red-500" />
                    </div>
                  </>
                )}
              </div>

              {/* Labels row */}
              <div className="flex items-start w-full">
                {steps.map((step, index) => {
                  const isCompleted = activeStepIndex > index;
                  const isActive    = activeStepIndex === index;
                  const isCanceled  = status === "CANCELED";
                  const isDone      = !isCanceled && (isCompleted || isActive);
                  return (
                    <React.Fragment key={step}>
                      <div className="flex flex-col shrink-0" style={{ maxWidth: index === steps.length - 1 ? undefined : "none" }}>
                        <span className={`text-[12px] font-semibold leading-tight whitespace-nowrap ${
                          isDone ? "text-gray-800" : "text-gray-400"
                        }`}>
                          {step === "PENDING" && isCompleted ? "Transfered" : (DN_STATUS_LABELS[step] ?? step)}
                        </span>
                        <span className={`text-[11px] mt-0.5 ${isDone ? "text-gray-500" : "text-gray-300"}`}>
                          {isDone ? dn.createdDate : "—"}
                        </span>
                      </div>
                      {index < steps.length - 1 && <div className="flex-1" />}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* ── Linked return notes ── */}
            {linkedRNs.length > 0 && (
              <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Return Notes</p>
                <div className="flex flex-col gap-1.5">
                  {linkedRNs.map(rn => (
                    <div key={rn.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-amber-50 border border-amber-100">
                      <div className="flex items-center gap-2">
                        <RotateCcw className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="text-[12px] font-bold text-amber-800">{rn.rnNumber ?? rn.id}</span>
                        <span className="text-[11px] text-amber-600">{rn.createdDate}</span>
                        {(rn as any).reason && (
                          <span className="text-[11px] text-amber-500 italic">· {(rn as any).reason}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          rn.status === "RECEIVED"   ? "bg-green-50 text-green-700 border-green-200" :
                          rn.status === "CANCELED"   ? "bg-red-50 text-red-600 border-red-200" :
                          rn.status === "PROCESSING" ? "bg-blue-50 text-blue-700 border-blue-200" :
                                                       "bg-amber-100 text-amber-800 border-amber-300"
                        }`}>{rn.status}</span>
                        {onNavigateToPN && (
                          <button
                            onClick={() => onNavigateToPN(rn.id)}
                            className="text-[11px] font-semibold text-indigo-600 hover:underline flex items-center gap-1"
                          >
                            View <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* ── Unload prompt (shown after cancel) ── */}
          {showUnloadPrompt && (
            <div className="flex items-center justify-between gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-[8px]">
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-amber-600 shrink-0" />
                <p className="text-[13px] font-medium text-amber-800">
                  Delivery note canceled — items need to be returned to the warehouse.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={onNavigateToUnload}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-amber-600 hover:bg-amber-700 text-white text-[12px] font-semibold transition-colors"
                >
                  Go to Unload <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setShowUnloadPrompt(false)}
                  className="p-1 text-amber-400 hover:text-amber-700 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── Details ── */}
          <div className="bg-white border border-gray-200 rounded-[8px] shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-[12px] font-bold text-[#111827] uppercase tracking-wide">Details</h2>
            </div>
            <div className="p-5 grid grid-cols-2 gap-x-10 gap-y-5">
              <div>
                <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-1 font-semibold">Delivery note Number</p>
                <p className="text-[13px] font-semibold text-gray-900">{dn.dnNumber ?? dn.id}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-1 font-semibold">Source</p>
                {dn.sourceSONumber ? (
                  <button
                    onClick={() => onNavigateToSO && dn.sourceSOId && onNavigateToSO(dn.sourceSOId)}
                    className="text-[13px] font-semibold text-[#4f6ef7] hover:underline flex items-center gap-1"
                  >
                    {dn.sourceSONumber} <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <p className="text-[13px] font-semibold text-gray-400">—</p>
                )}
              </div>
              <div>
                <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-1 font-semibold">Date</p>
                <p className="text-[13px] font-semibold text-gray-900">{dn.createdDate ?? dn.date}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-1 font-semibold">Rep</p>
                <p className="text-[13px] font-semibold text-gray-900">{dn.rep}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-1 font-semibold">Before Transfer</p>
                {(() => {
                  const whs = [...new Set(dnItems.map((i: any) => i.warehouse).filter(Boolean))];
                  const display = whs.length === 1 ? whs[0] : whs.length > 1 ? whs.join(", ") : dn.warehouse ?? "—";
                  return <p className="text-[13px] font-semibold text-gray-900">{display}</p>;
                })()}
              </div>
              <div>
                <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-1 font-semibold">After Transfer</p>
                {(status === "PROCESSING" || status === "APPROVED") ? (
                  <p className="text-[13px] font-semibold text-gray-900">{getRepVanWarehouse(dn.rep)}</p>
                ) : (
                  <p className="text-[13px] font-semibold text-gray-400">—</p>
                )}
              </div>
              {relatedTransfers.length > 0 && (
                <div className="col-span-2">
                  <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-1 font-semibold">Related Transfer(s)</p>
                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                    {relatedTransfers.map(t => (
                      <button
                        key={t.id}
                        onClick={() => openTab({ type: "transfer", id: t.id, label: t.serialNo ?? t.id })}
                        className="text-[13px] font-semibold text-[#4f6ef7] hover:underline flex items-center gap-1.5"
                      >
                        {t.serialNo} <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {dn.cancelReason && (
                <div className="col-span-2">
                  <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-1 font-semibold">Cancel Reason</p>
                  <p className="text-[13px] font-semibold text-red-600">{dn.cancelReason}</p>
                </div>
              )}
            </div>

          </div>

          {/* ── DN Items table ── */}
          <div className="bg-white border border-gray-200 rounded-[8px] shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-[12px] font-bold text-[#111827] uppercase tracking-wide">Delivery note Items</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide w-[28%]">Item</th>
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Warehouse</th>
                    <th className="text-right px-5 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Delivery note Qty</th>
                    <th className="text-right px-5 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Base Units</th>
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">SO Reference</th>
                    <th className="text-right px-5 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Delivered</th>
                    <th className="text-center px-5 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dnItems.map((item: any) => {
                    const itemStatus = getItemStatus(item.qtyBase ?? item.qty, item.delivered ?? 0);
                    return (
                      <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3.5">
                          <p className="font-semibold text-gray-900">{item.name}</p>
                          <p className="text-[11px] text-gray-400 font-medium mt-0.5">{item.sku}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          {item.warehouse
                            ? <span className="text-[12px] font-medium text-gray-700">{item.warehouse}</span>
                            : <span className="text-gray-300">—</span>
                          }
                        </td>
                        <td className="px-5 py-3.5 text-right font-semibold text-gray-900">
                          {item.dnQty ?? item.qty} <span className="text-gray-500 font-normal text-[12px]">{item.dnUnit ?? item.unit}</span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <span className="text-[12px] font-medium text-gray-500">{item.qtyBase ?? item.qty} pcs</span>
                        </td>
                        <td className="px-5 py-3.5">
                          {item.soUnit && item.soQty != null
                            ? <span className="text-[11px] text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">from SO: {item.soQty} {item.soUnit}</span>
                            : <span className="text-gray-300">—</span>
                          }
                        </td>
                        <td className="px-5 py-3.5 text-right font-semibold text-gray-900">{item.delivered ?? 0}</td>
                        <td className="px-5 py-3.5 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-semibold ${itemStatus.color}`}>
                            {itemStatus.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {dnItems.length === 0 && (
                <div className="px-5 py-10 text-center text-[13px] text-gray-400">No items found.</div>
              )}
            </div>
          </div>

        </div>
      </div>
        </>
      ) : (
        <TransferDetailsPage
          transferId={activeInnerTab.id}
          onBack={() => setActiveInnerTab(SELF_TAB)}
          onNavigateToDN={undefined}
        />
      )}

      <EditDeliveryNoteModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onConfirm={handleEditConfirm}
        dn={dn}
        soItems={salesOrders.find(so => so.id === dn?.sourceSOId)?.itemsData ?? []}
        reps={["Ahmad Alshaikh", "REP khaled", "REP Ahmad Abudre"]}
        warehouses={["Main Branch", "Zarqaa Warehouse", "Dream Warehouse", "Khald Warehouse", "Local Maram Van Warehouse", "Van مستودع الكوم"]}
      />

      <ReturnDeliveryModal
        isOpen={isReturnModalOpen}
        dnId={dn?.dnNumber ?? dn?.id ?? ""}
        onClose={() => setIsReturnModalOpen(false)}
        onConfirm={handleReturnDelivery}
      />
    </div>
  );
}
