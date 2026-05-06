import React, { useState } from "react";
import { Package, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { useAppData, MOCK_STOCK } from "../../context/AppDataContext";

interface ImpactItem {
  id: string;
  name: string;
  unit: string;
  totalQty: number;
  deliveredQty: number;
  notedQty: number;
}

interface InvoiceImpactModalProps {
  isOpen: boolean;
  onClose: () => void;
  warehouse: string;
  items: ImpactItem[];
}

export function InvoiceImpactModal({
  isOpen,
  onClose,
  warehouse,
  items,
}: InvoiceImpactModalProps) {
  const [showOnlyNegative, setShowOnlyNegative] = useState(false);

  const { reservations } = useAppData();

  const rows = items.map((item) => {
    const deductQty = item.totalQty - item.deliveredQty - item.notedQty;
    const actualStock = MOCK_STOCK[item.id]?.[warehouse] ?? 0;
    
    // Calculate total reserved for this item and warehouse
    const totalReserved = reservations
      .filter(r => r.itemId === item.id && r.warehouse === warehouse && (r.status === "ACTIVE" || r.status === "CONSUMED"))
      .reduce((sum, r) => sum + r.qtyBase, 0);

    const freeStock = actualStock - totalReserved;
    const after = freeStock - deductQty;

    return { 
      ...item, 
      deductQty, 
      actual: actualStock, 
      reserved: totalReserved, 
      free: freeStock, 
      after, 
      isNegative: after < 0 
    };
  });

  const displayed = showOnlyNegative ? rows.filter((r) => r.isNegative) : rows;
  const negativeCount = rows.filter((r) => r.isNegative).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-none shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Package className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <DialogHeader>
                <DialogTitle className="text-[15px] font-bold text-gray-900 leading-tight">
                  Inventory Impact
                </DialogTitle>
              </DialogHeader>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {warehouse ? `Warehouse: ${warehouse}` : "No warehouse selected"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowOnlyNegative((v) => !v)}
            className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border transition-all ${
              showOnlyNegative
                ? "bg-red-50 text-red-600 border-red-200"
                : "bg-gray-50 text-gray-500 border-gray-200 hover:border-red-200 hover:text-red-500"
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            Show only negative {negativeCount > 0 && `(${negativeCount})`}
          </button>
        </div>

        {/* Summary bar */}
        {negativeCount > 0 ? (
          <div className="flex items-center gap-2 px-5 py-2 bg-red-50 border-b border-red-100">
            <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
            <p className="text-[11px] text-red-700 font-medium">
              <strong>{negativeCount} item{negativeCount > 1 ? "s" : ""}</strong> will go negative in this warehouse.
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-5 py-2 bg-green-50 border-b border-green-100">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
            <p className="text-[11px] text-green-700 font-medium">All items are sufficiently stocked in this warehouse.</p>
          </div>
        )}

        {/* Table */}
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-5 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Item</th>
              <th className="px-5 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Actual Stock</th>
              <th className="px-5 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Reserved</th>
              <th className="px-5 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Free Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {displayed.length > 0 ? displayed.map((row) => (
              <tr key={row.id} className={row.isNegative ? "bg-red-50/60" : "bg-white"}>
                <td className="px-5 py-3">
                  <p className="text-[13px] font-semibold text-gray-900">{row.name}</p>
                  <p className="text-[10px] text-gray-400">{row.unit}</p>
                </td>
                <td className="px-5 py-3 text-center">
                  <span className="text-[13px] font-bold text-gray-700">{row.actual}</span>
                </td>
                <td className="px-5 py-3 text-center text-amber-600 font-bold text-[13px]">
                  {row.reserved}
                </td>
                <td className="px-5 py-3 text-center">
                  <span className={`text-[13px] font-bold ${row.isNegative ? "text-red-600" : "text-green-600"}`}>
                    {row.free}
                  </span>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-[12px] text-gray-400">
                  No negative items found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Footer */}
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-end">
          <Button
            onClick={onClose}
            className="h-9 px-6 bg-[#1a1a2e] hover:bg-[#111827] text-white text-[12px] font-medium"
          >
            Close
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}
