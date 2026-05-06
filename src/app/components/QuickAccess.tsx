import {
  Users,
  Globe2,
  ArrowRight,
  UserPlus,
  Heart,
  Link2,
} from "lucide-react";

export function QuickAccess() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Clients (Operational Layer) */}
      <div className="bg-white rounded-lg border border-[#e8e8ec] p-5 hover:shadow-sm transition-shadow">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#e8effe] flex items-center justify-center">
            <Users size={16} className="text-[#4f6ef7]" strokeWidth={1.8} />
          </div>
          <div>
            <h3 className="text-[14px] text-[#1a1a2e]" style={{ fontWeight: 600 }}>
              Clients
            </h3>
            <span className="text-[11px] text-[#8b8b9e]" style={{ fontWeight: 400 }}>Operational Layer</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-[#f8f9fb] rounded-md p-3">
            <div className="text-[10px] text-[#8b8b9e] mb-1" style={{ fontWeight: 500 }}>Total Local Clients</div>
            <div className="text-[20px] text-[#1a1a2e]" style={{ fontWeight: 600 }}>1,247</div>
          </div>
          <div className="bg-[#f8f9fb] rounded-md p-3">
            <div className="flex items-center gap-1 mb-1">
              <UserPlus size={10} className="text-[#22c55e]" />
              <span className="text-[10px] text-[#8b8b9e]" style={{ fontWeight: 500 }}>New This Month</span>
            </div>
            <div className="text-[20px] text-[#1a1a2e]" style={{ fontWeight: 600 }}>34</div>
          </div>
        </div>

        <button className="flex items-center gap-1.5 px-3.5 py-2 border border-[#e8e8ec] text-[#4a4a5a] text-[12px] rounded-md hover:bg-[#f5f5f7] transition-colors cursor-pointer" style={{ fontWeight: 500 }}>
          Open Clients
          <ArrowRight size={13} />
        </button>
      </div>

      {/* Global Clients (Strategic Layer) */}
      <div
        className="rounded-lg border border-[#4f6ef7]/20 p-5 hover:shadow-md transition-shadow relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #f8f9ff 0%, #eef1ff 100%)",
        }}
      >
        {/* Subtle pattern overlay */}
        <div
          className="absolute top-0 right-0 w-32 h-32 opacity-[0.04] pointer-events-none"
          style={{
            background: "radial-gradient(circle, #4f6ef7 1px, transparent 1px)",
            backgroundSize: "8px 8px",
          }}
        />

        <div className="relative">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#4f6ef7] flex items-center justify-center">
              <Globe2 size={16} className="text-white" strokeWidth={1.8} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-[14px] text-[#1a1a2e]" style={{ fontWeight: 600 }}>
                  Global Clients
                </h3>
                <span className="px-1.5 py-[1px] bg-[#4f6ef7] text-white text-[8px] rounded-full" style={{ fontWeight: 600 }}>
                  NEW
                </span>
              </div>
              <span className="text-[11px] text-[#6b7280]" style={{ fontWeight: 400 }}>Strategic Layer</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-white/70 backdrop-blur-sm rounded-md p-3 border border-[#4f6ef7]/10">
              <div className="flex items-center gap-1 mb-1">
                <Globe2 size={10} className="text-[#4f6ef7]" />
                <span className="text-[10px] text-[#8b8b9e]" style={{ fontWeight: 500 }}>Global Identities</span>
              </div>
              <div className="text-[20px] text-[#1a1a2e]" style={{ fontWeight: 600 }}>892</div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-md p-3 border border-[#4f6ef7]/10">
              <div className="flex items-center gap-1 mb-1">
                <Link2 size={10} className="text-[#4f6ef7]" />
                <span className="text-[10px] text-[#8b8b9e]" style={{ fontWeight: 500 }}>% Linked</span>
              </div>
              <div className="text-[20px] text-[#1a1a2e]" style={{ fontWeight: 600 }}>73%</div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-md p-3 border border-[#4f6ef7]/10">
              <div className="flex items-center gap-1 mb-1">
                <Heart size={10} className="text-[#4f6ef7]" />
                <span className="text-[10px] text-[#8b8b9e]" style={{ fontWeight: 500 }}>Avg Health</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[20px] text-[#1a1a2e]" style={{ fontWeight: 600 }}>8.4</span>
                <span className="text-[11px] text-[#8b8b9e]">/10</span>
              </div>
            </div>
          </div>

          <button className="flex items-center gap-1.5 px-3.5 py-2 bg-[#4f6ef7] text-white text-[12px] rounded-md hover:bg-[#3d5ce5] transition-colors cursor-pointer" style={{ fontWeight: 500 }}>
            Open Global Clients
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
