import React, { useState } from "react";
import {
  X, User, UserCheck, Tag, Package, Settings, Camera, MapPin,
  DollarSign, CreditCard, Clock, BarChart3, Phone, Smartphone,
  Mail, Globe, Building2, Map, ShieldCheck, ShieldX, Calendar,
  Hash, FileText, Target, Copy, Check,
  Navigation, ChevronDown, ChevronUp,
  Type, ListChecks, CalendarDays, ToggleLeft,
  ArrowLeft, Printer, Activity,
  TrendingUp, Layers, Zap, Pencil, Save, XCircle, ChevronRight
} from "lucide-react";
import type { Client, CustomField, CustomFieldType } from "./clientData";
import { generateCustomFields, CUSTOM_FIELD_TYPES } from "./clientData";
import { ImageWithFallback } from "../figma/ImageWithFallback";

const mediaImages = [
  "https://images.unsplash.com/photo-1761005653827-9cd95fa1faee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJvbmljcyUyMHByb2R1Y3QlMjBjbG9zZSUyMHVwfGVufDF8fHx8MTc3MTkxNjM1MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  "https://images.unsplash.com/flagged/photo-1576697011479-349e2a52bdf6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXB0b3AlMjBrZXlib2FyZCUyMHdvcmtzcGFjZXxlbnwxfHx8fDE3NzE5MTYzNTJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  "https://images.unsplash.com/photo-1738013997874-363f8e3832ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBwaG9uZSUyMHRlY2hub2xvZ3l8ZW58MXx8fHwxNzcxODEwODA1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
];

interface ClientTableDetailProps {
  client: Client;
  onClose: () => void;
}

/* =========================================
   PRIMITIVES
   ========================================= */
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

function SalesBoolBadge({ value }: { value: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] ${value ? "bg-[#dcfce7] text-[#16a34a]" : "bg-[#f5f5f7] text-[#8b8b9e]"}`} style={{ fontWeight: 600 }}>
      <span className={`w-1.5 h-1.5 rounded-full ${value ? "bg-[#16a34a]" : "bg-[#d1d5db]"}`} />
      {value ? "Yes" : "No"}
    </span>
  );
}

function SectionDivider({ icon: Icon, title, iconBg, iconColor, badge, onEdit, isEditing, onSave, onCancel }: {
  icon: React.ElementType; title: string; iconBg?: string; iconColor?: string; badge?: React.ReactNode;
  onEdit?: () => void; isEditing?: boolean; onSave?: () => void; onCancel?: () => void;
}) {
  if (isEditing) {
    return (
      <div className="flex items-center gap-2.5 px-3 py-2 -mx-3.5 -mt-3.5 mb-2 bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] rounded-t-xl">
        <div className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center flex-shrink-0">
          <Pencil size={11} className="text-white" />
        </div>
        <span className="text-[12px] text-white flex-1" style={{ fontWeight: 600 }}>Editing {title}</span>
        <button onClick={onCancel} className="flex items-center gap-1 px-2.5 py-1 bg-white/15 hover:bg-white/25 text-white text-[11px] rounded-md transition-colors cursor-pointer" style={{ fontWeight: 500 }}>
          <XCircle size={11} /> Cancel
        </button>
        <button onClick={onSave} className="flex items-center gap-1 px-2.5 py-1 bg-white text-[#7c3aed] text-[11px] rounded-md hover:bg-white/90 transition-colors cursor-pointer" style={{ fontWeight: 600 }}>
          <Save size={11} /> Save
        </button>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2.5 pt-1 pb-1 group/section">
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg || "bg-[#f3f0ff]"}`}>
        <Icon size={13} className={iconColor || "text-[#7c3aed]"} />
      </div>
      <span className="text-[12px] text-[#1a1a2e]" style={{ fontWeight: 600 }}>{title}</span>
      <div className="flex-1 h-px bg-[#e8e8ec]" />
      {badge && <div className="flex-shrink-0">{badge}</div>}
      {onEdit && (
        <button
          onClick={onEdit}
          className="flex items-center gap-1 px-2 py-1 text-[10px] text-[#8b8b9e] hover:text-[#7c3aed] hover:bg-[#f3f0ff] rounded-md transition-all opacity-0 group-hover/section:opacity-100 cursor-pointer"
          style={{ fontWeight: 500 }}
        >
          <Pencil size={10} /> Edit
        </button>
      )}
    </div>
  );
}

function MiniCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-[#e8e8ec] p-3.5 ${className || ""}`}>
      {children}
    </div>
  );
}

/* =========================================
   Custom Fields helpers
   ========================================= */
const CF_TYPE_META: Record<CustomFieldType, { icon: React.ElementType; iconBg: string; iconColor: string }> = {
  Text:           { icon: Type,         iconBg: "bg-[#f3f0ff]", iconColor: "text-[#7c3aed]" },
  Number:         { icon: Hash,         iconBg: "bg-[#eff6ff]", iconColor: "text-[#3b82f6]" },
  Dropdown:       { icon: ChevronDown,  iconBg: "bg-[#fef3c7]", iconColor: "text-[#f59e0b]" },
  Date:           { icon: CalendarDays, iconBg: "bg-[#dcfce7]", iconColor: "text-[#22c55e]" },
  Boolean:        { icon: ToggleLeft,   iconBg: "bg-[#fce7f3]", iconColor: "text-[#ec4899]" },
  "Multi-Select": { icon: ListChecks,   iconBg: "bg-[#e0f2fe]", iconColor: "text-[#0ea5e9]" },
};

function renderFieldValue(field: CustomField) {
  if (!field.value) return <span className="text-[#d0d0de] italic" style={{ fontWeight: 400 }}>Not set</span>;
  if (field.type === "Boolean") {
    const isTrue = field.value === "true";
    return <SalesBoolBadge value={isTrue} />;
  }
  if (field.type === "Multi-Select") {
    const chips = field.value.split(",").map(s => s.trim()).filter(Boolean);
    return (
      <div className="flex flex-wrap gap-1">
        {chips.map(c => (
          <span key={c} className="inline-flex items-center px-2 py-0.5 bg-[#f0f4ff] text-[#3b82f6] text-[10px] rounded-full" style={{ fontWeight: 500 }}>{c}</span>
        ))}
      </div>
    );
  }
  if (field.type === "Date") {
    try {
      return <span className="text-[12px] text-[#1a1a2e]" style={{ fontWeight: 500 }}>{new Date(field.value).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>;
    } catch { /* fall through */ }
  }
  return <span className="text-[12px] text-[#1a1a2e]" style={{ fontWeight: 500 }}>{field.value}</span>;
}

/* =========================================
   MAIN COMPONENT — single scrollable page
   ========================================= */
export function ClientTableDetail({ client, onClose }: ClientTableDetailProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [customFields] = useState<CustomField[]>(() => generateCustomFields());
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const startEdit = (section: string) => setEditingSection(section);
  const cancelEdit = () => setEditingSection(null);
  const saveEdit = () => {
    // TODO: wire to persistence
    setEditingSection(null);
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const toggleSection = (id: string) => {
    setCollapsedSections(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const pt = client.paymentType ?? "Cash Only";
  const cl = client.creditLimit ?? 0;
  const balance = client.integratedClientBalance ?? 0;
  const tbl = client.transactionBalanceLimit ?? 0;
  const gp = client.gracePeriodAfterDueDate ?? 0;
  const creditUtilization = cl > 0 ? Math.min((balance / cl) * 100, 100) : 0;
  const isOverLimit = balance > cl;
  const lat = client.address ? "31.989924" : "";
  const lng = client.address ? "35.8515353" : "";
  const mapLat = lat || "31.989924";
  const mapLng = lng || "35.8515353";

  const grouped = CUSTOM_FIELD_TYPES.map(type => ({
    type,
    fields: customFields.filter(f => f.type === type),
  })).filter(g => g.fields.length > 0);

  function isRecent(dateStr: string): boolean {
    try {
      const d = new Date(dateStr.replace(", ", "T").replace(" AM", "").replace(" PM", ""));
      const now = new Date("2026-02-24");
      return (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24) < 30;
    } catch { return false; }
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-white rounded-xl border border-[#e8e8ec] overflow-hidden">
      {/* ── HEADER ── */}
      <div className="flex-shrink-0 bg-gradient-to-r from-[#f8f6ff] via-white to-[#f0f8ff] border-b border-[#e8e8ec]">
        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-1.5 text-[#8b8b9e] hover:text-[#4a4a5a] hover:bg-white/80 rounded-lg transition-colors cursor-pointer">
              <ArrowLeft size={16} />
            </button>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#3b82f6] flex items-center justify-center shadow-sm">
              <span className="text-white text-[13px]" style={{ fontWeight: 700 }}>{client.name.slice(0, 2).toUpperCase()}</span>
            </div>
            <div>
              <h2 className="text-[16px] text-[#1a1a2e] flex items-center gap-2" style={{ fontWeight: 600 }}>
                {client.name}
                {client.isChain && (
                  <span className="px-1.5 py-[1px] bg-[#f3f0ff] text-[#7c3aed] text-[9px] rounded-full" style={{ fontWeight: 700 }}>CHAIN</span>
                )}
              </h2>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-[11px] text-[#8b8b9e]" style={{ fontWeight: 400 }}>{client.clientCode}</span>
                <span className="w-1 h-1 rounded-full bg-[#d0d0de]" />
                <span className="text-[11px] text-[#8b8b9e]" style={{ fontWeight: 400 }}>{client.clientChannel || "—"}</span>
                <span className="w-1 h-1 rounded-full bg-[#d0d0de]" />
                <span className="text-[11px] text-[#8b8b9e]" style={{ fontWeight: 400 }}>{client.assignedTo || "Unassigned"}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-[#8b8b9e] hover:text-[#4a4a5a] hover:bg-white/80 rounded-lg transition-colors cursor-pointer">
            <X size={16} />
          </button>
        </div>

        {/* ── STAT RIBBON ── */}
        <div className="flex items-stretch gap-0 px-5 pb-3">
          {[
            { label: "Balance", value: `$${balance.toLocaleString()}`, color: isOverLimit ? "text-[#ef4444]" : "text-[#1a1a2e]", icon: DollarSign, iconBg: isOverLimit ? "bg-[#fef2f2]" : "bg-[#f3f0ff]", iconClr: isOverLimit ? "text-[#ef4444]" : "text-[#7c3aed]" },
            { label: "Credit Limit", value: `$${cl.toLocaleString()}`, color: "text-[#1a1a2e]", icon: CreditCard, iconBg: "bg-[#dcfce7]", iconClr: "text-[#22c55e]" },
            { label: "Payment", value: pt, color: "text-[#1a1a2e]", icon: Zap, iconBg: pt === "Allow Credit" ? "bg-[#dcfce7]" : "bg-[#fef3c7]", iconClr: pt === "Allow Credit" ? "text-[#16a34a]" : "text-[#d97706]" },
            { label: "Price List", value: client.priceList || "—", color: "text-[#1a1a2e]", icon: Layers, iconBg: "bg-[#eff6ff]", iconClr: "text-[#3b82f6]" },
            { label: "Payment Term", value: client.paymentTerm || "—", color: "text-[#1a1a2e]", icon: Clock, iconBg: "bg-[#fef3c7]", iconClr: "text-[#f59e0b]" },
          ].map((stat, i) => (
            <div key={stat.label} className={`flex items-center gap-2.5 flex-1 px-3 py-2 ${i > 0 ? "border-l border-[#e8e8ec]" : ""}`}>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${stat.iconBg}`}>
                <stat.icon size={13} className={stat.iconClr} />
              </div>
              <div className="min-w-0">
                <div className="text-[9px] text-[#8b8b9e] uppercase tracking-wider" style={{ fontWeight: 500 }}>{stat.label}</div>
                <div className={`text-[13px] truncate ${stat.color}`} style={{ fontWeight: 600 }}>{stat.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SCROLLABLE BODY ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid gap-5 p-5" style={{ gridTemplateColumns: "250px 1fr 270px" }}>

          {/* ============================================
              LEFT COLUMN — Profile, Contact, Location
              ============================================ */}
          <div className="flex flex-col gap-4">

            {/* Contact Card */}
            <MiniCard>
              <SectionDivider icon={Phone} title="Contact" iconBg="bg-[#dcfce7]" iconColor="text-[#22c55e]"
                onEdit={() => startEdit("contact")} isEditing={editingSection === "contact"} onSave={saveEdit} onCancel={cancelEdit}
              />
              <div className="flex flex-col gap-2.5 mt-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-md bg-[#f5f5f7] flex items-center justify-center"><User size={11} className="text-[#8b8b9e]" /></div>
                  <div className="min-w-0">
                    <div className="text-[10px] text-[#8b8b9e]" style={{ fontWeight: 500 }}>Name</div>
                    <div className="text-[12px] text-[#1a1a2e] truncate" style={{ fontWeight: 500 }}>{client.contactName || "—"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-md bg-[#f5f5f7] flex items-center justify-center"><Phone size={11} className="text-[#8b8b9e]" /></div>
                  <div className="min-w-0">
                    <div className="text-[10px] text-[#8b8b9e]" style={{ fontWeight: 500 }}>Phone</div>
                    <div className="text-[12px] text-[#1a1a2e] truncate" style={{ fontWeight: 500 }}>{client.phone || "—"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-md bg-[#f5f5f7] flex items-center justify-center"><Smartphone size={11} className="text-[#8b8b9e]" /></div>
                  <div className="min-w-0">
                    <div className="text-[10px] text-[#8b8b9e]" style={{ fontWeight: 500 }}>Cell</div>
                    <div className="text-[12px] text-[#1a1a2e] truncate" style={{ fontWeight: 500 }}>{client.cellPhone || "—"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-md bg-[#f5f5f7] flex items-center justify-center"><Mail size={11} className="text-[#8b8b9e]" /></div>
                  <div className="min-w-0">
                    <div className="text-[10px] text-[#8b8b9e]" style={{ fontWeight: 500 }}>Email</div>
                    {client.email ? (
                      <a href={`mailto:${client.email}`} className="text-[12px] text-[#3b82f6] hover:underline truncate block" style={{ fontWeight: 500 }}>{client.email}</a>
                    ) : (
                      <div className="text-[12px] text-[#b0b0be]" style={{ fontWeight: 400 }}>—</div>
                    )}
                  </div>
                </div>
                {client.website && (
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-md bg-[#f5f5f7] flex items-center justify-center"><Globe size={11} className="text-[#8b8b9e]" /></div>
                    <div className="min-w-0">
                      <div className="text-[10px] text-[#8b8b9e]" style={{ fontWeight: 500 }}>Website</div>
                      <a href={`https://${client.website}`} target="_blank" rel="noopener noreferrer" className="text-[12px] text-[#3b82f6] hover:underline truncate block" style={{ fontWeight: 500 }}>{client.website}</a>
                    </div>
                  </div>
                )}
              </div>
            </MiniCard>

            {/* Assignment */}
            {(!!client.assignedTo || !!client.teams) && (
              <MiniCard>
                <SectionDivider icon={UserCheck} title="Assignment" iconBg="bg-[#dcfce7]" iconColor="text-[#22c55e]"
                  onEdit={() => startEdit("assignment")} isEditing={editingSection === "assignment"} onSave={saveEdit} onCancel={cancelEdit}
                />
                <div className="flex flex-col gap-2.5 mt-3">
                  {client.assignedTo && (
                    <div className="flex items-center gap-2 px-2.5 py-2 bg-[#f8f9fb] rounded-lg">
                      <div className="w-6 h-6 rounded-full bg-[#f3f0ff] flex items-center justify-center"><User size={10} className="text-[#7c3aed]" /></div>
                      <div>
                        <div className="text-[9px] text-[#8b8b9e] uppercase" style={{ fontWeight: 500 }}>Rep</div>
                        <div className="text-[12px] text-[#1a1a2e]" style={{ fontWeight: 500 }}>{client.assignedTo}</div>
                      </div>
                    </div>
                  )}
                  {client.teams && (
                    <div className="flex items-center gap-2 px-2.5 py-2 bg-[#f8f9fb] rounded-lg">
                      <div className="w-6 h-6 rounded-full bg-[#eff6ff] flex items-center justify-center"><Layers size={10} className="text-[#3b82f6]" /></div>
                      <div>
                        <div className="text-[9px] text-[#8b8b9e] uppercase" style={{ fontWeight: 500 }}>Team</div>
                        <div className="text-[12px] text-[#1a1a2e]" style={{ fontWeight: 500 }}>{client.teams}</div>
                      </div>
                    </div>
                  )}
                </div>
              </MiniCard>
            )}

            {/* Location Mini Map */}
            <MiniCard className="!p-0 overflow-hidden">
              <div className="relative w-full" style={{ height: "140px" }}>
                <iframe title="Client Location" width="100%" height="100%" style={{ border: 0 }} loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps?q=${mapLat},${mapLng}&z=14&output=embed`} />
                <div className="absolute top-2 right-2">
                  <button onClick={() => window.open(`https://www.google.com/maps?q=${mapLat},${mapLng}`, "_blank")}
                    className="flex items-center gap-1 px-2 py-1 bg-white/95 backdrop-blur-sm rounded-md shadow-sm text-[10px] text-[#4a4a5a] hover:bg-white transition-colors cursor-pointer" style={{ fontWeight: 500 }}>
                    <Navigation size={9} />Maps
                  </button>
                </div>
              </div>
              <div className="px-3.5 py-3 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] text-[#8b8b9e] uppercase" style={{ fontWeight: 500 }}>Address</div>
                  <div className="flex items-center gap-1">
                    <ShieldCheck size={10} className="text-[#22c55e]" />
                    <span className="text-[9px] text-[#22c55e]" style={{ fontWeight: 600 }}>Verified</span>
                  </div>
                </div>
                <div className="text-[12px] text-[#1a1a2e]" style={{ fontWeight: 500 }}>{client.address || "XVQ2+XJ Amman, Jordan"}</div>
                <div className="flex items-center gap-3 text-[11px] text-[#8b8b9e]" style={{ fontWeight: 400 }}>
                  <span>{client.city || "Amman"}</span>
                  <span className="w-1 h-1 rounded-full bg-[#d0d0de]" />
                  <span>{client.country || "Jordan"}</span>
                </div>
                {lat && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-[10px] text-[#8b8b9e]">{mapLat}, {mapLng}</span>
                    <button onClick={() => handleCopy(`${mapLat}, ${mapLng}`, "coords")} className="p-0.5 text-[#b0b0be] hover:text-[#7c3aed] cursor-pointer">
                      {copiedField === "coords" ? <Check size={9} className="text-[#22c55e]" /> : <Copy size={9} />}
                    </button>
                  </div>
                )}
              </div>
            </MiniCard>

            {/* Media */}
            <MiniCard>
              <SectionDivider icon={Camera} title="Media" iconBg="bg-[#eff6ff]" iconColor="text-[#3b82f6]"
                onEdit={() => startEdit("media")} isEditing={editingSection === "media"} onSave={saveEdit} onCancel={cancelEdit}
                badge={<span className="text-[10px] text-[#8b8b9e]" style={{ fontWeight: 500 }}>{mediaImages.length} files</span>}
              />
              <div className="grid grid-cols-3 gap-1.5 mt-3">
                {mediaImages.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-[#e8e8ec] group cursor-pointer">
                    <ImageWithFallback src={img} alt={`Media ${i + 1}`} className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </div>
                ))}
              </div>
            </MiniCard>
          </div>

          {/* ============================================
              CENTER COLUMN — Main content
              ============================================ */}
          <div className="flex flex-col gap-4">

            {/* Identity & Description */}
            {client.description && (
              <MiniCard>
                <p className="text-[13px] text-[#4a4a5a]" style={{ fontWeight: 400, lineHeight: "1.6" }}>{client.description}</p>
              </MiniCard>
            )}

            {/* Credit Utilization Bar */}
            <MiniCard>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp size={13} className={isOverLimit ? "text-[#ef4444]" : "text-[#7c3aed]"} />
                  <span className="text-[12px] text-[#1a1a2e]" style={{ fontWeight: 600 }}>Credit Utilization</span>
                </div>
                <span className={`text-[12px] ${isOverLimit ? "text-[#ef4444]" : "text-[#7c3aed]"}`} style={{ fontWeight: 700 }}>
                  {creditUtilization.toFixed(0)}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#f0f0f3] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isOverLimit ? "bg-gradient-to-r from-[#ef4444] to-[#f97316]" :
                    creditUtilization > 75 ? "bg-gradient-to-r from-[#f59e0b] to-[#ef4444]" :
                    "bg-gradient-to-r from-[#7c3aed] to-[#3b82f6]"
                  }`}
                  style={{ width: `${Math.min(creditUtilization, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-2 text-[10px] text-[#8b8b9e]" style={{ fontWeight: 400 }}>
                <span>$0</span>
                <span>${cl.toLocaleString()}</span>
              </div>
            </MiniCard>

            {/* Financial Details - 3 cards in a row */}
            <div className="grid grid-cols-3 gap-3">
              <MiniCard>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-[#dcfce7] flex items-center justify-center"><CreditCard size={11} className="text-[#22c55e]" /></div>
                  <span className="text-[10px] text-[#8b8b9e] uppercase" style={{ fontWeight: 600 }}>Credit Limit</span>
                </div>
                <div className="text-[15px] text-[#1a1a2e] mb-2" style={{ fontWeight: 700 }}>${cl.toLocaleString()}</div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#8b8b9e]" style={{ fontWeight: 400 }}>Invoices</span>
                    <SalesBoolBadge value={client.creditLimitApplyInvoices ?? false} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#8b8b9e]" style={{ fontWeight: 400 }}>Sales Order</span>
                    <SalesBoolBadge value={client.creditLimitApplySalesOrder ?? false} />
                  </div>
                </div>
              </MiniCard>

              <MiniCard>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-[#eff6ff] flex items-center justify-center"><BarChart3 size={11} className="text-[#3b82f6]" /></div>
                  <span className="text-[10px] text-[#8b8b9e] uppercase" style={{ fontWeight: 600 }}>Trans. Limit</span>
                </div>
                <div className="text-[15px] text-[#1a1a2e] mb-2" style={{ fontWeight: 700 }}>${tbl.toLocaleString()}</div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#8b8b9e]" style={{ fontWeight: 400 }}>Invoices</span>
                    <SalesBoolBadge value={client.transactionBalanceLimitApplyInvoices ?? false} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#8b8b9e]" style={{ fontWeight: 400 }}>Sales Order</span>
                    <SalesBoolBadge value={client.transactionBalanceLimitApplySalesOrder ?? false} />
                  </div>
                </div>
              </MiniCard>

              <MiniCard>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-[#fef3c7] flex items-center justify-center"><Clock size={11} className="text-[#f59e0b]" /></div>
                  <span className="text-[10px] text-[#8b8b9e] uppercase" style={{ fontWeight: 600 }}>Grace Period</span>
                </div>
                <div className="text-[15px] text-[#1a1a2e] mb-2" style={{ fontWeight: 700 }}>{gp} <span className="text-[11px] text-[#8b8b9e]" style={{ fontWeight: 400 }}>days</span></div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#8b8b9e]" style={{ fontWeight: 400 }}>Invoices</span>
                    <SalesBoolBadge value={client.gracePeriodApplyInvoices ?? false} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#8b8b9e]" style={{ fontWeight: 400 }}>Sales Order</span>
                    <SalesBoolBadge value={client.gracePeriodApplySalesOrder ?? false} />
                  </div>
                </div>
              </MiniCard>
            </div>

            {/* Classification & Tags */}
            <MiniCard>
              <SectionDivider icon={Tag} title="Classification & Tags" iconBg="bg-[#fef3c7]" iconColor="text-[#f59e0b]"
                onEdit={() => startEdit("tags")} isEditing={editingSection === "tags"} onSave={saveEdit} onCancel={cancelEdit}
              />
              <div className="grid grid-cols-3 gap-x-6 gap-y-3 mt-3">
                <ViewField label="Client Channel" value={client.clientChannel || "—"} />
                <ViewField label="Job Categories" value={client.jobCategories || "—"} />
                <ViewField label="Specialties" value={client.specialty || "—"} />
              </div>
              {(client.clientTags.length > 0 || client.areaTags.length > 0) && (
                <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-[#f0f0f3]">
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
              {client.isChain && client.clientChain && (
                <div className="mt-3 pt-3 border-t border-[#f0f0f3]">
                  <div className="text-[10px] text-[#8b8b9e] uppercase tracking-wider mb-1.5" style={{ fontWeight: 500 }}>Chain</div>
                  <ChipList items={client.clientChain.split(",").map((s) => s.trim()).filter(Boolean)} color="bg-[#f3f0ff] text-[#7c3aed]" />
                </div>
              )}
            </MiniCard>

            {/* Operations & Compliance */}
            <MiniCard>
              <SectionDivider icon={Settings} title="Operations & Compliance" iconBg="bg-[#fce7f3]" iconColor="text-[#ec4899]"
                onEdit={() => startEdit("operations")} isEditing={editingSection === "operations"} onSave={saveEdit} onCancel={cancelEdit}
              />
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 mt-3">
                <ViewField label="Tax Number" value={client.taxNumber ? <span className="font-mono">{client.taxNumber}</span> : "—"} />
                <ViewField label="Forms V2" value={client.formsV2 || "—"} />
              </div>
              {(Array.isArray(client.contacts) && client.contacts.length > 0) && (
                <div className="mt-3 pt-3 border-t border-[#f0f0f3]">
                  <ViewField label="Contacts" value={<ChipList items={client.contacts} />} />
                </div>
              )}
              {(Array.isArray(client.retailExecutionTemplate) && client.retailExecutionTemplate.length > 0) && (
                <div className="mt-3 pt-3 border-t border-[#f0f0f3]">
                  <ViewField label="Retail Execution Template" value={<ChipList items={client.retailExecutionTemplate} />} />
                </div>
              )}
              {(Array.isArray(client.clmPresentations) && client.clmPresentations.length > 0) && (
                <div className="mt-3 pt-3 border-t border-[#f0f0f3]">
                  <ViewField label="CLM Presentations" value={<ChipList items={client.clmPresentations} />} />
                </div>
              )}
            </MiniCard>

            {/* ── ADVANCED SECTION TOGGLE ── */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 w-full px-4 py-2.5 bg-[#f8f8fa] hover:bg-[#f0f0f3] border border-[#e8e8ec] rounded-xl transition-colors cursor-pointer group"
            >
              <div className="w-6 h-6 rounded-md bg-[#f3f0ff] flex items-center justify-center">
                <Settings size={11} className="text-[#7c3aed]" />
              </div>
              <span className="text-[12px] text-[#4a4a5a] flex-1 text-left" style={{ fontWeight: 600 }}>Advanced Settings</span>
              <span className="text-[10px] text-[#8b8b9e] mr-1" style={{ fontWeight: 500 }}>
                {showAdvanced ? "Hide" : "Print & Invoice, Custom Fields"}
              </span>
              <ChevronRight size={13} className={`text-[#8b8b9e] transition-transform duration-200 ${showAdvanced ? "rotate-90" : ""}`} />
            </button>

            {showAdvanced && (
              <>
                {/* Print & Invoice Settings */}
                <MiniCard className="border-[#e0dff0]">
                  <SectionDivider icon={Printer} title="Print & Invoice Settings" iconBg="bg-[#f5f5f7]" iconColor="text-[#4a4a5a]"
                    onEdit={() => startEdit("print")} isEditing={editingSection === "print"} onSave={saveEdit} onCancel={cancelEdit}
                  />
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="flex items-center gap-3 px-3 py-2.5 bg-[#f8f9fb] rounded-lg">
                      <div className="w-[52px] h-[52px] rounded-lg border-2 border-dashed border-[#e0e0e6] bg-white flex items-center justify-center flex-shrink-0">
                        <Building2 size={16} className="text-[#d0d0de]" />
                      </div>
                      <div className="flex flex-col gap-1 min-w-0">
                        <span className="text-[10px] text-[#8b8b9e] uppercase" style={{ fontWeight: 500 }}>Company Logo</span>
                        <span className="text-[11px] text-[#b0b0be]" style={{ fontWeight: 400 }}>No logo uploaded</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <ViewField label="Company Legal Name" value={<span className="text-[#b0b0be]">—</span>} />
                      <ViewField label="Footer" value={<span className="text-[#b0b0be]">—</span>} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-[#f0f0f3]">
                    {[
                      { label: "Sales Order", title: "—", local: "—" },
                      { label: "Invoice", title: "—", local: "—" },
                      { label: "Return Invoice", title: "—", local: "—" },
                    ].map(doc => (
                      <div key={doc.label} className="px-3 py-2.5 bg-[#f8f9fb] rounded-lg">
                        <div className="text-[10px] text-[#8b8b9e] uppercase tracking-wider mb-1.5" style={{ fontWeight: 600 }}>{doc.label}</div>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] text-[#b0b0be]" style={{ fontWeight: 500 }}>Title</span>
                            <span className="text-[11px] text-[#b0b0be]" style={{ fontWeight: 400 }}>{doc.title}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] text-[#b0b0be]" style={{ fontWeight: 500 }}>Local</span>
                            <span className="text-[11px] text-[#b0b0be]" style={{ fontWeight: 400 }}>{doc.local}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </MiniCard>

                {/* Custom Fields */}
                <MiniCard className="border-[#e0dff0]">
                  <SectionDivider icon={Settings} title="Custom Fields" iconBg="bg-[#f0f0f3]" iconColor="text-[#8b8b9e]"
                    onEdit={() => startEdit("customfields")} isEditing={editingSection === "customfields"} onSave={saveEdit} onCancel={cancelEdit}
                    badge={<span className="text-[10px] text-[#8b8b9e]" style={{ fontWeight: 500 }}>{customFields.length} fields</span>}
                  />
                  <div className="flex flex-col gap-3 mt-3">
                    {grouped.map(({ type, fields: typeFields }) => {
                      const meta = CF_TYPE_META[type];
                      const MetaIcon = meta.icon;
                      const isCollapsed = collapsedSections.has(`cf-${type}`);
                      return (
                        <div key={type} className="bg-[#f8f9fb] rounded-lg overflow-hidden">
                          <button
                            onClick={() => toggleSection(`cf-${type}`)}
                            className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-[#f0f0f3] transition-colors cursor-pointer"
                          >
                            <div className={`w-5 h-5 rounded flex items-center justify-center ${meta.iconBg}`}>
                              <MetaIcon size={10} className={meta.iconColor} />
                            </div>
                            <span className="text-[11px] text-[#1a1a2e] flex-1 text-left" style={{ fontWeight: 600 }}>{type}</span>
                            <span className="text-[10px] text-[#8b8b9e] mr-1" style={{ fontWeight: 500 }}>{typeFields.length}</span>
                            {isCollapsed ? <ChevronDown size={12} className="text-[#8b8b9e]" /> : <ChevronUp size={12} className="text-[#8b8b9e]" />}
                          </button>
                          {!isCollapsed && (
                            <div className="px-3 pb-3 grid grid-cols-2 gap-2">
                              {typeFields.map(field => (
                                <div key={field.id} className="px-3 py-2 bg-white rounded-lg border border-[#e8e8ec]">
                                  <div className="flex items-center gap-1 mb-0.5">
                                    <span className="text-[10px] text-[#8b8b9e] uppercase tracking-wider" style={{ fontWeight: 500 }}>{field.name}</span>
                                    {field.localName && (
                                      <span className="text-[9px] text-[#c0c0cc]" style={{ fontWeight: 400 }}>({field.localName})</span>
                                    )}
                                  </div>
                                  <div>{renderFieldValue(field)}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </MiniCard>
              </>
            )}
          </div>

          {/* ============================================
              RIGHT COLUMN — Activity, Products, Targets
              ============================================ */}
          <div className="flex flex-col gap-4">

            {/* Activity Timeline */}
            <MiniCard>
              <SectionDivider icon={Activity} title="Activity" iconBg="bg-[#fef3c7]" iconColor="text-[#f59e0b]" />
              <div className="flex flex-col gap-0 mt-3 relative">
                {/* Vertical connector line */}
                <div className="absolute left-[11px] top-2 bottom-2 w-px bg-[#e8e8ec]" />
                {[
                  { label: "Created", time: client.createdAt, icon: Calendar, color: "bg-[#f3f0ff] text-[#7c3aed]" },
                  { label: "Updated", time: client.updatedAt, icon: Clock, color: "bg-[#eff6ff] text-[#3b82f6]" },
                  { label: "Last Invoice", time: client.lastSalesInvoiceTime, icon: FileText, color: "bg-[#dcfce7] text-[#22c55e]" },
                  { label: "Last Sales Order", time: client.lastSalesOrderTime, icon: Target, color: "bg-[#fef3c7] text-[#f59e0b]" },
                ].map((item) => {
                  const recent = item.time ? isRecent(item.time) : false;
                  const ItemIcon = item.icon;
                  return (
                    <div key={item.label} className="flex items-start gap-2.5 py-2 relative z-10">
                      <div className={`w-[22px] h-[22px] rounded-full flex items-center justify-center flex-shrink-0 border-2 border-white ${item.color.split(" ")[0]}`}>
                        <ItemIcon size={9} className={item.color.split(" ")[1]} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] text-[#8b8b9e]" style={{ fontWeight: 500 }}>{item.label}</div>
                        <div className="flex items-center gap-1.5">
                          {item.time && <span className={`w-1.5 h-1.5 rounded-full ${recent ? "bg-[#22c55e]" : "bg-[#d1d5db]"}`} />}
                          <span className="text-[11px] text-[#4a4a5a] truncate" style={{ fontWeight: 400 }}>{item.time || "—"}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </MiniCard>

            {/* Products & Inventory */}
            <MiniCard>
              <SectionDivider icon={Package} title="Products" iconBg="bg-[#eff6ff]" iconColor="text-[#3b82f6]"
                onEdit={() => startEdit("products")} isEditing={editingSection === "products"} onSave={saveEdit} onCancel={cancelEdit}
              />
              <div className="flex flex-col gap-3 mt-3">
                {client.availabilityMSL && (
                  <div className="px-3 py-2 bg-[#f8f9fb] rounded-lg">
                    <div className="text-[9px] text-[#8b8b9e] uppercase" style={{ fontWeight: 500 }}>Availability MSL</div>
                    <div className="text-[12px] text-[#1a1a2e] mt-0.5" style={{ fontWeight: 500 }}>{client.availabilityMSL}</div>
                  </div>
                )}
                {client.mediaAssignedProducts && (
                  <div className="px-3 py-2 bg-[#f8f9fb] rounded-lg">
                    <div className="text-[9px] text-[#8b8b9e] uppercase" style={{ fontWeight: 500 }}>Media Products</div>
                    <div className="text-[12px] text-[#1a1a2e] mt-0.5" style={{ fontWeight: 500 }}>{client.mediaAssignedProducts}</div>
                  </div>
                )}
                {client.assignedProductGroups && (
                  <div className="px-3 py-2 bg-[#f8f9fb] rounded-lg">
                    <div className="text-[9px] text-[#8b8b9e] uppercase" style={{ fontWeight: 500 }}>Product Group</div>
                    <div className="text-[12px] text-[#1a1a2e] mt-0.5" style={{ fontWeight: 500 }}>{client.assignedProductGroups}</div>
                  </div>
                )}
                {!client.availabilityMSL && !client.mediaAssignedProducts && !client.assignedProductGroups && (
                  <div className="text-[11px] text-[#b0b0be] text-center py-3" style={{ fontWeight: 400 }}>No products assigned</div>
                )}
              </div>
            </MiniCard>

            {/* Product Line Targets */}
            <MiniCard>
              <SectionDivider icon={Target} title="Line Targets" iconBg="bg-[#fce7f3]" iconColor="text-[#ec4899]"
                onEdit={() => startEdit("targets")} isEditing={editingSection === "targets"} onSave={saveEdit} onCancel={cancelEdit}
              />
              <div className="flex flex-col items-center justify-center py-5 gap-2 mt-2">
                <div className="w-10 h-10 rounded-full bg-[#f8f9fb] flex items-center justify-center">
                  <Target size={16} className="text-[#d0d0de]" />
                </div>
                <span className="text-[11px] text-[#b0b0be]" style={{ fontWeight: 400 }}>No targets assigned</span>
              </div>
            </MiniCard>

            {/* Quick Info */}
            <MiniCard>
              <SectionDivider icon={Hash} title="Identifiers" iconBg="bg-[#f5f5f7]" iconColor="text-[#4a4a5a]" />
              <div className="flex flex-col gap-2 mt-3">
                <div className="flex items-center justify-between py-1">
                  <span className="text-[10px] text-[#8b8b9e]" style={{ fontWeight: 500 }}>Client ID</span>
                  <span className="font-mono text-[11px] text-[#4a4a5a]" style={{ fontWeight: 500 }}>{client.id}</span>
                </div>
                <div className="h-px bg-[#f0f0f3]" />
                <div className="flex items-center justify-between py-1">
                  <span className="text-[10px] text-[#8b8b9e]" style={{ fontWeight: 500 }}>Client Code</span>
                  <span className="font-mono text-[11px] text-[#4a4a5a]" style={{ fontWeight: 500 }}>{client.clientCode}</span>
                </div>
                <div className="h-px bg-[#f0f0f3]" />
                <div className="flex items-center justify-between py-1">
                  <span className="text-[10px] text-[#8b8b9e]" style={{ fontWeight: 500 }}>Contact Title</span>
                  <span className="text-[11px] text-[#4a4a5a]" style={{ fontWeight: 500 }}>{client.contactTitle || "—"}</span>
                </div>
                <div className="h-px bg-[#f0f0f3]" />
                <div className="flex items-center justify-between py-1">
                  <span className="text-[10px] text-[#8b8b9e]" style={{ fontWeight: 500 }}>Region</span>
                  <span className="text-[11px] text-[#4a4a5a]" style={{ fontWeight: 500 }}>{client.region || "—"}</span>
                </div>
              </div>
            </MiniCard>
          </div>

        </div>
      </div>
    </div>
  );
}