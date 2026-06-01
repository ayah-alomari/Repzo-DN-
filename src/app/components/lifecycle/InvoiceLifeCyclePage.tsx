import {
  Lock,
  LockOpen,
  Truck,
  PackageCheck,
  Info,
  CheckCircle,
  ExternalLink,
  Receipt,
  XCircle,
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

function ForkRight() {
  return (
    <div className="relative w-full h-full" style={{ minHeight: 80 }}>
      <div className="absolute border-t-2 border-dashed border-gray-300" style={{ left: 0, right: "58%", top: "50%", transform: "translateY(-1px)" }} />
      <div className="absolute border-l-2 border-dashed border-gray-300" style={{ left: "42%", top: "22%", bottom: "22%" }} />
      <div className="absolute flex items-center" style={{ left: "42%", right: 0, top: "22%", transform: "translateY(-50%)" }}>
        <div className="flex-1 border-t-2 border-dashed border-gray-300" />
        <div className="w-0 h-0 border-t-[5px] border-b-[5px] border-l-[8px] border-t-transparent border-b-transparent border-l-gray-400 shrink-0" />
      </div>
      <div className="absolute flex items-center" style={{ left: "42%", right: 0, bottom: "22%", transform: "translateY(50%)" }}>
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

export function InvoiceLifeCyclePage({ onNavigate }: { onNavigate?: (route: string) => void }) {
  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#f7f7f9] overflow-hidden">
      <TopNav customTabs={LIFECYCLE_TABS} activeRoute="invoice-life-cycle" onNavigate={onNavigate} />

      <div className="shrink-0 bg-white border-b border-[#e8e8ec] px-10 py-7">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-[#1a1a2e]">Invoice Life Cycle</h1>
            <p className="text-[13px] text-[#8b8b9e] mt-0.5">
              How an invoice flows from creation through reservation to delivery
            </p>
          </div>
          <button
            onClick={() => onNavigate?.("invoices-inventory")}
            className="flex items-center gap-2 px-4 py-2 bg-[#1a1a2e] text-white text-[13px] font-medium rounded-xl hover:bg-[#2a2a3e] transition-colors cursor-pointer shrink-0"
          >
            <Receipt className="w-4 h-4" />
            Go to invoices
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-10 py-8">

        {/* Diagram */}
        <div className="bg-white rounded-2xl border border-[#e8e8ec] shadow-sm px-10 py-10 mb-5">
          <h2 className="text-[15px] font-bold text-[#1a1a2e] mb-2 tracking-tight">
            Invoice — reserve or not, then deliver
          </h2>
          <p className="text-[12px] text-gray-400 mb-8">
            Whether or not stock is reserved, the items run through the DN &amp; Transfer cycle to reach delivery.
            Click the <span className="font-semibold text-indigo-500">DN + Transfer Cycle</span> node to see that flow in detail.
          </p>

          {/*
            7 cols, 3 rows
            Col 1: Invoice (rows 1–3)
            Col 2: ForkRight (rows 1–3)
            Col 3 row 1: Items Reserved / row 3: No Reservation
            Col 4: MergeArrowRight (rows 1–3)
            Col 5: DN + Transfer Cycle clickable (rows 1–3)
            Col 6: → (rows 1–3)
            Col 7: Items Delivered (rows 1–3)
          */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "auto 130px auto 130px auto 80px auto",
              gridTemplateRows: "auto 80px auto",
              alignItems: "center",
            }}
          >
            <div style={{ gridColumn: "1", gridRow: "1 / 4", alignSelf: "center" }}>
              <FlowNode color="blue" label="Invoice" icon={Receipt} actor="admin" grow />
            </div>

            <div style={{ gridColumn: "2", gridRow: "1 / 4", alignSelf: "stretch" }} className="flex">
              <ForkRight />
            </div>

            <div style={{ gridColumn: "3", gridRow: "1" }}>
              <FlowNode color="amber" label="Items Reserved" icon={Lock} actor="admin" grow />
            </div>

            <div style={{ gridColumn: "3", gridRow: "3" }}>
              <FlowNode color="amber" label="No Reservation" icon={LockOpen} actor="admin" grow note="only by permission" />
            </div>

            <div style={{ gridColumn: "4", gridRow: "1 / 4", alignSelf: "stretch" }} className="flex">
              <MergeArrowRight />
            </div>

            <div style={{ gridColumn: "5", gridRow: "1 / 4", alignSelf: "center" }}>
              <FlowNode
                color="purple"
                label="DN + Transfer Cycle"
                icon={Truck}
                actor="auto"
                grow
                onClick={() => onNavigate?.("dn-life-cycle")}
              />
            </div>

            <div style={{ gridColumn: "6", gridRow: "1 / 4", alignSelf: "center" }} className="flex items-center">
              <ArrowRight />
            </div>

            <div style={{ gridColumn: "7", gridRow: "1 / 4", alignSelf: "center" }}>
              <FlowNode color="green" label="Items Delivered" icon={PackageCheck} actor="rep" grow />
            </div>
          </div>

          {/* Cancellation note */}
          <div className="flex items-center gap-5 mt-8 pt-6 border-t border-dashed border-[#e8e8ec]">
            <div className="shrink-0">
              <FlowNode color="red" label="Invoice Cancelled" icon={XCircle} actor="admin" />
            </div>
            <p className="text-[12px] text-gray-400 leading-relaxed">
              If the invoice is <strong className="text-gray-500">cancelled</strong>, any active reservations
              remain — they are never auto-revoked. Reserved stock must be manually released.
              A cancelled invoice cannot be re-activated.
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
              Invoice &amp; Reservation Rules
            </h3>
            <ul className="space-y-3">
              <Rule text="An invoice can be created directly or by converting an approved sales order" />
              <Rule text="Stock reservation on an invoice is optional — controlled by permission" />
              <Rule text="Multiple delivery notes can be created from a single invoice" />
              <Rule text="Reservations are never auto-revoked when an invoice is cancelled" />
              <Rule text="A cancelled invoice cannot be reactivated or converted" />
            </ul>
          </div>
          <div className="bg-white rounded-xl border border-[#e8e8ec] p-6">
            <h3 className="text-[13px] font-bold text-[#1a1a2e] mb-4 flex items-center gap-2">
              <Info className="w-4 h-4 text-orange-400" />
              Delivery Rules
            </h3>
            <ul className="space-y-3">
              <Rule text="The DN + Transfer Cycle handles the physical movement of goods to the rep's van" />
              <Rule text="Rep marks delivery on the mobile app — not on this dashboard" />
              <Rule text="Whether or not stock was reserved, every invoice goes through the DN cycle to deliver" />
              <Rule text="A delivered invoice cannot be modified or cancelled" />
              <Rule text="Partial delivery is not supported — the delivery note is fully delivered or not" />
            </ul>
          </div>
        </div>

        <div className="h-8" />
      </div>
    </div>
  );
}
