import React, { useState, useEffect } from "react";
import { getProductFamily, getBaseUnit, toBase } from "./measurementUnits";
import { useAppData, type DeliveryNote, type ReturnTransfer, type Reservation, type InvoiceRecord, type DNRecord, type SalesOrderRecord, type ReservationAuditEntry, type SOAuditEntry } from "../../context/AppDataContext";
import { 
  Copy,
  Pencil,
  Paperclip,
  Printer,
  ChevronDown,
  Settings,
  Box,
  Eye,
  Truck,
  FileText,
  ClipboardList,
  ExternalLink,
  ArrowLeftRight,
  Info,
  Clock,
  ArrowRight,
  AlertCircle,
  Calendar as CalendarIcon,
  X,
  Check,
  User,
  AlertTriangle,
  CheckCircle,
  CheckCircle2,
  Bookmark,
  History as HistoryIcon,
  Trash2,
  RotateCcw,
  Package
} from "lucide-react";
import { ConvertInvoiceModal } from "./ConvertInvoiceModal";
import { CreateDeliveryNoteModal } from "./CreateDeliveryNoteModal";
import { ReservationDetailsModal } from "./ReservationDetailsModal";
import { CreateReservationModal } from "./CreateReservationModal";
import { DeliveryNotePrintModal } from "./DeliveryNotePrintModal";
import { ApproveOrderModal } from "./ApproveOrderModal";
import { DNDetailsModal } from "./DNDetailsModal";
import { DeliveryNoteDetailsPage } from "./DeliveryNoteDetailsPage";
import { InvoiceDetailsPage } from "./InvoiceDetailsPage";
import { SOHistoryModal } from "./SOHistoryModal";
import { Badge } from "../ui/badge";

interface SalesOrderDetailsProps {
  orderId: string | null;
  onBack?: () => void;
  onNavigateToDeliveryNotes?: () => void;
  onNavigateToDN?: (dnId: string) => void;
  onNavigateToInvoice?: (invoiceId: string) => void;
  onNavigateToTransfer?: (transferId: string) => void;
}


const REP_VAN_WAREHOUSES: Record<string, string> = {
  "Ahmad Alshaikh":   "Local Maram Van Warehouse",
  "REP khaled":       "Khald Warehouse",
  "REP Ahmad Abudre": "Van مستودع الكوم",
};

export function SalesOrderDetails({ orderId, onBack, onNavigateToDeliveryNotes, onNavigateToDN, onNavigateToInvoice, onNavigateToTransfer }: SalesOrderDetailsProps) {
  const {
    orderItems, setOrderItems,
    deliveryNotes, setDeliveryNotes,
    returnTransfers, setReturnTransfers,
    reservations, setReservations,
    soStatus: status, setSoStatus: setStatus,
    approvalStep, setApprovalStep,
    cycle, setCycle,
    paymentStatus, setPaymentStatus,
    salesOrders, setSalesOrders,
    setInvoices,
    dnList, setDnList,
    transferList,
    setReservationAuditLog,
    allowSOApprovalWithoutStock,
    soAuditLog, setSOAuditLog,
  } = useAppData();

  const soRecord = salesOrders.find(s => s.id === orderId || s.orderNo === orderId);
  const soId = soRecord?.id ?? orderId ?? "";
  const soReservations = reservations.filter(r => r.sourceSOId === soId);

  useEffect(() => {
    if (soRecord) {
      if (soRecord.itemsData) {
        setOrderItems(soRecord.itemsData);
      }
      setStatus(soRecord.status.toUpperCase());
      if (soRecord.linkedInvoiceId) {
        setLinkedInvoiceId(soRecord.linkedInvoiceId);
      }
    }
  }, [orderId, soRecord, setOrderItems, setStatus]);

  // Keep local deliveryNotes in sync with global dnList so external changes
  // (e.g. transfer approval updating dnList) are reflected here immediately
  useEffect(() => {
    const soDns = dnList
      .filter(d => d.sourceSOId === soId)
      .map(d => ({
        id: d.id,
        rep: d.rep,
        warehouse: d.warehouse,
        status: d.status,
        adminTransfer: (d.adminTransfer === "DONE" ? "DONE" : "NONE") as "DONE" | "NONE",
        repTransfer: (d.repTransfer === "CONFIRMED" ? "CONFIRMED" : "NONE") as "CONFIRMED" | "NONE",
        date: d.createdDate,
        items: (d.itemsData ?? []).map(item => ({
          id: item.id,
          qty: item.qty,
          unit: item.unit,
          qtyBase: item.qtyBase,
          warehouse: item.warehouse,
        })),
        cancelReason: d.cancelReason,
      } as DeliveryNote));
    setDeliveryNotes(soDns);
  }, [soId, dnList]);

  // UI-only state (not persisted, fine to reset on navigation)
  const [showStocks, setShowStocks] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [isDNModalOpen, setIsDNModalOpen] = useState(false);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [isCreateResModalOpen, setIsCreateResModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [linkedInvoiceId, setLinkedInvoiceId] = useState<string | null>(null);
  const [selectedDNForPrint, setSelectedDNForPrint] = useState<DeliveryNote | null>(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isDNDetailsOpen, setIsDNDetailsOpen] = useState(false);
  const [dnPage, setDnPage] = useState(0);
  const DN_PAGE_SIZE = 3;
  const [selectedDNForDetails, setSelectedDNForDetails] = useState<DeliveryNote | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Inner tab system — SO, DN, Invoice tabs within the same screen
  type InnerTab = { type: "so" | "dn" | "invoice"; id: string; label: string };
  const SO_TAB: InnerTab = { type: "so", id: "so", label: "SO" };
  const [innerTabs, setInnerTabs] = useState<InnerTab[]>([SO_TAB]);
  const [activeInnerTab, setActiveInnerTab] = useState<InnerTab>(SO_TAB);

  // Reset tabs when SO changes
  useEffect(() => { setInnerTabs([SO_TAB]); setActiveInnerTab(SO_TAB); }, [orderId]);

  const updateSoGlobal = (updates: Partial<SalesOrderRecord>) => {
    setSalesOrders(prev => prev.map(so => (so.id === orderId || so.orderNo === orderId) ? { ...so, ...updates } : so));
  };

  const addSOAudit = (entry: Omit<SOAuditEntry, "id" | "soId" | "timestamp" | "date">) => {
    const now = Date.now();
    setSOAuditLog(prev => [...prev, {
      ...entry,
      id: `SOA-${now}`,
      soId: soId,
      timestamp: now,
      date: new Date().toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }),
    }]);
  };

  const openTab = (tab: InnerTab) => {
    setInnerTabs(prev => prev.some(t => t.id === tab.id) ? prev : [...prev, tab]);
    setActiveInnerTab(tab);
  };
  const closeTab = (id: string) => {
    const wasActive = activeInnerTab.id === id;
    setInnerTabs(prev => prev.filter(t => t.id !== id));
    if (wasActive) setActiveInnerTab(SO_TAB);
  };

  const handleApprove = () => {
    if (approvalStep === 0) {
      setApprovalStep(1);
      addSOAudit({ action: "approved_1st", by: "Admin" });
    } else {
      addSOAudit({ action: "approved_2nd", by: "Admin" });
      if (allowSOApprovalWithoutStock) {
        setStatus("APPROVED");
        updateSoGlobal({ status: "approved" });
        addSOAudit({ action: "approved", by: "Admin" });
      }
      setIsApproveModalOpen(true);
    }
  };

  const handleConfirmApproval = (autoReserve: boolean, warehouse: string, hasShortage: boolean) => {
    // If strict mode is ON and there is a shortage, DO NOT approve.
    if (!allowSOApprovalWithoutStock && hasShortage) {
      addSOAudit({ 
        action: "rejected", 
        by: "Admin", 
        note: `SO not approved: Stock shortage in ${warehouse || "selected warehouse"}` 
      });
      // We stay at approvalStep 1 (2nd node) and status PENDING
      setIsApproveModalOpen(false);
      return;
    }

    if (!allowSOApprovalWithoutStock) {
      setStatus("APPROVED");
      updateSoGlobal({ status: "approved" });
      addSOAudit({ action: "approved", by: "Admin" });
    }
    
    if (autoReserve && warehouse) {
      const newReservations: Reservation[] = orderItems
        .filter(item => {
          const family = getProductFamily(item.id);
          const totalBase = family ? toBase(item.totalQty, item.unit, family) : item.totalQty;
          return totalBase - item.deliveredQty - item.notedQty > 0;
        })
        .map((item, idx) => {
          const family = getProductFamily(item.id);
          const totalBase = family ? toBase(item.totalQty, item.unit, family) : item.totalQty;
          const qtyBase = totalBase - item.deliveredQty - item.notedQty;
          return {
            id: `RES-AUTO-${idx}-${Math.floor(Math.random() * 1000)}`,
            itemId: item.id,
            itemName: item.name,
            qty: item.totalQty,
            unit: item.unit,
            qtyBase,
            warehouse,
            status: "ACTIVE" as const,
            date: new Date().toLocaleDateString(),
            type: "AUTO" as const,
            sourceSOId: soId,
          };
        });
      setReservations(prev => [...prev, ...newReservations]);
      addSOAudit({ action: "reservation_created", by: "Admin", note: `Stock-reserved from ${warehouse}` });
      const nowApprove = new Date();
      const approveDate = nowApprove.toISOString().split("T")[0];
      const approveTime = nowApprove.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
      setReservationAuditLog(prev => [
        ...newReservations.map(res => ({
          id: `AUDIT-${Date.now()}-${res.id}`,
          reservationId: res.id,
          itemName: res.itemName,
          sku: orderItems.find(o => o.id === res.itemId)?.sku ?? "-",
          qty: res.qty,
          unit: res.unit,
          warehouse: res.warehouse ?? "-",
          sourceSOId: soId || undefined,
          sourceSONumber: soRecord?.orderNo,
          eventType: "Created" as const,
          triggeredBy: "Admin",
          date: approveDate,
          time: approveTime,
        })),
        ...prev,
      ]);
    }
    setIsApproveModalOpen(false);
  };

  const handleReject = () => {
    setStatus("REJECTED");
    updateSoGlobal({ status: "rejected" });
    setCycle(prev => prev + 1);
    setApprovalStep(0);
    addSOAudit({ action: "rejected", by: "Admin" });
  };

  const onConfirmConversion = (data: any) => {
    const newInvoiceId = `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`;
    setLinkedInvoiceId(newInvoiceId);
    setStatus("INVOICED");
    setPaymentStatus(data.paymentStatus || "UNPAID");

    const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    const total = orderItems.reduce((sum, i) => sum + i.price * i.totalQty, 0);
    let balance = total;
    if (data.paymentStatus === "PAID") balance = 0;
    else if (data.paymentStatus === "PARTIAL") balance = total / 2;

    const newInvoice: InvoiceRecord = {
      id: newInvoiceId,
      serialNo: newInvoiceId,
      externalSerial: "-",
      issueDate: new Date().toLocaleDateString("en-GB"),
      creator: data.rep || "Admin",
      clientName: soRecord?.clientName ?? "-",
      items: orderItems.length,
      total: `JOD ${total.toFixed(2)}`,
      balance: `JOD ${balance.toFixed(2)}`,
      paymentType: data.paymentStatus === "UNPAID" ? "Credit" : "Cash",
      status: "PENDING",
      delivery: data.markAsDelivered ? "Delivered" : "No DN",
      comment: "",
      sourceSOId: soId || undefined,
      reservedItems: data.reservations,
    };
    setInvoices(prev => [newInvoice, ...prev]);

    if (soRecord) {
      updateSoGlobal({ status: "invoiced", linkedInvoiceId: newInvoiceId });
    }

    const newReservations = (data.reservations as { itemId: string; itemName: string; qty: number; unit: string; warehouse: string }[])
      .map((r, idx) => ({
        id: `RES-INV-${newInvoiceId}-${r.itemId}-${idx}`,
        itemId: r.itemId,
        itemName: r.itemName,
        qty: r.qty,
        unit: r.unit,
        qtyBase: r.qty,
        warehouse: r.warehouse,
        status: "ACTIVE" as const,
        date: today,
        type: "AUTO" as const,
      }));
    setReservations(prev => [...prev, ...newReservations]);
    if (newReservations.length > 0) {
      const nowConv = new Date();
      const convDate = nowConv.toISOString().split("T")[0];
      const convTime = nowConv.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
      setReservationAuditLog(prev => [
        ...newReservations.map(res => ({
          id: `AUDIT-${Date.now()}-${res.id}`,
          reservationId: res.id,
          itemName: res.itemName,
          sku: orderItems.find(o => o.id === res.itemId)?.sku ?? "-",
          qty: res.qty,
          unit: res.unit,
          warehouse: res.warehouse ?? "-",
          sourceSOId: soId || undefined,
          sourceSONumber: soRecord?.orderNo,
          sourceInvoiceId: newInvoiceId,
          sourceInvoiceNumber: newInvoiceId,
          eventType: "Created" as const,
          triggeredBy: "Admin",
          date: convDate,
          time: convTime,
        })),
        ...prev,
      ]);
    }

    setIsConvertModalOpen(false);
    addSOAudit({ action: "converted_to_invoice", by: "Admin", linkedId: newInvoiceId, linkedLabel: newInvoiceId });

    openTab({ type: "invoice", id: newInvoiceId, label: newInvoiceId });
  };
  const handleCreateDN = (data: { 
    rep: string; 
    items: { id: string; qty: number; unit: string; qtyBase: number; warehouse: string }[];
    isManual: boolean;
  }, navigateAfterCreate: boolean) => {
    if (!soRecord) return;

    // Create the DN record
    const newDN: DeliveryNote = {
      id: `DN-${Math.floor(Math.random() * 9000 + 1000)}`,
      status: "PENDING",
      rep: data.rep,
      adminTransfer: "NONE",
      repTransfer: "NONE",
      date: new Date().toLocaleDateString("en-GB"),
      items: data.items,
      isManual: data.isManual,
    };

    setDeliveryNotes(prev => [newDN, ...prev]);
    setDnList(prev => [{
      id: newDN.id,
      dnNumber: newDN.id,
      status: "PENDING",
      sourceSOId: soId,
      clientName: soRecord.clientName,
      rep: data.rep,
      createdBy: "Admin",
      warehouse: data.items[0]?.warehouse || "-",
      items: data.items.length,
      createdDate: new Date().toLocaleDateString("en-GB"),
      isManual: data.isManual,
      itemsData: data.items.map(di => ({
        id: di.id,
        name: orderItems.find(o => o.id === di.id)?.name ?? di.id,
        sku: orderItems.find(o => o.id === di.id)?.sku ?? "-",
        qty: di.qty,
        unit: di.unit,
        qtyBase: di.qtyBase,
        delivered: 0,
        warehouse: di.warehouse,
      }))
    }, ...prev]);

    // Aggregate noted qty by itemId
    setOrderItems(prev => prev.map(item => {
      const totalQtyBase = data.items
        .filter(di => di.id === item.id)
        .reduce((sum, di) => sum + di.qtyBase, 0);
      if (totalQtyBase > 0) {
        return { ...item, notedQty: item.notedQty + totalQtyBase };
      }
      return item;
    }));

    // Process Reservations
    let updatedReservations = [...reservations];
    let updatedAuditLog = [...reservationAuditLog];
    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    const dateStr = now.toISOString().split("T")[0];

    data.items.forEach(dnItem => {
      let qtyToConsume = dnItem.qtyBase;
      
      // 1. Find matching ACTIVE reservations for this item/warehouse/SO
      const matchingRes = updatedReservations.filter(r => 
        r.itemId === dnItem.id && 
        r.warehouse === dnItem.warehouse && 
        r.sourceSOId === soId && 
        r.status === "ACTIVE"
      );

      if (data.isManual) {
        // STRICT RULE: If manual DN is created, lock the entire matching active reservation(s)
        matchingRes.forEach(res => {
          updatedReservations = updatedReservations.map(r => {
            if (r.id === res.id) {
              return { ...r, status: "CONSUMED" as const, linkedDNId: newDN.id, linkedDNNumber: newDN.id };
            }
            return r;
          });

          updatedAuditLog.push({
            id: `AUDIT-${Date.now()}-${res.id}-CONS`,
            reservationId: res.id,
            itemName: res.itemName,
            sku: orderItems.find(o => o.id === res.itemId)?.sku ?? "-",
            qty: res.qty,
            unit: res.unit,
            warehouse: res.warehouse ?? "-",
            sourceSOId: soId || undefined,
            sourceSONumber: soRecord?.orderNo,
            linkedDNId: newDN.id,
            linkedDNNumber: newDN.id,
            eventType: "Used in DN" as const,
            triggeredBy: "Admin",
            date: dateStr,
            time: timeStr,
            note: `Locked by manual DN ${newDN.id} (Manual entry started)`
          });
        });
      } else {
        // Normal From-Reservation consumption
        matchingRes.forEach(res => {
          if (qtyToConsume <= 0) return;
          const consumed = Math.min(qtyToConsume, res.qtyBase);
          qtyToConsume -= consumed;
          
          updatedReservations = updatedReservations.map(r => {
            if (r.id === res.id) {
              const newQtyBase = r.qtyBase - consumed;
              if (newQtyBase <= 0) {
                return { ...r, qty: 0, qtyBase: 0, status: "CONSUMED" as const, linkedDNId: newDN.id, linkedDNNumber: newDN.id };
              } else {
                const family = getProductFamily(r.itemId);
                const factor = family ? getUnitFactor(r.unit, family) : 1;
                return { ...r, qty: factor > 0 ? newQtyBase / factor : 0, qtyBase: newQtyBase };
              }
            }
            return r;
          });

          updatedAuditLog.push({
            id: `AUDIT-${Date.now()}-${res.id}-CONS`,
            reservationId: res.id,
            itemName: res.itemName,
            sku: orderItems.find(o => o.id === res.itemId)?.sku ?? "-",
            qty: consumed,
            unit: res.unit,
            warehouse: res.warehouse ?? "-",
            sourceSOId: soId || undefined,
            sourceSONumber: soRecord?.orderNo,
            linkedDNId: newDN.id,
            linkedDNNumber: newDN.id,
            eventType: "Used in DN" as const,
            triggeredBy: "Admin",
            date: dateStr,
            time: timeStr,
            note: `Consumed by DN ${newDN.id}`
          });
        });
      }

      // 2. If it was manual and NO reservation existed, or if there's remaining qty after consumption
      const consumedBase = matchingRes.reduce((sum, r) => sum + r.qtyBase, 0);
      const neededNewRes = data.isManual ? Math.max(0, dnItem.qtyBase - consumedBase) : qtyToConsume;

      if (neededNewRes > 0) {
        const oi = orderItems.find(o => o.id === dnItem.id);
        const family = getProductFamily(dnItem.id);
        const factor = family ? getUnitFactor(dnItem.unit, family) : 1;
        const newRes: Reservation = {
          id: `RES-DN-AUTO-${newDN.id}-${dnItem.id}-${Math.floor(Math.random()*1000)}`,
          itemId: dnItem.id,
          itemName: oi?.name ?? dnItem.id,
          qty: factor > 0 ? neededNewRes / factor : 0,
          unit: dnItem.unit,
          qtyBase: neededNewRes,
          warehouse: dnItem.warehouse,
          status: "CONSUMED" as const,
          date: now.toLocaleDateString(),
          type: "AUTO" as const,
          sourceSOId: soId || undefined,
          linkedDNId: newDN.id,
          linkedDNNumber: newDN.id,
        };
        updatedReservations.push(newRes);
        
        updatedAuditLog.push({
          id: `AUDIT-${Date.now()}-${newRes.id}`,
          reservationId: newRes.id,
          itemName: newRes.itemName,
          sku: oi?.sku ?? "-",
          qty: newRes.qty,
          unit: newRes.unit,
          warehouse: newRes.warehouse ?? "-",
          sourceSOId: soId || undefined,
          sourceSONumber: soRecord?.orderNo,
          linkedDNId: newDN.id,
          linkedDNNumber: newDN.id,
          eventType: "Created" as const,
          triggeredBy: "Admin",
          date: dateStr,
          time: timeStr,
        });
      }
    });

    setReservations(updatedReservations);
    setReservationAuditLog(updatedAuditLog);

    // Persist notedQty to global salesOrders so the limit survives navigation
    setSalesOrders(prev => prev.map(so => {
      if (so.id !== soId) return so;
      return {
        ...so,
        itemsData: (so.itemsData ?? []).map(item => {
          const addedBase = data.items
            .filter(di => di.id === item.id)
            .reduce((sum, di) => sum + di.qtyBase, 0);
          return addedBase > 0 ? { ...item, notedQty: item.notedQty + addedBase } : item;
        }),
      };
    }));

    setIsDNModalOpen(false);
    addSOAudit({ action: "dn_created", by: "Admin", linkedId: newDN.id, linkedLabel: newDN.id, note: `Rep: ${data.rep}` });

    if (navigateAfterCreate) {
      openTab({ type: "dn", id: newDN.id, label: newDN.id });
    }

    // Sync global SO status
    updateSoGlobal({
      deliveryStatus: getDeliveryStatus()
    });
  };

  const handleDNAdminTransfer = (dn: DeliveryNote) => {
    const bothDone = dn.repTransfer === "CONFIRMED";
    setDeliveryNotes(prev => prev.map(d => {
      if (d.id !== dn.id) return d;
      return { ...d, adminTransfer: "DONE" as const, status: bothDone ? "PROCESSING" as const : d.status };
    }));
    if (bothDone) setDnList(prev => prev.map(d => d.id === dn.id ? { ...d, status: "PROCESSING" as const, adminTransfer: "DONE" } : d));
    if (bothDone) {
      const vanWh = REP_VAN_WAREHOUSES[dn.rep] ?? "Rep Van";
      setReservations(prev => prev.map(r =>
        dn.items.some(i => i.id === r.itemId) && r.status === "ACTIVE" ? { ...r, warehouse: vanWh } : r
      ));
    }
  };

  const handleDNRepTransfer = (dn: DeliveryNote) => {
    const bothDone = dn.adminTransfer === "DONE";
    setDeliveryNotes(prev => prev.map(d => {
      if (d.id !== dn.id) return d;
      return { ...d, repTransfer: "CONFIRMED" as const, status: bothDone ? "PROCESSING" as const : d.status };
    }));
    if (bothDone) {
      const vanWh = REP_VAN_WAREHOUSES[dn.rep] ?? "Rep Van";
      setReservations(prev => prev.map(r =>
        dn.items.some(i => i.id === r.itemId) && r.status === "ACTIVE" ? { ...r, warehouse: vanWh } : r
      ));
    }
  };

  const handleDNConfirmDelivery = (dn: DeliveryNote) => {
    setDeliveryNotes(prev => prev.map(d => d.id === dn.id ? { ...d, status: "APPROVED" as const } : d));
    setDnList(prev => prev.map(d => d.id === dn.id ? { ...d, status: "APPROVED" as const } : d));
    setOrderItems(prev => prev.map(item => {
      const dnItem = dn.items.find(i => i.id === item.id);
      if (!dnItem) return item;
      const delta = dnItem.qtyBase ?? dnItem.qty;
      return { ...item, deliveredQty: item.deliveredQty + delta, notedQty: Math.max(0, item.notedQty - delta) };
    }));
    // Persist deliveredQty + notedQty to global salesOrders so values survive navigation
    setSalesOrders(prev => prev.map(so => {
      if (so.id !== soId) return so;
      return {
        ...so,
        itemsData: (so.itemsData ?? []).map(item => {
          const dnItem = dn.items.find(i => i.id === item.id);
          if (!dnItem) return item;
          const delta = dnItem.qtyBase ?? dnItem.qty;
          return { ...item, deliveredQty: item.deliveredQty + delta, notedQty: Math.max(0, item.notedQty - delta) };
        }),
      };
    }));
    updateSoGlobal({ deliveryStatus: getDeliveryStatus() });
    addSOAudit({ action: "dn_delivered", by: "Admin", linkedId: dn.id, linkedLabel: dn.id });
  };

  const handleDNCancel = (dn: DeliveryNote) => {
    const reason = dn.status === "PROCESSING" ? "Rejected by Representative" : "Canceled";
    setDeliveryNotes(prev => prev.map(d => d.id === dn.id ? { ...d, status: "CANCELED" as const, cancelReason: reason } : d));
    setDnList(prev => prev.map(d => d.id === dn.id ? { ...d, status: "CANCELED" as const, cancelReason: reason } : d));
    setOrderItems(prev => prev.map(item => {
      const dnItem = dn.items.find(i => i.id === item.id);
      if (!dnItem) return item;
      return { ...item, notedQty: Math.max(0, item.notedQty - (dnItem.qtyBase ?? dnItem.qty)) };
    }));
    setSalesOrders(prev => prev.map(so => {
      if (so.id !== soId) return so;
      return {
        ...so,
        itemsData: (so.itemsData ?? []).map(item => {
          const dnItem = dn.items.find(i => i.id === item.id);
          if (!dnItem) return item;
          const delta = dnItem.qtyBase ?? dnItem.qty;
          return { ...item, notedQty: Math.max(0, item.notedQty - delta) };
        }),
      };
    }));

    // Restore CONSUMED reservations back to ACTIVE
    setReservations(prev => prev.map(r => {
      if (r.linkedDNId === dn.id && r.status === "CONSUMED") {
        return { ...r, status: "ACTIVE" as const, linkedDNId: undefined, linkedDNNumber: undefined };
      }
      return r;
    }));

    addSOAudit({ action: "dn_canceled", by: "Admin", linkedId: dn.id, linkedLabel: dn.id });
    if (dn.status === "PROCESSING") {
      const newRT: ReturnTransfer = {
        id: `RT-${String(returnTransfers.length + 1).padStart(3, "0")}`,
        relatedDnId: dn.id,
        rep: dn.rep,
        warehouse: dn.items[0]?.warehouse,
        items: dn.items,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        repReturn: "NONE",
        adminReturn: "NONE",
        status: "PENDING",
      };
      setReturnTransfers(prev => [...prev, newRT]);
      addSOAudit({ action: "return_transfer_created", by: "Admin", linkedId: newRT.id, linkedLabel: newRT.id });
    }
  };

  const handleRevokeReservation = (id: string, reason?: string) => {
    const target = reservations.find(r => r.id === id);
    setReservations(prev => prev.map(r =>
      r.id === id ? { ...r, status: "REVOKED" } : r
    ));
    addSOAudit({ action: "reservation_revoked", by: "Admin", linkedId: id, linkedLabel: id });
    if (target) {
      const now = new Date();
      const oi = orderItems.find(o => o.id === target.itemId);
      setReservationAuditLog(prev => [{
        id: `AUDIT-${Date.now()}-${id}`,
        reservationId: id,
        itemName: target.itemName,
        sku: oi?.sku ?? "-",
        qty: target.qty,
        unit: target.unit,
        warehouse: target.warehouse ?? "-",
        sourceSOId: soId || undefined,
        sourceSONumber: soRecord?.orderNo,
        eventType: "Manually Deleted" as const,
        triggeredBy: "Admin",
        date: now.toISOString().split("T")[0],
        time: now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      }, ...prev]);
    }
  };

  const handleCreateFreeReservation = () => {
    setIsCreateResModalOpen(true);
  };

  const handleConfirmManualReservation = (newResLines: { itemId: string; itemName: string; qty: number; unit: string; qtyBase: number; warehouse: string }[]) => {
    const newReservations: Reservation[] = newResLines.map((line, idx) => ({
      id: `RES-MANUAL-${idx}-${Math.floor(Math.random() * 1000)}`,
      itemId: line.itemId,
      itemName: line.itemName,
      qty: line.qty,
      unit: line.unit,
      qtyBase: line.qtyBase,
      status: "ACTIVE" as const,
      date: new Date().toLocaleDateString(),
      warehouse: line.warehouse,
      type: "MANUAL" as const,
      sourceSOId: soId,
    }));
    setReservations(prev => [...prev, ...newReservations]);
    setIsCreateResModalOpen(false);
    setIsReservationModalOpen(true);
    addSOAudit({ action: "reservation_created", by: "Admin", note: `${newResLines.length} item(s) reserved manually` });
    const nowManual = new Date();
    const manualDate = nowManual.toISOString().split("T")[0];
    const manualTime = nowManual.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    setReservationAuditLog(prev => [
      ...newReservations.map(res => ({
        id: `AUDIT-${Date.now()}-${res.id}`,
        reservationId: res.id,
        itemName: res.itemName,
        sku: orderItems.find(o => o.id === res.itemId)?.sku ?? "-",
        qty: res.qty,
        unit: res.unit,
        warehouse: res.warehouse ?? "-",
        sourceSOId: soId || undefined,
        sourceSONumber: soRecord?.orderNo,
        eventType: "Created" as const,
        triggeredBy: "Admin",
        date: manualDate,
        time: manualTime,
      })),
      ...prev,
    ]);
  };
  const handleRepReturn = (rtId: string) => {
    const rt = returnTransfers.find(r => r.id === rtId);
    if (!rt || rt.status === "CONFIRMED" || rt.repReturn === "CONFIRMED") return;

    const bothConfirmed = rt.adminReturn === "CONFIRMED";
    setReturnTransfers(prev => prev.map(r => {
      if (r.id !== rtId) return r;
      const updated = { ...r, repReturn: "CONFIRMED" as const };
      return bothConfirmed ? { ...updated, status: "CONFIRMED" as const } : updated;
    }));
    if (bothConfirmed) {
      setOrderItems(prev => prev.map(item => {
        const rtItem = rt.items.find(ri => ri.id === item.id);
        if (rtItem) return { ...item, notedQty: Math.max(0, item.notedQty - rtItem.qtyBase) };
        return item;
      }));
      setSalesOrders(prev => prev.map(so => {
        if (so.id !== soId) return so;
        return {
          ...so,
          itemsData: (so.itemsData ?? []).map(item => {
            const rtItem = rt.items.find(ri => ri.id === item.id);
            if (!rtItem) return item;
            return { ...item, notedQty: Math.max(0, item.notedQty - rtItem.qtyBase) };
          }),
        };
      }));
    }
  };

  const handleAdminReturn = (rtId: string) => {
    const rt = returnTransfers.find(r => r.id === rtId);
    if (!rt || rt.status === "CONFIRMED" || rt.adminReturn === "CONFIRMED") return;

    const bothConfirmed = rt.repReturn === "CONFIRMED";
    setReturnTransfers(prev => prev.map(r => {
      if (r.id !== rtId) return r;
      const updated = { ...r, adminReturn: "CONFIRMED" as const };
      return bothConfirmed ? { ...updated, status: "CONFIRMED" as const } : updated;
    }));
    if (bothConfirmed) {
      setOrderItems(prev => prev.map(item => {
        const rtItem = rt.items.find(ri => ri.id === item.id);
        if (rtItem) return { ...item, notedQty: Math.max(0, item.notedQty - rtItem.qtyBase) };
        return item;
      }));
      setSalesOrders(prev => prev.map(so => {
        if (so.id !== soId) return so;
        return {
          ...so,
          itemsData: (so.itemsData ?? []).map(item => {
            const rtItem = rt.items.find(ri => ri.id === item.id);
            if (!rtItem) return item;
            return { ...item, notedQty: Math.max(0, item.notedQty - rtItem.qtyBase) };
          }),
        };
      }));
    }
  };

  const warehouses = [
    "Mohammad test", "Dream Warehouse", "Maram", "Van مستودع الكوم", "مستودع الكوم الرئيسي",
    "Zarqaa Warehouse", "Khald Warehouse", "Main Branch", "ismaeil", "new 11", "Local Maram Van Warehouse",
  ];

  // Derive notedQty / deliveredQty directly from live deliveryNotes so they
  // always reflect the actual DN states, including seed DNs and external updates
  const dnNotedQty = React.useMemo<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    deliveryNotes
      .filter(dn => dn.status === "PENDING" || dn.status === "PROCESSING")
      .forEach(dn => dn.items.forEach(i => {
        map[i.id] = (map[i.id] ?? 0) + (i.qtyBase ?? i.qty);
      }));
    return map;
  }, [deliveryNotes]);

  const dnDeliveredQty = React.useMemo<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    deliveryNotes
      .filter(dn => dn.status === "APPROVED")
      .forEach(dn => dn.items.forEach(i => {
        map[i.id] = (map[i.id] ?? 0) + (i.qtyBase ?? i.qty);
      }));
    return map;
  }, [deliveryNotes]);

  const getDeliveryStatus = () => {
    const totalOrdered = orderItems.reduce((acc, curr) => acc + curr.totalQty, 0);
    const totalDelivered = orderItems.reduce((acc, curr) => acc + (dnDeliveredQty[curr.id] ?? 0), 0);
    if (totalDelivered >= totalOrdered && totalOrdered > 0) return "Delivered";
    if (totalDelivered > 0) return "Partially Delivered";
    return "Undelivered";
  };

  const deliveryStatus = getDeliveryStatus();
  const hasActiveDNs = deliveryNotes.some(dn => dn.status === "PENDING" || dn.status === "PROCESSING");
  const allItemsDelivered = orderItems.every(item => item.totalQty - (dnDeliveredQty[item.id] ?? 0) <= 0);
  const soIsApproved = soRecord?.status === "approved" || (soRecord?.status as string) === "invoiced";
  const showDNButton = soRecord?.status === "approved" && !allItemsDelivered;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#fbfbfe] overflow-hidden">

      {/* Inner tab bar — visible once any DN or Invoice tab is opened */}
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
                {tab.type === "so"      && <ClipboardList className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-[#4f6ef7]" : "text-gray-400"}`} />}
                {tab.type === "dn"      && <Truck          className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-[#4f6ef7]" : "text-gray-400"}`} />}
                {tab.type === "invoice" && <FileText       className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-[#4f6ef7]" : "text-gray-400"}`} />}

                <span className="text-[12px] font-medium truncate">
                  {tab.type === "so" ? (soRecord?.orderNo || orderId || "SO") : tab.label}
                </span>

                {tab.type !== "so" && (
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

      {activeInnerTab.type === "so" ? (
        <>
        {/* Top Application Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#e8e8ec] shrink-0">
        <div className="flex items-center gap-3">
          {onBack && <button onClick={onBack} className="text-[#a0a0b0] hover:text-[#4a4a5a] text-[13px] mr-2">← Back</button>}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-[20px] font-semibold text-[#1a1a2e]">{soRecord?.orderNo || orderId || "PRO-1734-89"}</h1>
              <button className="text-[#b0b0be] hover:text-[#4a4a5a]"><Copy className="w-4 h-4 text-gray-400" /></button>
              
              {status === "APPROVED" && soReservations.filter(r => r.status === "ACTIVE").length > 0 && (
                <button 
                  onClick={() => setIsReservationModalOpen(true)}
                  className="flex items-center gap-1.5 px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md border border-indigo-100 text-[11px] font-bold hover:bg-indigo-100 transition-colors ml-2"
                >
                  <Bookmark className="w-3 h-3" />
                  {soReservations.filter(r => r.status === "ACTIVE").length} items reserved
                </button>
              )}
            </div>
            {deliveryNotes.length > 0 && (
              <span className="text-[11px] text-[#4f6ef7] font-medium flex items-center gap-1">
                <Truck className="w-3 h-3" /> {deliveryNotes.length} Linked Delivery Notes
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-5 text-[#4a4a5a]">
          <button className="flex items-center gap-1.5 text-[13px] font-medium hover:text-[#1a1a2e]"><Pencil className="w-3.5 h-3.5" /> Edit</button>
          <button className="text-[#4a4a5a] hover:text-[#1a1a2e]"><Paperclip className="w-4 h-4" /></button>
          <button className="flex items-center gap-1.5 text-[13px] font-medium hover:text-[#1a1a2e]"><Printer className="w-3.5 h-3.5" /> PDF/Print <ChevronDown className="w-3 h-3" /></button>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 text-[13px] font-medium hover:text-[#1a1a2e]">Create <ChevronDown className="w-3 h-3" /></button>
          </div>
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-1.5 text-[13px] font-medium hover:text-[#1a1a2e] text-[#4a4a5a]"
          >
            <HistoryIcon className="w-3.5 h-3.5" /> History
          </button>
          <button className="text-[#4a4a5a] hover:text-[#1a1a2e]"><Settings className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 bg-[#f9fafb]">
        <div className="max-w-[1200px] mx-auto space-y-6">
        
          {/* Approval Cycle Card */}
          <div className="bg-white border border-gray-200 rounded-[8px] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <h2 className="text-[12px] font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
                  <HistoryIcon className="w-3.5 h-3.5 text-gray-400" />
                  Approval Cycle{cycle > 1 ? ` — Cycle ${cycle}` : ""}
                </h2>
                {status === "PENDING" && (
                  <span className="text-[11px] text-amber-600 font-semibold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                    Awaiting {approvalStep === 0 ? "1st" : "2nd"} Approval
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {status === "PENDING" && (
                  <>
                    <button onClick={handleReject} className="flex items-center gap-1.5 text-white px-3 py-1.5 rounded-[4px] text-[12px] font-medium transition-all hover:opacity-90 active:scale-95 bg-[#e41e3f]"><X className="w-3.5 h-3.5" /> Reject</button>
                    <button onClick={handleApprove} className="flex items-center gap-1.5 text-white px-3 py-1.5 rounded-[4px] text-[12px] font-medium transition-all hover:opacity-90 active:scale-95 bg-[#12b76a]"><Check className="w-3.5 h-3.5" /> Approve</button>
                  </>
                )}
                {showDNButton && (
                  <button onClick={() => setIsDNModalOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-[12px] font-medium transition-all active:scale-95 text-[#4f6ef7] bg-[#f0f4ff] hover:bg-[#e0e7ff] border border-[#d0d7ff]"><Truck className="w-3.5 h-3.5" /> Create Delivery Note</button>
                )}
                {status === "APPROVED" && (
                  <button onClick={() => setIsConvertModalOpen(true)} className="flex items-center gap-1.5 text-white px-3 py-1.5 rounded-[4px] text-[12px] font-medium transition-all hover:bg-[#111827] shadow-lg active:scale-95 bg-[#1a1a2e]"><Box className="w-3.5 h-3.5 text-gray-300" /> Convert to Invoice</button>
                )}
                {status === "INVOICED" && linkedInvoiceId && (
                  <button
                    onClick={() => openTab({ type: "invoice", id: linkedInvoiceId, label: linkedInvoiceId })}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-[12px] font-semibold transition-all hover:bg-indigo-100 active:scale-95 bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm"
                  >
                    <Box className="w-3.5 h-3.5" /> View Invoice
                  </button>
                )}
              </div>
            </div>

            {/* Node stepper — 3 steps: 1st Approval → 2nd Approval → Approved */}
            <div className="flex items-center gap-0 px-2">
              {([
                { key: "step0", label: "1st Approval" },
                { key: "step1", label: "2nd Approval" },
                { key: "approved", label: "Approved" },
              ] as const).map(({ key, label }, index) => {
                // Determine step state
                const isFullyApproved = status === "APPROVED" || status === "INVOICED";
                const isCompleted =
                  index === 0 ? (approvalStep >= 1 || isFullyApproved) :
                  index === 1 ? isFullyApproved :
                  isFullyApproved;
                const isActive =
                  index === 0 ? (approvalStep === 0 && status === "PENDING") :
                  index === 1 ? (approvalStep === 1 && status === "PENDING") :
                  status === "APPROVED";
                // Line after this node is green if node is completed
                const lineGreen =
                  index === 0 ? (approvalStep >= 1 || isFullyApproved) :
                  index === 1 ? isFullyApproved :
                  false;

                const circleClass = isCompleted
                  ? "w-8 h-8 rounded-full bg-[#12b76a] flex items-center justify-center text-white shadow-sm"
                  : isActive
                  ? "w-8 h-8 rounded-full bg-[#12b76a] flex items-center justify-center text-white shadow-md ring-4 ring-green-100"
                  : "w-8 h-8 rounded-full border-2 border-gray-200 bg-white flex items-center justify-center";

                const labelClass = isActive
                  ? "text-[11px] font-bold text-green-700 mt-2 text-center whitespace-nowrap"
                  : isCompleted
                  ? "text-[11px] font-semibold text-green-500 mt-2 text-center whitespace-nowrap"
                  : "text-[11px] font-medium text-gray-400 mt-2 text-center whitespace-nowrap";

                return (
                  <React.Fragment key={key}>
                    <div className="flex flex-col items-center">
                      <div className={circleClass}>
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <span className="text-[10px] font-bold text-gray-400">{index + 1}</span>
                        )}
                      </div>
                      <span className={labelClass}>{label}</span>
                    </div>
                    {index < 2 && (
                      <div className={`flex-1 h-0.5 mx-1 mb-4 ${lineGreen ? "bg-[#12b76a]" : "bg-gray-200"}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Two-column: DETAILS + DELIVERY NOTES */}
          <div className="flex gap-6 items-stretch">
          {/* ── DETAILS card ── */}
          <div className="flex-1 min-w-0 bg-white border border-gray-200 rounded-[8px] shadow-sm">
              <div className="p-5 pb-4 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h2 className="text-[12px] font-bold text-[#111827] uppercase tracking-wide">DETAILS</h2>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase ${status === "INVOICED" ? "bg-indigo-50 text-indigo-700 border border-indigo-100" : "bg-gray-100 text-gray-400 border border-gray-200"}`}>
                      {status === "INVOICED" ? "Invoiced" : "Not Invoiced"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-[12px] text-gray-500">Sales Order# {soRecord?.orderNo || orderId || "PRO-1734-89"}</p>
                    {status === "APPROVED" && (
                      <button
                        onClick={handleCreateFreeReservation}
                        className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 transition-colors ml-2"
                      >
                        + Reserve Manually
                      </button>
                    )}
                    {status === "APPROVED" && (
                      <button
                        onClick={() => setIsReservationModalOpen(true)}
                        className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-indigo-600 font-bold bg-gray-50 hover:bg-indigo-50 px-1.5 py-0.5 rounded border border-gray-200 hover:border-indigo-100 transition-colors ml-1"
                      >
                        <HistoryIcon className="w-3 h-3" /> Reservation History
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="p-5 pt-6 grid grid-cols-2 gap-8">
                <div>
                  <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4">STATUS</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[11px] text-gray-500 mb-1">Order</p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-semibold uppercase shadow-sm transition-all" style={{ backgroundColor: status === "REJECTED" ? '#fee2e2' : status === "APPROVED" || status === "INVOICED" ? '#dcfce7' : '#fef0c7', color: status === "REJECTED" ? '#991b1b' : status === "APPROVED" || status === "INVOICED" ? '#166534' : '#dc6803' }}>
                        {status === "INVOICED" ? "Approved" : status}
                      </span>
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-500 mb-1">Delivery</p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-semibold uppercase ${
                        deliveryStatus === "Delivered" ? "bg-green-50 text-green-700" :
                        deliveryStatus === "Partially Delivered" ? "bg-amber-50 text-amber-700" :
                        "bg-gray-50 text-gray-400"
                      }`}>
                        {deliveryStatus}
                      </span>
                    </div>
                    {paymentStatus !== null && (
                      <div>
                        <p className="text-[11px] text-gray-500 mb-1">Payment</p>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-semibold uppercase ${paymentStatus === "PAID" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                            {paymentStatus}
                          </span>
                          {paymentStatus === "UNPAID" && (
                            <button onClick={() => { setPaymentStatus("PAID"); addSOAudit({ action: "payment_marked_paid", by: "Admin" }); }} className="text-[10px] text-green-600 font-bold hover:underline">Mark Paid</button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4">DETAILS</h3>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                      <p className="text-[11px] text-gray-500 mb-1">Client</p>
                      <p className="text-[13px] font-semibold text-gray-900 leading-tight">{soRecord?.clientName || "test 666 11717"}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-500 mb-1">Order Date</p>
                      <p className="text-[12px] font-semibold text-gray-900">{soRecord?.issueDate || "Apr 7, 2026"}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-500 mb-1">Created By</p>
                      <div className="flex items-center gap-2">
                        <p className="text-[12px] font-semibold text-gray-900">{soRecord?.creator || "Ahmad Alshaikh"}</p>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[10px] font-medium bg-gray-100 text-gray-600 border border-gray-200">Rep</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-500 mb-1">Comment</p>
                      <p className="text-[12px] font-semibold italic text-gray-500">"5555"</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          {/* ── DELIVERY NOTES card ── */}
          {(() => {
            const totalDnPages = Math.ceil(deliveryNotes.length / DN_PAGE_SIZE);
            const pagedDNs = deliveryNotes.slice(dnPage * DN_PAGE_SIZE, (dnPage + 1) * DN_PAGE_SIZE);
            return (
          <div className="w-[480px] shrink-0 bg-white border border-gray-200 rounded-[8px] shadow-sm flex flex-col">
            {/* DN header */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2 shrink-0">
              <h2 className="text-[11px] font-bold text-[#111827] uppercase tracking-wide">Delivery Notes</h2>
              <Badge className="bg-[#4f6ef7] text-white rounded-full h-5 w-5 p-0 flex items-center justify-center text-[10px]">{deliveryNotes.length}</Badge>
              {returnTransfers.filter(r => r.status === "PENDING").length > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-200">
                  {returnTransfers.filter(r => r.status === "PENDING").length} return{returnTransfers.filter(r => r.status === "PENDING").length > 1 ? "s" : ""}
                </span>
              )}
            </div>
            {/* DN list */}
            <div className="flex flex-col divide-y divide-gray-100">

              {/* Return Transfer rows */}
              {returnTransfers.map(rt => (
                <div key={rt.id} className="px-4 py-2.5 hover:bg-orange-50/40 transition-colors">
                  {/* Line 1: icon + ID + related DN + status badge */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <RotateCcw className="w-3 h-3 text-orange-400 shrink-0" />
                    <span className="text-[12px] font-bold text-orange-700">{rt.id}</span>
                    <span className="text-[10px] text-orange-400 font-medium">↩ {rt.relatedDnId}</span>
                    <span className="text-[10px] text-gray-400 ml-1">{rt.date}</span>
                    <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full border ${rt.status === "CONFIRMED" ? "bg-green-50 text-green-700 border-green-200" : "bg-orange-50 text-orange-700 border-orange-200"}`}>
                      {rt.status === "CONFIRMED" ? "Returned" : "Return Pending"}
                    </span>
                  </div>
                  {/* Line 2: rep + warehouse + action buttons */}
                  <div className="flex items-center gap-2 pl-5">
                    <span className="flex items-center gap-1 text-[11px] text-gray-500"><User className="w-3 h-3 text-gray-400 shrink-0" />{rt.rep}</span>
                    {rt.warehouse && <span className="flex items-center gap-1 text-[11px] text-gray-500"><Box className="w-3 h-3 text-gray-400 shrink-0" />{rt.warehouse}</span>}
                    {rt.status === "PENDING" && (
                      <div className="flex items-center gap-1.5 ml-auto">
                        {rt.repReturn !== "CONFIRMED"
                          ? <button onClick={() => handleRepReturn(rt.id)}
                              className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-[4px] border border-orange-300 text-orange-700 bg-white hover:bg-orange-50 transition-all active:scale-95">
                              <Truck className="w-3 h-3" /> Rep Return
                            </button>
                          : <span className="flex items-center gap-1 text-[11px] font-semibold text-green-600"><CheckCircle2 className="w-3.5 h-3.5" /> Rep</span>
                        }
                        {rt.adminReturn !== "CONFIRMED"
                          ? <button onClick={() => handleAdminReturn(rt.id)}
                              className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-[4px] border border-orange-300 text-orange-700 bg-white hover:bg-orange-50 transition-all active:scale-95">
                              <Package className="w-3 h-3" /> Admin Return
                            </button>
                          : <span className="flex items-center gap-1 text-[11px] font-semibold text-green-600"><CheckCircle2 className="w-3.5 h-3.5" /> Admin</span>
                        }
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* DN rows */}
              {pagedDNs.map(dn => {
                const s = dn.status === "APPROVED" ? { dot: "bg-green-400", badge: "bg-green-50 text-green-700 border-green-200",   label: "Delivered" }
                  : dn.status === "CANCELED"  ? { dot: "bg-red-400",   badge: "bg-red-50 text-red-700 border-red-200",       label: "Canceled" }
                  : dn.status === "PROCESSING"? { dot: "bg-blue-400",  badge: "bg-blue-50 text-blue-700 border-blue-200",     label: "Noted for Delivery" }
                  :                             { dot: "bg-amber-400", badge: "bg-amber-50 text-amber-700 border-amber-200",  label: "Waiting for Transfer" };
                const relatedTransfer = transferList.find(t => t.sourceDNId === dn.id);
                return (
                  <div key={dn.id}
                    onClick={() => openTab({ type: "dn", id: dn.id, label: dn.id })}
                    className="px-4 py-2.5 hover:bg-[#f5f7ff] transition-colors cursor-pointer group"
                  >
                    {/* Line 1: dot + ID + date/cancel reason + status badge + print */}
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
                      <span className="text-[12px] font-bold text-gray-900 group-hover:text-[#4f6ef7] transition-colors">{dn.id}</span>
                      {dn.cancelReason
                        ? <span className="text-[10px] text-red-500 font-medium truncate max-w-[200px]" title={dn.cancelReason}>{dn.cancelReason}</span>
                        : <span className="flex items-center gap-1 text-[11px] text-gray-400"><Clock className="w-3 h-3 shrink-0" />{dn.date}</span>
                      }
                      <div className="ml-auto flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${s.badge}`}>{s.label}</span>
                        <button onClick={(e) => { e.stopPropagation(); setSelectedDNForPrint(dn); setIsPrintModalOpen(true); }}
                          className="p-1 text-gray-300 hover:text-[#4f6ef7] rounded transition-colors" title="Print">
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    {/* Line 2: rep + warehouse + transfer link */}
                    <div className="flex items-center gap-2 pl-3.5">
                      <span className="flex items-center gap-1 text-[11px] text-gray-500 shrink-0"><User className="w-3 h-3 text-gray-400 shrink-0" />{dn.rep}</span>
                      {(() => {
                        const whs = [...new Set(dn.items.map(i => i.warehouse).filter(Boolean))];
                        const label = whs.length === 1 ? whs[0] : whs.length > 1 ? `${whs.length} warehouses` : dn.warehouse ?? null;
                        return label ? <span className="flex items-center gap-1 text-[11px] text-gray-500 shrink-0"><Box className="w-3 h-3 text-gray-400 shrink-0" />{label}</span> : null;
                      })()}
                      {relatedTransfer && onNavigateToTransfer && (
                        <button
                          onClick={e => { e.stopPropagation(); onNavigateToTransfer(relatedTransfer.id); }}
                          className="flex items-center gap-1 text-[10px] font-semibold text-[#4f6ef7] hover:underline ml-auto"
                        >
                          <ArrowLeftRight className="w-3 h-3" />{relatedTransfer.serialNo}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {deliveryNotes.length === 0 && returnTransfers.length === 0 && (
                <div className="flex flex-col items-center justify-center text-center py-8">
                  <Truck className="w-7 h-7 text-gray-300 mb-1.5" />
                  <p className="text-[11px] text-gray-400 font-medium">No delivery notes created yet.</p>
                </div>
              )}
            </div>

            {/* Pagination footer */}
            {totalDnPages > 1 && (
              <div className="px-4 py-2.5 border-t border-gray-100 flex items-center justify-between shrink-0">
                <button
                  onClick={() => setDnPage(p => Math.max(0, p - 1))}
                  disabled={dnPage === 0}
                  className="text-[11px] font-semibold text-gray-500 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-2 py-1 rounded hover:bg-gray-100"
                >
                  ← Prev
                </button>
                <span className="text-[11px] text-gray-400 font-medium">
                  {dnPage + 1} / {totalDnPages}
                </span>
                <button
                  onClick={() => setDnPage(p => Math.min(totalDnPages - 1, p + 1))}
                  disabled={dnPage === totalDnPages - 1}
                  className="text-[11px] font-semibold text-gray-500 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-2 py-1 rounded hover:bg-gray-100"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
            );
          })()}
          </div>

          {/* ORDER ITEMS Card */}
          <div className="bg-white border border-gray-200 rounded-[8px] shadow-sm mb-8">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <h2 className="text-[14px] font-bold text-[#111827] uppercase">ORDER ITEMS</h2>
                {hasActiveDNs && (
                  <div className="flex items-center gap-1 text-[11px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                    <Info className="w-3 h-3" />
                    <span>Quantities are locked while delivery is pending</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <button onClick={() => setShowStocks(!showStocks)} className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-md transition-colors border ${showStocks ? "bg-[#111827] text-white border-[#111827]" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"}`}><Box className="w-3.5 h-3.5" /> Show Stocks</button>
                {showStocks && (
                  <select value={selectedWarehouse} onChange={(e) => setSelectedWarehouse(e.target.value)} className="border border-gray-200 text-gray-700 text-[12px] rounded-md px-2 py-1.5 bg-white cursor-pointer outline-none">
                    <option value="" disabled>Select Warehouse</option>
                    {warehouses.map((wh, idx) => (<option key={idx} value={wh}>{wh}</option>))}
                  </select>
                )}
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-gray-700 bg-white border border-transparent hover:bg-gray-50 rounded-md"><Eye className="w-4 h-4 text-gray-500" /> Columns</button>
              </div>
            </div>

            <div className="w-full overflow-hidden border-b border-gray-100">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider w-[32%]">Item</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">Unit</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">Total Qty</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">Free</th>
                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-center bg-indigo-50 text-indigo-500">Noted for Del.</th>
                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-center bg-green-50 text-green-600">Delivered</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Unit Price</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {orderItems.map(item => {
                    const family = getProductFamily(item.id);
                    const baseUnit = family ? getBaseUnit(family) : null;
                    const totalBase = family ? toBase(item.totalQty, item.unit, family) : item.totalQty;
                    const notedQty = dnNotedQty[item.id] ?? 0;
                    const deliveredQty = dnDeliveredQty[item.id] ?? 0;
                    const reservedQtyBase = soReservations
                      .filter(r => r.itemId === item.id && r.status === "ACTIVE")
                      .reduce((sum, r) => sum + r.qtyBase, 0);
                    const freeBase = Math.max(0, totalBase - notedQty - deliveredQty - reservedQtyBase);
                    const baseLabel = baseUnit ? baseUnit.name : item.unit;
                    return (
                      <tr key={item.id} className="hover:bg-gray-50/50 border-b border-gray-50 last:border-0 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-[13px] font-bold text-gray-900">{item.name}</p>
                            {soReservations.some(r => r.itemId === item.id && r.status === "ACTIVE") && (
                              <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100">
                                Reserved
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-400 font-medium">{item.sku}</p>
                        </td>
                        <td className="px-5 py-4 text-center"><p className="text-[12px] text-gray-500">{item.unit}</p></td>
                        <td className="px-5 py-4 text-center"><p className="text-[13px] font-bold text-gray-900">{item.totalQty}</p></td>
                        <td className="px-5 py-4 text-center">
                          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-green-50 text-green-700 border border-green-100">
                            {freeBase} {baseLabel}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center bg-indigo-50/40">
                          <span className={`text-[13px] font-bold ${notedQty > 0 ? "text-indigo-600" : "text-indigo-200"}`}>
                            {notedQty}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center bg-green-50/40">
                          <span className={`text-[13px] font-bold ${deliveredQty > 0 ? "text-green-600" : "text-green-200"}`}>
                            {deliveredQty}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right"><p className="text-[13px] font-semibold text-gray-700">JOD {item.price.toFixed(2)}</p></td>
                        <td className="px-5 py-4 text-right">
                          <p className="text-[13px] font-bold text-gray-900">JOD {(item.price * item.totalQty).toFixed(2)}</p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-start p-5 bg-white">
              <div className="text-[12px] text-gray-500 mt-2">Total in Words: <span className="font-semibold text-gray-900 ml-1">Four JOD Only</span></div>
              <div className="w-80 flex flex-col space-y-2">
                <div className="flex justify-between items-center text-[12px]"><span className="text-gray-500">Discount Amount</span><span className="text-gray-600">JOD 0.00</span></div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-100"><span className="text-[13px] font-bold text-gray-900">Grand Total</span><span className="text-[14px] font-bold text-gray-900">JOD {(orderItems.reduce((acc, itm) => acc + itm.totalQty * itm.price, 0)).toFixed(2)}</span></div>
                <div className="flex justify-between items-center text-[12px] pt-1"><span className="text-gray-500">Tax Amount</span><span className="text-gray-600">JOD 0.55</span></div>
                <div className="flex justify-between items-center text-[12px]"><span className="text-gray-500">Net Total</span><span className="text-gray-600">JOD 4.00</span></div>
              </div>
            </div>
          </div>

        </div>
      </div>
      </>
      ) : activeInnerTab.type === "dn" ? (
        <DeliveryNoteDetailsPage
          dnId={activeInnerTab.id}
          onBack={() => setActiveInnerTab(SO_TAB)}
          onNavigateToSO={() => setActiveInnerTab(SO_TAB)}
          onNavigateToTransfer={onNavigateToTransfer}
        />
      ) : (
        <InvoiceDetailsPage
          invoiceId={activeInnerTab.id}
          onBack={() => setActiveInnerTab(SO_TAB)}
          onNavigateToSO={() => setActiveInnerTab(SO_TAB)}
          onNavigateToDN={(dnId) => openTab({ type: "dn", id: dnId, label: dnId })}
        />
      )}

      <ConvertInvoiceModal
        isOpen={isConvertModalOpen}
        onClose={() => setIsConvertModalOpen(false)}
        onConfirm={onConfirmConversion}
        orderId={orderId || "PRO-1734-89"}
        warehouses={warehouses}
        reservations={soReservations}
        items={orderItems}
        soCreatedBy="Ahmad Alshaikh"
      />

      <CreateDeliveryNoteModal
        isOpen={isDNModalOpen}
        onClose={() => setIsDNModalOpen(false)}
        onConfirm={handleCreateDN}
        orderId={orderId || "PRO-1734-89"}
        items={orderItems}
        reps={["Ahmad Alshaikh", "REP khaled", "REP Ahmad Abudre"]}
        warehouses={warehouses}
        reservations={soReservations}
        soCreatedBy="Ahmad Alshaikh"
        forceReservationTab={status === "INVOICED" && soReservations.some(r => r.status === "ACTIVE" && r.warehouse)}
        manualDnItemIds={new Set(
          dnList
            .filter(dn => dn.sourceSOId === soId && dn.isManual && dn.status !== "CANCELED")
            .flatMap(dn => dn.itemsData?.map(i => i.id) || [])
        )}
      />

      <ReservationDetailsModal
        isOpen={isReservationModalOpen}
        onClose={() => setIsReservationModalOpen(false)}
        reservations={soReservations}
        onRevoke={handleRevokeReservation}
      />

      <CreateReservationModal
        isOpen={isCreateResModalOpen}
        onClose={() => setIsCreateResModalOpen(false)}
        onConfirm={handleConfirmManualReservation}
        orderItems={orderItems}
        warehouses={warehouses}
        hideLinkTabs={true}
      />

      <ApproveOrderModal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        onConfirm={handleConfirmApproval}
        warehouses={warehouses}
        orderItems={orderItems}
        requireFullStock={!allowSOApprovalWithoutStock}
      />

      <DNDetailsModal
        isOpen={isDNDetailsOpen}
        onClose={() => { setIsDNDetailsOpen(false); setSelectedDNForDetails(null); }}
        dn={selectedDNForDetails}
        orderItems={orderItems}
        orderId={orderId || "PRO-1734-89"}
      />

      <DeliveryNotePrintModal
        isOpen={isPrintModalOpen}
        onClose={() => { setIsPrintModalOpen(false); setSelectedDNForPrint(null); }}
        dn={selectedDNForPrint}
        orderItems={orderItems}
        orderId={orderId || "PRO-1734-89"}
        clientName="test 666 11717"
      />

      <SOHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        entries={soAuditLog.filter(e => e.soId === soId)}
        soNumber={soRecord?.orderNo || orderId || ""}
        soCreator={soRecord?.creator || "Admin"}
        soCreatedDate={soRecord?.issueDate || ""}
      />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f7f7f9; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #d0d0dc; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #b0b0be; }
      `}</style>
    </div>
  );
}
