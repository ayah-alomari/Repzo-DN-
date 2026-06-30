import {
  Receipt, Lock, LockOpen, Truck,
  PackageCheck, Info, CheckCircle,
  ChevronRight,
} from "lucide-react";
import { TopNav } from "../TopNav";
import { LIFECYCLE_TABS } from "./LifeCycleTabs";

// ── color tokens ─────────────────────────────────────────────────────────────

type FC = "blue" | "green" | "amber" | "indigo" | "purple" | "red";

const C: Record<FC, { bg: string; border: string; icon: string; label: string }> = {
  blue:   { bg: "bg-blue-50",   border: "border-blue-200",   icon: "text-blue-500",   label: "text-blue-800"   },
  green:  { bg: "bg-green-50",  border: "border-green-200",  icon: "text-green-600",  label: "text-green-800"  },
  amber:  { bg: "bg-amber-50",  border: "border-amber-200",  icon: "text-amber-500",  label: "text-amber-800"  },
  indigo: { bg: "bg-indigo-50", border: "border-indigo-200", icon: "text-indigo-500", label: "text-indigo-800" },
  purple: { bg: "bg-purple-50", border: "border-purple-200", icon: "text-purple-500", label: "text-purple-800" },
  red:    { bg: "bg-red-50",    border: "border-red-200",    icon: "text-red-500",    label: "text-red-800"    },
};

function Node({ color, label, icon: Icon, note, rowItem, onClick }: {
  color: FC; label: string; icon: React.ElementType;
  note?: string; rowItem?: boolean; onClick?: () => void;
}) {
  const s = C[color];
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border ${s.bg} ${s.border} ${rowItem ? "flex-1" : "w-full"} ${onClick ? "cursor-pointer hover:brightness-95 transition-all" : ""}`}
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

function Or() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 border-t border-dashed border-gray-200" />
      <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">or</span>
      <div className="flex-1 border-t border-dashed border-gray-200" />
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

export function InvoiceLifeCyclePageV2({ onNavigate }: { onNavigate?: (route: string) => void }) {
  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#f7f7f9] overflow-hidden">
      <TopNav customTabs={LIFECYCLE_TABS} activeRoute="invoice-life-cycle-v2" onNavigate={onNavigate} />

      <div className="shrink-0 bg-white border-b border-[#e8e8ec] px-10 py-7">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-[#1a1a2e]">
              Invoice Life Cycle
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => onNavigate?.("invoice-life-cycle")} className="px-3 py-1.5 text-[12px] font-medium text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">V1</button>
            <button
              onClick={() => onNavigate?.("invoices-inventory")}
              className="flex items-center gap-2 px-4 py-2 bg-[#1a1a2e] text-white text-[13px] font-medium rounded-xl hover:bg-[#2a2a3e] transition-colors cursor-pointer shrink-0"
            >
              <Receipt className="w-4 h-4" />
              Go to invoices
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-10 py-8">

        <div className="bg-white rounded-2xl border border-[#e8e8ec] shadow-sm px-10 py-10 mb-5">

          <div className="flex items-stretch gap-0 w-full">

            {/* Stage 1 — Create */}
            <Stage num={1} title="Create">
              <Node color="indigo" label="Invoice" icon={Receipt} note="from SO or directly" />
            </Stage>

            <StageChevron />

            {/* Stage 2 — Reserve (settings-based) */}
            <Stage num={2} title="Reserve" subtitle="Settings-based" subtitleColor="text-gray-400">
              <Node color="amber" label="Items Reserved" icon={Lock} />
              <Or />
              <Node color="amber" label="No Reservation" icon={LockOpen} />
            </Stage>

            <StageChevron />

            {/* Stage 3 — Ship */}
            <Stage num={3} title="Ship">
              <Node
                color="purple" label="DN + Transfer Cycle" icon={Truck}
                note="click to see full DN lifecycle"
                onClick={() => onNavigate?.("dn-life-cycle")}
              />
            </Stage>

            <StageChevron />

            {/* Stage 4 — Done */}
            <Stage num={4} title="Done">
              <Node color="green" label="Items Delivered" icon={PackageCheck} />
            </Stage>

          </div>

        </div>

        {/* Rules */}
        <div className="grid grid-cols-2 gap-5">
          <div className="bg-white rounded-xl border border-[#e8e8ec] p-6">
            <h3 className="text-[13px] font-bold text-[#1a1a2e] mb-4 flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-400" />
              Invoice — Delivery Rules
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-[12px] text-[#4a4a5a] leading-relaxed">
                <CheckCircle className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />
                <span>Invoice statement (Transactional, Non-transactional) is affected by{" "}
                  <button onClick={() => onNavigate?.("settings")} className="text-indigo-500 underline font-semibold hover:text-indigo-700 cursor-pointer">Invoice &amp; Inventory configuration</button>.
                </span>
              </li>
              <Rule text="The delivery note cycle handles the physical movement of goods" />
              <Rule text="Rep is the one to mark delivery on the mobile app, not on this dashboard" />
              <Rule text="If the invoice was set as Non-transactional, it must go through the DN cycle to deliver" />
              <Rule text="Multiple delivery notes can be created for a single invoice" />
              <Rule text="Partial invoicing is not supported for multiple delivery notes" />
            </ul>
          </div>
          <div className="bg-white rounded-xl border border-[#e8e8ec] p-6">
            <h3 className="text-[13px] font-bold text-[#1a1a2e] mb-4 flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-400" />
              Invoice — Reservation Rules
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-[12px] text-[#4a4a5a] leading-relaxed">
                <CheckCircle className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />
                <span>Reservations are controlled by a setting with two modes: Flexible and Strict. You can adjust this in{" "}
                  <button onClick={() => onNavigate?.("settings")} className="text-indigo-500 underline font-semibold hover:text-indigo-700 cursor-pointer">Reservation settings</button>.
                </span>
              </li>
              <Rule text="In Flexible mode, reserving items is optional — you can create an invoice with or without a reservation" />
              <Rule text="In Strict mode, reserving is required — creating a non-transactional invoice also reserves its items in the same step" />
              <Rule text="If a strict reservation was cancelled, the invoice asks you to reserve again before continuing to create delivery notes" />
              <Rule text="Negative reservations, when enabled, let you reserve quantities beyond available stock; when disabled, you can only reserve what's in stock" />
            </ul>
          </div>
        </div>

        <div className="h-8" />
      </div>
    </div>
  );
}
