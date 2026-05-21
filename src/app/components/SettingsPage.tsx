import React, { useState } from "react";
import {
  Search,
  ClipboardList,
  Users,
  Layers,
  Warehouse,
  ChevronRight,
} from "lucide-react";
import { SODNPermissionsPage } from "./SODNPermissionsPage";

interface SettingsCardData {
  id: string;
  title: string;
  icon: React.ReactNode;
  iconBg: string;
  items: string[];
}

const CARDS: SettingsCardData[] = [
  {
    id: "so-dn",
    title: "SO and Delivery Note Settings",
    icon: <ClipboardList className="w-5 h-5 text-indigo-600" />,
    iconBg: "bg-indigo-50 border border-indigo-100",
    items: [
      "Sales orders permissions",
      "Delivery Notes permissions",
      "Delivery Note Unloads permissions",
      "Return Note permissions",
      "Reservations permissions",
      "Transfers permissions",
      "Invoices & Inventory permissions",
    ],
  },
  {
    id: "clients",
    title: "Client & Territory Management",
    icon: <Users className="w-5 h-5 text-rose-500" />,
    iconBg: "bg-rose-50 border border-rose-100",
    items: [
      "Client Channels",
      "Specialties",
      "Product Lines",
      "Target Lines",
      "Classifications",
      "Client Line Classification",
    ],
  },
  {
    id: "catalog",
    title: "Product Catalog & Organization",
    icon: <Layers className="w-5 h-5 text-orange-500" />,
    iconBg: "bg-orange-50 border border-orange-100",
    items: [
      "Product Categories",
      "Product Group Modifiers",
      "Product Groups",
      "Product Brands",
      "Measure Unit Family",
      "Measures",
    ],
  },
  {
    id: "inventory",
    title: "Inventory & Warehouse",
    icon: <Warehouse className="w-5 h-5 text-violet-600" />,
    iconBg: "bg-violet-50 border border-violet-100",
    items: [
      "Warehouses",
      "Sales MSL",
      "Sales Van MSL",
      "MSL / Availability",
      "Batches",
      "Suppliers",
      "Item Status Types",
      "Inventory Adjustment Reasons",
    ],
  },
];

export function SettingsPage({ onNavigate }: { onNavigate?: (route: string) => void }) {
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<{ cardId: string; tab: string } | null>(null);

  if (detail?.cardId === "so-dn") {
    return (
      <SODNPermissionsPage
        initialTab={detail.tab}
        onBack={() => setDetail(null)}
        onNavigate={onNavigate}
      />
    );
  }

  const filtered = CARDS.map(card => ({
    ...card,
    items: card.items.filter(item =>
      item.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(card =>
    card.title.toLowerCase().includes(search.toLowerCase()) || card.items.length > 0
  );

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#f5f5f7] overflow-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between shrink-0">
        <h1 className="text-[22px] font-bold text-[#1a1a2e]">Settings</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search ..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 text-[13px] border border-gray-200 rounded-[8px] bg-white w-[260px] outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50 transition-all placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Body */}
      <div className="px-8 py-7">
        <p className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider mb-5">
          Organization Settings
        </p>

        <div className="grid grid-cols-4 gap-5">
          {filtered.map(card => (
            <div
              key={card.id}
              className="bg-white border border-gray-200 rounded-[12px] shadow-sm p-5 flex flex-col gap-4"
            >
              {/* Card header */}
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0 ${card.iconBg}`}>
                  {card.icon}
                </div>
                <h2 className="text-[14px] font-bold text-[#1a1a2e] leading-snug">{card.title}</h2>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100" />

              {/* Items */}
              <ul className="flex flex-col gap-1.5">
                {card.items.map(item => (
                  <li key={item}>
                    <button
                      onClick={() => setDetail({ cardId: card.id, tab: item })}
                      className="w-full flex items-center justify-between group text-left px-1 py-0.5 rounded hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-[13px] text-gray-500 group-hover:text-[#1a1a2e] transition-colors">
                        {item}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 shrink-0 transition-colors" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
