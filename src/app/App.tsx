import { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { ClientsPage } from "./components/clients/ClientsPage";
import { SalesOrders } from "./components/sales/SalesOrders";
import { SalesOrderDetails } from "./components/sales/SalesOrderDetails";
import { navItems } from "./components/Sidebar";
import { UnderDevelopment } from "./components/UnderDevelopment";
import { PlanogramPage } from "./components/planogram/PlanogramPage";
import { DeliveryNotesPage } from "./components/sales/DeliveryNotesPage";
import { DeliveryNoteDetailsPage } from "./components/sales/DeliveryNoteDetailsPage";
import { UnloadPage } from "./components/sales/UnloadPage";
import { UnloadDetailsPage } from "./components/sales/UnloadDetailsPage";
import { PickupNotesPage as ReturnNotesPage } from "./components/sales/PickupNotesPage";
import { PickupNoteDetailsPage as ReturnNoteDetailsPage } from "./components/sales/PickupNoteDetailsPage";
import { InvoicesPage } from "./components/sales/InvoicesPage";
import { InvoiceDetailsPage } from "./components/sales/InvoiceDetailsPage";
import { CreateSalesOrderPage } from "./components/sales/CreateSalesOrderPage";
import { CreateInvoicePage } from "./components/sales/CreateInvoicePage";
import ReservationDetailsPage from "./components/sales/ReservationDetailsPage";
import { ReservationDetailsPageV2 } from "./components/sales/ReservationDetailsPageV2";
import { TransfersPage } from "./components/sales/TransfersPage";
import { TransferDetailsPage } from "./components/sales/TransferDetailsPage";
import { SettingsPage } from "./components/SettingsPage";
import { SOLifeCyclePage } from "./components/lifecycle/SOLifeCyclePage";
import { SOLifeCyclePageV2 } from "./components/lifecycle/SOLifeCyclePageV2";
import { DNLifeCyclePage } from "./components/lifecycle/DNLifeCyclePage";
import { LifeCyclePlaceholderPage } from "./components/lifecycle/LifeCyclePlaceholderPage";
import { AppDataProvider, useAppData } from "./context/AppDataContext";

export default function App() {
  return (
    <AppDataProvider>
      <AppInner />
    </AppDataProvider>
  );
}

function AppInner() {
  const { resetData } = useAppData();
  const [currentRoute, setCurrentRoute] = useState("home");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedDNId, setSelectedDNId] = useState<string | null>(null);
  const [dnBackRoute, setDnBackRoute] = useState<string>("delivery-notes");
  const [selectedPNId, setSelectedPNId] = useState<string | null>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [selectedUnloadId, setSelectedUnloadId] = useState<string | null>(null);
  const [selectedTransferId, setSelectedTransferId] = useState<string | null>(null);

  const handleResetData = () => {
    resetData();
  };

  const getPageName = (route: string) => {
    for (const item of navItems) {
      if (item.route === route) return item.label;
      if (item.subItems) {
        const sub = item.subItems.find(s => s.route === route);
        if (sub) return sub.label;
      }
    }
    return route;
  };

  return (
    <div className="flex h-screen bg-[#f5f5f7] overflow-hidden">
      <Sidebar activeItem={currentRoute} onNavigate={setCurrentRoute} onReset={handleResetData} />
      {currentRoute === "clients" ? (
        <ClientsPage onBack={() => setCurrentRoute("home")} />
      ) : currentRoute === "sales-order-details" ? (
        <SalesOrderDetails
          orderId={selectedOrderId}
          onBack={() => setCurrentRoute("sales-orders")}
          onNavigateToDeliveryNotes={() => setCurrentRoute("delivery-notes")}
          onNavigateToDN={(dnId) => { setSelectedDNId(dnId); setDnBackRoute("sales-order-details"); setCurrentRoute("delivery-note-details"); }}
          onNavigateToInvoice={(invoiceId) => { setSelectedInvoiceId(invoiceId); setCurrentRoute("invoice-details"); }}
          onNavigateToTransfer={(id) => { setSelectedTransferId(id); setCurrentRoute("transfer-details"); }}
        />
      ) : currentRoute === "create-sales-order" ? (
        <CreateSalesOrderPage
          onBack={() => setCurrentRoute("sales-orders")}
          onNavigateToSO={(id) => { setSelectedOrderId(id); setCurrentRoute("sales-order-details"); }}
        />
      ) : currentRoute === "sales-orders" ? (
        <SalesOrders 
          onOrderClick={(id) => { setSelectedOrderId(id); setCurrentRoute("sales-order-details"); }} 
          onCreateSO={() => setCurrentRoute("create-sales-order")}
        />
      ) : currentRoute === "delivery-notes" ? (
        <DeliveryNotesPage
          onDNClick={(id) => { setSelectedDNId(id); setDnBackRoute("delivery-notes"); setCurrentRoute("delivery-note-details"); }}
          onSOClick={(id) => { setSelectedOrderId(id); setCurrentRoute("sales-order-details"); }}
          onNavigateToTransferDetails={(id) => { setSelectedTransferId(id); setCurrentRoute("transfer-details"); }}
        />
      ) : currentRoute === "dn-unloads" ? (
        <UnloadPage
          onUnloadClick={(id) => { setSelectedUnloadId(id); setCurrentRoute("unload-details"); }}
        />
      ) : currentRoute === "unload-details" ? (
        <UnloadDetailsPage
          unloadId={selectedUnloadId}
          onBack={() => setCurrentRoute("dn-unloads")}
          onNavigateToDN={(dnId) => { setSelectedDNId(dnId); setDnBackRoute("unload-details"); setCurrentRoute("delivery-note-details"); }}
          onNavigateToTransfer={(id) => { setSelectedTransferId(id); setCurrentRoute("transfer-details"); }}
        />
      ) : currentRoute === "delivery-note-details" ? (
        <DeliveryNoteDetailsPage
          dnId={selectedDNId}
          onBack={() => setCurrentRoute(dnBackRoute)}
          onNavigateToSO={(soId) => { setSelectedOrderId(soId); setCurrentRoute("sales-order-details"); }}
          onNavigateToUnload={() => setCurrentRoute("dn-unloads")}
          onNavigateToRN={(pnId) => { setSelectedPNId(pnId); setCurrentRoute("pickup-note-details"); }}
          onNavigateToTransfer={(id) => { setSelectedTransferId(id); setCurrentRoute("transfer-details"); }}
          isUnloadContext={dnBackRoute === "dn-unloads"}
        />
      ) : currentRoute === "pickup-note" ? (
        <ReturnNotesPage
          onRNClick={(id) => { setSelectedPNId(id); setCurrentRoute("pickup-note-details"); }}
          onSOClick={(id) => { setSelectedOrderId(id); setCurrentRoute("sales-order-details"); }}
        />
      ) : currentRoute === "pickup-note-details" ? (
        <ReturnNoteDetailsPage
          pnId={selectedPNId}
          onBack={() => setCurrentRoute("pickup-note")}
          onNavigateToSO={(soId) => { setSelectedOrderId(soId); setCurrentRoute("sales-order-details"); }}
          onNavigateToDN={(dnId) => { setSelectedDNId(dnId); setDnBackRoute("pickup-note-details"); setCurrentRoute("delivery-note-details"); }}
          onNavigateToTransfer={(id) => { setSelectedTransferId(id); setCurrentRoute("transfer-details"); }}
        />
      ) : currentRoute === "create-invoice" ? (
        <CreateInvoicePage 
          onBack={() => setCurrentRoute("invoices-inventory")} 
          onNavigateToInvoice={(id) => { setSelectedInvoiceId(id); setCurrentRoute("invoice-details"); }}
        />
      ) : currentRoute === "invoices-inventory" ? (
        <InvoicesPage
          onInvoiceClick={(id) => { setSelectedInvoiceId(id); setCurrentRoute("invoice-details"); }}
          onSOClick={(id) => { setSelectedOrderId(id); setCurrentRoute("sales-order-details"); }}
          onCreateInvoice={() => setCurrentRoute("create-invoice")}
        />
      ) : currentRoute === "invoice-details" ? (
        <InvoiceDetailsPage
          invoiceId={selectedInvoiceId}
          onBack={() => setCurrentRoute("invoices-inventory")}
          onNavigateToSO={(soId) => { setSelectedOrderId(soId); setCurrentRoute("sales-order-details"); }}
          onNavigateToDN={(dnId) => { setSelectedDNId(dnId); setDnBackRoute("invoice-details"); setCurrentRoute("delivery-note-details"); }}
          onCreateReturnNote={(invoiceId) => { setSelectedPNId(invoiceId); setCurrentRoute("pickup-note-details"); }}
        />
      ) : currentRoute === "transfers" ? (
        <TransfersPage
          onTransferClick={(id) => { setSelectedTransferId(id); setCurrentRoute("transfer-details"); }}
        />
      ) : currentRoute === "transfer-details" ? (
        <TransferDetailsPage
          transferId={selectedTransferId}
          onBack={() => setCurrentRoute("transfers")}
          onNavigateToDN={(dnId) => { setSelectedDNId(dnId); setDnBackRoute("transfer-details"); setCurrentRoute("delivery-note-details"); }}
          onNavigateToUnload={(id) => { setSelectedUnloadId(id); setCurrentRoute("unload-details"); }}
          onNavigateToRNDetails={(id) => { setSelectedPNId(id); setCurrentRoute("pickup-note-details"); }}
        />
      ) : currentRoute === "reservations" ? (
        <ReservationDetailsPage
          onNavigateToSO={(soId) => { setSelectedOrderId(soId); setCurrentRoute("sales-order-details"); }}
          onNavigateToDN={(dnId) => { setSelectedDNId(dnId); setDnBackRoute("reservations"); setCurrentRoute("delivery-note-details"); }}
          onNavigateToInvoice={(invoiceId) => { setSelectedInvoiceId(invoiceId); setCurrentRoute("invoice-details"); }}
        />
      ) : currentRoute === "reservations-v2" ? (
        <ReservationDetailsPageV2
          onNavigateToSO={(soId) => { setSelectedOrderId(soId); setCurrentRoute("sales-order-details"); }}
          onNavigateToDN={(dnId) => { setSelectedDNId(dnId); setDnBackRoute("reservations-v2"); setCurrentRoute("delivery-note-details"); }}
          onNavigateToInvoice={(invoiceId) => { setSelectedInvoiceId(invoiceId); setCurrentRoute("invoice-details"); }}
        />
      ) : currentRoute === "so-life-cycle" ? (
        <SOLifeCyclePage onNavigate={setCurrentRoute} />
      ) : currentRoute === "so-life-cycle-v2" ? (
        <SOLifeCyclePageV2 onNavigate={setCurrentRoute} />
      ) : currentRoute === "dn-life-cycle" ? (
        <DNLifeCyclePage onNavigate={setCurrentRoute} />
      ) : currentRoute === "invoice-life-cycle" ? (
        <LifeCyclePlaceholderPage activeRoute="invoice-life-cycle" pageName="Invoice Life Cycle" onNavigate={setCurrentRoute} />
      ) : currentRoute === "unload-life-cycle" ? (
        <LifeCyclePlaceholderPage activeRoute="unload-life-cycle" pageName="Unload Life Cycle" onNavigate={setCurrentRoute} />
      ) : currentRoute === "pickup-note-life-cycle" ? (
        <LifeCyclePlaceholderPage activeRoute="pickup-note-life-cycle" pageName="Return Note Life Cycle" onNavigate={setCurrentRoute} />
      ) : currentRoute === "settings" ? (
        <SettingsPage />
      ) : currentRoute === "home" ? (
        <Dashboard />
      ) : currentRoute === "planogram" ? (
        <PlanogramPage />
      ) : (
        <UnderDevelopment pageName={getPageName(currentRoute)} />
      )}
    </div>
  );
}
