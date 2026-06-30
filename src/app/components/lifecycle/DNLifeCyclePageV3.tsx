import {
  FileText, Truck, CheckCircle2, Settings2,
  PackageCheck, XCircle, Info, CheckCircle,
  ChevronRight, Package,
} from "lucide-react";
import { TopNav } from "../TopNav";
import { LIFECYCLE_TABS } from "./LifeCycleTabs";

// ── color tokens ─────────────────────────────────────────────────────────────

type FC = "blue" | "green" | "amber" | "indigo" | "purple" | "orange" | "red";

const C: Record<FC, { bg: string; border: string; icon: string; label: string }> = {
  blue:   { bg: "bg-blue-50",   border: "border-blue-200",   icon: "text-blue-500",   label: "text-blue-800"   },
  green:  { bg: "bg-green-50",  border: "border-green-200",  icon: "text-green-600",  label: "text-green-800"  },
  amber:  { bg: "bg-amber-50",  border: "border-amber-200",  icon: "text-amber-500",  label: "text-amber-800"  },
  indigo: { bg: "bg-indigo-50", border: "border-indigo-200", icon: "text-indigo-500", label: "text-indigo-800" },
  purple: { bg: "bg-purple-50", border: "border-purple-200", icon: "text-purple-500", label: "text-purple-800" },
  orange: { bg: "bg-orange-50", border: "border-orange-200", icon: "text-orange-500", label: "text-orange-800" },
  red:    { bg: "bg-red-50",    border: "border-red-200",    icon: "text-red-500",    label: "text-red-800"    },
};

function Node({ color, label, icon: Icon, note, onClick }: {
  color: FC; label: string; icon: React.ElementType;
  note?: string; onClick?: () => void;
}) {
  const s = C[color];
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border ${s.bg} ${s.border} w-full ${onClick ? "cursor-pointer hover:brightness-95 transition-all" : ""}`}
    >
      <Icon className={`w-3.5 h-3.5 shrink-0 ${s.icon}`} />
      <div className="min-w-0">
        <span className={`text-[11px] font-bold uppercase tracking-wide whitespace-nowrap ${s.label}`}>{label}</span>
        {note && <p className={`text-[10px] mt-0.5 whitespace-nowrap ${s.label} opacity-70`}>{note}</p>}
      </div>
    </div>
  );
}

function DownArrow() {
  return (
    <div className="flex flex-col items-center py-0.5">
      <div className="w-px h-3" style={{ borderLeft: "1px dashed #d1d5db" }} />
      <div className="w-0 h-0" style={{ borderLeft: "4px solid transparent", borderRight: "4px solid transparent", borderTop: "5px solid #d1d5db" }} />
    </div>
  );
}

function Stage({ num, title, subtitle, subtitleColor, children }: {
  num: number; title: string; subtitle?: string; subtitleColor?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col flex-1 min-w-0">
      <div className="flex items-center gap-1.5 mb-3 px-0.5">
        <span className="w-5 h-5 rounded-full bg-[#1a1a2e] text-white text-[10px] font-bold flex items-center justify-center shrink-0">{num}</span>
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{title}</span>
        {subtitle && (
          <span className={`text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap ${subtitleColor ?? "text-gray-400"}`}>· {subtitle}</span>
        )}
      </div>
      <div className="border border-gray-200 rounded-2xl px-4 py-4 bg-white shadow-sm flex flex-col gap-2.5 h-full">
        {children}
      </div>
    </div>
  );
}

function StageChevron() {
  return (
    <div className="flex items-center justify-center pt-8 shrink-0 px-2">
      <ChevronRight className="w-5 h-5 text-gray-300" />
    </div>
  );
}

function Rule({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2 text-[12px] text-[#4a4a5a] leading-relaxed">
      <CheckCircle className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />
      {text}
    </li>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export function DNLifeCyclePageV3({ onNavigate }: { onNavigate?: (route: string) => void }) {
  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#f7f7f9] overflow-hidden">
      <TopNav customTabs={LIFECYCLE_TABS} activeRoute="dn-life-cycle-v3" onNavigate={onNavigate} />

      <div className="shrink-0 bg-white border-b border-[#e8e8ec] px-10 py-7">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-[#1a1a2e]">
              Delivery Note Life Cycle
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => onNavigate?.("dn-life-cycle")} className="px-3 py-1.5 text-[12px] font-medium text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">V1</button>
            <button onClick={() => onNavigate?.("dn-life-cycle-v2")} className="px-3 py-1.5 text-[12px] font-medium text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">V2</button>
            <button
              onClick={() => onNavigate?.("delivery-notes")}
              className="flex items-center gap-2 px-4 py-2 bg-[#1a1a2e] text-white text-[13px] font-medium rounded-xl hover:bg-[#2a2a3e] transition-colors cursor-pointer shrink-0"
            >
              <Truck className="w-4 h-4" />
              Go to delivery notes
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-10 py-8">

        <div className="bg-white rounded-2xl border border-[#e8e8ec] shadow-sm px-10 py-10 mb-5">

          <div className="flex items-stretch gap-0 w-full">

            {/* Stage 1 — Create */}
            <Stage num={1} title="Create">
              <Node color="orange" label="DN Created" icon={FileText} note="from SO or invoice" />
            </Stage>

            <StageChevron />

            {/* Stage 2 — Transfer */}
            <Stage num={2} title="Transfer">
              <Node color="purple" label="Transfer Created" icon={Truck} />
              <DownArrow />
              <Node color="amber" label="Transfer Confirmed" icon={CheckCircle2} />
            </Stage>

            <StageChevron />

            {/* Stage 3 — Process & Deliver */}
            <Stage num={3} title="Deliver">
              <Node color="indigo" label="DN Processing" icon={Settings2} />
              <DownArrow />
              <Node color="green" label="Rep Confirms Delivery" icon={CheckCircle2} note="on mobile app" />
            </Stage>

            <StageChevron />

            {/* Stage 4 — Done */}
            <Stage num={4} title="Done">
              <Node color="green" label="Items Delivered" icon={PackageCheck} />
            </Stage>

          </div>

          {/* Cancellation paths */}
          <div className="mt-8 pt-6 border-t border-dashed border-[#e8e8ec] space-y-3">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Cancellation</p>

            {/* Path 1 — before transfer confirmed */}
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200">
              <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-bold text-gray-600 uppercase tracking-wide mb-1">Before transfer is confirmed</p>
                <p className="text-[12px] text-gray-400 leading-relaxed">
                  Cancelling the DN requires cancelling the linked transfer first.
                  Reservations <strong className="text-gray-500">stay active</strong> — they are never revoked.
                </p>
              </div>
            </div>

            {/* Path 2 — after transfer confirmed */}
            <div className="px-4 py-3 rounded-xl bg-gray-50 border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                <p className="text-[11px] font-bold text-gray-600 uppercase tracking-wide">After transfer is confirmed — pick one</p>
              </div>
              <div className="grid grid-cols-2 gap-3 ml-7">
                <div className="flex items-start gap-3 px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-100">
                  <Truck className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wide mb-0.5">Items stay in van</p>
                    <p className="text-[11px] text-gray-400 leading-relaxed">Items remain in the rep's van. No further action needed.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 px-3 py-2.5 rounded-xl bg-orange-50 border border-orange-100">
                  <Package className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-bold text-orange-700 uppercase tracking-wide mb-0.5">Create Unload Transfer</p>
                    <p className="text-[11px] text-gray-400 leading-relaxed">Return items from the van to a main warehouse.</p>
                    <button
                      onClick={() => onNavigate?.("unload-life-cycle-v2")}
                      className="text-[11px] text-indigo-500 underline font-semibold hover:text-indigo-700 cursor-pointer mt-1"
                    >
                      See Unload lifecycle →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rules */}
        <div className="grid grid-cols-2 gap-5">
          <div className="bg-white rounded-xl border border-[#e8e8ec] p-6">
            <h3 className="text-[13px] font-bold text-[#1a1a2e] mb-4 flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-400" />
              Delivery Notes Rules
            </h3>
            <ul className="space-y-3">
              <Rule text="A delivery note can be created from an invoice or an approved sales order" />
              <Rule text="Multiple delivery notes can be created for a single sales order or invoice" />
              <Rule text="Rep marks delivery on the mobile app, not on this dashboard" />
              <Rule text="A delivered delivery note can't be modified or cancelled" />
              <Rule text="A reservation can only be cancelled manually, and is revoked once its items are delivered" />
            </ul>
          </div>
          <div className="bg-white rounded-xl border border-[#e8e8ec] p-6">
            <h3 className="text-[13px] font-bold text-[#1a1a2e] mb-4 flex items-center gap-2">
              <Info className="w-4 h-4 text-orange-400" />
              Delivery Note — Transfer Rules
            </h3>
            <ul className="space-y-3">
              <Rule text="The delivery note cycle covers transfer creation, transfer approval, and delivery" />
              <Rule text="The delivery note moves from Pending to Noted for Delivery after the transfer is confirmed, if a transfer exists" />
              <Rule text="After the transfer is confirmed, the rep's van inventory is updated" />
              <Rule text="Reservations are transferred from one warehouse to another when the reserved items are transferred" />
            </ul>
          </div>
        </div>

        <div className="h-8" />
      </div>
    </div>
  );
}
