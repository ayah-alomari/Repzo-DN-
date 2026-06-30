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
  Bookmark,
  Warehouse,
} from "lucide-react";
import { MOCK_STOCK, useAppData } from "../../context/AppDataContext";

// ── stock helpers ─────────────────────────────────────────────────────────────
const STATUS_CFG = {
  full:    { Icon: CheckCircle2,  cls: "text-green-500" },
  partial: { Icon: AlertTriangle, cls: "text-amber-500" },
  none:    { Icon: XCircle,       cls: "text-red-400"   },
};

function getWhStatus(wh: string, itemId: string, needed: number): "full" | "partial" | "none" {
  const stock = MOCK_STOCK[itemId]?.[wh] ?? 0;
  if (stock === 0) return "none";
  if (stock >= needed) return "full";
  return "partial";
}

// ── types ─────────────────────────────────────────────────────────────────────
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

interface Allocation { wh: string; qty: number; }

export interface ConvertInvoiceConfirmData {
  rep: string;
  issueDate: string;
  dueDate: string;
  paymentType?: string;
  paymentStatus: string;
  markAsDelivered?: boolean;
  reservations: { itemId: string; itemName: string; qty: number; unit: string; warehouse: string; }[];
  newAllocations: { itemId: string; itemName: string; qty: number; unit: string; warehouse: string; }[];
  primaryWarehouse: string;
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

// ─────────────────────────────────────────────────────────────────────────────
export function ConvertInvoiceModal({
  isOpen, onClose, onConfirm,
  warehouses, items, reservations,
  soCreatedBy, skipReservations = false,
}: ConvertInvoiceModalProps) {

  const {
    allowMultiWarehouseReservation,
    reservations: allReservations,
    enableTransactionalInvoice,
    transactionalMode,
    enableReservationModel,
  } = useAppData();

  // When true: wizard is Reservation → Invoice Details
  const reservationFirst = enableReservationModel && !skipReservations;

  const [step, setStep] = useState<1 | 2>(1);

  // ── Invoice details state ────────────────────────────────────────────────────
  const [rep, setRep] = useState(soCreatedBy ?? "");
  const [repLocked, setRepLocked] = useState(!!soCreatedBy);
  const [issueDate, setIssueDate] = useState("04/22/2026");
  const [dueDate, setDueDate] = useState("05/22/2026");
  const [paymentStatus, setPaymentStatus] = useState("UNPAID");
  const defaultMarkAsDelivered = !enableTransactionalInvoice || transactionalMode === "checked";
  const [markAsDelivered, setMarkAsDelivered] = useState(defaultMarkAsDelivered);
  const isCheckboxDisabled = !enableTransactionalInvoice || transactionalMode === "strict";

  // ── Reservation / allocation state ──────────────────────────────────────────
  const [newAllocs, setNewAllocs] = useState<Record<string, Allocation[]>>({});
  const [globalWh, setGlobalWh] = useState("");
  // Items whose warehouse has been individually unlocked from the bulk selection
  const [unlockedItems, setUnlockedItems] = useState<Set<string>>(new Set());

  const activeReservations = reservations.filter(r => r.status === "ACTIVE" && r.warehouse);

  // ── Derived ──────────────────────────────────────────────────────────────────
  const reservedQtyPerItem = activeReservations.reduce((acc, r) => {
    acc[r.itemId] = (acc[r.itemId] ?? 0) + (r.qtyBase ?? r.qty);
    return acc;
  }, {} as Record<string, number>);

  const allCoveredByDNs = items.length > 0 &&
    items.every(i => i.notedQty + i.deliveredQty >= i.totalQty);

  // Items that still need allocation (not fully covered by DNs or reservations)
  const itemsNeedingAllocation = items.filter(i => {
    const remaining = Math.max(0, i.totalQty - i.deliveredQty - i.notedQty);
    return remaining > 0 && (reservedQtyPerItem[i.id] ?? 0) < remaining;
  });

  // Items already fully reserved
  const lockedItems = items.filter(i => {
    const remaining = Math.max(0, i.totalQty - i.deliveredQty - i.notedQty);
    return remaining > 0 && (reservedQtyPerItem[i.id] ?? 0) >= remaining;
  });

  // Legacy mode detection (only used when !reservationFirst)
  const mode: "finance" | "details" | "full" = (allCoveredByDNs || skipReservations)
    ? "finance"
    : itemsNeedingAllocation.length === 0
    ? "details"
    : "full";

  // ── Init ─────────────────────────────────────────────────────────────────────
  function initNewAllocs() {
    const init: Record<string, Allocation[]> = {};
    for (const item of itemsNeedingAllocation) {
      const remaining = item.totalQty - item.deliveredQty - item.notedQty - (reservedQtyPerItem[item.id] ?? 0);
      init[item.id] = [{ wh: "", qty: Math.max(0, remaining) }];
    }
    setNewAllocs(init);
  }

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setRep(soCreatedBy ?? "");
      setRepLocked(!!soCreatedBy);
      setIssueDate("04/22/2026");
      setDueDate("05/22/2026");
      setMarkAsDelivered(!enableTransactionalInvoice || transactionalMode === "checked");
      setGlobalWh("");
      setUnlockedItems(new Set());
      initNewAllocs();
    }
  }, [isOpen, soCreatedBy, enableTransactionalInvoice, transactionalMode]);

  // ── Allocation helpers ────────────────────────────────────────────────────────
  function updateAlloc(itemId: string, idx: number, patch: Partial<Allocation>) {
    setNewAllocs(prev => {
      const rows = [...(prev[itemId] ?? [])];
      rows[idx] = { ...rows[idx], ...patch };
      return { ...prev, [itemId]: rows };
    });
  }
  function addAllocRow(itemId: string, remaining: number) {
    setNewAllocs(prev => {
      const rows = prev[itemId] ?? [];
      const used = rows.reduce((s, a) => s + (Number(a.qty) || 0), 0);
      return { ...prev, [itemId]: [...rows, { wh: "", qty: Math.max(0, remaining - used) }] };
    });
  }
  function removeAllocRow(itemId: string, idx: number) {
    setNewAllocs(prev => ({
      ...prev,
      [itemId]: (prev[itemId] ?? []).filter((_, i) => i !== idx),
    }));
  }

  // ── Validation ────────────────────────────────────────────────────────────────
  // Step 1 when reservationFirst — all items must be covered (existing + new)
  const reservationStepValid = (() => {
    if (itemsNeedingAllocation.length === 0) return true;
    if (!allowMultiWarehouseReservation) return globalWh !== "";
    // Multi-wh bulk mode: items locked to global need globalWh set; unlocked need full custom allocs
    const hasLockedToGlobal = itemsNeedingAllocation.some(i => !unlockedItems.has(i.id));
    if (hasLockedToGlobal && !globalWh) return false;
    return itemsNeedingAllocation.filter(i => unlockedItems.has(i.id)).every(item => {
      const remaining = Math.max(0, item.totalQty - item.deliveredQty - item.notedQty - (reservedQtyPerItem[item.id] ?? 0));
      const rows = newAllocs[item.id] ?? [];
      const sum = rows.reduce((s, a) => s + (Number(a.qty) || 0), 0);
      return rows.every(a => a.wh !== "") && Math.abs(sum - remaining) < 0.001;
    });
  })();

  // Details step
  const detailsValid = mode === "finance"
    ? issueDate !== "" && dueDate !== ""
    : rep.trim() !== "" && issueDate !== "" && dueDate !== "";

  // Legacy step validations
  const step1Valid = detailsValid;
  const step2Valid = !allowMultiWarehouseReservation
    ? globalWh !== ""
    : itemsNeedingAllocation.every(item => {
        const rows = newAllocs[item.id] ?? [];
        const remaining = item.totalQty - item.deliveredQty - item.notedQty;
        return rows.every(a => a.wh !== "") && Math.abs(rows.reduce((s, a) => s + (Number(a.qty) || 0), 0) - remaining) < 0.001;
      });

  // ── Confirm ───────────────────────────────────────────────────────────────────
  function handleConfirm() {
    const existingResData = activeReservations.map(r => ({
      itemId: r.itemId,
      itemName: items.find(i => i.id === r.itemId)?.name ?? r.itemId,
      qty: r.qty as number,
      unit: r.unit ?? "",
      warehouse: r.warehouse as string,
    }));

    const newResData = (reservationFirst && allowMultiWarehouseReservation)
      // Bulk mode: locked items use globalWh; unlocked items use their custom allocs
      ? [
          ...itemsNeedingAllocation
            .filter(i => !unlockedItems.has(i.id))
            .map(item => ({
              itemId: item.id, itemName: item.name,
              qty: Math.max(0, item.totalQty - item.deliveredQty - item.notedQty - (reservedQtyPerItem[item.id] ?? 0)),
              unit: item.unit, warehouse: globalWh,
            })),
          ...itemsNeedingAllocation
            .filter(i => unlockedItems.has(i.id))
            .flatMap(item => (newAllocs[item.id] ?? []).map(a => ({
              itemId: item.id, itemName: item.name,
              qty: Number(a.qty), unit: item.unit, warehouse: a.wh,
            }))),
        ]
      : !allowMultiWarehouseReservation
        ? itemsNeedingAllocation.map(item => ({
            itemId: item.id, itemName: item.name,
            qty: item.totalQty - item.deliveredQty - item.notedQty - (reservedQtyPerItem[item.id] ?? 0),
            unit: item.unit, warehouse: globalWh,
          }))
        : itemsNeedingAllocation.flatMap(item =>
            (newAllocs[item.id] ?? []).map(a => ({
              itemId: item.id, itemName: item.name,
              qty: Number(a.qty), unit: item.unit, warehouse: a.wh,
            }))
          );

    const legacyLockedRes = lockedItems.flatMap(item =>
      activeReservations.filter(r => r.itemId === item.id).map(r => ({
        itemId: item.id,
        itemName: item.name,
        qty: r.qty as number,
        unit: item.unit,
        warehouse: r.warehouse as string,
      }))
    );

    onConfirm({
      rep: mode === "finance" && !reservationFirst ? "" : rep,
      issueDate,
      dueDate,
      paymentStatus,
      markAsDelivered: mode === "finance" && !reservationFirst ? false : markAsDelivered,
      reservations: reservationFirst
        ? [...existingResData, ...newResData]
        : mode === "finance" ? [] : [...legacyLockedRes, ...newResData],
      newAllocations: mode === "finance" && !reservationFirst ? [] : newResData,
      primaryWarehouse: invoiceWarehouse,
    });
  }

  // ── Single warehouse shown on the invoice (Step 2 summary + stored on InvoiceRecord) ──
  // Non-van active reservation wins; otherwise the bulk globalWh selection.
  const invoiceWarehouse: string = (() => {
    if (!reservationFirst) return "";
    const nonVan = activeReservations.filter(
      (r: any) => r.warehouse && !String(r.warehouse).toLowerCase().includes("van")
    );
    return nonVan.length > 0 ? (nonVan[0].warehouse as string) : globalWh || "";
  })();

  // ── Step pill helper ──────────────────────────────────────────────────────────
  const Pill = ({ n, label, active }: { n: number; label: string; active: boolean }) => (
    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold transition-colors ${active ? "bg-[#1a1a2e] text-white" : "bg-gray-100 text-gray-500"}`}>
      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${active ? "bg-white text-[#1a1a2e]" : "bg-gray-300 text-white"}`}>{n}</span>
      {label}
    </div>
  );

  // ── Stock impact panel (reused in reservation step) ───────────────────────────
  function StockImpact() {
    type Row = { itemId: string; itemName: string; wh: string; actual: number; toReserve: number };
    let rows: Row[] = [];
    if (!allowMultiWarehouseReservation && globalWh) {
      rows = itemsNeedingAllocation.map(item => ({
        itemId: item.id, itemName: item.name, wh: globalWh,
        actual: MOCK_STOCK[item.id]?.[globalWh] ?? 0,
        toReserve: Math.max(0, item.totalQty - item.deliveredQty - item.notedQty - (reservedQtyPerItem[item.id] ?? 0)),
      }));
    } else if (allowMultiWarehouseReservation) {
      rows = itemsNeedingAllocation.flatMap(item =>
        (newAllocs[item.id] ?? []).filter(a => a.wh).map(a => ({
          itemId: item.id, itemName: item.name, wh: a.wh,
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
                <th className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Stock</th>
                <th className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Reserving</th>
                <th className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">After</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map((row, i) => {
                const alreadyRes = allReservations
                  .filter(r => r.itemId === row.itemId && r.warehouse === row.wh && r.status === "ACTIVE")
                  .reduce((s, r) => s + (r.qtyBase || r.qty), 0);
                const after = row.actual - alreadyRes - row.toReserve;
                return (
                  <tr key={i} className={after < 0 ? "bg-red-50/40" : ""}>
                    <td className="px-3 py-2.5 text-[12px] font-semibold text-gray-800">{row.itemName}</td>
                    <td className="px-3 py-2.5 text-[12px] text-gray-500">{row.wh}</td>
                    <td className="px-3 py-2.5 text-[12px] font-bold text-gray-700 text-right">{row.actual}</td>
                    <td className="px-3 py-2.5 text-[12px] font-bold text-amber-600 text-right">−{row.toReserve}</td>
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
  }

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[860px] w-[90vw] p-0 overflow-hidden border-none shadow-2xl flex flex-col max-h-[88vh]">

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 bg-white shrink-0">
          <div className="flex items-center gap-3 mb-3">
            {step === 2 && (
              <button onClick={() => setStep(1)} className="text-gray-400 hover:text-gray-700 transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <DialogTitle className="text-[17px] font-bold text-gray-900 leading-tight">
                Convert to Invoice
              </DialogTitle>
              <DialogDescription className="text-[12px] text-gray-400 mt-0.5">
                {reservationFirst
                  ? step === 1 ? "Step 1 — Reserve items before creating the invoice" : "Step 2 — Invoice details & confirmation"
                  : mode === "finance" ? "Financial information only"
                  : step === 1 ? "Invoice details" : "Reserve items per warehouse"}
              </DialogDescription>
            </div>
          </div>

          {/* Step pills */}
          {(reservationFirst || mode === "full") && (
            <div className="flex gap-2">
              <Pill n={1} label={reservationFirst ? "Reservations" : "Details"} active={step === 1} />
              <Pill n={2} label={reservationFirst ? "Invoice Details" : "Reserve Items"} active={step === 2} />
            </div>
          )}
        </div>

        {/* ══ BODY ══════════════════════════════════════════════════════════════ */}

        {/* ── Reservation-first mode: Step 1 ─────────────────────────────────── */}
        {reservationFirst && step === 1 && (
          <div className="flex flex-col flex-1 overflow-hidden bg-white">

            {/* Global bulk warehouse picker — shown for both single and multi-warehouse modes */}
            {itemsNeedingAllocation.length > 0 && (
              <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-3 shrink-0 bg-gray-50/60">
                <Warehouse className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="text-[12px] font-semibold text-gray-600 shrink-0">
                  {allowMultiWarehouseReservation ? "Bulk warehouse" : "Reserve from"}
                  <span className="text-red-500 ml-0.5">*</span>
                </span>
                <Select value={globalWh} onValueChange={setGlobalWh}>
                  <SelectTrigger className="h-8 border-gray-200 text-[12px] bg-white w-64">
                    <SelectValue placeholder="Select warehouse…" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map(wh => {
                      const s = getWhStatus(wh, itemsNeedingAllocation[0]?.id ?? "", itemsNeedingAllocation[0]?.totalQty ?? 0);
                      const { Icon, cls } = STATUS_CFG[s];
                      return (
                        <SelectItem key={wh} value={wh}>
                          <Icon className={`size-3.5 shrink-0 ${cls}`} /><span>{wh}</span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {allowMultiWarehouseReservation && (
                  <span className="text-[11px] text-gray-400">
                    Applied to all locked items — unlock a row to override individually
                  </span>
                )}
                {globalWh && !allowMultiWarehouseReservation && (
                  <span className="text-[11px] text-gray-400 ml-auto">
                    Applied to all {itemsNeedingAllocation.length} unreserved item{itemsNeedingAllocation.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
            )}

            {/* ── Unified reservation table ── */}
            {(items.length > 0) && (
              <div className="overflow-auto flex-1" style={{ scrollbarWidth: "thin" }}>
                <table className="w-full text-left border-collapse min-w-[640px]">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider w-[200px]">Product</th>
                      <th className="px-3 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Ordered</th>
                      <th className="px-3 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">In DN</th>
                      <th className="px-3 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Warehouse</th>
                      <th className="px-3 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Res. Qty</th>
                      <th className="px-3 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Stock</th>
                      <th className="px-3 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">After</th>
                      <th className="px-3 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {items.map(item => {
                      const dnCovered   = item.deliveredQty + item.notedQty;
                      const reservedSoFar = reservedQtyPerItem[item.id] ?? 0;
                      const remaining   = Math.max(0, item.totalQty - dnCovered - reservedSoFar);
                      const fullyRes    = remaining === 0 && reservedSoFar > 0;
                      const existingRes = activeReservations.filter(r => r.itemId === item.id);
                      const newRows     = newAllocs[item.id] ?? [];

                      // Build display lines for this item
                      type Line =
                        | { kind: "locked"; wh: string; qty: number }
                        | { kind: "bulk" }             // multi-wh, locked to globalWh
                        | { kind: "new";    idx: number }
                        | { kind: "single" };          // single-wh mode — qty from remaining

                      const isUnlocked = unlockedItems.has(item.id);
                      const lines: Line[] = [
                        ...existingRes.map(r => ({ kind: "locked" as const, wh: r.warehouse as string, qty: r.qty as number })),
                        ...(remaining > 0
                          ? allowMultiWarehouseReservation
                            ? isUnlocked
                              ? newRows.map((_, idx) => ({ kind: "new" as const, idx }))
                              : [{ kind: "bulk" as const }]   // locked to global warehouse
                            : [{ kind: "single" as const }]   // single-wh mode
                          : []),
                      ];

                      const rowBg = fullyRes ? "bg-green-50/30" : remaining > 0 ? "bg-amber-50/20" : "";
                      const rowCount = Math.max(lines.length, 1);

                      return lines.length === 0 ? (
                        // Covered entirely by DNs — single informational row
                        <tr key={item.id} className="hover:bg-gray-50/50">
                          <td className="px-4 py-2.5">
                            <p className="text-[12px] font-bold text-gray-900 truncate">{item.name}</p>
                            <p className="text-[10px] text-gray-400">{item.sku}</p>
                          </td>
                          <td className="px-3 py-2.5 text-center text-[12px] font-bold text-gray-700">{item.totalQty} <span className="font-normal text-gray-400">{item.unit}</span></td>
                          <td className="px-3 py-2.5 text-center text-[12px] text-green-600 font-semibold">{dnCovered}</td>
                          <td colSpan={4} className="px-3 py-2.5 text-center text-[11px] text-gray-300 italic">Covered by delivery notes</td>
                          <td />
                        </tr>
                      ) : (
                        lines.map((line, li) => {
                          const isFirst = li === 0;
                          const isLast  = li === lines.length - 1;

                          // Per-line derived values
                          let wh = "";
                          let lineQty = 0;
                          let isLocked = false;
                          let newIdx = -1;

                          if (line.kind === "locked")  { wh = line.wh; lineQty = line.qty; isLocked = true; }
                          if (line.kind === "bulk")    { wh = globalWh; lineQty = remaining; }
                          if (line.kind === "new")      { newIdx = line.idx; const a = newRows[line.idx]; wh = a.wh; lineQty = a.qty; }
                          if (line.kind === "single")   { wh = globalWh; lineQty = remaining; }

                          const stock = wh ? (MOCK_STOCK[item.id]?.[wh] ?? 0) : null;
                          const alreadyResInWh = wh
                            ? allReservations.filter(r => r.itemId === item.id && r.warehouse === wh && r.status === "ACTIVE").reduce((s, r) => s + (r.qtyBase || r.qty), 0)
                            : 0;
                          const afterStock = stock !== null ? stock - alreadyResInWh - (isLocked ? 0 : lineQty) : null;

                          const lineBg = isLocked
                            ? "bg-green-50/20"
                            : (line.kind === "single" || line.kind === "bulk" || line.kind === "new")
                            ? rowBg
                            : "";

                          return (
                            <tr key={`${item.id}-${li}`} className={`${lineBg} hover:brightness-[0.98] transition-colors`}>
                              {/* Product cell — only on first line */}
                              {isFirst ? (
                                <td className="px-4 py-2.5 align-top" rowSpan={rowCount}>
                                  <div className="flex items-start gap-1.5">
                                    <div className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${fullyRes ? "bg-green-400" : remaining > 0 ? "bg-amber-400" : "bg-gray-300"}`} />
                                    <div className="min-w-0">
                                      <p className="text-[12px] font-bold text-gray-900 leading-snug truncate">{item.name}</p>
                                      <p className="text-[10px] text-gray-400">{item.sku}</p>
                                    </div>
                                  </div>
                                </td>
                              ) : null}
                              {/* Ordered — first line only */}
                              {isFirst ? (
                                <td className="px-3 py-2.5 text-center align-top" rowSpan={rowCount}>
                                  <span className="text-[12px] font-bold text-gray-800">{item.totalQty}</span>
                                  <span className="text-[10px] text-gray-400 ml-0.5">{item.unit}</span>
                                </td>
                              ) : null}
                              {/* In DN — first line only */}
                              {isFirst ? (
                                <td className="px-3 py-2.5 text-center align-top" rowSpan={rowCount}>
                                  {dnCovered > 0
                                    ? <span className="text-[12px] font-semibold text-blue-600">{dnCovered}</span>
                                    : <span className="text-[12px] text-gray-300">—</span>}
                                </td>
                              ) : null}

                              {/* Warehouse */}
                              <td className="px-3 py-2">
                                {isLocked ? (
                                  <div className="flex items-center gap-1.5">
                                    <Lock className="w-3 h-3 text-green-300 shrink-0" />
                                    <span className="text-[12px] text-gray-700 truncate">{wh}</span>
                                  </div>
                                ) : line.kind === "bulk" ? (
                                  /* Locked to global — show warehouse + unlock button */
                                  <div className="flex items-center gap-1.5">
                                    <Lock className="w-3 h-3 text-indigo-300 shrink-0" />
                                    {wh
                                      ? <span className="text-[12px] font-medium text-indigo-700 truncate flex-1">{wh}</span>
                                      : <span className="text-[11px] text-gray-300 italic flex-1">Select warehouse above</span>}
                                    <button
                                      onClick={() => {
                                        setUnlockedItems(prev => { const n = new Set(prev); n.add(item.id); return n; });
                                        // Pre-fill with globalWh so user starts from current selection
                                        setNewAllocs(prev => ({ ...prev, [item.id]: [{ wh: globalWh, qty: remaining }] }));
                                      }}
                                      className="ml-1 flex items-center gap-0.5 text-[10px] font-bold text-gray-400 hover:text-[#4f6ef7] shrink-0 transition-colors"
                                      title="Override warehouse for this item">
                                      <Lock className="w-2.5 h-2.5" /> Change
                                    </button>
                                  </div>
                                ) : line.kind === "single" ? (
                                  wh
                                    ? <span className="text-[12px] font-medium text-indigo-700 truncate">{wh}</span>
                                    : <span className="text-[11px] text-gray-300 italic">Select warehouse above</span>
                                ) : (
                                  /* Multi-warehouse custom row */
                                  <Select value={wh} onValueChange={v => updateAlloc(item.id, newIdx, { wh: v })}>
                                    <SelectTrigger className="h-7 border-gray-200 text-[12px] bg-white min-w-[160px]">
                                      <SelectValue placeholder="Warehouse…" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {warehouses.map(w => {
                                        const s = getWhStatus(w, item.id, lineQty || remaining);
                                        const { Icon, cls } = STATUS_CFG[s];
                                        return <SelectItem key={w} value={w}><Icon className={`size-3.5 shrink-0 ${cls}`} /><span>{w}</span></SelectItem>;
                                      })}
                                    </SelectContent>
                                  </Select>
                                )}
                              </td>

                              {/* Res. Qty */}
                              <td className="px-3 py-2 text-center">
                                {isLocked ? (
                                  <span className="text-[12px] font-bold text-green-700">{lineQty}</span>
                                ) : line.kind === "bulk" || line.kind === "single" ? (
                                  <span className="text-[12px] font-bold text-amber-700">{lineQty}</span>
                                ) : (
                                  <input type="number" min={0} value={newRows[newIdx]?.qty ?? 0}
                                    onChange={e => updateAlloc(item.id, newIdx, { qty: Number(e.target.value) })}
                                    className="w-16 h-7 px-1 text-[12px] text-center border border-gray-200 rounded bg-white outline-none focus:border-[#4f6ef7]"
                                  />
                                )}
                              </td>

                              {/* Stock at warehouse */}
                              <td className="px-3 py-2 text-center">
                                {stock !== null
                                  ? <span className={`text-[12px] font-semibold ${stock === 0 ? "text-red-400" : stock < lineQty ? "text-amber-500" : "text-gray-600"}`}>{stock}</span>
                                  : <span className="text-[11px] text-gray-300">—</span>}
                              </td>

                              {/* After reservation */}
                              <td className="px-3 py-2 text-center">
                                {afterStock !== null
                                  ? <span className={`text-[12px] font-bold ${afterStock < 0 ? "text-red-500" : "text-green-600"}`}>{afterStock}</span>
                                  : <span className="text-[11px] text-gray-300">—</span>}
                              </td>

                              {/* Actions */}
                              <td className="px-2 py-2 text-center">
                                {isLocked ? (
                                  <Lock className="w-3 h-3 text-gray-300 mx-auto" />
                                ) : line.kind === "bulk" ? null
                                : line.kind === "new" ? (
                                  <div className="flex items-center gap-1 justify-center">
                                    {newRows.length > 1 && (
                                      <button onClick={() => removeAllocRow(item.id, newIdx)} className="text-gray-300 hover:text-red-400 transition-colors">
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                    {isLast && (
                                      <>
                                        <button onClick={() => addAllocRow(item.id, remaining)} className="text-[#4f6ef7] hover:text-[#3b5ee8] transition-colors" title="Add warehouse row">
                                          <Plus className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          onClick={() => setUnlockedItems(prev => { const n = new Set(prev); n.delete(item.id); return n; })}
                                          className="text-gray-300 hover:text-indigo-500 transition-colors"
                                          title="Re-lock to bulk warehouse">
                                          <Lock className="w-3.5 h-3.5" />
                                        </button>
                                      </>
                                    )}
                                  </div>
                                ) : null}
                              </td>
                            </tr>
                          );
                        })
                      );
                    })}
                  </tbody>
                </table>

                {/* All-DNs empty state */}
                {itemsNeedingAllocation.length === 0 && lockedItems.length === 0 && items.length > 0 && (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <CheckCircle2 className="w-10 h-10 text-green-400 mb-3" />
                    <p className="text-[13px] font-semibold text-gray-600 mb-1">All items are covered by delivery notes</p>
                    <p className="text-[11px] text-gray-400">No reservation needed. Proceed to invoice details.</p>
                  </div>
                )}
              </div>
            )}

            {/* Footer note */}
            {itemsNeedingAllocation.length > 0 && (
              <div className="px-5 py-3 border-t border-gray-100 bg-amber-50/60 flex items-center gap-2 shrink-0">
                <Info className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <p className="text-[11px] text-amber-700">
                  {!allowMultiWarehouseReservation && !globalWh
                    ? "Select a warehouse above — all unreserved items will be reserved from it."
                    : "Reserve all items before proceeding. Green = already reserved. Amber = needs a warehouse."}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Reservation-first mode: Step 2 (Invoice Details) ───────────────── */}
        {reservationFirst && step === 2 && (
          <div className="px-6 py-5 bg-white space-y-4 overflow-y-auto flex-1" style={{ scrollbarWidth: "thin" }}>

            {/* Selected warehouse summary — read-only, always one name */}
            {invoiceWarehouse && (
              <div className="rounded-lg border border-indigo-100 bg-indigo-50/40 px-4 py-3 flex items-center gap-3">
                <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider shrink-0">Warehouse</p>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-indigo-200 text-[12px] font-semibold text-indigo-700">
                  <Warehouse className="w-3 h-3" /> {invoiceWarehouse}
                </span>
              </div>
            )}

            {/* Rep */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-[13px] font-semibold text-gray-800">
                  Invoice Assigned To <span className="text-red-500">*</span>
                </Label>
                {repLocked
                  ? <button onClick={() => setRepLocked(false)} className="text-[10px] font-bold text-[#4f6ef7] bg-[#f0f4ff] hover:bg-[#e0e7ff] px-2 py-0.5 rounded border border-[#d0d7ff] flex items-center gap-1 transition-colors"><Pencil className="w-2.5 h-2.5" /> Change</button>
                  : <button onClick={() => setRepLocked(true)} className="text-[10px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 px-2 py-0.5 rounded border border-gray-200 flex items-center gap-1 transition-colors"><Lock className="w-2.5 h-2.5" /> Lock</button>}
              </div>
              {repLocked
                ? <div className="h-10 px-3 flex items-center bg-indigo-50/60 border border-indigo-100 rounded-md text-[13px] font-semibold text-indigo-800">{rep || "No rep selected"}</div>
                : <Select value={rep} onValueChange={setRep}>
                    <SelectTrigger className="h-10 border-gray-200"><SelectValue placeholder="Select representative" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ahmad Alshaikh">Ahmad Alshaikh</SelectItem>
                      <SelectItem value="REP khaled">REP khaled</SelectItem>
                      <SelectItem value="REP Ahmad Abudre">REP Ahmad Abudre</SelectItem>
                    </SelectContent>
                  </Select>}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[13px] font-semibold text-gray-800">Issue Date <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <Input value={issueDate} onChange={e => setIssueDate(e.target.value)} className="pl-9 h-10 border-gray-200" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[13px] font-semibold text-gray-800">Due Date <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <Input value={dueDate} onChange={e => setDueDate(e.target.value)} className="pl-9 h-10 border-gray-200" />
                </div>
              </div>
            </div>

            {/* Payment status */}
            <div className="space-y-1.5">
              <Label className="text-[13px] font-semibold text-gray-800">Payment Status <span className="text-red-500">*</span></Label>
              <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                <SelectTrigger className="h-10 border-gray-200"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="UNPAID">Unpaid</SelectItem>
                  <SelectItem value="PARTIAL">Partially Paid</SelectItem>
                  <SelectItem value="PAID">Fully Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Mark as delivered */}
            <label className={`flex items-center gap-3 select-none group ${isCheckboxDisabled ? "opacity-60 cursor-not-allowed pointer-events-none" : "cursor-pointer"}`}>
              <div onClick={() => { if (!isCheckboxDisabled) setMarkAsDelivered(v => !v); }}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${markAsDelivered ? "bg-[#1a1a2e] border-[#1a1a2e]" : "border-gray-300 group-hover:border-gray-400 bg-white"}`}>
                {markAsDelivered && <CheckCircle2 className="w-3 h-3 text-white" />}
              </div>
              <div>
                <p className="text-[13px] font-semibold text-gray-800">Mark as delivered</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Sets delivery status to Delivered immediately on the invoice</p>
              </div>
            </label>
          </div>
        )}

        {/* ── Legacy mode: Step 1 (Details) ──────────────────────────────────── */}
        {!reservationFirst && step === 1 && (
          <div className="px-6 py-5 bg-white space-y-4 shrink-0">
            {mode !== "finance" && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-[13px] font-semibold text-gray-800">Invoice Assigned To <span className="text-red-500">*</span></Label>
                  {repLocked
                    ? <button onClick={() => setRepLocked(false)} className="text-[10px] font-bold text-[#4f6ef7] bg-[#f0f4ff] hover:bg-[#e0e7ff] px-2 py-0.5 rounded border border-[#d0d7ff] flex items-center gap-1 transition-colors"><Pencil className="w-2.5 h-2.5" /> Change</button>
                    : <button onClick={() => setRepLocked(true)} className="text-[10px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 px-2 py-0.5 rounded border border-gray-200 flex items-center gap-1 transition-colors"><Lock className="w-2.5 h-2.5" /> Lock</button>}
                </div>
                {repLocked
                  ? <div className="h-10 px-3 flex items-center bg-indigo-50/60 border border-indigo-100 rounded-md text-[13px] font-semibold text-indigo-800">{rep || "No rep selected"}</div>
                  : <Select value={rep} onValueChange={setRep}>
                      <SelectTrigger className="h-10 border-gray-200"><SelectValue placeholder="Select representative" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ahmad Alshaikh">Ahmad Alshaikh</SelectItem>
                        <SelectItem value="REP khaled">REP khaled</SelectItem>
                        <SelectItem value="REP Ahmad Abudre">REP Ahmad Abudre</SelectItem>
                      </SelectContent>
                    </Select>}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[13px] font-semibold text-gray-800">Issue Date <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <Input value={issueDate} onChange={e => setIssueDate(e.target.value)} className="pl-9 h-10 border-gray-200" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[13px] font-semibold text-gray-800">Due Date <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <Input value={dueDate} onChange={e => setDueDate(e.target.value)} className="pl-9 h-10 border-gray-200" />
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px] font-semibold text-gray-800">Payment Status <span className="text-red-500">*</span></Label>
              <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                <SelectTrigger className="h-10 border-gray-200"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="UNPAID">Unpaid</SelectItem>
                  <SelectItem value="PARTIAL">Partially Paid</SelectItem>
                  <SelectItem value="PAID">Fully Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {mode !== "finance" && (
              <label className={`flex items-center gap-3 select-none group ${isCheckboxDisabled ? "opacity-60 cursor-not-allowed pointer-events-none" : "cursor-pointer"}`}>
                <div onClick={() => { if (!isCheckboxDisabled) setMarkAsDelivered(v => !v); }}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${markAsDelivered ? "bg-[#1a1a2e] border-[#1a1a2e]" : "border-gray-300 group-hover:border-gray-400 bg-white"}`}>
                  {markAsDelivered && <CheckCircle2 className="w-3 h-3 text-white" />}
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-gray-800">Mark as delivered</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Sets delivery status to Delivered immediately on the invoice</p>
                </div>
              </label>
            )}
            <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
              <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
              <p className="text-[12px] text-blue-700 leading-snug">
                {mode === "finance" ? "All items are covered by delivery notes. Only financial details are required."
                  : mode === "details" ? "All items are already reserved. No additional stock allocation is needed."
                  : "Some items are not yet reserved. You will assign them to warehouses in the next step."}
              </p>
            </div>
          </div>
        )}

        {/* ── Legacy mode: Step 2 (Warehouse allocation) ─────────────────────── */}
        {!reservationFirst && step === 2 && (
          <div className="px-6 py-5 bg-white overflow-y-auto flex-1" style={{ scrollbarWidth: "thin" }}>
            <p className="text-[12px] text-gray-500 mb-4">
              {allowMultiWarehouseReservation
                ? "Locked items are already reserved. Assign remaining items to warehouses."
                : "Locked items are already reserved. Select a warehouse for remaining items."}
            </p>
            {!allowMultiWarehouseReservation && (
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
                <Label className="text-[12px] font-semibold text-gray-700 shrink-0">Warehouse</Label>
                <Select value={globalWh} onValueChange={setGlobalWh}>
                  <SelectTrigger className="h-9 border-gray-200 text-[13px] bg-white w-[260px]"><SelectValue placeholder="Select warehouse" /></SelectTrigger>
                  <SelectContent>
                    {warehouses.map(wh => {
                      const s = getWhStatus(wh, itemsNeedingAllocation[0]?.id ?? "", itemsNeedingAllocation[0]?.totalQty ?? 0);
                      const { Icon, cls } = STATUS_CFG[s];
                      return <SelectItem key={wh} value={wh}><Icon className={`size-3.5 shrink-0 ${cls}`} /><span>{wh}</span></SelectItem>;
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-4">
              {lockedItems.map(item => {
                const itemRes = activeReservations.filter(r => r.itemId === item.id);
                return (
                  <div key={item.id} className="border border-indigo-100 rounded-lg p-3 bg-indigo-50/30">
                    <div className="flex items-center justify-between mb-2.5">
                      <div><p className="text-[13px] font-semibold text-gray-900">{item.name}</p><p className="text-[11px] text-gray-400">SKU: {item.sku}</p></div>
                      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 border border-indigo-200"><Lock className="w-2.5 h-2.5" /> Reserved</span>
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
              {itemsNeedingAllocation.map(item => {
                const remaining = item.totalQty - item.deliveredQty - item.notedQty;
                if (!allowMultiWarehouseReservation) {
                  return (
                    <div key={item.id} className="border border-gray-100 rounded-lg p-3 bg-gray-50/50 flex items-center justify-between">
                      <div><p className="text-[13px] font-semibold text-gray-900">{item.name}</p><p className="text-[11px] text-gray-400">SKU: {item.sku}</p></div>
                      <div className="text-right"><p className="text-[11px] text-gray-500">Remaining</p><p className="text-[13px] font-bold text-gray-800">{remaining} {item.unit}</p></div>
                    </div>
                  );
                }
                const rows = newAllocs[item.id] ?? [];
                const allocatedQty = rows.reduce((s, a) => s + (Number(a.qty) || 0), 0);
                const qtyMatch = Math.abs(allocatedQty - remaining) < 0.001;
                return (
                  <div key={item.id} className="border border-gray-100 rounded-lg p-3 bg-gray-50/50">
                    <div className="flex items-center justify-between mb-2.5">
                      <div><p className="text-[13px] font-semibold text-gray-900">{item.name}</p><p className="text-[11px] text-gray-400">SKU: {item.sku}</p></div>
                      <div className="text-right"><p className="text-[11px] text-gray-500">Remaining</p><p className="text-[13px] font-bold text-gray-800">{remaining} {item.unit}</p></div>
                    </div>
                    <div className="space-y-2">
                      {rows.map((alloc, idx) => {
                        const st = alloc.wh ? getWhStatus(alloc.wh, item.id, alloc.qty) : null;
                        return (
                          <div key={idx} className="flex items-center gap-2">
                            <div className="flex-1">
                              <Select value={alloc.wh} onValueChange={wh => updateAlloc(item.id, idx, { wh })}>
                                <SelectTrigger className="h-9 border-gray-200 text-[13px] bg-white"><SelectValue placeholder="Select warehouse" /></SelectTrigger>
                                <SelectContent>
                                  {warehouses.map(wh => {
                                    const s = getWhStatus(wh, item.id, alloc.qty || remaining);
                                    const { Icon, cls } = STATUS_CFG[s];
                                    return <SelectItem key={wh} value={wh}><Icon className={`size-3.5 shrink-0 ${cls}`} /><span>{wh}</span></SelectItem>;
                                  })}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="w-[72px] shrink-0">
                              <input type="number" min={0} max={remaining} value={alloc.qty}
                                onChange={e => updateAlloc(item.id, idx, { qty: Number(e.target.value) })}
                                className="w-full h-9 px-2 text-[13px] text-center border border-gray-200 rounded-md bg-white outline-none focus:border-[#a855f7]" />
                            </div>
                            {st && (() => { const { Icon, cls } = STATUS_CFG[st]; return <Icon className={`size-3.5 shrink-0 ${cls}`} />; })()}
                            {rows.length > 1
                              ? <button onClick={() => removeAllocRow(item.id, idx)} className="text-gray-300 hover:text-red-400 transition-colors shrink-0"><X className="w-3.5 h-3.5" /></button>
                              : <div className="w-3.5 shrink-0" />}
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-gray-100">
                      <button onClick={() => addAllocRow(item.id, remaining)} className="flex items-center gap-1 text-[12px] text-[#a855f7] hover:text-[#9333ea] font-medium transition-colors"><Plus className="w-3.5 h-3.5" /> Add warehouse</button>
                      <span className={`text-[12px] font-semibold ${qtyMatch ? "text-green-600" : "text-red-500"}`}>{allocatedQty} / {remaining} {item.unit}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <StockImpact />
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50/60 border-t border-gray-100 flex justify-end items-center gap-3 shrink-0">
          <Button variant="outline" onClick={onClose} className="h-9 px-5 font-medium text-gray-700 border-gray-200 hover:bg-white">
            Cancel
          </Button>

          {/* Reservation-first footer */}
          {reservationFirst && (
            step === 1 ? (
              <Button onClick={() => setStep(2)} disabled={!reservationStepValid}
                className="h-9 px-6 bg-[#1a1a2e] hover:bg-[#111827] text-white font-medium disabled:opacity-50">
                Next →
              </Button>
            ) : (
              <Button onClick={handleConfirm} disabled={!detailsValid}
                className="h-9 px-6 bg-[#1a1a2e] hover:bg-[#111827] text-white font-medium disabled:opacity-50">
                Convert to Invoice
              </Button>
            )
          )}

          {/* Legacy footer */}
          {!reservationFirst && (
            step === 1 ? (
              mode === "full" ? (
                <Button onClick={() => { setStep(2); initNewAllocs(); }} disabled={!step1Valid}
                  className="h-9 px-6 bg-[#1a1a2e] hover:bg-[#111827] text-white font-medium disabled:opacity-50">
                  Next
                </Button>
              ) : (
                <Button onClick={handleConfirm} disabled={!step1Valid}
                  className="h-9 px-6 bg-[#1a1a2e] hover:bg-[#111827] text-white font-medium disabled:opacity-50">
                  Create Invoice
                </Button>
              )
            ) : (
              <Button onClick={handleConfirm} disabled={!step2Valid}
                className="h-9 px-6 bg-[#1a1a2e] hover:bg-[#111827] text-white font-medium disabled:opacity-50">
                Create Invoice
              </Button>
            )
          )}
        </div>

      </DialogContent>
    </Dialog>
  );
}
