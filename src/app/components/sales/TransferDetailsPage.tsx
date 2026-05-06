import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Package,
  Warehouse,
  User,
  Calendar,
  MessageSquare,
  ArrowLeftRight,
  Printer,
  Edit3,
  ExternalLink,
  X,
  Truck,
} from "lucide-react";
import { useAppData } from "../../context/AppDataContext";
import type { TransferRecord, TransferStatus } from "../../context/AppDataContext";
import { Badge } from "../ui/badge";
import { DeliveryNoteDetailsPage } from "./DeliveryNoteDetailsPage";

interface TransferDetailsPageProps {
  transferId: string | null;
  onBack: () => void;
  onNavigateToDN?: (dnId: string) => void;
  onNavigateToUnload?: (unloadId: string) => void;
  onNavigateToPNDetails?: (pnId: string) => void;
}

const STATUS_COLORS: Record<TransferStatus, { bg: string; text: string; border: string }> = {
  PENDING:   { bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200" },
  COMPLETED: { bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200" },
  CANCELED:  { bg: "bg-red-50",    text: "text-red-600",    border: "border-red-200"   },
};

const steps: TransferStatus[] = ["PENDING", "COMPLETED"];

function DetailField({
  icon, label, value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium uppercase tracking-wide">
        {icon} {label}
      </div>
      <span className="text-[13px] font-semibold text-gray-800">{value || "—"}</span>
    </div>
  );
}

export function TransferDetailsPage({ transferId, onBack, onNavigateToUnload, onNavigateToPNDetails }: TransferDetailsPageProps) {
  const { 
    transferList, setTransferList, 
    setDnList, dnList,
    reservations, setReservations,
    setReservationAuditLog,
    setInvoices
  } = useAppData();

  const initial = transferList.find(t => t.id === transferId);
  const [record, setRecord] = useState<TransferRecord | null>(initial ?? null);

  const SELF_TYPE = "transfer";
  const selfId = transferId ?? "transfer";
  const selfLabel = record?.serialNo ?? transferId ?? "Transfer";
  type InnerTab = { type: string; id: string; label: string };
  const SELF_TAB: InnerTab = { type: SELF_TYPE, id: selfId, label: selfLabel };
  const [innerTabs, setInnerTabs] = useState<InnerTab[]>([SELF_TAB]);
  const [activeInnerTab, setActiveInnerTab] = useState<InnerTab>(SELF_TAB);
  useEffect(() => {
    const selfTab = { type: SELF_TYPE, id: selfId, label: selfLabel };
    const tabs = [selfTab];
    
    // If there are source DNs, add them as tabs
    if (record?.sourceDNId) {
      const ids = record.sourceDNId.split(",").map(id => id.trim());
      const numbers = (record.sourceDNNumber || "").split(",").map(n => n.trim());
      
      ids.forEach((id, index) => {
        if (id) {
          tabs.push({ 
            type: "dn", 
            id: id, 
            label: numbers[index] || id 
          });
        }
      });
    }
    
    setInnerTabs(tabs);
    setActiveInnerTab(selfTab);
  }, [transferId, record?.sourceDNId]);

  const openTab = (tab: InnerTab) => {
    setInnerTabs(prev => prev.some(t => t.id === tab.id) ? prev : [...prev, tab]);
    setActiveInnerTab(tab);
  };
  const closeTab = (id: string) => {
    const wasActive = activeInnerTab.id === id;
    setInnerTabs(prev => prev.filter(t => t.id !== id));
    if (wasActive) setActiveInnerTab(SELF_TAB);
  };

  if (!record) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f5f5f7]">
        <p className="text-[13px] text-gray-400">Transfer not found.</p>
      </div>
    );
  }

  const updateRecord = (patch: Partial<TransferRecord>) => {
    setRecord(prev => {
      if (!prev) return null;
      const next = { ...prev, ...patch };
      setTransferList(list => list.map(t => t.id === record.id ? { ...t, ...patch } : t));
      return next;
    });
  };

  const handleApprove = () => {
    const now = new Date();
    const nowStr = now.toLocaleString("en-US", {
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hour12: false,
    });
    const dateStr = now.toISOString().split("T")[0];
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    updateRecord({ status: "COMPLETED", processTime: nowStr });

    // 1. Update DN status if linked
    if (record.sourceDNId) {
      const ids = record.sourceDNId.split(",").map(id => id.trim());
      setDnList(prev => prev.map(d =>
        ids.includes(d.id)
          ? { ...d, adminTransfer: "DONE" as const, repTransfer: "CONFIRMED" as const, status: "PROCESSING" as const }
          : d
      ));
    }

    // 2. Update Reservations and Audit Log
    // We look for reservations that match the items in this transfer
    // and are linked to the same source (SO/Invoice) as the source DN
    const linkedDN = dnList.find(d => d.id === record.sourceDNId);
    const sourceSOId = linkedDN?.sourceSOId;
    const sourceInvoiceId = linkedDN?.sourceInvoiceId;

    const newAuditEntries: any[] = [];
    
    setReservations(prev => prev.map(res => {
      const isMatchingItem = record.items.some(ti => ti.productId === res.itemId);
      const isFromSameWarehouse = res.warehouse === record.from;
      const isLinkedToSource = 
        (sourceSOId && (res.sourceSOId === sourceSOId || res.sourceInvoiceId === sourceSOId)) ||
        (sourceInvoiceId && (res.sourceSOId === sourceInvoiceId || res.sourceInvoiceId === sourceInvoiceId));

      if (isMatchingItem && isFromSameWarehouse && isLinkedToSource) {
        newAuditEntries.push({
          id: `AUDIT-${Math.floor(Math.random() * 10000)}`,
          reservationId: res.id,
          itemName: res.itemName,
          sku: record.items.find(ti => ti.productId === res.itemId)?.sku || "—",
          qty: res.qty,
          unit: res.unit,
          warehouse: record.to,
          sourceSOId: res.sourceSOId,
          sourceSONumber: res.sourceSOId,
          sourceInvoiceId: res.sourceInvoiceId,
          sourceInvoiceNumber: res.sourceInvoiceId,
          eventType: "Warehouse Transfer",
          triggeredBy: "ADMIN Ayah Al-Ori",
          date: dateStr,
          time: timeStr,
          note: `Transferred from ${record.from} to ${record.to} via ${record.serialNo}`,
        });
        return { ...res, warehouse: record.to };
      }
      return res;
    }));

    // 3. Update Invoices (reservedItems)
    setInvoices(prev => prev.map(inv => {
      const isLinkedToThisTransfer = 
        (sourceInvoiceId && inv.id === sourceInvoiceId) ||
        (sourceSOId && inv.sourceSOId === sourceSOId);
      
      if (isLinkedToThisTransfer && inv.reservedItems) {
        return {
          ...inv,
          reservedItems: inv.reservedItems.map(ri => {
            const isMatchingItem = record.items.some(ti => ti.productId === ri.itemId);
            if (isMatchingItem && ri.warehouse === record.from) {
              return { ...ri, warehouse: record.to };
            }
            return ri;
          })
        };
      }
      return inv;
    }));

    if (newAuditEntries.length > 0) {
      setReservationAuditLog(prev => [...newAuditEntries, ...prev]);
    }
  };

  const handleCancel = () => updateRecord({ status: "CANCELED" });

  const statusColors = STATUS_COLORS[record.status];
  const isPending = record.status === "PENDING";
  const isCompleted = record.status === "COMPLETED";
  const isCanceled = record.status === "CANCELED";

  const activeStepIndex = isCanceled ? -1 : steps.indexOf(record.status);

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#f5f5f7]">

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
                {tab.type === "transfer" && <ArrowLeftRight className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-[#4f6ef7]" : "text-gray-400"}`} />}
                {tab.type === "dn" && <Truck className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-[#4f6ef7]" : "text-gray-400"}`} />}
                <span className="text-[12px] font-medium truncate">{tab.label}</span>
                {tab.type !== SELF_TYPE && (
                  <button
                    onClick={e => { e.stopPropagation(); closeTab(tab.id); }}
                    className={`flex items-center justify-center w-4 h-4 rounded-full shrink-0 ml-0.5 transition-all ${isActive ? "text-gray-400 hover:text-gray-700 hover:bg-gray-100" : "text-gray-300 opacity-0 group-hover:opacity-100 hover:text-gray-600"}`}
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeInnerTab.type === "transfer" ? (
      <>

      {/* Top Nav Bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-gray-800 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <span className="text-gray-300 text-[18px] font-light select-none">|</span>
          <h1 className="text-[18px] font-semibold text-[#1a1a2e]">{record.serialNo}</h1>
        </div>
        <div className="flex items-center gap-2">
          {isPending && (
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-[6px] text-[12px] font-medium text-[#4a4a5a] hover:bg-gray-50 transition-colors">
              <Edit3 className="w-3.5 h-3.5" /> Edit Transfer
            </button>
          )}
          {isPending && (
            <button
              onClick={handleApprove}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#12b76a] hover:bg-[#0ea05e] text-white rounded-[6px] text-[12px] font-semibold transition-colors shadow-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Approve Transfer
            </button>
          )}
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-[6px] text-[12px] font-medium text-[#4a4a5a] hover:bg-gray-50 transition-colors">
            <Printer className="w-3.5 h-3.5" /> Print
          </button>
          <Badge
            variant="outline"
            className={`rounded-md px-2.5 py-0.5 text-[11px] font-bold border ml-1 ${statusColors.bg} ${statusColors.text} ${statusColors.border}`}
          >
            {record.status.charAt(0) + record.status.slice(1).toLowerCase()}
          </Badge>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="px-6 py-5 space-y-4">

          {/* Status card with stepper */}
          <div className="bg-white border border-gray-200 rounded-[8px] shadow-sm p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[12px] font-bold text-gray-700 uppercase tracking-wide">Transfer Status</h2>
              {isPending && (
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-1.5 text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-[4px] text-[12px] font-medium transition-all active:scale-95"
                >
                  <XCircle className="w-3.5 h-3.5" /> Cancel Transfer
                </button>
              )}
              {isCompleted && (
                <span className="text-[12px] text-green-700 font-semibold bg-green-50 border border-green-200 px-3 py-1 rounded-full">
                  Transfer Completed
                </span>
              )}
              {isCanceled && (
                <span className="text-[12px] text-red-600 font-semibold bg-red-50 border border-red-200 px-3 py-1 rounded-full">
                  Transfer Canceled
                </span>
              )}
            </div>

            {/* Stepper */}
            <div className="flex items-center gap-0 px-2">
              {steps.map((step, index) => {
                const isStepCompleted = activeStepIndex > index;
                const isStepActive    = activeStepIndex === index;

                const circleClass = isCanceled
                  ? "w-8 h-8 rounded-full border-2 border-gray-200 bg-gray-100 flex items-center justify-center"
                  : isStepCompleted
                  ? "w-8 h-8 rounded-full bg-[#12b76a] flex items-center justify-center text-white shadow-sm"
                  : isStepActive
                  ? "w-8 h-8 rounded-full bg-[#12b76a] flex items-center justify-center text-white shadow-md ring-4 ring-green-100"
                  : "w-8 h-8 rounded-full border-2 border-gray-200 bg-white flex items-center justify-center";

                const labelClass = isCanceled
                  ? "text-[11px] font-medium text-gray-400 mt-2 text-center whitespace-nowrap"
                  : isStepActive
                  ? "text-[11px] font-bold text-green-700 mt-2 text-center whitespace-nowrap"
                  : isStepCompleted
                  ? "text-[11px] font-semibold text-green-500 mt-2 text-center whitespace-nowrap"
                  : "text-[11px] font-medium text-gray-400 mt-2 text-center whitespace-nowrap";

                const lineGreen = !isCanceled && activeStepIndex > index;
                const label = step.charAt(0) + step.slice(1).toLowerCase();

                return (
                  <React.Fragment key={step}>
                    <div className="flex flex-col items-center">
                      <div className={circleClass}>
                        {isStepCompleted && !isCanceled
                          ? <CheckCircle2 className="w-4 h-4" />
                          : <span className="text-[10px] font-bold text-gray-400">{index + 1}</span>
                        }
                      </div>
                      <span className={labelClass}>{label}</span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-3 mb-5 rounded-full ${lineGreen ? "bg-[#12b76a]" : "bg-gray-200"}`} />
                    )}
                  </React.Fragment>
                );
              })}
              {isCanceled && (
                <>
                  <div className="flex-1 h-0.5 mx-3 mb-5 rounded-full bg-red-200" />
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white shadow-sm">
                      <XCircle className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-red-600 mt-2 text-center whitespace-nowrap">Canceled</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Details card */}
          <div className="bg-white border border-gray-200 rounded-[8px] shadow-sm p-5">
            <h2 className="text-[12px] font-bold text-gray-700 uppercase tracking-wide mb-4">Transfer Details</h2>
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-4">
                <DetailField icon={<ArrowLeftRight className="w-3.5 h-3.5 text-gray-400" />} label="Serial #" value={record.serialNo} />
                <DetailField icon={<User className="w-3.5 h-3.5 text-gray-400" />} label="Created By" value={record.createdBy} />
                <DetailField icon={<MessageSquare className="w-3.5 h-3.5 text-gray-400" />} label="Comment" value={record.comment ?? ""} />
              </div>
              <div className="space-y-4">
                <DetailField icon={<Warehouse className="w-3.5 h-3.5 text-gray-400" />} label="From" value={record.from} />
                <DetailField icon={<Warehouse className="w-3.5 h-3.5 text-indigo-400" />} label="To" value={record.to} />
                <DetailField icon={<Package className="w-3.5 h-3.5 text-gray-400" />} label="Type" value={record.type} />
              </div>
              <div className="space-y-4">
                <DetailField icon={<Calendar className="w-3.5 h-3.5 text-gray-400" />} label="Date" value={record.createdAt} />
                {record.processTime && (
                  <DetailField icon={<Calendar className="w-3.5 h-3.5 text-green-400" />} label="Process Time" value={record.processTime} />
                )}
              </div>
            </div>
          </div>

          {/* Source Document card */}
          {(record.sourceDNId || record.sourceUnloadId || record.sourcePNId) && (
            <div className="bg-white border border-gray-200 rounded-[8px] shadow-sm p-5">
              <h2 className="text-[12px] font-bold text-gray-700 uppercase tracking-wide mb-4">Source Document</h2>
              <div className="flex flex-wrap gap-4">
                {record.sourceDNId && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Delivery Note</span>
                    <button
                      onClick={() => { if (record.sourceDNId) openTab({ type: "dn", id: record.sourceDNId, label: record.sourceDNNumber ?? record.sourceDNId }); }}
                      className="flex items-center gap-1.5 text-[13px] font-semibold text-[#4f6ef7] hover:underline"
                    >
                      {record.sourceDNNumber ?? record.sourceDNId} <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                {record.sourceUnloadId && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Unload Record</span>
                    {onNavigateToUnload ? (
                      <button
                        onClick={() => onNavigateToUnload(record.sourceUnloadId!)}
                        className="flex items-center gap-1.5 text-[13px] font-semibold text-[#4f6ef7] hover:underline"
                      >
                        {record.sourceUnloadId} <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="text-[13px] font-semibold text-gray-800">{record.sourceUnloadId}</span>
                    )}
                  </div>
                )}
                {record.sourcePNId && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">Pickup Note</span>
                    {onNavigateToPNDetails ? (
                      <button
                        onClick={() => onNavigateToPNDetails(record.sourcePNId!)}
                        className="flex items-center gap-1.5 text-[13px] font-semibold text-[#4f6ef7] hover:underline"
                      >
                        {record.sourcePNNumber ?? record.sourcePNId} <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="text-[13px] font-semibold text-gray-800">{record.sourcePNNumber ?? record.sourcePNId}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Variants card */}
          <div className="bg-white border border-gray-200 rounded-[8px] shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-400" />
              <h2 className="text-[12px] font-bold text-gray-700 uppercase tracking-wide">Variants</h2>
              <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-[10px] font-bold text-gray-600">
                {record.items.length}
              </span>
            </div>
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-[#1a1a2e] text-white">
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wide px-5 py-3">Product Name</th>
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wide px-4 py-3">Variant Name</th>
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wide px-4 py-3">Measure Unit</th>
                  <th className="text-right text-[11px] font-semibold uppercase tracking-wide px-4 py-3">Quantity</th>
                  {isPending && (
                    <>
                      <th className="text-right text-[11px] font-semibold uppercase tracking-wide px-4 py-3">Current Origin Qty</th>
                      <th className="text-right text-[11px] font-semibold uppercase tracking-wide px-4 py-3">Current Dest. Qty</th>
                    </>
                  )}
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wide px-5 py-3">Note</th>
                </tr>
              </thead>
              <tbody>
                {record.items.length === 0 ? (
                  <tr>
                    <td colSpan={isPending ? 7 : 5} className="text-center text-[13px] text-gray-400 py-8">
                      No variants.
                    </td>
                  </tr>
                ) : (
                  record.items.map((item, idx) => (
                    <tr
                      key={item.id}
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/40"}`}
                    >
                      <td className="px-5 py-3 font-medium text-[#4f6ef7]">{item.productName}</td>
                      <td className="px-4 py-3 text-[#4f6ef7]">{item.variantName}</td>
                      <td className="px-4 py-3 text-gray-600">{item.measureUnit}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-800">{item.quantity}</td>
                      {isPending && (
                        <>
                          <td className="px-4 py-3 text-right text-gray-700">{item.originQty}</td>
                          <td className="px-4 py-3 text-right text-gray-700">{item.destQty}</td>
                        </>
                      )}
                      <td className="px-5 py-3 text-gray-400 text-[12px]">{item.note ?? ""}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>

      </> ) : (
        <DeliveryNoteDetailsPage dnId={activeInnerTab.id} onBack={() => setActiveInnerTab(SELF_TAB)} />
      )}

    </div>
  );
}
