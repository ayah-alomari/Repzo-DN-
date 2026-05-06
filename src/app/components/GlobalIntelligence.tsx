import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ArrowRight,
  Building2,
  MapPin,
  Sparkles,
} from "lucide-react";

const chainData = [
  { name: "Carrefour", sales: "$48,200", trend: "up", change: "+12.3%" },
  { name: "Spinneys", sales: "$31,750", trend: "up", change: "+5.8%" },
  { name: "LuLu Hypermarket", sales: "$27,400", trend: "down", change: "-2.1%" },
];

const overlapData = [
  {
    repA: { name: "Ahmad K.", territory: "Amman - West", clients: 45 },
    repB: { name: "Sara M.", territory: "Amman - Central", clients: 38 },
    overlap: 7,
  },
  {
    repA: { name: "Omar R.", territory: "Irbid - North", clients: 32 },
    repB: { name: "Layla H.", territory: "Irbid - South", clients: 28 },
    overlap: 4,
  },
];

export function GlobalIntelligence() {
  return (
    <div>
      {/* Section header */}
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-6 h-6 rounded-md bg-[#4f6ef7]/10 flex items-center justify-center">
          <Sparkles size={13} className="text-[#4f6ef7]" />
        </div>
        <h2 className="text-[15px] text-[#1a1a2e]" style={{ fontWeight: 600 }}>
          Global Client Intelligence
        </h2>
        <div className="flex-1 h-px bg-[#e8e8ec]" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Chain Performance Snapshot */}
        <div className="bg-white rounded-lg border border-[#e8e8ec] p-5 hover:shadow-sm transition-shadow">
          <div className="flex items-center gap-2 mb-4">
            <Building2 size={15} className="text-[#4f6ef7]" strokeWidth={1.8} />
            <h3 className="text-[13px] text-[#1a1a2e]" style={{ fontWeight: 600 }}>
              Chain Performance Snapshot
            </h3>
          </div>

          <div className="space-y-3 mb-4">
            {chainData.map((chain, i) => (
              <div
                key={chain.name}
                className="flex items-center justify-between py-2 px-3 rounded-md bg-[#fafafa]"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-5 h-5 rounded-full bg-[#4f6ef7]/10 flex items-center justify-center text-[10px] text-[#4f6ef7]"
                    style={{ fontWeight: 600 }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-[13px] text-[#1a1a2e]" style={{ fontWeight: 500 }}>
                    {chain.name}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[13px] text-[#4a4a5a]" style={{ fontWeight: 500 }}>
                    {chain.sales}
                  </span>
                  <div className="flex items-center gap-1">
                    {chain.trend === "up" ? (
                      <TrendingUp size={11} className="text-[#22c55e]" />
                    ) : (
                      <TrendingDown size={11} className="text-[#ef4444]" />
                    )}
                    <span
                      className={`text-[11px] ${
                        chain.trend === "up" ? "text-[#22c55e]" : "text-[#ef4444]"
                      }`}
                      style={{ fontWeight: 500 }}
                    >
                      {chain.change}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Underperforming indicator */}
          <div className="flex items-center gap-2 px-3 py-2 bg-[#fef3c7]/60 rounded-md mb-4">
            <AlertTriangle size={12} className="text-[#f59e0b]" />
            <span className="text-[11px] text-[#92400e]" style={{ fontWeight: 500 }}>
              2 underperforming branches in LuLu Hypermarket
            </span>
          </div>

          <button className="flex items-center gap-1.5 px-3.5 py-2 bg-[#4f6ef7] text-white text-[12px] rounded-md hover:bg-[#3d5ce5] transition-colors cursor-pointer" style={{ fontWeight: 500 }}>
            View Global Clients
            <ArrowRight size={13} />
          </button>
        </div>

        {/* Overlap Detection */}
        <div className="bg-white rounded-lg border border-[#e8e8ec] p-5 hover:shadow-sm transition-shadow">
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={15} className="text-[#f59e0b]" strokeWidth={1.8} />
            <h3 className="text-[13px] text-[#1a1a2e]" style={{ fontWeight: 600 }}>
              Overlap Detection
            </h3>
            <span className="px-2 py-[2px] bg-[#fef3c7] text-[#92400e] text-[10px] rounded-full ml-auto" style={{ fontWeight: 600 }}>
              3 conflicts
            </span>
          </div>

          <p className="text-[12px] text-[#8b8b9e] mb-4" style={{ fontWeight: 400 }}>
            3 potential territory overlaps detected across active representatives
          </p>

          <div className="space-y-3 mb-4">
            {overlapData.map((item, i) => (
              <div key={i} className="border border-[#e8e8ec] rounded-md p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-5 h-5 rounded-full bg-[#4f6ef7]/10 flex items-center justify-center text-[10px] text-[#4f6ef7]" style={{ fontWeight: 600 }}>
                        {item.repA.name[0]}
                      </div>
                      <span className="text-[12px] text-[#1a1a2e]" style={{ fontWeight: 500 }}>
                        {item.repA.name}
                      </span>
                      <span className="text-[10px] text-[#8b8b9e]">{item.repA.territory}</span>
                    </div>
                  </div>
                  <div className="px-2.5 py-1 bg-[#fef3c7] rounded-md mx-3">
                    <span className="text-[10px] text-[#92400e]" style={{ fontWeight: 600 }}>
                      {item.overlap} shared
                    </span>
                  </div>
                  <div className="flex-1 text-right">
                    <div className="flex items-center justify-end gap-2 mb-1">
                      <span className="text-[10px] text-[#8b8b9e]">{item.repB.territory}</span>
                      <span className="text-[12px] text-[#1a1a2e]" style={{ fontWeight: 500 }}>
                        {item.repB.name}
                      </span>
                      <div className="w-5 h-5 rounded-full bg-[#f59e0b]/10 flex items-center justify-center text-[10px] text-[#f59e0b]" style={{ fontWeight: 600 }}>
                        {item.repB.name[0]}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1a1a2e] text-white text-[12px] rounded-md hover:bg-[#2a2a3e] transition-colors cursor-pointer" style={{ fontWeight: 500 }}>
            Review Conflicts
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
