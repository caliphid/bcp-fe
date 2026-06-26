import { useState, useRef } from "react";
import { SalesOrder, CreateSalesOrderRequest } from "../../../types/sales-order";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { CurrencyInput } from "../../../components/ui/currency-input";
import { Save, Loader2, Lock, HelpCircle } from "lucide-react";
import dayjs from "dayjs";
import { useBusinessUnits } from "../../business-units/hooks/use-business-units";
import { useWarehouses } from "../../warehouses/hooks/use-warehouses";
import { customerApi } from "../../customers/api";
import { AsyncSearchableSelect } from "../../../components/ui/async-searchable-select";
import { CustomerCreateModal } from "../../customers/components/customer-create-modal";
import { Customer } from "../../../types/customer";
import { Modal } from "../../../components/ui/modal";

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
    customerId: initialData?.customerId || "",
  });

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const loadCustomers = async (inputValue: string) => {
    return new Promise<{value: string, label: string, customer: any}[]>((resolve) => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
      debounceTimeout.current = setTimeout(async () => {
        try {
          const res = await customerApi.getCustomers({ 
            search: inputValue || undefined, 
            limit: 10,
            page: 1,
            status: 'ACTIVE',
            sortBy: 'fullName',
            sortOrder: 'asc'
          });
          const customers = res.data || [];
          resolve(customers.map((c: any) => ({
            value: c.id,
            label: `${c.fullName} (${c.customerCode}) ${c.phone ? `- ${c.phone}` : ''}`,
            customer: c
          })));
        } catch (err) {
          console.error('Failed to load customers', err);
          resolve([]);
        }
      }, 300);
    });
  };

  const handleCustomerSelect = (option: any) => {
    if (!option || !option.customer) {
      handleChange('customerId', '');
      return;
    }
    const c: Customer = option.customer;
    
    // Find active addresses
    const activeAddresses = c.addresses?.filter(a => a.isActive) || [];
    const defaultShipping = activeAddresses.find(a => a.isDefaultShipping);
    const selectedAddress = defaultShipping?.addressLine1 || activeAddresses[0]?.addressLine1 || "";

    setFormData(prev => ({
      ...prev,
      customerId: c.id,
      customerName: c.fullName,
      customerPhone: c.phone || prev.customerPhone,
      customerAddress: selectedAddress || prev.customerAddress,
    }));
  };

  const handleCustomerCreated = (c: Customer) => {
    const activeAddresses = c.addresses?.filter(a => a.isActive) || [];
    const defaultShipping = activeAddresses.find(a => a.isDefaultShipping);
    const selectedAddress = defaultShipping?.addressLine1 || activeAddresses[0]?.addressLine1 || "";

    setFormData(prev => ({
      ...prev,
      customerId: c.id,
      customerName: c.fullName,
      customerPhone: c.phone || prev.customerPhone,
      customerAddress: selectedAddress || prev.customerAddress,
    }));
    setIsCustomerModalOpen(false);
  };

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
    <>
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
        <h2 className="text-xl font-bold text-slate-800">
          {initialData ? 'Form Sales Order' : 'Buat Sales Order Baru'}
        </h2>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={() => setShowTutorial(true)} 
          className="bg-white hover:bg-slate-50 text-indigo-600 border-indigo-200"
        >
          <HelpCircle className="w-4 h-4 mr-2" />
          Cara Pengisian Form
        </Button>
      </div>

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

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-semibold text-slate-700">Pilih Customer (Opsional)</label>
                {!isReadOnly && (
                  <button 
                    type="button" 
                    onClick={() => setIsCustomerModalOpen(true)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    + Buat Baru
                  </button>
                )}
              </div>
              <AsyncSearchableSelect
                disabled={isReadOnly}
                value={formData.customerId}
                loadOptions={loadCustomers}
                placeholder="Cari nama atau kode customer..."
                onChange={(e: any) => handleCustomerSelect(e.option)}
              />
              <p className="text-[10px] text-slate-500 mt-1">Memilih customer akan mengisi otomatis Nama, Telepon, dan Alamat.</p>
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

    {isCustomerModalOpen && (
      <CustomerCreateModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSuccess={handleCustomerCreated}
      />
    )}

    <Modal isOpen={showTutorial} onClose={() => setShowTutorial(false)} title="Tutorial: Form Sales Order" className="max-w-4xl">
      <div className="space-y-6 text-slate-700 text-sm leading-relaxed max-h-[70vh] overflow-y-auto pr-2">
        <p className="mb-2">Formulir ini digunakan untuk merekam data pesanan penjualan (Sales Order). Berikut panduan pengisiannya:</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-bold text-slate-900 mb-3 text-base">Informasi Utama:</h4>
            <div className="space-y-3">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="font-semibold text-slate-800 block mb-1">Pilih Customer</span>
                <p className="text-xs text-slate-600">Pilih dari *database* (ketik nama/kode). Sistem otomatis mengisi alamat dan kontak. Jika pelanggan baru, klik <strong>+ Buat Baru</strong>.</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="font-semibold text-slate-800 block mb-1">Data Penerima (Manual)</span>
                <p className="text-xs text-slate-600">Anda juga dapat mengetik bebas Nama, Telepon, dan Alamat pembeli tanpa menyimpannya ke database.</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-3 text-base">Operasional & Logistik:</h4>
            <div className="space-y-3">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="font-semibold text-slate-800 block mb-1">Business Unit & Warehouse</span>
                <p className="text-xs text-slate-600"><strong>Penting:</strong> Menentukan cabang/unit bisnis mana yang mencatat penjualan ini, dan gudang mana stok barang akan dipotong saat pengiriman (Fulfillment).</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="font-semibold text-slate-800 block mb-1">Sales Channel & Tipe Order</span>
                <p className="text-xs text-slate-600">Kategorisasi pesanan (misal: Online/Marketplace, Preorder/Regular). Berguna untuk filter laporan penjualan.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4 mt-4">
          <h4 className="font-bold text-slate-900 mb-3 text-base">Biaya, Pajak, dan Diskon (Bagian Bawah Form)</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
              <span className="font-semibold text-amber-800 block mb-1">Diskon Order</span>
              <p className="text-xs text-amber-700">Potongan harga tunai (Rp) yang mengurangi total nilai keseluruhan (Grand Total).</p>
            </div>
            <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
              <span className="font-semibold text-indigo-800 block mb-1">Biaya Pengiriman</span>
              <p className="text-xs text-indigo-700">Ongkos kirim yang ditanggung pembeli, akan menambah nilai Total Tagihan.</p>
            </div>
            <div className="bg-rose-50 p-3 rounded-lg border border-rose-100">
              <span className="font-semibold text-rose-800 block mb-1">Pajak (Tax)</span>
              <p className="text-xs text-rose-700">Pajak (PPN) total yang ditambahkan ke keseluruhan pesanan.</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100 mt-4">
          <Button type="button" onClick={() => setShowTutorial(false)}>Mengerti</Button>
        </div>
      </div>
    </Modal>
    </>
  );
}
