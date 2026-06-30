import { useState } from "react";
import {
  FileText, CheckCircle2, Lock, LockOpen,
  Truck, PackageCheck, Receipt, XCircle,
  Info, CheckCircle, ShoppingCart, ChevronRight,
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

// ── Node ─────────────────────────────────────────────────────────────────────

function Node({ color, label, icon: Icon, rowItem, onClick }: {
  color: FC; label: string; icon: React.ElementType; rowItem?: boolean; onClick?: () => void;
}) {
  const s = C[color];
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border ${s.bg} ${s.border} ${rowItem ? "flex-1" : "w-full"} ${onClick ? "cursor-pointer hover:brightness-95 transition-all" : ""}`}
    >
      <Icon className={`w-3.5 h-3.5 shrink-0 ${s.icon}`} />
      <span className={`text-[11px] font-bold uppercase tracking-wide whitespace-nowrap ${s.label}`}>{label}</span>
    </div>
  );
}

// ── Mini inline arrow (between sequential nodes in one row) ──────────────────

function InlineArrow() {
  return (
    <div className="flex items-center shrink-0 px-1">
      <div className="w-5 border-t border-dashed border-gray-300" />
      <div className="w-0 h-0 border-t-[4px] border-b-[4px] border-l-[5px] border-t-transparent border-b-transparent border-l-gray-300" />
    </div>
  );
}

// ── OR divider ────────────────────────────────────────────────────────────────

function Or() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 border-t border-dashed border-gray-200" />
      <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">or</span>
      <div className="flex-1 border-t border-dashed border-gray-200" />
    </div>
  );
}

// ── Down arrow (within a stage, between sequential steps) ────────────────────

function DownArrow() {
  return (
    <div className="flex flex-col items-center gap-0 py-0.5">
      <div className="w-px h-3 bg-gray-300" style={{ borderLeft: "1px dashed #d1d5db" }} />
      <div className="w-0 h-0"
        style={{ borderLeft: "4px solid transparent", borderRight: "4px solid transparent", borderTop: "5px solid #d1d5db" }} />
    </div>
  );
}

// ── Stage container ───────────────────────────────────────────────────────────

function Stage({ num, title, subtitle, subtitleColor, children }: {
  num: number; title: string;
  subtitle?: string; subtitleColor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col flex-1 min-w-0">
      {/* header */}
      <div className="flex items-center gap-1.5 mb-3 px-0.5">
        <span className="w-5 h-5 rounded-full bg-[#1a1a2e] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
          {num}
        </span>
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{title}</span>
        {subtitle && (
          <span className={`text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap ${subtitleColor ?? "text-gray-400"}`}>
            · {subtitle}
          </span>
        )}
      </div>
      {/* box */}
      <div className="border border-gray-200 rounded-2xl px-4 py-4 bg-white shadow-sm flex flex-col gap-2.5 h-full">
        {children}
      </div>
    </div>
  );
}

// ── Between-stage chevron ─────────────────────────────────────────────────────

function StageChevron() {
  return (
    <div className="flex items-center justify-center pt-8 shrink-0 px-1">
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

export function SOLifeCyclePageV3({ onNavigate }: { onNavigate?: (route: string) => void }) {
  const [rulesTab, setRulesTab] = useState<"dn" | "res">("dn");
  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#f7f7f9] overflow-hidden">
      <TopNav customTabs={LIFECYCLE_TABS} activeRoute="so-life-cycle-v3" onNavigate={onNavigate} />

      {/* Page header */}
      <div className="shrink-0 bg-white border-b border-[#e8e8ec] px-10 py-7">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-[#1a1a2e]">
              Sales Order Life Cycle
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onNavigate?.("so-life-cycle")} className="px-3 py-1.5 text-[12px] font-medium text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">V1</button>
            <button onClick={() => onNavigate?.("so-life-cycle-v2")} className="px-3 py-1.5 text-[12px] font-medium text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">V2</button>
            <button
              onClick={() => onNavigate?.("sales-orders")}
              className="flex items-center gap-2 px-4 py-2 bg-[#1a1a2e] text-white text-[13px] font-medium rounded-xl hover:bg-[#2a2a3e] transition-colors cursor-pointer shrink-0"
            >
              <ShoppingCart className="w-4 h-4" />
              Go to sales orders
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-10 py-8">

        {/* ── Main diagram ── */}
        <div className="bg-white rounded-2xl border border-[#e8e8ec] shadow-sm px-10 py-10 mb-5">

          {/* Stage row */}
          <div className="flex items-stretch gap-0 w-full">

            {/* Stage 1 — Order */}
            <Stage num={1} title="Order">
              <Node color="blue" label="SO Created" icon={FileText} />
              <DownArrow />
              <Node color="green" label="SO Approved" icon={CheckCircle2} />
            </Stage>

            <StageChevron />

            {/* Stage 2 — Reserve */}
            <Stage num={2} title="Reserve" subtitle="Settings-based" subtitleColor="text-gray-400">
              <Node color="amber" label="Items Reserved" icon={Lock} />
              <Or />
              <Node color="amber" label="No Reservation" icon={LockOpen} />
            </Stage>

            <StageChevron />

            {/* Stage 3 — Bill & Ship */}
            <Stage num={3} title="Bill & Ship" subtitle="Pick a sequence" subtitleColor="text-indigo-400">
              {/* Path A: Invoice → DN Cycle */}
              <div className="flex items-center w-full">
                <Node color="indigo" label="Invoice" icon={Receipt} rowItem />
                <InlineArrow />
                <Node color="purple" label="DN Cycle" icon={Truck} rowItem onClick={() => onNavigate?.("dn-life-cycle")} />
              </div>
              <Or />
              {/* Path B: DN Cycle → Invoice */}
              <div className="flex items-center w-full">
                <Node color="purple" label="DN Cycle" icon={Truck} rowItem onClick={() => onNavigate?.("dn-life-cycle")} />
                <InlineArrow />
                <Node color="indigo" label="Invoice" icon={Receipt} rowItem />
              </div>
            </Stage>

            <StageChevron />

            {/* Stage 4 — Done */}
            <Stage num={4} title="Done">
              <Node color="green" label="Items Delivered" icon={PackageCheck} />
            </Stage>

          </div>

          {/* Rejection note */}
          <div className="flex items-center gap-5 mt-8 pt-6 border-t border-dashed border-[#e8e8ec]">
            <div className="shrink-0">
              <Node color="red" label="SO Rejected" icon={XCircle} />
            </div>
            <p className="text-[12px] text-gray-400 leading-relaxed">
              If the admin <strong className="text-gray-500">rejects</strong> the order at the approval step,
              the SO moves to <strong className="text-gray-500">Rejected</strong>. No delivery note, invoice,
              or reservation can be created from a rejected order.
            </p>
          </div>
        </div>

        {/* Rules — tabbed card */}
        <div className="bg-white rounded-xl border border-[#e8e8ec] p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[13px] font-bold text-[#1a1a2e] flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-400" />
              Sales Order Rules
            </h3>
            <div className="flex items-center gap-1 bg-[#f5f5f7] rounded-lg p-1">
              <button
                onClick={() => setRulesTab("dn")}
                className={`px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all cursor-pointer ${rulesTab === "dn" ? "bg-[#1a1a2e] text-white shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
              >
                Delivery note · 4
              </button>
              <button
                onClick={() => setRulesTab("res")}
                className={`px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all cursor-pointer ${rulesTab === "res" ? "bg-[#1a1a2e] text-white shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
              >
                Reservation · 8
              </button>
            </div>
          </div>

          {rulesTab === "dn" && (
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              <Rule text="A delivery note can only be created after the sales order is approved" />
              <Rule text="Multiple delivery notes can be created for a single sales order" />
              <Rule text="One delivery note can be created at a time" />
              <Rule text="Converting to invoice locks the delivery note actions on sales orders; status becomes Invoiced" />
            </div>
          )}

          {rulesTab === "res" && (
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              <li className="flex items-start gap-2 text-[12px] text-[#4a4a5a] leading-relaxed list-none">
                <CheckCircle className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />
                <span>Reservations are controlled by a setting with two modes: Flexible and Strict. Adjust in{" "}
                  <button onClick={() => onNavigate?.("settings")} className="text-[12px] text-indigo-500 underline font-semibold hover:text-indigo-700 cursor-pointer">Reservation settings</button>.
                </span>
              </li>
              <Rule text="A reservation holds the order's items in a warehouse so they aren't used elsewhere" />
              <Rule text="In Flexible mode, reserving after approval is optional and can be skipped" />
              <Rule text="In Strict mode, the order can't be approved until its items are reserved" />
              <Rule text="You can reserve all items at once, or only the ones not yet reserved" />
              <Rule text="You can also reserve items manually at any time after approval" />
              <Rule text="Cancelling a reservation releases the items and moves it to History" />
              <Rule text="Negative reservations, when enabled, let you reserve quantities beyond available stock; when disabled, you can only reserve what's in stock" />
            </div>
          )}
        </div>

        <div className="h-8" />
      </div>
    </div>
  );
}
