import React from "react";
import { X, Truck, User, Box, Clock, CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import { Button } from "../ui/button";

interface DeliveryNote {
  id: string;
  rep: string;
  warehouse?: string;
  status: "PENDING" | "PROCESSING" | "APPROVED" | "CANCELED";
  adminTransfer: "NONE" | "DONE";
  repTransfer: "NONE" | "CONFIRMED";
  date: string;
  items: { id: string; qty: number }[];
  cancelReason?: string;
}

interface OrderItem {
  id: string;
  name: string;
  sku: string;
  unit: string;
  price: number;
}

interface DNDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  dn: DeliveryNote | null;
  orderItems: OrderItem[];
  orderId: string;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  PENDING:    { bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200",  label: "Waiting for Transfer" },
  PROCESSING: { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200",   label: "Noted for Delivery" },
  APPROVED:   { bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200",  label: "Delivered" },
  CANCELED:   { bg: "bg-red-50",    text: "text-red-700",    border: "border-red-200",    label: "Canceled" },
};

export function DNDetailsModal({ isOpen, onClose, dn, orderItems, orderId }: DNDetailsModalProps) {
  if (!isOpen || !dn) return null;

  const style = STATUS_STYLES[dn.status];
  const resolvedItems = dn.items.map((di) => {
    const full = orderItems.find((i) => i.id === di.id);
    return { ...di, name: full?.name || di.id, sku: full?.sku || "—", unit: full?.unit || "", price: full?.price ?? 0 };
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#f0f4ff] rounded-lg">
              <Truck className="w-4 h-4 text-[#4f6ef7]" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-gray-900">{dn.id}</h3>
              <p className="text-[11px] text-gray-400">Sales Order {orderId} · {dn.date}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${style.bg} ${style.text} ${style.border}`}>
              {style.label}
            </span>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Meta */}
        <div className="px-5 py-4 grid grid-cols-2 gap-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-gray-400" />
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Representative</p>
              <p className="text-[13px] font-semibold text-gray-900">{dn.rep}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Box className="w-3.5 h-3.5 text-gray-400" />
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Warehouse</p>
              <p className="text-[13px] font-semibold text-gray-900">{dn.warehouse || "—"}</p>
            </div>
          </div>
        </div>

        {/* Transfer status */}
        <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-4">
          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mr-2">Transfer</p>
          <div className="flex items-center gap-1.5">
            {dn.adminTransfer === "DONE"
              ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              : <XCircle className="w-3.5 h-3.5 text-gray-300" />}
            <span className="text-[11px] font-medium text-gray-600">Admin Transfer</span>
          </div>
          <div className="flex items-center gap-1.5">
            {dn.repTransfer === "CONFIRMED"
              ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              : <XCircle className="w-3.5 h-3.5 text-gray-300" />}
            <span className="text-[11px] font-medium text-gray-600">Rep Transfer</span>
          </div>
        </div>

        {/* Items */}
        <div className="px-5 py-4">
          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-3">Items</p>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Item</th>
                <th className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">SKU</th>
                <th className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Qty</th>
                <th className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Unit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {resolvedItems.map((item, i) => (
                <tr key={i}>
                  <td className="px-3 py-2.5 text-[13px] font-semibold text-gray-900">{item.name}</td>
                  <td className="px-3 py-2.5 text-[11px] text-gray-400">{item.sku}</td>
                  <td className="px-3 py-2.5 text-center">
                    <span className="inline-flex items-center justify-center px-2 py-0.5 bg-gray-100 rounded text-[12px] font-bold text-gray-700">{item.qty}</span>
                  </td>
                  <td className="px-3 py-2.5 text-[11px] text-gray-400 text-right">{item.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cancel reason */}
        {dn.cancelReason && (
          <div className="mx-5 mb-4 p-3 bg-red-50 rounded-lg border border-red-100 flex items-start gap-2">
            <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-[11px] font-bold text-red-700">Cancellation Reason</p>
              <p className="text-[11px] text-red-600 mt-0.5">{dn.cancelReason}</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-end">
          <Button onClick={onClose} className="h-9 px-6 bg-[#1a1a2e] hover:bg-[#111827] text-white text-[12px] font-medium">
            Close
          </Button>
        </div>

      </div>
    </div>
  );
}
