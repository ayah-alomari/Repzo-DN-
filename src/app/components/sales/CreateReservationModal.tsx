import { useState, useEffect } from "react";
import { getProductFamily, getBaseUnit, toBase } from "./measurementUnits";
import {
  X,
  Bookmark,
  Plus,
  Trash2,
  Info,
  AlertTriangle,
  Package,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Minus,
  ArrowLeft,
  ArrowRight
} from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import { useAppData, MOCK_STOCK, getWhStatus } from "../../context/AppDataContext";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../ui/select";
import { Input } from "../ui/input";

interface ReservationLine {
  id: string;
  itemId: string;
  itemName: string;
  qty: number;
  unit: string;
  qtyBase: number;
  warehouse: string;
  enabled: boolean;
}

interface Item {
  id: string;
  name: string;
  sku: string;
  unit: string;
  totalQty: number;
  deliveredQty: number;
  notedQty: number;
}

interface CreateReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reservations: Omit<ReservationLine, 'id' | 'enabled'>[], source?: { type: "SO" | "Invoice" | "Free", number: string }) => void;
  orderItems: Item[];
  warehouses: string[];
  hideLinkTabs?: boolean;
}

const STATUS_CFG = {
  full:    { Icon: CheckCircle2,  cls: "text-green-500",  label: "In Stock" },
  partial: { Icon: AlertTriangle, cls: "text-amber-500", label: "Shortage" },
  none:    { Icon: XCircle,       cls: "text-red-400",    label: "No Stock" },
};

export function CreateReservationModal({
  isOpen,
  onClose,
  onConfirm,
  orderItems,
  warehouses,
  hideLinkTabs = false,
}: CreateReservationModalProps) {
  const defaultUnit = (itemId: string) => {
    const item = orderItems.find(i => i.id === itemId);
    if (item?.unit) return item.unit;
    const family = getProductFamily(itemId);
    return family ? getBaseUnit(family).name : "Piece";
  };

  const blankLine = (): ReservationLine => ({
    id: Math.random().toString(),
    itemId: orderItems[0]?.id || "",
    itemName: orderItems[0]?.name || "",
    qty: 0,
    unit: defaultUnit(orderItems[0]?.id || ""),
    qtyBase: 0,
    warehouse: "",
    enabled: true,
  });

  const { allowMultiWarehouseReservation, reservations } = useAppData();

  const [lines, setLines] = useState<ReservationLine[]>([blankLine()]);
  const [linkType, setLinkType] = useState<"Free" | "SO" | "Invoice">("Free");
  const [sourceNumber, setSourceNumber] = useState("");
  const [view, setView] = useState<"main" | "stock">("main");
  const [sharedWarehouse, setSharedWarehouse] = useState("");

  const resetLines = () => {
    setLines([blankLine()]);
    setLinkType("Free");
    setSourceNumber("");
    setView("main");
    setSharedWarehouse("");
  };

  const handleSharedWarehouseChange = (wh: string) => {
    setSharedWarehouse(wh);
    setLines(prev => prev.map(l => ({ ...l, warehouse: wh })));
  };

  useEffect(() => {
    if (isOpen) {
      resetLines();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const addLine = () => {
    const newLine = blankLine();
    if (!allowMultiWarehouseReservation && sharedWarehouse) {
      newLine.warehouse = sharedWarehouse;
    }
    setLines([...lines, newLine]);
  };

  const removeLine = (id: string) => {
    if (lines.length > 1) {
      setLines(lines.filter(l => l.id !== id));
    }
  };

  const updateLine = (id: string, updates: Partial<ReservationLine>) => {
    setLines(lines.map(l => {
      if (l.id === id) {
        const updated = { ...l, ...updates };
        if (updates.itemId) {
          updated.itemName = orderItems.find(i => i.id === updates.itemId)?.name || "";
          updated.unit = defaultUnit(updates.itemId);
          updated.qtyBase = 0;
          updated.qty = 0;
        }
        // Recalculate qtyBase whenever qty or unit changes
        const family = getProductFamily(updated.itemId);
        updated.qtyBase = family ? toBase(updated.qty, updated.unit, family) : updated.qty;
        return updated;
      }
      return l;
    }));
  };

  const getWhStatusLocal = getWhStatus;

  const calculateStats = (itemId: string, warehouse: string, reserveQtyBase: number) => {
    const actualStock = MOCK_STOCK[itemId]?.[warehouse] || 0;
    // Calculate total reserved for this item and warehouse (active/consumed only)
    const totalReserved = reservations
      .filter(r => r.itemId === itemId && r.warehouse === warehouse && (r.status === "ACTIVE" || r.status === "CONSUMED"))
      .reduce((sum, r) => sum + r.qtyBase, 0);
    
    const freeStock = actualStock - totalReserved;
    const after = freeStock - reserveQtyBase;

    return {
      actual: actualStock,
      reserved: totalReserved,
      free: freeStock,
      after,
      isNegative: after < 0
    };
  };

  const handleConfirm = () => {
    const validLines = lines.filter(l => l.enabled && l.itemId && l.warehouse && l.qty !== 0);
    if (validLines.length === 0) return;
    onConfirm(validLines.map(({ id, enabled: _e, ...rest }) => rest), { type: linkType, number: sourceNumber || "MANUAL" });
    resetLines();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200 border-none">
        
        {/* Stock Impact Panel */}
        {view === "stock" && (
          <div className="flex flex-col h-full overflow-hidden animate-in slide-in-from-right-4 duration-300">
            <div className="px-6 py-5 border-b border-gray-100 bg-white flex items-center justify-between">
              <button onClick={() => setView("main")}
                className="flex items-center gap-1.5 text-[14px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to reservation
              </button>
              <h2 className="text-[16px] font-bold text-gray-900">Inventory Impact Summary</h2>
              <div className="w-20" />
            </div>
            
            <div className="flex-1 overflow-auto p-6">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Item</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Warehouse</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Actual Stock</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Reserved</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Free Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {lines.filter(l => l.itemId && l.warehouse).map(line => {
                    const stats = calculateStats(line.itemId, line.warehouse, line.qtyBase);
                    return (
                      <tr key={line.id} className={`hover:bg-gray-50/50 transition-colors ${stats.isNegative ? "bg-red-50/30" : ""}`}>
                        <td className="px-4 py-4">
                          <p className="text-[13px] font-bold text-gray-900">{line.itemName}</p>
                          <p className="text-[11px] text-gray-400">{line.qty} {line.unit}</p>
                        </td>
                        <td className="px-4 py-4 text-[12px] font-medium text-gray-600">{line.warehouse}</td>
                        <td className="px-4 py-4 text-center text-[13px] font-bold text-gray-700">{stats.actual}</td>
                        <td className="px-4 py-4 text-center text-[13px] font-bold text-amber-600">{stats.reserved}</td>
                        <td className="px-4 py-4 text-center text-[13px] font-bold">
                          <span className={stats.isNegative ? "text-red-500" : "text-green-600"}>{stats.free}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
              <Button onClick={() => setView("main")} className="bg-[#1a1a2e] hover:bg-[#111827] text-white">
                Continue Editing
              </Button>
            </div>
          </div>
        )}

        {/* Main Header */}
        {view === "main" && (
          <>
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-indigo-50/30 animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Bookmark className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-gray-900 tracking-tight">Create Free Reservation</h2>
              <p className="text-[12px] text-gray-500 font-medium italic">Assign items to specific warehouses manually</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-gray-600 border border-transparent hover:border-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 space-y-6">

          <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 flex items-start gap-3 mb-2">
            <Info className="w-4 h-4 text-amber-600 mt-0.5" />
            <div className="text-[12px] text-amber-800 leading-relaxed">
              {allowMultiWarehouseReservation ? (
                <><span className="font-bold">Manual Allocation Mode:</span> Multiple warehouses can be selected for the same item. Negative reservations are permitted and will be tracked for inventory impact.</>
              ) : (
                <><span className="font-bold">Single Warehouse Mode:</span> All items in this reservation must come from the same warehouse. Select a warehouse below to apply it to all lines.</>
              )}
            </div>
          </div>

          {/* Single-warehouse selector (shown when multi-warehouse is disabled) */}
          {!allowMultiWarehouseReservation && (
            <div className="flex flex-col gap-1.5 max-w-sm">
              <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest pl-1">Warehouse (applies to all lines)</label>
              <Select value={sharedWarehouse || undefined} onValueChange={handleSharedWarehouseChange}>
                <SelectTrigger className="h-10 bg-white border-gray-200">
                  <SelectValue placeholder="Select warehouse" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map(wh => (
                    <SelectItem key={wh} value={wh}>{wh}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-3">
            {lines.map((line) => {
              return (
                <div key={line.id} className={`group flex flex-col gap-3 p-4 border border-gray-100 rounded-lg transition-all relative ${line.enabled ? "bg-gray-50/30 hover:bg-white hover:border-indigo-200" : "bg-gray-50/10 opacity-50"}`}>
                  <div className="flex items-center gap-4">
                    {/* Enable/disable checkbox */}
                    <div className="shrink-0 pt-5">
                      <Checkbox
                        checked={line.enabled}
                        onCheckedChange={val => updateLine(line.id, { enabled: !!val })}
                        className="accent-indigo-600"
                      />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest pl-1">Item Selection</label>
                      <Select value={line.itemId || undefined} onValueChange={(val) => updateLine(line.id, { itemId: val })}>
                        <SelectTrigger className="h-10 bg-white border-gray-200">
                          <SelectValue placeholder="Select item" />
                        </SelectTrigger>
                        <SelectContent>
                          {orderItems.map(item => (
                            <SelectItem key={item.id} value={item.id}>{item.name} ({item.sku})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {allowMultiWarehouseReservation && (
                    <div className="flex-1 space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest pl-1">Target Warehouse</label>
                      <Select value={line.warehouse || undefined} onValueChange={(val) => updateLine(line.id, { warehouse: val })}>
                        <SelectTrigger className="h-10 bg-white border-gray-200">
                          <SelectValue placeholder="Select warehouse" />
                        </SelectTrigger>
                        <SelectContent>
                          {warehouses.map(wh => {
                            const stock = MOCK_STOCK[line.itemId]?.[wh] ?? 0;
                            const reserved = Math.floor(stock * 0.2);
                            const available = stock - reserved;

                            if (stock === 0) {
                              return (
                                <SelectItem key={wh} value={wh}>
                                  <div className="flex items-center gap-2 w-full">
                                    <XCircle className="size-3.5 shrink-0 text-red-400" />
                                    <span className="flex-1">{wh}</span>
                                    <span className="text-[10px] bg-red-50 text-red-600 px-1.5 rounded font-bold">Out of Stock</span>
                                  </div>
                                </SelectItem>
                              );
                            }

                            const s = line.qtyBase > available ? "partial" : (available > 0 ? "full" : "none");
                            const { Icon, cls } = STATUS_CFG[s];

                            return (
                              <SelectItem key={wh} value={wh}>
                                <div className="flex items-center gap-2 w-full">
                                  <Icon className={`size-3.5 shrink-0 ${cls}`} />
                                  <span className="flex-1">{wh}</span>
                                  <div className="flex items-center gap-1.5 opacity-60">
                                    <span className="text-[9px] font-bold">T:{stock}</span>
                                    <span className="text-[9px] font-bold">R:{reserved}</span>
                                    <span className="text-[9px] font-bold text-indigo-600">A:{available}</span>
                                  </div>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    )}

                    <div className="w-36 space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest pl-1">Unit</label>
                      {(() => {
                        const family = getProductFamily(line.itemId);
                        const units = family ? family.units : [];
                        const baseUnit = family ? getBaseUnit(family) : null;
                        return units.length > 1 ? (
                          <Select value={line.unit || undefined} onValueChange={(val) => updateLine(line.id, { unit: val })}>
                            <SelectTrigger className="h-10 bg-white border-gray-200">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {units.map(u => (
                                <SelectItem key={u.id} value={u.name}>
                                  <span>{u.name}</span>
                                  {baseUnit && u.factor !== 1 && (
                                    <span className="ml-1.5 text-[10px] text-gray-400">= {u.factor} {baseUnit.name}</span>
                                  )}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="h-10 flex items-center px-3 border border-gray-200 rounded-md bg-gray-50 text-[13px] text-gray-500">
                            {line.unit}
                          </div>
                        );
                      })()}
                    </div>

                    <div className="w-28 space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest pl-1">Reserve Qty</label>
                      <Input
                        type="number"
                        value={line.qty}
                        onChange={(e) => updateLine(line.id, { qty: Math.max(0, parseInt(e.target.value) || 0) })}
                        min={0}
                        className="h-10 text-right bg-white border-gray-200"
                      />
                    </div>

                    <div className="pt-5">
                      <button 
                        onClick={() => removeLine(line.id)}
                        className={`p-2 rounded-lg transition-colors ${lines.length > 1 ? "text-gray-300 hover:text-red-500 hover:bg-red-50" : "invisible"}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between">
            <button 
              onClick={addLine}
              className="py-2.5 px-6 border border-indigo-200 rounded-lg text-indigo-600 text-[13px] font-bold hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Line
            </button>
            
            {lines.some(l => l.itemId && l.warehouse) && (
              <button 
                onClick={() => setView("stock")}
                className="flex items-center gap-1.5 text-[12px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                View stock impact
                {lines.some(l => (MOCK_STOCK[l.itemId]?.[l.warehouse] || 0) < l.qtyBase) && (
                  <span className="text-[9px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded border border-red-100 font-bold">shortage</span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 flex justify-between items-center border-t border-gray-200">
          <button
            onClick={resetLines}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg border border-gray-200 hover:border-red-200 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Clear
          </button>
          <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onClose} className="h-10 px-6">Close</Button>
          <Button
            onClick={handleConfirm}
            disabled={lines.every(l => l.qty === 0 || !l.warehouse || !l.itemId)}
            className="bg-[#1a1a2e] hover:bg-[#111827] text-white h-10 px-8"
          >
            Confirm Reservations
          </Button>
          </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
