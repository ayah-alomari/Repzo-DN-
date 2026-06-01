import React, { useState, useEffect } from "react";
import { useAppData } from "../../context/AppDataContext";
import {
  XCircle, Package, Truck, Info, FileText, ArrowLeftRight,
  X, Check, CheckCircle2, Clock, RotateCcw, ListOrdered,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { DeliveryNoteDetailsPage } from "./DeliveryNoteDetailsPage";

interface Props {
  pnId: string | null;
  onBack: () => void;
  onNavigateToSO?: (soId: string) => void;
  onNavigateToTransfer?: (transferId: string) => void;
  onViewV1?: () => void;
}

type PNStatus = "PENDING" | "PROCESSING" | "RECEIVED" | "CANCELED";
type DestType = "Main Warehouse" | "Rep Van";

interface PNItem {
  id: string;
  name: string;
  sku: string;
  unit: string;
  deliveredQty: number;
  returnQty: number;
  status: "Reserved" | "Damaged" | "Resellable" | "Pending" | "Free";
  condition: "Resellable" | "Damaged" | null;
}

interface PNRecord {
  id: string;
  sourceSOId?: string;
  sourceSO?: string;
  sourceInvoiceId?: string;
  sourceInvoice?: string;
  sourceDN?: { id: string; number: string; itemsCount: number };
  client: string;
  rep: string;
  warehouse: string;
  destinationWarehouse: DestType;
  destinationRep?: string;
  createdBy: string;
  createdDate: string;
  status: PNStatus;
  reason: string;
  comment: string;
  repConfirmed: boolean;
  adminConfirmed: boolean;
  inRepVan: boolean;
  items: PNItem[];
}

const STATUS_COLORS: Record<PNStatus, { bg: string; text: string; border: string }> = {
  PENDING:    { bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200" },
  PROCESSING: { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200" },
  RECEIVED:   { bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200" },
  CANCELED:   { bg: "bg-red-50",    text: "text-red-600",    border: "border-red-200" },
};

const STEPS = ["PENDING", "PROCESSING", "RECEIVED"] as const;
const STEP_LABELS: Record<string, string> = {
  PENDING: "Pending",
  PROCESSING: "In Transit",
  RECEIVED: "Received",
};

export function PickupNoteDetailsPageV2({ pnId, onBack, onNavigateToSO, onNavigateToTransfer, onViewV1 }: Props) {
  const { pnList, setPnList, transferList } = useAppData();
  const relatedTransfer = transferList.find(t => t.sourceRNId === pnId);

  const buildRecord = (record: (typeof pnList)[0]): PNRecord => ({
    id: record.id,
    sourceSOId: record.sourceSOId,
    sourceSO: record.sourceSONumber,
    sourceInvoiceId: record.sourceInvoiceId,
    sourceInvoice: record.sourceInvoiceNumber,
    sourceDN: record.sourceDN ? { ...record.sourceDN, itemsCount: (record.sourceDN as any).itemsCount || 0 } : undefined,
    client: record.clientName,
    rep: record.rep,
    warehouse: record.warehouse,
    destinationWarehouse: record.destinationWarehouse,
    destinationRep: record.destinationRep,
    createdBy: record.createdBy,
    createdDate: record.createdDate,
    status: record.status,
    reason: (record as any).reason || "Return Delivery",
    comment: "",
    repConfirmed: record.repConfirmed || false,
    adminConfirmed: record.adminConfirmed || false,
    inRepVan: record.inRepVan,
    items: record.itemsData || [],
  });

  const [pn, setPn] = useState<PNRecord | null>(() => {
    const r = pnList.find(p => p.id === pnId || p.rnNumber === pnId);
    return r ? buildRecord(r) : null;
  });

  useEffect(() => {
    const r = pnList.find(p => p.id === pnId || p.rnNumber === pnId);
    setPn(r ? buildRecord(r) : null);
  }, [pnList, pnId]);

  // ── Inner tabs ─────────────────────────────────────────────────────────────

  const SELF_TYPE = "pn";
  const selfId = pnId ?? "pn";
  const selfLabel = pn?.id ?? pnId ?? "Return Note";
  type InnerTab = { type: string; id: string; label: string };
  const SELF_TAB: InnerTab = { type: SELF_TYPE, id: selfId, label: selfLabel };
  const [innerTabs, setInnerTabs] = useState<InnerTab[]>([SELF_TAB]);
  const [activeInnerTab, setActiveInnerTab] = useState<InnerTab>(SELF_TAB);
  useEffect(() => { setInnerTabs([SELF_TAB]); setActiveInnerTab(SELF_TAB); }, [pnId]);

  const openTab = (tab: InnerTab) => {
    setInnerTabs(prev => prev.some(t => t.id === tab.id) ? prev : [...prev, tab]);
    setActiveInnerTab(tab);
  };
  const closeTab = (id: string) => {
    setInnerTabs(prev => prev.filter(t => t.id !== id));
    if (activeInnerTab.id === id) setActiveInnerTab(SELF_TAB);
  };

  // ── Handlers ──────────────────────────────────────────────────────────────

  const updatePn = (patch: Partial<PNRecord> | ((p: PNRecord) => PNRecord)) => {
    setPn(prev => {
      if (!prev) return prev;
      const next = typeof patch === "function" ? patch(prev) : { ...prev, ...patch };
      setPnList(list => list.map(p =>
        (p.id === next.id || p.rnNumber === next.id)
          ? { ...p, status: next.status, destinationWarehouse: next.destinationWarehouse, destinationRep: next.destinationRep, inRepVan: next.inRepVan, repConfirmed: next.repConfirmed, adminConfirmed: next.adminConfirmed, itemsData: next.items }
          : p
      ));
      return next;
    });
  };

  if (!pn) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f5f5f7]">
        <p className="text-[13px] text-gray-400">Return note not found.</p>
      </div>
    );
  }

  const status = pn.status;
  const sc = STATUS_COLORS[status];
  const activeStepIndex = status === "CANCELED" ? -1 : STEPS.indexOf(status as typeof STEPS[number]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#fbfbfe] overflow-hidden">

      {/* ── Inner tab bar ── */}
      {innerTabs.length > 1 && (
        <div className="flex items-end bg-[#f0f1f4] px-3 pt-2 shrink-0 gap-0.5 border-b border-[#dcdde8] overflow-x-auto">
          {innerTabs.map(tab => {
            const isActive = activeInnerTab.id === tab.id;
            return (
              <div
                key={tab.id}
                onClick={() => setActiveInnerTab(tab)}
                className={`flex items-center gap-2 px-3 py-2 rounded-t-lg cursor-pointer shrink-0 max-w-[200px] group select-none ${
                  isActive
                    ? "bg-white border border-b-0 border-[#dcdde8] text-gray-800 shadow-sm -mb-px"
                    : "bg-transparent text-gray-500 hover:bg-white/50 hover:text-gray-700"
                }`}
              >
                {tab.type === "pn" && <RotateCcw className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-[#4f6ef7]" : "text-gray-400"}`} />}
                {tab.type === "dn" && <Truck     className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-[#4f6ef7]" : "text-gray-400"}`} />}
                <span className="text-[12px] font-medium truncate">{tab.label}</span>
                {tab.type !== SELF_TYPE && (
                  <button
                    onClick={e => { e.stopPropagation(); closeTab(tab.id); }}
                    className="flex items-center justify-center w-4 h-4 rounded-full shrink-0 ml-0.5 text-gray-400 hover:text-gray-700 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeInnerTab.type === "pn" ? (
        <>
          {/* ── Top header ── */}
          <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#e8e8ec] shrink-0">
            <div className="flex items-center gap-3">
              {onBack && (
                <button onClick={onBack} className="text-[#a0a0b0] hover:text-[#4a4a5a] text-[13px] mr-2">← Back</button>
              )}
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h1 className="text-[20px] font-semibold text-[#1a1a2e]">{pn.id}</h1>
                </div>
                <span className="text-[11px] text-[#4f6ef7] font-medium flex items-center gap-1">
                  <RotateCcw className="w-3 h-3" /> Return Note
                </span>
              </div>
            </div>
            <div className="flex items-center gap-5 text-[#4a4a5a]">
              {onViewV1 && (
                <button
                  onClick={onViewV1}
                  className="px-4 py-2 text-[13px] font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  View V1
                </button>
              )}
            </div>
          </div>

          {/* ── Scrollable content ── */}
          <div className="flex-1 overflow-auto p-6 bg-[#f9fafb]">
            <div className="max-w-[1200px] mx-auto space-y-6">

              {/* ── Progress card ── */}
              <div className="bg-white border border-gray-200 rounded-[8px] p-5 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <h2 className="text-[12px] font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      Return Progress
                    </h2>
                    {status === "PENDING" && (
                      <span className="text-[11px] text-amber-600 font-semibold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        Awaiting rep collection
                      </span>
                    )}
                    {status === "PROCESSING" && (
                      <span className="text-[11px] text-blue-600 font-semibold bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                        Items in transit
                      </span>
                    )}
                    {status === "CANCELED" && (
                      <span className="text-[11px] text-red-600 font-semibold bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                        Canceled
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {pn.inRepVan && status !== "RECEIVED" && (
                      <span className="text-[12px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-[4px] flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5" /> Process to Unload
                      </span>
                    )}
                    <button
                      onClick={() => updatePn(prev => ({ ...prev, items: prev.items.map(item => item.status === "Reserved" ? { ...item, status: "Free" as const } : item) }))}
                      className="flex items-center gap-1.5 text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-[4px] text-[12px] font-medium transition-all active:scale-95"
                    >
                      Unreserve manually
                      <span className="text-[9px] font-bold bg-amber-200 text-amber-800 px-1 py-0.5 rounded">Admin</span>
                    </button>
                    {(status === "PENDING" || status === "PROCESSING") && (
                      <button
                        onClick={() => updatePn({ status: "CANCELED" })}
                        className="flex items-center gap-1.5 text-white px-3 py-1.5 rounded-[4px] text-[12px] font-medium transition-all hover:opacity-90 active:scale-95 bg-[#e41e3f]"
                      >
                        <X className="w-3.5 h-3.5" /> Cancel
                      </button>
                    )}
                    {status === "PENDING" && (
                      <button
                        onClick={() => updatePn({ status: "PROCESSING" as PNStatus, repConfirmed: true })}
                        className="flex items-center gap-1.5 text-white px-3 py-1.5 rounded-[4px] text-[12px] font-medium transition-all hover:opacity-90 active:scale-95 bg-[#4f6ef7]"
                      >
                        <Truck className="w-3.5 h-3.5" /> Rep Collected
                      </button>
                    )}
                    {status === "PROCESSING" && (
                      <button
                        onClick={() => updatePn({ status: "RECEIVED" as PNStatus, adminConfirmed: true })}
                        className="flex items-center gap-1.5 text-white px-3 py-1.5 rounded-[4px] text-[12px] font-medium transition-all hover:opacity-90 active:scale-95 bg-[#12b76a]"
                      >
                        <Check className="w-3.5 h-3.5" /> Mark as Received
                      </button>
                    )}
                  </div>
                </div>

                {/* Horizontal stepper */}
                <div className="flex items-center gap-0 px-2">
                  {STEPS.map((step, index) => {
                    const isFullyDone = status === "RECEIVED";
                    const isCompleted =
                      index === 0 ? (activeStepIndex > 0 || isFullyDone) :
                      index === 1 ? isFullyDone :
                      isFullyDone;
                    const isActive =
                      index === 0 ? (activeStepIndex === 0 && status === "PENDING") :
                      index === 1 ? (activeStepIndex === 1 && status === "PROCESSING") :
                      status === "RECEIVED";
                    const lineGreen =
                      index === 0 ? (activeStepIndex > 0 || isFullyDone) :
                      index === 1 ? isFullyDone :
                      false;

                    const circleClass = (isCompleted || isActive) && status !== "CANCELED"
                      ? isActive && !isCompleted
                        ? "w-8 h-8 rounded-full bg-[#12b76a] flex items-center justify-center text-white shadow-md ring-4 ring-green-100"
                        : "w-8 h-8 rounded-full bg-[#12b76a] flex items-center justify-center text-white shadow-sm"
                      : "w-8 h-8 rounded-full border-2 border-gray-200 bg-white flex items-center justify-center";

                    const labelClass = isActive && status !== "CANCELED"
                      ? "text-[11px] font-bold text-green-700 mt-2 text-center whitespace-nowrap"
                      : isCompleted && status !== "CANCELED"
                      ? "text-[11px] font-semibold text-green-500 mt-2 text-center whitespace-nowrap"
                      : "text-[11px] font-medium text-gray-400 mt-2 text-center whitespace-nowrap";

                    return (
                      <React.Fragment key={step}>
                        <div className="flex flex-col items-center">
                          <div className={circleClass}>
                            {(isCompleted || isActive) && status !== "CANCELED" ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <span className="text-[10px] font-bold text-gray-400">{index + 1}</span>
                            )}
                          </div>
                          <span className={labelClass}>{STEP_LABELS[step]}</span>
                        </div>
                        {index < STEPS.length - 1 && (
                          <div className={`flex-1 h-0.5 mx-1 mb-4 ${lineGreen && status !== "CANCELED" ? "bg-[#12b76a]" : "bg-gray-200"}`} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* ── Two-column: Details + Sources ── */}
              <div className="flex gap-6 items-stretch">

                {/* Details card */}
                <div className="flex-1 min-w-0 bg-white border border-gray-200 rounded-[8px] shadow-sm">
                  <div className="p-5 pb-4 border-b border-gray-100 flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <h2 className="text-[12px] font-bold text-[#111827] uppercase tracking-wide">DETAILS</h2>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase border ${sc.bg} ${sc.text} ${sc.border}`}>
                          {status.charAt(0) + status.slice(1).toLowerCase()}
                        </span>
                      </div>
                      <p className="text-[12px] text-gray-500">Return Note# {pn.id}</p>
                    </div>
                  </div>

                  <div className="p-5 pt-6 grid grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4">STATUS</h3>
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-3">
                          <p className="text-[11px] text-gray-500 w-[88px] shrink-0">Destination</p>
                          {status === "PENDING" ? (
                            <select
                              value={pn.destinationWarehouse}
                              onChange={e => updatePn(prev => ({ ...prev, destinationWarehouse: e.target.value as DestType }))}
                              className="border border-gray-200 text-[11px] rounded px-2 py-0.5 bg-white outline-none focus:border-indigo-400"
                            >
                              <option value="Main Warehouse">Main Warehouse</option>
                              <option value="Rep Van">Rep Van</option>
                            </select>
                          ) : (
                            <span className="text-[12px] font-semibold text-gray-900">{pn.destinationWarehouse}</span>
                          )}
                        </div>
                        <div className="flex items-start gap-3">
                          <p className="text-[11px] text-gray-500 w-[88px] shrink-0 mt-1">Assignee</p>
                          <div className="flex flex-col gap-1">
                            <select
                              value={pn.destinationRep || ""}
                              onChange={e => updatePn({ destinationRep: e.target.value || undefined })}
                              disabled={status !== "PENDING"}
                              className="border border-gray-200 text-[11px] rounded px-2 py-0.5 bg-white outline-none focus:border-indigo-400 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                            >
                              <option value="">Unassigned</option>
                              <option value="Ahmad Alshaikh">Ahmad Alshaikh</option>
                              <option value="REP khaled">REP khaled</option>
                              <option value="ADMIN Yousef1">ADMIN Yousef1</option>
                            </select>
                            {!pn.destinationRep && status === "PENDING" && (
                              <span className="text-[10px] font-semibold text-amber-600 flex items-center gap-1">
                                ⚠ No assignee selected
                              </span>
                            )}
                            {!pn.destinationRep && status !== "PENDING" && status !== "CANCELED" && (
                              <span className="text-[10px] text-gray-400">No assignee</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="text-[11px] text-gray-500 w-[88px] shrink-0">Transfer</p>
                          {relatedTransfer ? (
                            <button
                              onClick={() => onNavigateToTransfer?.(relatedTransfer.id)}
                              className="flex items-center gap-1.5 px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md border border-indigo-100 text-[11px] font-bold hover:bg-indigo-100 transition-colors"
                            >
                              <ArrowLeftRight className="w-3 h-3" />
                              {relatedTransfer.serialNo}
                            </button>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-semibold uppercase bg-gray-50 text-gray-400">None</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="text-[11px] text-gray-500 w-[88px] shrink-0">Created By</p>
                          <p className="text-[12px] font-semibold text-gray-900">{pn.createdBy}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4">INFO</h3>
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-3">
                          <p className="text-[11px] text-gray-500 w-[72px] shrink-0">Client</p>
                          <p className="text-[13px] font-semibold text-gray-900 leading-tight">{pn.client}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="text-[11px] text-gray-500 w-[72px] shrink-0">Rep</p>
                          <div className="flex items-center gap-2">
                            <p className="text-[12px] font-semibold text-gray-900">{pn.rep}</p>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[10px] font-medium bg-gray-100 text-gray-600 border border-gray-200">Rep</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="text-[11px] text-gray-500 w-[72px] shrink-0">Date</p>
                          <p className="text-[12px] font-semibold text-gray-900">{pn.createdDate}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="text-[11px] text-gray-500 w-[72px] shrink-0">Reason</p>
                          <p className="text-[12px] font-semibold text-gray-900">{pn.reason || "—"}</p>
                        </div>
                        {pn.comment && (
                          <div className="flex items-center gap-3">
                            <p className="text-[11px] text-gray-500 w-[72px] shrink-0">Comment</p>
                            <p className="text-[12px] font-semibold italic text-gray-500">"{pn.comment}"</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sources card */}
                <div className="w-[380px] shrink-0 bg-white border border-gray-200 rounded-[8px] shadow-sm flex flex-col">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2 shrink-0">
                    <h2 className="text-[11px] font-bold text-[#111827] uppercase tracking-wide">Source Documents</h2>
                  </div>

                  <div className="flex flex-col divide-y divide-gray-100 flex-1">
                    {/* Original Source */}
                    <div className="px-4 py-3">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1.5">Original Source</p>
                      {pn.sourceSOId && pn.sourceSO ? (
                        <button
                          onClick={() => onNavigateToSO?.(pn.sourceSOId!)}
                          className="flex items-center gap-1.5 text-[12px] font-bold text-[#4f6ef7] hover:underline"
                        >
                          <FileText className="w-3.5 h-3.5" />{pn.sourceSO}
                        </button>
                      ) : pn.sourceInvoice ? (
                        <p className="flex items-center gap-1.5 text-[12px] font-bold text-[#4f6ef7]">
                          <FileText className="w-3.5 h-3.5" />{pn.sourceInvoice}
                        </p>
                      ) : (
                        <p className="text-[12px] text-gray-400">—</p>
                      )}
                    </div>

                    {/* Source DN */}
                    {pn.sourceDN && (
                      <div className="px-4 py-3">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase mb-2">Delivery Note</p>
                        <div
                          onClick={() => openTab({ type: "dn", id: pn.sourceDN!.id, label: pn.sourceDN!.number ?? pn.sourceDN!.id })}
                          className="flex items-center gap-2 px-2 py-2 hover:bg-[#f5f7ff] rounded-md cursor-pointer group transition-colors"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-[#4f6ef7] shrink-0" />
                          <span className="text-[12px] font-bold text-gray-900 group-hover:text-[#4f6ef7] transition-colors">{pn.sourceDN.number}</span>
                          {pn.sourceDN.itemsCount > 0 && <span className="text-[11px] text-gray-400 ml-auto">{pn.sourceDN.itemsCount} items</span>}
                        </div>
                      </div>
                    )}

                    {/* Return transfer */}
                    {relatedTransfer && (
                      <div className="px-4 py-3">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1.5">Return Transfer</p>
                        <button
                          onClick={() => onNavigateToTransfer?.(relatedTransfer.id)}
                          className="flex items-center gap-1.5 text-[12px] font-bold text-[#4f6ef7] hover:underline"
                        >
                          <ArrowLeftRight className="w-3.5 h-3.5" />{relatedTransfer.serialNo}
                        </button>
                      </div>
                    )}

                    {!pn.sourceDN && !relatedTransfer && (
                      <div className="flex flex-col items-center justify-center text-center py-8">
                        <FileText className="w-7 h-7 text-gray-300 mb-1.5" />
                        <p className="text-[11px] text-gray-400 font-medium">No linked documents.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Return Items table ── */}
              <div className="bg-white border border-gray-200 rounded-[8px] shadow-sm mb-8">
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                  <h2 className="text-[14px] font-bold text-[#111827] uppercase">RETURN ITEMS</h2>
                  <span className="text-[12px] text-gray-400">{pn.items.length} item{pn.items.length !== 1 ? "s" : ""}</span>
                </div>

                <div className="w-full overflow-hidden border-b border-gray-100">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/50">
                        <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider w-[35%]">Item</th>
                        <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">Delivered</th>
                        <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-center bg-indigo-50 text-indigo-500">Return Qty</th>
                        <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {pn.items.map(item => (
                        <tr key={item.id} className="hover:bg-gray-50/50 border-b border-gray-50 last:border-0 transition-colors">
                          <td className="px-5 py-4">
                            <p className="text-[13px] font-bold text-gray-900">{item.name}</p>
                            <p className="text-[11px] text-gray-400 font-medium">{item.sku}</p>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <p className="text-[13px] font-semibold text-gray-700">
                              {item.deliveredQty} <span className="text-gray-400 text-[11px] font-normal">{item.unit}</span>
                            </p>
                          </td>
                          <td className="px-5 py-4 text-center bg-indigo-50/40">
                            {status === "PENDING" ? (
                              <div className="flex items-center justify-center gap-2">
                                <input
                                  type="number"
                                  min={0}
                                  max={item.deliveredQty}
                                  value={item.returnQty}
                                  onChange={e => updatePn(prev => ({ ...prev, items: prev.items.map(i => i.id === item.id ? { ...i, returnQty: Math.max(0, Math.min(i.deliveredQty, parseInt(e.target.value) || 0)) } : i) }))}
                                  className="w-20 text-center border border-gray-200 rounded py-1 text-[13px] font-semibold text-gray-900 outline-none focus:border-indigo-400"
                                />
                                <span className="text-[11px] text-gray-400">{item.unit}</span>
                              </div>
                            ) : (
                              <span className={`text-[13px] font-bold ${item.returnQty > 0 ? "text-indigo-600" : "text-indigo-200"}`}>
                                {item.returnQty} <span className="text-gray-400 font-normal text-[12px]">{item.unit}</span>
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-center">
                            {item.status === "Reserved" ? (
                              <div className="flex items-center justify-center gap-1.5">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                  🔒 Reserved
                                </span>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <button className="text-gray-300 hover:text-gray-500">
                                      <Info className="w-3.5 h-3.5" />
                                    </button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-60 p-3 text-[12px] text-gray-600 bg-white border border-gray-200 shadow-md" align="end">
                                    This item is locked in stock until manual un-reservation or order cancellation.
                                  </PopoverContent>
                                </Popover>
                              </div>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-medium bg-gray-100 text-gray-500 border border-gray-200">
                                {item.status}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {pn.items.length === 0 && (
                  <div className="flex flex-col items-center justify-center text-center py-10">
                    <Package className="w-7 h-7 text-gray-300 mb-1.5" />
                    <p className="text-[11px] text-gray-400 font-medium">No items on this return note.</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        </>
      ) : (
        <DeliveryNoteDetailsPage
          dnId={activeInnerTab.id}
          onBack={() => setActiveInnerTab(SELF_TAB)}
          onNavigateToSO={onNavigateToSO}
          onNavigateToTransfer={onNavigateToTransfer}
        />
      )}
    </div>
  );
}
