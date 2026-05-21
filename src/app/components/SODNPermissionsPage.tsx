import React, { useState, useEffect } from "react";
import { ArrowLeft, Unlock, Lock, AlertTriangle, ArrowUpRight, Square, CheckSquare } from "lucide-react";
import { useAppData } from "../context/AppDataContext";

interface Props {
  initialTab: string;
  onBack: () => void;
  onNavigate?: (route: string) => void;
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
type DisableAction = "keep" | "remove";

const DISABLE_PHRASE: Record<DisableAction, string> = {
  keep:   "DISABLE RESERVATION MODEL",
  remove: "REMOVE ALL RESERVATIONS",
};

function DisableReservationModal({
  step,
  action,
  confirmText,
  onConfirmTextChange,
  onKeep,
  onRemove,
  onConfirm,
  onBack,
  onViewReservations,
  onCancel,
  activeReservations,
}: {
  step: 1 | 2;
  action: DisableAction | null;
  confirmText: string;
  onConfirmTextChange: (v: string) => void;
  onKeep: () => void;
  onRemove: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  onBack: () => void;
  onViewReservations: () => void;
  activeReservations: import("../context/AppDataContext").Reservation[];
}) {
  const isValid = action ? confirmText === DISABLE_PHRASE[action] : false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {step === 1 ? (
          <>
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-gray-900 leading-tight">Disable Reservation Model?</h3>
                  <p className="text-[13px] text-gray-500 mt-1.5 leading-relaxed">
                    Disabling the model while items are reserved may cause reservations to go negative, or leave invoiced items reserved without being delivered.
                  </p>
                </div>
              </div>

              {/* Reservations summary */}
              {activeReservations.length > 0 && (() => {
                return (
                  <div className="mb-4 flex items-center justify-between gap-4 px-4 py-3 rounded-[10px] bg-amber-50 border border-amber-200">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[20px] font-bold text-amber-700 leading-none">{activeReservations.length}</span>
                      <span className="text-[13px] text-amber-600 font-medium">active reservation{activeReservations.length !== 1 ? "s" : ""}</span>
                    </div>
                    <button
                      onClick={onViewReservations}
                      className="text-[12px] text-indigo-600 hover:underline font-medium shrink-0 flex items-center gap-0.5"
                    >
                      Review or manage manually
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                );
              })()}

              {/* Options */}
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={onKeep}
                  className="w-full text-left px-4 py-3.5 rounded-[10px] border border-amber-200 bg-amber-50/40 hover:border-amber-400 hover:bg-amber-50 transition-all group"
                >
                  <p className="text-[13px] font-semibold text-amber-800">Disable only</p>
                  <p className="text-[12px] text-amber-600/80 mt-0.5">Existing reservations are kept, but may cause negative stock or undelivered invoiced items.</p>
                </button>
                <button
                  onClick={onRemove}
                  className="w-full text-left px-4 py-3.5 rounded-[10px] border border-red-300 bg-red-50/40 hover:border-red-500 hover:bg-red-50 transition-all group"
                >
                  <p className="text-[13px] font-semibold text-red-700">Disable and remove all reservations</p>
                  <p className="text-[12px] mt-0.5 text-red-500/80">
                    All reservations will be permanently deleted. This cannot be undone.
                  </p>
                </button>
              </div>
            </div>
            <div className="flex justify-end px-6 py-4 bg-gray-50 border-t border-gray-100">
              <button onClick={onCancel} className="px-4 py-2 text-[13px] font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-white transition-colors cursor-pointer">
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="px-6 pt-5 pb-5">
              <button
                onClick={onBack}
                className="flex items-center gap-1 text-[12px] text-gray-400 hover:text-gray-700 transition-colors mb-4 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${action === "remove" ? "bg-red-50" : "bg-amber-50"}`}>
                  <AlertTriangle className={`w-5 h-5 ${action === "remove" ? "text-red-500" : "text-amber-500"}`} />
                </div>
                <div className="w-full">
                  <h3 className="text-[15px] font-bold text-gray-900 leading-tight">
                    {action === "remove" ? "Confirm removing all reservations" : "Confirm disabling the reservation model"}
                  </h3>
                  <p className="text-[13px] text-gray-500 mt-2 leading-relaxed">
                    Type <span className="font-semibold text-gray-800">{action === "remove" ? "Remove all reservations" : "Disable reservation model"}</span> in <span className="font-semibold text-gray-800">CAPITAL LETTERS</span> to confirm.
                  </p>
                  <input
                    autoFocus
                    type="text"
                    value={confirmText}
                    onChange={e => onConfirmTextChange(e.target.value)}
                    placeholder="Type here..."
                    className={`mt-3 w-full px-3 py-2 text-[13px] border rounded-lg outline-none transition-all placeholder:text-gray-300 ${
                      action === "remove"
                        ? "border-gray-300 focus:border-red-400 focus:ring-2 focus:ring-red-50"
                        : "border-gray-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-50"
                    }`}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
              <button onClick={onCancel} className="px-4 py-2 text-[13px] font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-white transition-colors cursor-pointer">
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={!isValid}
                className={`px-4 py-2 text-[13px] font-semibold text-white rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                  action === "remove" ? "bg-red-600 hover:bg-red-700" : "bg-[#1a1a2e] hover:bg-[#111827]"
                }`}
              >
                {action === "remove" ? "Disable and Remove" : "Disable"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Negative reservation warning modal ───────────────────────────────────────
function NegativeReservationWarningModal({
  onNavigate,
  onConfirm,
  onCancel,
}: {
  onNavigate: () => void;
  onConfirm: () => void;
  onCancel: () => void;
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
              <h3 className="text-[15px] font-bold text-gray-900 leading-tight">Disable Negative Reservation?</h3>
              <p className="text-[13px] text-gray-500 mt-2 leading-relaxed">
                While{" "}
                <button
                  onClick={onNavigate}
                  className="text-indigo-600 hover:underline font-medium cursor-pointer inline-flex items-center gap-0.5"
                >
                  Allow Sales Order approval without stock
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>{" "}
                is disabled, turning this off may prevent users from approving Sales Orders when stock is insufficient.
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
            onClick={onConfirm}
            className="px-4 py-2 text-[13px] font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors cursor-pointer"
          >
            Disable anyway
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
    >
      <ToggleRow
        label="Allow Sales Order approval without stock"
        description="When enabled, Sales Orders can be approved even if the selected warehouse has insufficient stock for some items. When disabled, the approval modal requires full stock coverage before confirming."
        checked={draft.approvalWithoutStock}
        onChange={v => setDraft(d => ({ ...d, approvalWithoutStock: v }))}
      />
    </TabShell>
  );
}

function ReservationsTab({ onNavigateTo, onNavigateToRoute }: { onNavigateTo: (tab: string) => void; onNavigateToRoute?: (route: string) => void }) {
  const {
    enableReservationModel, setEnableReservationModel,
    reservationMode, setReservationMode,
    allowMultiWarehouseReservation, setAllowMultiWarehouseReservation,
    allowNegativeReservation, setAllowNegativeReservation,
    preventInvoiceReservations, setPreventInvoiceReservations,
    allowSOApprovalWithoutStock,
    reservations,
    setReservations,
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
  const [disableModelAction, setDisableModelAction] = useState<DisableAction | null>(null);
  const [disableConfirmText, setDisableConfirmText] = useState("");
  const [showNegBlockedModal, setShowNegBlockedModal] = useState(false);

  // When reservation model is on and SO approval without stock is disabled,
  // negative reservation must stay forced on to avoid reservation creation failures.
  const isNegativeReservationForced =
    draft.enableReservationModel && draft.reservationMode === "strict" && !allowSOApprovalWithoutStock;

  const negAutoForcedRef = React.useRef(false);
  useEffect(() => {
    const constrained = draft.enableReservationModel && draft.reservationMode === "strict" && !allowSOApprovalWithoutStock;
    if (constrained && !negAutoForcedRef.current) {
      negAutoForcedRef.current = true;
      setDraft(d => ({ ...d, negativeReservation: true }));
    } else if (!constrained) {
      negAutoForcedRef.current = false;
    }
  }, [draft.enableReservationModel, draft.reservationMode, allowSOApprovalWithoutStock]);

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

  const handleDisableModelKeep = () => {
    setDisableModelAction("keep");
    setDisableModelStep(2);
  };

  const handleDisableModelRemove = () => {
    setDisableModelAction("remove");
    setDisableModelStep(2);
  };

  const handleDisableModelConfirm = () => {
    setDraft(d => ({ ...d, enableReservationModel: false }));
    if (disableModelAction === "remove") setReservations([]);
    setDisableModelStep(null);
    setDisableModelAction(null);
    setDisableConfirmText("");
  };

  const handleDisableModelCancel = () => {
    setDisableModelStep(null);
    setDisableModelAction(null);
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
          action={disableModelAction}
          confirmText={disableConfirmText}
          onConfirmTextChange={setDisableConfirmText}
          onKeep={handleDisableModelKeep}
          onRemove={handleDisableModelRemove}
          onConfirm={handleDisableModelConfirm}
          onCancel={handleDisableModelCancel}
          onBack={() => { setDisableModelStep(1); setDisableModelAction(null); setDisableConfirmText(""); }}
          onViewReservations={() => { handleDisableModelCancel(); onNavigateToRoute?.("reservations-v2"); }}
          activeReservations={reservations.filter(r => r.status === "ACTIVE")}
        />
      )}
      {showNegBlockedModal && (
        <NegativeReservationWarningModal
          onNavigate={() => {
            setShowNegBlockedModal(false);
            onNavigateTo("Sales orders permissions");
          }}
          onConfirm={() => {
            setDraft(d => ({ ...d, negativeReservation: false }));
            setShowNegBlockedModal(false);
          }}
          onCancel={() => setShowNegBlockedModal(false)}
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
        {/* Card — Enable Reservation Model + child permissions */}
        <div className={`bg-white border border-gray-200 rounded-[10px] px-6 transition-colors ${draft.enableReservationModel ? "bg-indigo-50/50" : ""}`}>
          {/* Enable toggle row */}
          <div className="pt-5 pb-3 flex items-center gap-4">
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

          {/* Mode radio options */}
          <div className={`pb-4 flex gap-3 transition-opacity duration-200 ${childrenDisabled ? "opacity-40 pointer-events-none select-none" : ""}`}>
            {(["flexible", "strict"] as const).map(mode => {
              const selected = draft.reservationMode === mode;
              return (
                <button
                  key={mode}
                  onClick={() => !selected && setPendingChange({ kind: "mode", value: mode })}
                  className={`flex flex-col gap-1.5 text-left cursor-pointer px-3.5 py-3 rounded-[10px] transition-colors ${selected ? "bg-indigo-50" : "bg-gray-50 hover:bg-gray-100"}`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${selected ? "border-indigo-500" : "border-gray-300"}`}>
                      {selected && <div className="w-2 h-2 rounded-full bg-indigo-500" />}
                    </div>
                    {mode === "flexible"
                      ? <Unlock className={`w-3.5 h-3.5 ${selected ? "text-indigo-500" : "text-gray-400"}`} />
                      : <Lock className={`w-3.5 h-3.5 ${selected ? "text-indigo-500" : "text-gray-400"}`} />
                    }
                    <span className={`text-[13px] font-semibold ${selected ? "text-indigo-700" : "text-gray-600"}`}>
                      {mode === "flexible" ? "Flexible" : "Strict"}
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-400 leading-snug pl-6">
                    {mode === "flexible"
                      ? "Reservations are optional — users can skip when needed."
                      : "Reservations are required after approving the order or invoicing."
                    }
                  </span>
                </button>
              );
            })}
          </div>

          {/* Sub-section: child permissions */}
          <div className={`mx-[-24px] mb-4 rounded-b-[10px] border-t border-gray-200 bg-gray-50/70 px-6 divide-y divide-gray-200 transition-opacity duration-200 ${childrenDisabled ? "opacity-40 pointer-events-none select-none" : ""}`}>
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
                <span className="text-[13px] text-amber-600 flex items-center gap-1 flex-wrap">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  Auto-enabled while{" "}
                  <button
                    onClick={() => onNavigateTo("Sales orders permissions")}
                    className="text-[13px] underline font-medium hover:text-amber-700 cursor-pointer inline-flex items-center gap-0.5"
                  >
                    Allow Sales Order approval without stock
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>{" "}
                  is disabled.
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

  const [saved, setSaved] = useState({ enableTransactionalInvoice, transactionalMode });
  const [draft, setDraft] = useState({ enableTransactionalInvoice, transactionalMode });

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
      {/* Card — Enable Non-Transactional Invoice */}
      <div className={`bg-white border border-gray-200 rounded-[10px] px-6 transition-colors ${draft.enableTransactionalInvoice ? "bg-indigo-50/50" : ""}`}>
        {/* Enable toggle row */}
        <div className="pt-5 pb-3 flex items-center gap-4">
          <Toggle checked={draft.enableTransactionalInvoice} onChange={v => setDraft(d => ({ ...d, enableTransactionalInvoice: v }))} />
          <span className="text-[14px] font-bold text-gray-900">Enable non-transactional invoice</span>
        </div>

        {/* 3-option radio — 'Mark as Delivered' default */}
        <div className={`pb-4 flex gap-3 transition-opacity duration-200 ${!draft.enableTransactionalInvoice ? "opacity-40 pointer-events-none select-none" : ""}`}>
          {([
            { mode: "unchecked" as const, icon: <Square className="w-3.5 h-3.5" />, label: "Unchecked by default", desc: "Checkbox opens unchecked. Users decide before confirming." },
            { mode: "checked"   as const, icon: <CheckSquare className="w-3.5 h-3.5" />, label: "Checked by default",   desc: "Checkbox opens pre-checked. Users can uncheck before confirming." },
            { mode: "strict"    as const, icon: <span className="relative inline-flex shrink-0"><Square className="w-3.5 h-3.5" /><Lock className="w-2 h-2 absolute -bottom-0.5 -right-1" /></span>, label: "Strict — always unchecked", desc: "Invoice is always non-transactional. The checkbox is locked and cannot be changed." },
          ]).map(({ mode, icon, label, desc }) => {
            const selected = draft.transactionalMode === mode;
            return (
              <button
                key={mode}
                onClick={() => setDraft(d => ({ ...d, transactionalMode: mode }))}
                className={`flex flex-col gap-1.5 text-left cursor-pointer px-3.5 py-3 rounded-[10px] transition-colors ${selected ? "bg-indigo-50" : "bg-gray-50 hover:bg-gray-100"}`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${selected ? "border-indigo-500" : "border-gray-300"}`}>
                    {selected && <div className="w-2 h-2 rounded-full bg-indigo-500" />}
                  </div>
                  <span className={`w-3.5 h-3.5 ${selected ? "text-indigo-500" : "text-gray-400"}`}>{icon}</span>
                  <span className={`text-[13px] font-semibold ${selected ? "text-indigo-700" : "text-gray-600"}`}>{label}</span>
                </div>
                <span className="text-[11px] text-gray-400 leading-snug pl-6">{desc}</span>
              </button>
            );
          })}
        </div>
      </div>
    </TabShell>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export function SODNPermissionsPage({ initialTab, onBack, onNavigate }: Props) {
  const [activeTab, setActiveTab] = useState(initialTab);

  const renderTab = () => {
    switch (activeTab) {
      case "Reservations permissions":
        return <ReservationsTab onNavigateTo={setActiveTab} onNavigateToRoute={onNavigate} />;

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
