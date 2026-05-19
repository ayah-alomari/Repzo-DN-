import React from "react";
import {
  X,
  History as HistoryIcon,
  Bookmark,
  AlertCircle,
  ArrowLeft,
  Check,
  RotateCcw as CancelIcon,
  Pencil,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { useAppData, MOCK_STOCK, Reservation as CtxReservation } from "../../context/AppDataContext";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

const getRepVanWarehouse = (rep: string) => `${rep} Van Warehouse`;

interface Reservation {
  id: string;
  itemId: string;
  itemName: string;
  qty: number;
  qtyBase: number;
  unit: string;
  warehouse: string;
  status: "ACTIVE" | "CANCELED" | "REVOKED";
  date: string;
  type: "AUTO" | "MANUAL";
  groupId?: string;
}

interface DisplayRow {
  key: string;
  representativeId: string;
  items: Reservation[];
  isGroup: boolean;
  warehouse: string;
  status: "ACTIVE" | "CANCELED" | "REVOKED";
  type: "AUTO" | "MANUAL";
  date: string;
}

interface ReservationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservations: Reservation[];
  onRevoke: (id: string) => void;
  onEdit: (id: string, newQty: number) => void;
}

function buildDisplayRows(list: Reservation[], groupingEnabled: boolean): DisplayRow[] {
  if (!groupingEnabled) {
    return list.map(r => ({
      key: r.id,
      representativeId: r.id,
      items: [r],
      isGroup: false,
      warehouse: r.warehouse,
      status: r.status,
      type: r.type,
      date: r.date,
    }));
  }

  const groups = new Map<string, Reservation[]>();
  const ungrouped: Reservation[] = [];

  for (const r of list) {
    if (r.groupId) {
      groups.set(r.groupId, [...(groups.get(r.groupId) ?? []), r]);
    } else {
      ungrouped.push(r);
    }
  }

  return [
    ...Array.from(groups.entries()).map(([gId, items]) => ({
      key: gId,
      representativeId: items[0].id,
      items,
      isGroup: true,
      warehouse: items[0].warehouse,
      status: items[0].status,
      type: items[0].type,
      date: items[0].date,
    })),
    ...ungrouped.map(r => ({
      key: r.id,
      representativeId: r.id,
      items: [r],
      isGroup: false,
      warehouse: r.warehouse,
      status: r.status,
      type: r.type,
      date: r.date,
    })),
  ];
}

export function ReservationDetailsModal({ isOpen, onClose, reservations, onRevoke, onEdit }: ReservationDetailsModalProps) {
  const [view, setView] = React.useState<"ACTIVE" | "HISTORY">("ACTIVE");
  const [subView, setSubView] = React.useState<"main" | "stock">("main");
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editValue, setEditValue] = React.useState<string>("");
  const [expandedGroupKeys, setExpandedGroupKeys] = React.useState<Set<string>>(new Set());
  const { reservations: allReservations, dnList, allowMultiWarehouseReservation } = useAppData();

  const toggleGroup = (key: string) => {
    setExpandedGroupKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const getDisplayWarehouse = (res: Reservation) => {
    const full = allReservations.find(r => r.id === res.id) as CtxReservation | undefined;
    if (!full?.linkedDNId) return res.warehouse;
    const linkedDN = dnList.find(d => d.id === full.linkedDNId);
    if (linkedDN && (linkedDN.status === "PROCESSING" || linkedDN.status === "APPROVED")) {
      return getRepVanWarehouse(linkedDN.rep);
    }
    return res.warehouse;
  };

  if (!isOpen) return null;

  const activeReservations = reservations.filter(r => r.status === "ACTIVE");
  const historyReservations = reservations.filter(r => r.status !== "ACTIVE");

  // When allowMultiWarehouseReservation is false, group by groupId
  const shouldGroup = !allowMultiWarehouseReservation;
  const displayActiveRows = buildDisplayRows(activeReservations, shouldGroup);
  const displayHistoryRows = buildDisplayRows(historyReservations, shouldGroup);

  const currentRows = view === "ACTIVE" ? displayActiveRows : displayHistoryRows;

  const renderItemCell = (row: DisplayRow) => {
    if (!row.isGroup || row.items.length === 1) {
      const res = row.items[0];
      return (
        <>
          <p className="text-[13px] font-bold text-gray-900 leading-none">{res.itemName}</p>
          <p className="text-[11px] text-gray-400 mt-1 font-medium">{getDisplayWarehouse(res) || "No Warehouse Assigned"}</p>
        </>
      );
    }
    // Grouped: show summary
    const names = row.items.map(r => r.itemName);
    const preview = names.length <= 2
      ? names.join(", ")
      : `${names[0]}, ${names[1]} +${names.length - 2} more`;
    return (
      <>
        <div className="flex items-center gap-1.5 leading-none">
          <p className="text-[13px] font-bold text-gray-900">{row.items.length} items</p>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100">Group</span>
        </div>
        <p className="text-[11px] text-gray-400 mt-1 font-medium">{preview}</p>
        <p className="text-[11px] text-gray-400 mt-0.5 font-medium">{getDisplayWarehouse(row.items[0]) || "No Warehouse Assigned"}</p>
      </>
    );
  };

  const renderQtyCell = (row: DisplayRow) => {
    if (row.isGroup && row.items.length > 1) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-[12px] font-bold text-gray-700">
          {row.items.length} <span className="font-normal text-gray-500">items</span>
        </span>
      );
    }
    const res = row.items[0];
    if (editingId === res.id) {
      return (
        <div className="flex items-center justify-center gap-1">
          <input
            type="number"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-16 h-8 px-2 border border-indigo-300 rounded text-[12px] font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            autoFocus
          />
          <button
            onClick={() => {
              const val = parseFloat(editValue);
              if (!isNaN(val) && val >= 0) {
                onEdit(res.id, val);
                setEditingId(null);
              }
            }}
            className="p-1 text-green-600 hover:bg-green-50 rounded"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setEditingId(null)}
            className="p-1 text-gray-400 hover:bg-gray-50 rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center gap-2">
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-[12px] font-bold text-gray-700">
          {res.qty} <span className="font-normal text-gray-500">{res.unit}</span>
        </span>
        {res.type === "MANUAL" && view === "ACTIVE" && (
          <button
            onClick={() => { setEditingId(res.id); setEditValue(res.qty.toString()); }}
            className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-all opacity-0 group-hover:opacity-100"
          >
            <Pencil className="w-3 h-3" />
          </button>
        )}
      </div>
    );
  };

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
            Active <Badge className={view === "ACTIVE" ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-400"}>{displayActiveRows.length}</Badge>
          </button>
          <button
            onClick={() => { setView("HISTORY"); setSubView("main"); }}
            className={`py-4 px-4 text-[13px] font-bold border-b-2 transition-all flex items-center gap-2 ${
              view === "HISTORY"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            <HistoryIcon className="w-4 h-4" /> History <Badge className={view === "HISTORY" ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-400"}>{displayHistoryRows.length}</Badge>
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
                    const displayWarehouse = getDisplayWarehouse(res);
                    const actual = MOCK_STOCK[res.itemId]?.[displayWarehouse || ""] ?? 0;
                    const totalReserved = allReservations
                      .filter(r => r.itemId === res.itemId && r.warehouse === displayWarehouse && (r.status === "ACTIVE" || r.status === "REVOKED"))
                      .reduce((sum, r) => sum + (r.qtyBase || r.qty), 0);
                    const free = actual - totalReserved;
                    return (
                      <tr key={res.id} className={`hover:bg-gray-50/30 transition-colors ${free < 0 ? "bg-red-50/30" : ""}`}>
                        <td className="px-6 py-4">
                          <p className="text-[13px] font-bold text-gray-900">{res.itemName}</p>
                        </td>
                        <td className="px-6 py-4 text-[12px] font-medium text-gray-600">{displayWarehouse}</td>
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
                {currentRows.length > 0 ? (
                  currentRows.map((row) => {
                    const isExpanded = expandedGroupKeys.has(row.key);
                    return (
                      <React.Fragment key={row.key}>
                        {/* Main Group Header or Single Row */}
                        <tr
                          className={`transition-colors group hover:bg-gray-50/50 ${
                            row.isGroup && row.items.length > 1 ? "cursor-pointer bg-indigo-50/10 hover:bg-indigo-50/20" : ""
                          }`}
                          onClick={() => {
                            if (row.isGroup && row.items.length > 1) {
                              toggleGroup(row.key);
                            }
                          }}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {row.isGroup && row.items.length > 1 && (
                                <span className="text-gray-400 shrink-0">
                                  {isExpanded ? (
                                    <ChevronDown className="w-4 h-4 text-indigo-500" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 text-indigo-500" />
                                  )}
                                </span>
                              )}
                              <div>
                                {renderItemCell(row)}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {renderQtyCell(row)}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded border ${
                              row.type === "AUTO"
                                ? "bg-indigo-50 text-indigo-600 border-indigo-100"
                                : "bg-gray-100 text-gray-600 border-gray-200"
                            }`}>
                              {row.type === "AUTO" ? "Stock" : "Manual"}
                            </span>
                          </td>
                          {view === "HISTORY" && (
                            <td className="px-6 py-4">
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                                row.status === "CANCELED"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-blue-50 text-blue-700 border-blue-200"
                              }`}>
                                {row.status === "CANCELED" ? "Canceled" : "Revoked (Delivered)"}
                              </span>
                            </td>
                          )}
                          {view === "ACTIVE" && (
                            <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                              {row.items.every(r => r.qty === 0) ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-400 border border-gray-200">
                                  Revoked
                                </span>
                              ) : (
                                <button
                                  onClick={() => onRevoke(row.representativeId)}
                                  className="p-2 text-gray-300 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                  title={row.isGroup ? "Cancel All Reservations" : "Cancel Reservation"}
                                >
                                  <CancelIcon className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          )}
                        </tr>

                        {/* Collapsible Children rows */}
                        {row.isGroup && row.items.length > 1 && isExpanded && (
                          row.items.map((subItem) => {
                            const isEditing = editingId === subItem.id;
                            return (
                              <tr key={subItem.id} className="bg-indigo-50/5 hover:bg-indigo-50/10 transition-colors border-l-2 border-indigo-400/80">
                                <td className="px-6 py-3 pl-12">
                                  <p className="text-[12.5px] font-bold text-gray-800">{subItem.itemName}</p>
                                  <p className="text-[10.5px] text-gray-400 font-medium">{getDisplayWarehouse(subItem) || "No Warehouse Assigned"}</p>
                                </td>
                                <td className="px-6 py-3 text-center">
                                  {isEditing ? (
                                    <div className="flex items-center justify-center gap-1">
                                      <input
                                        type="number"
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        className="w-16 h-8 px-2 border border-indigo-300 rounded text-[12px] font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        autoFocus
                                      />
                                      <button
                                        onClick={() => {
                                          const val = parseFloat(editValue);
                                          if (!isNaN(val) && val >= 0) {
                                            onEdit(subItem.id, val);
                                            setEditingId(null);
                                          }
                                        }}
                                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => setEditingId(null)}
                                        className="p-1 text-gray-400 hover:bg-gray-50 rounded"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-center gap-1">
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded text-[11px] font-bold">
                                        {subItem.qty} <span className="font-normal text-indigo-400">{subItem.unit}</span>
                                      </span>
                                      {subItem.type === "MANUAL" && view === "ACTIVE" && (
                                        <button
                                          onClick={() => { setEditingId(subItem.id); setEditValue(subItem.qty.toString()); }}
                                          className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-all opacity-0 group-hover:opacity-100"
                                        >
                                          <Pencil className="w-3 h-3" />
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </td>
                                <td className="px-6 py-3">
                                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border bg-indigo-50/50 text-indigo-600 border-indigo-100">
                                    {subItem.type === "AUTO" ? "Stock" : "Manual"}
                                  </span>
                                </td>
                                {view === "HISTORY" && (
                                  <td className="px-6 py-3">
                                    <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                                      subItem.status === "CANCELED"
                                        ? "bg-amber-50 text-amber-600 border-amber-200"
                                        : "bg-blue-50 text-blue-600 border-blue-200"
                                    }`}>
                                      {subItem.status === "CANCELED" ? "Canceled" : "Revoked"}
                                    </span>
                                  </td>
                                )}
                                {view === "ACTIVE" && (
                                  <td className="px-6 py-3 text-right">
                                    <button
                                      onClick={() => onRevoke(subItem.id)}
                                      className="p-1.5 text-gray-300 hover:text-amber-500 hover:bg-amber-50 rounded transition-all"
                                      title="Cancel Reservation"
                                    >
                                      <CancelIcon className="w-3.5 h-3.5" />
                                    </button>
                                  </td>
                                )}
                              </tr>
                            );
                          })
                        )}
                      </React.Fragment>
                    );
                  })
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
