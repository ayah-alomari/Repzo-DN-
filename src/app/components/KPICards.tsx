import { useState } from "react";
import {
  DollarSign,
  Users,
  Package,
  Globe2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Info,
} from "lucide-react";

interface TooltipWrapperProps {
  text: string;
  children: React.ReactNode;
}

function TooltipWrapper({ text, children }: TooltipWrapperProps) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-[#1a1a2e] text-white text-[11px] rounded-md whitespace-nowrap z-50 shadow-lg" style={{ fontWeight: 400 }}>
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1a1a2e]" />
        </div>
      )}
    </div>
  );
}

const kpiCards = [
  {
    title: "Sales Today",
    value: "$12,345",
    icon: DollarSign,
    change: "+8.2%",
    trending: "up" as const,
  },
  {
    title: "Active Reps",
    value: "24",
    icon: Users,
    change: "+2",
    trending: "up" as const,
  },
  {
    title: "Pending Orders",
    value: "8",
    icon: Package,
    change: "-3",
    trending: "down" as const,
  },
];

const globalKpiCards = [
  {
    title: "Global Clients Coverage",
    value: "73%",
    icon: Globe2,
    change: "+4.1%",
    trending: "up" as const,
    tooltip: "Percentage of clients connected to a unified global identity",
    accentColor: "#4f6ef7",
  },
  {
    title: "Duplicate Risk",
    value: "12",
    icon: AlertTriangle,
    badge: { label: "Medium", color: "#f59e0b", bg: "#fef3c7" },
    tooltip: "Potential duplicate physical clients detected",
    accentColor: "#f59e0b",
  },
];

export function KPICards() {
  return (
    <div className="grid grid-cols-5 gap-4">
      {/* Existing KPI cards */}
      {kpiCards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="bg-white rounded-lg border border-[#e8e8ec] p-4 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[12px] text-[#8b8b9e]" style={{ fontWeight: 500 }}>{card.title}</span>
              <div className="w-7 h-7 rounded-md bg-[#f5f5f7] flex items-center justify-center">
                <Icon size={14} className="text-[#8b8b9e]" strokeWidth={1.8} />
              </div>
            </div>
            <div className="text-[22px] text-[#1a1a2e] mb-1" style={{ fontWeight: 600 }}>{card.value}</div>
            <div className="flex items-center gap-1">
              {card.trending === "up" ? (
                <TrendingUp size={12} className="text-[#22c55e]" />
              ) : (
                <TrendingDown size={12} className="text-[#ef4444]" />
              )}
              <span
                className={`text-[11px] ${
                  card.trending === "up" ? "text-[#22c55e]" : "text-[#ef4444]"
                }`}
                style={{ fontWeight: 500 }}
              >
                {card.change}
              </span>
              <span className="text-[11px] text-[#b0b0be]">vs yesterday</span>
            </div>
          </div>
        );
      })}

      {/* Global Clients KPI cards */}
      {globalKpiCards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="bg-white rounded-lg border border-[#e8e8ec] p-4 hover:shadow-sm transition-shadow relative"
            style={{ borderLeft: `3px solid ${card.accentColor}` }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[12px] text-[#8b8b9e]" style={{ fontWeight: 500 }}>{card.title}</span>
              <div className="flex items-center gap-1.5">
                <TooltipWrapper text={card.tooltip}>
                  <Info size={13} className="text-[#b0b0be] cursor-help" />
                </TooltipWrapper>
                <div
                  className="w-7 h-7 rounded-md flex items-center justify-center"
                  style={{ backgroundColor: `${card.accentColor}12` }}
                >
                  <Icon size={14} style={{ color: card.accentColor }} strokeWidth={1.8} />
                </div>
              </div>
            </div>
            <div className="text-[22px] text-[#1a1a2e] mb-1" style={{ fontWeight: 600 }}>{card.value}</div>
            <div className="flex items-center gap-1.5">
              {card.change && (
                <>
                  <TrendingUp size={12} className="text-[#22c55e]" />
                  <span className="text-[11px] text-[#22c55e]" style={{ fontWeight: 500 }}>{card.change}</span>
                  <span className="text-[11px] text-[#b0b0be]">this month</span>
                </>
              )}
              {card.badge && (
                <span
                  className="px-2 py-[2px] rounded-full text-[10px]"
                  style={{
                    fontWeight: 600,
                    color: card.badge.color,
                    backgroundColor: card.badge.bg,
                  }}
                >
                  {card.badge.label}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
