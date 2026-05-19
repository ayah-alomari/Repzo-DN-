import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  ArrowLeft,
  Plus,
  X,
  Lock,
  Pencil,
} from "lucide-react";
import { MOCK_STOCK, useAppData } from "../../context/AppDataContext";

// ── stock helpers ────────────────────────────────────────────────────────────
const STATUS_CFG = {
  full:    { Icon: CheckCircle2,  cls: "text-green-500" },
  partial: { Icon: AlertTriangle, cls: "text-amber-500" },
  none:    { Icon: XCircle,       cls: "text-red-400"   },
};

function getItemWarehouseStatus(
  wh: string,
  itemId: string,
  neededQty: number,
): "full" | "partial" | "none" {
  const stock = MOCK_STOCK[itemId]?.[wh] ?? 0;
  if (stock === 0) return "none";
  if (stock >= neededQty) return "full";
  return "partial";
}

// ── types ────────────────────────────────────────────────────────────────────
interface ImpactItem {
  id: string;
  name: string;
  sku: string;
  unit: string;
  totalQty: number;
  deliveredQty: number;
  notedQty: number;
  price: number;
}

interface Allocation {
  wh: string;
  qty: number;
}

export interface ConvertInvoiceConfirmData {
  rep: string;
  issueDate: string;
  dueDate: string;
  paymentType?: string;
  paymentStatus: string;
  markAsDelivered?: boolean;
  reservations: {
    itemId: string;
    itemName: string;
    qty: number;
    unit: string;
    warehouse: string;
  }[];
  newAllocations: {
    itemId: string;
    itemName: string;
    qty: number;
    unit: string;
    warehouse: string;
  }[];
}

interface ConvertInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: ConvertInvoiceConfirmData) => void;
  orderId: string;
  warehouses: string[];
  reservations: any[];
  items: ImpactItem[];
  soCreatedBy?: string;
  skipReservations?: boolean;
}

// ── component ────────────────────────────────────────────────────────────────
export function ConvertInvoiceModal({
  isOpen,
  onClose,
  onConfirm,
  warehouses,
  items,
  reservations,
  soCreatedBy,
  skipReservations = false,
}: ConvertInvoiceModalProps) {
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1 state
  const [rep, setRep] = useState(soCreatedBy ?? "");
  const [repLocked, setRepLocked] = useState(!!soCreatedBy);
  const [issueDate, setIssueDate] = useState("04/22/2026");
  const [dueDate, setDueDate] = useState("05/22/2026");
  const [paymentStatus, setPaymentStatus] = useState("UNPAID");
  const { allowMultiWarehouseReservation, reservations: allReservations, enableTransactionalInvoice, transactionalMode } = useAppData();

  const defaultMarkAsDelivered = enableTransactionalInvoice && transactionalMode === "strict";
  const [markAsDelivered, setMarkAsDelivered] = useState(defaultMarkAsDelivered);

  const isCheckboxDisabled = !enableTransactionalInvoice || (enableTransactionalInvoice && transactionalMode === "strict");

  // Step 2 state
  const [allocations, setAllocations] = useState<Record<string, Allocation[]>>({});
  const [globalWarehouseStep2, setGlobalWarehouseStep2] = useState("");

  const activeReservations = reservations.filter(r => r.status === "ACTIVE" && r.warehouse);

  // ── Mode detection ───────────────────────────────────────────────────────────
  // "finance"  — all items covered by DNs   → only financial fields, no rep, single step
  // "details"  — all remaining items fully reserved → step 1 only, no step 2
  // "full"     — some items need new reservations   → step 1 + step 2 (locked + editable)

  const allCoveredByDNs = items.length > 0 &&
    items.every(i => i.notedQty + i.deliveredQty >= i.totalQty);

  const reservedQtyPerItem = activeReservations.reduce((acc, r) => {
    acc[r.itemId] = (acc[r.itemId] ?? 0) + r.qty;
    return acc;
  }, {} as Record<string, number>);

  // Items that still need a new warehouse allocation (not yet in DNs, not fully reserved)
  const itemsNeedingAllocation = items.filter(i => {
    const remaining = Math.max(0, i.totalQty - i.deliveredQty - i.notedQty);
    return remaining > 0 && (reservedQtyPerItem[i.id] ?? 0) < remaining;
  });

  // Items that are already fully reserved but not yet in DNs (shown locked in step 2)
  const lockedStepItems = items.filter(i => {
    const remaining = Math.max(0, i.totalQty - i.deliveredQty - i.notedQty);
    return remaining > 0 && (reservedQtyPerItem[i.id] ?? 0) >= remaining;
  });

  const mode: "finance" | "details" | "full" = (allCoveredByDNs || skipReservations)
    ? "finance"
    : itemsNeedingAllocation.length === 0
    ? "details"
    : "full";

  // ── Init ─────────────────────────────────────────────────────────────────────
  function initAllocations() {
    const init: Record<string, Allocation[]> = {};
    for (const item of itemsNeedingAllocation) {
      const remaining = item.totalQty - item.deliveredQty - item.notedQty;
      init[item.id] = [{ wh: "", qty: remaining }];
    }
    setAllocations(init);
  }

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setRep(soCreatedBy ?? "");
      setRepLocked(!!soCreatedBy);
      setIssueDate("04/22/2026");
      setDueDate("05/22/2026");
      setMarkAsDelivered(enableTransactionalInvoice && transactionalMode === "strict");
      setGlobalWarehouseStep2("");
      initAllocations();
    }
  }, [isOpen, soCreatedBy, enableTransactionalInvoice, transactionalMode]);

  // ── Validation ───────────────────────────────────────────────────────────────
  const step1Valid = mode === "finance"
    ? issueDate !== "" && dueDate !== ""
    : rep.trim() !== "" && issueDate !== "" && dueDate !== "";

  const step2Valid = !allowMultiWarehouseReservation
    ? globalWarehouseStep2 !== ""
    : itemsNeedingAllocation.every(item => {
        const rows = allocations[item.id] ?? [];
        if (rows.length === 0) return false;
        const remaining = item.totalQty - item.deliveredQty - item.notedQty;
        const sumQty = rows.reduce((s, a) => s + (Number(a.qty) || 0), 0);
        return rows.every(a => a.wh !== "") && Math.abs(sumQty - remaining) < 0.001;
      });

  // ── Allocation helpers ───────────────────────────────────────────────────────
  function updateAllocation(itemId: string, index: number, patch: Partial<Allocation>) {
    setAllocations(prev => {
      const rows = [...(prev[itemId] ?? [])];
      rows[index] = { ...rows[index], ...patch };
      return { ...prev, [itemId]: rows };
    });
  }

  function addAllocationRow(itemId: string, remaining: number) {
    setAllocations(prev => {
      const rows = prev[itemId] ?? [];
      const used = rows.reduce((s, a) => s + (Number(a.qty) || 0), 0);
      const leftover = Math.max(0, remaining - used);
      return { ...prev, [itemId]: [...rows, { wh: "", qty: leftover }] };
    });
  }

  function removeAllocationRow(itemId: string, index: number) {
    setAllocations(prev => {
      const rows = (prev[itemId] ?? []).filter((_, i) => i !== index);
      return { ...prev, [itemId]: rows };
    });
  }

  // ── Confirm ──────────────────────────────────────────────────────────────────
  function handleConfirm() {
    const lockedResData = lockedStepItems.flatMap(item =>
      activeReservations
        .filter(r => r.itemId === item.id)
        .map(r => ({
          itemId: item.id,
          itemName: item.name,
          qty: r.qty as number,
          unit: item.unit,
          warehouse: r.warehouse as string,
        }))
    );

    const newResData = !allowMultiWarehouseReservation
      ? itemsNeedingAllocation.map(item => ({
          itemId: item.id,
          itemName: item.name,
          qty: item.totalQty - item.deliveredQty - item.notedQty,
          unit: item.unit,
          warehouse: globalWarehouseStep2,
        }))
      : itemsNeedingAllocation.flatMap(item =>
          (allocations[item.id] ?? []).map(a => ({
            itemId: item.id,
            itemName: item.name,
            qty: Number(a.qty),
            unit: item.unit,
            warehouse: a.wh,
          }))
        );

    onConfirm({
      rep: mode === "finance" ? "" : rep,
      issueDate,
      dueDate,
      paymentStatus,
      markAsDelivered: mode === "finance" ? false : markAsDelivered,
      reservations: mode === "finance" ? [] : [...lockedResData, ...newResData],
      newAllocations: mode === "finance" ? [] : newResData,
    });
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[560px] p-0 overflow-hidden border-none shadow-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 bg-white shrink-0">
          <div className="flex items-center gap-3 mb-3">
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                className="text-gray-400 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <DialogTitle className="text-[17px] font-bold text-gray-900 leading-tight">
                Convert to Invoice
              </DialogTitle>
              <DialogDescription className="text-[12px] text-gray-400 mt-0.5">
                {mode === "finance"
                  ? "Financial information only"
                  : step === 1 ? "Invoice details" : "Reserve items per warehouse"}
              </DialogDescription>
            </div>
          </div>

          {/* Step pills — only shown in "full" mode */}
          {mode === "full" && (
            <div className="flex gap-2">
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold transition-colors ${
                step === 1 ? "bg-[#1a1a2e] text-white" : "bg-gray-100 text-gray-500"
              }`}>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  step === 1 ? "bg-white text-[#1a1a2e]" : "bg-gray-300 text-white"
                }`}>1</span>
                Details
              </div>
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold transition-colors ${
                step === 2 ? "bg-[#1a1a2e] text-white" : "bg-gray-100 text-gray-500"
              }`}>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  step === 2 ? "bg-white text-[#1a1a2e]" : "bg-gray-300 text-white"
                }`}>2</span>
                Reserve Items
              </div>
            </div>
          )}
        </div>

        {/* Body */}
        {step === 1 ? (
          <div className="px-6 py-5 bg-white space-y-4 shrink-0">

            {/* Rep field — hidden in "finance" mode */}
            {mode !== "finance" && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-[13px] font-semibold text-gray-800">
                    Invoice Assigned To <span className="text-red-500">*</span>
                  </Label>
                  {repLocked ? (
                    <button
                      onClick={() => setRepLocked(false)}
                      className="text-[10px] font-bold text-[#4f6ef7] bg-[#f0f4ff] hover:bg-[#e0e7ff] px-2 py-0.5 rounded border border-[#d0d7ff] flex items-center gap-1 transition-colors"
                    >
                      <Pencil className="w-2.5 h-2.5" /> Change
                    </button>
                  ) : (
                    <button
                      onClick={() => setRepLocked(true)}
                      className="text-[10px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 px-2 py-0.5 rounded border border-gray-200 flex items-center gap-1 transition-colors"
                    >
                      <Lock className="w-2.5 h-2.5" /> Lock
                    </button>
                  )}
                </div>
                {repLocked ? (
                  <div className="h-10 px-3 flex items-center bg-indigo-50/60 border border-indigo-100 rounded-md text-[13px] font-semibold text-indigo-800">
                    {rep || "No rep selected"}
                  </div>
                ) : (
                  <Select value={rep} onValueChange={setRep}>
                    <SelectTrigger className="h-10 border-gray-200">
                      <SelectValue placeholder="Select representative" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ahmad Alshaikh">Ahmad Alshaikh</SelectItem>
                      <SelectItem value="REP khaled">REP khaled</SelectItem>
                      <SelectItem value="REP Ahmad Abudre">REP Ahmad Abudre</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[13px] font-semibold text-gray-800">
                  Issue Date <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <Input
                    value={issueDate}
                    onChange={e => setIssueDate(e.target.value)}
                    className="pl-9 h-10 border-gray-200"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[13px] font-semibold text-gray-800">
                  Due Date <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <Input
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="pl-9 h-10 border-gray-200"
                  />
                </div>
              </div>
            </div>

            {/* Payment status */}
            <div className="space-y-1.5">
              <Label className="text-[13px] font-semibold text-gray-800">
                Payment Status <span className="text-red-500">*</span>
              </Label>
              <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                <SelectTrigger className="h-10 border-gray-200">
                  <SelectValue placeholder="Select payment status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UNPAID">Unpaid</SelectItem>
                  <SelectItem value="PARTIAL">Partially Paid</SelectItem>
                  <SelectItem value="PAID">Fully Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Mark as delivered — hidden in "finance" mode */}
            {mode !== "finance" && (
              <label className={`flex items-center gap-3 select-none group ${
                isCheckboxDisabled ? "opacity-60 cursor-not-allowed pointer-events-none" : "cursor-pointer"
              }`}>
                <div
                  onClick={() => {
                    if (!isCheckboxDisabled) {
                      setMarkAsDelivered(v => !v);
                    }
                  }}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${
                    markAsDelivered
                      ? "bg-[#1a1a2e] border-[#1a1a2e]"
                      : "border-gray-300 group-hover:border-gray-400 bg-white"
                  }`}
                >
                  {markAsDelivered && <CheckCircle2 className="w-3 h-3 text-white" />}
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-gray-800">Mark as delivered</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Sets delivery status to Delivered immediately on the invoice</p>
                </div>
              </label>
            )}

            {/* Info note */}
            <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
              <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
              <p className="text-[12px] text-blue-700 leading-snug">
                {mode === "finance"
                  ? "All items are covered by delivery notes. Only financial details are required."
                  : mode === "details"
                  ? "All items are already reserved. No additional stock allocation is needed."
                  : "Some items are not yet reserved. You will assign them to warehouses in the next step."}
              </p>
            </div>
          </div>

        ) : (
          /* Step 2 — only reached in "full" mode */
          <div className="px-6 py-5 bg-white overflow-y-auto flex-1" style={{ scrollbarWidth: "thin" }}>
            <p className="text-[12px] text-gray-500 mb-4">
              {allowMultiWarehouseReservation
                ? "Locked items are already reserved. Assign remaining items to warehouses."
                : "Locked items are already reserved. Select a warehouse for remaining items."}
            </p>

            {!allowMultiWarehouseReservation && (
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
                <Label className="text-[12px] font-semibold text-gray-700 shrink-0">Warehouse</Label>
                <Select value={globalWarehouseStep2} onValueChange={setGlobalWarehouseStep2}>
                  <SelectTrigger className="h-9 border-gray-200 text-[13px] bg-white w-[260px]">
                    <SelectValue placeholder="Select warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map(wh => {
                      const s = getItemWarehouseStatus(wh, itemsNeedingAllocation[0]?.id ?? "", itemsNeedingAllocation[0]?.totalQty ?? 0);
                      const { Icon, cls } = STATUS_CFG[s];
                      return (
                        <SelectItem key={wh} value={wh}>
                          <Icon className={`size-3.5 shrink-0 ${cls}`} />
                          <span>{wh}</span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-4">

              {/* Locked items — existing reservations, read-only */}
              {lockedStepItems.map(item => {
                const itemRes = activeReservations.filter(r => r.itemId === item.id);
                return (
                  <div key={item.id} className="border border-indigo-100 rounded-lg p-3 bg-indigo-50/30">
                    <div className="flex items-center justify-between mb-2.5">
                      <div>
                        <p className="text-[13px] font-semibold text-gray-900">{item.name}</p>
                        <p className="text-[11px] text-gray-400">SKU: {item.sku}</p>
                      </div>
                      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 border border-indigo-200">
                        <Lock className="w-2.5 h-2.5" /> Reserved
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {itemRes.map((r, idx) => (
                        <div key={idx} className="flex items-center gap-2 px-3 py-2 rounded-md bg-white border border-indigo-100">
                          <Lock className="w-3 h-3 text-indigo-300 shrink-0" />
                          <span className="text-[12px] text-indigo-800 font-medium flex-1">{r.warehouse}</span>
                          <span className="text-[12px] font-bold text-indigo-700">{r.qty} {item.unit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Allocatable items — need warehouse assignment */}
              {itemsNeedingAllocation.map(item => {
                const remaining = item.totalQty - item.deliveredQty - item.notedQty;

                if (!allowMultiWarehouseReservation) {
                  return (
                    <div key={item.id} className="border border-gray-100 rounded-lg p-3 bg-gray-50/50 flex items-center justify-between">
                      <div>
                        <p className="text-[13px] font-semibold text-gray-900">{item.name}</p>
                        <p className="text-[11px] text-gray-400">SKU: {item.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] text-gray-500">Remaining</p>
                        <p className="text-[13px] font-bold text-gray-800">{remaining} {item.unit}</p>
                      </div>
                    </div>
                  );
                }

                const rows = allocations[item.id] ?? [];
                const allocatedQty = rows.reduce((s, a) => s + (Number(a.qty) || 0), 0);
                const qtyMatch = Math.abs(allocatedQty - remaining) < 0.001;

                return (
                  <div key={item.id} className="border border-gray-100 rounded-lg p-3 bg-gray-50/50">
                    <div className="flex items-center justify-between mb-2.5">
                      <div>
                        <p className="text-[13px] font-semibold text-gray-900">{item.name}</p>
                        <p className="text-[11px] text-gray-400">SKU: {item.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] text-gray-500">Remaining</p>
                        <p className="text-[13px] font-bold text-gray-800">{remaining} {item.unit}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {rows.map((alloc, idx) => {
                        const status = alloc.wh
                          ? getItemWarehouseStatus(alloc.wh, item.id, alloc.qty)
                          : null;
                        return (
                          <div key={idx} className="flex items-center gap-2">
                            <div className="flex-1">
                              <Select
                                value={alloc.wh}
                                onValueChange={wh => updateAllocation(item.id, idx, { wh })}
                              >
                                <SelectTrigger className="h-9 border-gray-200 text-[13px] bg-white">
                                  <SelectValue placeholder="Select warehouse" />
                                </SelectTrigger>
                                <SelectContent>
                                  {warehouses.map(wh => {
                                    const s = getItemWarehouseStatus(wh, item.id, alloc.qty || remaining);
                                    const { Icon, cls } = STATUS_CFG[s];
                                    return (
                                      <SelectItem key={wh} value={wh}>
                                        <Icon className={`size-3.5 shrink-0 ${cls}`} />
                                        <span>{wh}</span>
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="w-[72px] shrink-0">
                              <input
                                type="number"
                                min={0}
                                max={remaining}
                                value={alloc.qty}
                                onChange={e => updateAllocation(item.id, idx, { qty: Number(e.target.value) })}
                                className="w-full h-9 px-2 text-[13px] text-center border border-gray-200 rounded-md bg-white outline-none focus:border-[#a855f7]"
                              />
                            </div>

                            {status && (() => {
                              const { Icon, cls } = STATUS_CFG[status];
                              return <Icon className={`size-3.5 shrink-0 ${cls}`} />;
                            })()}

                            {rows.length > 1 ? (
                              <button
                                onClick={() => removeAllocationRow(item.id, idx)}
                                className="text-gray-300 hover:text-red-400 transition-colors shrink-0"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <div className="w-3.5 shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-gray-100">
                      <button
                        onClick={() => addAllocationRow(item.id, remaining)}
                        className="flex items-center gap-1 text-[12px] text-[#a855f7] hover:text-[#9333ea] font-medium transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add warehouse
                      </button>
                      <span className={`text-[12px] font-semibold ${qtyMatch ? "text-green-600" : "text-red-500"}`}>
                        {allocatedQty} / {remaining} {item.unit}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Stock Impact */}
            {(() => {
              type ImpactRow = { itemId: string; itemName: string; wh: string; actual: number; toReserve: number };
              let rows: ImpactRow[] = [];

              if (!allowMultiWarehouseReservation && globalWarehouseStep2) {
                rows = itemsNeedingAllocation.map(item => ({
                  itemId: item.id,
                  itemName: item.name,
                  wh: globalWarehouseStep2,
                  actual: MOCK_STOCK[item.id]?.[globalWarehouseStep2] ?? 0,
                  toReserve: item.totalQty - item.deliveredQty - item.notedQty,
                }));
              } else if (allowMultiWarehouseReservation) {
                rows = itemsNeedingAllocation.flatMap(item =>
                  (allocations[item.id] ?? [])
                    .filter(a => a.wh !== "")
                    .map(a => ({
                      itemId: item.id,
                      itemName: item.name,
                      wh: a.wh,
                      actual: MOCK_STOCK[item.id]?.[a.wh] ?? 0,
                      toReserve: Number(a.qty) || 0,
                    }))
                );
              }

              if (rows.length === 0) return null;

              return (
                <div className="mt-5 pt-4 border-t border-gray-100">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">Stock Impact</p>
                  <div className="border border-gray-100 rounded-lg overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50/80">
                        <tr className="border-b border-gray-100">
                          <th className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Item</th>
                          <th className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Warehouse</th>
                          <th className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actual</th>
                          <th className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Reserving</th>
                          <th className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">After</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {rows.map((row, i) => {
                          const alreadyReserved = allReservations
                            .filter(r => r.itemId === row.itemId && r.warehouse === row.wh && r.status === "ACTIVE")
                            .reduce((s, r) => s + (r.qtyBase || r.qty), 0);
                          const after = row.actual - alreadyReserved - row.toReserve;
                          return (
                            <tr key={i} className={after < 0 ? "bg-red-50/40" : ""}>
                              <td className="px-3 py-2.5 text-[12px] font-semibold text-gray-800">{row.itemName}</td>
                              <td className="px-3 py-2.5 text-[12px] text-gray-500">{row.wh}</td>
                              <td className="px-3 py-2.5 text-[12px] font-bold text-gray-700 text-right">{row.actual}</td>
                              <td className="px-3 py-2.5 text-[12px] font-bold text-amber-600 text-right">-{row.toReserve}</td>
                              <td className="px-3 py-2.5 text-[12px] font-bold text-right">
                                <span className={after < 0 ? "text-red-500" : "text-green-600"}>{after}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50/60 border-t border-gray-100 flex justify-end items-center gap-3 shrink-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="h-9 px-5 font-medium text-gray-700 border-gray-200 hover:bg-white"
          >
            Cancel
          </Button>
          {step === 1 ? (
            mode === "full" ? (
              <Button
                onClick={() => { setStep(2); initAllocations(); }}
                disabled={!step1Valid}
                className="h-9 px-6 bg-[#1a1a2e] hover:bg-[#111827] text-white font-medium disabled:opacity-50"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleConfirm}
                disabled={!step1Valid}
                className="h-9 px-6 bg-[#1a1a2e] hover:bg-[#111827] text-white font-medium disabled:opacity-50"
              >
                Create Invoice
              </Button>
            )
          ) : (
            <Button
              onClick={handleConfirm}
              disabled={!step2Valid}
              className="h-9 px-6 bg-[#1a1a2e] hover:bg-[#111827] text-white font-medium disabled:opacity-50"
            >
              Create Invoice
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
