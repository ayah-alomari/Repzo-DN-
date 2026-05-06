import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Truck, Lock, Pencil } from "lucide-react";

// ── types ────────────────────────────────────────────────────────────────────
export interface DNReservationItem {
  itemId: string;
  itemName: string;
  sku: string;
  unit: string;
  warehouse: string;
  invoicedQty: number; // total on the invoice — shown in gray
  reservedQty: number; // total originally reserved
  dnedQty: number;     // already delivered via previous DNs
}

interface CreateDNFromReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: {
    rep: string;
    items: { itemId: string; qty: number; unit: string; warehouse: string }[];
  }) => void;
  invoiceId: string;
  defaultRep: string;
  reps: string[];
  reservationItems: DNReservationItem[];
}

// ── component ────────────────────────────────────────────────────────────────
export function CreateDNFromReservationModal({
  isOpen,
  onClose,
  onConfirm,
  invoiceId,
  defaultRep,
  reps,
  reservationItems,
}: CreateDNFromReservationModalProps) {
  const [rep, setRep] = useState(defaultRep);
  const [repLocked, setRepLocked] = useState(true);

  // per-item: enabled checkbox + qty to deliver
  const [enabled, setEnabled] = useState<Record<string, boolean>>({});
  const [deliverQtys, setDeliverQtys] = useState<Record<string, number>>({});

  const pendingItems = reservationItems.filter(i => i.reservedQty - i.dnedQty > 0);

  useEffect(() => {
    if (!isOpen) return;
    setRep(defaultRep);
    setRepLocked(true);

    const initEnabled: Record<string, boolean> = {};
    const initQtys: Record<string, number> = {};
    pendingItems.forEach(item => {
      initEnabled[item.itemId] = true;
      initQtys[item.itemId] = item.reservedQty - item.dnedQty; // default to full remaining
    });
    setEnabled(initEnabled);
    setDeliverQtys(initQtys);
  }, [isOpen]);

  const canConfirm =
    rep.trim() !== "" &&
    pendingItems.some(i => enabled[i.itemId] && (deliverQtys[i.itemId] ?? 0) > 0);

  function handleConfirm() {
    const items = pendingItems
      .filter(i => enabled[i.itemId] && (deliverQtys[i.itemId] ?? 0) > 0)
      .map(i => ({
        itemId: i.itemId,
        qty: deliverQtys[i.itemId],
        unit: i.unit,
        warehouse: i.warehouse,
      }));
    onConfirm({ rep, items });
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden border-none shadow-2xl bg-white">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div className="p-2 bg-[#f0f4ff] rounded-lg shrink-0">
            <Truck className="w-5 h-5 text-[#4f6ef7]" />
          </div>
          <div>
            <DialogTitle className="text-[17px] font-bold text-gray-900 leading-tight">
              Create Delivery Note
            </DialogTitle>
            <DialogDescription className="text-[12px] text-gray-400 mt-0.5">
              From reservation — Invoice {invoiceId}
            </DialogDescription>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Rep row */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-[11px] font-bold text-gray-500 uppercase mb-1.5">
                Assigned Representative <span className="text-red-400">*</span>
              </p>
              {repLocked ? (
                <div className="h-9 px-3 flex items-center bg-indigo-50/60 border border-indigo-100 rounded-md text-[13px] font-semibold text-indigo-800">
                  {rep}
                </div>
              ) : (
                <Select value={rep} onValueChange={setRep}>
                  <SelectTrigger className="h-9 border-gray-200 text-[13px]">
                    <SelectValue placeholder="Select rep" />
                  </SelectTrigger>
                  <SelectContent>
                    {reps.map(r => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <button
              onClick={() => setRepLocked(v => !v)}
              className="mt-5 text-[10px] font-bold flex items-center gap-1 px-2 py-1 rounded border transition-colors text-[#4f6ef7] bg-[#f0f4ff] hover:bg-[#e0e7ff] border-[#d0d7ff]"
            >
              {repLocked ? <><Pencil className="w-2.5 h-2.5" /> Change</> : <><Lock className="w-2.5 h-2.5" /> Lock</>}
            </button>
          </div>

          {/* Items table */}
          {pendingItems.length === 0 ? (
            <div className="py-12 text-center">
              <Truck className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-[13px] font-semibold text-gray-400">All reserved items have been delivered.</p>
            </div>
          ) : (
            <div className="border border-gray-100 rounded-lg overflow-hidden shadow-sm">
              <table className="w-full text-[13px]">
                <thead className="bg-[#f7f7f9] border-b border-gray-100">
                  <tr>
                    <th className="w-10 px-3 py-2.5" />
                    <th className="text-left px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="text-left px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Warehouse
                    </th>
                    <th className="text-center px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      Total (Invoice)
                    </th>
                    <th className="text-center px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Delivered
                    </th>
                    <th className="text-center px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Remaining
                    </th>
                    <th className="text-right px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      This DN
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-50">
                  {pendingItems.map(item => {
                    const remaining = item.reservedQty - item.dnedQty;
                    const isEnabled = enabled[item.itemId] ?? true;
                    const qty = deliverQtys[item.itemId] ?? remaining;

                    return (
                      <tr
                        key={item.itemId}
                        className={`transition-colors ${isEnabled ? "hover:bg-gray-50/50" : "opacity-40"}`}
                      >
                        {/* Checkbox */}
                        <td className="px-3 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={isEnabled}
                            onChange={e =>
                              setEnabled(prev => ({ ...prev, [item.itemId]: e.target.checked }))
                            }
                            className="w-4 h-4 accent-[#4f6ef7] cursor-pointer"
                          />
                        </td>

                        {/* Item name */}
                        <td className="px-4 py-3">
                          <p className="font-semibold text-gray-900">{item.itemName}</p>
                          <p className="text-[11px] text-gray-400">{item.sku} · {item.unit}</p>
                        </td>

                        {/* Warehouse */}
                        <td className="px-4 py-3">
                          <span className="text-[12px] font-semibold text-gray-700">{item.warehouse}</span>
                        </td>

                        {/* Total qty — light gray, informational */}
                        <td className="px-4 py-3 text-center">
                          <span className="text-[13px] text-gray-300 font-medium">
                            {item.invoicedQty} {item.unit}
                          </span>
                        </td>

                        {/* Already DN'd */}
                        <td className="px-4 py-3 text-center">
                          <span className="text-[13px] text-gray-300 font-medium">
                            {item.dnedQty} {item.unit}
                          </span>
                        </td>

                        {/* Remaining */}
                        <td className="px-4 py-3 text-center">
                          <span className="text-[13px] font-bold text-gray-800">
                            {remaining} {item.unit}
                          </span>
                        </td>

                        {/* Qty for this DN */}
                        <td className="px-4 py-3 text-right">
                          <Input
                            type="number"
                            min={0}
                            max={remaining}
                            value={qty}
                            disabled={!isEnabled}
                            onChange={e => {
                              const val = parseInt(e.target.value, 10);
                              if (!isNaN(val)) {
                                setDeliverQtys(prev => ({
                                  ...prev,
                                  [item.itemId]: Math.min(Math.max(0, val), remaining),
                                }));
                              }
                            }}
                            className="w-20 h-8 text-right text-[13px] font-semibold border-gray-200 focus:border-[#4f6ef7] disabled:opacity-40 ml-auto"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end items-center gap-3 shrink-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="h-9 px-5 font-medium text-gray-700 border-gray-200 hover:bg-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="h-9 px-6 bg-[#1a1a2e] hover:bg-[#111827] text-white font-medium disabled:opacity-50"
          >
            Confirm Delivery
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
