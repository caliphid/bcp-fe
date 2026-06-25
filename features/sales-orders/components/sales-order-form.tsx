import { useState } from "react";
import { SalesOrder, CreateSalesOrderRequest } from "../../../types/sales-order";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { CurrencyInput } from "../../../components/ui/currency-input";
import { Save, Loader2, Lock } from "lucide-react";
import dayjs from "dayjs";
import { useBusinessUnits } from "../../business-units/hooks/use-business-units";
import { useWarehouses } from "../../warehouses/hooks/use-warehouses";

interface SalesOrderFormProps {
  initialData?: SalesOrder;
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
}

const SALES_CHANNELS = [
  { label: 'Online', value: 'ONLINE' },
  { label: 'Offline', value: 'OFFLINE' },
  { label: 'Marketplace', value: 'MARKETPLACE' },
  { label: 'Social Commerce', value: 'SOCIAL_COMMERCE' },
  { label: 'Other', value: 'OTHER' },
];

const ORDER_TYPES = [
  { label: 'Regular', value: 'REGULAR' },
  { label: 'Preorder', value: 'PREORDER' },
  { label: 'Custom', value: 'CUSTOM' },
  { label: 'Other', value: 'OTHER' },
];

export function SalesOrderForm({ initialData, onSubmit, isLoading }: SalesOrderFormProps) {
  const isReadOnly = initialData && initialData.status !== 'DRAFT';

  const { data: businessUnits } = useBusinessUnits();
  const { data: warehouses } = useWarehouses({ limit: 100, status: 'ACTIVE' });

  const [formData, setFormData] = useState<CreateSalesOrderRequest>({
    orderDate: initialData?.orderDate ? dayjs(initialData.orderDate).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"),
    customerName: initialData?.customerName || "",
    customerPhone: initialData?.customerPhone || "",
    customerAddress: initialData?.customerAddress || "",
    salesChannel: initialData?.salesChannel || "ONLINE",
    orderType: initialData?.orderType || "REGULAR",
    notes: initialData?.notes || "",
    discountAmount: initialData?.discountAmount || "0",
    shippingAmount: initialData?.shippingAmount || "0",
    taxAmount: initialData?.taxAmount || "0",
    platformFeeRate: initialData?.platformFeeRate || "0",
    businessUnitId: initialData?.businessUnitId || initialData?.businessUnit?.id || "",
    warehouseId: initialData?.warehouseId || (initialData as any)?.warehouse?.id || "",
  });

  const handleChange = (field: keyof CreateSalesOrderRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    
    // Sanitize optional UUIDs and unformat amounts if necessary
    const payload = { ...formData };
    if (!payload.businessUnitId || payload.businessUnitId === "") delete payload.businessUnitId;
    if (!payload.warehouseId || payload.warehouseId === "") delete payload.warehouseId;
    
    if (payload.salesChannel !== 'MARKETPLACE') {
      payload.platformFeeRate = 0;
    }
    
    // Empty array since Opsi B flow doesn't create items immediately
    payload.items = [];
    
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
      {isReadOnly && (
        <div className="bg-amber-50 text-amber-800 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-sm">Form Terkunci</h4>
            <p className="text-xs mt-1">Hanya DRAFT sales order yang dapat dimodifikasi. Header dan item pesanan ini hanya bersifat read-only.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-800 border-b border-slate-100 pb-2">Informasi Utama</h3>
          
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Tanggal Order <span className="text-red-500">*</span></label>
            <Input 
              type="date" 
              required 
              disabled={isReadOnly}
              value={formData.orderDate as string} 
              onChange={e => handleChange('orderDate', e.target.value)} 
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Customer Name <span className="text-red-500">*</span></label>
            <Input 
              required 
              placeholder="Nama Customer"
              disabled={isReadOnly}
              value={formData.customerName} 
              onChange={e => handleChange('customerName', e.target.value)} 
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Customer Phone</label>
            <Input 
              placeholder="0812xxx"
              disabled={isReadOnly}
              value={formData.customerPhone} 
              onChange={e => handleChange('customerPhone', e.target.value)} 
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Customer Address</label>
            <Input 
              placeholder="Alamat Pengiriman..."
              disabled={isReadOnly}
              value={formData.customerAddress} 
              onChange={e => handleChange('customerAddress', e.target.value)} 
            />
          </div>
          
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Business Unit</label>
            <select
              className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
              disabled={isReadOnly}
              value={formData.businessUnitId || ""}
              onChange={e => handleChange('businessUnitId', e.target.value)}
            >
              <option value="">-- Pilih Business Unit (Optional) --</option>
              {businessUnits?.map((bu: any) => (
                <option key={bu.id} value={bu.id}>{bu.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Gudang / Warehouse</label>
            <select
              className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
              disabled={isReadOnly}
              value={formData.warehouseId || ""}
              onChange={e => handleChange('warehouseId', e.target.value)}
            >
              <option value="">-- Pilih Gudang (Optional saat Draft) --</option>
              {warehouses?.map((w: any) => (
                <option key={w.id} value={w.id}>{w.warehouseCode} - {w.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-slate-800 border-b border-slate-100 pb-2">Detail Operasional</h3>
          
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Sales Channel <span className="text-red-500">*</span></label>
            <select
              required
              className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
              disabled={isReadOnly}
              value={formData.salesChannel}
              onChange={e => handleChange('salesChannel', e.target.value)}
            >
              {SALES_CHANNELS.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {formData.salesChannel === 'MARKETPLACE' && (
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Platform Fee Rate (%)</label>
              <Input 
                type="number"
                min="0"
                max="100"
                step="0.01"
                disabled={isReadOnly}
                value={formData.platformFeeRate} 
                onChange={e => handleChange('platformFeeRate', e.target.value)} 
              />
            </div>
          )}

          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Order Type <span className="text-red-500">*</span></label>
            <select
              required
              className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
              disabled={isReadOnly}
              value={formData.orderType}
              onChange={e => handleChange('orderType', e.target.value)}
            >
              {ORDER_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Catatan Tambahan (Notes)</label>
            <Input 
              placeholder="Catatan untuk gudang / packing"
              disabled={isReadOnly}
              value={formData.notes} 
              onChange={e => handleChange('notes', e.target.value)} 
            />
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-slate-100">
        <h3 className="font-semibold text-slate-800 mb-4">Biaya & Diskon Tambahan (Global)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl">
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Diskon Order (Rp)</label>
            <CurrencyInput 
              disabled={isReadOnly}
              value={Number(formData.discountAmount)} 
              onChange={val => handleChange('discountAmount', String(val))} 
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Biaya Pengiriman (Rp)</label>
            <CurrencyInput 
              disabled={isReadOnly}
              value={Number(formData.shippingAmount)} 
              onChange={val => handleChange('shippingAmount', String(val))} 
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Pajak / Tax (Rp)</label>
            <CurrencyInput 
              disabled={isReadOnly}
              value={Number(formData.taxAmount)} 
              onChange={val => handleChange('taxAmount', String(val))} 
            />
          </div>
        </div>
      </div>

      {!isReadOnly && (
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {initialData ? "Simpan Perubahan Header" : "Buat Draft Sales Order"}
          </Button>
        </div>
      )}
    </form>
  );
}
