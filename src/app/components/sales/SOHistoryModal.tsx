import React from "react";
import {
  X, History, FileText, Check, CheckCircle2, XCircle, Truck,
  Package, Bookmark, RotateCcw, Receipt, ArrowLeftRight, CreditCard,
  PlusCircle,
} from "lucide-react";
import { type SOAuditEntry, type SOAuditAction } from "../../context/AppDataContext";
import { Button } from "../ui/button";

interface SOHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: SOAuditEntry[];
  soNumber: string;
  soCreator: string;
  soCreatedDate: string;
}

const ACTION_META: Record<SOAuditAction, { label: string; icon: React.ElementType; color: string; bg: string; dot: string }> = {
  created:                 { label: "Order Created",              icon: FileText,        color: "text-blue-700",   bg: "bg-blue-50",   dot: "bg-blue-400"   },
  approved_1st:            { label: "1st Approval",               icon: Check,           color: "text-green-700",  bg: "bg-green-50",  dot: "bg-green-400"  },
  approved_2nd:            { label: "2nd Approval",               icon: Check,           color: "text-green-700",  bg: "bg-green-50",  dot: "bg-green-400"  },
  approved:                { label: "Order Approved",             icon: CheckCircle2,    color: "text-green-700",  bg: "bg-green-50",  dot: "bg-green-500"  },
  rejected:                { label: "Order Rejected",             icon: XCircle,         color: "text-red-700",    bg: "bg-red-50",    dot: "bg-red-400"    },
  dn_created:              { label: "Delivery Note Created",      icon: Truck,           color: "text-indigo-700", bg: "bg-indigo-50", dot: "bg-indigo-400" },
  dn_delivered:            { label: "Delivery Confirmed",         icon: Package,         color: "text-green-700",  bg: "bg-green-50",  dot: "bg-green-400"  },
  dn_canceled:             { label: "Delivery Note Canceled",     icon: XCircle,         color: "text-red-700",    bg: "bg-red-50",    dot: "bg-red-400"    },
  reservation_created:     { label: "Items Reserved",             icon: Bookmark,        color: "text-indigo-700", bg: "bg-indigo-50", dot: "bg-indigo-300" },
  reservation_revoked:     { label: "Reservation Revoked",        icon: RotateCcw,       color: "text-amber-700",  bg: "bg-amber-50",  dot: "bg-amber-400"  },
  converted_to_invoice:    { label: "Converted to Invoice",       icon: Receipt,         color: "text-purple-700", bg: "bg-purple-50", dot: "bg-purple-400" },
  return_transfer_created: { label: "Return Transfer Initiated",  icon: ArrowLeftRight,  color: "text-orange-700", bg: "bg-orange-50", dot: "bg-orange-400" },
  payment_marked_paid:     { label: "Payment Marked as Paid",     icon: CreditCard,      color: "text-green-700",  bg: "bg-green-50",  dot: "bg-green-400"  },
};

export function SOHistoryModal({ isOpen, onClose, entries, soNumber, soCreator, soCreatedDate }: SOHistoryModalProps) {
  if (!isOpen) return null;

  const sorted = [...entries].sort((a, b) => a.timestamp - b.timestamp);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-150">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <History className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-gray-900">Order History</h2>
              <p className="text-[11px] text-gray-400 font-medium">{soNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-auto px-6 py-5 space-y-0">

          {/* Synthetic "Created" entry — always first */}
          <TimelineEntry
            dot="bg-blue-400"
            icon={FileText}
            iconColor="text-blue-700"
            iconBg="bg-blue-50"
            label="Order Created"
            by={soCreator}
            date={soCreatedDate}
            isLast={sorted.length === 0}
          />

          {sorted.map((entry, i) => {
            const meta = ACTION_META[entry.action];
            const Icon = meta.icon;
            return (
              <TimelineEntry
                key={entry.id}
                dot={meta.dot}
                icon={Icon}
                iconColor={meta.color}
                iconBg={meta.bg}
                label={meta.label}
                by={entry.by}
                date={entry.date}
                linkedId={entry.linkedId}
                linkedLabel={entry.linkedLabel}
                note={entry.note}
                isLast={i === sorted.length - 1}
              />
            );
          })}

          {sorted.length === 0 && (
            <p className="text-[12px] text-gray-400 italic pl-10 pt-2">No further actions recorded yet.</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-end shrink-0">
          <Button onClick={onClose} className="h-9 px-6 bg-[#1a1a2e] hover:bg-[#111827] text-white text-[12px]">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

interface TimelineEntryProps {
  dot: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  label: string;
  by: string;
  date: string;
  linkedId?: string;
  linkedLabel?: string;
  note?: string;
  isLast: boolean;
}

function TimelineEntry({ dot, icon: Icon, iconColor, iconBg, label, by, date, linkedId, linkedLabel, note, isLast }: TimelineEntryProps) {
  return (
    <div className="flex gap-4">
      {/* Left: dot + line */}
      <div className="flex flex-col items-center shrink-0">
        <div className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${dot}`} />
        {!isLast && <div className="w-px flex-1 bg-gray-200 my-1" />}
      </div>

      {/* Right: content */}
      <div className={`flex items-start gap-3 ${isLast ? "pb-0" : "pb-5"} w-full`}>
        <div className={`p-1.5 rounded-lg shrink-0 ${iconBg}`}>
          <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[13px] font-semibold text-gray-900">{label}</span>
            {(linkedId || linkedLabel) && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">
                {linkedLabel || linkedId}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] text-gray-500">by <span className="font-medium text-gray-700">{by}</span></span>
            <span className="text-gray-300">·</span>
            <span className="text-[11px] text-gray-400">{date}</span>
          </div>
          {note && <p className="text-[11px] text-gray-400 italic mt-0.5">{note}</p>}
        </div>
      </div>
    </div>
  );
}
