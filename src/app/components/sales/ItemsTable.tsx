import { useState, useEffect } from "react";
import { Trash2, Gift, Copy, Edit2, ChevronDown, ChevronRight, X } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../ui/table";

// ── mock catalogue ───────────────────────────────────────────────────────────
const MOCK_PRODUCTS = [
  {
    id: "p1", name: "Compressor ADD",
    variants: [
      { id: "p1v1", name: "Compressor", price: 451, taxRate: 0.15, units: ["5 Liters", "Piece", "Box"] },
    ],
  },
  {
    id: "p2", name: "American Coffee",
    variants: [
      { id: "p2v1", name: "Regular", price: 4.00, taxRate: 0.1375, units: ["Piece", "Pack"] },
      { id: "p2v2", name: "Large",   price: 5.50, taxRate: 0.1375, units: ["Piece"] },
    ],
  },
  {
    id: "p3", name: "Croissant",
    variants: [
      { id: "p3v1", name: "Plain",     price: 2.50, taxRate: 0.14, units: ["Piece"] },
      { id: "p3v2", name: "Chocolate", price: 3.00, taxRate: 0.14, units: ["Piece"] },
    ],
  },
];

const MOCK_PROMOTIONS = [
  { id: "promo1", name: "buy one get one" },
  { id: "promo2", name: "10% off total" },
  { id: "promo3", name: "Free delivery" },
];

// ── types ────────────────────────────────────────────────────────────────────
interface LineItem {
  id: string;
  productId: string;
  variantId: string;
  price: number;
  editingPrice: boolean;
  unit: string;
  qty: number;
  taxRate: number;
  promotionId: string;
  isReturn?: boolean;
}

function newRow(): LineItem {
  return {
    id: `row-${Date.now()}-${Math.random()}`,
    productId: "", variantId: "", price: 0,
    editingPrice: false, unit: "", qty: 1, taxRate: 0, promotionId: "", isReturn: false,
  };
}

export function newReturnRow(): LineItem {
  return {
    ...newRow(),
    isReturn: true,
  };
}

export interface CartRow {
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
  price: number;
  unit: string;
  qty: number;
  total: number;
  tax: number;
  lineTotal: number;
  promotionId: string;
  isReturn?: boolean;
}

interface ItemsTableProps {
  disabled?: boolean;
  totalLabel?: string;
  clearKey?: number;
  onRowsChange?: (rows: CartRow[]) => void;
  refRows?: { addRow: () => void; addReturnRow: () => void };
}

// ── component ────────────────────────────────────────────────────────────────
export function ItemsTable({
  disabled = false,
  totalLabel = "Total",
  clearKey = 0,
  onRowsChange,
  refRows,
}: ItemsTableProps) {
  const [rows, setRows] = useState<LineItem[]>([]);
  const [promoModal, setPromoModal] = useState<{ open: boolean; rowId: string; tempId: string }>({
    open: false, rowId: "", tempId: "",
  });

  // Reset rows when parent triggers a clear
  useEffect(() => {
    if (clearKey > 0) setRows([]);
  }, [clearKey]);

  useEffect(() => {
    if (refRows) {
      refRows.addRow = addRow;
      refRows.addReturnRow = addReturnRow;
    }
  }, [refRows]);

  // Notify parent on every rows change
  useEffect(() => {
    if (!onRowsChange) return;
    onRowsChange(rows.map(r => {
      const product = MOCK_PRODUCTS.find(p => p.id === r.productId);
      const variant = product?.variants.find(v => v.id === r.variantId);
      const rowTotal = r.price * r.qty;
      return {
        productId: r.productId,
        productName: product?.name ?? "",
        variantId: r.variantId,
        variantName: variant?.name ?? "",
        price: r.price,
        unit: r.unit,
        qty: r.qty,
        total: rowTotal,
        tax: rowTotal * r.taxRate,
        lineTotal: rowTotal + rowTotal * r.taxRate,
        promotionId: r.promotionId,
        isReturn: r.isReturn,
      };
    }));
  }, [rows]);

  // ── row mutations ──────────────────────────────────────────────────────────
  function addRow() {
    setRows(prev => [...prev, newRow()]);
  }

  function addReturnRow() {
    setRows(prev => [...prev, newReturnRow()]);
  }

  function deleteRow(id: string) {
    setRows(prev => prev.filter(r => r.id !== id));
  }

  function copyRow(id: string) {
    setRows(prev => {
      const idx = prev.findIndex(r => r.id === id);
      if (idx === -1) return prev;
      const copy: LineItem = { ...prev[idx], id: `row-${Date.now()}-copy` };
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
  }

  function updateRow(id: string, patch: Partial<LineItem>) {
    setRows(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));
  }

  function handleProductChange(id: string, productId: string) {
    const product = MOCK_PRODUCTS.find(p => p.id === productId);
    if (!product) {
      updateRow(id, { productId, variantId: "", price: 0, unit: "", taxRate: 0 });
      return;
    }
    const v = product.variants[0];
    updateRow(id, { productId, variantId: v.id, price: v.price, unit: v.units[0] ?? "", taxRate: v.taxRate });
  }

  function handleVariantChange(id: string, variantId: string, productId: string) {
    const product = MOCK_PRODUCTS.find(p => p.id === productId);
    const v = product?.variants.find(vv => vv.id === variantId);
    if (!v) return;
    updateRow(id, { variantId, price: v.price, unit: v.units[0] ?? "", taxRate: v.taxRate });
  }

  // ── totals ─────────────────────────────────────────────────────────────────
  const subTotal  = rows.reduce((s, r) => s + (r.isReturn ? -r.price * r.qty : r.price * r.qty), 0);
  const taxAmount = rows.reduce((s, r) => s + (r.isReturn ? -r.price * r.qty * r.taxRate : r.price * r.qty * r.taxRate), 0);
  const grandTotal = subTotal + taxAmount;

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="border border-[#e8e8ec] rounded-lg overflow-hidden bg-white">
        <Table>
          <TableHeader className="bg-[#1e293b]">
            <TableRow className="hover:bg-[#1e293b]">
              {["#","PRODUCT NAME","VARIANT","PRICE","MEASUREUNIT/QUANTITY","BATCHES","TOTAL","TAX","LINE TOTAL","ACTION"].map(h => (
                <TableHead key={h} className="text-[11px] font-medium text-gray-300 tracking-wider h-10 py-0 uppercase whitespace-nowrap px-3">
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="h-16 text-center text-[#8b8b9e] text-[13px]">
                  No items added yet.
                </TableCell>
              </TableRow>
            ) : rows.map((row, idx) => {
              const product = MOCK_PRODUCTS.find(p => p.id === row.productId);
              const variants = product?.variants ?? [];
              const variant  = variants.find(v => v.id === row.variantId);
              const units    = variant?.units ?? [];
              const rowTotal    = row.price * row.qty;
              const rowTax      = rowTotal * row.taxRate;
              const rowLineTotal = rowTotal + rowTax;
              const multiplier = row.isReturn ? -1 : 1;

              return (
                <TableRow key={row.id} className={`border-b border-[#f0f0f5] ${row.isReturn ? 'bg-red-50' : ''}`}>
                  {/* # */}
                  <TableCell className="text-[13px] text-[#4a4a5a] w-8 px-3">{idx + 1}</TableCell>

                  {/* Product Name */}
                  <TableCell className="px-2 min-w-[160px]">
                    <div className="relative">
                      <select
                        value={row.productId}
                        onChange={e => handleProductChange(row.id, e.target.value)}
                        className="w-full pl-2 pr-6 py-1.5 rounded border border-[#e8e8ec] text-[12px] text-[#4a4a5a] outline-none focus:border-[#a855f7] appearance-none bg-white"
                      >
                        <option value="">Select product</option>
                        {MOCK_PRODUCTS.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 absolute right-1.5 top-2 text-[#8b8b9e] pointer-events-none" />
                      {row.isReturn && (
                        <div className="absolute -bottom-4 left-0 text-[9px] text-red-500 font-medium whitespace-nowrap">
                          To be Received via Rep Unload
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Variant */}
                  <TableCell className="px-2 min-w-[130px]">
                    <div className="relative">
                      <select
                        value={row.variantId}
                        onChange={e => handleVariantChange(row.id, e.target.value, row.productId)}
                        disabled={!row.productId}
                        className="w-full pl-2 pr-6 py-1.5 rounded border border-[#e8e8ec] text-[12px] text-[#4a4a5a] outline-none focus:border-[#a855f7] appearance-none bg-white disabled:bg-[#fafafa] disabled:text-[#b0b0be]"
                      >
                        <option value="">Select variant</option>
                        {variants.map(v => (
                          <option key={v.id} value={v.id}>{v.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 absolute right-1.5 top-2 text-[#8b8b9e] pointer-events-none" />
                    </div>
                  </TableCell>

                  {/* Price */}
                  <TableCell className="px-2 min-w-[100px]">
                    <div className="flex items-center gap-1.5">
                      {row.editingPrice ? (
                        <input
                          autoFocus
                          type="number"
                          value={row.price}
                          onChange={e => updateRow(row.id, { price: parseFloat(e.target.value) || 0 })}
                          onBlur={() => updateRow(row.id, { editingPrice: false })}
                          className="w-16 px-1.5 py-1 rounded border border-[#a855f7] text-[12px] outline-none"
                        />
                      ) : (
                        <span className="text-[12px] text-[#4a4a5a] min-w-[32px]">
                          {row.price > 0 ? row.price : ""}
                        </span>
                      )}
                      <button
                        onClick={() => updateRow(row.id, { editingPrice: !row.editingPrice })}
                        className="text-[#4f6ef7] hover:text-[#3a57d4] shrink-0"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </TableCell>

                  {/* MeasureUnit / Quantity */}
                  <TableCell className="px-2 min-w-[170px]">
                    <div className="flex items-center gap-1.5">
                      <div className="relative">
                        <select
                          value={row.unit}
                          onChange={e => updateRow(row.id, { unit: e.target.value })}
                          disabled={!units.length}
                          className="pl-2 pr-6 py-1.5 rounded border border-[#e8e8ec] text-[12px] text-[#4a4a5a] outline-none focus:border-[#a855f7] appearance-none bg-white disabled:bg-[#fafafa] w-[90px]"
                        >
                          <option value="">Measur...</option>
                          {units.map(u => (
                            <option key={u} value={u}>{u}</option>
                          ))}
                        </select>
                        <ChevronDown className="w-3 h-3 absolute right-1.5 top-2 text-[#8b8b9e] pointer-events-none" />
                      </div>
                      <input
                        type="number"
                        min={1}
                        value={row.qty}
                        onChange={e => updateRow(row.id, { qty: Math.max(1, parseInt(e.target.value) || 1) })}
                        className="w-12 px-1.5 py-1.5 rounded border border-[#e8e8ec] text-[12px] text-center outline-none focus:border-[#a855f7]"
                      />
                    </div>
                  </TableCell>

                  {/* Batches */}
                  <TableCell className="px-3 whitespace-nowrap">
                    <button className="text-[#a855f7] text-[12px] font-semibold hover:text-[#9333ea] transition-colors">
                      Add Batches
                    </button>
                  </TableCell>

                  {/* Total */}
                  <TableCell className="px-3">
                    <span className={`text-[12px] font-medium ${row.isReturn ? 'text-red-600' : 'text-[#4a4a5a]'}`}>
                      {(rowTotal * multiplier).toFixed(3)}
                    </span>
                  </TableCell>

                  {/* Tax */}
                  <TableCell className="px-3">
                    <span className={`text-[12px] font-medium ${row.isReturn ? 'text-red-600' : 'text-[#4a4a5a]'}`}>
                      {(rowTax * multiplier).toFixed(3)}
                    </span>
                  </TableCell>

                  {/* Line Total */}
                  <TableCell className="px-3">
                    <span className={`text-[12px] font-medium ${row.isReturn ? 'text-red-600' : 'text-[#4a4a5a]'}`}>
                      {(rowLineTotal * multiplier).toFixed(3)}
                    </span>
                  </TableCell>

                  {/* Action */}
                  <TableCell className="px-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPromoModal({ open: true, rowId: row.id, tempId: row.promotionId })}
                        title="Add promotion"
                        className={`transition-colors ${row.promotionId ? "text-amber-500" : "text-[#8b8b9e] hover:text-amber-500"}`}
                      >
                        <Gift className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteRow(row.id)}
                        title="Delete"
                        className="text-[#8b8b9e] hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => copyRow(row.id)}
                        title="Duplicate"
                        className="text-[#8b8b9e] hover:text-[#4a4a5a] transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Add Item */}
      <div className="mt-4 flex justify-end gap-2">
        <button
          disabled={disabled}
          onClick={addRow}
          title={disabled ? "Select required fields first" : ""}
          className={`px-6 py-2 rounded-md text-[13px] font-medium transition-colors shadow-sm ${
            disabled
              ? "bg-[#e9d5ff] text-white cursor-not-allowed"
              : "bg-[#a855f7] hover:bg-[#9333ea] text-white"
          }`}
        >
          Add Item
        </button>
      </div>

      {/* Totals */}
      <div className="mt-6 flex flex-col items-start gap-1.5 text-[13px] text-[#4a4a5a]">
        <div className="flex gap-2">
          <span>Sub Total:</span>
          <span className="font-medium text-[#1a1a2e]">{subTotal.toFixed(2)}</span>
        </div>
        <div className="flex gap-2">
          <span>Discount Amount :</span>
          <span className="font-medium text-[#1a1a2e]">0.00</span>
        </div>
        <div className="flex gap-2">
          <span>Taxable Subtotal :</span>
          <span className="font-medium text-[#1a1a2e]">{subTotal.toFixed(2)}</span>
        </div>
        <div className="flex gap-2">
          <span>Tax Amount :</span>
          <span className="font-medium text-[#1a1a2e]">{taxAmount.toFixed(2)}</span>
        </div>
        <div className="flex gap-2 mt-1">
          <span className="font-bold text-[#1a1a2e]">{totalLabel}:</span>
          <span className="font-bold text-[#1a1a2e]">{grandTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Promotion modal */}
      {promoModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setPromoModal(p => ({ ...p, open: false }))}
          />
          <div className="relative bg-white rounded-xl shadow-2xl w-[360px] overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e8e8ec]">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-[#1a1a2e]" />
                <span className="text-[15px] font-semibold text-[#1a1a2e]">Promotion selection</span>
              </div>
              <button
                onClick={() => setPromoModal(p => ({ ...p, open: false }))}
                className="text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Promotion list */}
            <div className="py-1">
              {MOCK_PROMOTIONS.map(promo => (
                <button
                  key={promo.id}
                  onClick={() => setPromoModal(p => ({ ...p, tempId: promo.id }))}
                  className={`w-full flex items-center justify-between px-5 py-3.5 text-[13px] hover:bg-[#f5f5f7] transition-colors ${
                    promoModal.tempId === promo.id
                      ? "bg-[#f5f3ff] text-[#a855f7] font-medium"
                      : "text-[#1a1a2e]"
                  }`}
                >
                  <span>{promo.name}</span>
                  <ChevronRight className="w-4 h-4 text-[#8b8b9e]" />
                </button>
              ))}
            </div>
            {/* Modal footer */}
            <div className="flex justify-end gap-2 px-5 py-4 border-t border-[#e8e8ec]">
              <button
                onClick={() => setPromoModal(p => ({ ...p, open: false }))}
                className="px-4 py-2 rounded-md border border-[#d0d0dc] text-[13px] font-medium text-[#4a4a5a] hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateRow(promoModal.rowId, { promotionId: promoModal.tempId });
                  setPromoModal(p => ({ ...p, open: false }));
                }}
                className="px-4 py-2 rounded-md bg-[#a855f7] hover:bg-[#9333ea] text-white text-[13px] font-medium transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
