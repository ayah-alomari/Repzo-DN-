import {
  Package, Warehouse, Lock,
  PackageCheck, XCircle,
  ChevronRight, ArrowLeftRight,
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

// ── Page ─────────────────────────────────────────────────────────────────────

export function UnloadLifeCyclePageV2({ onNavigate }: { onNavigate?: (route: string) => void }) {
  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#f7f7f9] overflow-hidden">
      <TopNav customTabs={LIFECYCLE_TABS} activeRoute="unload-life-cycle-v2" onNavigate={onNavigate} />

      <div className="shrink-0 bg-white border-b border-[#e8e8ec] px-10 py-7">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-[#1a1a2e]">
              Unload Life Cycle
            </h1>
            <p className="text-[13px] text-[#8b8b9e] mt-0.5">
              What happens when a DN is cancelled after the transfer is confirmed
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => onNavigate?.("unload-life-cycle")} className="px-3 py-1.5 text-[12px] font-medium text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">V1</button>
            <button
              onClick={() => onNavigate?.("dn-unloads")}
              className="flex items-center gap-2 px-4 py-2 bg-[#1a1a2e] text-white text-[13px] font-medium rounded-xl hover:bg-[#2a2a3e] transition-colors cursor-pointer shrink-0"
            >
              <Package className="w-4 h-4" />
              Go to unloads
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-10 py-8">

        <div className="bg-white rounded-2xl border border-[#e8e8ec] shadow-sm px-10 py-10 mb-5">

          <div className="flex items-stretch gap-0 w-full">

            {/* Stage 1 — Cancel */}
            <Stage num={1} title="Cancel">
              <Node color="red" label="DN Cancelled" icon={XCircle} note="after transfer confirmed" />
            </Stage>

            <StageChevron />

            {/* Stage 2 — Create */}
            <Stage num={2} title="Create">
              <Node color="blue" label="Warehouse Selected" icon={Warehouse} note="required to create the unload" />
              <DownArrow />
              <Node color="orange" label="Unload Transfer Created" icon={Package} />
            </Stage>

            <StageChevron />

            {/* Stage 3 — Unload */}
            <Stage num={3} title="Unload">
              <Node color="green" label="Items Unloaded" icon={PackageCheck} note="van inventory adjusted" />
              <p className="text-[10px] text-gray-400 leading-relaxed pt-1 border-t border-dashed border-gray-100">
                Reservations <strong className="text-gray-500">remain active</strong> — release them manually if no longer needed.
              </p>
            </Stage>

            <StageChevron />

            {/* Stage 4 — Done */}
            <Stage num={4} title="Done">
              <Node color="green" label="Back in Warehouse" icon={Warehouse} note="items returned to stock" />
            </Stage>

          </div>

          {/* Before-confirm cancellation path */}
          <div className="mt-8 pt-6 border-t border-dashed border-[#e8e8ec]">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-purple-50 border border-purple-100">
              <ArrowLeftRight className="w-4 h-4 text-purple-400 shrink-0" />
              <div>
                <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">No unload needed — </span>
                <span className="text-[12px] text-gray-500">
                  If the DN is cancelled <strong className="text-gray-600">before</strong> the transfer is confirmed, the transfer is cancelled directly. No Unload Transfer is created.
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="h-8" />
      </div>
    </div>
  );
}
