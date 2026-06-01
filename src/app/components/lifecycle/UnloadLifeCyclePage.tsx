import {
  Settings2,
  XCircle,
  Package,
  Warehouse,
  Lock,
  PackageCheck,
  ArrowLeftRight,
  Info,
  CheckCircle,
  Truck,
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

function FlowNode({
  color, label, icon: Icon, actor, grow, onClick, note,
}: {
  color: FlowColor; label: string; icon: React.ElementType;
  actor?: "admin" | "rep" | "auto"; grow?: boolean;
  onClick?: () => void; note?: string;
}) {
  const s = C[color];
  const actorDot   = actor === "admin" ? "bg-indigo-400" : actor === "rep" ? "bg-orange-400" : "bg-gray-300";
  const actorColor = actor === "admin" ? "text-indigo-400" : actor === "rep" ? "text-orange-400" : "text-[#8b8b9e]";
  const actorLabel = actor === "admin" ? "Admin" : actor === "rep" ? "Rep (mobile)" : "System";
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      onClick={onClick}
      className={`${grow ? "flex w-full" : "inline-flex"} items-center gap-3 px-5 py-4 rounded-2xl border-2 bg-white ${s.border} shadow-sm ${onClick ? "cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all" : ""}`}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${s.iconBg}`}>
        <Icon className={`w-5 h-5 ${s.iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-bold text-[#1a1a2e] uppercase tracking-wide whitespace-nowrap">{label}</div>
        {note && <div className="text-[10px] text-gray-400 mt-0.5">{note}</div>}
        {actor && (
          <div className="flex items-center gap-1 mt-1">
            <div className={`w-1.5 h-1.5 rounded-full ${actorDot}`} />
            <span className={`text-[10px] font-medium ${actorColor}`}>{actorLabel}</span>
          </div>
        )}
      </div>
      {onClick && <ExternalLink className="w-3.5 h-3.5 text-indigo-400 shrink-0 ml-1" />}
    </Tag>
  );
}

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

export function UnloadLifeCyclePage({ onNavigate }: { onNavigate?: (route: string) => void }) {
  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#f7f7f9] overflow-hidden">
      <TopNav customTabs={LIFECYCLE_TABS} activeRoute="unload-life-cycle" onNavigate={onNavigate} />

      <div className="shrink-0 bg-white border-b border-[#e8e8ec] px-10 py-7">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-[#1a1a2e]">Unload Life Cycle</h1>
            <p className="text-[13px] text-[#8b8b9e] mt-0.5">
              What happens when a delivery note is cancelled after the transfer is confirmed
            </p>
          </div>
          <button
            onClick={() => onNavigate?.("dn-unloads")}
            className="flex items-center gap-2 px-4 py-2 bg-[#1a1a2e] text-white text-[13px] font-medium rounded-xl hover:bg-[#2a2a3e] transition-colors cursor-pointer shrink-0"
          >
            <Package className="w-4 h-4" />
            Go to unloads
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-10 py-8">

        {/* Main diagram — after-confirm cancellation path */}
        <div className="bg-white rounded-2xl border border-[#e8e8ec] shadow-sm px-10 py-10 mb-5">
          <h2 className="text-[15px] font-bold text-[#1a1a2e] mb-2 tracking-tight">
            Cancel after transfer confirmed — Unload flow
          </h2>
          <p className="text-[12px] text-gray-400 mb-8">
            When a DN is cancelled <strong className="text-gray-500">after</strong> the transfer is confirmed,
            an Unload is created. The admin selects the warehouse to return items to, and the items are unloaded.
            Reservations remain active throughout.
          </p>

          {/*
            5 cols, 3 rows — matching DNLifeCyclePage pattern
            Row 1 (left→right): DN Processing → DN Cancelled → Unload Created → Warehouse Selected
            Row 2: drop at col 5
            Row 3 (right→left): Items Unloaded ← Items Remain Reserved ← (from col 5)
          */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "auto 100px auto 100px auto",
              gridTemplateRows: "auto 80px auto",
              alignItems: "center",
            }}
          >
            {/* Row 1 */}
            <div style={{ gridColumn: "1", gridRow: "1" }}>
              <FlowNode color="indigo" label="DN Processing" icon={Settings2} actor="rep" grow
                onClick={() => onNavigate?.("dn-life-cycle")}
                note="see DN life cycle"
              />
            </div>
            <div style={{ gridColumn: "2", gridRow: "1" }} className="flex items-center">
              <ArrowRight label="cancelled" />
            </div>
            <div style={{ gridColumn: "3", gridRow: "1" }}>
              <FlowNode color="red" label="DN Cancelled" icon={XCircle} actor="admin" grow />
            </div>
            <div style={{ gridColumn: "4", gridRow: "1" }} className="flex items-center">
              <ArrowRight />
            </div>
            <div style={{ gridColumn: "5", gridRow: "1" }}>
              <FlowNode color="orange" label="Unload Created" icon={Package} actor="auto" grow />
            </div>

            {/* Drop */}
            <div style={{ gridColumn: "5", gridRow: "2" }} className="flex justify-center">
              <ArrowDown />
            </div>

            {/* Row 3 */}
            <div style={{ gridColumn: "1", gridRow: "3" }}>
              <FlowNode color="green" label="Items Unloaded" icon={PackageCheck} actor="admin" grow />
            </div>
            <div style={{ gridColumn: "2", gridRow: "3" }} className="flex items-center">
              <ArrowLeft />
            </div>
            <div style={{ gridColumn: "3", gridRow: "3" }}>
              <FlowNode color="amber" label="Items Remain Reserved" icon={Lock} actor="auto" grow />
            </div>
            <div style={{ gridColumn: "4", gridRow: "3" }} className="flex items-center">
              <ArrowLeft label="select warehouse" />
            </div>
            <div style={{ gridColumn: "5", gridRow: "3" }}>
              <FlowNode color="blue" label="Warehouse Selected" icon={Warehouse} actor="admin" grow />
            </div>
          </div>

          {/* Before-confirm cancellation note */}
          <div className="flex items-center gap-5 mt-8 pt-6 border-t border-dashed border-[#e8e8ec]">
            <div className="shrink-0">
              <FlowNode color="purple" label="Transfer Cancelled" icon={ArrowLeftRight} actor="auto" />
            </div>
            <p className="text-[12px] text-gray-400 leading-relaxed">
              If the DN is cancelled <strong className="text-gray-500">before</strong> the transfer is confirmed,
              no Unload is created — the <strong className="text-gray-500">transfer is cancelled</strong> directly.
              Items remain reserved in either case.
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

        {/* Rules */}
        <div className="grid grid-cols-2 gap-5">
          <div className="bg-white rounded-xl border border-[#e8e8ec] p-6">
            <h3 className="text-[13px] font-bold text-[#1a1a2e] mb-4 flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-400" />
              Unload Rules
            </h3>
            <ul className="space-y-3">
              <Rule text="An Unload is only created when a DN is cancelled after the transfer is confirmed" />
              <Rule text="Admin must select the warehouse to return the items to before the unload proceeds" />
              <Rule text="Cancelling before transfer confirmation cancels the transfer directly — no Unload" />
              <Rule text="Items stay reserved in both cancellation paths — reservations are never auto-revoked" />
              <Rule text="The Unload must be confirmed by admin before inventory is updated" />
            </ul>
          </div>
          <div className="bg-white rounded-xl border border-[#e8e8ec] p-6">
            <h3 className="text-[13px] font-bold text-[#1a1a2e] mb-4 flex items-center gap-2">
              <Info className="w-4 h-4 text-orange-400" />
              Stock &amp; Reservation Notes
            </h3>
            <ul className="space-y-3">
              <Rule text="After unload, reserved items return to the selected warehouse — not automatically released" />
              <Rule text="Reservations must be manually released after an unload if they are no longer needed" />
              <Rule text="A completed Unload cannot be reversed — create a new DN to redeliver if needed" />
              <Rule text="Multiple unloads can exist for the same DN if partially processed" />
              <Rule text="Rep's van inventory is adjusted automatically after the unload is confirmed" />
            </ul>
          </div>
        </div>

        <div className="h-8" />
      </div>
    </div>
  );
}
