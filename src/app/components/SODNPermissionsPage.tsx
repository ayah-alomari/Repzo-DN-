import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useAppData } from "../context/AppDataContext";

interface Props {
  initialTab: string;
  onBack: () => void;
}

const TABS = [
  "Sales orders permissions",
  "Delivery Notes permissions",
  "DN Unloads permissions",
  "Pickup Note permissions",
  "Reservations permissions",
  "Transfers permissions",
];

// ── Toggle component ──────────────────────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex w-11 h-6 rounded-full transition-colors duration-200 shrink-0 focus:outline-none ${
        checked ? "bg-[#1a1a2e]" : "bg-gray-200"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

// ── Toggle row component ──────────────────────────────────────────────────────
function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-4 py-4">
      <Toggle checked={checked} onChange={onChange} />
      <div className="flex flex-col gap-0.5">
        <span className="text-[14px] font-semibold text-gray-900">{label}</span>
        <span className="text-[13px] text-gray-500">{description}</span>
      </div>
    </div>
  );
}

// ── Per-tab content ───────────────────────────────────────────────────────────
function SalesOrdersTab() {
  const { allowSOApprovalWithoutStock, setAllowSOApprovalWithoutStock } = useAppData();
  const [saved, setSaved] = useState({ approvalWithoutStock: allowSOApprovalWithoutStock });
  const [draft, setDraft] = useState({ approvalWithoutStock: allowSOApprovalWithoutStock });

  const handleSubmit = () => {
    setSaved(draft);
    setAllowSOApprovalWithoutStock(draft.approvalWithoutStock);
  };
  const handleReset = () => setDraft(saved);

  return (
    <TabShell
      title="Sales Orders Configuration"
      description="Configure approval workflow and stock validation rules for Sales Orders."
      onReset={handleReset}
      onSubmit={handleSubmit}
    >
      <ToggleRow
        label="Allow Sales Order approval without stock"
        description="When enabled, Sales Orders can be approved even if the selected warehouse has insufficient stock for some items (negative reservations are permitted). When disabled, the approval modal requires a warehouse with full stock coverage before confirming."
        checked={draft.approvalWithoutStock}
        onChange={v => setDraft(d => ({ ...d, approvalWithoutStock: v }))}
      />
    </TabShell>
  );
}

function ReservationsTab() {
  const { 
    allowMultiWarehouseReservation, setAllowMultiWarehouseReservation,
    allowNegativeReservation, setAllowNegativeReservation 
  } = useAppData();

  const [saved, setSaved] = useState({ 
    crossOrder: false, 
    multiWarehouse: allowMultiWarehouseReservation,
    negativeReservation: allowNegativeReservation
  });
  const [draft, setDraft] = useState({ 
    crossOrder: false, 
    multiWarehouse: allowMultiWarehouseReservation,
    negativeReservation: allowNegativeReservation
  });

  const handleSubmit = () => {
    setSaved(draft);
    setAllowMultiWarehouseReservation(draft.multiWarehouse);
    setAllowNegativeReservation(draft.negativeReservation);
  };
  const handleReset = () => setDraft(saved);

  return (
    <TabShell
      title="Reservations Configuration"
      description="Configure permissions for reservation behavior across sales orders."
      onReset={handleReset}
      onSubmit={handleSubmit}
    >
      <ToggleRow
        label="Allow DN creation using items reserved for other orders"
        description="Allow Delivery Note (DN) creation using items that are already reserved for other Sales Orders. When enabled, reserved quantities are not blocked from use in new DNs."
        checked={draft.crossOrder}
        onChange={v => setDraft(d => ({ ...d, crossOrder: v }))}
      />
      <ToggleRow
        label="Allow multi-warehouse reservation"
        description="When enabled, a single reservation can span items across multiple warehouses. When disabled, all items in a reservation must come from the same warehouse."
        checked={draft.multiWarehouse}
        onChange={v => setDraft(d => ({ ...d, multiWarehouse: v }))}
      />
      <ToggleRow
        label="Allow Negative Reservation"
        description="Define the behavior for 'Negative Reservation' to handle edge cases in stock synchronization. When enabled, reservations can go below zero to accommodate out-of-sync inventory states."
        checked={draft.negativeReservation}
        onChange={v => setDraft(d => ({ ...d, negativeReservation: v }))}
      />
    </TabShell>
  );
}



function EmptyTab({ title, description }: { title: string; description: string }) {
  return (
    <TabShell title={title} description={description} onReset={() => {}} onSubmit={() => {}}>
      <p className="text-[13px] text-gray-400 py-4">No permissions configured for this section yet.</p>
    </TabShell>
  );
}

// ── Shell that all tabs share ─────────────────────────────────────────────────
function TabShell({
  title,
  description,
  onReset,
  onSubmit,
  children,
}: {
  title: string;
  description: string;
  onReset: () => void;
  onSubmit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <div className="flex-1 px-10 py-8">
        {/* Page title */}
        <div className="mb-7">
          <h2 className="text-[26px] font-bold text-gray-900 mb-1">{title}</h2>
          <p className="text-[13px] text-gray-400">{description}</p>
        </div>

        {/* Settings card */}
        <div className="bg-white border border-gray-200 rounded-[10px] px-6 divide-y divide-gray-100">
          {children}
        </div>
      </div>

      {/* Footer actions */}
      <div className="shrink-0 border-t border-gray-200 bg-white px-10 py-4 flex justify-end gap-3">
        <button
          onClick={onReset}
          className="px-5 py-2 rounded-[8px] border border-gray-300 text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Reset
        </button>
        <button
          onClick={onSubmit}
          className="px-5 py-2 rounded-[8px] bg-[#1a1a2e] text-white text-[13px] font-semibold hover:bg-[#111827] transition-colors"
        >
          Submit
        </button>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export function SODNPermissionsPage({ initialTab, onBack }: Props) {
  const [activeTab, setActiveTab] = useState(initialTab);

  const renderTab = () => {
    switch (activeTab) {
      case "Reservations permissions":
        return <ReservationsTab />;

      case "Sales orders permissions":
        return <SalesOrdersTab />;
      case "Delivery Notes permissions":
        return <EmptyTab title="Delivery Notes Configuration" description="Configure permissions for delivery note creation and management." />;
      case "DN Unloads permissions":
        return <EmptyTab title="DN Unloads Configuration" description="Configure permissions for DN unload operations." />;
      case "Pickup Note permissions":
        return <EmptyTab title="Pickup Note Configuration" description="Configure permissions for pickup note handling." />;
      case "Transfers permissions":
        return <EmptyTab title="Transfers Configuration" description="Configure permissions for inventory transfer operations." />;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-white overflow-hidden">
      {/* Tab bar */}
      <div className="flex items-center border-b border-gray-200 bg-white px-4 shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-[13px] text-gray-400 hover:text-gray-700 transition-colors mr-4 py-3.5 shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3.5 text-[13px] font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-[#1a1a2e] text-[#1a1a2e]"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Active tab content */}
      {renderTab()}
    </div>
  );
}
