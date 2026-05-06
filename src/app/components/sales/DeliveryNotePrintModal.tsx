import React from "react";
import { X, Printer, Truck, User, Box, Clock, CheckCircle2 } from "lucide-react";
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

interface DeliveryNotePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  dn: DeliveryNote | null;
  orderItems: OrderItem[];
  orderId: string;
  clientName?: string;
}

export function DeliveryNotePrintModal({
  isOpen,
  onClose,
  dn,
  orderItems,
  orderId,
  clientName = "—",
}: DeliveryNotePrintModalProps) {
  if (!isOpen || !dn) return null;

  const resolvedItems = dn.items.map((di) => {
    const full = orderItems.find((i) => i.id === di.id);
    return { ...di, name: full?.name || di.id, sku: full?.sku || "—", unit: full?.unit || "", price: full?.price ?? 0 };
  });

  const handlePrint = () => window.print();

  const statusColor =
    dn.status === "APPROVED" ? "#166534" :
    dn.status === "CANCELED" ? "#991b1b" : "#92400e";
  const statusBg =
    dn.status === "APPROVED" ? "#dcfce7" :
    dn.status === "CANCELED" ? "#fee2e2" : "#fef3c7";

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #dn-print-area, #dn-print-area * { visibility: visible !important; }
          #dn-print-area {
            position: fixed !important;
            inset: 0 !important;
            padding: 32px !important;
            background: white !important;
            z-index: 9999 !important;
          }
        }
      `}</style>

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden">

          {/* Modal header — hidden on print */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Truck className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-[16px] font-bold text-gray-900">Delivery Note</h2>
                <p className="text-[12px] text-gray-400 font-medium">{dn.id}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Printable area */}
          <div id="dn-print-area" className="flex-1 overflow-auto p-8 bg-white space-y-6">

            {/* Document header */}
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-[24px] font-black text-gray-900 tracking-tight">Delivery Note</h1>
                <p className="text-[13px] text-gray-400 mt-0.5">#{dn.id}</p>
              </div>
              <div className="text-right space-y-0.5">
                <p className="text-[11px] text-gray-400 uppercase tracking-widest font-bold">Status</p>
                <span
                  className="inline-block px-3 py-1 rounded text-[12px] font-bold uppercase"
                  style={{ backgroundColor: statusBg, color: statusColor }}
                >
                  {({ PENDING: "Waiting for Transfer", PROCESSING: "Noted for Delivery", APPROVED: "Delivered", CANCELED: "Canceled" } as Record<string, string>)[dn.status] ?? dn.status}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* Meta info grid */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Sales Order</p>
                  <p className="text-[14px] font-bold text-gray-900">{orderId}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Client</p>
                  <p className="text-[14px] font-semibold text-gray-900">{clientName}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Date Issued</p>
                  <p className="text-[13px] font-semibold text-gray-900">{dn.date}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Assigned Representative</p>
                  <p className="text-[14px] font-semibold text-gray-900">{dn.rep}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Warehouse</p>
                  <p className="text-[14px] font-semibold text-gray-900">{dn.warehouse || "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Approvals</p>
                  <div className="flex items-center gap-3">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${dn.adminTransfer === "DONE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      Admin Transfer: {dn.adminTransfer === "DONE" ? "Done" : "Pending"}
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${dn.repTransfer === "CONFIRMED" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      Rep Transfer: {dn.repTransfer === "CONFIRMED" ? "Confirmed" : "Pending"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* Items table */}
            <div>
              <p className="text-[11px] uppercase font-bold text-gray-400 tracking-widest mb-3">Items</p>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-y border-gray-100">
                    <th className="px-4 py-2.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Item</th>
                    <th className="px-4 py-2.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">SKU</th>
                    <th className="px-4 py-2.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">Qty</th>
                    <th className="px-4 py-2.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Unit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {resolvedItems.map((item, i) => (
                    <tr key={i} className="hover:bg-gray-50/40">
                      <td className="px-4 py-3 text-[13px] font-semibold text-gray-900">{item.name}</td>
                      <td className="px-4 py-3 text-[12px] text-gray-500">{item.sku}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-1 bg-gray-100 rounded text-[13px] font-bold text-gray-800">{item.qty}</span>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-gray-500 text-right">{item.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t border-gray-100" />

            {/* Signature section */}
            <div className="grid grid-cols-2 gap-12 pt-2">
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-6">Representative Signature</p>
                <div className="border-b border-gray-300 w-full" />
                <p className="text-[11px] text-gray-400 mt-2">{dn.rep}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-6">Received By</p>
                <div className="border-b border-gray-300 w-full" />
                <p className="text-[11px] text-gray-400 mt-2">Client / Recipient</p>
              </div>
            </div>

          </div>

          {/* Footer — hidden on print */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} className="h-9 px-5">Close</Button>
            <Button
              onClick={handlePrint}
              className="h-9 px-6 bg-[#1a1a2e] hover:bg-[#111827] text-white flex items-center gap-2"
            >
              <Printer className="w-4 h-4" /> Print
            </Button>
          </div>

        </div>
      </div>
    </>
  );
}
