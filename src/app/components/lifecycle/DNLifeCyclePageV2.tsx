import {
  FileText,
  Truck,
  CheckCircle2,
  Settings2,
  PackageCheck,
  XCircle,
  ArrowLeftRight,
  Package,
  Lock,
  Info,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { TopNav } from "../TopNav";
import { LIFECYCLE_TABS } from "./LifeCycleTabs";

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

// Compact node for the dense connected diagram
function CNode({
  color, label, icon: Icon, note, onClick,
}: {
  color: FlowColor; label: string; icon: React.ElementType;
  note?: string; onClick?: () => void;
}) {
  const s = C[color];
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 px-3.5 py-3 rounded-2xl border-2 bg-white ${s.border} shadow-sm ${onClick ? "cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all" : ""}`}
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${s.iconBg}`}>
        <Icon className={`w-4 h-4 ${s.iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-bold text-[#1a1a2e] leading-snug">{label}</div>
        {note && <div className="text-[10px] text-gray-400 mt-0.5">{note}</div>}
      </div>
      {onClick && <ExternalLink className="w-3 h-3 text-indigo-400 shrink-0 ml-0.5" />}
    </Tag>
  );
}

function ArrowRight({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 h-full w-full">
      {label && <span className="text-[9px] font-semibold text-gray-400 text-center whitespace-nowrap">{label}</span>}
      <div className="flex items-center w-full">
        <div className="flex-1 border-t-2 border-dashed border-gray-300" />
        <div className="w-0 h-0 border-t-[5px] border-b-[5px] border-l-[8px] border-t-transparent border-b-transparent border-l-gray-400 shrink-0" />
      </div>
    </div>
  );
}

function ArrowDown({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-1 h-full">
      {label && <span className="text-[9px] font-semibold text-gray-400 text-center whitespace-nowrap mt-1">{label}</span>}
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

export function DNLifeCyclePageV2({ onNavigate }: { onNavigate?: (route: string) => void }) {
  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#f7f7f9] overflow-hidden">
      <TopNav customTabs={LIFECYCLE_TABS} activeRoute="dn-life-cycle" onNavigate={onNavigate} />

      {/* Header */}
      <div className="shrink-0 bg-white border-b border-[#e8e8ec] px-10 py-7">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-[22px] font-bold text-[#1a1a2e]">Delivery Note Life Cycle</h1>
                <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600 text-[11px] font-bold tracking-wide">V2</span>
              </div>
              <p className="text-[13px] text-[#8b8b9e] mt-0.5">
                Happy path across the top; cancellation branches drop down
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate?.("dn-life-cycle")}
              className="px-4 py-2 text-[13px] font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
            >
              View V1
            </button>
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

        {/* ── Main diagram ── */}
        <div className="bg-white rounded-2xl border border-[#e8e8ec] shadow-sm px-10 py-10 mb-5 overflow-x-auto">
          <h2 className="text-[15px] font-bold text-[#1a1a2e] mb-1 tracking-tight">
            Delivery Note &amp; Transfer Cycle
          </h2>
          <p className="text-[12px] text-gray-400 mb-8">
            Happy path along the top; cancellation branches drop down
          </p>

          {/*
            Grid: 11 cols × 9 rows
            Cols: node | arrow | node | arrow | node | arrow | node | arrow | node | arrow | node
                   1      2      3      4      5      6      7      8      9     10     11
            Rows:
              1  Happy path
              2  Drop arrows (before confirm / after confirm)
              3  DN Cancelled (both branches)
              4  Drops
              5  Transfer Cancelled  /  Unload Created
              6  Drops
              7  Items remain reserved (both branches)
              8  Drop (branch 2 only)
              9  Items unload (branch 2 only)

            Branch 1 (before confirm) uses col 3
            Branch 2 (after confirm)  uses col 7
          */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "auto 60px auto 60px auto 60px auto 60px auto 60px auto",
              gridTemplateRows: "auto 55px auto 40px auto 40px auto 40px auto",
              alignItems: "center",
              minWidth: 920,
            }}
          >
            {/* ── Row 1: Happy path ── */}

            <div style={{ gridColumn: "1", gridRow: "1" }}>
              <CNode color="orange" label="Delivery Note(s) created" icon={FileText} note="Admin" />
            </div>
            <div style={{ gridColumn: "2", gridRow: "1" }} className="flex items-center h-full">
              <ArrowRight />
            </div>
            <div style={{ gridColumn: "3", gridRow: "1" }}>
              <CNode color="orange" label="Transfer created" icon={Truck} note="System" />
            </div>
            <div style={{ gridColumn: "4", gridRow: "1" }} className="flex items-center h-full">
              <ArrowRight label="confirm transfer" />
            </div>
            <div style={{ gridColumn: "5", gridRow: "1" }}>
              <CNode color="amber" label="Rep & Admin confirm transfer" icon={CheckCircle2} note="Admin + Rep" />
            </div>
            <div style={{ gridColumn: "6", gridRow: "1" }} className="flex items-center h-full">
              <ArrowRight />
            </div>
            <div style={{ gridColumn: "7", gridRow: "1" }}>
              <CNode color="indigo" label="DN: Processing" icon={Settings2} note="System" />
            </div>
            <div style={{ gridColumn: "8", gridRow: "1" }} className="flex items-center h-full">
              <ArrowRight label="rep confirms delivery" />
            </div>
            <div style={{ gridColumn: "9", gridRow: "1" }}>
              <CNode color="amber" label="Rep confirms delivery" icon={CheckCircle2} note="Rep (mobile)" />
            </div>
            <div style={{ gridColumn: "10", gridRow: "1" }} className="flex items-center h-full">
              <ArrowRight />
            </div>
            <div style={{ gridColumn: "11", gridRow: "1" }}>
              <CNode color="green" label="Items delivered" icon={PackageCheck} note="Rep (mobile)" />
            </div>

            {/* ── Row 2: Drop arrows ── */}

            <div style={{ gridColumn: "3", gridRow: "2" }} className="flex justify-center h-full">
              <ArrowDown label="before confirm" />
            </div>
            <div style={{ gridColumn: "7", gridRow: "2" }} className="flex justify-center h-full">
              <ArrowDown label="after confirm" />
            </div>

            {/* ── Row 3: DN Cancelled ── */}

            <div style={{ gridColumn: "3", gridRow: "3" }}>
              <CNode color="red" label="DN canceled" icon={XCircle} note="before transfer confirm" />
            </div>
            <div style={{ gridColumn: "7", gridRow: "3" }}>
              <CNode color="red" label="DN canceled" icon={XCircle} note="after transfer confirm" />
            </div>

            {/* ── Row 4: Drops ── */}

            <div style={{ gridColumn: "3", gridRow: "4" }} className="flex justify-center h-full">
              <ArrowDown />
            </div>
            <div style={{ gridColumn: "7", gridRow: "4" }} className="flex justify-center h-full">
              <ArrowDown />
            </div>

            {/* ── Row 5: Transfer Cancelled / Unload Created ── */}

            <div style={{ gridColumn: "3", gridRow: "5" }}>
              <CNode color="orange" label="Transfer canceled" icon={ArrowLeftRight} note="System" />
            </div>
            <div style={{ gridColumn: "7", gridRow: "5" }}>
              <CNode
                color="blue"
                label="Unload created"
                icon={Package}
                note="with warehouse selection"
                onClick={() => onNavigate?.("unload-life-cycle")}
              />
            </div>

            {/* ── Row 6: Drops ── */}

            <div style={{ gridColumn: "3", gridRow: "6" }} className="flex justify-center h-full">
              <ArrowDown />
            </div>
            <div style={{ gridColumn: "7", gridRow: "6" }} className="flex justify-center h-full">
              <ArrowDown />
            </div>

            {/* ── Row 7: Items remain reserved (both) ── */}

            <div style={{ gridColumn: "3", gridRow: "7" }}>
              <CNode color="purple" label="Items remain reserved" icon={Lock} note="System" />
            </div>
            <div style={{ gridColumn: "7", gridRow: "7" }}>
              <CNode color="purple" label="Items remain reserved" icon={Lock} note="System" />
            </div>

            {/* ── Row 8: Drop (branch 2 only) ── */}

            <div style={{ gridColumn: "7", gridRow: "8" }} className="flex justify-center h-full">
              <ArrowDown />
            </div>

            {/* ── Row 9: Items unload (branch 2 only) ── */}

            <div style={{ gridColumn: "7", gridRow: "9" }}>
              <CNode color="orange" label="Items unload" icon={PackageCheck} note="Admin" />
            </div>
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

        {/* Rules */}
        <div className="grid grid-cols-2 gap-5">
          <div className="bg-white rounded-xl border border-[#e8e8ec] p-6">
            <h3 className="text-[13px] font-bold text-[#1a1a2e] mb-4 flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-400" />
              Transfer &amp; Cancellation Rules
            </h3>
            <ul className="space-y-3">
              <Rule text="Cancel before confirm → transfer is cancelled directly, no Unload created" />
              <Rule text="Cancel after confirm → Unload is created automatically, admin selects warehouse" />
              <Rule text="Items stay reserved in both cancellation paths — never auto-revoked" />
              <Rule text="Admin must confirm the Unload before inventory is updated" />
              <Rule text="A delivered DN cannot be cancelled" />
            </ul>
          </div>
          <div className="bg-white rounded-xl border border-[#e8e8ec] p-6">
            <h3 className="text-[13px] font-bold text-[#1a1a2e] mb-4 flex items-center gap-2">
              <Info className="w-4 h-4 text-orange-400" />
              Delivery Rules
            </h3>
            <ul className="space-y-3">
              <Rule text="Admin and rep must both confirm the transfer for the DN to move to Processing" />
              <Rule text="After transfer confirmation, rep's van inventory is updated" />
              <Rule text="Rep marks delivery on the mobile app — not on this dashboard" />
              <Rule text="Multiple DNs can be created from a single sales order or invoice" />
              <Rule text="Reservations must be released manually after cancellation if no longer needed" />
            </ul>
          </div>
        </div>

        <div className="h-8" />
      </div>
    </div>
  );
}
