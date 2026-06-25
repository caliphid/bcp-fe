import { useState } from "react";
import { SalesOrder, SalesOrderItem, CreateSalesOrderItemRequest, UpdateSalesOrderItemRequest } from "../../../types/sales-order";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Trash2, Plus, Save, Loader2, Edit2, X } from "lucide-react";
import { formatMoney } from "../../../lib/utils";

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
  
  // Internal state for form
  const [formData, setFormData] = useState<CreateSalesOrderItemRequest>({
    productId: "",
    quantity: 1,
    price: "0",
    discount: "0"
  });

  const resetForm = () => {
    setFormData({ productId: "", quantity: 1, price: "0", discount: "0" });
    setAddingRow(false);
    setEditingItemId(null);
  };

  const handleStartAdd = () => {
    resetForm();
    setAddingRow(true);
  };

  const handleStartEdit = (item: SalesOrderItem) => {
    setFormData({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
      discount: item.discount
    });
    setEditingItemId(item.id);
    setAddingRow(false);
  };

  const handleSubmitRow = async () => {
    if (!formData.productId) return alert("Product ID wajib diisi!");
    
    if (addingRow) {
      await onAddItem(formData);
    } else if (editingItemId) {
      await onUpdateItem(editingItemId, formData);
    }
    resetForm();
  };

  const formatIDR = (val?: string) => {
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
              <th className="px-4 py-3 w-1/3">Produk ID / SKU</th>
              <th className="px-4 py-3 text-right">Harga Satuan</th>
              <th className="px-4 py-3 text-center w-24">Qty</th>
              <th className="px-4 py-3 text-right">Diskon Satuan</th>
              <th className="px-4 py-3 text-right">Subtotal</th>
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
                    <Input 
                      placeholder="Product ID..." 
                      value={formData.productId} 
                      onChange={e => setFormData({...formData, productId: e.target.value})}
                    />
                    <div className="text-[10px] text-slate-400 mt-1">Harus ID valid dari backend</div>
                  </td>
                  <td className="px-4 py-3">
                    <Input 
                      type="number" 
                      min="0"
                      value={formData.price} 
                      onChange={e => setFormData({...formData, price: e.target.value})}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input 
                      type="number" 
                      min="1"
                      className="text-center"
                      value={formData.quantity} 
                      onChange={e => setFormData({...formData, quantity: Number(e.target.value)})}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input 
                      type="number" 
                      min="0"
                      value={formData.discount} 
                      onChange={e => setFormData({...formData, discount: e.target.value})}
                    />
                  </td>
                  <td className="px-4 py-3 text-right text-slate-400 italic font-medium">
                    Auto
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
                    <div className="font-semibold text-slate-800">{item.product?.name || `Product ID: ${item.productId}`}</div>
                    {item.product?.sku && <div className="text-xs text-slate-500">{item.product.sku}</div>}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-700">
                    {formatIDR(item.price)}
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-slate-800">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-red-500">
                    {Number(item.discount) > 0 ? `-${formatIDR(item.discount)}` : "-"}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-slate-900">
                    {formatIDR(item.subtotal)}
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
                  <Input 
                    placeholder="Masukkan Product ID..." 
                    value={formData.productId} 
                    onChange={e => setFormData({...formData, productId: e.target.value})}
                  />
                  <div className="text-[10px] text-slate-400 mt-1">Harus ID valid dari backend</div>
                </td>
                <td className="px-4 py-3">
                  <Input 
                    type="number" 
                    min="0"
                    value={formData.price} 
                    onChange={e => setFormData({...formData, price: e.target.value})}
                  />
                </td>
                <td className="px-4 py-3">
                  <Input 
                    type="number" 
                    min="1"
                    className="text-center"
                    value={formData.quantity} 
                    onChange={e => setFormData({...formData, quantity: Number(e.target.value)})}
                  />
                </td>
                <td className="px-4 py-3">
                  <Input 
                    type="number" 
                    min="0"
                    value={formData.discount} 
                    onChange={e => setFormData({...formData, discount: e.target.value})}
                  />
                </td>
                <td className="px-4 py-3 text-right text-slate-400 italic font-medium">
                  Auto
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
            <span className="font-bold text-slate-800">{formatIDR(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 font-semibold uppercase tracking-wide">Global Discount</span>
            <span className="font-bold text-red-600">-{formatIDR(order.discount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 font-semibold uppercase tracking-wide">Shipping</span>
            <span className="font-bold text-slate-800">+{formatIDR(order.shipping)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 font-semibold uppercase tracking-wide">Tax</span>
            <span className="font-bold text-slate-800">+{formatIDR(order.tax)}</span>
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
