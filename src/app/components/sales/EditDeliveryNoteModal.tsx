import { useState, useEffect } from "react";
import { X, Pencil, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent } from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";
import { getProductFamily, toBase, getBaseUnit } from "./measurementUnits";

interface EditDNData {
  rep: string;
  warehouse: string;
  items: { id: string; qty: number; unit: string; qtyBase: number }[];
}

interface SOItemRef {
  id: string;
  unit: string;
  totalQty: number;
  deliveredQty: number;
  notedQty: number;
}

interface EditDeliveryNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: EditDNData) => void;
  dn: any;
  soItems: SOItemRef[];
  reps: string[];
  warehouses: string[];
}

export function EditDeliveryNoteModal({
  isOpen, onClose, onConfirm, dn, soItems, reps, warehouses,
}: EditDeliveryNoteModalProps) {
  const [rep, setRep] = useState<string>("");
  const [warehouse, setWarehouse] = useState<string>("");
  const [itemQtys, setItemQtys] = useState<Record<string, number>>({});

  const rawItems: any[] = Array.isArray(dn?.itemsData) ? dn.itemsData : Array.isArray(dn?.items) ? dn.items : [];

  const editableItems = rawItems.map((item: any) => {
    const soItem = soItems.find(s => s.id === item.id);
    const family = getProductFamily(item.id);
    const soTotalBase = soItem
      ? (family ? toBase(soItem.totalQty, soItem.unit, family) : soItem.totalQty)
      : (item.soQty ?? item.qty);
    const currentBase: number = item.qtyBase ?? item.qty;
    // headroom = total - delivered - (all noted including this DN) + this DN's contribution
    const maxBase = Math.max(
      soTotalBase - (soItem?.deliveredQty ?? 0) - (soItem?.notedQty ?? 0) + currentBase,
      currentBase, // always allow keeping current qty
    );
    const baseUnit = family ? getBaseUnit(family) : null;
    return { ...item, currentBase, maxBase, baseUnit };
  });

  useEffect(() => {
    if (!isOpen) return;
    setRep(dn?.rep ?? "");
    setWarehouse(dn?.warehouse ?? "");
    const initial: Record<string, number> = {};
    rawItems.forEach((item: any) => { initial[item.id] = item.qty ?? 1; });
    setItemQtys(initial);
  }, [isOpen, dn?.id]);

  const handleConfirm = () => {
    const items = editableItems.map((item: any) => {
      const newQty = itemQtys[item.id] ?? item.qty;
      const family = getProductFamily(item.id);
      const newQtyBase = family ? toBase(newQty, item.unit, family) : newQty;
      return { id: item.id, qty: newQty, unit: item.unit, qtyBase: newQtyBase };
    });
    onConfirm({ rep, warehouse, items });
  };

  const hasError = editableItems.some((item: any) => {
    const qty = itemQtys[item.id] ?? item.qty;
    const family = getProductFamily(item.id);
    const qtyBase = family ? toBase(qty, item.unit, family) : qty;
    return qty < 1 || qtyBase > item.maxBase;
  });

  const canConfirm = !!rep && !!warehouse && !hasError;

  return (
    <Dialog open={isOpen} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-[600px] p-0 gap-0 overflow-hidden rounded-[10px]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#1a1a2e]">
          <div>
            <p className="text-[14px] font-bold text-white flex items-center gap-2">
              <Pencil className="w-4 h-4 text-gray-300" /> Edit Delivery Note
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {dn?.dnNumber ?? dn?.id} — editable before any transfer is confirmed
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">

          {/* Rep + Warehouse */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold text-gray-700">Representative</Label>
              <Select value={rep} onValueChange={setRep}>
                <SelectTrigger className="h-9 text-[13px]">
                  <SelectValue placeholder="Select rep" />
                </SelectTrigger>
                <SelectContent>
                  {reps.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold text-gray-700">Warehouse</Label>
              <Select value={warehouse} onValueChange={setWarehouse}>
                <SelectTrigger className="h-9 text-[13px]">
                  <SelectValue placeholder="Select warehouse" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Items table */}
          <div>
            <Label className="text-[12px] font-semibold text-gray-700 mb-2.5 block">Items</Label>
            <div className="border border-gray-100 rounded-lg overflow-hidden shadow-sm">
              <table className="w-full text-[13px]">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-2.5 text-[11px] font-bold text-gray-500 uppercase">Item</th>
                    <th className="text-center px-4 py-2.5 text-[11px] font-bold text-gray-500 uppercase">Max Allowed</th>
                    <th className="text-right px-4 py-2.5 text-[11px] font-bold text-gray-500 uppercase">Quantity</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-50">
                  {editableItems.map((item: any) => {
                    const currentQty = itemQtys[item.id] ?? item.qty;
                    const family = getProductFamily(item.id);
                    const currentQtyBase = family ? toBase(currentQty, item.unit, family) : currentQty;
                    const isOver = currentQtyBase > item.maxBase;

                    return (
                      <tr key={item.id}>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-gray-900">{item.name}</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">{item.sku}</p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-[12px] font-medium text-gray-600">
                            {item.maxBase} {item.baseUnit?.name ?? item.unit}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-1.5">
                              <Input
                                type="number"
                                min={1}
                                value={currentQty}
                                onChange={e => {
                                  const v = parseInt(e.target.value, 10);
                                  if (!isNaN(v) && v >= 1) setItemQtys(prev => ({ ...prev, [item.id]: v }));
                                }}
                                className={`w-20 h-8 text-right text-[13px] font-semibold transition-colors ${
                                  isOver ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-[#4f6ef7]"
                                }`}
                              />
                              <span className="text-[12px] text-gray-500 shrink-0 w-12">{item.unit}</span>
                            </div>
                            {isOver && (
                              <span className="text-[10px] text-red-500 font-semibold flex items-center gap-0.5">
                                <AlertTriangle className="w-2.5 h-2.5" /> Exceeds remaining qty
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <Button variant="outline" onClick={onClose} className="h-9 px-5 text-[13px]">
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="h-9 px-6 bg-[#1a1a2e] hover:bg-[#111827] text-white text-[13px] font-medium shadow-sm disabled:opacity-50"
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
