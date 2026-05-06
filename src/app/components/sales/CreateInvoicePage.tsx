import { useState } from "react";
import { ArrowLeft, Edit2, ChevronDown, Check } from "lucide-react";
import { Switch } from "../ui/switch";
import { ItemsTable, CartRow } from "./ItemsTable";
import { useAppData, InvoiceRecord } from "../../context/AppDataContext";
import { useRef } from "react";

interface CreateInvoicePageProps {
  onBack: () => void;
  onSave?: (data: any) => void;
  onNavigateToInvoice?: (id: string) => void;
}

export function CreateInvoicePage({ onBack, onSave, onNavigateToInvoice }: CreateInvoicePageProps) {
  const { setInvoices } = useAppData();
  const tableRef = useRef<{ addRow: () => void; addReturnRow: () => void }>({ addRow: () => {}, addReturnRow: () => {} });
  const [rep, setRep] = useState("");
  const [client, setClient] = useState("");
  const [warehouse, setWarehouse] = useState("");
  const [isDelivered, setIsDelivered] = useState(false);
  const [posMode, setPosMode] = useState(false);
  const [clearKey, setClearKey] = useState(0);
  const [cartRows, setCartRows] = useState<CartRow[]>([]);
  const [saved, setSaved] = useState(false);

  const canAddItem = client.length > 0 && warehouse.length > 0;

  function handleClearCart() {
    setRep("");
    setClient("");
    setWarehouse("");
    setIsDelivered(false);
    setClearKey(k => k + 1);
  }

  function handleSave() {
    const data = { rep, client, warehouse, isDelivered, items: cartRows };
    onSave?.(data);

    const itemsData: OrderItem[] = cartRows.map(row => ({
      id: row.productId || `item-${Math.random()}`,
      name: row.productName || "Unknown Item",
      sku: row.productId || "-",
      unit: row.unit || "Piece",
      totalQty: row.qty || 0,
      deliveredQty: isDelivered ? row.qty : 0,
      notedQty: 0,
      price: row.price || 0,
      tax: row.tax || 0,
    }));

    const totalStr = cartRows.reduce((sum, r) => sum + (r.isReturn ? -r.lineTotal : r.lineTotal), 0).toFixed(2);
    const newInvoice: InvoiceRecord = {
      id: `INV-${Date.now()}`,
      serialNo: `INV-2026-${Math.floor(Math.random() * 1000)}`,
      externalSerial: "-",
      issueDate: new Date().toLocaleDateString("en-GB"),
      creator: rep || "Admin",
      clientName: client,
      items: cartRows.length,
      total: `JOD ${totalStr}`,
      balance: `JOD ${totalStr}`,
      paymentType: "Cash",
      status: "APPROVED",
      delivery: isDelivered ? "Delivered" : "No DN",
      comment: "",
      itemsData,
    };

    setInvoices(prev => [newInvoice, ...prev]);

    setSaved(true);
    setTimeout(() => { 
      setSaved(false); 
      if (onNavigateToInvoice) {
        onNavigateToInvoice(newInvoice.id);
      } else {
        onBack(); 
      }
    }, 500); // Shorter delay for better UX
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#e8e8ec] shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors text-[#1a1a2e]"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-[20px] font-bold text-[#1a1a2e]">Create Invoice</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleClearCart}
            className="px-4 py-2 rounded-md bg-[#ff6b6b] hover:bg-[#fa5252] text-white text-[13px] font-medium transition-colors shadow-sm"
          >
            Clear Cart
          </button>
          <button
            onClick={onBack}
            className="px-4 py-2 border border-[#d0d0dc] rounded-md bg-white hover:bg-gray-50 text-[13px] font-medium text-[#4a4a5a] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!client || !warehouse || cartRows.length === 0}
            className="px-5 py-2 rounded-md bg-[#a855f7] hover:bg-[#9333ea] text-white text-[13px] font-medium transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saved ? "Saved!" : "Save"}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 pb-16" style={{ scrollbarWidth: "thin", scrollbarColor: "#d0d0dc #f7f7f9" }}>
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Left Column */}
          <div className="flex-1 space-y-5">
            <div>
              <label className="block text-[13px] font-medium text-[#1a1a2e] mb-1.5">Serial #:</label>
              <input
                type="text"
                placeholder="Serial #"
                className="w-full px-3 py-2 rounded-md border border-[#e8e8ec] text-[13px] outline-none focus:border-[#a855f7] bg-[#fafafa]"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#1a1a2e] mb-1.5">External Serial #:</label>
              <input
                type="text"
                placeholder="External Serial #"
                className="w-full px-3 py-2 rounded-md border border-[#e8e8ec] text-[13px] outline-none focus:border-[#a855f7]"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#1a1a2e] mb-1.5">Select Rep</label>
              <input
                type="text"
                placeholder="Search representative"
                value={rep}
                onChange={e => setRep(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-[#e8e8ec] text-[13px] outline-none focus:border-[#a855f7]"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#1a1a2e] mb-1.5">
                Select client <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Search Client"
                value={client}
                onChange={e => setClient(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-[#e8e8ec] text-[13px] outline-none focus:border-[#a855f7]"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#1a1a2e] mb-1.5">
                Select Warehouse <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={warehouse}
                  onChange={e => setWarehouse(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-[#e8e8ec] text-[13px] outline-none focus:border-[#a855f7] appearance-none"
                >
                  <option value="">Select Warehouse</option>
                  <option value="Main">Main Branch</option>
                  <option value="Zarqaa">Zarqaa Warehouse</option>
                  <option value="Maram">Maram</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-2.5 text-[#8b8b9e] pointer-events-none" />
              </div>
            </div>

            {/* Mark as delivered — creates inventory transaction */}
            <div
              className="flex items-center gap-2 pt-2 cursor-pointer"
              onClick={() => setIsDelivered(!isDelivered)}
            >
              <div className={`w-4 h-4 rounded-[4px] border border-[#d0d0dc] flex items-center justify-center transition-colors ${
                isDelivered ? "bg-[#a855f7] border-[#a855f7]" : "bg-white"
              }`}>
                {isDelivered && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className="text-[13px] font-medium text-[#1a1a2e]">Mark as delivered</span>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex-1 space-y-5">
            <div>
              <label className="block text-[13px] font-medium text-[#1a1a2e] mb-1.5">
                Issue Date <span className="text-red-500">*</span>:
              </label>
              <input
                type="date"
                defaultValue="2026-04-22"
                className="w-full px-3 py-2 rounded-md border border-[#e8e8ec] text-[13px] outline-none focus:border-[#a855f7] text-[#4a4a5a]"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#1a1a2e] mb-1.5">
                Due Date <span className="text-red-500">*</span>:
              </label>
              <input
                type="date"
                defaultValue="2026-04-22"
                className="w-full px-3 py-2 rounded-md border border-[#e8e8ec] text-[13px] outline-none focus:border-[#a855f7] text-[#4a4a5a]"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#1a1a2e] mb-1.5">Custom Status:</label>
              <input
                type="text"
                placeholder="Custom Status"
                className="w-full px-3 py-2 rounded-md border border-[#e8e8ec] text-[13px] outline-none focus:border-[#a855f7]"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-[13px] font-medium text-[#1a1a2e]">Credit limit & Balance:</label>
              <button className="text-[13px] font-semibold text-[#8b5cf6] flex items-center gap-1 hover:underline">
                Show <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#1a1a2e] mb-1.5">Comment:</label>
              <div className="relative">
                <textarea className="w-full px-3 py-2 rounded-md border border-[#e8e8ec] text-[13px] outline-none focus:border-[#a855f7] min-h-[40px] resize-none" />
                <Edit2 className="w-3.5 h-3.5 text-[#4f6ef7] absolute right-3 bottom-3 cursor-pointer" />
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="mt-8 mb-4 py-4 border-t border-[#e8e8ec] flex items-center justify-between">
          <button 
            disabled={!canAddItem}
            onClick={() => tableRef.current.addReturnRow()}
            className="px-5 py-2 rounded-md bg-[#ff6b6b] hover:bg-[#fa5252] text-white text-[13px] font-medium transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
            Add Return Items
          </button>
          <div className="flex items-center gap-3">
            <span className="text-[13px] font-bold text-[#1a1a2e]">POS Mode</span>
            <Switch checked={posMode} onCheckedChange={setPosMode} />
          </div>
        </div>

        {/* Items */}
        <div className="mt-2">
          <h2 className="text-[16px] font-bold text-[#1a1a2e] mb-4">Items</h2>
          <ItemsTable
            disabled={!canAddItem}
            totalLabel="Total"
            clearKey={clearKey}
            onRowsChange={setCartRows}
            refRows={tableRef.current}
          />
        </div>
      </div>
    </div>
  );
}
