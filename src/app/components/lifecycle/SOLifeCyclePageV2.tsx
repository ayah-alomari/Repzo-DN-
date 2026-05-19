import {
  FileText,
  CheckCircle2,
  Lock,
  LockOpen,
  Truck,
  PackageCheck,
  XCircle,
  Info,
  CheckCircle,
  ShoppingCart,
} from "lucide-react";
import { TopNav } from "../TopNav";
import { LIFECYCLE_TABS } from "./LifeCycleTabs";

// ── node ────────────────────────────────────────────────────────────────────

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

const ACTOR_DOT: Record<string, string> = { admin: "bg-indigo-400", rep: "bg-orange-400", auto: "bg-gray-300" };
const ACTOR_COLOR: Record<string, string> = { admin: "text-indigo-400", rep: "text-orange-400", auto: "text-[#8b8b9e]" };
const ACTOR_LABEL: Record<string, string> = { admin: "Admin", rep: "Rep (mobile)", auto: "System" };

function FlowNode({
  color, label, icon: Icon, actor, actors, grow, onClick,
}: {
  color: FlowColor; label: string; icon: React.ElementType;
  actor?: "admin" | "rep" | "auto";
  actors?: Array<"admin" | "rep" | "auto">;
  grow?: boolean;
  onClick?: () => void;
}) {
  const s = C[color];
  const actorList = actors ?? (actor ? [actor] : []);
  return (
    <div
      onClick={onClick}
      className={`${grow ? "flex w-full" : "inline-flex"} items-center gap-3 px-5 py-4 rounded-2xl border-2 bg-white ${s.border} shadow-sm ${onClick ? "cursor-pointer hover:shadow-md hover:brightness-95 transition-all" : ""}`}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${s.iconBg}`}>
        <Icon className={`w-5 h-5 ${s.iconColor}`} />
      </div>
      <div>
        <div className="text-[12px] font-bold text-[#1a1a2e] uppercase tracking-wide whitespace-nowrap">{label}</div>
        {actorList.length > 0 && (
          <div className="flex flex-col gap-0.5 mt-1">
            {actorList.map((a) => (
              <div key={a} className="flex items-center gap-1">
                <div className={`w-1.5 h-1.5 rounded-full ${ACTOR_DOT[a]}`} />
                <span className={`text-[10px] font-medium ${ACTOR_COLOR[a]}`}>{ACTOR_LABEL[a]}</span>
              </div>
            ))}
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

function ForkRight({ topLabel }: { topLabel?: string }) {
  return (
    <div className="relative w-full h-full" style={{ minHeight: 80 }}>
      {/* Horizontal stem from SO Approved to fork junction */}
      <div className="absolute border-t-2 border-dashed border-gray-300"
        style={{ left: 0, right: "58%", top: "50%", transform: "translateY(-1px)" }} />
      {/* Vertical fork line */}
      <div className="absolute border-l-2 border-dashed border-gray-300"
        style={{ left: "42%", top: "22%", bottom: "22%" }} />
      {/* Top branch label */}
      {topLabel && (
        <div className="absolute text-[10px] font-semibold text-gray-400 text-center pointer-events-none"
          style={{ left: "42%", right: 0, top: "22%", transform: "translateY(calc(-100% - 6px))" }}>
          {topLabel}
        </div>
      )}
      {/* Top branch line + arrowhead */}
      <div className="absolute flex items-center"
        style={{ left: "42%", right: 0, top: "22%", transform: "translateY(-50%)" }}>
        <div className="flex-1 border-t-2 border-dashed border-gray-300" />
        <div className="w-0 h-0 border-t-[5px] border-b-[5px] border-l-[8px] border-t-transparent border-b-transparent border-l-gray-400 shrink-0" />
      </div>
      {/* Bottom branch line + arrowhead */}
      <div className="absolute flex items-center"
        style={{ left: "42%", right: 0, bottom: "22%", transform: "translateY(50%)" }}>
        <div className="flex-1 border-t-2 border-dashed border-gray-300" />
        <div className="w-0 h-0 border-t-[5px] border-b-[5px] border-l-[8px] border-t-transparent border-b-transparent border-l-gray-400 shrink-0" />
      </div>
    </div>
  );
}

function MergeArrowRight() {
  return (
    <div className="relative w-full h-full" style={{ minHeight: 80 }}>
      <div className="absolute border-t-2 border-dashed border-gray-300" style={{ left: 0, width: 14, top: "22%" }} />
      <div className="absolute border-t-2 border-dashed border-gray-300" style={{ left: 0, width: 14, bottom: "22%" }} />
      <div className="absolute border-l-2 border-dashed border-gray-300" style={{ left: 14, top: "22%", bottom: "22%" }} />
      <div className="absolute flex items-center" style={{ left: 14, right: 0, top: "50%", transform: "translateY(-1px)" }}>
        <div className="flex-1 border-t-2 border-dashed border-gray-300" />
        <div className="w-0 h-0 border-t-[5px] border-b-[5px] border-l-[8px] border-t-transparent border-b-transparent border-l-gray-400 shrink-0" />
      </div>
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

export function SOLifeCyclePageV2({ onNavigate }: { onNavigate?: (route: string) => void }) {
  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#f7f7f9] overflow-hidden">
      <TopNav customTabs={LIFECYCLE_TABS} activeRoute="so-life-cycle" onNavigate={onNavigate} />

      {/* Page header */}
      <div className="shrink-0 bg-white border-b border-[#e8e8ec] px-10 py-7">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-[#1a1a2e]">Sales Order Life Cycle <span className="text-[16px] text-[#8b8b9e] font-medium ml-1">— Simplified</span></h1>
            <p className="text-[13px] text-[#8b8b9e] mt-0.5">
              A compact overview of the sales order flow — the delivery note cycle is collapsed into a single step
            </p>
          </div>
          <button
            onClick={() => onNavigate?.("sales-orders")}
            className="flex items-center gap-2 px-4 py-2 bg-[#1a1a2e] text-white text-[13px] font-medium rounded-xl hover:bg-[#2a2a3e] transition-colors cursor-pointer shrink-0"
          >
            <ShoppingCart className="w-4 h-4" />
            Go to sales orders
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-auto px-10 py-8">

        {/* ── Diagram card ── */}
        <div className="bg-white rounded-2xl border border-[#e8e8ec] shadow-sm px-10 py-10 mb-5">

          <h2 className="text-[15px] font-bold text-[#1a1a2e] mb-8 tracking-tight">
            Sales order — simplified delivery flow
          </h2>

          {/*
            9-column grid, 3 rows
            Col 1: SO Created          Col 2: →
            Col 3: SO Approved         Col 4: ForkRight (reserve items label)
            Col 5: Items Reserved / No reservation
            Col 6: MergeArrow          Col 7: Delivery Note Cycle
            Col 8: →                   Col 9: Goods Delivered
          */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "auto 130px auto 130px auto 130px auto 130px auto",
              gridTemplateRows: "auto 40px auto",
              alignItems: "center",
            }}
          >
            {/* Col 1: SO Created */}
            <div style={{ gridColumn: "1", gridRow: "1 / 4", alignSelf: "center" }}>
              <FlowNode color="blue" label="Sales Order Created" icon={FileText} actor="admin" grow />
            </div>

            {/* Col 2: → */}
            <div style={{ gridColumn: "2", gridRow: "1 / 4", alignSelf: "center" }} className="flex items-center">
              <ArrowRight />
            </div>

            {/* Col 3: SO Approved */}
            <div style={{ gridColumn: "3", gridRow: "1 / 4", alignSelf: "center" }}>
              <FlowNode color="green" label="SO Approved" icon={CheckCircle2} actor="admin" grow />
            </div>

            {/* Col 4: Fork */}
            <div style={{ gridColumn: "4", gridRow: "1 / 4", alignSelf: "stretch" }} className="flex">
              <ForkRight topLabel="reserve items" />
            </div>

            {/* Col 5, Row 1: Items Reserved */}
            <div style={{ gridColumn: "5", gridRow: "1" }}>
              <FlowNode color="amber" label="Items Reserved" icon={Lock} actor="admin" grow />
            </div>

            {/* Col 5, Row 3: No reservation */}
            <div style={{ gridColumn: "5", gridRow: "3" }}>
              <FlowNode color="amber" label="No reservation" icon={LockOpen} grow />
            </div>

            {/* Col 6: Merge */}
            <div style={{ gridColumn: "6", gridRow: "1 / 4", alignSelf: "stretch" }} className="flex">
              <MergeArrowRight />
            </div>

            {/* Col 7: DN cycle — clickable, navigates to DN lifecycle */}
            <div style={{ gridColumn: "7", gridRow: "1 / 4", alignSelf: "center" }}>
              <FlowNode
                color="purple"
                label="Delivery Note cycle"
                icon={Truck}
                actors={["admin", "rep"]}
                grow
                onClick={() => onNavigate?.("dn-life-cycle")}
              />
            </div>

            {/* Col 8: → */}
            <div style={{ gridColumn: "8", gridRow: "1 / 4", alignSelf: "center" }} className="flex items-center">
              <ArrowRight />
            </div>

            {/* Col 9: Goods Delivered */}
            <div style={{ gridColumn: "9", gridRow: "1 / 4", alignSelf: "center" }}>
              <FlowNode color="green" label="Goods Delivered" icon={PackageCheck} actor="rep" grow />
            </div>
          </div>

          {/* Rejection branch */}
          <div className="flex items-center gap-5 mt-8 pt-6 border-t border-dashed border-[#e8e8ec]">
            <div className="shrink-0">
              <FlowNode color="red" label="SO Rejected" icon={XCircle} actor="admin" />
            </div>
            <p className="text-[12px] text-gray-400 leading-relaxed">
              If the admin <strong className="text-gray-500">rejects</strong> the order at the approval step,
              the SO moves to <strong className="text-gray-500">Rejected</strong>. No delivery note, invoice,
              or reservation can be created from a rejected order.
            </p>
          </div>
        </div>

        {/* DN cycle note */}
        <div className="bg-purple-50 border border-purple-100 rounded-xl px-6 py-4 mb-5 flex items-start gap-3">
          <Truck className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
          <p className="text-[12px] text-purple-700 leading-relaxed">
            The <strong>delivery note cycle</strong> box represents the full delivery note flow: creating the delivery note, transferring items to the rep's van,
            processing, and confirming delivery. See the{" "}
            <button
              onClick={() => onNavigate?.("dn-life-cycle")}
              className="underline font-semibold cursor-pointer hover:text-purple-900"
            >
              Delivery Note Life Cycle
            </button>
            {" "}screen for the detailed breakdown.
          </p>
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
              Order &amp; Reservation Rules
            </h3>
            <ul className="space-y-3">
              <Rule text="A delivery note can only be created after the SO is approved" />
              <Rule text="Multiple delivery notes can be created for a single SO" />
              <Rule text="Converting to invoice locks the SO — status becomes Invoiced" />
              <Rule text="Stock can be reserved on approval or manually at any time" />
              <Rule text="Reservations are never auto-revoked — only a manual action changes them" />
            </ul>
          </div>
          <div className="bg-white rounded-xl border border-[#e8e8ec] p-6">
            <h3 className="text-[13px] font-bold text-[#1a1a2e] mb-4 flex items-center gap-2">
              <Info className="w-4 h-4 text-orange-400" />
              Delivery Note Cycle &amp; Delivery Rules
            </h3>
            <ul className="space-y-3">
              <Rule text="The delivery note cycle covers: transfer creation, loading confirmation, rep receipt, and delivery" />
              <Rule text="Delivery note moves to Processing only after both admin and rep confirm the transfer" />
              <Rule text="Canceling a delivery note in Processing auto-creates a return transfer" />
              <Rule text="Rep marks delivery on the mobile app — not on this dashboard" />
              <Rule text="Canceling a delivery note never revokes reservations — they stay active" />
            </ul>
          </div>
        </div>

        {/* Bottom breathing room */}
        <div className="h-8" />
      </div>
    </div>
  );
}
