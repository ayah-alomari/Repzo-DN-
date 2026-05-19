import {
  FileText,
  Truck,
  ClipboardList,
  CheckCircle2,
  Settings2,
  PackageCheck,
  XCircle,
  Info,
  CheckCircle,
} from "lucide-react";
import { TopNav } from "../TopNav";
import { LIFECYCLE_TABS } from "./LifeCycleTabs";

// ── shared node ──────────────────────────────────────────────────────────────

type FlowColor = "blue" | "green" | "purple" | "amber" | "orange" | "indigo" | "red";

const C: Record<FlowColor, { border: string; iconBg: string; iconColor: string }> = {
  blue:   { border: "border-blue-200",   iconBg: "bg-blue-50",   iconColor: "text-blue-500"   },
  green:  { border: "border-green-200",  iconBg: "bg-green-50",  iconColor: "text-green-600"  },
  purple: { border: "border-purple-200", iconBg: "bg-purple-50", iconColor: "text-purple-500" },
  amber:  { border: "border-amber-200",  iconBg: "bg-amber-50",  iconColor: "text-amber-500"  },
  orange: { border: "border-orange-200", iconBg: "bg-orange-50", iconColor: "text-orange-500" },
  indigo: { border: "border-indigo-200", iconBg: "bg-indigo-50", iconColor: "text-indigo-500" },
  red:    { border: "border-red-200",    iconBg: "bg-red-50",    iconColor: "text-red-400"    },
};

function FlowNode({
  color, label, icon: Icon, actor, grow,
}: {
  color: FlowColor; label: string; icon: React.ElementType;
  actor?: "admin" | "rep" | "auto"; grow?: boolean;
}) {
  const s = C[color];
  const actorDot = actor === "admin" ? "bg-indigo-400" : actor === "rep" ? "bg-orange-400" : "bg-gray-300";
  const actorColor = actor === "admin" ? "text-indigo-400" : actor === "rep" ? "text-orange-400" : "text-[#8b8b9e]";
  const actorLabel = actor === "admin" ? "Admin" : actor === "rep" ? "Rep (mobile)" : "System";
  return (
    <div className={`${grow ? "flex w-full" : "inline-flex"} items-center gap-3 px-5 py-4 rounded-2xl border-2 bg-white ${s.border} shadow-sm`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${s.iconBg}`}>
        <Icon className={`w-5 h-5 ${s.iconColor}`} />
      </div>
      <div>
        <div className="text-[12px] font-bold text-[#1a1a2e] uppercase tracking-wide whitespace-nowrap">{label}</div>
        {actor && (
          <div className="flex items-center gap-1 mt-1">
            <div className={`w-1.5 h-1.5 rounded-full ${actorDot}`} />
            <span className={`text-[10px] font-medium ${actorColor}`}>{actorLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── arrows ───────────────────────────────────────────────────────────────────

function ArrowRight({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 h-full w-full">
      {label && <span className="text-[10px] font-semibold text-gray-400 text-center">{label}</span>}
      <div className="flex items-center w-full">
        <div className="flex-1 border-t-2 border-dashed border-gray-300" />
        <div className="w-0 h-0 border-t-[5px] border-b-[5px] border-l-[8px] border-t-transparent border-b-transparent border-l-gray-400 shrink-0" />
      </div>
    </div>
  );
}

function ArrowLeft({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 h-full w-full">
      {label && <span className="text-[10px] font-semibold text-gray-400 text-center">{label}</span>}
      <div className="flex items-center w-full">
        <div className="w-0 h-0 border-t-[5px] border-b-[5px] border-r-[8px] border-t-transparent border-b-transparent border-r-gray-400 shrink-0" />
        <div className="flex-1 border-t-2 border-dashed border-gray-300" />
      </div>
    </div>
  );
}

function ArrowDown() {
  return (
    <div className="flex flex-col items-center gap-1 h-full pt-1">
      <div className="flex-1 border-l-2 border-dashed border-gray-300" />
      <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[8px] border-l-transparent border-r-transparent border-t-gray-400 shrink-0 mb-1" />
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

// ── page ────────────────────────────────────────────────────────────────────

export function DNLifeCyclePage({ onNavigate }: { onNavigate?: (route: string) => void }) {
  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#f7f7f9] overflow-hidden">
      <TopNav customTabs={LIFECYCLE_TABS} activeRoute="dn-life-cycle" onNavigate={onNavigate} />

      {/* Page header */}
      <div className="shrink-0 bg-white border-b border-[#e8e8ec] px-10 py-7">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-[#1a1a2e]">Delivery Note Life Cycle</h1>
            <p className="text-[13px] text-[#8b8b9e] mt-0.5">
              A visual guide to how a delivery note flows from creation to goods delivered
            </p>
          </div>
          <button
            onClick={() => onNavigate?.("delivery-notes")}
            className="flex items-center gap-2 px-4 py-2 bg-[#1a1a2e] text-white text-[13px] font-medium rounded-xl hover:bg-[#2a2a3e] transition-colors cursor-pointer shrink-0"
          >
            <Truck className="w-4 h-4" />
            Go to delivery notes
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-auto px-10 py-8">

        {/* ── Diagram card ── */}
        <div className="bg-white rounded-2xl border border-[#e8e8ec] shadow-sm px-10 py-10 mb-5">

          <h2 className="text-[15px] font-bold text-[#1a1a2e] mb-8 tracking-tight">
            Delivery note — transfer &amp; delivery flow
          </h2>

          {/*
            Layout: 5 columns, 3 rows
            Row 1 (left→right): DN Created → Transfer Created → Admin Confirms Transfer
            Row 2: down arrow at col 5
            Row 3 (right→left): Goods Delivered ← DN Processing ← Rep Confirms Transfer
          */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "auto 130px auto 130px auto",
              gridTemplateRows: "auto 80px auto",
              alignItems: "center",
            }}
          >
            {/* ── Row 1 ── */}

            <div style={{ gridColumn: "1", gridRow: "1" }}>
              <FlowNode color="blue" label="Delivery Note Created" icon={FileText} actor="admin" grow />
            </div>

            <div style={{ gridColumn: "2", gridRow: "1" }} className="flex items-center">
              <ArrowRight />
            </div>

            <div style={{ gridColumn: "3", gridRow: "1" }}>
              <FlowNode color="purple" label="Transfer Created" icon={Truck} actor="auto" grow />
            </div>

            <div style={{ gridColumn: "4", gridRow: "1" }} className="flex items-center">
              <ArrowRight label="confirm transfer" />
            </div>

            <div style={{ gridColumn: "5", gridRow: "1" }}>
              <FlowNode color="amber" label="Admin Confirms Transfer" icon={ClipboardList} actor="admin" grow />
            </div>

            {/* ── Down arrow col 5 ── */}
            <div style={{ gridColumn: "5", gridRow: "2" }} className="flex justify-center">
              <ArrowDown />
            </div>

            {/* ── Row 3 (reversed) ── */}

            <div style={{ gridColumn: "1", gridRow: "3" }}>
              <FlowNode color="green" label="Goods Delivered" icon={PackageCheck} actor="rep" grow />
            </div>

            <div style={{ gridColumn: "2", gridRow: "3" }} className="flex items-center">
              <ArrowLeft />
            </div>

            <div style={{ gridColumn: "3", gridRow: "3" }}>
              <FlowNode color="indigo" label="Delivery Note Processing" icon={Settings2} actor="rep" grow />
            </div>

            <div style={{ gridColumn: "4", gridRow: "3" }} className="flex items-center">
              <ArrowLeft label="rep confirms" />
            </div>

            <div style={{ gridColumn: "5", gridRow: "3" }}>
              <FlowNode color="green" label="Rep Confirms Transfer" icon={CheckCircle2} actor="rep" grow />
            </div>
          </div>

          {/* Cancellation branch */}
          <div className="flex items-center gap-5 mt-8 pt-6 border-t border-dashed border-[#e8e8ec]">
            <div className="shrink-0">
              <FlowNode color="red" label="Delivery Note Cancelled" icon={XCircle} actor="admin" />
            </div>
            <p className="text-[12px] text-gray-400 leading-relaxed">
              If the admin <strong className="text-gray-500">cancels</strong> the delivery note while it's in Processing,
              the system auto-creates a <strong className="text-gray-500">return transfer</strong>. Reservations
              are never revoked on cancellation — they must be released manually.
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-8 mb-6 px-1">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Actor key</span>
          {[
            { dot: "bg-indigo-400", label: "Admin (dashboard)" },
            { dot: "bg-orange-400", label: "Rep (mobile app)" },
            { dot: "bg-gray-300",   label: "System (automatic)" },
          ].map(({ dot, label }) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${dot}`} />
              <span className="text-[12px] text-gray-500">{label}</span>
            </div>
          ))}
        </div>

        {/* Rules cards */}
        <div className="grid grid-cols-2 gap-5">
          <div className="bg-white rounded-xl border border-[#e8e8ec] p-6">
            <h3 className="text-[13px] font-bold text-[#1a1a2e] mb-4 flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-400" />
              Delivery Note &amp; Transfer Rules
            </h3>
            <ul className="space-y-3">
              <Rule text="A delivery note can only be created from an approved sales order" />
              <Rule text="Multiple delivery notes can be created for a single SO" />
              <Rule text="Admin must confirm the transfer before the rep can receive it" />
              <Rule text="After transfer confirmation, the rep's van inventory is updated" />
              <Rule text="A delivery note in Processing can be cancelled — this auto-creates a return transfer" />
            </ul>
          </div>
          <div className="bg-white rounded-xl border border-[#e8e8ec] p-6">
            <h3 className="text-[13px] font-bold text-[#1a1a2e] mb-4 flex items-center gap-2">
              <Info className="w-4 h-4 text-orange-400" />
              Delivery Rules
            </h3>
            <ul className="space-y-3">
              <Rule text="Rep marks goods as delivered on the mobile app — not on this dashboard" />
              <Rule text="Cancelling a delivery note never revokes reservations — they remain active" />
              <Rule text="A delivered delivery note cannot be modified or cancelled" />
              <Rule text="Partial deliveries are not supported — the delivery note is fully delivered or not" />
              <Rule text="Return transfers from a cancelled delivery note must be confirmed by admin" />
            </ul>
          </div>
        </div>

        {/* Bottom breathing room */}
        <div className="h-8" />
      </div>
    </div>
  );
}
