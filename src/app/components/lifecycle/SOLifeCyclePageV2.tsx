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
  Receipt,
} from "lucide-react";
import { TopNav } from "../TopNav";
import { LIFECYCLE_TABS } from "./LifeCycleTabs";

// ── shared primitives ────────────────────────────────────────────────────────

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

const ACTOR_DOT:   Record<string, string> = { admin: "bg-indigo-400", rep: "bg-orange-400", auto: "bg-gray-300" };
const ACTOR_COLOR: Record<string, string> = { admin: "text-indigo-400", rep: "text-orange-400", auto: "text-[#8b8b9e]" };
const ACTOR_LABEL: Record<string, string> = { admin: "Admin", rep: "Rep (mobile)", auto: "System" };

function FlowNode({
  color, label, icon: Icon, actor, actors, note, grow, onClick,
}: {
  color: FlowColor; label: string; icon: React.ElementType;
  actor?: "admin" | "rep" | "auto";
  actors?: Array<"admin" | "rep" | "auto">;
  note?: string;
  grow?: boolean;
  onClick?: () => void;
}) {
  const s = C[color];
  const actorList = actors ?? (actor ? [actor] : []);
  return (
    <div
      onClick={onClick}
      className={`${grow ? "flex w-full" : "inline-flex"} items-center gap-3 px-4 py-3.5 rounded-2xl border-2 bg-white ${s.border} shadow-sm ${onClick ? "cursor-pointer hover:shadow-md hover:brightness-95 transition-all" : ""}`}
    >
      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${s.iconBg}`}>
        <Icon className={`w-5 h-5 ${s.iconColor}`} />
      </div>
      <div className="min-w-0">
        <div className="text-[11.5px] font-bold text-[#1a1a2e] uppercase tracking-wide whitespace-nowrap">{label}</div>
        {note && <div className="text-[10px] text-gray-400 mt-0.5 whitespace-nowrap">{note}</div>}
        {actorList.length > 0 && (
          <div className="flex flex-col gap-0.5 mt-1">
            {actorList.map(a => (
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

function ArrowRight({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 h-full w-full">
      {label && <span className="text-[10px] font-semibold text-gray-400 text-center leading-tight">{label}</span>}
      <div className="flex items-center w-full">
        <div className="flex-1 border-t-2 border-dashed border-gray-300" />
        <div className="w-0 h-0 border-t-[5px] border-b-[5px] border-l-[8px] border-t-transparent border-b-transparent border-l-gray-400 shrink-0" />
      </div>
    </div>
  );
}

function ForkRight({ topLabel, bottomLabel }: { topLabel?: string; bottomLabel?: string }) {
  return (
    <div className="relative w-full h-full" style={{ minHeight: 80 }}>
      {/* Horizontal stem */}
      <div className="absolute border-t-2 border-dashed border-gray-300"
        style={{ left: 0, right: "58%", top: "50%", transform: "translateY(-1px)" }} />
      {/* Vertical fork line */}
      <div className="absolute border-l-2 border-dashed border-gray-300"
        style={{ left: "42%", top: "18%", bottom: "18%" }} />
      {/* Top branch label */}
      {topLabel && (
        <div className="absolute text-[9.5px] font-semibold text-indigo-400 text-center pointer-events-none"
          style={{ left: "42%", right: 0, top: "18%", transform: "translateY(calc(-100% - 4px))" }}>
          {topLabel}
        </div>
      )}
      {/* Top branch → */}
      <div className="absolute flex items-center"
        style={{ left: "42%", right: 0, top: "18%", transform: "translateY(-50%)" }}>
        <div className="flex-1 border-t-2 border-dashed border-gray-300" />
        <div className="w-0 h-0 border-t-[5px] border-b-[5px] border-l-[8px] border-t-transparent border-b-transparent border-l-gray-400 shrink-0" />
      </div>
      {/* Bottom branch label */}
      {bottomLabel && (
        <div className="absolute text-[9.5px] font-semibold text-purple-400 text-center pointer-events-none"
          style={{ left: "42%", right: 0, bottom: "18%", transform: "translateY(calc(100% + 4px))" }}>
          {bottomLabel}
        </div>
      )}
      {/* Bottom branch → */}
      <div className="absolute flex items-center"
        style={{ left: "42%", right: 0, bottom: "18%", transform: "translateY(50%)" }}>
        <div className="flex-1 border-t-2 border-dashed border-gray-300" />
        <div className="w-0 h-0 border-t-[5px] border-b-[5px] border-l-[8px] border-t-transparent border-b-transparent border-l-gray-400 shrink-0" />
      </div>
    </div>
  );
}

function MergeArrowRight() {
  return (
    <div className="relative w-full h-full" style={{ minHeight: 80 }}>
      <div className="absolute border-t-2 border-dashed border-gray-300" style={{ left: 0, width: 14, top: "18%" }} />
      <div className="absolute border-t-2 border-dashed border-gray-300" style={{ left: 0, width: 14, bottom: "18%" }} />
      <div className="absolute border-l-2 border-dashed border-gray-300" style={{ left: 14, top: "18%", bottom: "18%" }} />
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

// ── page ─────────────────────────────────────────────────────────────────────

export function SOLifeCyclePageV2({ onNavigate }: { onNavigate?: (route: string) => void }) {
  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#f7f7f9] overflow-hidden">
      <TopNav customTabs={LIFECYCLE_TABS} activeRoute="so-life-cycle" onNavigate={onNavigate} />

      {/* Page header */}
      <div className="shrink-0 bg-white border-b border-[#e8e8ec] px-10 py-7">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-[#1a1a2e]">
              Sales Order Life Cycle
              <span className="text-[16px] text-[#8b8b9e] font-medium ml-1">— Simplified</span>
            </h1>
            <p className="text-[13px] text-[#8b8b9e] mt-0.5">
              Two paths to completion: invoice before delivery, or delivery before invoice
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

          <h2 className="text-[15px] font-bold text-[#1a1a2e] mb-1 tracking-tight">
            Sales order — invoice &amp; delivery flow
          </h2>
          <p className="text-[12px] text-gray-400 mb-8">
            Invoicing can happen at any point after approval. The order of invoice vs. delivery note determines which
            lifecycle the delivery note is created from.
          </p>

          {/*
            12-col × 3-row grid
            Col 1  (rows 1–3): SO Created
            Col 2  (rows 1–3): →
            Col 3  (rows 1–3): SO Approved
            Col 4  (rows 1–3): Reservation fork  (top = "reserve items")
            Col 5, row 1: Items Reserved  /  row 3: No Reservation
            Col 6  (rows 1–3): Reservation merge
            Col 7  (rows 1–3): Invoice / DN fork  (top = "invoice first" · bottom = "DN first")
            Col 8, row 1: Invoice  /  row 3: DN Cycle (from SO)
            Col 9, row 1: → "DN via invoice"  /  row 3: → "then invoice"
            Col 10, row 1: DN Cycle (from invoice)  /  row 3: Invoice
            Col 11 (rows 1–3): Final merge
            Col 12 (rows 1–3): Invoiced & Delivered
          */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "auto 60px auto 110px auto 70px 110px auto 100px auto 80px auto",
              gridTemplateRows: "auto 56px auto",
              alignItems: "center",
            }}
          >
            {/* Col 1: SO Created */}
            <div style={{ gridColumn: "1", gridRow: "1 / 4", alignSelf: "center" }}>
              <FlowNode color="blue" label="SO Created" icon={FileText} grow />
            </div>

            {/* Col 2: → */}
            <div style={{ gridColumn: "2", gridRow: "1 / 4", alignSelf: "center" }} className="flex items-center">
              <ArrowRight />
            </div>

            {/* Col 3: SO Approved */}
            <div style={{ gridColumn: "3", gridRow: "1 / 4", alignSelf: "center" }}>
              <FlowNode color="green" label="SO Approved" icon={CheckCircle2} grow />
            </div>

            {/* Col 4: Reservation fork */}
            <div style={{ gridColumn: "4", gridRow: "1 / 4", alignSelf: "stretch" }} className="flex">
              <ForkRight topLabel="reserve items" />
            </div>

            {/* Col 5, Row 1: Items Reserved */}
            <div style={{ gridColumn: "5", gridRow: "1" }}>
              <FlowNode color="amber" label="Items Reserved" icon={Lock} grow />
            </div>

            {/* Col 5, Row 3: No Reservation */}
            <div style={{ gridColumn: "5", gridRow: "3" }}>
              <FlowNode color="amber" label="No Reservation" icon={LockOpen} grow />
            </div>

            {/* Col 6: Reservation merge */}
            <div style={{ gridColumn: "6", gridRow: "1 / 4", alignSelf: "stretch" }} className="flex">
              <MergeArrowRight />
            </div>

            {/* Col 7: Invoice / DN fork */}
            <div style={{ gridColumn: "7", gridRow: "1 / 4", alignSelf: "stretch" }} className="flex">
              <ForkRight topLabel="invoice first" bottomLabel="DN first" />
            </div>

            {/* Col 8, Row 1: Invoice (Path A) */}
            <div style={{ gridColumn: "8", gridRow: "1" }}>
              <FlowNode color="indigo" label="Invoice" icon={Receipt} grow />
            </div>

            {/* Col 8, Row 3: DN Cycle from SO (Path B) */}
            <div style={{ gridColumn: "8", gridRow: "3" }}>
              <FlowNode
                color="purple" label="DN Cycle" icon={Truck} note="from SO" grow
                onClick={() => onNavigate?.("dn-life-cycle")}
              />
            </div>

            {/* Col 9, Row 1: → Path A */}
            <div style={{ gridColumn: "9", gridRow: "1" }} className="flex items-center">
              <ArrowRight label="DN via invoice" />
            </div>

            {/* Col 9, Row 3: → Path B */}
            <div style={{ gridColumn: "9", gridRow: "3" }} className="flex items-center">
              <ArrowRight label="then invoice" />
            </div>

            {/* Col 10, Row 1: DN Cycle from Invoice (Path A) */}
            <div style={{ gridColumn: "10", gridRow: "1" }}>
              <FlowNode
                color="purple" label="DN Cycle" icon={Truck} note="from invoice" grow
                onClick={() => onNavigate?.("dn-life-cycle")}
              />
            </div>

            {/* Col 10, Row 3: Invoice (Path B) */}
            <div style={{ gridColumn: "10", gridRow: "3" }}>
              <FlowNode color="indigo" label="Invoice" icon={Receipt} grow />
            </div>

            {/* Col 11: Final merge */}
            <div style={{ gridColumn: "11", gridRow: "1 / 4", alignSelf: "stretch" }} className="flex">
              <MergeArrowRight />
            </div>

            {/* Col 12: Invoiced & Delivered */}
            <div style={{ gridColumn: "12", gridRow: "1 / 4", alignSelf: "center" }}>
              <FlowNode color="green" label="Items Delivered" icon={PackageCheck} grow />
            </div>
          </div>

          {/* Rejection branch */}
          <div className="flex items-center gap-5 mt-8 pt-6 border-t border-dashed border-[#e8e8ec]">
            <div className="shrink-0">
              <FlowNode color="red" label="SO Rejected" icon={XCircle} />
            </div>
            <p className="text-[12px] text-gray-400 leading-relaxed">
              If the admin <strong className="text-gray-500">rejects</strong> the order at the approval step,
              the SO moves to <strong className="text-gray-500">Rejected</strong>. No delivery note, invoice,
              or reservation can be created from a rejected order.
            </p>
          </div>
        </div>

        {/* Path callout cards */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-5 py-4 flex items-start gap-3">
            <Receipt className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-[12px] font-bold text-indigo-700 mb-1">Path A — Invoice first</p>
              <p className="text-[12px] text-indigo-600 leading-relaxed">
                The SO is converted to an invoice before any delivery note is created.
                From that point, the <strong>delivery note is created from the invoice</strong>, not the SO.
                Click the <strong>Invoice</strong> node to see the full invoice lifecycle.
              </p>
            </div>
          </div>
          <div className="bg-purple-50 border border-purple-100 rounded-xl px-5 py-4 flex items-start gap-3">
            <Truck className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-[12px] font-bold text-purple-700 mb-1">Path B — Delivery first</p>
              <p className="text-[12px] text-purple-600 leading-relaxed">
                A delivery note is created directly from the approved SO.
                The invoice is issued separately — before or after goods are delivered.
                Click the <strong>DN Cycle</strong> node to see the full delivery note lifecycle.
              </p>
            </div>
          </div>
        </div>

        {/* Rules cards */}
        <div className="grid grid-cols-2 gap-5">
          <div className="bg-white rounded-xl border border-[#e8e8ec] p-6">
            <h3 className="text-[13px] font-bold text-[#1a1a2e] mb-4 flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-400" />
              Order &amp; Invoice Rules
            </h3>
            <ul className="space-y-3">
              <Rule text="Invoicing can happen before or after creating a delivery note — both paths are valid" />
              <Rule text="When the invoice is created first, all delivery notes must be created from the invoice lifecycle" />
              <Rule text="When a DN is created first, the invoice can still be issued at any time from the SO" />
              <Rule text="Converting to invoice locks the SO status to Invoiced — the SO itself is no longer the active source" />
              <Rule text="Stock can be reserved on approval, at invoicing, or manually at any time after approval" />
              <Rule text="Reservations are never auto-revoked — only a manual action changes them" />
            </ul>
          </div>
          <div className="bg-white rounded-xl border border-[#e8e8ec] p-6">
            <h3 className="text-[13px] font-bold text-[#1a1a2e] mb-4 flex items-center gap-2">
              <Info className="w-4 h-4 text-orange-400" />
              Delivery &amp; Completion Rules
            </h3>
            <ul className="space-y-3">
              <Rule text="Multiple delivery notes can be created for a single SO or invoice" />
              <Rule text="The DN cycle covers: transfer creation, loading confirmation, rep receipt, and delivery" />
              <Rule text="Rep marks goods as delivered on the mobile app — not on this dashboard" />
              <Rule text="Canceling a delivery note never revokes reservations — they stay active" />
              <Rule text="The SO is considered complete when it is invoiced and all goods are delivered" />
            </ul>
          </div>
        </div>

        <div className="h-8" />
      </div>
    </div>
  );
}
