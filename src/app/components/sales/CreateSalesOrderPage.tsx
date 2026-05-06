import { useState } from "react";
import { ArrowLeft, Edit2, ChevronDown, UploadCloud } from "lucide-react";
import { ItemsTable, CartRow } from "./ItemsTable";
import { useAppData, SalesOrderRecord } from "../../context/AppDataContext";

interface CreateSalesOrderPageProps {
  onBack: () => void;
  onSave?: (data: any) => void;
  onNavigateToSO?: (id: string) => void;
}

export function CreateSalesOrderPage({ onBack, onSave, onNavigateToSO }: CreateSalesOrderPageProps) {
  const { setSalesOrders } = useAppData();
  const [rep, setRep] = useState("");
  const [client, setClient] = useState("");
  const [clearKey, setClearKey] = useState(0);
  const [cartRows, setCartRows] = useState<CartRow[]>([]);
  const [saved, setSaved] = useState(false);

  const canAddItem = client.length > 0;

  function handleClearCart() {
    setRep("");
    setClient("");
    setClearKey(k => k + 1);
  }

  function handleSave() {
    const data = { rep, client, items: cartRows };
    onSave?.(data);

    const newId = `so-${Date.now()}`;
    const itemsData: OrderItem[] = cartRows.map(row => ({
      id: row.productId || `item-${Math.random()}`,
      name: row.productName || "Unknown Item",
      sku: row.productId || "-",
      unit: row.unit || "Piece",
      totalQty: row.qty || 0,
      deliveredQty: 0,
      notedQty: 0,
      price: row.price || 0,
      tax: row.tax || 0,
    }));

    const newSO: SalesOrderRecord = {
      id: newId,
      orderNo: `PRO-ADM-${Math.floor(Math.random() * 9000 + 1000)}`,
      issueDate: new Date().toLocaleDateString("en-GB"),
      externalSerial: "-",
      time: new Date().toLocaleString("en-GB"),
      version: "0",
      creator: rep || "Admin",
      editor: rep || "Admin",
      clientName: client,
      clientCode: "-",
      geoTag: false,
      items: cartRows.length,
      total: `JOD ${cartRows.reduce((s, r) => s + (r.isReturn ? -r.lineTotal : r.lineTotal), 0).toFixed(2)}`,
      customStatus: "-",
      status: "pending",
      deliveryStatus: "Undelivered",
      visitId: "-",
      itemsData,
    };
    setSalesOrders(prev => [newSO, ...prev]);

    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      if (onNavigateToSO) onNavigateToSO(newId);
      else onBack();
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
          <h1 className="text-[20px] font-bold text-[#1a1a2e]">Create Sales Order</h1>
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
            disabled={!client || cartRows.length === 0}
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
              <label className="block text-[13px] font-medium text-[#1a1a2e] mb-1.5">Search representative:</label>
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

            <div className="text-[13px] font-medium text-[#1a1a2e]">
              Version #: 0
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#1a1a2e] mb-1.5">Comment:</label>
              <div className="relative">
                <textarea className="w-full px-3 py-2 rounded-md border border-[#e8e8ec] text-[13px] outline-none focus:border-[#a855f7] min-h-[40px] resize-none" />
                <Edit2 className="w-3.5 h-3.5 text-[#4f6ef7] absolute left-3 top-3 cursor-pointer" />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex-1 space-y-5">
            <div>
              <label className="block text-[13px] font-medium text-[#1a1a2e] mb-1.5">Order Status:</label>
              <div className="flex items-center justify-between px-3 py-2 rounded-md bg-[#f5f5f7] border border-[#e8e8ec] text-[13px] text-[#8b8b9e]">
                <span>pending</span>
                <span className="cursor-pointer tracking-widest leading-none pb-2 text-lg">...</span>
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#1a1a2e] mb-1.5">Order Date:</label>
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
              <label className="block text-[13px] font-medium text-[#1a1a2e] mb-1.5">Media:</label>
              <div className="mt-1 flex justify-center px-6 pt-8 pb-8 border border-[#c4c4e0] border-dashed rounded-md hover:bg-gray-50 transition-colors cursor-pointer bg-[#fbfbfe]">
                <div className="space-y-1 text-center flex flex-col items-center">
                  <UploadCloud className="w-8 h-8 text-[#b0b0be] mb-2" />
                  <div className="flex text-[13px] text-[#8b8b9e]">
                    <span>Upload or Drag Files/Images</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="mt-10">
          <h2 className="text-[16px] font-bold text-[#1a1a2e] mb-4">Items</h2>
          <ItemsTable
            disabled={!canAddItem}
            totalLabel="Grand Total"
            clearKey={clearKey}
            onRowsChange={setCartRows}
          />
        </div>
      </div>
    </div>
  );
}
