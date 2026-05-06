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
  Truck,
  ExternalLink,
  ArrowLeftRight,
  X,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { DeliveryNoteDetailsPage } from "./DeliveryNoteDetailsPage";
import { TransferDetailsPage } from "./TransferDetailsPage";

interface UnloadDetailsPageProps {
  unloadId: string | null;
  onBack: () => void;
  onNavigateToDN?: (dnId: string) => void;   // kept for external callers; internally replaced by openTab
  onNavigateToTransfer?: (transferId: string) => void; // kept for external callers; internally replaced by openTab
}

interface UnloadItem {
  id: string;
  name: string;
  sku: string;
  qty: number;
  unit: string;
  originalWarehouse: string;
}

interface UnloadRecord {
  id: string;
  dnNumber: string;
  dnId?: string;
  originalWarehouse: string;
  unloadWarehouse: string;
  rep: string;
  createdBy: string;
  client: string;
  itemsCount: number;
  status: "Pending Unload" | "Accepted" | "Rejected" | "Unloaded";
  cancellationReason?: string;
  date: string;
  itemsData?: UnloadItem[];
  items: UnloadItem[];
}


import { useAppData } from "../../context/AppDataContext";

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "Pending Unload": { bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200" },
  "Accepted":       { bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200" },
  "Rejected":       { bg: "bg-red-50",    text: "text-red-600",    border: "border-red-200"   },
};

const steps = ["Pending Unload", "Accepted"] as const;

export function UnloadDetailsPage({ unloadId, onBack }: UnloadDetailsPageProps) {
  const { unloadList, setUnloadList, transferList } = useAppData();
  const relatedTransfer = transferList.find(t => t.sourceUnloadId === unloadId);

  const initialRecord = unloadList.find(u => u.id === unloadId);
  const [record, setRecord] = useState<UnloadRecord | null>(initialRecord ? {
    ...initialRecord,
    items: initialRecord.itemsData || [],
  } : null);

  type InnerTab = { type: string; id: string; label: string };
  const SELF_TAB: InnerTab = { type: "unload", id: unloadId ?? "unload", label: initialRecord?.dnNumber ?? unloadId ?? "Unload" };
  const [innerTabs, setInnerTabs] = useState<InnerTab[]>([SELF_TAB]);
  const [activeInnerTab, setActiveInnerTab] = useState<InnerTab>(SELF_TAB);
  useEffect(() => { setInnerTabs([SELF_TAB]); setActiveInnerTab(SELF_TAB); }, [unloadId]);
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
        <p className="text-[13px] text-gray-400">Unload record not found.</p>
      </div>
    );
  }

  const updateRecordGlobal = (patch: Partial<UnloadRecord>) => {
    setRecord(prev => {
      if (!prev) return null;
      const next = { ...prev, ...patch };
      setUnloadList(list => list.map(u => u.id === record.id ? { ...u, ...patch } : u));
      return next;
    });
  };

  const statusColors = STATUS_COLORS[record.status] ?? STATUS_COLORS["Pending Unload"];
  const isPending = record.status === "Pending Unload";
  const activeStepIndex = record.status === "Rejected" ? -1 : steps.indexOf(record.status as typeof steps[number]);

  const handleAccept = () => updateRecordGlobal({ status: "Accepted" });
  const handleReject = () => updateRecordGlobal({ status: "Rejected" });

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
                className={`flex items-center gap-2 px-3 py-2 rounded-t-lg cursor-pointer transition-all shrink-0 max-w-[200px] group select-none ${isActive ? "bg-white border border-b-0 border-[#dcdde8] text-gray-800 shadow-sm -mb-px" : "bg-transparent text-gray-500 hover:bg-white/50 hover:text-gray-700"}`}
              >
                {tab.type === "unload" && <Package className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-[#4f6ef7]" : "text-gray-400"}`} />}
                {tab.type === "dn" && <Truck className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-[#4f6ef7]" : "text-gray-400"}`} />}
                {tab.type === "transfer" && <ArrowLeftRight className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-[#4f6ef7]" : "text-gray-400"}`} />}
                <span className="text-[12px] font-medium truncate">{tab.label}</span>
                {tab.type !== "unload" && (
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

      {activeInnerTab.type === "unload" ? (
      <>

      {/* Top Nav Bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-gray-800 font-medium transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <span className="text-gray-300 text-[18px] font-light select-none">|</span>
          <h1 className="text-[18px] font-semibold text-[#1a1a2e]">{record.id}</h1>
          <span className="text-[13px] text-gray-400 font-medium">← {record.dnNumber}</span>
        </div>
        <Badge variant="outline" className={`rounded-md px-2.5 py-0.5 text-[11px] font-bold border ${statusColors.bg} ${statusColors.text} ${statusColors.border}`}>
          {record.status}
        </Badge>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="px-6 py-5 space-y-4">

          {/* Status / Actions card */}
          <div className="bg-white border border-gray-200 rounded-[8px] shadow-sm p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[12px] font-bold text-gray-700 uppercase tracking-wide">Unload Status</h2>
              {isPending && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleReject}
                    className="flex items-center gap-1.5 text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-[4px] text-[12px] font-medium transition-all active:scale-95"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>
                  <button
                    onClick={handleAccept}
                    className="flex items-center gap-1.5 text-white bg-[#12b76a] hover:bg-[#0ea05e] px-3 py-1.5 rounded-[4px] text-[12px] font-medium transition-all active:scale-95"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Accept Unload
                  </button>
                </div>
              )}
              {record.status === "Rejected" && (
                <span className="text-[12px] text-red-600 font-semibold bg-red-50 border border-red-200 px-3 py-1 rounded-full">
                  Unload Rejected
                </span>
              )}
              {record.status === "Accepted" && (
                <span className="text-[12px] text-green-700 font-semibold bg-green-50 border border-green-200 px-3 py-1 rounded-full">
                  Unload Accepted
                </span>
              )}
            </div>

            {/* Stepper */}
            <div className="flex items-center gap-0 px-2">
              {steps.map((step, index) => {
                const isCompleted = activeStepIndex > index;
                const isActive    = activeStepIndex === index;
                const isCanceled  = record.status === "Rejected";

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

                const lineGreen = !isCanceled && activeStepIndex > index;

                return (
                  <React.Fragment key={step}>
                    <div className="flex flex-col items-center">
                      <div className={circleClass}>
                        {isCompleted && !isCanceled
                          ? <CheckCircle2 className="w-4 h-4" />
                          : <span className="text-[10px] font-bold text-gray-400">{index + 1}</span>
                        }
                      </div>
                      <span className={labelClass}>{step}</span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-3 mb-5 rounded-full ${lineGreen ? "bg-[#12b76a]" : "bg-gray-200"}`} />
                    )}
                  </React.Fragment>
                );
              })}
              {record.status === "Rejected" && (
                <>
                  <div className="flex-1 h-0.5 mx-3 mb-5 rounded-full bg-red-200" />
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white shadow-sm">
                      <XCircle className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-red-600 mt-2 text-center whitespace-nowrap">Rejected</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Details card */}
          <div className="bg-white border border-gray-200 rounded-[8px] shadow-sm p-5">
            <h2 className="text-[12px] font-bold text-gray-700 uppercase tracking-wide mb-4">Unload Details</h2>
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium uppercase tracking-wide">
                    <Truck className="w-3.5 h-3.5 text-gray-400" /> Source DN
                  </div>
                  {initialRecord?.dnId ? (
                    <button
                      onClick={() => { if (initialRecord?.dnId) openTab({ type: "dn", id: initialRecord.dnId, label: initialRecord.dnNumber ?? initialRecord.dnId }); }}
                      className="flex items-center gap-1.5 text-[13px] font-semibold text-[#4f6ef7] hover:underline w-fit"
                    >
                      {record.dnNumber} <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <span className="text-[13px] font-semibold text-indigo-600">{record.dnNumber}</span>
                  )}
                </div>
                <DetailField icon={<User className="w-3.5 h-3.5 text-gray-400" />} label="Representative" value={record.rep} />
                <DetailField icon={<User className="w-3.5 h-3.5 text-gray-400" />} label="Created By" value={record.createdBy} />
              </div>
              <div className="space-y-4">
                <DetailField icon={<Warehouse className="w-3.5 h-3.5 text-gray-400" />} label="Original Warehouse" value={record.originalWarehouse} />
                <DetailField
                  icon={<Warehouse className="w-3.5 h-3.5 text-indigo-400" />}
                  label="Unload Warehouse"
                  value={record.unloadWarehouse}
                  highlight={record.unloadWarehouse !== record.originalWarehouse}
                  different={record.unloadWarehouse !== record.originalWarehouse}
                />
                <DetailField icon={<Package className="w-3.5 h-3.5 text-gray-400" />} label="Client" value={record.client} />
              </div>
              <div className="space-y-4">
                <DetailField icon={<Calendar className="w-3.5 h-3.5 text-gray-400" />} label="Date" value={record.date} />
                {record.cancellationReason && (
                  <DetailField
                    icon={<MessageSquare className="w-3.5 h-3.5 text-amber-400" />}
                    label="Cancellation Reason"
                    value={record.cancellationReason}
                    warn
                  />
                )}
                {relatedTransfer && (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium uppercase tracking-wide">
                      <ArrowLeftRight className="w-3.5 h-3.5 text-gray-400" /> Related Transfer
                    </div>
                    <button
                      onClick={() => openTab({ type: "transfer", id: relatedTransfer.id, label: relatedTransfer.serialNo ?? relatedTransfer.id })}
                      className="flex items-center gap-1.5 text-[13px] font-semibold text-[#4f6ef7] hover:underline w-fit"
                    >
                      {relatedTransfer.serialNo} <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Items table */}
          <div className="bg-white border border-gray-200 rounded-[8px] shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-400" />
              <h2 className="text-[12px] font-bold text-gray-700 uppercase tracking-wide">Items</h2>
              <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-[10px] font-bold text-gray-600">
                {record.items.length}
              </span>
            </div>
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-[#f7f7f9] border-b border-[#e8e8ec]">
                  <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Item Name</th>
                  <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">SKU</th>
                  <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Original Warehouse</th>
                  <th className="text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Qty</th>
                  <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Unit</th>
                </tr>
              </thead>
              <tbody>
                {record.items.map((item, idx) => (
                  <tr key={item.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/40"}`}>
                    <td className="px-5 py-3 font-medium text-gray-900">{item.name}</td>
                    <td className="px-4 py-3 font-mono text-[12px] text-gray-500">{item.sku}</td>
                    <td className="px-4 py-3 text-gray-600">{item.originalWarehouse}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-800">{item.qty}</td>
                    <td className="px-5 py-3 text-gray-600">{item.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>

      </> ) : activeInnerTab.type === "dn" ? (
        <DeliveryNoteDetailsPage dnId={activeInnerTab.id} onBack={() => setActiveInnerTab(SELF_TAB)} onNavigateToTransfer={(id) => openTab({ type: "transfer", id, label: id })} />
      ) : (
        <TransferDetailsPage transferId={activeInnerTab.id} onBack={() => setActiveInnerTab(SELF_TAB)} onNavigateToDN={(id) => openTab({ type: "dn", id, label: id })} />
      )}

    </div>
  );
}

function DetailField({
  icon, label, value, highlight, different, warn
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
  different?: boolean;
  warn?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium uppercase tracking-wide">
        {icon} {label}
      </div>
      <div className="flex items-center gap-1.5">
        <span className={`text-[13px] font-semibold ${highlight ? "text-indigo-600" : warn ? "text-amber-700" : "text-gray-800"}`}>
          {value}
        </span>
        {different && (
          <span className="text-[9px] font-bold text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
            different
          </span>
        )}
      </div>
    </div>
  );
}
