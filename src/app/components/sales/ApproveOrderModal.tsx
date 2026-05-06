import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { CheckCircle2, Bookmark, X, AlertTriangle, ArrowLeft, Package, ShieldAlert } from "lucide-react";

const MOCK_STOCK: Record<string, Record<string, number>> = {
  "itm1": {
    "Main Branch": 10, "Zarqaa Warehouse": 12, "Maram": 8,  "Local Maram Van Warehouse": 15, "Dream Warehouse": 7,  "مستودع الكوم الرئيسي": 9,
    "Mohammad test": 3, "Van مستودع الكوم": 6, "Khald Warehouse": 4,
    "ismaeil": 0, "new 11": 0,
  },
  "itm2": {
    "Main Branch": 8,  "Zarqaa Warehouse": 6,  "Maram": 10, "Local Maram Van Warehouse": 7,  "Dream Warehouse": 9,  "مستودع الكوم الرئيسي": 5,
    "Mohammad test": 2, "Van مستودع الكوم": 3, "Khald Warehouse": 1,
    "ismaeil": 0, "new 11": 0,
  },
  "p11-itm1": {
    "Main Branch": 15, "Zarqaa Warehouse": 20, "Maram": 12, "Local Maram Van Warehouse": 18, "Dream Warehouse": 14, "مستودع الكوم الرئيسي": 16,
    "Mohammad test": 6,  "Van مستودع الكوم": 12, "Khald Warehouse": 8,
    "ismaeil": 0, "new 11": 0,
  },
  "p11-itm2": {
    "Main Branch": 8,  "Zarqaa Warehouse": 6,  "Maram": 10, "Local Maram Van Warehouse": 5,  "Dream Warehouse": 7,  "مستودع الكوم الرئيسي": 9,
    "Mohammad test": 5,  "Van مستودع الكوم": 2,  "Khald Warehouse": 1,
    "ismaeil": 0, "new 11": 0,
  },
  "p11-itm3": {
    "Main Branch": 4,  "Zarqaa Warehouse": 3,  "Maram": 5,  "Local Maram Van Warehouse": 6,  "Dream Warehouse": 3,  "مستودع الكوم الرئيسي": 4,
    "Mohammad test": 2,  "Van مستودع الكوم": 0,  "Khald Warehouse": 1,
    "ismaeil": 0, "new 11": 0,
  },
};

interface OrderItem {
  id: string;
  name: string;
  unit: string;
  totalQty: number;
  deliveredQty: number;
  notedQty: number;
}

interface ApproveOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (autoReserve: boolean, warehouse: string, hasShortage: boolean) => void;
  warehouses: string[];
  orderItems: OrderItem[];
  requireFullStock?: boolean;
}

export function ApproveOrderModal({
  isOpen,
  onClose,
  onConfirm,
  warehouses,
  orderItems,
  requireFullStock = false,
}: ApproveOrderModalProps) {
  const [autoReserve, setAutoReserve] = useState(requireFullStock);
  const [warehouse, setWarehouse] = useState("");
  const [view, setView] = useState<"main" | "stock">("main");
  const [showOnlyNegative, setShowOnlyNegative] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAutoReserve(requireFullStock);
      setWarehouse("");
      setView("main");
      setShowOnlyNegative(false);
    }
  }, [isOpen]);

  const stockRows = warehouse
    ? orderItems.map((item) => {
        const reserveQty = item.totalQty - item.deliveredQty - item.notedQty;
        const before = MOCK_STOCK[item.id]?.[warehouse] ?? 0;
        const after = before - reserveQty;
        return { ...item, reserveQty, before, after, negative: after < 0 };
      })
    : [];

  const hasShortage = stockRows.some((r) => r.negative);
  const visibleRows = showOnlyNegative ? stockRows.filter((r) => r.negative) : stockRows;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl bg-white">

        {/* ── STOCK VIEW ── */}
        {view === "stock" ? (
          <>
            {/* Stock header */}
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between bg-white">
              <button
                onClick={() => setView("main")}
                className="flex items-center gap-1.5 text-[13px] font-semibold text-gray-700 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Approve Order
              </button>
              <button
                onClick={() => setShowOnlyNegative(v => !v)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-full border transition-all ${
                  showOnlyNegative
                    ? "bg-red-50 text-red-600 border-red-200"
                    : "bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300"
                }`}
              >
                Show only negative stocks
              </button>
            </div>

            {/* Stock content */}
            <div className="overflow-y-auto max-h-[420px]">
              {hasShortage && (
                <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border-b border-amber-100">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <p className="text-[11px] text-amber-700 font-medium">
                    Some items have insufficient stock — reservation will go negative.
                  </p>
                </div>
              )}

              <div className="p-4 space-y-3">
                {visibleRows.length === 0 ? (
                  <p className="text-[12px] text-gray-400 text-center py-6">No items to display.</p>
                ) : (
                  visibleRows.map((row) => (
                    <div key={row.id} className="rounded-lg border border-gray-100 overflow-hidden">
                      {/* Item header */}
                      <div className="flex items-center gap-2.5 px-3 py-2.5 bg-gray-50 border-b border-gray-100">
                        <div className="p-1.5 bg-white rounded border border-gray-200">
                          <Package className="w-3.5 h-3.5 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-[13px] font-bold text-gray-900">{row.name}</p>
                          <p className="text-[11px] text-gray-400">{row.unit}</p>
                        </div>
                      </div>
                      {/* Before / After table */}
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-gray-100">
                            <th className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Warehouse</th>
                            <th className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Before</th>
                            <th className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">After</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className={row.negative ? "bg-red-50/50" : "bg-white"}>
                            <td className="px-3 py-2.5 text-[12px] font-semibold text-gray-700">{warehouse}</td>
                            <td className="px-3 py-2.5 text-center">
                              <span className="text-[12px] font-bold text-gray-700">{row.before}</span>
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              <span className={`text-[12px] font-bold ${row.negative ? "text-red-500" : "text-green-600"}`}>
                                {row.after}
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Stock footer */}
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-end">
              <Button
                onClick={() => setView("main")}
                className="h-9 px-6 bg-[#1a1a2e] hover:bg-[#111827] text-white text-[12px] font-medium"
              >
                Back
              </Button>
            </div>
          </>
        ) : (
          /* ── MAIN VIEW ── */
          <>
            {/* Main header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-white">
              <div className={`p-2 rounded-lg ${requireFullStock ? "bg-amber-50" : "bg-indigo-50"}`}>
                {requireFullStock
                  ? <ShieldAlert className="w-5 h-5 text-amber-600" />
                  : <Bookmark className="w-5 h-5 text-indigo-600" />
                }
              </div>
              <div>
                <DialogTitle className="text-[18px] font-bold text-gray-900 leading-tight">
                  {requireFullStock ? "Stock Verification Required" : "Order Approved"}
                </DialogTitle>
                <DialogDescription className="text-[13px] text-gray-500 mt-0.5">
                  {requireFullStock
                    ? "Select a warehouse with sufficient stock for all items to complete approval."
                    : "Would you like to stock-reserve items for this order?"}
                </DialogDescription>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* requireFullStock mode: skip the Yes/No toggle, just show warehouse picker */}
              {requireFullStock && (
                <div className="flex items-start gap-2.5 px-4 py-3 rounded-lg bg-amber-50 border border-amber-100">
                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-[12px] text-amber-800 leading-relaxed">
                    <span className="font-bold">Stock validation is required.</span> The selected warehouse must have enough stock to cover all order items. Warehouses with any shortage are not accepted.
                  </p>
                </div>
              )}

              {/* Yes / No action buttons — only in normal mode */}
              {!requireFullStock && (
              <div className="space-y-3">
                <Label className="text-[13px] font-bold text-gray-800">
                  Stock-reserve items on approval?
                </Label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setAutoReserve(true)}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 text-[13px] font-bold transition-all flex items-center justify-center gap-2 ${
                      autoReserve
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                        : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    <Bookmark className="w-4 h-4" />
                    Yes, reserve items
                  </button>
                  <button
                    onClick={() => onConfirm(false, "", false)}
                    className="flex-1 py-3 px-4 rounded-lg border-2 border-gray-200 bg-white text-gray-500 hover:border-gray-300 text-[13px] font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    No, skip
                  </button>
                </div>
              </div>
              )}

              {/* Warehouse select — when Yes (normal mode) OR always in requireFullStock mode */}
              {(autoReserve || requireFullStock) && (
                <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
                  <div className="space-y-2">
                    <Label className="text-[13px] font-bold text-gray-800 flex items-center gap-1">
                      Reserve from Warehouse <span className="text-red-500">*</span>
                    </Label>
                    <Select value={warehouse} onValueChange={setWarehouse}>
                      <SelectTrigger className="h-10 border-gray-200 focus:border-indigo-400 transition-all">
                        <SelectValue placeholder="Select a warehouse" />
                      </SelectTrigger>
                      <SelectContent>
                        {warehouses
                          .map((wh) => {
                            const whHasShortage = orderItems.some(item => {
                              const reserveQty = item.totalQty - item.deliveredQty - item.notedQty;
                              return (MOCK_STOCK[item.id]?.[wh] ?? 0) < reserveQty;
                            });
                            return (
                              <SelectItem key={wh} value={wh}>
                                <div className="flex items-center gap-2">
                                  {whHasShortage
                                    ? <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                    : <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                                  }
                                  <span>{wh}</span>
                                </div>
                              </SelectItem>
                            );
                          })}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* View stock link */}
                  {warehouse && (
                    <button
                      onClick={() => setView("stock")}
                      className="flex items-center gap-1.5 text-[12px] font-semibold text-indigo-600 hover:text-indigo-700 transition-colors animate-in slide-in-from-top-1 duration-150"
                    >
                      View stock
                      {hasShortage && (
                        <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">shortage</span>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            {/* requireFullStock: always visible so Cancel is reachable without selecting a warehouse */}
            {(requireFullStock || (autoReserve && warehouse)) && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                {requireFullStock ? (
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-[6px] border border-gray-200 text-[13px] font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                ) : <div />}
                <Button
                  onClick={() => onConfirm(true, warehouse, hasShortage)}
                  disabled={requireFullStock && !warehouse}
                  className={`h-10 px-8 font-bold shadow-md transition-all active:scale-95 ${
                    requireFullStock && !warehouse
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                      : "bg-[#12b76a] hover:bg-[#0ea05e] text-white"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  {requireFullStock ? "Confirm Approval" : "Confirm"}
                </Button>
              </div>
            )}
          </>
        )}

      </DialogContent>
    </Dialog>
  );
}
