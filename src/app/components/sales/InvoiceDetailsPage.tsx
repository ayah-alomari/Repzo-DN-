import { useState, useEffect } from "react";
import { useAppData } from "../../context/AppDataContext";
import { getProductFamily, getUnitFactor } from "./measurementUnits";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Truck,
  RotateCcw,
  Copy,
  Printer,
  User,
  Plus,
  MoreVertical,
  Paperclip,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  X,
  FileText,
  Bookmark,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { CreateDNFromReservationModal, DNReservationItem } from "./CreateDNFromReservationModal";
import { DeliveryNoteDetailsPage } from "./DeliveryNoteDetailsPage";

const REPS = ["Ahmad Alshaikh", "REP khaled", "REP Ahmad Abudre"];

interface InvoiceDetailsPageProps {
  invoiceId: string | null;
  onBack: () => void;
  onNavigateToSO?: (soId: string) => void;
  onNavigateToDN?: (dnId: string) => void;
  onCreateReturnNote?: (invoiceId: string) => void;
}

interface InvoiceItem {
  id: string;
  name: string;
  sku: string;
  unit: string;
  variantName: string;
  orderedQty: number;
  deliveredQty: number;
  returnedQty: number;
  price: number;
  discount: number;
  total: number;
}

interface DeliveryNoteRef {
  id: string;
  status: "PENDING" | "PROCESSING" | "APPROVED" | "CANCELED";
  rep: string;
  warehouse: string;
  date: string;
}

interface InvoiceReservation {
  itemId: string;
  itemName?: string;
  warehouse: string;
  rep: string;
  reservedQty: number;
  unit: string;
}

interface MockInvoice {
  id: string;
  serialNo: string;
  externalSerial: string;
  advancedSerial: string;
  sourceSOId: string;
  sourceSO: string;
  issueDate: string;
  dueDate: string;
  createdAt: string;
  creator: string;
  implementedBy: string;
  clientName: string;
  paymentType: string;
  paymentsCount: number;
  status: "PENDING" | "APPROVED" | "CANCELED";
  orderStatus: string;
  balance: string;
  comment: string;
  isDelivered: boolean;
  deliveryNotes: DeliveryNoteRef[];
  items: InvoiceItem[];
  reservations: InvoiceReservation[];
}

const DN_STATUS_MAP: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  APPROVED:   { label: "Delivered",            bg: "bg-[#ecfdf3]", text: "text-[#12b76a]", dot: "bg-[#12b76a]" },
  CANCELED:   { label: "Canceled",             bg: "bg-[#fff1f0]", text: "text-[#e41e3f]", dot: "bg-[#e41e3f]" },
  PROCESSING: { label: "Noted for Delivery",   bg: "bg-[#eff6ff]", text: "text-[#4f6ef7]", dot: "bg-[#4f6ef7]" },
  PENDING:    { label: "Waiting for Transfer", bg: "bg-[#fcfbd7]", text: "text-[#e0a800]", dot: "bg-[#e0a800]" },
};

export function InvoiceDetailsPage({
  invoiceId,
  onBack,
  onNavigateToSO,
  onNavigateToDN,
}: InvoiceDetailsPageProps) {
  const {
    invoices, setInvoices,
    setDnList, dnList,
    reservations, setReservations,
    reservationAuditLog, setReservationAuditLog,
    setTransferList
  } = useAppData();
  const parseJOD = (s: string) => parseFloat(s.replace(/[^0-9.]/g, "")) || 0;

  let invoice: MockInvoice | null = null;
  const record = invoices.find(inv => inv.id === invoiceId || inv.serialNo === invoiceId);

  if (record) {
    invoice = {
      id: record.id,
      serialNo: record.serialNo,
      externalSerial: record.externalSerial,
      advancedSerial: "-",
      sourceSOId: record.sourceSOId || "—",
      sourceSO: record.sourceSOId || "—",
      issueDate: record.issueDate,
      dueDate: record.issueDate,
      createdAt: record.issueDate,
      creator: record.creator,
      implementedBy: "-",
      clientName: record.clientName,
      paymentType: record.paymentType,
      paymentsCount: 0,
      status: record.status as any,
      orderStatus: record.balance === "JOD 0.00" ? "Fully Paid" : "Unpaid",
      balance: record.balance,
      comment: record.comment,
      isDelivered: record.delivery === "Delivered",
      deliveryNotes: dnList
        .filter(d =>
          (record.sourceSOId && d.sourceSOId === record.sourceSOId) ||
          d.sourceInvoiceId === record.id
        )
        .map(d => ({
          id: d.dnNumber || d.id,
          status: d.status,
          rep: d.rep,
          warehouse: d.warehouse,
          date: d.createdDate,
        })),
      items: record.itemsData ? record.itemsData.map(i => ({
        id: i.id,
        name: i.name,
        sku: i.sku,
        unit: i.unit,
        variantName: "-",
        orderedQty: i.totalQty,
        deliveredQty: i.deliveredQty,
        returnedQty: 0,
        price: i.price,
        discount: 0,
        total: i.price * i.totalQty,
      })) : [],
      reservations: (record.reservedItems ?? []).map(r => ({
        itemId:      r.itemId,
        itemName:    r.itemName,
        warehouse:   r.warehouse,
        rep:         record.creator,
        reservedQty: r.qty,
        unit:        r.unit,
      })),
    };
  }

  // Tab state before early return (Rules of Hooks)
  const SELF_TYPE = "invoice";
  const selfId = invoiceId ?? "invoice";
  const selfLabel = invoice?.serialNo ?? invoiceId ?? "Invoice";
  type InnerTab = { type: string; id: string; label: string };
  const SELF_TAB: InnerTab = { type: SELF_TYPE, id: selfId, label: selfLabel };
  const [innerTabs, setInnerTabs] = useState<InnerTab[]>([SELF_TAB]);
  const [activeInnerTab, setActiveInnerTab] = useState<InnerTab>(SELF_TAB);
  useEffect(() => { setInnerTabs([SELF_TAB]); setActiveInnerTab(SELF_TAB); }, [invoiceId]);

  const openTab = (tab: InnerTab) => {
    setInnerTabs(prev => prev.some(t => t.id === tab.id) ? prev : [...prev, tab]);
    setActiveInnerTab(tab);
  };
  const closeTab = (id: string) => {
    const wasActive = activeInnerTab.id === id;
    setInnerTabs(prev => prev.filter(t => t.id !== id));
    if (wasActive) setActiveInnerTab(SELF_TAB);
  };

  if (!invoice) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f5f5f7]">
        <p className="text-[13px] text-gray-400">Invoice not found.</p>
      </div>
    );
  }

  const [status] = useState<"PENDING" | "APPROVED" | "CANCELED">(invoice.status);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCreateDN, setShowCreateDN] = useState(false);
  const [deliveryNotes, setDeliveryNotes] = useState<DeliveryNoteRef[]>(invoice.deliveryNotes);
  useEffect(() => {
    setDeliveryNotes(
      dnList
        .filter(d =>
          (record!.sourceSOId && d.sourceSOId === record!.sourceSOId) ||
          d.sourceInvoiceId === record!.id
        )
        .map(d => ({ id: d.dnNumber || d.id, status: d.status, rep: d.rep, warehouse: d.warehouse, date: d.createdDate }))
    );
  }, [dnList]);
  const [paymentType, setPaymentType] = useState<"full" | "partial">("full");
  const [partialAmount, setPartialAmount] = useState("");
  const [showCreditLimit, setShowCreditLimit] = useState(false);

  const invoiceTotal = parseJOD(record!.total);
  const [paidAmount, setPaidAmount] = useState(() => {
    const bal = parseJOD(record!.balance);
    return Math.max(0, invoiceTotal - bal);
  });

  const [dnedQtys, setDnedQtys] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    invoice.items.forEach(i => { init[i.id] = i.deliveredQty; });
    return init;
  });

  const grandTotal    = invoice.items.reduce((acc, i) => acc + i.total, 0);
  const totalDiscount = invoice.items.reduce((acc, i) => acc + i.discount, 0);
  const taxAmount     = grandTotal * 0.13;
  const netTotal      = grandTotal - taxAmount;

  const remainingBalance = Math.max(0, grandTotal - paidAmount);
  const paymentStatus: "Paid" | "Partially Paid" | "Unpaid" =
    paidAmount >= grandTotal ? "Paid" : paidAmount > 0 ? "Partially Paid" : "Unpaid";

  const handleSavePayment = () => {
    const amount = paymentType === "full" ? grandTotal : parseFloat(partialAmount) || 0;
    if (amount <= 0) return;
    const newPaid = Math.min(grandTotal, paidAmount + amount);
    const newBalance = Math.max(0, grandTotal - newPaid);
    setPaidAmount(newPaid);
    setInvoices(prev => prev.map(inv =>
      inv.id === record!.id
        ? { ...inv, balance: `JOD ${newBalance.toFixed(2)}` }
        : inv
    ));
    setShowPaymentModal(false);
    setPartialAmount("");
    setPaymentType("full");
  };

  const handleConfirmDN = (data: {
    rep: string;
    items: { itemId: string; qty: number; unit: string; warehouse: string }[];
  }) => {
    const warehouses = [...new Set(data.items.map(i => i.warehouse).filter(Boolean))];
    const newDN: DeliveryNoteRef = {
      id: `DN-INV-${Math.floor(Math.random() * 9000 + 1000)}`,
      status: "PENDING",
      rep: data.rep,
      warehouse: warehouses[0] || "",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    };

    // 1. Update local and global DN lists
    setDeliveryNotes(prev => [...prev, newDN]);
    setDnedQtys(prev => {
      const next = { ...prev };
      data.items.forEach(i => { next[i.itemId] = (next[i.itemId] ?? 0) + i.qty; });
      return next;
    });
    setDnList(prev => [{
      id: newDN.id,
      dnNumber: newDN.id,
      status: "PENDING",
      sourceSOId: invoice!.id,
      sourceSONumber: invoice!.serialNo,
      clientName: invoice!.clientName,
      rep: data.rep,
      createdBy: "Admin",
      warehouse: newDN.warehouse,
      items: data.items.length,
      createdDate: new Date().toLocaleDateString("en-GB"),
      itemsData: data.items.map(di => ({
        id: di.itemId,
        name: invoice!.items.find(ii => ii.id === di.itemId)?.name ?? di.itemId,
        sku: invoice!.items.find(ii => ii.id === di.itemId)?.sku ?? "-",
        qty: di.qty,
        unit: di.unit,
        qtyBase: di.qty,
        soQty: invoice!.items.find(ii => ii.id === di.itemId)?.orderedQty ?? di.qty,
        soUnit: di.unit,
        delivered: 0,
        warehouse: di.warehouse,
      }))
    }, ...prev]);

    // Create linked Transfer
    const newTransferId = `TR-${Math.floor(Math.random() * 9000 + 1000)}`;
    setTransferList(prev => [{
      id: newTransferId,
      serialNo: newTransferId,
      createdAt: new Date().toLocaleDateString("en-GB"),
      createdBy: "Admin",
      from: data.items[0]?.warehouse || "-",
      to: `${data.rep} Van Warehouse`,
      type: "LOAD",
      status: "PENDING",
      numberOfProducts: data.items.length,
      sourceDNId: newDN.id,
      sourceDNNumber: newDN.id,
      items: data.items.map(di => ({
        id: di.itemId,
        productId: di.itemId,
        sku: invoice!.items.find(ii => ii.id === di.itemId)?.sku ?? "-",
        productName: invoice!.items.find(ii => ii.id === di.itemId)?.name ?? di.itemId,
        variantName: "-",
        measureUnit: di.unit,
        quantity: di.qty,
        originQty: 0,
        destQty: 0
      })),
    }, ...prev]);

    // 2. Consume Global Reservations
    let updatedReservations = [...reservations];
    let updatedAuditLog = [...reservationAuditLog];
    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    const dateStr = now.toISOString().split("T")[0];

    data.items.forEach(dnItem => {
      let qtyToConsume = dnItem.qty; // For invoice DNs, qty is usually base
      
      const matchingRes = updatedReservations.filter(r => 
        r.itemId === dnItem.itemId && 
        r.warehouse === dnItem.warehouse && 
        (r.sourceInvoiceId === invoice!.id || (record!.sourceSOId && r.sourceSOId === record!.sourceSOId)) &&
        r.status === "ACTIVE"
      );

      matchingRes.forEach(res => {
        if (qtyToConsume <= 0) return;
        const consumed = Math.min(qtyToConsume, res.qtyBase);
        qtyToConsume -= consumed;
        
        updatedReservations = updatedReservations.map(r => {
          if (r.id === res.id) {
            const newQtyBase = r.qtyBase - consumed;
            if (newQtyBase <= 0) return { ...r, qty: 0, qtyBase: 0, status: "REVOKED" as const, linkedDNId: newDN.id, linkedDNNumber: newDN.id };
            const family = getProductFamily(r.itemId);
            const factor = family ? getUnitFactor(r.unit, family) : 1;
            return { ...r, qty: factor > 0 ? newQtyBase / factor : 0, qtyBase: newQtyBase };
          }
          return r;
        });

        updatedAuditLog.push({
          id: `AUDIT-${Date.now()}-${res.id}-CONS`,
          reservationId: res.id,
          itemName: res.itemName,
          sku: invoice!.items.find(i => i.id === res.itemId)?.sku ?? "-",
          qty: consumed,
          unit: res.unit,
          warehouse: res.warehouse ?? "-",
          sourceInvoiceId: invoice!.id,
          sourceInvoiceNumber: invoice!.serialNo,
          linkedDNId: newDN.id,
          linkedDNNumber: newDN.id,
          eventType: "Used in delivery note" as const,
          triggeredBy: "Admin",
          date: dateStr,
          time: timeStr,
          note: `Consumed by delivery note ${newDN.id}`,
          reservationType: res.type,
          status: "REVOKED" as const,
        });
      });
    });
    setReservations(updatedReservations);
    setReservationAuditLog(updatedAuditLog);

    // 3. Update Invoice's own reservedItems list
    setInvoices(prev => prev.map(inv => {
      if (inv.id !== record!.id) return inv;
      if (!inv.reservedItems) return inv;
      return {
        ...inv,
        reservedItems: inv.reservedItems.map(ri => {
          const dnItem = data.items.find(di => di.itemId === ri.itemId && di.warehouse === ri.warehouse);
          if (dnItem) {
            return { ...ri, qty: Math.max(0, ri.qty - dnItem.qty) };
          }
          return ri;
        }).filter(ri => ri.qty > 0)
      };
    }));

    setShowCreateDN(false);
  };

  const reservationItems: DNReservationItem[] = invoice.reservations.map(res => {
    const invoiceItem = invoice.items.find(i => i.id === res.itemId);
    return {
      itemId:      res.itemId,
      itemName:    invoiceItem?.name ?? res.itemName ?? res.itemId,
      sku:         invoiceItem?.sku ?? "",
      unit:        res.unit,
      warehouse:   res.warehouse,
      invoicedQty: invoiceItem?.orderedQty ?? res.reservedQty,
      reservedQty: res.reservedQty,
      dnedQty:     dnedQtys[res.itemId] ?? 0,
    };
  });

  const defaultRep = invoice.reservations[0]?.rep ?? REPS[0];

  const dnCounts = {
    pending:    deliveryNotes.filter(d => d.status === "PENDING").length,
    processing: deliveryNotes.filter(d => d.status === "PROCESSING").length,
    approved:   deliveryNotes.filter(d => d.status === "APPROVED").length,
    canceled:   deliveryNotes.filter(d => d.status === "CANCELED").length,
  };

  // Show DN card unless invoice was created as immediately delivered
  const showDNCard = !invoice.isDelivered;

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden">

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
                {tab.type === "invoice" ? (
                  <FileText className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-[#4f6ef7]" : "text-gray-400"}`} />
                ) : tab.type === "dn" ? (
                  <Truck className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-[#4f6ef7]" : "text-gray-400"}`} />
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

      {activeInnerTab.type === "invoice" ? (
        <>
      {/* ── Top Header ── */}
      <div className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-[#e8e8ec] shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-[#1a1a2e]"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="h-4 w-px bg-[#e8e8ec]" />
          <div className="flex items-center gap-2">
            <h1 className="text-[15px] font-bold text-[#1a1a2e]">{invoice.serialNo}</h1>
            <button className="text-[#d0d0dc] hover:text-[#8b8b9e] transition-colors">
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
          {status === "APPROVED" ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[4px] text-[11px] font-bold bg-[#ecfdf3] text-[#12b76a] border border-[#c3fae8]">
              <CheckCircle2 className="w-3 h-3" /> APPROVED
            </span>
          ) : status === "CANCELED" ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[4px] text-[11px] font-bold bg-[#fff1f0] text-[#e41e3f] border border-[#ffe3e3]">
              <XCircle className="w-3 h-3" /> CANCELED
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-[4px] text-[11px] font-bold bg-[#fcfbd7] text-[#e0a800]">
              PENDING
            </span>
          )}
          {invoice.isDelivered && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[4px] text-[11px] font-bold bg-[#eff6ff] text-[#4f6ef7] border border-[#dbeafe]">
              <Truck className="w-3 h-3" /> DELIVERED
            </span>
          )}
          {paymentStatus === "Paid" ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[4px] text-[11px] font-bold bg-[#ecfdf3] text-[#12b76a] border border-[#c3fae8]">
              <CheckCircle2 className="w-3 h-3" /> PAID
            </span>
          ) : paymentStatus === "Partially Paid" ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[4px] text-[11px] font-bold bg-[#fff7ed] text-[#c2410c] border border-[#fed7aa]">
              <CheckCircle2 className="w-3 h-3" /> PARTIALLY PAID
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-[4px] text-[11px] font-bold bg-[#fff1f0] text-[#e41e3f] border border-[#ffe3e3]">
              UNPAID
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {paymentStatus !== "Paid" && (
            <button
              onClick={() => setShowPaymentModal(true)}
              className="px-4 py-1.5 rounded-md bg-[#a855f7] hover:bg-[#9333ea] text-white text-[13px] font-medium transition-colors shadow-sm"
            >
              Add Payment
            </button>
          )}
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-[#e8e8ec] rounded-md text-[13px] font-medium text-[#4a4a5a] hover:bg-[#f7f7f9] transition-colors">
            <Printer className="w-3.5 h-3.5" /> Print
          </button>
          <button className="p-1.5 border border-[#e8e8ec] rounded-md text-[#4a4a5a] hover:bg-[#f7f7f9] transition-colors">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-auto bg-[#f7f7f9]" style={{ scrollbarWidth: "thin", scrollbarColor: "#d0d0dc #f7f7f9" }}>
        <div className="max-w-[1100px] mx-auto px-6 py-6 space-y-4">

          {/* ── Card 1: Invoice Information ── */}
          <div className="bg-white border border-[#e8e8ec] rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-[#e8e8ec]">
              <h2 className="text-[14px] font-bold text-[#1a1a2e]">Invoice Information</h2>
            </div>
            <div className="px-6 py-5">
              <div className="grid grid-cols-2 gap-x-16 gap-y-3.5">
                {/* Left */}
                <div className="space-y-3.5">
                  <InfoRow label="Serial #"         value={invoice.serialNo} />
                  <InfoRow label="External Serial #" value={invoice.externalSerial || "-"} />
                  <InfoRow label="Advanced Serial #" value={invoice.advancedSerial || "-"} />
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-semibold text-[#8b8b9e] w-40 shrink-0">Source SO:</span>
                    {invoice.sourceSO ? (
                      <button
                        onClick={() => onNavigateToSO && onNavigateToSO(invoice.sourceSOId)}
                        className="text-[13px] font-semibold text-[#4f6ef7] hover:underline flex items-center gap-1"
                      >
                        {invoice.sourceSO}
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    ) : (
                      <span className="text-[13px] text-[#4a4a5a]">-</span>
                    )}
                  </div>
                  <InfoRow label="Client Name"  value={invoice.clientName} bold />
                  <InfoRow label="Created By"   value={invoice.creator} />
                  <InfoRow label="Implemented By" value={invoice.implementedBy || "-"} />
                </div>
                {/* Right */}
                <div className="space-y-3.5">
                  <InfoRow label="Issue Date"  value={invoice.issueDate} />
                  <InfoRow label="Due Date"    value={invoice.dueDate} />
                  <InfoRow label="Created At"  value={invoice.createdAt} />
                  <InfoRow label="Order Status" value={paymentStatus} />
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-semibold text-[#8b8b9e] w-40 shrink-0">Paid:</span>
                    <span className="text-[13px] font-semibold text-[#12b76a]">JOD {paidAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-semibold text-[#8b8b9e] w-40 shrink-0">Credit limit & Balance:</span>
                    <button
                      onClick={() => setShowCreditLimit(v => !v)}
                      className="flex items-center gap-1 text-[13px] font-semibold text-[#4f6ef7] hover:underline"
                    >
                      {showCreditLimit ? "Hide" : "Show"}
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showCreditLimit ? "rotate-180" : ""}`} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-semibold text-[#8b8b9e] w-40 shrink-0">Invoice Balance:</span>
                    <span className={`text-[13px] font-bold ${remainingBalance === 0 ? "text-[#12b76a]" : "text-[#e41e3f]"}`}>
                      JOD {remainingBalance.toFixed(2)}
                    </span>
                  </div>
                  {invoice.comment && (
                    <InfoRow label="Comment" value={invoice.comment} />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Card 2: Delivery Notes (shown for all non-delivered invoices) ── */}
          {showDNCard && (
            <div className="bg-white border border-[#e8e8ec] rounded-xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#e8e8ec]">
                <div className="flex items-center gap-2.5">
                  <Truck className="w-4 h-4 text-[#4f6ef7]" />
                  <span className="text-[14px] font-bold text-[#1a1a2e]">Delivery Notes</span>
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#4f6ef7] text-white text-[10px] font-bold">
                    {deliveryNotes.length}
                  </span>
                  {dnCounts.approved > 0 && (
                    <span className="px-2 py-0.5 rounded-[4px] bg-[#ecfdf3] text-[#12b76a] text-[10px] font-bold border border-[#c3fae8]">
                      {dnCounts.approved} Approved
                    </span>
                  )}
                  {dnCounts.pending > 0 && (
                    <span className="px-2 py-0.5 rounded-[4px] bg-[#fcfbd7] text-[#e0a800] text-[10px] font-bold">
                      {dnCounts.pending} Pending
                    </span>
                  )}
                  {dnCounts.processing > 0 && (
                    <span className="px-2 py-0.5 rounded-[4px] bg-[#eff6ff] text-[#4f6ef7] text-[10px] font-bold">
                      {dnCounts.processing} Processing
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setShowCreateDN(true)}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-[#1a1a2e] hover:bg-[#111827] text-white text-[13px] font-medium transition-colors shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Create Delivery Note
                </button>
              </div>

              {deliveryNotes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-12 h-12 rounded-full bg-[#f7f7f9] flex items-center justify-center mb-3">
                    <Truck className="w-5 h-5 text-[#d0d0dc]" />
                  </div>
                  <p className="text-[13px] font-semibold text-[#4a4a5a]">No delivery notes yet</p>
                  <p className="text-[12px] text-[#8b8b9e] mt-1">Click "Create Delivery Note" to start delivery</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="bg-[#f7f7f9] border-b border-[#e8e8ec]">
                        <th className="text-left text-[11px] font-semibold text-[#8b8b9e] uppercase tracking-wider px-5 py-3">DN Number</th>
                        <th className="text-left text-[11px] font-semibold text-[#8b8b9e] uppercase tracking-wider px-4 py-3">Assigned Rep</th>
                        <th className="text-left text-[11px] font-semibold text-[#8b8b9e] uppercase tracking-wider px-4 py-3">Warehouse</th>
                        <th className="text-left text-[11px] font-semibold text-[#8b8b9e] uppercase tracking-wider px-4 py-3">Date</th>
                        <th className="text-left text-[11px] font-semibold text-[#8b8b9e] uppercase tracking-wider px-5 py-3">Status</th>
                        <th className="px-5 py-3 w-8" />
                      </tr>
                    </thead>
                    <tbody>
                      {deliveryNotes.map(dn => {
                        const s = DN_STATUS_MAP[dn.status] ?? DN_STATUS_MAP["PENDING"];
                        return (
                          <tr
                            key={dn.id}
                            onClick={() => openTab({ type: "dn", id: dn.id, label: dn.id })}
                            className="border-b border-[#f0f0f3] hover:bg-[#f7f7f9] transition-colors cursor-pointer group"
                          >
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
                                <span className="font-bold text-[#4f6ef7] group-hover:underline">{dn.id}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="flex items-center gap-1.5 text-[#4a4a5a]">
                                <User className="w-3.5 h-3.5 text-[#8b8b9e]" /> {dn.rep}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-[#4a4a5a]">
                              {(dn.status === "PROCESSING" || dn.status === "APPROVED") ? `${dn.rep} Van Warehouse` : (dn.warehouse || "-")}
                            </td>
                            <td className="px-4 py-3.5 text-[#8b8b9e] text-[12px]">{dn.date}</td>
                            <td className="px-5 py-3.5">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-bold ${s.bg} ${s.text}`}>
                                {s.label}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <ChevronRight className="w-4 h-4 text-[#d0d0dc] group-hover:text-[#4f6ef7] transition-colors ml-auto" />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── Card 2b: Reservations ── */}
          {(() => {
            const invoiceReservations = reservations.filter(
              r => r.sourceInvoiceId === invoiceId || r.sourceInvoiceId === record!.id
            );
            if (invoiceReservations.length === 0) return null;
            const activeCount = invoiceReservations.filter(r => r.status === "ACTIVE").length;
            return (
              <div className="bg-white border border-[#e8e8ec] rounded-xl shadow-sm overflow-hidden">
                <div className="flex items-center gap-2.5 px-6 py-4 border-b border-[#e8e8ec]">
                  <Bookmark className="w-4 h-4 text-indigo-500" />
                  <span className="text-[14px] font-bold text-[#1a1a2e]">Reservations</span>
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500 text-white text-[10px] font-bold">
                    {invoiceReservations.length}
                  </span>
                  {activeCount > 0 && (
                    <span className="px-2 py-0.5 rounded-[4px] bg-indigo-50 text-indigo-600 text-[10px] font-bold border border-indigo-100">
                      {activeCount} Active
                    </span>
                  )}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="bg-[#f7f7f9] border-b border-[#e8e8ec]">
                        <th className="text-left text-[11px] font-semibold text-[#8b8b9e] uppercase tracking-wider px-5 py-3">Item</th>
                        <th className="text-left text-[11px] font-semibold text-[#8b8b9e] uppercase tracking-wider px-4 py-3">Warehouse</th>
                        <th className="text-right text-[11px] font-semibold text-[#8b8b9e] uppercase tracking-wider px-4 py-3">Reserved Qty</th>
                        <th className="text-left text-[11px] font-semibold text-[#8b8b9e] uppercase tracking-wider px-5 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoiceReservations.map(res => (
                        <tr key={res.id} className="border-b border-[#f0f0f3] hover:bg-[#f7f7f9] transition-colors">
                          <td className="px-5 py-3.5 font-medium text-[#1a1a2e]">{res.itemName}</td>
                          <td className="px-4 py-3.5 text-[#4a4a5a]">{res.warehouse || "-"}</td>
                          <td className="px-4 py-3.5 text-right font-semibold text-[#1a1a2e]">
                            {res.qty} <span className="text-[#8b8b9e] font-normal">{res.unit}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            {res.status === "ACTIVE" ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">Active</span>
                            ) : res.status === "REVOKED" ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-bold bg-[#ecfdf3] text-[#12b76a] border border-[#c3fae8]">Delivered</span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-bold bg-[#fff1f0] text-[#e41e3f] border border-[#ffe3e3]">Canceled</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}

          {/* ── Card 3: Invoice Items ── */}
          <div className="bg-white border border-[#e8e8ec] rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e8e8ec]">
              <h2 className="text-[14px] font-bold text-[#1a1a2e]">Invoice Items</h2>
              <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-[#00c897] hover:bg-[#00b085] text-white text-[13px] font-medium transition-colors shadow-sm">
                <RotateCcw className="w-3.5 h-3.5" /> Return
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-max text-[13px]">
                <thead>
                  <tr className="bg-[#f7f7f9] border-b border-[#e8e8ec]">
                    <th className="text-left px-4 py-3 text-[11px] font-medium text-[#8b8b9e] uppercase tracking-wider">Product Name</th>
                    <th className="text-left px-4 py-3 text-[11px] font-medium text-[#8b8b9e] uppercase tracking-wider">SKU</th>
                    <th className="text-left px-4 py-3 text-[11px] font-medium text-[#8b8b9e] uppercase tracking-wider">Variant</th>
                    <th className="text-left px-4 py-3 text-[11px] font-medium text-[#8b8b9e] uppercase tracking-wider">Unit</th>
                    <th className="text-right px-4 py-3 text-[11px] font-medium text-[#8b8b9e] uppercase tracking-wider">Qty</th>
                    <th className="text-right px-4 py-3 text-[11px] font-medium text-[#8b8b9e] uppercase tracking-wider">Delivered</th>
                    <th className="text-right px-4 py-3 text-[11px] font-medium text-[#8b8b9e] uppercase tracking-wider">Price</th>
                    <th className="text-right px-4 py-3 text-[11px] font-medium text-[#8b8b9e] uppercase tracking-wider">Discount</th>
                    <th className="text-right px-6 py-3 text-[11px] font-medium text-[#8b8b9e] uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map(item => (
                    <tr key={item.id} className="border-b border-[#f0f0f3] hover:bg-[#f7f7f9] transition-colors">
                      <td className="px-4 py-3.5 font-medium text-[#1a1a2e]">{item.name}</td>
                      <td className="px-4 py-3.5 text-[#8b8b9e]">{item.sku}</td>
                      <td className="px-4 py-3.5 text-[#8b8b9e]">{item.variantName || "-"}</td>
                      <td className="px-4 py-3.5 text-[#4a4a5a]">{item.unit}</td>
                      <td className="px-4 py-3.5 text-right font-medium text-[#1a1a2e]">{item.orderedQty}</td>
                      <td className="px-4 py-3.5 text-right">
                        <span className={`text-[12px] font-semibold ${item.deliveredQty >= item.orderedQty ? "text-[#12b76a]" : item.deliveredQty > 0 ? "text-[#e0a800]" : "text-[#8b8b9e]"}`}>
                          {item.deliveredQty}/{item.orderedQty}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right text-[#4a4a5a]">{item.price.toFixed(2)} JOD</td>
                      <td className="px-4 py-3.5 text-right text-[#4a4a5a]">{item.discount.toFixed(2)} JOD</td>
                      <td className="px-6 py-3.5 text-right font-bold text-[#1a1a2e]">{item.total.toFixed(2)} JOD</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="px-6 py-4 bg-[#f7f7f9] border-t border-[#e8e8ec]">
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-[13px]">
                    <span className="text-[#8b8b9e]">Discount</span>
                    <span className="text-[#4a4a5a]">{totalDiscount.toFixed(2)} JOD</span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-[#8b8b9e]">Tax (13%)</span>
                    <span className="text-[#4a4a5a]">{taxAmount.toFixed(2)} JOD</span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-[#4a4a5a] font-medium">Grand Total</span>
                    <span className="text-[#4a4a5a] font-medium">{grandTotal.toFixed(2)} JOD</span>
                  </div>
                  <div className="flex justify-between text-[14px] pt-2 border-t border-[#e8e8ec]">
                    <span className="text-[#1a1a2e] font-bold">Net Total</span>
                    <span className="text-[#1a1a2e] font-bold">{netTotal.toFixed(2)} JOD</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
        </>
      ) : (
        <DeliveryNoteDetailsPage
          dnId={activeInnerTab.id}
          onBack={() => setActiveInnerTab(SELF_TAB)}
          onNavigateToSO={onNavigateToSO}
        />
      )}

      {/* ── Create DN modal (reservation-based) ── */}
      <CreateDNFromReservationModal
        isOpen={showCreateDN}
        onClose={() => setShowCreateDN(false)}
        onConfirm={handleConfirmDN}
        invoiceId={invoice.id}
        defaultRep={defaultRep}
        reps={REPS}
        reservationItems={reservationItems}
      />

      {/* ── Add Payment modal ── */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none shadow-2xl">
          <div className="px-6 py-4 border-b border-[#e8e8ec] flex items-center justify-between">
            <DialogTitle className="text-[16px] font-bold text-[#1a1a2e]">Add a new payment</DialogTitle>
            <span className="text-[12px] font-semibold text-[#8b8b9e]">
              Balance: <span className="text-[#e41e3f]">JOD {remainingBalance.toFixed(2)}</span>
            </span>
          </div>
          <div className="p-6 flex gap-6">
            <div className="flex-1 space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="radio" name="paymentType" checked={paymentType === "full"} onChange={() => setPaymentType("full")} className="accent-[#a855f7] w-4 h-4" />
                <span className="text-[13px] font-semibold text-[#1a1a2e]">Full Payment ({remainingBalance.toFixed(2)} JOD remaining)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="radio" name="paymentType" checked={paymentType === "partial"} onChange={() => setPaymentType("partial")} className="accent-[#a855f7] w-4 h-4" />
                <span className="text-[13px] font-semibold text-[#1a1a2e]">Partial Payment</span>
              </label>
              {paymentType === "partial" && (
                <div className="pl-7">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] font-semibold text-[#8b8b9e]">JOD</span>
                    <input
                      type="number" min={0} max={grandTotal} placeholder="0.00"
                      value={partialAmount} onChange={e => setPartialAmount(e.target.value)}
                      className="w-full pl-12 pr-3 py-2 border border-[#e8e8ec] rounded-md text-[13px] font-semibold text-[#1a1a2e] outline-none focus:border-[#a855f7] transition-colors"
                    />
                  </div>
                </div>
              )}
              <button className="flex items-center gap-2 px-3 py-2 rounded-md border-2 border-[#e8e8ec] text-[#4a4a5a] text-[12px] font-semibold hover:bg-[#f7f7f9] transition-colors">
                <Paperclip className="w-3.5 h-3.5" /> Attach Media
              </button>
            </div>
            <div className="w-[160px] shrink-0">
              <p className="text-[12px] font-semibold text-[#4a4a5a] mb-2">Custom Status:</p>
              <input
                type="text" placeholder="Custom Status"
                className="w-full px-3 py-2 border border-[#e8e8ec] rounded-md text-[12px] text-[#4a4a5a] outline-none focus:border-[#a855f7] transition-colors placeholder:text-[#d0d0dc]"
              />
            </div>
          </div>
          <div className="px-6 py-4 bg-[#f7f7f9] border-t border-[#e8e8ec] flex justify-end gap-3">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="px-4 py-2 border border-[#e8e8ec] rounded-md text-[13px] font-medium text-[#4a4a5a] hover:bg-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSavePayment}
              disabled={paymentType === "partial" && !partialAmount}
              className="px-6 py-2 rounded-md text-[13px] font-semibold bg-[#a855f7] hover:bg-[#9333ea] text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InfoRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[12px] font-semibold text-[#8b8b9e] w-40 shrink-0">{label}:</span>
      <span className={`text-[13px] ${bold ? "font-bold text-[#1a1a2e]" : "text-[#4a4a5a]"}`}>{value}</span>
    </div>
  );
}
