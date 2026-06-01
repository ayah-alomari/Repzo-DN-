import React, { useState, useEffect } from "react";
import { useAppData } from "../../context/AppDataContext";
import { ArrowLeft, CheckCircle2, XCircle, Clock, Package, Truck, Info, ListOrdered, FileText, ArrowRight, ArrowLeftRight, X } from "lucide-react";
import { Badge } from "../ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { DeliveryNoteDetailsPage } from "./DeliveryNoteDetailsPage";

interface PickupNoteDetailsPageProps {
  pnId: string | null;
  onBack: () => void;
  onNavigateToSO?: (soId: string) => void;
  onNavigateToTransfer?: (transferId: string) => void;
  onNavigateToV2?: () => void;
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

const steps = ["PENDING", "PROCESSING", "RECEIVED"] as const;

export function PickupNoteDetailsPage({ pnId, onBack, onNavigateToSO, onNavigateToTransfer, onNavigateToV2 }: PickupNoteDetailsPageProps) {
  const { pnList, setPnList, transferList } = useAppData();
  const relatedTransfer = transferList.find(t => t.sourceRNId === pnId);

  let initial: PNRecord | null = null;
  const record = pnList.find(p => p.id === pnId || p.rnNumber === pnId);

  if (record) {
    initial = {
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
    };
  }

  const [pn, setPn] = useState<PNRecord | null>(initial);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  useEffect(() => {
    const record = pnList.find(p => p.id === pnId || p.rnNumber === pnId);
    if (record) {
      setPn({
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
    } else {
      setPn(null);
    }
  }, [pnList, pnId]);

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
    const wasActive = activeInnerTab.id === id;
    setInnerTabs(prev => prev.filter(t => t.id !== id));
    if (wasActive) setActiveInnerTab(SELF_TAB);
  };

  if (!pn) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f5f5f7]">
        <p className="text-[13px] text-gray-400">Return note not found.</p>
      </div>
    );
  }

  const status = pn.status;
  const statusColors = STATUS_COLORS[status];
  const activeStepIndex = status === "CANCELED" ? -1 : steps.indexOf(status as typeof steps[number]);

  const updatePn = (patch: Partial<PNRecord> | ((prev: PNRecord) => PNRecord)) => {
    setPn(prev => {
      if (!prev) return prev;
      const next = typeof patch === "function" ? patch(prev) : { ...prev, ...patch };
      
      // Sync with global context
      setPnList(list => list.map(p => {
        if (p.id === next.id || p.rnNumber === next.id) {
          return {
            ...p,
            status: next.status,
            destinationWarehouse: next.destinationWarehouse,
            destinationRep: next.destinationRep,
            inRepVan: next.inRepVan,
            repConfirmed: next.repConfirmed,
            adminConfirmed: next.adminConfirmed,
            itemsData: next.items,
          };
        }
        return p;
      }));
      
      return next;
    });
  };

  const handleRepPickup = () => {
    updatePn({ status: "PROCESSING" as PNStatus, repConfirmed: true });
  };

  const handleReceived = () => {
    updatePn({ status: "RECEIVED" as PNStatus, adminConfirmed: true });
  };

  const handleCancel = () => {
    updatePn({ status: "CANCELED" });
  };

  const handleReturnQtyChange = (itemId: string, value: number) => {
    updatePn(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === itemId
          ? { ...item, returnQty: Math.max(0, Math.min(item.deliveredQty, value)) }
          : item
      ),
    }));
  };

  const handleUnreserve = () => {
    updatePn(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.status === "Reserved" ? { ...item, status: "Free" as const } : item
      ),
    }));
  };

  const handleDestinationChange = (dest: DestType) => {
    updatePn(prev => ({
      ...prev, 
      destinationWarehouse: dest, 
      destinationRep: dest === "Rep Van" ? prev.rep : undefined 
    }));
  };

  const handleDestinationRepChange = (rep: string) => {
    updatePn({ destinationRep: rep });
  };

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
                {tab.type === "pn" && <ListOrdered className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-[#4f6ef7]" : "text-gray-400"}`} />}
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

      {activeInnerTab.type === "pn" ? (
      <>

      {/* Top Nav Bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-gray-800 font-medium transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <span className="text-gray-300 text-[18px] font-light select-none">|</span>
          <h1 className="text-[18px] font-semibold text-[#1a1a2e]">{pn.id}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateToV2}
            className="px-3 py-1.5 text-[12px] font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            View V2
          </button>
          <Badge variant="outline" className={"rounded-md px-2.5 py-0.5 text-[11px] font-bold border   "}>
            {status}
          </Badge>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="px-6 py-5 space-y-4">
          {/* Status Cycle and Action Center */}
          <div className="bg-white border border-gray-200 rounded-[8px] shadow-sm p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[12px] font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                Return status
              </h2>
              <div className="flex items-center gap-2">
                {pn.inRepVan && status !== "RECEIVED" && (
                  <span className="text-[12px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-[4px] flex items-center gap-1.5 mr-2">
                    <Truck className="w-3.5 h-3.5" /> Process to Unload
                  </span>
                )}
                <button onClick={handleUnreserve} className="flex items-center gap-1.5 text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-[4px] text-[12px] font-medium transition-all active:scale-95 mr-2">
                  Unreserve Manually
                  <span className="text-[9px] font-bold bg-amber-200 text-amber-800 px-1 py-0.5 rounded ml-1">Admin Only</span>
                </button>
                {(status === "PENDING" || status === "PROCESSING") && (
                  <button onClick={handleCancel}
                    className="flex items-center gap-1.5 text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-[4px] text-[12px] font-medium transition-all active:scale-95">
                    <XCircle className="w-3.5 h-3.5" /> Cancel
                  </button>
                )}
                {status === "PENDING" && (
                  <button onClick={handleRepPickup}
                    className="flex items-center gap-1.5 text-white px-3 py-1.5 rounded-[4px] text-[12px] font-medium transition-all hover:opacity-90 active:scale-95 bg-[#4f6ef7]">
                    <Truck className="w-3.5 h-3.5" /> Rep Collected
                  </button>
                )}
                {status === "PROCESSING" && (
                  <button onClick={handleReceived}
                    className="flex items-center gap-1.5 text-white px-3 py-1.5 rounded-[4px] text-[12px] font-medium transition-all hover:opacity-90 active:scale-95 bg-[#12b76a]">
                    <Package className="w-3.5 h-3.5" /> Mark as Received
                  </button>
                )}
              </div>
            </div>

            {/* Stepper */}
            <div className="flex items-center gap-0 px-2">
              {steps.map((step, index) => {
                const isCompleted = activeStepIndex > index;
                const isActive    = activeStepIndex === index;
                const isCanceled  = status === "CANCELED";
                const lineGreen   = !isCanceled && activeStepIndex > index;

                const circleClass = isCanceled
                  ? "w-8 h-8 rounded-full border-2 border-gray-200 bg-gray-100 flex items-center justify-center"
                  : isCompleted
                  ? "w-8 h-8 rounded-full bg-[#12b76a] flex items-center justify-center text-white shadow-sm"
                  : isActive
                  ? "w-8 h-8 rounded-full bg-[#12b76a] flex items-center justify-center text-white shadow-md ring-4 ring-green-100"
                  : "w-8 h-8 rounded-full border-2 border-gray-200 bg-white flex items-center justify-center";

                const labelClass = isCanceled
                  ? "text-[11px] font-medium text-gray-400 mt-2 text-center whitespace-nowrap"
                  : isActive
                  ? "text-[11px] font-bold text-green-700 mt-2 text-center whitespace-nowrap"
                  : isCompleted
                  ? "text-[11px] font-semibold text-green-500 mt-2 text-center whitespace-nowrap"
                  : "text-[11px] font-medium text-gray-400 mt-2 text-center whitespace-nowrap";

                return (
                  <React.Fragment key={step}>
                    <div className="flex flex-col items-center">
                      <div className={circleClass}>
                        {isCompleted && !isCanceled
                          ? <CheckCircle2 className="w-4 h-4" />
                          : <span className="text-[10px] font-bold text-gray-400">{index + 1}</span>
                        }
                      </div>
                      <span className={labelClass}>{step.charAt(0) + step.slice(1).toLowerCase()}</span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-1 mb-4 ${lineGreen ? "bg-[#12b76a]" : "bg-gray-200"}`} />
                    )}
                  </React.Fragment>
                );
              })}
              {status === "CANCELED" && (
                <>
                  <div className="mb-4 mx-2 w-6 h-0.5 bg-red-300" />
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-red-100 border-2 border-red-400 flex items-center justify-center">
                      <XCircle className="w-4 h-4 text-red-500" />
                    </div>
                    <span className="text-[11px] font-bold text-red-600 mt-2 whitespace-nowrap">Canceled</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Reference Section (Source Linking) */}
            <div className="bg-white border border-gray-200 rounded-[8px] shadow-sm flex flex-col">
              <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50 rounded-t-[8px]">
                <h2 className="text-[12px] font-bold text-[#111827] uppercase tracking-wide flex items-center gap-1.5">
                  <ListOrdered className="w-3.5 h-3.5 text-gray-400" /> Source Traceability
                </h2>
              </div>
              <div className="p-5 flex-1 flex flex-col gap-4">
                <div>
                  <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-1 font-semibold">Original Source</p>
                  {pn.sourceSOId && pn.sourceSO ? (
                    onNavigateToSO ? (
                      <button onClick={() => onNavigateToSO(pn.sourceSOId!)} className="text-[13px] font-semibold text-indigo-600 hover:text-indigo-800 hover:underline transition-colors">
                        {pn.sourceSO}
                      </button>
                    ) : (
                      <p className="text-[13px] font-semibold text-indigo-600">{pn.sourceSO}</p>
                    )
                  ) : pn.sourceInvoice ? (
                    <p className="text-[13px] font-semibold text-indigo-600">{pn.sourceInvoice}</p>
                  ) : (
                    <p className="text-[13px] text-gray-400">—</p>
                  )}
                </div>
                
                <div>
                  <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-2 font-semibold">Source Delivery Note</p>
                  {pn.sourceDN ? (
                    <div className="flex items-center justify-between p-2.5 rounded-md border border-gray-100 bg-gray-50/50">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-400" />
                        <button onClick={() => openTab({ type: "dn", id: pn.sourceDN!.id, label: pn.sourceDN!.number ?? pn.sourceDN!.id })} className="text-[13px] font-semibold text-indigo-600 hover:underline">
                          {pn.sourceDN.number}
                        </button>
                      </div>
                      {pn.sourceDN.itemsCount > 0 && <span className="text-[12px] font-medium text-gray-500">{pn.sourceDN.itemsCount} items</span>}
                    </div>
                  ) : (
                    <p className="text-[12px] text-gray-400">—</p>
                  )}
                </div>
                {relatedTransfer && (
                  <div>
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Related Transfer</p>
                    {onNavigateToTransfer ? (
                      <button
                        onClick={() => onNavigateToTransfer(relatedTransfer.id)}
                        className="flex items-center gap-1.5 text-[13px] font-semibold text-[#4f6ef7] hover:underline"
                      >
                        <ArrowLeftRight className="w-3.5 h-3.5" />
                        {relatedTransfer.serialNo}
                      </button>
                    ) : (
                      <span className="text-[13px] font-semibold text-gray-800">{relatedTransfer.serialNo}</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Destination Warehouse Selector */}
            <div className="bg-white border border-gray-200 rounded-[8px] shadow-sm flex flex-col">
              <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50 rounded-t-[8px]">
                <h2 className="text-[12px] font-bold text-[#111827] uppercase tracking-wide flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-gray-400" /> Warehouse Routing
                </h2>
              </div>
              <div className="p-5 flex-1 flex flex-col gap-5">
                <div className="flex items-center justify-between bg-indigo-50/50 p-4 rounded-lg border border-indigo-100">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[11px] font-semibold text-gray-500 uppercase">From</span>
                    <span className="text-[13px] font-bold text-gray-900">Customer Location</span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-indigo-300" />
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[11px] font-semibold text-gray-500 uppercase">To</span>
                    <span className="text-[13px] font-bold text-indigo-700">{pn.destinationWarehouse}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-semibold text-gray-700">Destination Warehouse <span className="text-red-500">*</span></label>
                    <select
                      value={pn.destinationWarehouse}
                      onChange={e => handleDestinationChange(e.target.value as DestType)}
                      disabled={status !== "PENDING"}
                      className="w-full h-9 px-3 rounded-md border border-gray-200 text-[13px] bg-white outline-none focus:border-indigo-400 disabled:bg-gray-50 disabled:text-gray-500"
                    >
                      <option value="Main Warehouse">Main Warehouse</option>
                      <option value="Rep Van">Specific Rep Van Stock</option>
                    </select>
                  </div>

                  {pn.destinationWarehouse === "Rep Van" && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-semibold text-gray-700">Assign Rep Accountability</label>
                      <select
                        value={pn.destinationRep || ""}
                        onChange={e => handleDestinationRepChange(e.target.value)}
                        disabled={status !== "PENDING"}
                        className="w-full h-9 px-3 rounded-md border border-gray-200 text-[13px] bg-white outline-none focus:border-indigo-400 disabled:bg-gray-50 disabled:text-gray-500"
                      >
                        <option value="" disabled>Select a Rep...</option>
                        <option value="Ahmad Alshaikh">Ahmad Alshaikh</option>
                        <option value="REP khaled">REP khaled</option>
                        <option value="ADMIN Yousef1">ADMIN Yousef1</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Details Row */}
          <div className="bg-white border border-gray-200 rounded-[8px] shadow-sm">
            <div className="p-5 grid grid-cols-4 gap-x-10 gap-y-5">
              <div>
                <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-1 font-semibold">Client</p>
                <p className="text-[13px] font-semibold text-gray-900">{pn.client}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-1 font-semibold">Original Rep</p>
                <p className="text-[13px] font-semibold text-gray-900">{pn.rep}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-1 font-semibold">Date</p>
                <p className="text-[13px] font-semibold text-gray-900">{pn.createdDate}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-1 font-semibold">Return Reason</p>
                <p className="text-[13px] font-semibold text-gray-900">{pn.reason || "—"}</p>
              </div>
              {pn.comment && (
                <div className="col-span-4">
                  <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-1 font-semibold">Comment</p>
                  <p className="text-[13px] font-semibold italic text-gray-500">"{pn.comment}"</p>
                </div>
              )}
            </div>
          </div>

          {/* PN Items table */}
          <div className="bg-white border border-gray-200 rounded-[8px] shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-[12px] font-bold text-[#111827] uppercase tracking-wide">PN Items</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide w-[30%]">Item</th>
                    <th className="text-right px-5 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Delivered</th>
                    <th className="text-right px-5 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Return Qty</th>
                    <th className="text-center px-5 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pn.items.map(item => {
                    return (
                      <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3.5">
                          <button onClick={() => setSelectedItemId(item.id)} className="font-semibold text-indigo-600 hover:underline text-left">{item.name}</button>
                          <p className="text-[11px] text-gray-400 font-medium mt-0.5">{item.sku}</p>
                        </td>
                        <td className="px-5 py-3.5 text-right font-semibold text-gray-900">
                          {item.deliveredQty} <span className="text-gray-400 font-normal text-[12px]">{item.unit}</span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          {status === "PENDING" ? (
                            <div className="flex items-center justify-end gap-2">
                              <input
                                type="number"
                                min={0}
                                max={item.deliveredQty}
                                value={item.returnQty}
                                onChange={e => handleReturnQtyChange(item.id, parseInt(e.target.value) || 0)}
                                className="w-20 text-center border border-gray-200 rounded-md py-1.5 text-[13px] font-semibold text-gray-900 outline-none focus:border-indigo-400 bg-white"
                              />
                              <span className="text-[11px] text-gray-400">{item.unit}</span>
                            </div>
                          ) : (
                            <span className="font-semibold text-indigo-700">
                              {item.returnQty} <span className="text-gray-400 font-normal text-[12px]">{item.unit}</span>
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          {item.status === "Reserved" ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                🔒 Reserved
                              </span>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <button className="text-gray-400 hover:text-gray-600"><Info className="w-4 h-4" /></button>
                                </PopoverTrigger>
                                <PopoverContent className="w-64 p-3 text-[12px] text-gray-600 bg-white border border-gray-200 shadow-md" align="end">
                                  This item is locked in stock until manual un-reservation or order cancellation.
                                </PopoverContent>
                              </Popover>
                            </div>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-bold bg-gray-100 text-gray-600 border border-gray-200">
                              {item.status}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      </> ) : (
        <DeliveryNoteDetailsPage dnId={activeInnerTab.id} onBack={() => setActiveInnerTab(SELF_TAB)} onNavigateToSO={onNavigateToSO} onNavigateToTransfer={onNavigateToTransfer} />
      )}

      <Dialog open={!!selectedItemId} onOpenChange={() => setSelectedItemId(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-bold text-[#1a1a2e] border-b border-[#e8e8ec] pb-3">
              Item Movement History
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="relative pl-6 space-y-6 before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
              
              <div className="relative flex items-center justify-between">
                <div className="absolute left-[-24px] w-6 h-6 bg-blue-100 rounded-full border-2 border-blue-500 flex items-center justify-center z-10">
                  <FileText className="w-3 h-3 text-blue-600" />
                </div>
                <div className="ml-6 bg-gray-50 border border-gray-100 p-3 rounded-lg w-full">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[13px] font-bold text-gray-900">Sales Order Created</span>
                    <span className="text-[11px] text-gray-500">Apr 6, 2026</span>
                  </div>
                  <p className="text-[12px] text-gray-600">Original source <span className="font-semibold">{pn.sourceSO || pn.sourceInvoice || "—"}</span> placed by {pn.client}</p>
                </div>
              </div>

              <div className="relative flex items-center justify-between">
                <div className="absolute left-[-24px] w-6 h-6 bg-purple-100 rounded-full border-2 border-purple-500 flex items-center justify-center z-10">
                  <Truck className="w-3 h-3 text-purple-600" />
                </div>
                <div className="ml-6 bg-gray-50 border border-gray-100 p-3 rounded-lg w-full">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[13px] font-bold text-gray-900">Delivery Note Issued</span>
                    <span className="text-[11px] text-gray-500">Apr 7, 2026</span>
                  </div>
                  <p className="text-[12px] text-gray-600">Shipped via {pn.sourceDN?.number}</p>
                </div>
              </div>

              <div className="relative flex items-center justify-between">
                <div className="absolute left-[-24px] w-6 h-6 bg-amber-100 rounded-full border-2 border-amber-500 flex items-center justify-center z-10">
                  <Clock className="w-3 h-3 text-amber-600" />
                </div>
                <div className="ml-6 bg-gray-50 border border-gray-100 p-3 rounded-lg w-full shadow-sm ring-1 ring-amber-200">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[13px] font-bold text-gray-900">Return Note Generated</span>
                    <span className="text-[11px] text-gray-500">{pn.createdDate}</span>
                  </div>
                  <p className="text-[12px] text-gray-600 mb-2">{pn.id} created for return.</p>
                  <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">🔒 Item Reserved in Stock</span>
                </div>
              </div>

            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
