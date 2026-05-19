import React, { useState, useEffect } from "react";
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
  SelectValue
} from "../ui/select";
import {
  Truck, AlertTriangle, Info, Pencil, Lock, ArrowLeft, Bookmark,
  CheckCircle2, XCircle, Minus
} from "lucide-react";
import { Checkbox } from "../ui/checkbox";

import { MOCK_STOCK, getWhStatus, useAppData } from "../../context/AppDataContext";
import { getProductFamily, getUnitFactor, getBaseUnit, toBase } from "./measurementUnits";
const ITEM_WAREHOUSE_STATUS = getWhStatus;

const STATUS_CFG = {
  full:    { Icon: CheckCircle2, cls: "text-green-500" },
  partial: { Icon: AlertTriangle, cls: "text-amber-500" },
  none:    { Icon: XCircle,      cls: "text-red-400" },
} as const;

interface Item {
  id: string;
  name: string;
  sku: string;
  totalQty: number;
  deliveredQty: number;
  notedQty: number;
  unit: string;
}

interface CreateDeliveryNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (
    data: {
      rep: string;
      items: { id: string; qty: number; unit: string; qtyBase: number; warehouse: string }[];
      isManual: boolean;
    },
    navigateAfterCreate: boolean
  ) => void;
  orderId: string;
  items: Item[];
  reps: string[];
  warehouses: string[];
  reservations: any[];
  soCreatedBy?: string;
  forceReservationTab?: boolean;
  manualDnItemIds?: Set<string>;
}

export function CreateDeliveryNoteModal({
  isOpen, onClose, onConfirm,
  orderId, items, reps, warehouses, reservations, soCreatedBy,
  forceReservationTab = false,
  manualDnItemIds = new Set(),
}: CreateDeliveryNoteModalProps) {
  const [activeTab, setActiveTab] = useState<"manual" | "reservation">("manual");
  const [selectedRep, setSelectedRep] = useState("");
  const [repLocked, setRepLocked] = useState(false);
  const [navigateToDN, setNavigateToDN] = useState(false);
  const [view, setView] = useState<"main" | "stock">("main");
  const [showOnlyNegative, setShowOnlyNegative] = useState(false);

  // Manual tab state
  const [itemWarehouses, setItemWarehouses] = useState<Record<string, string>>({});
  const [deliveryQtys, setDeliveryQtys] = useState<Record<string, number>>({});
  const [selectedUnits, setSelectedUnits] = useState<Record<string, string>>({});
  const [editedQtys, setEditedQtys] = useState<Set<string>>(new Set());
  const [selectedManualIds, setSelectedManualIds] = useState<Set<string>>(new Set());

  // Reservation tab state
  const [selectedResIds, setSelectedResIds] = useState<Set<string>>(new Set());
  const [resQtys, setResQtys] = useState<Record<string, number>>({});

  const { allowMultiWarehouseReservation } = useAppData();
  const [globalWarehouse, setGlobalWarehouse] = useState("");

  const allSoReservations = reservations.filter(r => r.status === "ACTIVE" && r.warehouse && r.qty > 0);
  const activeReservations = allSoReservations;
  const activeRes = reservations.find(r => r.status === "ACTIVE" && r.warehouse);
  const globalWarehouseLocked = !allowMultiWarehouseReservation && !!activeRes?.warehouse;

  useEffect(() => {
    if (!isOpen) return;

    const initialUnits: Record<string, string> = {};
    items.forEach(item => { initialUnits[item.id] = item.unit; });
    setSelectedUnits(initialUnits);

    const initialQtys: Record<string, number> = {};
    items.forEach(item => {
      const family = getProductFamily(item.id);
      const totalBase = family ? toBase(item.totalQty, item.unit, family) : item.totalQty;
      const remainingBase = totalBase - item.deliveredQty - item.notedQty;
      const factor = family ? getUnitFactor(item.unit, family) : 1;
      initialQtys[item.id] = remainingBase > 0 && factor > 0 ? Math.floor(remainingBase / factor) : 0;
    });
    setDeliveryQtys(initialQtys);

    // Pre-fill per-item warehouses from active reservations
    const initialWh: Record<string, string> = {};
    items.forEach(item => {
      const res = reservations.find(r => r.itemId === item.id && r.status === "ACTIVE" && r.warehouse);
      if (res?.warehouse) initialWh[item.id] = res.warehouse;
    });
    setItemWarehouses(initialWh);

    if (soCreatedBy) {
      setSelectedRep(soCreatedBy);
      setRepLocked(true);
    } else {
      setSelectedRep("");
      setRepLocked(false);
    }

    const initialResQtys: Record<string, number> = {};
    activeReservations.forEach(r => { initialResQtys[r.id] = r.qty; });
    setResQtys(initialResQtys);

    setActiveTab(forceReservationTab ? "reservation" : "manual");
    setSelectedResIds(new Set());
    setSelectedManualIds(new Set(items.filter(item => {
      const fam = getProductFamily(item.id);
      const totalBase = fam ? toBase(item.totalQty, item.unit, fam) : item.totalQty;
      return totalBase - item.deliveredQty - item.notedQty > 0;
    }).map(i => i.id)));
    setEditedQtys(new Set());
    setView("main");
    setShowOnlyNegative(false);
    setNavigateToDN(false);

    const activeRes = reservations.find(r => r.status === "ACTIVE" && r.warehouse);
    if (!allowMultiWarehouseReservation && activeRes?.warehouse) {
      setGlobalWarehouse(activeRes.warehouse);
    } else {
      setGlobalWarehouse("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (!allowMultiWarehouseReservation && globalWarehouse) {
      const synced: Record<string, string> = {};
      items.forEach(item => { synced[item.id] = globalWarehouse; });
      setItemWarehouses(synced);
    }
  }, [globalWarehouse, allowMultiWarehouseReservation]);

  // Per-item stock rows for the stock view (manual tab only)
  const stockRows = items.map(item => {
    const wh = itemWarehouses[item.id];
    if (!wh) return { ...item, warehouse: "", before: 0, after: 0, negative: false, hasWarehouse: false };
    const before = MOCK_STOCK[item.id]?.[wh] ?? 0;
    const family = getProductFamily(item.id);
    const unit = selectedUnits[item.id] || item.unit;
    const factor = family ? getUnitFactor(unit, family) : 1;
    const deductBase = (deliveryQtys[item.id] ?? 0) * factor;
    const after = before - deductBase;
    return { ...item, warehouse: wh, before, after, negative: after < 0, hasWarehouse: true };
  });

  const handleQtyChange = (id: string, value: string, maxInUnit: number) => {
    const val = parseInt(value, 10);
    setEditedQtys(prev => new Set([...prev, id]));
    if (isNaN(val)) { setDeliveryQtys(prev => ({ ...prev, [id]: 0 })); return; }
    setDeliveryQtys(prev => ({ ...prev, [id]: Math.min(Math.max(0, val), maxInUnit) }));
  };

  const handleUnitChange = (itemId: string, newUnit: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    const family = getProductFamily(itemId);
    if (!family) { setSelectedUnits(prev => ({ ...prev, [itemId]: newUnit })); return; }
    const oldUnit = selectedUnits[itemId] || item.unit;
    const oldFactor = getUnitFactor(oldUnit, family);
    const newFactor = getUnitFactor(newUnit, family);
    const currentQtyBase = (deliveryQtys[itemId] ?? 0) * oldFactor;
    const newQty = newFactor > 0 ? Math.floor(currentQtyBase / newFactor) : 0;
    setSelectedUnits(prev => ({ ...prev, [itemId]: newUnit }));
    setDeliveryQtys(prev => ({ ...prev, [itemId]: newQty }));
  };

  const handleConfirmManual = () => {
    if (!selectedRep) return;
    const itemsToDeliver = Object.entries(deliveryQtys)
      .filter(([id, qty]) => qty > 0 && itemWarehouses[id] && selectedManualIds.has(id))
      .map(([id, qty]) => {
        const item = items.find(i => i.id === id)!;
        const unit = selectedUnits[id] || item.unit;
        const family = getProductFamily(id);
        const qtyBase = family ? toBase(qty, unit, family) : qty;
        return { id, qty, unit, qtyBase, warehouse: itemWarehouses[id] };
      });
    if (itemsToDeliver.length === 0) return;
    onConfirm({ rep: selectedRep, items: itemsToDeliver, isManual: true }, navigateToDN);
  };

  const handleConfirmFromReservation = () => {
    if (!selectedRep || selectedResIds.size === 0) return;
    const itemsToDeliver = Array.from(selectedResIds).map(resId => {
      const res = allSoReservations.find(r => r.id === resId)!;
      const qty = resQtys[resId] ?? res.qty;
      const family = getProductFamily(res.itemId);
      const qtyBase = family ? toBase(qty, res.unit, family) : qty;
      return { id: res.itemId, qty, unit: res.unit, qtyBase, warehouse: res.warehouse as string };
    });
    if (itemsToDeliver.length === 0) return;
    onConfirm({ rep: selectedRep, items: itemsToDeliver, isManual: false }, navigateToDN);
  };

  const selectableItems = items.filter(item => {
    const fam = getProductFamily(item.id);
    const totalBase = fam ? toBase(item.totalQty, item.unit, fam) : item.totalQty;
    return totalBase - item.deliveredQty - item.notedQty > 0;
  });

  const manualCanConfirm = !!(
    selectedRep &&
    (allowMultiWarehouseReservation
      ? Object.entries(deliveryQtys).some(([id, qty]) => qty > 0 && itemWarehouses[id] && selectedManualIds.has(id))
      : globalWarehouse && Object.entries(deliveryQtys).some(([id, qty]) => qty > 0 && selectedManualIds.has(id)))
  );
  const resCanConfirm = !!(selectedRep && selectedResIds.size > 0);

  const repSection = (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-[13px] font-bold text-gray-800 flex items-center gap-1">
          Assign Representative <span className="text-red-500">*</span>
        </Label>
        {repLocked ? (
          <button onClick={() => setRepLocked(false)}
            className="text-[10px] font-bold text-[#4f6ef7] bg-[#f0f4ff] hover:bg-[#e0e7ff] px-2 py-0.5 rounded border border-[#d0d7ff] flex items-center gap-1 transition-colors">
            <Pencil className="w-2.5 h-2.5" /> Change
          </button>
        ) : (
          <button onClick={() => setRepLocked(true)}
            className="text-[10px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 px-2 py-0.5 rounded border border-gray-200 flex items-center gap-1 transition-colors">
            <Lock className="w-2.5 h-2.5" /> Lock
          </button>
        )}
      </div>
      {repLocked ? (
        <div className="h-10 px-3 flex items-center bg-indigo-50/60 border border-indigo-100 rounded-md text-[13px] font-semibold text-indigo-800">
          {selectedRep}
        </div>
      ) : (
        <Select value={selectedRep} onValueChange={setSelectedRep}>
          <SelectTrigger className="h-10 border-gray-200 focus:border-[#4f6ef7]">
            <SelectValue placeholder="Select a rep" />
          </SelectTrigger>
          <SelectContent>
            {reps.map(rep => <SelectItem key={rep} value={rep}>{rep}</SelectItem>)}
          </SelectContent>
        </Select>
      )}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[920px] p-0 overflow-hidden border-none shadow-2xl bg-white">

        {/* ── Stock Panel ── */}
        {view === "stock" && (() => {
          const hasShortage = stockRows.some(r => r.hasWarehouse && r.negative);
          const visible = showOnlyNegative
            ? stockRows.filter(r => r.hasWarehouse && r.negative)
            : stockRows.filter(r => r.hasWarehouse);
          return (
            <>
              <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between bg-white">
                <button onClick={() => setView("main")}
                  className="flex items-center gap-1.5 text-[13px] font-semibold text-gray-700 hover:text-gray-900 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Create Delivery Note
                </button>
                <button onClick={() => setShowOnlyNegative(v => !v)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full border transition-all ${showOnlyNegative ? "bg-red-50 text-red-600 border-red-200" : "bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300"}`}>
                  Show only negative stocks
                </button>
              </div>
              <div className="overflow-y-auto max-h-[420px]">
                {hasShortage && (
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border-b border-amber-100">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <p className="text-[11px] text-amber-700 font-medium">Some items will go negative after this delivery.</p>
                  </div>
                )}
                <table className="w-full text-[13px]">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-5 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Item</th>
                      <th className="text-left px-5 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Warehouse</th>
                      <th className="text-center px-5 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Before</th>
                      <th className="text-center px-5 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">After</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-10 text-[13px] text-gray-400">
                          No items with warehouses selected.
                        </td>
                      </tr>
                    ) : visible.map(row => (
                      <tr key={row.id} className={`border-b border-gray-50 ${row.negative ? "bg-red-50/30" : ""}`}>
                        <td className="px-5 py-3">
                          <p className="font-semibold text-gray-900">{row.name}</p>
                          <p className="text-[11px] text-gray-400">{row.unit}</p>
                        </td>
                        <td className="px-5 py-3 text-[12px] text-gray-600 font-medium">{row.warehouse}</td>
                        <td className="px-5 py-3 text-center font-bold text-gray-700">{row.before}</td>
                        <td className="px-5 py-3 text-center font-bold">
                          <span className={row.negative ? "text-red-500" : "text-green-600"}>{row.after}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-end">
                <Button onClick={() => setView("main")}
                  className="h-9 px-6 bg-[#1a1a2e] hover:bg-[#111827] text-white text-[12px] font-medium">
                  Back
                </Button>
              </div>
            </>
          );
        })()}

        {/* ── Main Form ── */}
        {view === "main" && (
          <>
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center bg-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#f0f4ff] rounded-lg">
                  <Truck className="w-5 h-5 text-[#4f6ef7]" />
                </div>
                <div>
                  <DialogTitle className="text-[18px] font-bold text-gray-900 leading-tight">Create Delivery Note</DialogTitle>
                  <DialogDescription className="text-[13px] text-gray-500 mt-0.5">
                    Initiate a delivery for Sales Order {orderId}
                  </DialogDescription>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 bg-white px-6 gap-1">
              {!forceReservationTab && (
                <button
                  onClick={() => setActiveTab("manual")}
                  className={`py-3 px-1 mr-5 text-[13px] font-semibold border-b-2 -mb-px transition-colors ${activeTab === "manual" ? "border-[#4f6ef7] text-[#4f6ef7]" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                >
                  Manual
                </button>
              )}
              <button
                onClick={() => !forceReservationTab && setActiveTab("reservation")}
                className={`py-3 px-1 text-[13px] font-semibold border-b-2 -mb-px transition-colors flex items-center gap-1.5 ${activeTab === "reservation" ? "border-[#4f6ef7] text-[#4f6ef7]" : "border-transparent text-gray-500 hover:text-gray-700"}`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                From Reservation
                {activeReservations.length > 0 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === "reservation" ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-500"}`}>
                    {activeReservations.length}
                  </span>
                )}
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
              {repSection}

              {/* ── Manual Tab ── */}
              {activeTab === "manual" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-[13px] font-bold text-gray-800">Delivery Quantities</Label>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#4f6ef7] bg-[#f0f4ff] px-2 py-1 rounded-md">
                      <Info className="w-3.5 h-3.5" />
                      <span>{allowMultiWarehouseReservation ? "Select a warehouse per item" : "One warehouse for all items"}</span>
                    </div>
                  </div>

                  {!allowMultiWarehouseReservation && (
                    <div className="flex items-center gap-3">
                      <Label className="text-[12px] font-semibold text-gray-700 shrink-0">Warehouse</Label>
                      <div className="flex items-center gap-2">
                        <Select
                          value={globalWarehouse}
                          onValueChange={setGlobalWarehouse}
                          disabled={globalWarehouseLocked}
                        >
                          <SelectTrigger className="h-9 border-gray-200 text-[13px] w-[260px] disabled:bg-indigo-50/60 disabled:text-indigo-800 disabled:border-indigo-100 disabled:font-semibold">
                            <SelectValue placeholder="Select warehouse..." />
                          </SelectTrigger>
                          <SelectContent>
                            {warehouses.map(wh => (
                              <SelectItem key={wh} value={wh}>{wh}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {globalWarehouseLocked && (
                          <span className="text-[11px] font-bold px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1">
                            <Lock className="w-3.5 h-3.5 text-indigo-400" /> Locked by Reservation
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="border border-gray-100 rounded-lg overflow-hidden shadow-sm">
                    <table className="w-full text-[13px]">
                      <thead className="bg-gray-50">
                        <tr className="border-b border-gray-100">
                          <th className="px-4 py-2.5 w-10 text-center">
                            <Checkbox
                              checked={selectableItems.length > 0 && selectableItems.every(i => selectedManualIds.has(i.id))}
                              onCheckedChange={val => {
                                if (val) setSelectedManualIds(new Set(selectableItems.map(i => i.id)));
                                else setSelectedManualIds(new Set());
                              }}
                              className="mx-auto"
                            />
                          </th>
                          <th className="text-left px-4 py-2.5 text-[11px] font-bold text-gray-500 uppercase">Item</th>
                          <th className="text-center px-4 py-2.5 text-[11px] font-bold text-gray-500 uppercase">Ordered</th>
                          {allowMultiWarehouseReservation && (
                            <th className="text-left px-4 py-2.5 text-[11px] font-bold text-gray-500 uppercase">Warehouse</th>
                          )}
                          <th className="text-center px-4 py-2.5 text-[11px] font-bold text-gray-500 uppercase">Remaining</th>
                          <th className="text-right px-4 py-2.5 text-[11px] font-bold text-gray-500 uppercase">Delivery Qty</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-50">
                        {items.map(item => {
                          const family = getProductFamily(item.id);
                          const selUnit = selectedUnits[item.id] || item.unit;
                          const selFactor = family ? getUnitFactor(selUnit, family) : 1;
                          const totalBase = family ? toBase(item.totalQty, item.unit, family) : item.totalQty;
                          const remainingBase = totalBase - item.deliveredQty - item.notedQty;
                          const maxInUnit = selFactor > 0 ? Math.floor(remainingBase / selFactor) : 0;
                          const baseUnit = family ? getBaseUnit(family) : null;
                          const availableUnits = family
                            ? family.units.filter(u => remainingBase > 0 && u.factor <= remainingBase)
                            : null;
                          const isLocked = remainingBase <= 0;
                          const existingRes = reservations.find((r: any) => r.itemId === item.id && r.status === "ACTIVE" && r.warehouse && r.qty > 0);
                          const whFromReservation = existingRes?.warehouse as string | undefined;
                          const hasActiveNote = item.notedQty > 0 && remainingBase > 0;
                          const notedInUnit = selFactor > 0 ? Math.floor(item.notedQty / selFactor) : item.notedQty;
                          const checked = selectedManualIds.has(item.id);

                          return (
                            <tr key={item.id} className={`transition-colors ${
                              isLocked
                                ? "bg-gray-50/80 opacity-60"
                                : checked ? "bg-indigo-50/20 hover:bg-indigo-50/30" : "opacity-40 bg-gray-50/40"
                            }`}>
                              <td className="px-4 py-3 text-center">
                                {isLocked ? (
                                  <div className="flex justify-center" title="Already fully noted for delivery">
                                    <Lock className="w-3.5 h-3.5 text-gray-400" />
                                  </div>
                                ) : (
                                  <Checkbox
                                    checked={checked}
                                    onCheckedChange={val => {
                                      setSelectedManualIds(prev => {
                                        const next = new Set(prev);
                                        if (val) next.add(item.id);
                                        else next.delete(item.id);
                                        return next;
                                      });
                                    }}
                                    className="accent-[#4f6ef7]"
                                  />
                                )}
                              </td>
                              <td className="px-4 py-3 opacity-90">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-semibold text-gray-900">{item.name}</p>
                                  {isLocked && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                                      <Lock className="w-2.5 h-2.5" /> In Active Delivery Note
                                    </span>
                                  )}
                                  {hasActiveNote && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-200">
                                      {notedInUnit} {selUnit} noted
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-gray-400">SKU: {item.sku || '—'} · {item.unit}</p>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className="text-[13px] font-semibold text-indigo-700">{item.totalQty}</span>
                                <span className="text-[11px] text-gray-400 ml-1">{item.unit}</span>
                              </td>
                              {allowMultiWarehouseReservation && (
                              <td className="px-4 py-3">
                                {whFromReservation ? (
                                  <div className="flex items-center gap-1.5 h-8 px-2.5 rounded-md bg-indigo-50 border border-indigo-100 text-[12px] font-semibold text-indigo-800 min-w-[155px]">
                                    <Lock className="w-3 h-3 text-indigo-400 shrink-0" />
                                    {whFromReservation}
                                  </div>
                                ) : (
                                <Select
                                  value={itemWarehouses[item.id] || ""}
                                  onValueChange={v => setItemWarehouses(prev => ({ ...prev, [item.id]: v }))}
                                  disabled={isLocked || !checked}
                                >
                                  <SelectTrigger className="h-8 text-[12px] border-gray-200 min-w-[155px]">
                                    <SelectValue placeholder="Select..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {warehouses.map(wh => {
                                      const stock = MOCK_STOCK[item.id]?.[wh] ?? 0;
                                      if (stock === 0) {
                                        return (
                                          <SelectItem key={wh} value={wh}>
                                            <XCircle className="size-3.5 shrink-0 text-red-400" />
                                            <span>{wh}</span>
                                          </SelectItem>
                                        );
                                      }
                                      const hasEdited = editedQtys.has(item.id);
                                      const enteredBase = hasEdited ? (deliveryQtys[item.id] ?? 0) * selFactor : 0;
                                      if (enteredBase === 0) {
                                        return (
                                          <SelectItem key={wh} value={wh}>
                                            <Minus className="size-3.5 shrink-0 text-gray-300" />
                                            <span>{wh}</span>
                                          </SelectItem>
                                        );
                                      }
                                      const s = ITEM_WAREHOUSE_STATUS(item.id, wh, enteredBase);
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
                                )}
                              </td>
                              )}
                              <td className="px-4 py-3 text-center">
                                <span className={`text-[13px] font-medium ${remainingBase > 0 ? "text-gray-900" : "text-gray-400"}`}>
                                  {maxInUnit} {selUnit}
                                </span>
                                {baseUnit && selUnit !== baseUnit.name && (
                                  <p className="text-[10px] text-gray-400 mt-0.5">{remainingBase} {baseUnit.name}</p>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center justify-end gap-2">
                                  <Input
                                    type="number" step={1} min={0} max={maxInUnit}
                                    value={deliveryQtys[item.id] ?? 0}
                                    onChange={e => handleQtyChange(item.id, e.target.value, maxInUnit)}
                                    disabled={isLocked || remainingBase <= 0 || !checked}
                                    className="w-20 h-9 text-right text-[13px] font-semibold border-gray-200 focus:border-[#4f6ef7] disabled:opacity-40"
                                  />
                                  {availableUnits && availableUnits.length > 1 ? (
                                    <select
                                      value={selUnit}
                                      onChange={e => handleUnitChange(item.id, e.target.value)}
                                      disabled={isLocked || !checked}
                                      className="h-9 text-[12px] border border-gray-200 rounded px-1.5 bg-white text-gray-700 cursor-pointer outline-none focus:border-[#4f6ef7] min-w-[72px] disabled:opacity-40"
                                    >
                                      {availableUnits.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                                    </select>
                                  ) : (
                                    <span className="text-[12px] text-gray-500 w-14 text-left">{selUnit}</span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <button
                    onClick={() => setView("stock")}
                    disabled={!stockRows.some(r => r.hasWarehouse)}
                    className="flex items-center gap-1 text-[12px] font-semibold text-[#4f6ef7] hover:text-[#3a57d4] transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
                  >
                    View stock impact
                    {stockRows.some(r => r.negative) && (
                      <span className="ml-1 text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">shortage</span>
                    )}
                  </button>
                </div>
              )}

              {/* ── From Reservation Tab ── */}
              {activeTab === "reservation" && (
                <div className="space-y-3">
                  {allSoReservations.length === 0 ? (
                    <div className="flex flex-col items-center py-12 text-center">
                      <Bookmark className="w-10 h-10 text-gray-200 mb-3" />
                      <p className="text-[13px] text-gray-500 font-medium">No reservations for this order.</p>
                      <p className="text-[12px] text-gray-400 mt-1">Switch to Manual to create a delivery note without reservations.</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <Label className="text-[13px] font-bold text-gray-800">Reservations</Label>
                        <button
                          onClick={() => {
                            const positiveResIds = activeReservations
                              .filter(r => {
                                const stock = MOCK_STOCK[r.itemId]?.[r.warehouse] || 0;
                                return r.qtyBase <= stock && !r.linkedDNId;
                              })
                              .map(r => r.id);

                            if (selectedResIds.size === positiveResIds.length && positiveResIds.every(id => selectedResIds.has(id))) {
                              setSelectedResIds(new Set());
                            } else {
                              setSelectedResIds(new Set(positiveResIds));
                            }
                          }}
                          className="text-[11px] font-semibold text-[#4f6ef7] hover:text-[#3a57d4] transition-colors"
                        >
                          {selectedResIds.size > 0 ? "Deselect all" : "Select all positive"}
                        </button>
                      </div>

                      <div className="border border-gray-100 rounded-lg overflow-hidden shadow-sm">
                        <table className="w-full text-[13px]">
                          <thead className="bg-gray-50">
                            <tr className="border-b border-gray-100">
                              <th className="px-4 py-2.5 w-10 text-center">
                                {(() => {
                                  const selectableResIds = activeReservations.filter(r => !r.linkedDNId).map(r => r.id);
                                  const allSelected = selectableResIds.length > 0 && selectableResIds.every(id => selectedResIds.has(id));
                                  return (
                                    <Checkbox
                                      checked={allSelected}
                                      onCheckedChange={val => {
                                        if (val) setSelectedResIds(new Set(selectableResIds));
                                        else setSelectedResIds(new Set());
                                      }}
                                      className="mx-auto"
                                    />
                                  );
                                })()}
                              </th>
                              <th className="text-left px-4 py-2.5 text-[11px] font-bold text-gray-500 uppercase">Item</th>
                              <th className="text-left px-4 py-2.5 text-[11px] font-bold text-gray-500 uppercase">Warehouse</th>
                              <th className="text-center px-4 py-2.5 text-[11px] font-bold text-gray-500 uppercase">Pending to Deliver</th>
                              <th className="text-center px-4 py-2.5 text-[11px] font-bold text-gray-500 uppercase">Reserved</th>
                              <th className="text-right px-4 py-2.5 text-[11px] font-bold text-gray-500 uppercase">Deliver Qty</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-50">
                            {allSoReservations.map(res => {
                              const checked = selectedResIds.has(res.id);
                              const family = getProductFamily(res.itemId);
                              const baseUnit = family ? getBaseUnit(family) : null;
                              const currentQty = resQtys[res.id] ?? res.qty;

                              const stock = MOCK_STOCK[res.itemId]?.[res.warehouse] || 0;
                              const isPositive = res.qtyBase <= stock;
                              const isRevokedStatus = res.status === "REVOKED";
                              const isCanceled = res.status === "CANCELED";
                              const isLocked = isCanceled || isRevokedStatus || !isPositive || !!res.linkedDNId;

                              return (
                                <tr
                                  key={res.id}
                                  className={`transition-colors ${isCanceled ? "bg-gray-50/60 opacity-55" : !isPositive ? "opacity-60 grayscale-[0.5] cursor-not-allowed hover:bg-gray-50/50" : `cursor-pointer hover:bg-gray-50/50 ${checked ? "bg-indigo-50/20" : ""}`}`}
                                  onClick={() => {
                                    if (isLocked) return;
                                    setSelectedResIds(prev => {
                                      const next = new Set(prev);
                                      if (next.has(res.id)) next.delete(res.id);
                                      else next.add(res.id);
                                      return next;
                                    });
                                  }}
                                >
                                  <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                                    {isLocked ? (
                                      <div className="flex justify-center" title={res.linkedDNId ? "Already noted for delivery" : "Locked"}>
                                        <Lock className="w-3.5 h-3.5 text-gray-400" />
                                      </div>
                                    ) : (
                                      <Checkbox
                                        checked={checked}
                                        onCheckedChange={val => {
                                          setSelectedResIds(prev => {
                                            const next = new Set(prev);
                                            if (val) next.add(res.id);
                                            else next.delete(res.id);
                                            return next;
                                          });
                                        }}
                                      />
                                    )}
                                  </td>
                                  <td className="px-4 py-3">
                                    <p className={`font-semibold ${isCanceled ? "text-gray-400" : "text-gray-900"}`}>{res.itemName}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100">
                                        {res.type === "AUTO" ? "Stock" : "Manual"}
                                      </span>
                                      {res.linkedDNId && (
                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                                          <Lock className="w-2.5 h-2.5" /> In Active Delivery Note
                                        </span>
                                      )}
                                      {isRevokedStatus && !res.linkedDNId && (
                                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-200 flex items-center gap-1">
                                          <Bookmark className="w-2.5 h-2.5" /> Revoked (Delivered)
                                        </span>
                                      )}
                                      {isCanceled && (
                                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 border border-gray-200 flex items-center gap-1">
                                          <CheckCircle2 className="w-2.5 h-2.5" /> Canceled
                                        </span>
                                      )}
                                      {!isCanceled && !isPositive && (
                                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-red-50 text-red-600 border border-red-100 flex items-center gap-1">
                                          <XCircle className="w-2.5 h-2.5" /> Negative Reservation
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className="text-[12px] font-semibold text-gray-800">{res.warehouse}</span>
                                    <p className="text-[10px] text-gray-400 font-bold mt-0.5">Avail: {stock} {res.unit}</p>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <span className="text-[13px] font-medium text-gray-500">
                                      {res.linkedDNId ? `${res.qty} ${res.unit}` : "—"}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <span className={`text-[13px] font-medium ${!res.linkedDNId ? "text-gray-900" : "text-gray-400"}`}>
                                      {!res.linkedDNId ? `${res.qty} ${res.unit}` : "—"}
                                    </span>
                                    {baseUnit && res.unit !== baseUnit.name && !res.linkedDNId && (
                                      <p className="text-[10px] text-gray-400 mt-0.5">{res.qtyBase} {baseUnit.name}</p>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                                    <Input
                                      type="number" step={1} min={1} max={res.qty}
                                      value={currentQty}
                                      onChange={e => {
                                        const val = parseInt(e.target.value, 10);
                                        if (!isNaN(val)) setResQtys(prev => ({ ...prev, [res.id]: Math.min(Math.max(1, val), res.qty) }));
                                      }}
                                      disabled={!checked || isLocked}
                                      className="w-20 h-9 text-right text-[13px] font-semibold border-gray-200 focus:border-[#4f6ef7] disabled:opacity-40 ml-auto"
                                    />
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {selectedResIds.size > 0 && (
                        <p className="text-[11px] text-gray-400 leading-relaxed">
                          <span className="font-semibold text-gray-600">{selectedResIds.size} reservation{selectedResIds.size > 1 ? "s" : ""} selected — </span>
                          {Array.from(selectedResIds).map((id, i) => {
                            const res = allSoReservations.find(r => r.id === id)!;
                            return (
                              <span key={id}>
                                {i > 0 && "; "}
                                {resQtys[id] ?? res.qty} {res.unit} of <span className="font-medium text-gray-700">{res.itemName}</span> from {res.warehouse}
                              </span>
                            );
                          })}
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Navigate checkbox */}
               <div className="flex items-center gap-2.5 pt-1">
                 <Checkbox
                   id="navigateDN"
                   checked={navigateToDN}
                   onCheckedChange={val => setNavigateToDN(!!val)}
                 />
                 <label htmlFor="navigateDN" className="text-[12px] font-medium text-gray-700 cursor-pointer">
                   Navigate to delivery note after creating
                 </label>
               </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-2 text-[11.5px] text-blue-600 bg-blue-50/70 px-3 py-1.5 rounded-md border border-blue-100/50">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span className="font-medium">Creating this Delivery Note automatically generates a Transfer to the Rep's Van Warehouse.</span>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={onClose}
                  className="h-10 px-6 text-gray-700 font-medium hover:bg-white border-gray-200">
                  Cancel
                </Button>
                <Button
                  onClick={activeTab === "manual" ? handleConfirmManual : handleConfirmFromReservation}
                  disabled={activeTab === "manual" ? !manualCanConfirm : !resCanConfirm}
                  className="h-10 px-8 bg-[#1a1a2e] hover:bg-[#111827] text-white font-medium shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  Create
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
