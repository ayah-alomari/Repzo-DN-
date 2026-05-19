import {
  FileText,
  CheckCircle2,
  Lock,
  LockOpen,
  Truck,
  ClipboardList,
  ArrowLeftRight,
  Settings2,
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

function FlowNode({
  color,
  label,
  icon: Icon,
  actor,
  grow,
}: {
  color: FlowColor;
  label: string;
  icon: React.ElementType;
  actor?: "admin" | "rep" | "auto";
  grow?: boolean;
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
        <div className="text-[12px] font-bold text-[#1a1a2e] uppercase tracking-wide whitespace-nowrap">
          {label}
        </div>
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

// All horizontal arrows use flex-1 lines so they fill their column exactly.
// All arrowheads are identical: border-t-[5px] border-b-[5px] border-l/r-[8px].

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

// SO Approved → horizontal stem → vertical fork → two branches (Items Reserved / No reservation)
// All lines use the same border-dashed style as ArrowRight/ArrowLeft.
function ForkRight() {
  return (
    <div className="relative w-full h-full" style={{ minHeight: 80 }}>
      {/* Horizontal stem from SO Approved to fork junction */}
      <div
        className="absolute border-t-2 border-dashed border-gray-300"
        style={{ left: 0, right: "58%", top: "50%", transform: "translateY(-1px)" }}
      />
      {/* Vertical fork line connecting both branches */}
      <div
        className="absolute border-l-2 border-dashed border-gray-300"
        style={{ left: "42%", top: "22%", bottom: "22%" }}
      />
      {/* Top branch → Items Reserved */}
      <div
        className="absolute flex items-center"
        style={{ left: "42%", right: 0, top: "22%", transform: "translateY(-50%)" }}
      >
        <div className="flex-1 border-t-2 border-dashed border-gray-300" />
        <div className="w-0 h-0 border-t-[5px] border-b-[5px] border-l-[8px] border-t-transparent border-b-transparent border-l-gray-400 shrink-0" />
      </div>
      {/* Bottom branch → No reservation */}
      <div
        className="absolute flex items-center"
        style={{ left: "42%", right: 0, bottom: "22%", transform: "translateY(50%)" }}
      >
        <div className="flex-1 border-t-2 border-dashed border-gray-300" />
        <div className="w-0 h-0 border-t-[5px] border-b-[5px] border-l-[8px] border-t-transparent border-b-transparent border-l-gray-400 shrink-0" />
      </div>
    </div>
  );
}

// Both inputs (top & bottom) merge into one rightward arrow — mirror of ForkRight.
function MergeArrowRight() {
  return (
    <div className="relative w-full h-full" style={{ minHeight: 80 }}>
      {/* Top tick from Items Reserved */}
      <div className="absolute border-t-2 border-dashed border-gray-300" style={{ left: 0, width: 14, top: "22%" }} />
      {/* Bottom tick from No reservation */}
      <div className="absolute border-t-2 border-dashed border-gray-300" style={{ left: 0, width: 14, bottom: "22%" }} />
      {/* Vertical bracket spine */}
      <div className="absolute border-l-2 border-dashed border-gray-300" style={{ left: 14, top: "22%", bottom: "22%" }} />
      {/* Center horizontal line + arrowhead → DN Created */}
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

export function SOLifeCyclePage({ onNavigate }: { onNavigate?: (route: string) => void }) {
  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#f7f7f9] overflow-hidden">
      <TopNav customTabs={LIFECYCLE_TABS} activeRoute="so-life-cycle" onNavigate={onNavigate} />

      {/* Page header */}
      <div className="shrink-0 bg-white border-b border-[#e8e8ec] px-10 py-7">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-[#1a1a2e]">Sales Order Life Cycle</h1>
            <p className="text-[13px] text-[#8b8b9e] mt-0.5">
              A visual guide to how a sales order flows from creation to delivery — use this page as a reference anytime
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
            Sales order &amp; invoice — delivery flow
          </h2>

          {/*
            Layout: 7 columns, 5 rows
            ─ Col 2, 4, 6 are connectors (equal width)
            ─ Col 1, 3, 5, 7 are node columns (auto width, left-aligned)
            ─ Rows 1–3: top section (SO Created / SO Approved / fork / Items Reserved+No Reservation / merge / DN Created)
            ─ Row 4: vertical drop
            ─ Row 5: bottom snake (Goods Delivered ← DN Processing ← Transfer Created ← Items Noted)
            ─ Boxes in the same column align from the left (justify-start)
          */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "auto 130px auto 130px auto 130px auto",
              gridTemplateRows: "auto 40px auto 80px auto",
              alignItems: "center",
            }}
          >
            {/* ── Col 1: SO Created (spans rows 1–3, left-aligned) ── */}
            <div style={{ gridColumn: "1", gridRow: "1 / 4", alignSelf: "center" }} className="">
              <FlowNode color="blue" label="Sales Order Created" icon={FileText} actor="admin" grow />
            </div>

            {/* ── Col 2: Arrow → SO Approved (spans rows 1–3) ── */}
            <div style={{ gridColumn: "2", gridRow: "1 / 4", alignSelf: "center" }} className="flex items-center">
              <ArrowRight />
            </div>

            {/* ── Col 3: SO Approved (spans rows 1–3, left-aligned) ── */}
            <div style={{ gridColumn: "3", gridRow: "1 / 4", alignSelf: "center" }} className="">
              <FlowNode color="green" label="SO Approved" icon={CheckCircle2} actor="admin" grow />
            </div>

            {/* ── Col 4: Fork connector — stem from SO Approved, vertical fork, two branches (spans rows 1–3) ── */}
            <div style={{ gridColumn: "4", gridRow: "1 / 4", alignSelf: "stretch" }} className="flex">
              <ForkRight />
            </div>

            {/* ── Col 5, Row 1: Items Reserved (top branch, left-aligned) ── */}
            <div style={{ gridColumn: "5", gridRow: "1" }} className="">
              <FlowNode color="amber" label="Items Reserved" icon={Lock} actor="admin" grow />
            </div>

            {/* ── Col 5, Row 3: No reservation (bottom branch, left-aligned) ── */}
            <div style={{ gridColumn: "5", gridRow: "3" }} className="">
              <FlowNode color="amber" label="No reservation" icon={LockOpen} actor="admin" grow />
            </div>

            {/* ── Col 6: Merge bracket — collects both rows into one arrow → DN Created (spans rows 1–3) ── */}
            <div style={{ gridColumn: "6", gridRow: "1 / 4", alignSelf: "stretch" }} className="flex">
              <MergeArrowRight />
            </div>

            {/* ── Col 7: DN Created (spans rows 1–3, left-aligned) ── */}
            <div style={{ gridColumn: "7", gridRow: "1 / 4", alignSelf: "center" }} className="">
              <FlowNode color="purple" label="DN Created" icon={Truck} actor="admin" grow />
            </div>

            {/* ── Col 7, Row 4: Vertical drop DN Created → Items Noted ── */}
            <div style={{ gridColumn: "7", gridRow: "4" }} className="flex justify-center">
              <ArrowDown />
            </div>

            {/* ── Row 5: snake right → left ── */}

            {/* Col 7: Items Noted (left-aligned — same column as DN Created above) */}
            <div style={{ gridColumn: "7", gridRow: "5" }} className="">
              <FlowNode color="purple" label="Items Noted" icon={ClipboardList} actor="auto" grow />
            </div>

            {/* Col 6: ← confirm transfer */}
            <div style={{ gridColumn: "6", gridRow: "5" }} className="flex items-center">
              <ArrowLeft label="confirm transfer" />
            </div>

            {/* Col 5: Transfer Created (left-aligned — same column as Items Reserved above) */}
            <div style={{ gridColumn: "5", gridRow: "5" }} className="">
              <FlowNode color="orange" label="Transfer Created" icon={ArrowLeftRight} actor="auto" grow />
            </div>

            {/* Col 4: ← */}
            <div style={{ gridColumn: "4", gridRow: "5" }} className="flex items-center">
              <ArrowLeft />
            </div>

            {/* Col 3: DN Processing (left-aligned — same column as SO Approved above) */}
            <div style={{ gridColumn: "3", gridRow: "5" }} className="">
              <FlowNode color="indigo" label="DN Processing" icon={Settings2} actor="rep" grow />
            </div>

            {/* Col 2: ← */}
            <div style={{ gridColumn: "2", gridRow: "5" }} className="flex items-center">
              <ArrowLeft />
            </div>

            {/* Col 1: Goods Delivered (left-aligned — same column as SO Created above) */}
            <div style={{ gridColumn: "1", gridRow: "5" }} className="">
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
              the SO moves to <strong className="text-gray-500">Rejected</strong>. No DN, invoice,
              or reservation can be created from a rejected order.
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
              Order &amp; Reservation Rules
            </h3>
            <ul className="space-y-3">
              <Rule text="A DN can only be created after the SO is approved" />
              <Rule text="Multiple DNs can be created for a single SO" />
              <Rule text="Converting to invoice locks the SO — status becomes Invoiced" />
              <Rule text="Stock can be reserved on approval or manually at any time" />
              <Rule text="Reservations are never auto-revoked — only a manual action changes them" />
            </ul>
          </div>
          <div className="bg-white rounded-xl border border-[#e8e8ec] p-6">
            <h3 className="text-[13px] font-bold text-[#1a1a2e] mb-4 flex items-center gap-2">
              <Info className="w-4 h-4 text-orange-400" />
              Transfer &amp; Delivery Rules
            </h3>
            <ul className="space-y-3">
              <Rule text="DN moves to Processing only after both admin and rep confirm the transfer" />
              <Rule text="After transfer, the reservation warehouse updates to the rep's van" />
              <Rule text="Canceling a DN in Processing auto-creates a return transfer" />
              <Rule text="Canceling a DN never revokes reservations — they stay active" />
              <Rule text="Rep marks delivery on the mobile app — not on this dashboard" />
            </ul>
          </div>
        </div>

        {/* Bottom breathing room */}
        <div className="h-8" />
      </div>
    </div>
  );
}
