import React, { useState, useEffect } from "react";
import { ArrowLeft, Unlock, Lock, AlertTriangle } from "lucide-react";
import { useAppData } from "../context/AppDataContext";

interface Props {
  initialTab: string;
  onBack: () => void;
}

const TABS = [
  "Sales orders permissions",
  "Invoices & Inventory permissions",
  "Reservations permissions",
  "Delivery Notes permissions",
  "Delivery Note Unloads permissions",
  "Return Note permissions",
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
  note,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  note?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4 py-4">
      <Toggle checked={checked} onChange={onChange} />
      <div className="flex flex-col gap-0.5">
        <span className="text-[14px] font-semibold text-gray-900">{label}</span>
        <span className="text-[13px] text-gray-500">{description}</span>
        {note && <div className="mt-1">{note}</div>}
      </div>
    </div>
  );
}

// ── Warning modal ─────────────────────────────────────────────────────────────

type PendingChange =
  | { kind: "enable"; value: boolean }
  | { kind: "mode"; value: "flexible" | "strict" };

const WARNING_CONTENT: Record<string, { title: string; description: string }> = {
  "enable-true": {
    title: "Enable Reservation Model?",
    description: "This will activate reservation enforcement across the system. Users will be prompted or required to make reservations when approving Sales Orders and creating Invoices, based on the selected mode.",
  },
  "enable-false": {
    title: "Disable Reservation Model?",
    description: "This will deactivate all reservation features. Existing reservations will be removed immediately.",
  },
  "mode-flexible": {
    title: "Switch to Flexible Mode?",
    description: "Reservations will become optional at every step. Users can freely skip reservations when approving Sales Orders or creating Invoices. This takes effect system-wide after saving.",
  },
  "mode-strict": {
    title: "Switch to Strict Mode?",
    description: "Reservations will be mandatory at every step. Users will not be able to approve Sales Orders or create Invoices without first making a reservation. This takes effect system-wide after saving.",
  },
};

function WarningModal({
  change,
  onConfirm,
  onCancel,
}: {
  change: PendingChange;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const key = change.kind === "enable" ? `enable-${change.value}` : `mode-${change.value}`;
  const { title, description } = WARNING_CONTENT[key];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="px-6 pt-6 pb-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-gray-900 leading-tight">{title}</h3>
              <p className="text-[13px] text-gray-500 mt-2 leading-relaxed">{description}</p>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-[13px] font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-[13px] font-semibold text-white bg-[#1a1a2e] rounded-lg hover:bg-[#111827] transition-colors cursor-pointer"
          >
            Yes, proceed
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Two-step disable reservation modal ───────────────────────────────────────
function DisableReservationModal({
  step,
  confirmText,
  onConfirmTextChange,
  onNext,
  onConfirm,
  onCancel,
}: {
  step: 1 | 2;
  confirmText: string;
  onConfirmTextChange: (v: string) => void;
  onNext: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const isValid = confirmText === "Confirm Disable Reservation";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {step === 1 ? (
          <>
            <div className="px-6 pt-6 pb-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-gray-900 leading-tight">Disable Reservation Model?</h3>
                  <p className="text-[13px] text-gray-500 mt-2 leading-relaxed">
                    This will deactivate all reservation features across the system.{" "}
                    <span className="font-semibold text-red-600 bg-red-50 px-1 py-0.5 rounded">
                      Existing reservations will be removed immediately.
                    </span>{" "}
                    This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-[13px] font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={onNext}
                className="px-4 py-2 text-[13px] font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
              >
                Continue
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="px-6 pt-6 pb-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <div className="w-full">
                  <h3 className="text-[15px] font-bold text-gray-900 leading-tight">Confirm disabling the reservation model</h3>
                  <p className="text-[13px] text-gray-500 mt-2 leading-relaxed">
                    Type <span className="font-semibold text-gray-800">Confirm Disable Reservation</span> to proceed.
                  </p>
                  <input
                    autoFocus
                    type="text"
                    value={confirmText}
                    onChange={e => onConfirmTextChange(e.target.value)}
                    placeholder="Confirm Disable Reservation"
                    className="mt-3 w-full px-3 py-2 text-[13px] border border-gray-300 rounded-lg outline-none focus:border-red-400 focus:ring-2 focus:ring-red-50 transition-all placeholder:text-gray-300"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-[13px] font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={!isValid}
                className="px-4 py-2 text-[13px] font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Disable
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Negative reservation blocked modal ────────────────────────────────────────
function NegativeReservationBlockedModal({
  onNavigate,
  onClose,
}: {
  onNavigate: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="px-6 pt-6 pb-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-gray-900 leading-tight">Cannot Disable Negative Reservation</h3>
              <p className="text-[13px] text-gray-500 mt-2 leading-relaxed">
                Negative Reservation is required while{" "}
                <button
                  onClick={onNavigate}
                  className="text-indigo-600 hover:underline font-medium cursor-pointer"
                >
                  Allow Sales Order approval without stock
                </button>{" "}
                is disabled. Enabling that permission first would allow you to turn this off.
              </p>
            </div>
          </div>
        </div>
        <div className="flex justify-end px-6 py-4 bg-gray-50 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[13px] font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-white transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Per-tab content ───────────────────────────────────────────────────────────
function SalesOrdersTab() {
  const { allowSOApprovalWithoutStock, setAllowSOApprovalWithoutStock } = useAppData();

  const [saved, setSaved] = useState({
    approvalWithoutStock: allowSOApprovalWithoutStock,
  });
  const [draft, setDraft] = useState({
    approvalWithoutStock: allowSOApprovalWithoutStock,
  });

  const handleSubmit = () => {
    setSaved(draft);
    setAllowSOApprovalWithoutStock(draft.approvalWithoutStock);
  };
  const handleReset = () => setDraft(saved);

  return (
    <TabShell
      title="Sales Orders Configuration"
      description="Configure approval workflow and stock validation rules for Sales Orders."
      hasChanges={JSON.stringify(draft) !== JSON.stringify(saved)}
      onReset={handleReset}
      onSubmit={handleSubmit}
      noCard
    >
      <div className="bg-white border border-gray-200 rounded-[10px] px-6 divide-y divide-gray-100">
        <ToggleRow
          label="Allow Sales Order approval without stock"
          description="When enabled, Sales Orders can be approved even if the selected warehouse has insufficient stock for some items. When disabled, the approval modal requires full stock coverage before confirming."
          checked={draft.approvalWithoutStock}
          onChange={v => setDraft(d => ({ ...d, approvalWithoutStock: v }))}
        />
      </div>
    </TabShell>
  );
}

function ReservationsTab({ onNavigateTo }: { onNavigateTo: (tab: string) => void }) {
  const {
    enableReservationModel, setEnableReservationModel,
    reservationMode, setReservationMode,
    allowMultiWarehouseReservation, setAllowMultiWarehouseReservation,
    allowNegativeReservation, setAllowNegativeReservation,
    preventInvoiceReservations, setPreventInvoiceReservations,
    allowSOApprovalWithoutStock,
  } = useAppData();

  const [saved, setSaved] = useState({
    enableReservationModel,
    reservationMode,
    crossOrder: false,
    multiWarehouse: allowMultiWarehouseReservation,
    negativeReservation: allowNegativeReservation,
    preventInvoiceReservations,
  });
  const [draft, setDraft] = useState({
    enableReservationModel,
    reservationMode,
    crossOrder: false,
    multiWarehouse: allowMultiWarehouseReservation,
    negativeReservation: allowNegativeReservation,
    preventInvoiceReservations,
  });

  const [pendingChange, setPendingChange] = useState<PendingChange | null>(null);
  const [disableModelStep, setDisableModelStep] = useState<1 | 2 | null>(null);
  const [disableConfirmText, setDisableConfirmText] = useState("");
  const [showNegBlockedModal, setShowNegBlockedModal] = useState(false);

  // When reservation model is on and SO approval without stock is disabled,
  // negative reservation must stay forced on to avoid reservation creation failures.
  const isNegativeReservationForced =
    draft.enableReservationModel && draft.reservationMode === "strict" && !allowSOApprovalWithoutStock;

  useEffect(() => {
    if (draft.enableReservationModel && draft.reservationMode === "strict" && !allowSOApprovalWithoutStock && !draft.negativeReservation) {
      setDraft(d => ({ ...d, negativeReservation: true }));
    }
  }, [draft.enableReservationModel, draft.reservationMode, draft.negativeReservation, allowSOApprovalWithoutStock]);

  const handleSubmit = () => {
    setSaved(draft);
    setEnableReservationModel(draft.enableReservationModel);
    setReservationMode(draft.reservationMode);
    setAllowMultiWarehouseReservation(draft.multiWarehouse);
    setAllowNegativeReservation(draft.negativeReservation);
    setPreventInvoiceReservations(draft.preventInvoiceReservations);
  };
  const handleReset = () => setDraft(saved);

  const handleConfirm = () => {
    if (!pendingChange) return;
    if (pendingChange.kind === "enable") {
      setDraft(d => ({ ...d, enableReservationModel: pendingChange.value }));
    } else {
      setDraft(d => ({ ...d, reservationMode: pendingChange.value }));
    }
    setPendingChange(null);
  };

  const handleDisableModelConfirm = () => {
    setDraft(d => ({ ...d, enableReservationModel: false }));
    setDisableModelStep(null);
    setDisableConfirmText("");
  };

  const handleDisableModelCancel = () => {
    setDisableModelStep(null);
    setDisableConfirmText("");
  };

  const childrenDisabled = !draft.enableReservationModel;

  return (
    <>
      {pendingChange && (
        <WarningModal
          change={pendingChange}
          onConfirm={handleConfirm}
          onCancel={() => setPendingChange(null)}
        />
      )}
      {disableModelStep && (
        <DisableReservationModal
          step={disableModelStep}
          confirmText={disableConfirmText}
          onConfirmTextChange={setDisableConfirmText}
          onNext={() => setDisableModelStep(2)}
          onConfirm={handleDisableModelConfirm}
          onCancel={handleDisableModelCancel}
        />
      )}
      {showNegBlockedModal && (
        <NegativeReservationBlockedModal
          onNavigate={() => {
            setShowNegBlockedModal(false);
            onNavigateTo("Sales orders permissions");
          }}
          onClose={() => setShowNegBlockedModal(false)}
        />
      )}
      <TabShell
        title="Reservations Configuration"
        description="Configure permissions for reservation behavior across sales orders."
        hasChanges={JSON.stringify(draft) !== JSON.stringify(saved)}
        onReset={handleReset}
        onSubmit={handleSubmit}
        noCard
      >
        {/* Card 1 — Enable Reservation Model */}
        <div className={`bg-white border border-gray-200 rounded-[10px] px-6 mb-4 transition-colors ${draft.enableReservationModel ? "bg-indigo-50/50" : ""}`}>
          <div className="py-5 flex items-center justify-between gap-6">
            {/* Left: toggle + label */}
            <div className="flex items-center gap-4">
              <Toggle
                checked={draft.enableReservationModel}
                onChange={v => {
                  if (!v) {
                    setDisableModelStep(1);
                  } else {
                    setPendingChange({ kind: "enable", value: true });
                  }
                }}
              />
              <span className="text-[14px] font-bold text-gray-900">Enable Reservation Model</span>
            </div>

            {/* Right: segmented mode control */}
            <div className={`transition-opacity duration-200 ${childrenDisabled ? "opacity-40 pointer-events-none select-none" : ""}`}>
              <div className="flex items-center bg-gray-100 rounded-[8px] p-[3px] gap-[2px]">
                <button
                  onClick={() => draft.reservationMode !== "flexible" && setPendingChange({ kind: "mode", value: "flexible" })}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-[6px] text-[13px] font-medium transition-all ${
                    draft.reservationMode === "flexible"
                      ? "bg-white text-[#1a1a2e] shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Unlock className="w-3.5 h-3.5" />
                  Flexible
                </button>
                <button
                  onClick={() => draft.reservationMode !== "strict" && setPendingChange({ kind: "mode", value: "strict" })}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-[6px] text-[13px] font-medium transition-all ${
                    draft.reservationMode === "strict"
                      ? "bg-white text-[#1a1a2e] shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  Strict
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2 — Child permissions */}
        <div className={`bg-white border border-gray-200 rounded-[10px] px-6 divide-y divide-gray-100 transition-opacity duration-200 ${childrenDisabled ? "opacity-40 pointer-events-none select-none" : ""}`}>
          <ToggleRow
            label="Allow delivery note creation using items reserved for other orders"
            description="Allow Delivery Note creation using items that are already reserved for other Sales Orders. When enabled, reserved quantities are not blocked from use in new delivery notes."
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
            description="When enabled, reservations can go below zero to accommodate out-of-sync inventory states. Disabling this may cause errors if reservations are created without sufficient stock coverage."
            checked={draft.negativeReservation}
            onChange={v => {
              if (!v && isNegativeReservationForced) {
                setShowNegBlockedModal(true);
              } else {
                setDraft(d => ({ ...d, negativeReservation: v }));
              }
            }}
            note={isNegativeReservationForced ? (
              <span className="text-[12px] text-amber-600 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 shrink-0" />
                Required while &ldquo;Allow Sales Order approval without stock&rdquo; is disabled.
              </span>
            ) : undefined}
          />
          <ToggleRow
            label="Prevent creating reservations when creating an invoice"
            description="When enabled, no reservations are created or prompted during invoice creation or conversion. All items will be free with no warehouse allocation required."
            checked={draft.preventInvoiceReservations}
            onChange={v => setDraft(d => ({ ...d, preventInvoiceReservations: v }))}
          />
        </div>
      </TabShell>
    </>
  );
}

function EmptyTab({ title, description }: { title: string; description: string }) {
  return (
    <TabShell title={title} description={description} hasChanges={false} onReset={() => {}} onSubmit={() => {}}>
      <p className="text-[13px] text-gray-400 py-4">No permissions configured for this section yet.</p>
    </TabShell>
  );
}

// ── Shell that all tabs share ─────────────────────────────────────────────────
function TabShell({
  title,
  description,
  hasChanges,
  onReset,
  onSubmit,
  children,
  noCard,
}: {
  title: string;
  description: string;
  hasChanges: boolean;
  onReset: () => void;
  onSubmit: () => void;
  children: React.ReactNode;
  noCard?: boolean;
}) {
  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <div className="flex-1 px-10 py-8">
        {/* Page title */}
        <div className="mb-7">
          <h2 className="text-[26px] font-bold text-gray-900 mb-1">{title}</h2>
          <p className="text-[13px] text-gray-400">{description}</p>
        </div>

        {/* Settings card(s) */}
        {noCard ? (
          <>{children}</>
        ) : (
          <div className="bg-white border border-gray-200 rounded-[10px] px-6 divide-y divide-gray-100">
            {children}
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="shrink-0 border-t border-gray-200 bg-white px-10 py-4 flex justify-end gap-3">
        <button
          onClick={onReset}
          disabled={!hasChanges}
          className="px-5 py-2 rounded-[8px] border border-gray-300 text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Reset
        </button>
        <button
          onClick={onSubmit}
          disabled={!hasChanges}
          className="px-5 py-2 rounded-[8px] bg-[#1a1a2e] text-white text-[13px] font-semibold hover:bg-[#111827] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Submit
        </button>
      </div>
    </div>
  );
}

// ── Invoices & Inventory tab ──────────────────────────────────────────────────
function InvoicesInventoryTab() {
  const {
    enableTransactionalInvoice,
    setEnableTransactionalInvoice,
    transactionalMode,
    setTransactionalMode,
  } = useAppData();

  const [saved, setSaved] = useState({
    enableTransactionalInvoice,
    transactionalMode,
  });
  const [draft, setDraft] = useState({
    enableTransactionalInvoice,
    transactionalMode,
  });

  React.useEffect(() => {
    setSaved({ enableTransactionalInvoice, transactionalMode });
    setDraft({ enableTransactionalInvoice, transactionalMode });
  }, [enableTransactionalInvoice, transactionalMode]);

  const handleSubmit = () => {
    setSaved(draft);
    setEnableTransactionalInvoice(draft.enableTransactionalInvoice);
    setTransactionalMode(draft.transactionalMode);
  };
  const handleReset = () => setDraft(saved);

  return (
    <TabShell
      title="Invoices & Inventory Configuration"
      description="Configure permissions for invoices and inventory behaviors."
      hasChanges={JSON.stringify(draft) !== JSON.stringify(saved)}
      onReset={handleReset}
      onSubmit={handleSubmit}
      noCard
    >
      {/* Card 1 — Enable Transactional Invoice */}
      <div className={`bg-white border border-gray-200 rounded-[10px] px-6 mb-4 transition-colors ${draft.enableTransactionalInvoice ? "bg-indigo-50/50" : ""}`}>
        <div className="py-5 flex items-center justify-between gap-6">
          {/* Left: toggle + label */}
          <div className="flex items-center gap-4">
            <Toggle checked={draft.enableTransactionalInvoice} onChange={v => setDraft(d => ({ ...d, enableTransactionalInvoice: v }))} />
            <span className="text-[14px] font-bold text-gray-900">Enable transactional invoice</span>
          </div>

          {/* Right: segmented mode control */}
          <div className={`transition-opacity duration-200 ${!draft.enableTransactionalInvoice ? "opacity-40 pointer-events-none select-none" : ""}`}>
            <div className="flex items-center bg-gray-100 rounded-[8px] p-[3px] gap-[2px]">
              <button
                onClick={() => setDraft(d => ({ ...d, transactionalMode: "optional" }))}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-[6px] text-[13px] font-medium transition-all ${
                  draft.transactionalMode === "optional"
                    ? "bg-white text-[#1a1a2e] shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Unlock className="w-3.5 h-3.5" />
                Optional
              </button>
              <button
                onClick={() => setDraft(d => ({ ...d, transactionalMode: "strict" }))}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-[6px] text-[13px] font-medium transition-all ${
                  draft.transactionalMode === "strict"
                    ? "bg-white text-[#1a1a2e] shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                Strict
              </button>
            </div>
          </div>
        </div>
      </div>
    </TabShell>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export function SODNPermissionsPage({ initialTab, onBack }: Props) {
  const [activeTab, setActiveTab] = useState(initialTab);

  const renderTab = () => {
    switch (activeTab) {
      case "Reservations permissions":
        return <ReservationsTab onNavigateTo={setActiveTab} />;

      case "Sales orders permissions":
        return <SalesOrdersTab />;
      case "Delivery Notes permissions":
        return <EmptyTab title="Delivery Notes Configuration" description="Configure permissions for delivery note creation and management." />;
      case "Delivery Note Unloads permissions":
        return <EmptyTab title="Delivery Note Unloads Configuration" description="Configure permissions for delivery note unload operations." />;
      case "Return Note permissions":
        return <EmptyTab title="Return Note Configuration" description="Configure permissions for return note handling." />;
      case "Transfers permissions":
        return <EmptyTab title="Transfers Configuration" description="Configure permissions for inventory transfer operations." />;
      case "Invoices & Inventory permissions":
        return <InvoicesInventoryTab />;
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
