import { useState } from "react";
import { SalesOrder, CreateSalesOrderRequest, UpdateSalesOrderRequest } from "../../../types/sales-order";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Save, Loader2, Lock } from "lucide-react";
import dayjs from "dayjs";

interface SalesOrderFormProps {
  initialData?: SalesOrder;
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
}

export function SalesOrderForm({ initialData, onSubmit, isLoading }: SalesOrderFormProps) {
  const isReadOnly = initialData && initialData.status !== 'DRAFT';

  const [formData, setFormData] = useState<CreateSalesOrderRequest>({
    orderDate: initialData?.orderDate ? dayjs(initialData.orderDate).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"),
    customerName: initialData?.customerName || "",
    customerPhone: initialData?.customerPhone || "",
    customerAddress: initialData?.customerAddress || "",
    salesChannel: initialData?.salesChannel || "",
    orderType: initialData?.orderType || "",
    notes: initialData?.notes || "",
    discount: initialData?.discount || "0",
    shipping: initialData?.shipping || "0",
    tax: initialData?.tax || "0",
    businessUnitId: initialData?.businessUnitId || "",
    warehouseId: initialData?.warehouseId || "",
  });

  const handleChange = (field: keyof CreateSalesOrderRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    onSubmit(formData);
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
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-slate-800 border-b border-slate-100 pb-2">Detail Operasional</h3>
          
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Sales Channel <span className="text-red-500">*</span></label>
            <Input 
              required 
              placeholder="e.g. Tokopedia, Offline, WhatsApp"
              disabled={isReadOnly}
              value={formData.salesChannel} 
              onChange={e => handleChange('salesChannel', e.target.value)} 
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Order Type <span className="text-red-500">*</span></label>
            <Input 
              required 
              placeholder="e.g. B2C, B2B, RESELLER"
              disabled={isReadOnly}
              value={formData.orderType} 
              onChange={e => handleChange('orderType', e.target.value)} 
            />
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
            <Input 
              type="number"
              min="0"
              disabled={isReadOnly}
              value={formData.discount} 
              onChange={e => handleChange('discount', e.target.value)} 
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Biaya Pengiriman (Rp)</label>
            <Input 
              type="number"
              min="0"
              disabled={isReadOnly}
              value={formData.shipping} 
              onChange={e => handleChange('shipping', e.target.value)} 
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Pajak / Tax (Rp)</label>
            <Input 
              type="number"
              min="0"
              disabled={isReadOnly}
              value={formData.tax} 
              onChange={e => handleChange('tax', e.target.value)} 
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
