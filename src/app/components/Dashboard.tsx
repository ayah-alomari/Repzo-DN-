import { TopNav } from "./TopNav";
import { KPICards } from "./KPICards";
import { GlobalIntelligence } from "./GlobalIntelligence";
import { QuickAccess } from "./QuickAccess";

export function Dashboard() {
  return (
    <div className="flex-1 flex flex-col min-w-0">
      <TopNav />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-6">
          <h1 className="text-[20px] text-[#1a1a2e]" style={{ fontWeight: 600 }}>
            Radar Dashboard
          </h1>
          <p className="text-[13px] text-[#8b8b9e] mt-0.5" style={{ fontWeight: 400 }}>
            Real-time overview of your business operations
          </p>
        </div>
        <div className="mb-6">
          <KPICards />
        </div>
        <div className="mb-6">
          <GlobalIntelligence />
        </div>
        <div className="mb-6">
          <div className="flex items-center gap-2.5 mb-4">
            <h2 className="text-[15px] text-[#1a1a2e]" style={{ fontWeight: 600 }}>
              Quick Access
            </h2>
            <div className="flex-1 h-px bg-[#e8e8ec]" />
          </div>
          <QuickAccess />
        </div>
      </main>
    </div>
  );
}
