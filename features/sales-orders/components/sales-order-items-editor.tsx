import { useState } from "react";
import { SalesOrder, SalesOrderItem, CreateSalesOrderItemRequest, UpdateSalesOrderItemRequest } from "../../../types/sales-order";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { CurrencyInput } from "../../../components/ui/currency-input";
import { Trash2, Plus, Save, Loader2, Edit2, X } from "lucide-react";
import { formatMoney } from "../../../lib/utils";
import { productApi } from "../../products/api";
import { useProductVariant } from "../../products/hooks/use-products";
import { AsyncSearchableSelect } from "../../../components/ui/async-searchable-select";

function VariantDisplayName({ variantId, initialName, initialSku, color, size }: { variantId: string, initialName?: string, initialSku?: string, color?: string, size?: string }) {
  const { data } = useProductVariant(initialName ? undefined : variantId);
  const name = initialName || data?.product?.name || `Product ID: ${variantId}`;
  const sku = initialSku || data?.sku;
  const vColor = color || data?.color;
  const vSize = size || data?.size;
  
  return (
    <>
      <div className="font-semibold text-slate-800">
        {name}
        {vColor && vSize && ` (${vColor} / ${vSize})`}
      </div>
      <div className="text-xs text-slate-500">
        {sku && <span className="mr-2">{sku}</span>}
      </div>
    </>
  );
}

interface SalesOrderItemsEditorProps {
  order: SalesOrder;
  onAddItem: (data: CreateSalesOrderItemRequest) => Promise<void>;
  onUpdateItem: (itemId: string, data: UpdateSalesOrderItemRequest) => Promise<void>;
  onRemoveItem: (itemId: string) => Promise<void>;
  isReadOnly: boolean;
  isLoading: boolean;
}

export function SalesOrderItemsEditor({ 
  order, 
  onAddItem, 
  onUpdateItem, 
  onRemoveItem, 
  isReadOnly,
  isLoading 
}: SalesOrderItemsEditorProps) {
  const [addingRow, setAddingRow] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  
  // Load variants asynchronously
  const loadProductVariants = async (inputValue: string) => {
    try {
      const res = await productApi.getProductVariants({ limit: 50, search: inputValue, status: "ACTIVE" });
      return (res.data || []).map((v: any) => ({
        value: v.id,
        label: `${v.sku} - ${v.product?.name || "Unknown"} (${v.color || "-"} / ${v.size || "-"})`,
        _rawPrice: v.sellingPrice
      }));
    } catch (err) {
      return [];
    }
  };
  
  // Internal state for form
  const [formData, setFormData] = useState<CreateSalesOrderItemRequest & { _unitPrice?: string, _lineTotal?: string }>({
    productVariantId: "",
    quantity: 1,
    discountAmount: "0",
    notes: "",
    _unitPrice: "0",
    _lineTotal: "0"
  });

  const resetForm = () => {
    setFormData({ productVariantId: "", quantity: 1, discountAmount: "0", notes: "", _unitPrice: "0", _lineTotal: "0" });
    setAddingRow(false);
    setEditingItemId(null);
  };

  const handleStartAdd = () => {
    resetForm();
    setAddingRow(true);
  };

  const handleStartEdit = (item: SalesOrderItem) => {
    setFormData({
      productVariantId: item.productVariantId,
      quantity: item.quantity,
      discountAmount: item.discountAmount,
      notes: item.notes || "",
      _unitPrice: item.unitPrice,
      _lineTotal: item.lineTotal
    });
    setEditingItemId(item.id);
    setAddingRow(false);
  };

  const handleSubmitRow = async () => {
    if (!formData.productVariantId) return alert("Product Variant wajib diisi!");
    if (Number(formData.quantity) < 1) return alert("Quantity minimal 1!");
    
    const payload = {
      productVariantId: formData.productVariantId,
      quantity: formData.quantity,
      discountAmount: formData.discountAmount,
      notes: formData.notes
    };
    
    if (addingRow) {
      await onAddItem(payload);
    } else if (editingItemId) {
      await onUpdateItem(editingItemId, payload);
    }
    resetForm();
  };

  const handleQuantityChange = (qty: number) => {
    const q = isNaN(qty) ? 0 : qty;
    const p = Number(formData._unitPrice || 0);
    const d = Number(formData.discountAmount || 0);
    setFormData({ ...formData, quantity: q, _lineTotal: String((p * q) - d) });
  };

  const handleDiscountChange = (dsc: string) => {
    const q = Number(formData.quantity || 0);
    const p = Number(formData._unitPrice || 0);
    const d = Number(dsc || 0);
    setFormData({ ...formData, discountAmount: dsc, _lineTotal: String((p * q) - d) });
  };

  const handleVariantSelect = (e: any) => {
    const price = e.option?._rawPrice || "0";
    const q = Number(formData.quantity || 0);
    const p = Number(price);
    const d = Number(formData.discountAmount || 0);
    setFormData({ 
      ...formData, 
      productVariantId: e.target.value, 
      _unitPrice: price,
      _lineTotal: String((p * q) - d)
    });
  };

  const formatIDR = (val?: string | number) => {
    if (!val) return "Rp 0";
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(val));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h3 className="font-bold text-slate-800">Order Items</h3>
        {!isReadOnly && !addingRow && !editingItemId && (
          <Button size="sm" onClick={handleStartAdd} disabled={isLoading}>
            <Plus className="w-4 h-4 mr-2" /> Tambah Item
          </Button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
            <tr>
              <th className="px-4 py-3 w-1/3">Variant Produk</th>
              <th className="px-4 py-3 text-right">Harga Satuan</th>
              <th className="px-4 py-3 text-center w-24">Qty</th>
              <th className="px-4 py-3 text-right">DISKON ITEM</th>
              <th className="px-4 py-3 text-right">Subtotal (Auto)</th>
              {!isReadOnly && <th className="px-4 py-3 text-center w-24">Aksi</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {order.items.length === 0 && !addingRow && (
              <tr>
                <td colSpan={isReadOnly ? 5 : 6} className="px-4 py-8 text-center text-slate-500">
                  Belum ada item pesanan. {isReadOnly ? "" : "Silakan tambah item baru."}
                </td>
              </tr>
            )}

            {order.items.map((item) => (
              editingItemId === item.id ? (
                <tr key={item.id} className="bg-blue-50/50">
                  <td className="px-4 py-3">
                    <AsyncSearchableSelect
                      className="w-full bg-white text-sm"
                      value={formData.productVariantId}
                      onChange={handleVariantSelect}
                      loadOptions={loadProductVariants}
                      placeholder="-- Pilih Variant --"
                    />
                    <div className="mt-1 flex items-center gap-2">
                      <Input 
                        placeholder="Notes (optional)" 
                        className="text-xs h-7"
                        value={formData.notes}
                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-700 font-medium">
                    {formatIDR(formData._unitPrice)}
                  </td>
                  <td className="px-4 py-3">
                    <Input 
                      type="number" 
                      min="1"
                      className="text-center"
                      value={formData.quantity} 
                      onChange={e => handleQuantityChange(Number(e.target.value))}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <CurrencyInput 
                      value={Number(formData.discountAmount)} 
                      onChange={val => handleDiscountChange(String(val))}
                    />
                  </td>
                  <td className="px-4 py-3 text-right text-slate-900 font-bold">
                    {formatIDR(formData._lineTotal)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-600 hover:bg-emerald-100" onClick={handleSubmitRow} disabled={isLoading}>
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-500 hover:bg-slate-200" onClick={resetForm} disabled={isLoading}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <VariantDisplayName 
                      variantId={item.productVariantId}
                      initialName={item.productVariant?.product?.name || item.product?.name}
                      initialSku={item.productVariant?.sku || item.product?.sku}
                      color={item.productVariant?.color}
                      size={item.productVariant?.size}
                    />
                    {item.notes && <div className="text-xs text-slate-400 mt-1 italic">Note: {item.notes}</div>}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-700">
                    {formatIDR(item.unitPrice)}
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-slate-800">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-red-500">
                    {Number(item.discountAmount) > 0 ? `-${formatIDR(item.discountAmount)}` : "-"}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-slate-900">
                    {formatIDR(item.lineTotal)}
                  </td>
                  {!isReadOnly && (
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-amber-600 hover:bg-amber-100" onClick={() => handleStartEdit(item)} disabled={isLoading || addingRow || !!editingItemId}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600 hover:bg-red-100" onClick={() => onRemoveItem(item.id)} disabled={isLoading || addingRow || !!editingItemId}>
                          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              )
            ))}

            {addingRow && (
              <tr className="bg-blue-50/50">
                <td className="px-4 py-3">
                  <AsyncSearchableSelect
                    className="w-full bg-white text-sm"
                    value={formData.productVariantId}
                    onChange={handleVariantSelect}
                    loadOptions={loadProductVariants}
                    placeholder="-- Pilih Variant --"
                  />
                  <div className="mt-1 flex items-center gap-2">
                    <Input 
                      placeholder="Notes (optional)" 
                      className="text-xs h-7"
                      value={formData.notes}
                      onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-slate-700 font-medium">
                  {formatIDR(formData._unitPrice)}
                </td>
                <td className="px-4 py-3">
                  <Input 
                    type="number" 
                    min="1"
                    className="text-center"
                    value={formData.quantity} 
                    onChange={e => handleQuantityChange(Number(e.target.value))}
                  />
                </td>
                <td className="px-4 py-3">
                  <CurrencyInput 
                    value={Number(formData.discountAmount)} 
                    onChange={val => handleDiscountChange(String(val))}
                  />
                </td>
                <td className="px-4 py-3 text-right text-slate-900 font-bold">
                  {formatIDR(formData._lineTotal)}
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-600 hover:bg-emerald-100" onClick={handleSubmitRow} disabled={isLoading}>
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-500 hover:bg-slate-200" onClick={resetForm} disabled={isLoading}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-slate-50 p-6 border-t border-slate-100">
        <div className="w-full md:w-1/2 ml-auto space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 font-semibold uppercase tracking-wide">Item Subtotal</span>
            <span className="font-bold text-slate-800">
              {formatIDR(order.items?.reduce((acc, item) => acc + (Number(item.unitPrice || 0) * Number(item.quantity || 0)), 0))}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 font-semibold uppercase tracking-wide">Total Discount</span>
            <span className="font-bold text-red-600">
              -{formatIDR(Number(order.discountAmount || 0) + order.items?.reduce((acc, item) => acc + Number(item.discountAmount || 0), 0))}
            </span>
          </div>
          {Number(order.platformFeeAmount) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 font-semibold uppercase tracking-wide">Platform Fee</span>
              <span className="font-bold text-slate-800">{formatIDR(order.platformFeeAmount || 0)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 font-semibold uppercase tracking-wide">Shipping</span>
            <span className="font-bold text-slate-800">+{formatIDR(order.shippingAmount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 font-semibold uppercase tracking-wide">Tax</span>
            <span className="font-bold text-slate-800">+{formatIDR(order.taxAmount)}</span>
          </div>
          <div className="h-px bg-slate-200 my-2"></div>
          <div className="flex justify-between text-base">
            <span className="text-slate-900 font-black uppercase tracking-wide">Grand Total</span>
            <span className="font-black text-indigo-600 text-xl">{formatIDR(order.grandTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
