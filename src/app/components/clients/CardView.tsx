import React, { useState, useEffect, useRef } from "react";
import {
  Search, Edit, Trash2, MoreVertical, User, MapPin, Copy, Check, Navigation,
  Globe, Building2, Map, ShieldCheck, ShieldX, Calendar, Hash, UserCheck,
  Tag, Briefcase, Link2, Phone, Smartphone, Mail,
  CreditCard, DollarSign, FileText, Clock, Package, Target,
  Settings, Receipt, BarChart3, ShoppingCart, ChevronRight, Camera,
  X, Upload, Plus, ExternalLink, Info, ChevronDown, AlertCircle,
  Type, ListChecks, CalendarDays, ToggleLeft, List, ChevronUp,
  Printer, ChevronLeft
} from "lucide-react";
import type { Client, CustomField, CustomFieldType } from "./clientData";
import { generateCustomFields, CUSTOM_FIELD_TYPES } from "./clientData";
import { ImageWithFallback } from "../figma/ImageWithFallback";

const mediaImages = [
  "https://images.unsplash.com/photo-1761005653827-9cd95fa1faee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJvbmljcyUyMHByb2R1Y3QlMjBjbG9zZSUyMHVwfGVufDF8fHx8MTc3MTkxNjM1MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  "https://images.unsplash.com/flagged/photo-1576697011479-349e2a52bdf6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXB0b3AlMjBrZXlib2FyZCUyMHdvcmtzcGFjZXxlbnwxfHx8fDE3NzE5MTYzNTJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  "https://images.unsplash.com/photo-1738013997874-363f8e3832ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBwaG9uZSUyMHRlY2hub2xvZ3l8ZW58MXx8fHwxNzcxODEwODA1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
];

const coverImage = "https://images.unsplash.com/photo-1708861619016-25ed5586687b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXRhaWwlMjBzdG9yZSUyMHByb2R1Y3RzJTIwc2hlbGZ8ZW58MXx8fHwxNzcxOTE2MzUyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

const mainTabs = ["Basic", "Geographical", "Sales Report", "CMMS"] as const;
const basicSubTabs = ["Details", "Sales", "Custom Fields", "Contact Info", "Products Lines Targets", "Specific Sales Settings"] as const;

interface CardViewProps {
  clients: Client[];
  totalClients: number;
}

export function CardView({ clients, totalClients }: CardViewProps) {
  const [selectedClient, setSelectedClient] = useState<Client>(clients[0]);
  const [listSearch, setListSearch] = useState("");
  const [activeMainTab, setActiveMainTab] = useState<typeof mainTabs[number]>("Basic");
  const [activeSubTab, setActiveSubTab] = useState<typeof basicSubTabs[number]>("Details");
  const [moreOpen, setMoreOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(listSearch.toLowerCase())
  );

  return (
    <div className="flex flex-1 min-h-0 bg-[#f5f5f7] gap-0 rounded-lg overflow-hidden border border-[#e8e8ec]">
      {/* Left Panel - Client List */}
      <div className="w-[260px] min-w-[260px] bg-white border-r border-[#e8e8ec] flex flex-col">
        <div className="px-3 pt-3 pb-2">
          <div className="text-[11px] text-[#8b8b9e] mb-2" style={{ fontWeight: 500 }}>
            Total Active Clients: {totalClients.toLocaleString()}
          </div>
          <div className="flex items-center gap-2 px-2.5 py-1.5 bg-[#f5f5f7] rounded-md border border-[#e8e8ec]">
            <Search size={13} className="text-[#8b8b9e]" />
            <input
              type="text"
              placeholder="Search clients..."
              value={listSearch}
              onChange={(e) => setListSearch(e.target.value)}
              className="flex-1 text-[12px] text-[#1a1a2e] bg-transparent outline-none placeholder:text-[#b0b0be]"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredClients.map((client) => (
            <button
              key={client.id}
              onClick={() => { setSelectedClient(client); setIsEditing(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors cursor-pointer border-l-[3px]
                ${selectedClient.id === client.id
                  ? "bg-[#f3f0ff] border-l-[#7c3aed]"
                  : "border-l-transparent hover:bg-[#f9f9fb]"
                }
              `}
            >
              <div className="w-8 h-8 rounded-full bg-[#f0eef5] flex items-center justify-center flex-shrink-0">
                {client.id <= 2 ? (
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    <ImageWithFallback src={mediaImages[client.id - 1]} alt={client.name} className="w-full h-full object-cover" />
                  </div>
                ) : client.name === "Serial 66" ? (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#f59e0b] to-[#ef4444] flex items-center justify-center text-white text-[10px]" style={{ fontWeight: 600 }}>S6</div>
                ) : (
                  <User size={14} className="text-[#8b8b9e]" />
                )}
              </div>
              <span className={`text-[13px] truncate ${selectedClient.id === client.id ? "text-[#1a1a2e]" : "text-[#4a4a5a]"}`} style={{ fontWeight: selectedClient.id === client.id ? 500 : 400 }}>
                {client.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Right Panel - Client Profile */}
      <div className="flex-1 bg-white flex flex-col min-w-0 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <h2 className="text-[18px] text-[#1a1a2e] truncate" style={{ fontWeight: 600 }}>
            {selectedClient.name}
          </h2>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button className="px-3 py-1.5 text-[12px] text-[#7c3aed] border border-[#7c3aed] rounded-md hover:bg-[#f3f0ff] transition-colors cursor-pointer" style={{ fontWeight: 500 }}>
              Show Credit...
            </button>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`flex items-center gap-1 px-3 py-1.5 text-[12px] border rounded-md transition-colors cursor-pointer ${
                isEditing
                  ? "text-white bg-[#7c3aed] border-[#7c3aed] hover:bg-[#6d28d9]"
                  : "text-[#4a4a5a] border-[#e8e8ec] hover:bg-[#f5f5f7]"
              }`}
              style={{ fontWeight: 500 }}
            >
              <Edit size={12} />
              {isEditing ? "Editing" : "Edit"}
            </button>
            <button className="flex items-center gap-1 px-3 py-1.5 text-[12px] text-[#ef4444] border border-[#fca5a5] rounded-md hover:bg-[#fef2f2] transition-colors cursor-pointer" style={{ fontWeight: 500 }}>
              <Trash2 size={12} />
              Delete
            </button>
            <div className="relative">
              <button onClick={() => setMoreOpen(!moreOpen)} className="p-1.5 text-[#8b8b9e] border border-[#e8e8ec] rounded-md hover:bg-[#f5f5f7] cursor-pointer">
                <MoreVertical size={14} />
              </button>
              {moreOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMoreOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-[#e8e8ec] rounded-lg shadow-lg z-50 py-1">
                    {["Duplicate", "Archive", "Transfer", "Print"].map((action) => (
                      <button key={action} onClick={() => setMoreOpen(false)} className="w-full text-left px-3 py-1.5 text-[12px] text-[#4a4a5a] hover:bg-[#f5f5f7] cursor-pointer" style={{ fontWeight: 400 }}>{action}</button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Main Tabs */}
        <div className="px-6 pt-3 pb-2">
          <div className="inline-flex gap-0 bg-[#f3f3f6] rounded-lg p-1">
            {mainTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveMainTab(tab); if (tab === "Basic") setActiveSubTab("Details"); }}
                className={`px-4 py-1.5 text-[13px] rounded-md transition-all cursor-pointer ${activeMainTab === tab ? "text-[#1a1a2e] bg-white shadow-sm" : "text-[#8b8b9e] hover:text-[#4a4a5a]"}`}
                style={{ fontWeight: activeMainTab === tab ? 500 : 400 }}
              >{tab}</button>
            ))}
          </div>
        </div>

        {/* Sub Tabs - Only for Basic tab */}
        {activeMainTab === "Basic" && (
          <div className="px-6 pt-3 pb-2">
            <div className="flex flex-wrap gap-1.5">
              {basicSubTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveSubTab(tab)}
                  className={`px-3 py-1 text-[11px] rounded-full border transition-colors cursor-pointer ${activeSubTab === tab ? "bg-[#7c3aed] text-white border-[#7c3aed]" : "text-[#4a4a5a] border-[#e8e8ec] hover:bg-[#f5f5f7]"}`}
                  style={{ fontWeight: 500 }}
                >{tab}</button>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="px-6 py-4 flex-1">
          {activeMainTab === "Basic" && activeSubTab === "Details" && (
            <DetailsSubTab client={selectedClient} isEditing={isEditing} onSave={() => setIsEditing(false)} onCancel={() => setIsEditing(false)} />
          )}
          {activeMainTab === "Basic" && activeSubTab === "Sales" && (
            <SalesSubTab client={selectedClient} isEditing={isEditing} onSave={() => setIsEditing(false)} onCancel={() => setIsEditing(false)} />
          )}
          {activeMainTab === "Basic" && activeSubTab === "Custom Fields" && (
            <CustomFieldsSubTab client={selectedClient} />
          )}
          {activeMainTab === "Basic" && activeSubTab === "Contact Info" && (
            <ContactInfoSubTab client={selectedClient} isEditing={isEditing} onSave={() => setIsEditing(false)} onCancel={() => setIsEditing(false)} />
          )}
          {activeMainTab === "Basic" && activeSubTab === "Products Lines Targets" && (
            <ProductsLinesTargetsSubTab client={selectedClient} isEditing={isEditing} onSave={() => setIsEditing(false)} onCancel={() => setIsEditing(false)} />
          )}
          {activeMainTab === "Basic" && activeSubTab === "Specific Sales Settings" && (
            <SpecificSalesSettingsSubTab client={selectedClient} isEditing={isEditing} onSave={() => setIsEditing(false)} onCancel={() => setIsEditing(false)} />
          )}
          {activeMainTab === "Geographical" && (
            <GeographicalTab client={selectedClient} />
          )}
          {activeMainTab === "Sales Report" && (
            <SalesReportTab client={selectedClient} />
          )}
          {activeMainTab === "CMMS" && (
            <div className="text-[13px] text-[#8b8b9e] py-8 text-center">CMMS data will appear here.</div>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================
   HELPERS
   ========================================= */
function SectionCard({ icon: Icon, title, iconBg, iconColor, badge, children, onHeaderClick }: {
  icon: React.ElementType; title: string; iconBg?: string; iconColor?: string; badge?: React.ReactNode; children: React.ReactNode; onHeaderClick?: () => void;
}) {
  return (
    <div className="bg-[#fafafa] rounded-xl border border-[#e8e8ec] p-4">
      <div
        className={`flex items-center gap-2 mb-3 ${onHeaderClick ? "cursor-pointer select-none hover:opacity-80 transition-opacity" : ""}`}
        onClick={onHeaderClick}
        role={onHeaderClick ? "button" : undefined}
        tabIndex={onHeaderClick ? 0 : undefined}
        onKeyDown={onHeaderClick ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onHeaderClick(); } } : undefined}
      >
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${iconBg || "bg-[#f3f0ff]"}`}>
          <Icon size={13} className={iconColor || "text-[#7c3aed]"} />
        </div>
        <span className="text-[12px] text-[#1a1a2e]" style={{ fontWeight: 600 }}>{title}</span>
        {badge && <div className="ml-auto">{badge}</div>}
      </div>
      {children}
    </div>
  );
}

function ViewField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] text-[#8b8b9e] uppercase tracking-wider mb-0.5" style={{ fontWeight: 500 }}>{label}</div>
      <div className="text-[13px] text-[#1a1a2e]" style={{ fontWeight: 500 }}>{value}</div>
    </div>
  );
}

function ChipList({ items, color }: { items: string[]; color?: string }) {
  if (!Array.isArray(items) || items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span key={item} className={`px-2 py-0.5 text-[11px] rounded-md ${color || "bg-[#f0f0f3] text-[#4a4a5a]"}`} style={{ fontWeight: 500 }}>{item}</span>
      ))}
    </div>
  );
}

function EditInput({ label, value, required, onChange }: { label: string; value: string; required?: boolean; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-[10px] text-[#8b8b9e] uppercase tracking-wider mb-1 block" style={{ fontWeight: 500 }}>
        {label}{required && <span className="text-[#ef4444] ml-0.5">*</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 text-[13px] text-[#1a1a2e] bg-white rounded-lg border border-[#e8e8ec] outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/20 transition-colors"
        style={{ fontWeight: 400 }}
      />
    </div>
  );
}

function EditToggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-1">
      <label className="text-[10px] text-[#8b8b9e] uppercase tracking-wider" style={{ fontWeight: 500 }}>{label}</label>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-9 h-5 rounded-full transition-colors duration-200 cursor-pointer ${value ? "bg-[#7c3aed]" : "bg-[#d1d5db]"}`}
      >
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${value ? "left-[18px]" : "left-0.5"}`} />
      </button>
    </div>
  );
}

interface QuickAddConfig {
  secondaryField: string; // "Local Name" or "Team"
  secondaryRequired?: boolean;
}

function EditMultiSelect({ label, values, options: initialOptions, quickAdd, quickAccessUrl }: { label: string; values: string[]; options: string[]; quickAdd?: QuickAddConfig; quickAccessUrl?: string }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>(values);
  const [options, setOptions] = useState<string[]>(initialOptions);
  const [search, setSearch] = useState("");
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [qaName, setQaName] = useState("");
  const [qaSecondary, setQaSecondary] = useState("");

  const filteredOptions = search
    ? options.filter((o) => o.toLowerCase().includes(search.toLowerCase()))
    : options;

  const handleQuickAdd = () => {
    const trimmed = qaName.trim();
    if (!trimmed) return;
    const displayName = qaSecondary.trim() ? `${trimmed} (${qaSecondary.trim()})` : trimmed;
    if (!options.includes(displayName)) {
      setOptions([...options, displayName]);
    }
    if (!selected.includes(displayName)) {
      setSelected([...selected, displayName]);
    }
    setQaName("");
    setQaSecondary("");
    setShowQuickAdd(false);
  };

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1">
        <label className="text-[10px] text-[#8b8b9e] uppercase tracking-wider" style={{ fontWeight: 500 }}>{label}</label>
        {quickAccessUrl && (
          <a
            href={quickAccessUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={`Manage ${label}`}
            className="inline-flex items-center justify-center w-4 h-4 rounded hover:bg-[#f3f0ff] text-[#b0b0be] hover:text-[#7c3aed] transition-colors cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink size={9} />
          </a>
        )}
      </div>
      <div className="relative">
        <div
          onClick={() => setOpen(!open)}
          className="w-full min-h-[36px] px-3 py-1.5 bg-white rounded-lg border border-[#e8e8ec] cursor-pointer flex items-center flex-wrap gap-1 hover:border-[#7c3aed]/40 transition-colors"
        >
          {selected.length > 0 ? selected.map((v) => (
            <span key={v} className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#f3f0ff] text-[#7c3aed] text-[10px] rounded-full" style={{ fontWeight: 600 }}>
              {v}
              <button
                onClick={(e) => { e.stopPropagation(); setSelected(selected.filter((s) => s !== v)); }}
                className="hover:text-[#ef4444] transition-colors cursor-pointer"
              >
                <X size={8} />
              </button>
            </span>
          )) : (
            <span className="text-[12px] text-[#b0b0be]" style={{ fontWeight: 400 }}>Select...</span>
          )}
        </div>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#e8e8ec] rounded-lg shadow-lg z-50 max-h-[260px] flex flex-col">
              {/* Search */}
              <div className="px-2 pt-2 pb-1">
                <div className="flex items-center gap-1.5 px-2 py-1.5 bg-[#f5f5f7] rounded-md border border-[#e8e8ec]">
                  <Search size={11} className="text-[#8b8b9e] shrink-0" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search..."
                    className="w-full text-[11px] bg-transparent outline-none text-[#1a1a2e] placeholder:text-[#b0b0be]"
                    style={{ fontWeight: 400 }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
              {/* Options list */}
              <div className="overflow-y-auto py-1 flex-1">
                {filteredOptions.length > 0 ? filteredOptions.map((opt) => {
                  const isSelected = selected.includes(opt);
                  return (
                    <button
                      key={opt}
                      onClick={() => {
                        setSelected(isSelected ? selected.filter((s) => s !== opt) : [...selected, opt]);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-[12px] hover:bg-[#f5f5f7] cursor-pointer flex items-center gap-2 ${isSelected ? "text-[#7c3aed]" : "text-[#4a4a5a]"}`}
                      style={{ fontWeight: isSelected ? 500 : 400 }}
                    >
                      <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${isSelected ? "bg-[#7c3aed] border-[#7c3aed]" : "border-[#d1d5db]"}`}>
                        {isSelected && <Check size={8} className="text-white" />}
                      </div>
                      {opt}
                    </button>
                  );
                }) : (
                  <div className="px-3 py-2 text-[11px] text-[#b0b0be]" style={{ fontWeight: 400 }}>No results found</div>
                )}
              </div>
              {/* Quick Add */}
              {quickAdd && (
                <div className="border-t border-[#e8e8ec]">
                  {!showQuickAdd ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowQuickAdd(true); }}
                      className="w-full flex items-center gap-1.5 px-3 py-2 text-[11px] text-[#7c3aed] hover:bg-[#f9f8ff] cursor-pointer transition-colors"
                      style={{ fontWeight: 500 }}
                    >
                      <Plus size={12} />
                      Quick Add New
                    </button>
                  ) : (
                    <div className="p-2.5 bg-[#fafafe]" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] text-[#7c3aed] uppercase tracking-wider" style={{ fontWeight: 600 }}>Quick Add</span>
                        <button onClick={() => { setShowQuickAdd(false); setQaName(""); setQaSecondary(""); }} className="text-[#8b8b9e] hover:text-[#4a4a5a] cursor-pointer">
                          <X size={10} />
                        </button>
                      </div>
                      <div className="space-y-1.5">
                        <div>
                          <label className="text-[9px] text-[#8b8b9e] uppercase tracking-wider" style={{ fontWeight: 500 }}>
                            Name <span className="text-[#ef4444]">*</span>
                          </label>
                          <input
                            type="text"
                            value={qaName}
                            onChange={(e) => setQaName(e.target.value)}
                            placeholder="Enter name..."
                            className="w-full mt-0.5 px-2 py-1.5 text-[11px] bg-white rounded border border-[#e8e8ec] outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/20 transition-colors"
                            style={{ fontWeight: 400 }}
                            onKeyDown={(e) => { if (e.key === "Enter") handleQuickAdd(); }}
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-[#8b8b9e] uppercase tracking-wider" style={{ fontWeight: 500 }}>
                            {quickAdd.secondaryField} <span className="text-[#b0b0be] text-[8px] normal-case">(optional)</span>
                          </label>
                          <input
                            type="text"
                            value={qaSecondary}
                            onChange={(e) => setQaSecondary(e.target.value)}
                            placeholder={`Enter ${quickAdd.secondaryField.toLowerCase()}...`}
                            className="w-full mt-0.5 px-2 py-1.5 text-[11px] bg-white rounded border border-[#e8e8ec] outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/20 transition-colors"
                            style={{ fontWeight: 400 }}
                            onKeyDown={(e) => { if (e.key === "Enter") handleQuickAdd(); }}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-1.5 mt-2">
                        <button
                          onClick={() => { setShowQuickAdd(false); setQaName(""); setQaSecondary(""); }}
                          className="px-2.5 py-1 text-[10px] text-[#8b8b9e] hover:text-[#4a4a5a] rounded cursor-pointer transition-colors"
                          style={{ fontWeight: 500 }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleQuickAdd}
                          disabled={!qaName.trim()}
                          className="px-3 py-1 text-[10px] text-white bg-[#7c3aed] hover:bg-[#6d28d9] rounded cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                          style={{ fontWeight: 600 }}
                        >
                          <Plus size={9} />
                          Add
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function EditTextarea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-[10px] text-[#8b8b9e] uppercase tracking-wider mb-1 block" style={{ fontWeight: 500 }}>{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full px-3 py-2 text-[13px] text-[#1a1a2e] bg-white rounded-lg border border-[#e8e8ec] outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/20 resize-none transition-colors"
        style={{ fontWeight: 400 }}
      />
    </div>
  );
}

/* =========================================
   SUB-TAB: Details — View + Edit
   ========================================= */
function DetailsSubTab({ client, isEditing, onSave, onCancel }: { client: Client; isEditing: boolean; onSave: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({ ...client });

  // Reset form when client changes
  const [lastId, setLastId] = useState(client.id);
  if (client.id !== lastId) { setLastId(client.id); setForm({ ...client }); }

  if (isEditing) return <DetailsEditMode form={form} setForm={setForm} onSave={onSave} onCancel={onCancel} />;
  return <DetailsViewMode client={client} />;
}

function DetailsViewMode({ client }: { client: Client }) {
  // Only groups with at least one filled field appear
  const hasIdentity = true; // always
  const hasAssignment = !!client.assignedTo || !!client.teams;
  const hasClassification = !!client.clientChannel || client.isChain || client.clientTags.length > 0 || client.areaTags.length > 0 || !!client.jobCategories || !!client.specialty;
  const hasProducts = !!client.availabilityMSL || !!client.mediaAssignedProducts || !!client.assignedProductGroups;
  const hasOperations = !!client.taxNumber || (Array.isArray(client.retailExecutionTemplate) && client.retailExecutionTemplate.length > 0) || !!client.formsV2 || (Array.isArray(client.clmPresentations) && client.clmPresentations.length > 0) || (Array.isArray(client.contacts) && client.contacts.length > 0);
  const hasMedia = true; // always show media section in view

  return (
    <div className="flex flex-col gap-4">
      {/* Identity — always visible */}
      {hasIdentity && (
        <SectionCard icon={User} title="Identity" iconBg="bg-[#f3f0ff]" iconColor="text-[#7c3aed]">
          <div className="grid grid-cols-3 gap-x-6 gap-y-4">
            <ViewField label="Client Name" value={client.name} />
            <ViewField label="Client Code" value={client.clientCode} />
            <ViewField label="Is Chain?" value={
              client.isChain ? (
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                  <span className="text-[#22c55e]" style={{ fontWeight: 600 }}>Yes</span>
                </span>
              ) : (
                <span className="text-[#8b8b9e]" style={{ fontWeight: 400 }}>No</span>
              )
            } />
            {client.isChain && client.clientChain && (
              <div className="col-span-3">
                <ViewField label="Client Chain" value={
                  <ChipList items={client.clientChain.split(",").map((s) => s.trim()).filter(Boolean)} />
                } />
              </div>
            )}
          </div>
          {client.description && (
            <div className="mt-2.5">
              <ViewField label="Description" value={
                <span className="text-[#4a4a5a]" style={{ fontWeight: 400 }}>{client.description}</span>
              } />
            </div>
          )}
        </SectionCard>
      )}

      {/* Assignment & Teams */}
      {hasAssignment && (
        <SectionCard icon={UserCheck} title="Assignment & Teams" iconBg="bg-[#dcfce7]" iconColor="text-[#22c55e]">
          <div className="grid grid-cols-3 gap-x-6 gap-y-4">
            {client.assignedTo && <ViewField label="Assigned To" value={client.assignedTo} />}
            {client.teams && <ViewField label="Teams" value={client.teams} />}
          </div>
        </SectionCard>
      )}

      {/* Classification & Tags */}
      {hasClassification && (
        <SectionCard icon={Tag} title="Classification & Tags" iconBg="bg-[#fef3c7]" iconColor="text-[#f59e0b]">
          <div className="flex flex-col gap-3">
            {(!!client.clientChannel || !!client.jobCategories || !!client.specialty) && (
              <div className="grid grid-cols-3 gap-x-6 gap-y-4">
                {client.clientChannel && <ViewField label="Client Channel" value={client.clientChannel} />}
                {client.jobCategories && <ViewField label="Job Categories" value={client.jobCategories} />}
                {client.specialty && <ViewField label="Specialties" value={client.specialty} />}
              </div>
            )}
            {(client.clientTags.length > 0 || client.areaTags.length > 0) && (
              <div className="grid grid-cols-2 gap-4 pt-1">
                {client.clientTags.length > 0 && (
                  <div>
                    <div className="text-[10px] text-[#8b8b9e] uppercase tracking-wider mb-1.5" style={{ fontWeight: 500 }}>Client Tags</div>
                    <ChipList items={client.clientTags} />
                  </div>
                )}
                {client.areaTags.length > 0 && (
                  <div>
                    <div className="text-[10px] text-[#8b8b9e] uppercase tracking-wider mb-1.5" style={{ fontWeight: 500 }}>Area Tags</div>
                    <ChipList items={client.areaTags} />
                  </div>
                )}
              </div>
            )}
          </div>
        </SectionCard>
      )}

      {/* Products & Inventory */}
      {hasProducts && (
        <SectionCard icon={Package} title="Products & Inventory" iconBg="bg-[#eff6ff]" iconColor="text-[#3b82f6]">
          <div className="grid grid-cols-3 gap-x-6 gap-y-4">
            {client.availabilityMSL && <ViewField label="Availability MSL" value={client.availabilityMSL} />}
            {client.mediaAssignedProducts && <ViewField label="Media Assigned Products" value={client.mediaAssignedProducts} />}
            {client.assignedProductGroups && <ViewField label="Product Group" value={client.assignedProductGroups} />}
          </div>
        </SectionCard>
      )}

      {/* Operations & Compliance */}
      {hasOperations && (
        <SectionCard icon={Settings} title="Operations & Compliance" iconBg="bg-[#fce7f3]" iconColor="text-[#ec4899]">
          <div className="grid grid-cols-3 gap-x-6 gap-y-4">
            {Array.isArray(client.contacts) && client.contacts.length > 0 && <ViewField label="Contacts" value={<ChipList items={client.contacts} />} />}
            {client.taxNumber && <ViewField label="Tax Number" value={<span className="font-mono">{client.taxNumber}</span>} />}
            {Array.isArray(client.retailExecutionTemplate) && client.retailExecutionTemplate.length > 0 && <ViewField label="Retail Execution Template" value={<ChipList items={client.retailExecutionTemplate} />} />}
            {client.formsV2 && <ViewField label="Forms V2" value={client.formsV2} />}
            {Array.isArray(client.clmPresentations) && client.clmPresentations.length > 0 && <ViewField label="CLM Presentations" value={<ChipList items={client.clmPresentations} />} />}
          </div>
        </SectionCard>
      )}

      {/* Media & Cover */}
      {hasMedia && (
        <SectionCard icon={Camera} title="Media" iconBg="bg-[#eff6ff]" iconColor="text-[#3b82f6]"
          badge={<span className="text-[11px] text-[#8b8b9e]" style={{ fontWeight: 500 }}>{mediaImages.length + 1} files</span>}
        >
          <div className="grid grid-cols-4 gap-2.5 mb-3">
            {mediaImages.map((img, i) => (
              <div key={i} className="relative aspect-[4/3] rounded-lg overflow-hidden border border-[#e8e8ec] group cursor-pointer">
                <ImageWithFallback src={img} alt={`Media ${i + 1}`} className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                <div className="absolute bottom-1.5 left-1.5">
                  <span className="px-1.5 py-0.5 bg-black/50 backdrop-blur-sm text-white text-[9px] rounded" style={{ fontWeight: 500 }}>Photo</span>
                </div>
              </div>
            ))}
          </div>
          <div>
            <div className="text-[10px] text-[#8b8b9e] uppercase tracking-wider mb-1.5 px-1" style={{ fontWeight: 500 }}>Cover Photo</div>
            <div className="relative w-[140px] aspect-[4/3] rounded-lg overflow-hidden border border-[#e8e8ec] group cursor-pointer">
              <ImageWithFallback src={coverImage} alt="Cover" className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              <div className="absolute bottom-1.5 left-1.5">
                <span className="px-1.5 py-0.5 bg-[#7c3aed]/80 backdrop-blur-sm text-white text-[9px] rounded" style={{ fontWeight: 500 }}>Cover</span>
              </div>
            </div>
          </div>
        </SectionCard>
      )}
    </div>
  );
}

function DetailsEditMode({ form, setForm, onSave, onCancel }: {
  form: Client; setForm: React.Dispatch<React.SetStateAction<Client>>; onSave: () => void; onCancel: () => void;
}) {
  const update = (key: keyof Client, val: unknown) => setForm((f) => ({ ...f, [key]: val }));
  const chainOptions = ["Carrefour", "Spinneys", "LuLu", "Cozmo", "Safeway", "Miles"];
  const repOptions = ["Ahmad Abudraya", "Sara Khalil", "Omar Rashed", "Layla Hassan", "Nour Ali", "Fadi Mansour"];
  const tagOptions = ["Active", "Premium", "New", "Standard", "VIP", "Seasonal"];
  const areaOptions = ["Amman", "Irbid", "Zarqa", "Aqaba", "Salt", "Madaba", "Jerash", "Mafraq"];
  const channelOptions = ["Retail", "Wholesale", "HORECA", "Pharmacy", "Modern Trade"];
  const teamOptions = ["Team A", "Team B", "Team C", "Team D", "Team E"];
  const specialtyOptions = ["Retail", "Wholesale", "HORECA", "Pharmacy", "Modern Trade"];
  const mslOptions = ["Beverages MSL", "Snacks MSL", "Dairy MSL", "Household MSL", "Premium SKU List", "Core Range List"];
  const productOptions = ["Beverages", "Snacks", "Dairy", "Household", "Personal Care"];
  const mediaProductOptions = ["Coca Cola", "Pepsi", "Samsung", "Apple", "Nestle", "Unilever"];
  const retOptions = ["Template A", "Template B", "Template C"];
  const formOptions = ["Inspection Form", "Audit Form", "Survey Form"];
  const clmOptions = ["Presentation 1", "Presentation 2", "Presentation 3"];
  const contactOptions = ["John Doe", "Jane Smith", "Mohammed Ali", "Fatima Hassan", "Khaled Omar"];

  return (
    <div className="flex flex-col gap-4">
      {/* Save / Cancel Bar */}
      <div className="flex items-center justify-between bg-[#f3f0ff] rounded-xl border border-[#7c3aed]/20 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Edit size={13} className="text-[#7c3aed]" />
          <span className="text-[12px] text-[#7c3aed]" style={{ fontWeight: 600 }}>Edit Mode</span>
          <span className="text-[11px] text-[#8b8b9e]" style={{ fontWeight: 400 }}>All fields are displayed. Fill in values as needed.</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onCancel} className="px-3 py-1.5 text-[12px] text-[#4a4a5a] border border-[#e8e8ec] rounded-md hover:bg-white transition-colors cursor-pointer bg-white" style={{ fontWeight: 500 }}>Cancel</button>
          <button onClick={onSave} className="px-4 py-1.5 text-[12px] text-white bg-[#7c3aed] rounded-md hover:bg-[#6d28d9] transition-colors cursor-pointer" style={{ fontWeight: 600 }}>Save Changes</button>
        </div>
      </div>

      {/* Identity */}
      <SectionCard icon={User} title="Identity" iconBg="bg-[#f3f0ff]" iconColor="text-[#7c3aed]">
        <div className="grid grid-cols-2 gap-3">
          <EditInput label="Client Name" value={form.name} required onChange={(v) => update("name", v)} />
          <EditInput label="Client Code" value={form.clientCode} required onChange={(v) => update("clientCode", v)} />
        </div>
        <div className="mt-3">
          <EditToggle label="Is Chain?" value={form.isChain} onChange={(v) => update("isChain", v)} />
        </div>
        {form.isChain && (
          <div className="mt-2">
            <EditMultiSelect label="Client Chain" values={form.clientChain ? form.clientChain.split(",").map((s) => s.trim()).filter(Boolean) : []} options={chainOptions} />
          </div>
        )}
        <div className="mt-3">
          <EditTextarea label="Description (Optional)" value={form.description} onChange={(v) => update("description", v)} />
        </div>
      </SectionCard>

      {/* Assignment & Teams */}
      <SectionCard icon={UserCheck} title="Assignment & Teams" iconBg="bg-[#dcfce7]" iconColor="text-[#22c55e]">
        <div className="grid grid-cols-2 gap-3">
          <EditMultiSelect label="Assigned To" values={form.assignedTo ? [form.assignedTo] : []} options={repOptions} quickAccessUrl="/settings/users" />
          <EditMultiSelect label="Teams" values={form.teams ? [form.teams] : []} options={teamOptions} quickAccessUrl="/settings/teams" />
        </div>
      </SectionCard>

      {/* Classification & Tags */}
      <SectionCard icon={Tag} title="Classification & Tags" iconBg="bg-[#fef3c7]" iconColor="text-[#f59e0b]">
        <div className="grid grid-cols-2 gap-3">
          <EditMultiSelect label="Client Tags" values={form.clientTags} options={tagOptions} quickAdd={{ secondaryField: "Team" }} />
          <EditMultiSelect label="Area Tags" values={form.areaTags} options={areaOptions} quickAdd={{ secondaryField: "Team" }} />
          <EditMultiSelect label="Client Channel" values={form.clientChannel ? [form.clientChannel] : []} options={channelOptions} quickAdd={{ secondaryField: "Local Name" }} />
          <EditMultiSelect label="Job Categories" values={form.jobCategories ? [form.jobCategories] : []} options={channelOptions} quickAccessUrl="/settings/job-categories" />
          <EditMultiSelect label="Specialties" values={form.specialty ? [form.specialty] : []} options={specialtyOptions} quickAdd={{ secondaryField: "Local Name" }} />
        </div>
      </SectionCard>

      {/* Products & Inventory */}
      <SectionCard icon={Package} title="Products & Inventory" iconBg="bg-[#eff6ff]" iconColor="text-[#3b82f6]">
        <div className="grid grid-cols-2 gap-3">
          <EditMultiSelect label="Availability MSL" values={form.availabilityMSL ? [form.availabilityMSL] : []} options={mslOptions} quickAccessUrl="/settings/availability-msl" />
          <EditMultiSelect label="Media Assigned Products" values={form.mediaAssignedProducts ? form.mediaAssignedProducts.split(",").map((s) => s.trim()).filter(Boolean) : []} options={mediaProductOptions} quickAccessUrl="/settings/products" />
          <EditMultiSelect label="Product Group" values={form.assignedProductGroups ? [form.assignedProductGroups] : []} options={productOptions} quickAdd={{ secondaryField: "Local Name" }} />
        </div>
      </SectionCard>

      {/* Operations & Compliance */}
      <SectionCard icon={Settings} title="Operations & Compliance" iconBg="bg-[#fce7f3]" iconColor="text-[#ec4899]">
        <div className="grid grid-cols-2 gap-3">
          <EditMultiSelect label="Contacts" values={form.contacts} options={contactOptions} quickAccessUrl="/settings/contacts" />
          <EditInput label="Tax Number" value={form.taxNumber} onChange={(v) => update("taxNumber", v)} />
          <EditMultiSelect label="Retail Execution Template" values={form.retailExecutionTemplate} options={retOptions} quickAccessUrl="/settings/retail-execution" />
          <EditMultiSelect label="Forms V2" values={form.formsV2 ? [form.formsV2] : []} options={formOptions} quickAccessUrl="/settings/forms" />
          <EditMultiSelect label="CLM Presentations" values={form.clmPresentations} options={clmOptions} quickAccessUrl="/settings/clm-presentations" />
        </div>
      </SectionCard>

      {/* Media */}
      <SectionCard icon={Camera} title="Media" iconBg="bg-[#eff6ff]" iconColor="text-[#3b82f6]">
        <div className="mb-3">
          <label className="text-[10px] text-[#8b8b9e] uppercase tracking-wider mb-2 block" style={{ fontWeight: 500 }}>Upload or Drag Files / Images</label>
          <div className="border-2 border-dashed border-[#e8e8ec] rounded-xl p-6 flex flex-col items-center justify-center gap-2 hover:border-[#7c3aed]/40 transition-colors cursor-pointer bg-white">
            <div className="w-10 h-10 rounded-xl bg-[#f3f0ff] flex items-center justify-center">
              <Upload size={18} className="text-[#7c3aed]" />
            </div>
            <span className="text-[12px] text-[#4a4a5a]" style={{ fontWeight: 500 }}>Drop files here or <span className="text-[#7c3aed] underline">browse</span></span>
            <span className="text-[10px] text-[#8b8b9e]">PNG, JPG, PDF up to 10MB</span>
          </div>
          {/* Existing files */}
          <div className="flex gap-2 mt-2">
            {mediaImages.map((img, i) => (
              <div key={i} className="relative w-[80px] aspect-[4/3] rounded-lg overflow-hidden border border-[#e8e8ec] group">
                <ImageWithFallback src={img} alt={`Media ${i + 1}`} className="w-full h-full object-cover" />
                <button className="absolute top-1 right-1 w-4 h-4 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <X size={8} className="text-white" />
                </button>
              </div>
            ))}
          </div>
        </div>
        <div>
          <label className="text-[10px] text-[#8b8b9e] uppercase tracking-wider mb-2 block" style={{ fontWeight: 500 }}>Cover Photo</label>
          <div className="flex items-center gap-3">
            <div className="relative w-[100px] aspect-[4/3] rounded-lg overflow-hidden border border-[#e8e8ec] group">
              <ImageWithFallback src={coverImage} alt="Cover" className="w-full h-full object-cover" />
              <button className="absolute top-1 right-1 w-4 h-4 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <X size={8} className="text-white" />
              </button>
            </div>
            <button className="px-3 py-2 text-[11px] text-[#7c3aed] border border-dashed border-[#7c3aed]/40 rounded-lg hover:bg-[#f3f0ff] transition-colors cursor-pointer flex items-center gap-1.5" style={{ fontWeight: 500 }}>
              <Camera size={12} />
              Change Cover
            </button>
          </div>
        </div>
      </SectionCard>

      {/* Bottom Save Bar */}
      <div className="flex items-center justify-end gap-2 pt-2 pb-4">
        <button onClick={onCancel} className="px-4 py-2 text-[12px] text-[#4a4a5a] border border-[#e8e8ec] rounded-md hover:bg-[#f5f5f7] transition-colors cursor-pointer" style={{ fontWeight: 500 }}>Cancel</button>
        <button onClick={onSave} className="px-5 py-2 text-[12px] text-white bg-[#7c3aed] rounded-md hover:bg-[#6d28d9] transition-colors cursor-pointer" style={{ fontWeight: 600 }}>Save Changes</button>
      </div>
    </div>
  );
}

/* =========================================
   SUB-TAB: Sales
   ========================================= */
function SalesSubTab({ client, isEditing, onSave, onCancel }: { client: Client; isEditing: boolean; onSave: () => void; onCancel: () => void }) {
  const priceListOptions = ["Standard", "Wholesale", "VIP", "Promotional", "Seasonal"];
  const paymentTermOptions = ["Net 15", "Net 30", "Net 60", "Net 90", "COD"];

  // Safe defaults for fields that may be undefined
  const cl = client.creditLimit ?? 0;
  const tbl = client.transactionBalanceLimit ?? 0;
  const gp = client.gracePeriodAfterDueDate ?? 0;
  const clAI = client.creditLimitApplyInvoices ?? false;
  const clASO = client.creditLimitApplySalesOrder ?? false;
  const tblAI = client.transactionBalanceLimitApplyInvoices ?? false;
  const tblASO = client.transactionBalanceLimitApplySalesOrder ?? false;
  const gpAI = client.gracePeriodApplyInvoices ?? false;
  const gpASO = client.gracePeriodApplySalesOrder ?? false;

  const [form, setForm] = useState({
    priceList: client.priceList ?? "",
    paymentTerm: client.paymentTerm ?? "",
    paymentType: (client.paymentType ?? "Cash Only") as "Cash Only" | "Allow Credit",
    creditLimit: cl,
    creditLimitApplyInvoices: clAI,
    creditLimitApplySalesOrder: clASO,
    transactionBalanceLimit: tbl,
    transactionBalanceLimitApplyInvoices: tblAI,
    transactionBalanceLimitApplySalesOrder: tblASO,
    gracePeriodAfterDueDate: gp,
    gracePeriodApplyInvoices: gpAI,
    gracePeriodApplySalesOrder: gpASO,
  });

  useEffect(() => {
    setForm({
      priceList: client.priceList ?? "",
      paymentTerm: client.paymentTerm ?? "",
      paymentType: (client.paymentType ?? "Cash Only") as "Cash Only" | "Allow Credit",
      creditLimit: client.creditLimit ?? 0,
      creditLimitApplyInvoices: client.creditLimitApplyInvoices ?? false,
      creditLimitApplySalesOrder: client.creditLimitApplySalesOrder ?? false,
      transactionBalanceLimit: client.transactionBalanceLimit ?? 0,
      transactionBalanceLimitApplyInvoices: client.transactionBalanceLimitApplyInvoices ?? false,
      transactionBalanceLimitApplySalesOrder: client.transactionBalanceLimitApplySalesOrder ?? false,
      gracePeriodAfterDueDate: client.gracePeriodAfterDueDate ?? 0,
      gracePeriodApplyInvoices: client.gracePeriodApplyInvoices ?? false,
      gracePeriodApplySalesOrder: client.gracePeriodApplySalesOrder ?? false,
    });
  }, [client]);

  if (!isEditing) {
    const pt = client.paymentType ?? "Cash Only";
    return (
      <div className="flex flex-col gap-4">
        {/* Pricing & Payment */}
        <SectionCard icon={DollarSign} title="Pricing & Payment" iconBg="bg-[#f3f0ff]" iconColor="text-[#7c3aed]">
          <div className="grid grid-cols-3 gap-x-6 gap-y-4">
            <ViewField label="Price List" value={client.priceList || "—"} />
            <ViewField label="Payment Term" value={client.paymentTerm || "—"} />
            <ViewField label="Payment Type" value={
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] ${pt === "Allow Credit" ? "bg-[#dcfce7] text-[#16a34a]" : "bg-[#fef3c7] text-[#d97706]"}`} style={{ fontWeight: 600 }}>
                <span className={`w-1.5 h-1.5 rounded-full ${pt === "Allow Credit" ? "bg-[#16a34a]" : "bg-[#d97706]"}`} />
                {pt}
              </span>
            } />
          </div>
        </SectionCard>

        {/* Credit Limit */}
        <SectionCard icon={CreditCard} title="Credit Limit" iconBg="bg-[#dcfce7]" iconColor="text-[#22c55e]">
          <div className="grid grid-cols-3 gap-x-6 gap-y-4">
            <ViewField label="Credit Limit" value={`$${cl.toLocaleString()}`} />
            <ViewField label="Apply on Invoices" value={<SalesBoolBadge value={clAI} />} />
            <ViewField label="Apply on Sales Order" value={<SalesBoolBadge value={clASO} />} />
          </div>
        </SectionCard>

        {/* Transaction Balance Limit */}
        <SectionCard icon={BarChart3} title="Transaction Balance Limit" iconBg="bg-[#eff6ff]" iconColor="text-[#3b82f6]">
          <div className="grid grid-cols-3 gap-x-6 gap-y-4">
            <ViewField label="Transaction Balance Limit" value={`$${tbl.toLocaleString()}`} />
            <ViewField label="Apply on Invoices" value={<SalesBoolBadge value={tblAI} />} />
            <ViewField label="Apply on Sales Order" value={<SalesBoolBadge value={tblASO} />} />
          </div>
        </SectionCard>

        {/* Grace Period After Due Date */}
        <SectionCard icon={Clock} title="Grace Period After Due Date" iconBg="bg-[#fef3c7]" iconColor="text-[#f59e0b]">
          <div className="grid grid-cols-3 gap-x-6 gap-y-4">
            <ViewField label="Grace Period" value={`${gp} days`} />
            <ViewField label="Apply on Invoices" value={<SalesBoolBadge value={gpAI} />} />
            <ViewField label="Apply on Sales Order" value={<SalesBoolBadge value={gpASO} />} />
          </div>
        </SectionCard>
      </div>
    );
  }

  /* ---- Edit Mode ---- */
  return (
    <div className="flex flex-col gap-5">
      {/* Pricing & Payment */}
      <SectionCard icon={DollarSign} title="Pricing & Payment" iconBg="bg-[#f3f0ff]" iconColor="text-[#7c3aed]">
        <div className="grid grid-cols-2 gap-3">
          <SalesDropdown
            label="Price List"
            value={form.priceList}
            options={priceListOptions}
            onChange={(v) => setForm({ ...form, priceList: v })}
            quickAccessUrl="/settings/price-lists"
          />
          <SalesDropdown
            label="Payment Term"
            value={form.paymentTerm}
            options={paymentTermOptions}
            onChange={(v) => setForm({ ...form, paymentTerm: v })}
            quickAccessUrl="/settings/payment-terms"
          />
          <div className="col-span-2">
            <label className="text-[10px] text-[#8b8b9e] uppercase tracking-wider mb-2 block" style={{ fontWeight: 500 }}>Payment Type</label>
            <div className="flex gap-3">
              {(["Cash Only", "Allow Credit"] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setForm({ ...form, paymentType: opt })}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-[12px] transition-all cursor-pointer ${
                    form.paymentType === opt
                      ? "bg-[#7c3aed] border-[#7c3aed] text-white shadow-sm"
                      : "bg-white border-[#e8e8ec] text-[#4a4a5a] hover:border-[#7c3aed]/40"
                  }`}
                  style={{ fontWeight: form.paymentType === opt ? 600 : 400 }}
                >
                  {opt === "Cash Only" ? <DollarSign size={13} /> : <CreditCard size={13} />}
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Credit Limit */}
      <SalesLimitSection
        icon={CreditCard}
        title="Credit Limit"
        iconBg="bg-[#dcfce7]"
        iconColor="text-[#22c55e]"
        description="The maximum outstanding balance a client is allowed to reach before being restricted from creating new transactions."
        applyInvoices={form.creditLimitApplyInvoices}
        applySalesOrder={form.creditLimitApplySalesOrder}
        onToggleInvoices={(v) => setForm({ ...form, creditLimitApplyInvoices: v })}
        onToggleSalesOrder={(v) => setForm({ ...form, creditLimitApplySalesOrder: v })}
        inputLabel="Enter Credit Limit"
        inputValue={form.creditLimit}
        onInputChange={(v) => setForm({ ...form, creditLimit: v })}
        prefix="$"
      />

      {/* Transaction Balance Limit */}
      <SalesLimitSection
        icon={BarChart3}
        title="Transaction Balance Limit"
        iconBg="bg-[#eff6ff]"
        iconColor="text-[#3b82f6]"
        description="Allows the client to issue a new transaction as long as their current balance is below the credit limit — regardless of the value of the current transaction. The system does not include the current transaction amount in the credit check. Note: Set to zero for Back to back invoices."
        applyInvoices={form.transactionBalanceLimitApplyInvoices}
        applySalesOrder={form.transactionBalanceLimitApplySalesOrder}
        onToggleInvoices={(v) => setForm({ ...form, transactionBalanceLimitApplyInvoices: v })}
        onToggleSalesOrder={(v) => setForm({ ...form, transactionBalanceLimitApplySalesOrder: v })}
        inputLabel="Enter Transaction Balance Limit"
        inputValue={form.transactionBalanceLimit}
        onInputChange={(v) => setForm({ ...form, transactionBalanceLimit: v })}
        prefix="$"
      />

      {/* Grace Period After Due Date */}
      <SalesLimitSection
        icon={Clock}
        title="Grace Period After Due Date"
        iconBg="bg-[#fef3c7]"
        iconColor="text-[#f59e0b]"
        description="This is the number of extra days you allow your clients to complete their payment after the invoice due date — before preventing them from issuing any new transactions."
        applyInvoices={form.gracePeriodApplyInvoices}
        applySalesOrder={form.gracePeriodApplySalesOrder}
        onToggleInvoices={(v) => setForm({ ...form, gracePeriodApplyInvoices: v })}
        onToggleSalesOrder={(v) => setForm({ ...form, gracePeriodApplySalesOrder: v })}
        inputLabel="Enter Grace Period After Due Date"
        inputValue={form.gracePeriodAfterDueDate}
        onInputChange={(v) => setForm({ ...form, gracePeriodAfterDueDate: v })}
        suffix="days"
      />

      {/* Save / Cancel */}
      <div className="flex items-center gap-2 pt-2">
        <button
          onClick={onSave}
          className="px-5 py-2 bg-[#7c3aed] text-white text-[12px] rounded-lg hover:bg-[#6d28d9] transition-colors cursor-pointer"
          style={{ fontWeight: 600 }}
        >
          Save Changes
        </button>
        <button
          onClick={onCancel}
          className="px-5 py-2 bg-white text-[#4a4a5a] text-[12px] border border-[#e8e8ec] rounded-lg hover:bg-[#f5f5f7] transition-colors cursor-pointer"
          style={{ fontWeight: 500 }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

/* -- Sales tab helpers -- */
function SalesBoolBadge({ value }: { value: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] ${value ? "bg-[#dcfce7] text-[#16a34a]" : "bg-[#f5f5f7] text-[#8b8b9e]"}`} style={{ fontWeight: 600 }}>
      <span className={`w-1.5 h-1.5 rounded-full ${value ? "bg-[#16a34a]" : "bg-[#d1d5db]"}`} />
      {value ? "Yes" : "No"}
    </span>
  );
}

function SalesDropdown({ label, value, options, onChange, quickAccessUrl }: {
  label: string; value: string; options: string[]; onChange: (v: string) => void; quickAccessUrl?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1">
        <label className="text-[10px] text-[#8b8b9e] uppercase tracking-wider" style={{ fontWeight: 500 }}>{label}</label>
        {quickAccessUrl && (
          <a
            href={quickAccessUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={`Manage ${label}`}
            className="inline-flex items-center justify-center w-4 h-4 rounded hover:bg-[#f3f0ff] text-[#b0b0be] hover:text-[#7c3aed] transition-colors cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink size={9} />
          </a>
        )}
      </div>
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between px-3 py-2 text-[13px] text-[#1a1a2e] bg-white rounded-lg border border-[#e8e8ec] hover:border-[#7c3aed]/40 transition-colors cursor-pointer"
          style={{ fontWeight: 400 }}
        >
          <span>{value || "Select..."}</span>
          <ChevronDown size={13} className={`text-[#8b8b9e] transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        {open && (
          <div className="absolute z-30 top-full mt-1 left-0 w-full bg-white rounded-lg border border-[#e8e8ec] shadow-lg max-h-[180px] overflow-y-auto">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => { onChange(opt); setOpen(false); }}
                className={`w-full text-left px-3 py-2 text-[12px] hover:bg-[#f3f0ff] transition-colors cursor-pointer ${opt === value ? "bg-[#f3f0ff] text-[#7c3aed]" : "text-[#1a1a2e]"}`}
                style={{ fontWeight: opt === value ? 600 : 400 }}
              >
                {opt === value && <Check size={11} className="inline mr-1.5" />}{opt}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SalesLimitSection({ icon: Icon, title, iconBg, iconColor, description, applyInvoices, applySalesOrder, onToggleInvoices, onToggleSalesOrder, inputLabel, inputValue, onInputChange, prefix, suffix }: {
  icon: React.ElementType; title: string; iconBg: string; iconColor: string; description: string;
  applyInvoices: boolean; applySalesOrder: boolean;
  onToggleInvoices: (v: boolean) => void; onToggleSalesOrder: (v: boolean) => void;
  inputLabel: string; inputValue: number; onInputChange: (v: number) => void;
  prefix?: string; suffix?: string;
}) {
  return (
    <SectionCard icon={Icon} title={title} iconBg={iconBg} iconColor={iconColor}>
      {/* Description */}
      <div className="flex items-start gap-2 mb-4 px-3 py-2.5 bg-[#f8f9fb] rounded-lg border border-[#e8e8ec]/60">
        <Info size={13} className="text-[#8b8b9e] mt-0.5 flex-shrink-0" />
        <p className="text-[11px] text-[#6b6b7b]" style={{ fontWeight: 400, lineHeight: "1.55" }}>{description}</p>
      </div>

      {/* Apply toggles */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center justify-between px-3 py-2.5 bg-white rounded-lg border border-[#e8e8ec]">
          <div className="flex items-center gap-2">
            <Receipt size={12} className="text-[#8b8b9e]" />
            <span className="text-[11px] text-[#4a4a5a]" style={{ fontWeight: 500 }}>Apply on Invoices</span>
          </div>
          <button
            onClick={() => onToggleInvoices(!applyInvoices)}
            className={`relative w-9 h-5 rounded-full transition-colors duration-200 cursor-pointer ${applyInvoices ? "bg-[#7c3aed]" : "bg-[#d1d5db]"}`}
          >
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${applyInvoices ? "left-[18px]" : "left-0.5"}`} />
          </button>
        </div>
        <div className="flex items-center justify-between px-3 py-2.5 bg-white rounded-lg border border-[#e8e8ec]">
          <div className="flex items-center gap-2">
            <ShoppingCart size={12} className="text-[#8b8b9e]" />
            <span className="text-[11px] text-[#4a4a5a]" style={{ fontWeight: 500 }}>Apply on Sales Order</span>
          </div>
          <button
            onClick={() => onToggleSalesOrder(!applySalesOrder)}
            className={`relative w-9 h-5 rounded-full transition-colors duration-200 cursor-pointer ${applySalesOrder ? "bg-[#7c3aed]" : "bg-[#d1d5db]"}`}
          >
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${applySalesOrder ? "left-[18px]" : "left-0.5"}`} />
          </button>
        </div>
      </div>

      {/* Value input */}
      <div>
        <label className="text-[10px] text-[#8b8b9e] uppercase tracking-wider mb-1 block" style={{ fontWeight: 500 }}>{inputLabel}</label>
        <div className="relative">
          {prefix && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-[#8b8b9e]" style={{ fontWeight: 500 }}>{prefix}</span>
          )}
          <input
            type="number"
            value={inputValue}
            onChange={(e) => onInputChange(Number(e.target.value) || 0)}
            className={`w-full py-2 text-[13px] text-[#1a1a2e] bg-white rounded-lg border border-[#e8e8ec] outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/20 transition-colors ${prefix ? "pl-7 pr-3" : "pl-3"} ${suffix ? "pr-14" : "pr-3"}`}
            style={{ fontWeight: 400 }}
            min={0}
          />
          {suffix && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#8b8b9e]" style={{ fontWeight: 500 }}>{suffix}</span>
          )}
        </div>
      </div>
    </SectionCard>
  );
}

function ActivityRow({ icon: Icon, label, time, color, bg }: {
  icon: React.ElementType; label: string; time: string; color: string; bg: string;
}) {
  const isRecent = (() => {
    try {
      const d = new Date(time.replace(", ", "T").replace(" AM", "").replace(" PM", ""));
      const now = new Date("2026-02-24");
      return (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24) < 30;
    } catch { return false; }
  })();

  return (
    <div className="flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-[#f5f5f7] transition-colors">
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${bg}`}>
        <Icon size={13} className={color} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[12px] text-[#4a4a5a]" style={{ fontWeight: 500 }}>{label}</div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={`w-1.5 h-1.5 rounded-full ${isRecent ? "bg-[#22c55e]" : "bg-[#d1d5db]"}`} />
        <span className="text-[12px] text-[#4a4a5a]" style={{ fontWeight: 400 }}>{time}</span>
      </div>
    </div>
  );
}

/* =========================================
   SUB-TAB: Custom Fields
   ========================================= */

const CF_TYPE_META: Record<CustomFieldType, { icon: React.ElementType; iconBg: string; iconColor: string }> = {
  Text:          { icon: Type,         iconBg: "bg-[#f3f0ff]", iconColor: "text-[#7c3aed]" },
  Number:        { icon: Hash,         iconBg: "bg-[#eff6ff]", iconColor: "text-[#3b82f6]" },
  Dropdown:      { icon: ChevronDown,  iconBg: "bg-[#fef3c7]", iconColor: "text-[#f59e0b]" },
  Date:          { icon: CalendarDays, iconBg: "bg-[#dcfce7]", iconColor: "text-[#22c55e]" },
  Boolean:       { icon: ToggleLeft,   iconBg: "bg-[#fce7f3]", iconColor: "text-[#ec4899]" },
  "Multi-Select":{ icon: ListChecks,   iconBg: "bg-[#e0f2fe]", iconColor: "text-[#0ea5e9]" },
};

function renderFieldValue(field: CustomField) {
  if (!field.value) return <span className="text-[#d0d0de] italic" style={{ fontWeight: 400 }}>Not set</span>;
  if (field.type === "Boolean") {
    const isTrue = field.value === "true";
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] ${isTrue ? "bg-[#dcfce7] text-[#16a34a]" : "bg-[#f5f5f7] text-[#8b8b9e]"}`} style={{ fontWeight: 600 }}>
        <span className={`w-1.5 h-1.5 rounded-full ${isTrue ? "bg-[#16a34a]" : "bg-[#d1d5db]"}`} />
        {isTrue ? "Yes" : "No"}
      </span>
    );
  }
  if (field.type === "Multi-Select") {
    const chips = field.value.split(",").map(s => s.trim()).filter(Boolean);
    return (
      <div className="flex flex-wrap gap-1.5">
        {chips.map(c => (
          <span key={c} className="inline-flex items-center px-2 py-0.5 bg-[#f0f4ff] text-[#3b82f6] text-[11px] rounded-full" style={{ fontWeight: 500 }}>{c}</span>
        ))}
      </div>
    );
  }
  if (field.type === "Date") {
    try {
      return <span className="text-[13px] text-[#1a1a2e]" style={{ fontWeight: 500 }}>{new Date(field.value).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>;
    } catch { /* fall through */ }
  }
  return <span className="text-[13px] text-[#1a1a2e]" style={{ fontWeight: 500 }}>{field.value}</span>;
}

function CustomFieldsSubTab({ client }: { client: Client }) {
  const [fields, setFields] = useState<CustomField[]>(() => generateCustomFields());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [collapsedTypes, setCollapsedTypes] = useState<Set<string>>(() => new Set(CUSTOM_FIELD_TYPES as unknown as string[]));

  // Group fields by type, preserving CUSTOM_FIELD_TYPES order
  const grouped = CUSTOM_FIELD_TYPES.map(type => ({
    type,
    fields: fields.filter(f => f.type === type),
  })).filter(g => g.fields.length > 0);

  const toggleCollapse = (type: string) => {
    setCollapsedTypes(prev => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });
  };

  const handleCreate = (newField: CustomField) => {
    setFields(prev => [...prev, newField]);
    setShowCreateModal(false);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header with count + Create button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#f0f0f3]">
            <Settings size={13} className="text-[#8b8b9e]" />
          </div>
          <span className="text-[13px] text-[#1a1a2e]" style={{ fontWeight: 600 }}>Custom Fields</span>
          <span className="text-[11px] text-[#8b8b9e] ml-1" style={{ fontWeight: 500 }}>{fields.length} fields</span>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2563eb] text-white text-[12px] rounded-lg hover:bg-[#1d4ed8] transition-colors cursor-pointer"
          style={{ fontWeight: 600 }}
        >
          <Plus size={12} />
          Create Custom Field
        </button>
      </div>

      {/* Type-grouped sections */}
      {grouped.map(({ type, fields: typeFields }) => {
        const meta = CF_TYPE_META[type];
        const isCollapsed = collapsedTypes.has(type);
        return (
          <SectionCard
            key={type}
            icon={meta.icon}
            title={type}
            iconBg={meta.iconBg}
            iconColor={meta.iconColor}
            onHeaderClick={() => toggleCollapse(type)}
            badge={
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#8b8b9e]" style={{ fontWeight: 500 }}>{typeFields.length} field{typeFields.length !== 1 ? "s" : ""}</span>
                <div className="p-0.5 rounded">
                  {isCollapsed ? <ChevronDown size={13} className="text-[#8b8b9e]" /> : <ChevronUp size={13} className="text-[#8b8b9e]" />}
                </div>
              </div>
            }
          >
            {!isCollapsed && (
              <div className="grid grid-cols-2 gap-3">
                {typeFields.map(field => (
                  <div key={field.id} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-[#e8e8ec] hover:border-[#d0d0de] transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] text-[#8b8b9e] uppercase tracking-wider" style={{ fontWeight: 500 }}>{field.name}</span>
                        {field.localName && (
                          <span className="text-[10px] text-[#b0b0c0]" style={{ fontWeight: 400 }}>({field.localName})</span>
                        )}
                      </div>
                      <div>{renderFieldValue(field)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        );
      })}

      {/* Create Custom Field Modal */}
      {showCreateModal && (
        <CreateCustomFieldModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreate}
          existingTypes={CUSTOM_FIELD_TYPES as unknown as CustomFieldType[]}
        />
      )}
    </div>
  );
}

/* -- Create Custom Field Modal -- */
function CreateCustomFieldModal({ onClose, onCreate, existingTypes }: {
  onClose: () => void;
  onCreate: (field: CustomField) => void;
  existingTypes: CustomFieldType[];
}) {
  const [name, setName] = useState("");
  const [localName, setLocalName] = useState("");
  const [selectedType, setSelectedType] = useState<CustomFieldType>(existingTypes[0]);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    const newField: CustomField = {
      id: `cf-${Date.now()}`,
      name: name.trim(),
      localName: localName.trim(),
      module: "Client",
      type: selectedType,
      value: "",
    };
    onCreate(newField);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-[480px] max-w-[95vw] overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e8e8ec]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#eff6ff] flex items-center justify-center">
              <Plus size={14} className="text-[#2563eb]" />
            </div>
            <span className="text-[14px] text-[#1a1a2e]" style={{ fontWeight: 600 }}>Create Custom Field</span>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#f5f5f7] transition-colors cursor-pointer">
            <X size={14} className="text-[#8b8b9e]" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 flex flex-col gap-4">
          {/* Name */}
          <div>
            <label className="block text-[11px] text-[#8b8b9e] uppercase tracking-wider mb-1.5" style={{ fontWeight: 600 }}>
              Name <span className="text-[#ef4444]">*</span>
            </label>
            <input
              value={name}
              onChange={e => { setName(e.target.value); setError(""); }}
              placeholder="Enter field name"
              className={`w-full px-3 py-2 text-[13px] border rounded-lg bg-white outline-none transition-colors ${error ? "border-[#ef4444] focus:border-[#ef4444]" : "border-[#e8e8ec] focus:border-[#2563eb]"}`}
              autoFocus
            />
            {error && <p className="text-[11px] text-[#ef4444] mt-1" style={{ fontWeight: 500 }}>{error}</p>}
          </div>

          {/* Local Name */}
          <div>
            <label className="block text-[11px] text-[#8b8b9e] uppercase tracking-wider mb-1.5" style={{ fontWeight: 600 }}>Local Name</label>
            <input
              value={localName}
              onChange={e => setLocalName(e.target.value)}
              placeholder="Enter local name (optional)"
              className="w-full px-3 py-2 text-[13px] border border-[#e8e8ec] rounded-lg bg-white outline-none focus:border-[#2563eb] transition-colors"
            />
          </div>

          {/* Module (disabled) */}
          <div>
            <label className="block text-[11px] text-[#8b8b9e] uppercase tracking-wider mb-1.5" style={{ fontWeight: 600 }}>Module</label>
            <input
              value="Client"
              disabled
              className="w-full px-3 py-2 text-[13px] border border-[#e8e8ec] rounded-lg bg-[#f5f5f7] text-[#8b8b9e] cursor-not-allowed"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-[11px] text-[#8b8b9e] uppercase tracking-wider mb-1.5" style={{ fontWeight: 600 }}>Type</label>
            <div className="relative">
              <select
                value={selectedType}
                onChange={e => setSelectedType(e.target.value as CustomFieldType)}
                className="w-full px-3 py-2 text-[13px] border border-[#e8e8ec] rounded-lg bg-white outline-none focus:border-[#2563eb] transition-colors appearance-none cursor-pointer pr-8"
              >
                {existingTypes.map(t => {
                  const meta = CF_TYPE_META[t];
                  return <option key={t} value={t}>{t}</option>;
                })}
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8b8b9e] pointer-events-none" />
            </div>
            {/* Type preview chip */}
            <div className="flex items-center gap-2 mt-2">
              {(() => {
                const meta = CF_TYPE_META[selectedType];
                const Icon = meta.icon;
                return (
                  <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] ${meta.iconBg} ${meta.iconColor}`} style={{ fontWeight: 600 }}>
                    <Icon size={12} />
                    {selectedType}
                  </span>
                );
              })()}
              <span className="text-[11px] text-[#8b8b9e]" style={{ fontWeight: 400 }}>— field will be created under this type group</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-[#e8e8ec] bg-[#fafafa]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[12px] text-[#4a4a5a] rounded-lg border border-[#e8e8ec] hover:bg-[#f5f5f7] transition-colors cursor-pointer"
            style={{ fontWeight: 500 }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-[12px] text-white bg-[#2563eb] rounded-lg hover:bg-[#1d4ed8] transition-colors cursor-pointer"
            style={{ fontWeight: 600 }}
          >
            Create Field
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================
   SUB-TAB: Contact Info
   ========================================= */
function ContactInfoSubTab({ client, isEditing, onSave, onCancel }: { client: Client; isEditing: boolean; onSave: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({ ...client });
  const [lastId, setLastId] = useState(client.id);

  if (client.id !== lastId) { setLastId(client.id); setForm({ ...client }); }

  const update = (key: keyof Client, val: unknown) => setForm((f) => ({ ...f, [key]: val }));
  const titleOptions = ["Mr.", "Mrs."];

  if (isEditing) {
    return (
      <div className="flex flex-col gap-4">
        {/* Save / Cancel Bar */}
        <div className="flex items-center justify-between bg-[#f3f0ff] rounded-xl border border-[#7c3aed]/20 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <Edit size={13} className="text-[#7c3aed]" />
            <span className="text-[12px] text-[#7c3aed]" style={{ fontWeight: 600 }}>Edit Mode</span>
            <span className="text-[11px] text-[#8b8b9e]" style={{ fontWeight: 400 }}>Update contact information fields below.</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onCancel} className="px-3 py-1.5 text-[12px] text-[#4a4a5a] border border-[#e8e8ec] rounded-md hover:bg-white transition-colors cursor-pointer bg-white" style={{ fontWeight: 500 }}>Cancel</button>
            <button onClick={onSave} className="px-4 py-1.5 text-[12px] text-white bg-[#7c3aed] rounded-md hover:bg-[#6d28d9] transition-colors cursor-pointer" style={{ fontWeight: 600 }}>Save Changes</button>
          </div>
        </div>

        <SectionCard icon={User} title="Contact Information" iconBg="bg-[#f3f0ff]" iconColor="text-[#7c3aed]">
          <div className="grid grid-cols-2 gap-3">
            <EditInput label="Contact Name" value={form.contactName} onChange={(v) => update("contactName", v)} />
            <div>
              <label className="text-[10px] text-[#8b8b9e] uppercase tracking-wider mb-1 block" style={{ fontWeight: 500 }}>Contact Title</label>
              <select
                value={form.contactTitle}
                onChange={(e) => update("contactTitle", e.target.value)}
                className="w-full px-3 py-2 text-[13px] text-[#1a1a2e] bg-white rounded-lg border border-[#e8e8ec] outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/20 transition-colors cursor-pointer"
                style={{ fontWeight: 400 }}
              >
                <option value="">Select title...</option>
                {titleOptions.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <EditInput label="Email" value={form.email} onChange={(v) => update("email", v)} />
            <EditInput label="Client's Phone" value={form.phone} onChange={(v) => update("phone", v)} />
            <EditInput label="Cell Phone" value={form.cellPhone} onChange={(v) => update("cellPhone", v)} />
            <EditInput label="Website" value={form.website} onChange={(v) => update("website", v)} />
          </div>
        </SectionCard>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <SectionCard icon={User} title="Contact Information" iconBg="bg-[#f3f0ff]" iconColor="text-[#7c3aed]">
        <div className="grid grid-cols-2 gap-3">
          <ViewField label="Contact Name" value={client.contactName || "---"} />
          <ViewField label="Contact Title" value={client.contactTitle || "---"} />
          <div>
            <div className="text-[10px] text-[#8b8b9e] uppercase tracking-wider mb-0.5" style={{ fontWeight: 500 }}>Email</div>
            {client.email ? (
              <a href={`mailto:${client.email}`} className="text-[13px] text-[#3b82f6] hover:underline" style={{ fontWeight: 500 }}>{client.email}</a>
            ) : (
              <div className="text-[13px] text-[#1a1a2e]" style={{ fontWeight: 500 }}>---</div>
            )}
          </div>
          <ViewField label="Client's Phone" value={client.phone || "---"} />
          <ViewField label="Cell Phone" value={client.cellPhone || "---"} />
          <div>
            <div className="text-[10px] text-[#8b8b9e] uppercase tracking-wider mb-0.5" style={{ fontWeight: 500 }}>Website</div>
            {client.website ? (
              <a href={`https://${client.website}`} target="_blank" rel="noopener noreferrer" className="text-[13px] text-[#3b82f6] hover:underline" style={{ fontWeight: 500 }}>{client.website}</a>
            ) : (
              <div className="text-[13px] text-[#1a1a2e]" style={{ fontWeight: 500 }}>---</div>
            )}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

/* =========================================
   SUB-TAB: Products Lines Targets
   ========================================= */
interface ProductLineTarget {
  id: number;
  productLine: string;
  classification: string;
  isNew?: boolean;
}

const productLineOptions = ["antibiotics", "مراهم", "Beverages", "Snacks", "Dairy", "Personal Care", "Household", "Supplements"];
const classificationOptions = ["A+", "A", "B", "C", "D"];

function ProductsLinesTargetsSubTab({ client, isEditing, onSave, onCancel }: { client: Client; isEditing: boolean; onSave: () => void; onCancel: () => void }) {
  const [targets, setTargets] = useState<ProductLineTarget[]>([]);
  const [page] = useState(1);

  const handleAddNew = () => {
    const newId = Date.now();
    setTargets((prev) => [...prev, { id: newId, productLine: "", classification: "" }]);
  };

  const handleUpdate = (id: number, key: "productLine" | "classification", val: string) => {
    setTargets((prev) => prev.map((t) => t.id === id ? { ...t, [key]: val } : t));
  };

  const handleDelete = (id: number) => {
    setTargets((prev) => prev.filter((t) => t.id !== id));
  };

  const dropdownStyle: React.CSSProperties = {
    fontWeight: 400,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238b8b9e' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 12px center",
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Edit Mode Bar */}
      {isEditing && (
        <div className="flex items-center justify-between bg-[#f3f0ff] rounded-xl border border-[#7c3aed]/20 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <Edit size={13} className="text-[#7c3aed]" />
            <span className="text-[12px] text-[#7c3aed]" style={{ fontWeight: 600 }}>Edit Mode</span>
            <span className="text-[11px] text-[#8b8b9e]" style={{ fontWeight: 400 }}>Add, edit, or remove product line targets.</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onCancel} className="px-3 py-1.5 text-[12px] text-[#4a4a5a] border border-[#e8e8ec] rounded-md hover:bg-white transition-colors cursor-pointer bg-white" style={{ fontWeight: 500 }}>Cancel</button>
            <button onClick={onSave} className="px-4 py-1.5 text-[12px] text-white bg-[#7c3aed] rounded-md hover:bg-[#6d28d9] transition-colors cursor-pointer" style={{ fontWeight: 600 }}>Save Changes</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-[#e8e8ec]">
        <div className="p-5">
          {/* Rows */}
          <div className="flex flex-col gap-5">
            {targets.length === 0 && !isEditing && (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <div className="w-12 h-12 rounded-full bg-[#f3f0ff] flex items-center justify-center">
                  <Target size={20} className="text-[#7c3aed]" />
                </div>
                <div className="text-center">
                  <div className="text-[14px] text-[#1a1a2e] mb-1" style={{ fontWeight: 600 }}>No Products Lines Targets Assigned</div>
                  <div className="text-[12px] text-[#8b8b9e]" style={{ fontWeight: 400 }}>Click "Edit Client" to add product line targets for this client.</div>
                </div>
              </div>
            )}
            {targets.map((target) => (
              <div key={target.id} className="flex items-end gap-4">
                <div className="flex-1">
                  <label className="text-[13px] text-[#1a1a2e] mb-1.5 block" style={{ fontWeight: 600 }}>Product Lines</label>
                  {isEditing ? (
                    <select
                      value={target.productLine}
                      onChange={(e) => handleUpdate(target.id, "productLine", e.target.value)}
                      className="w-full px-3 py-2.5 text-[13px] text-[#1a1a2e] bg-white rounded-md border border-[#d0d0de] outline-none focus:border-[#7c3aed] transition-colors cursor-pointer appearance-none"
                      style={dropdownStyle}
                    >
                      <option value="">Select Line</option>
                      {productLineOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <div className="w-full px-3 py-2.5 text-[13px] text-[#1a1a2e] bg-[#f8f8fa] rounded-md border border-[#e8e8ec]" style={{ fontWeight: 400 }}>
                      {target.productLine || <span className="text-[#b0b0be]">—</span>}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <label className="text-[13px] text-[#1a1a2e] mb-1.5 block" style={{ fontWeight: 600 }}>Classification</label>
                  {isEditing ? (
                    <select
                      value={target.classification}
                      onChange={(e) => handleUpdate(target.id, "classification", e.target.value)}
                      className="w-full px-3 py-2.5 text-[13px] text-[#1a1a2e] bg-white rounded-md border border-[#d0d0de] outline-none focus:border-[#7c3aed] transition-colors cursor-pointer appearance-none"
                      style={dropdownStyle}
                    >
                      <option value="">Select Classification</option>
                      {classificationOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <div className="w-full px-3 py-2.5 text-[13px] text-[#1a1a2e] bg-[#f8f8fa] rounded-md border border-[#e8e8ec]" style={{ fontWeight: 400 }}>
                      {target.classification || <span className="text-[#b0b0be]">—</span>}
                    </div>
                  )}
                </div>
                {isEditing && (
                  <div className="pb-0.5">
                    <button onClick={() => handleDelete(target.id)} className="px-4 py-2.5 text-[13px] text-white bg-[#dc2626] rounded-md hover:bg-[#b91c1c] transition-colors cursor-pointer" style={{ fontWeight: 600 }}>Delete</button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add button — only in edit mode */}
          {isEditing && (
            <div className="flex justify-end mt-4">
              <button onClick={handleAddNew} className="px-5 py-2.5 text-[13px] text-white bg-[#16a34a] rounded-md hover:bg-[#15803d] transition-colors cursor-pointer" style={{ fontWeight: 600 }}>
                Add Product Line Target
              </button>
            </div>
          )}
        </div>

        {/* Footer: Total + Pagination */}
        <div className="flex items-center gap-6 px-5 py-3 border-t border-[#e8e8ec]">
          <div className="flex items-center gap-1">
            <span className="text-[13px] text-[#1a1a2e]" style={{ fontWeight: 600 }}>Total:</span>
            <span className="text-[13px] text-[#dc2626]" style={{ fontWeight: 600 }}>{targets.length}</span>
            <span className="text-[13px] text-[#1a1a2e]" style={{ fontWeight: 600 }}>results.</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-[13px] text-[#8b8b9e] hover:text-[#4a4a5a] transition-colors cursor-pointer" style={{ fontWeight: 500 }}>&lt;</button>
            <span className="text-[13px] text-[#7c3aed]" style={{ fontWeight: 600 }}>{page}</span>
            <button className="text-[13px] text-[#8b8b9e] hover:text-[#4a4a5a] transition-colors cursor-pointer" style={{ fontWeight: 500 }}>&gt;</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================
   SUB-TAB: Specific Sales Settings
   ========================================= */
interface PrintSettingsForm {
  nameOnInvoice: string;
  footer: string;
  salesOrderTitle: string;
  salesOrderLocalTitle: string;
  invoiceTitle: string;
  invoiceLocalTitle: string;
  returnInvoiceTitle: string;
  returnInvoiceLocalTitle: string;
  addressOne: string;
  addressTwo: string;
}

const defaultPrintSettings: PrintSettingsForm = {
  nameOnInvoice: "",
  footer: "",
  salesOrderTitle: "",
  salesOrderLocalTitle: "",
  invoiceTitle: "",
  invoiceLocalTitle: "",
  returnInvoiceTitle: "",
  returnInvoiceLocalTitle: "",
  addressOne: "",
  addressTwo: "",
};

function PrintField({ label, value, editValue, isEditing, onChange, onReset }: {
  label: string; value: string; editValue: string; isEditing: boolean;
  onChange: (v: string) => void; onReset: () => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[12px] text-[#1a1a2e]" style={{ fontWeight: 600 }}>{label}:</label>
      {isEditing ? (
        <>
          <input
            type="text"
            value={editValue}
            onChange={(e) => onChange(e.target.value)}
            placeholder={label}
            className="w-full px-3 py-2 text-[13px] text-[#1a1a2e] bg-white rounded-md border border-[#d0d0de] outline-none focus:border-[#7c3aed] transition-colors placeholder:text-[#b0b0be]"
            style={{ fontWeight: 400 }}
          />
          <button onClick={onReset} className="self-start text-[11px] text-[#7c3aed] hover:text-[#6d28d9] cursor-pointer" style={{ fontWeight: 500 }}>Reset</button>
        </>
      ) : (
        <div className="w-full px-3 py-2 text-[13px] text-[#1a1a2e] bg-[#f8f8fa] rounded-md border border-[#e8e8ec] min-h-[38px]" style={{ fontWeight: 400 }}>
          {value || <span className="text-[#b0b0be]">—</span>}
        </div>
      )}
    </div>
  );
}

function SpecificSalesSettingsSubTab({ client, isEditing, onSave, onCancel }: { client: Client; isEditing: boolean; onSave: () => void; onCancel: () => void }) {
  const [form, setForm] = useState<PrintSettingsForm>({ ...defaultPrintSettings });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const update = (key: keyof PrintSettingsForm, val: string) => setForm((f) => ({ ...f, [key]: val }));
  const reset = (key: keyof PrintSettingsForm) => setForm((f) => ({ ...f, [key]: "" }));

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Edit Mode Bar */}
      {isEditing && (
        <div className="flex items-center justify-between bg-[#f3f0ff] rounded-xl border border-[#7c3aed]/20 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <Edit size={13} className="text-[#7c3aed]" />
            <span className="text-[12px] text-[#7c3aed]" style={{ fontWeight: 600 }}>Edit Mode</span>
            <span className="text-[11px] text-[#8b8b9e]" style={{ fontWeight: 400 }}>Configure client print &amp; invoice settings.</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onCancel} className="px-3 py-1.5 text-[12px] text-[#4a4a5a] border border-[#e8e8ec] rounded-md hover:bg-white transition-colors cursor-pointer bg-white" style={{ fontWeight: 500 }}>Cancel</button>
            <button onClick={onSave} className="px-4 py-1.5 text-[12px] text-white bg-[#7c3aed] rounded-md hover:bg-[#6d28d9] transition-colors cursor-pointer" style={{ fontWeight: 600 }}>Save Changes</button>
          </div>
        </div>
      )}

      {/* Company Info */}
      <SectionCard icon={Building2} title="Company Info" iconBg="bg-[#f3f0ff]" iconColor="text-[#7c3aed]">
        <div className="flex gap-6">
          {/* Logo Upload */}
          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            <label className="text-[12px] text-[#1a1a2e]" style={{ fontWeight: 600 }}>Company Logo</label>
            <div className="w-[140px] h-[140px] rounded-xl border-2 border-dashed border-[#d0d0de] bg-[#f8f8fa] flex items-center justify-center overflow-hidden relative group">
              {logoPreview ? (
                <>
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-2" />
                  {isEditing && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button onClick={() => fileInputRef.current?.click()} className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center cursor-pointer hover:bg-white transition-colors">
                        <Upload size={13} className="text-[#7c3aed]" />
                      </button>
                      <button onClick={removeLogo} className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center cursor-pointer hover:bg-white transition-colors">
                        <Trash2 size={13} className="text-[#dc2626]" />
                      </button>
                    </div>
                  )}
                </>
              ) : isEditing ? (
                <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-1.5 cursor-pointer text-center p-2">
                  <div className="w-10 h-10 rounded-full bg-[#f3f0ff] flex items-center justify-center">
                    <Camera size={16} className="text-[#7c3aed]" />
                  </div>
                  <span className="text-[10px] text-[#8b8b9e]" style={{ fontWeight: 500 }}>Upload Logo</span>
                </button>
              ) : (
                <div className="flex flex-col items-center gap-1.5 text-center p-2">
                  <div className="w-10 h-10 rounded-full bg-[#f3f0ff] flex items-center justify-center">
                    <Building2 size={16} className="text-[#d0d0de]" />
                  </div>
                  <span className="text-[10px] text-[#b0b0be]" style={{ fontWeight: 500 }}>No logo</span>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            {isEditing && logoPreview && (
              <button onClick={removeLogo} className="text-[11px] text-[#dc2626] hover:text-[#b91c1c] cursor-pointer" style={{ fontWeight: 500 }}>Remove</button>
            )}
          </div>

          {/* Fields grid */}
          <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-4">
            <PrintField label="Company Legal Name" value={form.nameOnInvoice} editValue={form.nameOnInvoice} isEditing={isEditing} onChange={(v) => update("nameOnInvoice", v)} onReset={() => reset("nameOnInvoice")} />
            <PrintField label="Footer" value={form.footer} editValue={form.footer} isEditing={isEditing} onChange={(v) => update("footer", v)} onReset={() => reset("footer")} />
            <PrintField label="Address One" value={form.addressOne} editValue={form.addressOne} isEditing={isEditing} onChange={(v) => update("addressOne", v)} onReset={() => reset("addressOne")} />
            <PrintField label="Address Two" value={form.addressTwo} editValue={form.addressTwo} isEditing={isEditing} onChange={(v) => update("addressTwo", v)} onReset={() => reset("addressTwo")} />
          </div>
        </div>
      </SectionCard>

      {/* Document Titles */}
      <SectionCard icon={FileText} title="Documents Title" iconBg="bg-[#eff6ff]" iconColor="text-[#3b82f6]">
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <PrintField label="Sales Order Title" value={form.salesOrderTitle} editValue={form.salesOrderTitle} isEditing={isEditing} onChange={(v) => update("salesOrderTitle", v)} onReset={() => reset("salesOrderTitle")} />
          <PrintField label="Sales Order Local Title" value={form.salesOrderLocalTitle} editValue={form.salesOrderLocalTitle} isEditing={isEditing} onChange={(v) => update("salesOrderLocalTitle", v)} onReset={() => reset("salesOrderLocalTitle")} />
          <PrintField label="Invoice Title" value={form.invoiceTitle} editValue={form.invoiceTitle} isEditing={isEditing} onChange={(v) => update("invoiceTitle", v)} onReset={() => reset("invoiceTitle")} />
          <PrintField label="Invoice Local Title" value={form.invoiceLocalTitle} editValue={form.invoiceLocalTitle} isEditing={isEditing} onChange={(v) => update("invoiceLocalTitle", v)} onReset={() => reset("invoiceLocalTitle")} />
          <PrintField label="Return Invoice Title" value={form.returnInvoiceTitle} editValue={form.returnInvoiceTitle} isEditing={isEditing} onChange={(v) => update("returnInvoiceTitle", v)} onReset={() => reset("returnInvoiceTitle")} />
          <PrintField label="Return Invoice Local Title" value={form.returnInvoiceLocalTitle} editValue={form.returnInvoiceLocalTitle} isEditing={isEditing} onChange={(v) => update("returnInvoiceLocalTitle", v)} onReset={() => reset("returnInvoiceLocalTitle")} />
        </div>
      </SectionCard>
    </div>
  );
}

/* =========================================
   TAB: Geographical
   ========================================= */
function GeographicalTab({ client }: { client: Client }) {
  const lat = client.address ? "31.989924" : "";
  const lng = client.address ? "35.8515353" : "";
  const streetAddress = client.address || "XVQ2+XJ Amman, Jordan";
  const city = client.address ? client.address.split(",")[0]?.trim() || "Amman" : "Amman";
  const country = "Jordan";
  const region = client.address ? "Amman Governorate" : "Amman Governorate";
  const [verified, setVerified] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const mapLat = lat || "31.989924";
  const mapLng = lng || "35.8515353";
  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };
  const hasLocation = !!lat && !!lng;

  return (
    <div className="flex flex-col gap-5">
      <div className="relative w-full rounded-xl overflow-hidden border border-[#e8e8ec] shadow-sm" style={{ height: "280px" }}>
        <iframe title="Client Location" width="100%" height="100%" style={{ border: 0 }} loading="lazy" referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps?q=${mapLat},${mapLng}&z=14&output=embed`} />
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <button onClick={() => window.open(`https://www.google.com/maps?q=${mapLat},${mapLng}`, "_blank")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/95 backdrop-blur-sm rounded-lg shadow-md border border-white/60 text-[11px] text-[#4a4a5a] hover:bg-white transition-colors cursor-pointer" style={{ fontWeight: 500 }}>
            <Navigation size={11} />Open in Maps
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-4 pb-3 pt-8">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/15 backdrop-blur-md rounded-md border border-white/20">
              <MapPin size={11} className="text-white/80" />
              <span className="text-[11px] text-white/90 font-mono" style={{ fontWeight: 500 }}>{mapLat}</span>
              <span className="text-white/40 text-[10px]">,</span>
              <span className="text-[11px] text-white/90 font-mono" style={{ fontWeight: 500 }}>{mapLng}</span>
              <button onClick={() => handleCopy(`${mapLat}, ${mapLng}`, "coords")} className="ml-1 p-0.5 text-white/60 hover:text-white transition-colors cursor-pointer">
                {copiedField === "coords" ? <Check size={10} /> : <Copy size={10} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <SectionCard icon={Map} title="Coordinates">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="text-[10px] text-[#8b8b9e] uppercase tracking-wider whitespace-nowrap" style={{ fontWeight: 500 }}>Latitude</div>
              <div className="text-[13px] text-[#1a1a2e] font-mono" style={{ fontWeight: 500 }}>{lat || "---"}</div>
              {lat && <button onClick={() => handleCopy(lat, "lat")} className="p-1 rounded-md text-[#8b8b9e] hover:text-[#7c3aed] hover:bg-[#f3f0ff] transition-colors cursor-pointer">
                {copiedField === "lat" ? <Check size={12} className="text-[#22c55e]" /> : <Copy size={12} />}
              </button>}
            </div>
            <div className="w-px h-5 bg-[#e8e8ec] shrink-0" />
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="text-[10px] text-[#8b8b9e] uppercase tracking-wider whitespace-nowrap" style={{ fontWeight: 500 }}>Longitude</div>
              <div className="text-[13px] text-[#1a1a2e] font-mono" style={{ fontWeight: 500 }}>{lng || "---"}</div>
              {lng && <button onClick={() => handleCopy(lng, "lng")} className="p-1 rounded-md text-[#8b8b9e] hover:text-[#7c3aed] hover:bg-[#f3f0ff] transition-colors cursor-pointer">
                {copiedField === "lng" ? <Check size={12} className="text-[#22c55e]" /> : <Copy size={12} />}
              </button>}
            </div>
          </div>
        </SectionCard>

        <SectionCard icon={verified ? ShieldCheck : ShieldX} title="Verification"
          iconBg={verified ? "bg-[#dcfce7]" : "bg-[#fef2f2]"} iconColor={verified ? "text-[#22c55e]" : "text-[#ef4444]"}>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 min-w-0">
              <div className="text-[10px] text-[#8b8b9e] uppercase tracking-wider whitespace-nowrap" style={{ fontWeight: 500 }}>Status</div>
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] whitespace-nowrap ${verified ? "bg-[#dcfce7] text-[#16a34a]" : "bg-[#fef2f2] text-[#ef4444]"}`} style={{ fontWeight: 600 }}>
                <span className={`w-1.5 h-1.5 rounded-full ${verified ? "bg-[#22c55e]" : "bg-[#ef4444]"}`} />
                {verified ? "Verified" : "Unverified"}
              </span>
            </div>
            <div className="w-px h-5 bg-[#e8e8ec] shrink-0" />
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-[12px] text-[#4a4a5a] whitespace-nowrap" style={{ fontWeight: 500 }}>Location Verified</span>
              <button onClick={() => setVerified(!verified)}
                className={`relative w-9 h-5 rounded-full transition-colors duration-200 cursor-pointer shrink-0 ${verified ? "bg-[#7c3aed]" : "bg-[#d1d5db]"}`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${verified ? "left-[18px]" : "left-0.5"}`} />
              </button>
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard icon={Building2} title="Address Details" iconBg="bg-[#eff6ff]" iconColor="text-[#3b82f6]"
        badge={hasLocation ? (
          <button onClick={() => handleCopy(`${streetAddress}, ${city}, ${region}, ${country}`, "address")}
            className="flex items-center gap-1 px-2 py-1 text-[11px] text-[#8b8b9e] hover:text-[#7c3aed] hover:bg-[#f3f0ff] rounded-md transition-colors cursor-pointer" style={{ fontWeight: 500 }}>
            {copiedField === "address" ? <><Check size={10} className="text-[#22c55e]" /> Copied</> : <><Copy size={10} /> Copy Address</>}
          </button>
        ) : undefined}
      >
        <div className="grid grid-cols-4 gap-3">
          <ViewField label="Street Address" value={streetAddress || <span className="text-[#d0d0de] italic">Not set</span>} />
          <ViewField label="City" value={city || <span className="text-[#d0d0de] italic">Not set</span>} />
          <ViewField label="Country" value={country} />
          <ViewField label="Region" value={region || <span className="text-[#d0d0de] italic">Not set</span>} />
        </div>
      </SectionCard>
    </div>
  );
}

/* =========================================
   SALES REPORT TAB
   ========================================= */
const salesReportSubTabs = ["Pre Sales Orders", "Invoices", "Payments", "Refunds"] as const;
type SalesReportSubTab = typeof salesReportSubTabs[number];

interface SalesOrderRow {
  serialNumber: string;
  issueDate: string;
  creator: string;
  status: "Pending" | "Processing" | "Approved" | "Rejected";
  total: string;
}

function generateSalesData(tab: SalesReportSubTab): SalesOrderRow[] {
  if (tab === "Pre Sales Orders") {
    return [
      { serialNumber: "PRO-ADM-2162", issueDate: "2026-02-26", creator: "Maram Alshen", status: "Pending", total: "12.00 JOD" },
      { serialNumber: "PRO-ADM-2161", issueDate: "2026-02-26", creator: "Maram Alshen", status: "Pending", total: "12.00 JOD" },
      { serialNumber: "PRO-ADM-2160", issueDate: "2026-02-26", creator: "Maram Alshen", status: "Pending", total: "12.00 JOD" },
      { serialNumber: "PRO-ADM-2159", issueDate: "2026-02-26", creator: "Maram Alshen", status: "Pending", total: "12.00 JOD" },
      { serialNumber: "PRO-ADM-2158", issueDate: "2026-02-26", creator: "Maram Alshen", status: "Pending", total: "12.00 JOD" },
      { serialNumber: "PRO-ADM-2157", issueDate: "2026-02-26", creator: "Maram Alshen", status: "Pending", total: "12.00 JOD" },
      { serialNumber: "PRO-ADM-2156", issueDate: "2026-02-26", creator: "Maram Alshen", status: "Processing", total: "12.00 JOD" },
      { serialNumber: "PRO-1556-128", issueDate: "2026-02-25", creator: "Ahmad Abudraya", status: "Pending", total: "9.75 JOD" },
      { serialNumber: "PRO-ADM-2153", issueDate: "2026-02-25", creator: "Maram Alshen", status: "Approved", total: "87.48 JOD" },
      { serialNumber: "PRO-ADM-2148", issueDate: "2026-02-25", creator: "Maram Alshen", status: "Pending", total: "519.36 JOD" },
    ];
  }
  if (tab === "Invoices") {
    return [
      { serialNumber: "INV-ADM-1084", issueDate: "2026-02-25", creator: "Maram Alshen", status: "Approved", total: "87.48 JOD" },
      { serialNumber: "INV-ADM-1083", issueDate: "2026-02-24", creator: "Maram Alshen", status: "Approved", total: "245.00 JOD" },
      { serialNumber: "INV-ADM-1079", issueDate: "2026-02-20", creator: "Ahmad Abudraya", status: "Pending", total: "32.50 JOD" },
      { serialNumber: "INV-1556-042", issueDate: "2026-02-18", creator: "Ahmad Abudraya", status: "Approved", total: "156.75 JOD" },
    ];
  }
  if (tab === "Payments") {
    return [
      { serialNumber: "PAY-ADM-0512", issueDate: "2026-02-25", creator: "Maram Alshen", status: "Approved", total: "87.48 JOD" },
      { serialNumber: "PAY-ADM-0508", issueDate: "2026-02-20", creator: "Maram Alshen", status: "Approved", total: "245.00 JOD" },
    ];
  }
  // Refunds
  return [
    { serialNumber: "REF-ADM-0023", issueDate: "2026-02-22", creator: "Maram Alshen", status: "Pending", total: "12.00 JOD" },
  ];
}

const STATUS_STYLES: Record<SalesOrderRow["status"], string> = {
  Pending: "text-[#f59e0b]",
  Processing: "text-[#3b82f6]",
  Approved: "text-[#22c55e]",
  Rejected: "text-[#ef4444]",
};

function SalesReportTab({ client }: { client: Client }) {
  const [activeSubTab, setActiveSubTab] = useState<SalesReportSubTab>("Pre Sales Orders");
  const [dateFrom, setDateFrom] = useState("2026-01-31");
  const [dateTo, setDateTo] = useState("2026-03-02");
  const [currentPage, setCurrentPage] = useState(1);

  const rows = generateSalesData(activeSubTab);
  const totalResults = rows.length;
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));
  const pagedRows = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Reset page when switching tabs
  useEffect(() => { setCurrentPage(1); }, [activeSubTab]);

  return (
    <div className="flex flex-col gap-0">
      {/* Sub-tabs row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1.5">
          {salesReportSubTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`px-3 py-1 text-[12px] rounded-full border transition-colors cursor-pointer ${
                activeSubTab === tab
                  ? "bg-white text-[#1a1a2e] border-[#1a1a2e]"
                  : "text-[#4a4a5a] border-[#e8e8ec] hover:bg-[#f5f5f7]"
              }`}
              style={{ fontWeight: 500 }}
            >{tab}</button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {/* Date Range */}
          <div className="flex items-center gap-2 text-[12px] text-[#4a4a5a]" style={{ fontWeight: 400 }}>
            <span className="text-[#8b8b9e]" style={{ fontWeight: 500 }}>Date</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-2 py-1 border border-[#e8e8ec] rounded-md text-[12px] text-[#4a4a5a] bg-white outline-none focus:border-[#7c3aed]"
            />
            <span className="text-[#b0b0be]">→</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-2 py-1 border border-[#e8e8ec] rounded-md text-[12px] text-[#4a4a5a] bg-white outline-none focus:border-[#7c3aed]"
            />
          </div>
          <button className="text-[12px] text-[#7c3aed] hover:underline cursor-pointer" style={{ fontWeight: 500 }}>
            Full Summary
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="border border-[#e8e8ec] rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#e8e8ec] bg-[#fafafa]">
              <th className="px-4 py-2.5 text-[11px] text-[#8b8b9e] uppercase tracking-wider" style={{ fontWeight: 600 }}>Serial Number</th>
              <th className="px-4 py-2.5 text-[11px] text-[#8b8b9e] uppercase tracking-wider" style={{ fontWeight: 600 }}>Issue Date</th>
              <th className="px-4 py-2.5 text-[11px] text-[#8b8b9e] uppercase tracking-wider" style={{ fontWeight: 600 }}>Creator</th>
              <th className="px-4 py-2.5 text-[11px] text-[#8b8b9e] uppercase tracking-wider" style={{ fontWeight: 600 }}>Status</th>
              <th className="px-4 py-2.5 text-[11px] text-[#8b8b9e] uppercase tracking-wider text-right" style={{ fontWeight: 600 }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {pagedRows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-[13px] text-[#b0b0be]" style={{ fontWeight: 400 }}>
                  No records found for this period.
                </td>
              </tr>
            ) : (
              pagedRows.map((row) => (
                <tr key={row.serialNumber} className="border-b border-[#f0f0f3] last:border-b-0 hover:bg-[#fafafa] transition-colors">
                  <td className="px-4 py-2.5">
                    <button className="text-[13px] text-[#7c3aed] hover:underline cursor-pointer" style={{ fontWeight: 500 }}>
                      {row.serialNumber}
                    </button>
                  </td>
                  <td className="px-4 py-2.5 text-[13px] text-[#4a4a5a]" style={{ fontWeight: 400 }}>{row.issueDate}</td>
                  <td className="px-4 py-2.5 text-[13px] text-[#4a4a5a]" style={{ fontWeight: 400 }}>{row.creator}</td>
                  <td className="px-4 py-2.5">
                    <span className={`text-[13px] ${STATUS_STYLES[row.status]}`} style={{ fontWeight: 500 }}>{row.status}</span>
                  </td>
                  <td className="px-4 py-2.5 text-[13px] text-[#4a4a5a] text-right" style={{ fontWeight: 500 }}>{row.total}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center gap-3 mt-4">
        <span className="text-[12px] text-[#4a4a5a]" style={{ fontWeight: 500 }}>
          Total: {totalResults} results.
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-7 h-7 flex items-center justify-center rounded-md border border-[#e8e8ec] text-[#8b8b9e] hover:bg-[#f5f5f7] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            <ChevronLeft size={13} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-7 h-7 flex items-center justify-center rounded-md text-[12px] transition-colors cursor-pointer ${
                currentPage === page
                  ? "border border-[#7c3aed] text-[#7c3aed] bg-white"
                  : "border border-[#e8e8ec] text-[#4a4a5a] hover:bg-[#f5f5f7]"
              }`}
              style={{ fontWeight: currentPage === page ? 600 : 400 }}
            >{page}</button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="w-7 h-7 flex items-center justify-center rounded-md border border-[#e8e8ec] text-[#8b8b9e] hover:bg-[#f5f5f7] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
