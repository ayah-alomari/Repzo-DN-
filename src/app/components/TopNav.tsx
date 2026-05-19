import { useState } from "react";
import { LayoutGrid, Settings, Bell } from "lucide-react";

const DEFAULT_TABS = ["Radar", "BI Dashboard", "Timeline", "Live Location"];

export function TopNav({
  customTabs,
  activeRoute,
  onNavigate,
}: {
  customTabs?: Array<{ label: string; route: string }>;
  activeRoute?: string;
  onNavigate?: (route: string) => void;
} = {}) {
  const [activeTab, setActiveTab] = useState(DEFAULT_TABS[0]);

  return (
    <header className="h-12 border-b border-[#e8e8ec] bg-white flex items-center justify-between px-4">
      <div className="flex items-center gap-1">
        <div className="p-1.5 text-[#8b8b9e]">
          <LayoutGrid size={16} strokeWidth={1.8} />
        </div>
        <div className="flex items-center ml-2 bg-[#f3f3f6] rounded-lg p-1">
          {customTabs ? (
            customTabs.map((tab) => (
              <button
                key={tab.route}
                onClick={() => onNavigate?.(tab.route)}
                className={`px-3 py-1.5 text-[13px] rounded-md transition-all cursor-pointer
                  ${activeRoute === tab.route
                    ? "text-[#1a1a2e] bg-white shadow-sm"
                    : "text-[#8b8b9e] hover:text-[#4a4a5a]"
                  }`}
                style={{ fontWeight: activeRoute === tab.route ? 500 : 400 }}
              >
                {tab.label}
              </button>
            ))
          ) : (
            DEFAULT_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 text-[13px] rounded-md transition-all cursor-pointer
                  ${activeTab === tab
                    ? "text-[#1a1a2e] bg-white shadow-sm"
                    : "text-[#8b8b9e] hover:text-[#4a4a5a]"
                  }`}
                style={{ fontWeight: activeTab === tab ? 500 : 400 }}
              >
                {tab}
              </button>
            ))
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="p-1.5 text-[#8b8b9e] hover:text-[#4a4a5a] rounded-md hover:bg-[#f5f5f7] cursor-pointer">
          <Bell size={16} strokeWidth={1.8} />
        </button>
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#f59e0b] to-[#ef4444] flex items-center justify-center text-white text-[10px]" style={{ fontWeight: 600 }}>
          JD
        </div>
        <button className="p-1.5 text-[#8b8b9e] hover:text-[#4a4a5a] rounded-md hover:bg-[#f5f5f7] cursor-pointer">
          <Settings size={16} strokeWidth={1.8} />
        </button>
      </div>
    </header>
  );
}
