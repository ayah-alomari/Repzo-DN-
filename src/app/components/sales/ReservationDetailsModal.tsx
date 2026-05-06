import React from "react";
import { 
  X, 
  Trash2, 
  History as HistoryIcon, 
  Bookmark, 
  AlertCircle,
  RotateCcw,
  ArrowLeft
} from "lucide-react";
import { useAppData, MOCK_STOCK } from "../../context/AppDataContext";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

interface Reservation {
  id: string;
  itemId: string;
  itemName: string;
  qty: number;
  unit?: string;
  warehouse?: string;
  status: "ACTIVE" | "REVOKED";
  date: string;
  type: "AUTO" | "MANUAL";
}

interface ReservationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservations: Reservation[];
  onRevoke: (id: string) => void;
}

export function ReservationDetailsModal({ isOpen, onClose, reservations, onRevoke }: ReservationDetailsModalProps) {
  const [view, setView] = React.useState<"ACTIVE" | "HISTORY">("ACTIVE");
  const [subView, setSubView] = React.useState<"main" | "stock">("main");
  const { reservations: allReservations } = useAppData();

  if (!isOpen) return null;

  const activeReservations = reservations.filter(r => r.status === "ACTIVE");
  const historyReservations = reservations.filter(r => r.status !== "ACTIVE");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Bookmark className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-gray-900 tracking-tight">Reservation Details</h2>
              <p className="text-[12px] text-gray-500 font-medium">Manage and view reservation lifecycle</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex px-6 border-b border-gray-100 bg-white">
          <button 
            onClick={() => { setView("ACTIVE"); setSubView("main"); }}
            className={`py-4 px-4 text-[13px] font-bold border-b-2 transition-all flex items-center gap-2 ${
              view === "ACTIVE" 
                ? "border-indigo-600 text-indigo-600" 
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            Active <Badge className={view === "ACTIVE" ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-400"}>{activeReservations.length}</Badge>
          </button>
          <button 
            onClick={() => { setView("HISTORY"); setSubView("main"); }}
            className={`py-4 px-4 text-[13px] font-bold border-b-2 transition-all flex items-center gap-2 ${
              view === "HISTORY" 
                ? "border-indigo-600 text-indigo-600" 
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            <HistoryIcon className="w-4 h-4" /> History <Badge className={view === "HISTORY" ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-400"}>{historyReservations.length}</Badge>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-0 border-b border-gray-100 custom-scrollbar bg-white">
          {subView === "stock" ? (
            <div className="animate-in slide-in-from-right-2 duration-300">
              <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                <button onClick={() => setSubView("main")}
                  className="flex items-center gap-1.5 text-[12px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to list
                </button>
                <h3 className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">Inventory Impact</h3>
              </div>
              <table className="w-full text-left">
                <thead className="bg-gray-50/80 sticky top-0 z-10">
                  <tr className="border-b border-gray-100">
                    <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Item</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Warehouse</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Actual Stock</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Reserved</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Free Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {activeReservations.map(res => {
                    const actual = MOCK_STOCK[res.itemId]?.[res.warehouse || ""] ?? 0;
                    const totalReserved = allReservations
                      .filter(r => r.itemId === res.itemId && r.warehouse === res.warehouse && (r.status === "ACTIVE" || r.status === "CONSUMED"))
                      .reduce((sum, r) => sum + (r.qtyBase || r.qty), 0);
                    
                    const free = actual - totalReserved;
                    const after = free; // Since it's already reserved, "after" is the free stock now

                    return (
                      <tr key={res.id} className={`hover:bg-gray-50/30 transition-colors ${free < 0 ? "bg-red-50/30" : ""}`}>
                        <td className="px-6 py-4">
                          <p className="text-[13px] font-bold text-gray-900">{res.itemName}</p>
                        </td>
                        <td className="px-6 py-4 text-[12px] font-medium text-gray-600">{res.warehouse}</td>
                        <td className="px-6 py-4 text-center text-[13px] font-bold text-gray-700">{actual}</td>
                        <td className="px-6 py-4 text-center text-[13px] font-bold text-amber-600">{totalReserved}</td>
                        <td className="px-6 py-4 text-center text-[13px] font-bold">
                          <span className={free < 0 ? "text-red-500" : "text-green-600"}>{free}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <table className="w-full text-left border-collapse animate-in fade-in duration-300">
              <thead className="sticky top-0 bg-gray-50/80 backdrop-blur-md z-10">
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Item</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Qty</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Type</th>
                  {view === "HISTORY" && <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>}
                  {view === "ACTIVE" && <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(view === "ACTIVE" ? activeReservations : historyReservations).length > 0 ? (
                  (view === "ACTIVE" ? activeReservations : historyReservations).map((res) => (
                    <tr key={res.id} className="hover:bg-gray-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <p className="text-[13px] font-bold text-gray-900 leading-none">{res.itemName}</p>
                        <p className="text-[11px] text-gray-400 mt-1 font-medium">{res.warehouse || "No Warehouse Assigned"}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-[12px] font-bold text-gray-700">
                          {res.qty} <span className="font-normal text-gray-500">{res.unit}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded border ${
                          res.type === "AUTO"
                            ? "bg-indigo-50 text-indigo-600 border-indigo-100"
                            : "bg-gray-100 text-gray-600 border-gray-200"
                        }`}>
                          {res.type === "AUTO" ? "Stock" : "Manual"}
                        </span>
                      </td>
                      {view === "HISTORY" && (
                        <td className="px-6 py-4">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-100">
                            Revoked
                          </span>
                        </td>
                      )}
                      {view === "ACTIVE" && (
                        <td className="px-6 py-4 text-right">
                          {res.qty === 0 ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-400 border border-gray-200">
                              Consumed
                            </span>
                          ) : (
                            <button
                              onClick={() => onRevoke(res.id)}
                              className="p-2 text-gray-300 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                              title="Revoke Reservation"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <AlertCircle className="w-10 h-10 text-gray-200 mb-3" />
                        <p className="text-[13px] text-gray-400 font-medium">No {view.toLowerCase()} reservations found.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50/30 flex justify-between items-center">
          {view === "ACTIVE" && subView === "main" && activeReservations.some(r => r.warehouse) ? (
            <button 
              onClick={() => setSubView("stock")}
              className="flex items-center gap-1.5 text-[12px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              View stock impact
              {activeReservations.some(r => (MOCK_STOCK[r.itemId]?.[r.warehouse || ""] || 0) < r.qty) && (
                <span className="text-[9px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded border border-red-100 font-bold uppercase tracking-tighter">shortage</span>
              )}
            </button>
          ) : (
            <p className="text-[11px] text-gray-400 font-medium italic">
              * Reservations secure inventory for pending deliveries.
            </p>
          )}
          <Button 
            className="bg-[#1a1a2e] hover:bg-[#111827] text-white text-[12px] h-9 px-6 rounded-[4px]"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
      `}</style>
    </div>
  );
}
