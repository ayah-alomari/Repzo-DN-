import { TopNav } from "../TopNav";
import { LIFECYCLE_TABS } from "./LifeCycleTabs";

export function LifeCyclePlaceholderPage({
  activeRoute,
  pageName,
  onNavigate,
}: {
  activeRoute: string;
  pageName: string;
  onNavigate?: (route: string) => void;
}) {
  return (
    <div className="flex-1 flex flex-col min-w-0 bg-white">
      <TopNav customTabs={LIFECYCLE_TABS} activeRoute={activeRoute} onNavigate={onNavigate} />
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <h1 className="text-[22px] text-[#1a1a2e]" style={{ fontWeight: 700 }}>{pageName}</h1>
        <p className="text-[13px] text-[#8b8b9e] mt-2">This page is under development</p>
      </div>
    </div>
  );
}
