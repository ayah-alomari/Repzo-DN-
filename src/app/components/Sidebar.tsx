import { useState } from "react";
import {

  Home,
  Users,
  Image,
  CalendarDays,
  ShoppingCart,
  Wrench,
  BarChart3,
  FileText,
  Store,
  UserCheck,
  Megaphone,
  Settings,
  Search,
  ChevronRight,
  ChevronsUpDown,
  Globe2,
  FileCheck,
  Truck,
  Ticket,
  Sparkles,
  ChevronDown,
  ClipboardList,
  Bookmark,
  PackageX,
  RotateCcw,
  LayoutGrid,
  ArrowLeftRight,
} from "lucide-react";

export const navItems = [
  { label: "Home", icon: Home, route: "home" },
  { label: "Clients", icon: Users, route: "clients" },
  { label: "Global Clients", icon: Globe2, isNew: true, route: "global-clients" },
  { label: "Gallery", icon: Image, route: "gallery" },
  { label: "Schedule", icon: CalendarDays, route: "schedule" },
  { label: "Sales", icon: ShoppingCart, hasSubmenu: true, route: "sales", subItems: [
    { label: "Sales orders", icon: FileCheck, route: "sales-orders" },
    { label: "Delivery Notes", icon: Truck, route: "delivery-notes" },
    { label: "DN Unloads", icon: PackageX, route: "dn-unloads" },
    { label: "Pickup Note", icon: ClipboardList, route: "pickup-note" },
    { label: "Reservations", icon: Bookmark, route: "reservations" },
    { label: "Transfers", icon: ArrowLeftRight, route: "transfers" },
    { label: "Invoices & Inventory", icon: Truck, route: "invoices-inventory" },
    { label: "Promotions", icon: Ticket, route: "promotions" },
    { label: "AI Sales orders", icon: Sparkles, route: "ai-sales-orders" },
    { label: "Sales Reports", icon: FileText, route: "sales-reports" },
  ] },
  { label: "CMMS", icon: Wrench, route: "cmms" },
  { label: "Reports & KPI", icon: BarChart3, route: "reports" },
  { label: "Forms", icon: FileText, route: "forms" },
  { label: "Retail Execution", icon: Store, hasSubmenu: true, route: "retail", subItems: [
    { label: "AI Planogram", icon: LayoutGrid, route: "planogram", isNew: true },
  ] },
  { label: "Representatives", icon: UserCheck, route: "reps" },
  { label: "Marketing", icon: Megaphone, hasSubmenu: true, route: "marketing" },
];

interface SidebarProps {
  activeItem: string;
  onNavigate: (route: string) => void;
  onReset?: () => void;
}

export function Sidebar({ activeItem, onNavigate, onReset }: SidebarProps) {
  // Use state to track expanded menus. We default to 'sales' being expanded if we're on a sales subroute.
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    sales: true, // Default open 
  });

  const toggleMenu = (menuRoute: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuRoute]: !prev[menuRoute]
    }));
  };

  return (
    <aside className="w-[240px] min-w-[240px] h-screen bg-white border-r border-[#e8e8ec] flex flex-col">
      {/* Logo */}
      <div className="px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#1a1a2e] flex items-center justify-center text-white text-[13px]">
            A
          </div>
          <div>
            <div className="text-[13px] text-[#1a1a2e]" style={{ fontWeight: 500 }}>Acme Inc</div>
            <div className="text-[11px] text-[#8b8b9e]">Enterprise</div>
          </div>
        </div>
        <ChevronsUpDown size={14} className="text-[#8b8b9e]" />
      </div>

      {/* Search */}
      <div className="px-3 mb-1">
        <div className="flex items-center gap-2 px-2.5 py-1.5 bg-[#f5f5f7] rounded-md">
          <Search size={13} className="text-[#8b8b9e]" />
          <span className="text-[12px] text-[#8b8b9e]">Search...</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-2 overflow-y-auto">
        <div className="text-[10px] text-[#8b8b9e] uppercase tracking-wider px-2.5 mb-1.5">Navigation</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          // Submenus shouldn't necessarily be 'active' on the parent if a child is active, but we can highlight it or expand it
          const isActive = activeItem === item.route;
          const isGlobal = item.label === "Global Clients";
          const isExpanded = expandedMenus[item.route];

          return (
            <div key={item.label}>
              <button
                onClick={() => {
                  if (item.hasSubmenu) {
                    toggleMenu(item.route);
                  } else {
                    onNavigate(item.route);
                  }
                }}
                className={`w-full flex items-center gap-2.5 px-2.5 py-[6px] rounded-md text-[13px] mb-[1px] transition-colors cursor-pointer
                  ${isActive ? "bg-[#f0f0f3] text-[#1a1a2e]" : "text-[#4a4a5a] hover:bg-[#f7f7f9]"}
                  ${isGlobal ? "relative" : ""}
                `}
                style={{ fontWeight: isActive ? 500 : 400 }}
              >
                <Icon
                  size={15}
                  className={isGlobal ? "text-[#4f6ef7]" : ""}
                  strokeWidth={isGlobal ? 2.2 : 1.8}
                />
                <span className="flex-1 text-left">{item.label}</span>
                {item.isNew && (
                  <span className="px-1.5 py-[1px] bg-[#4f6ef7] text-white text-[9px] rounded-full" style={{ fontWeight: 600 }}>
                    NEW
                  </span>
                )}
                {item.hasSubmenu && (
                  isExpanded ? <ChevronDown size={12} className="text-[#b0b0be]" /> : <ChevronRight size={12} className="text-[#b0b0be]" />
                )}
              </button>
              
              {/* Submenu rendering */}
              {item.hasSubmenu && isExpanded && item.subItems && (
                <div className="ml-3 mt-1 space-y-[2px]">
                  {item.subItems.map((subItem) => {
                    const SubIcon = subItem.icon;
                    const isSubActive = activeItem === subItem.route;
                    return (
                      <button
                        key={subItem.label}
                        onClick={() => onNavigate(subItem.route)}
                        className={`w-full flex items-center gap-2.5 px-3 py-[6px] rounded-md text-[13px] transition-colors cursor-pointer
                          ${isSubActive ? "bg-[#f0f0f3] text-[#1a1a2e]" : "text-[#6a6a7a] hover:bg-[#f7f7f9]"}
                        `}
                        style={{ fontWeight: isSubActive ? 500 : 400 }}
                      >
                        <SubIcon size={14} strokeWidth={isSubActive ? 2 : 1.8} />
                        <span className="flex-1 text-left">{subItem.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-[#e8e8ec]">
        {onReset && (
          <button
            onClick={onReset}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-red-500 hover:bg-red-50 cursor-pointer transition-colors"
            style={{ fontWeight: 500 }}
          >
            <RotateCcw size={14} strokeWidth={2} />
            Reset Data
          </button>
        )}
        <button
          onClick={() => onNavigate("settings")}
          className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] cursor-pointer transition-colors ${activeItem === "settings" ? "bg-[#f0f1f9] text-[#1a1a2e] font-semibold" : "text-[#4a4a5a] hover:bg-[#f7f7f9]"}`}
          style={{ fontWeight: activeItem === "settings" ? 600 : 400 }}
        >
          <Settings size={15} strokeWidth={1.8} />
          Settings
        </button>
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#e8e8ec]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#e0e0e8] flex items-center justify-center text-[11px] text-[#4a4a5a]" style={{ fontWeight: 500 }}>
              CN
            </div>
            <div>
              <div className="text-[12px] text-[#1a1a2e]" style={{ fontWeight: 500 }}>shadcn</div>
              <div className="text-[10px] text-[#8b8b9e]">m@example.com</div>
            </div>
          </div>
          <ChevronsUpDown size={13} className="text-[#8b8b9e]" />
        </div>
      </div>
    </aside>
  );
}
