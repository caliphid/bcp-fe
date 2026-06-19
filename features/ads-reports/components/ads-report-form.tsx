import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Plus } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { useBusinessUnits } from "../../business-units/hooks/use-business-units";
import { useAdPlatforms } from "../../ad-platforms/hooks/use-ad-platforms";
import { useAdCampaigns } from "../../ad-campaigns/hooks/use-ad-campaigns";
import { useProducts } from "../../products/hooks/use-products";
import { CreateAdsReportPayload, CreateAdsReportItemPayload } from "../../../types/ads";
import { formatCurrency } from "../../debts/utils/formatters";
import { SearchableSelect } from "@/components/ui/searchable-select";

interface AdsReportFormProps {
  initialData?: any; // We only support Create for this component, Edit can be handled via modal in detail view or a separate page
  onSubmit: (data: CreateAdsReportPayload) => Promise<void>;
  loading: boolean;
}

export function AdsReportForm({ onSubmit, loading }: AdsReportFormProps) {
  const router = useRouter();
  const { data: businessUnits } = useBusinessUnits();
  const { data: platforms } = useAdPlatforms({ status: "ACTIVE" });
  const { data: allProducts } = useProducts();
  const products = allProducts.filter(p => p.status === "ACTIVE");

  const [formData, setFormData] = useState({
    reportDate: new Date().toISOString().split("T")[0],
    businessUnitId: "",
    platformId: "",
    campaignId: "",
    totalOrders: "",
    adSpend: "",
    platformFee: "",
    taxAmount: "",
    otherCost: "",
    notes: "",
  });

  const { data: campaigns } = useAdCampaigns({ 
    businessUnitId: formData.businessUnitId,
    platformId: formData.platformId,
    status: "ACTIVE" // maybe allow PAUSED or COMPLETED too based on business rules, but active is safe
  });

  const [items, setItems] = useState<CreateAdsReportItemPayload[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Auto Calculations (Preview only, Backend is source of truth)
  const previewData = useMemo(() => {
    let totalRevenue = 0;
    let totalHpp = 0;
    let totalQuantity = 0;
    let itemsOrderCount = 0;

    items.forEach((item) => {
      totalRevenue += item.quantity * item.unitSellingPrice;
      totalHpp += item.quantity * item.unitHpp;
      totalQuantity += item.quantity;
      itemsOrderCount += item.orderCount;
    });

    const parsedAdSpend = parseFloat(formData.adSpend.replace(/\./g, "")) || 0;
    const parsedPlatformFee = parseFloat(formData.platformFee.replace(/\./g, "")) || 0;
    const parsedTax = parseFloat(formData.taxAmount.replace(/\./g, "")) || 0;
    const parsedOtherCost = parseFloat(formData.otherCost.replace(/\./g, "")) || 0;
    const parsedTotalOrders = parseInt(formData.totalOrders.replace(/\./g, ""), 10) || itemsOrderCount;

    const totalAdsCost = parsedAdSpend + parsedPlatformFee + parsedTax + parsedOtherCost;
    const grossProfit = totalRevenue - totalHpp;
    const netProfit = grossProfit - totalAdsCost;
    const roas = parsedAdSpend > 0 ? totalRevenue / parsedAdSpend : 0;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    const breakEvenRoas = grossProfit > 0 && totalRevenue > 0 ? 1 / (grossProfit / totalRevenue) : 0;

    return {
      totalRevenue,
      totalHpp,
      totalQuantity,
      totalOrders: parsedTotalOrders,
      totalAdsCost,
      grossProfit,
      netProfit,
      roas,
      profitMargin,
      breakEvenRoas,
    };
  }, [items, formData]);

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        productId: "",
        quantity: 1,
        orderCount: 1,
        unitHpp: 0,
        unitSellingPrice: 0,
        notes: "",
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index: number, field: keyof CreateAdsReportItemPayload, value: any) => {
    const newItems = [...items];
    if (field === 'productId') {
      const prod = products.find(p => p.id === value);
      if (prod) {
        newItems[index] = {
          ...newItems[index],
          [field]: value,
          unitSellingPrice: parseFloat(String(prod.defaultPrice)) || 0,
          unitHpp: parseFloat(String(prod.defaultHpp)) || 0, // Fallback to 0 if no cost price
        };
        setItems(newItems);
        return;
      }
    }

    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };
    setItems(newItems);
  };

  const formatInputMoney = (val: string) => {
    const numeric = val.replace(/\D/g, "");
    return numeric.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.reportDate || !formData.businessUnitId || !formData.platformId) {
      setError("Data Utama (Tanggal, Business Unit, Platform) wajib diisi");
      return;
    }

    if (items.length === 0) {
      setError("Minimal harus ada 1 produk yang dilaporkan");
      return;
    }

    // Check duplicate products
    const productIds = items.map(i => i.productId);
    if (new Set(productIds).size !== productIds.length) {
      setError("Terdapat duplikasi produk dalam laporan. Gabungkan quantity produk yang sama.");
      return;
    }

    const payload: CreateAdsReportPayload = {
      reportDate: formData.reportDate,
      businessUnitId: formData.businessUnitId,
      platformId: formData.platformId,
      campaignId: formData.campaignId || null,
      totalOrders: parseInt(formData.totalOrders.replace(/\./g, ""), 10) || previewData.totalOrders,
      adSpend: parseFloat(formData.adSpend.replace(/\./g, "")) || 0,
      platformFee: parseFloat(formData.platformFee.replace(/\./g, "")) || 0,
      taxAmount: parseFloat(formData.taxAmount.replace(/\./g, "")) || 0,
      otherCost: parseFloat(formData.otherCost.replace(/\./g, "")) || 0,
      notes: formData.notes || null,
      items: items,
    };

    try {
      await onSubmit(payload);
    } catch (err) {
      const e = err as { response?: { data?: { message?: string | string[] } } };
      const msg = e.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(", ") : msg || "Failed to submit report");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-4 text-sm bg-rose-50 text-rose-600 rounded-lg border border-rose-100 font-medium">
          {error}
        </div>
      )}

      {/* SECTION 1: Report Metadata */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4">1. Data Utama</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Tanggal Laporan <span className="text-rose-500">*</span></Label>
            <Input
              required
              type="date"
              value={formData.reportDate}
              onChange={(e) => setFormData({ ...formData, reportDate: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Business Unit <span className="text-rose-500">*</span></Label>
            <SearchableSelect
              required
              className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.businessUnitId}
              onChange={(e) => setFormData({ ...formData, businessUnitId: e.target.value, campaignId: "" })}
            >
              <option value="" disabled>Pilih Unit Bisnis</option>
              {businessUnits?.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </SearchableSelect>
          </div>
          <div className="space-y-2">
            <Label>Platform Iklan <span className="text-rose-500">*</span></Label>
            <SearchableSelect
              required
              className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.platformId}
              onChange={(e) => setFormData({ ...formData, platformId: e.target.value, campaignId: "" })}
            >
              <option value="" disabled>Pilih Platform</option>
              {platforms?.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </SearchableSelect>
          </div>
          <div className="space-y-2">
            <Label>Campaign (Opsional)</Label>
            <SearchableSelect
              className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              value={formData.campaignId}
              onChange={(e) => setFormData({ ...formData, campaignId: e.target.value })}
              disabled={!formData.businessUnitId || !formData.platformId}
            >
              <option value="">Tidak ada / Keseluruhan</option>
              {campaigns?.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </SearchableSelect>
          </div>
        </div>
      </div>

      {/* SECTION 2: Sales Items */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">2. Detail Penjualan Produk</h2>
          <Button type="button" size="sm" variant="outline" onClick={handleAddItem}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Produk
          </Button>
        </div>
        
        {items.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p className="text-slate-500 text-sm">Belum ada produk yang ditambahkan.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end p-4 bg-slate-50 border border-slate-100 rounded-xl relative">
                <div className="md:col-span-3 space-y-2">
                  <Label className="text-xs">Produk <span className="text-rose-500">*</span></Label>
                  <SearchableSelect
                    required
                    className="w-full h-9 rounded-md border border-slate-200 bg-white px-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                    value={item.productId}
                    onChange={(e) => handleUpdateItem(index, "productId", e.target.value)}
                  >
                    <option value="" disabled>Pilih Produk</option>
                    {products?.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </SearchableSelect>
                </div>
                <div className="md:col-span-1 space-y-2">
                  <Label className="text-xs">Qty</Label>
                  <Input
                    required
                    type="number"
                    min="1"
                    className="h-9 text-xs px-2"
                    value={item.quantity}
                    onChange={(e) => handleUpdateItem(index, "quantity", parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="md:col-span-1 space-y-2">
                  <Label className="text-xs">Orders</Label>
                  <Input
                    required
                    type="number"
                    min="1"
                    className="h-9 text-xs px-2"
                    value={item.orderCount}
                    onChange={(e) => handleUpdateItem(index, "orderCount", parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label className="text-xs">Unit HPP</Label>
                  <Input
                    required
                    className="h-9 text-xs px-2"
                    value={item.unitHpp === 0 ? "" : item.unitHpp.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                    onChange={(e) => handleUpdateItem(index, "unitHpp", parseInt(e.target.value.replace(/\D/g, "")) || 0)}
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label className="text-xs">Unit Price</Label>
                  <Input
                    required
                    className="h-9 text-xs px-2"
                    value={item.unitSellingPrice === 0 ? "" : item.unitSellingPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                    onChange={(e) => handleUpdateItem(index, "unitSellingPrice", parseInt(e.target.value.replace(/\D/g, "")) || 0)}
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label className="text-xs">Notes (Opt)</Label>
                  <Input
                    className="h-9 text-xs px-2"
                    value={item.notes || ""}
                    onChange={(e) => handleUpdateItem(index, "notes", e.target.value)}
                  />
                </div>
                <div className="md:col-span-1 flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-2 h-9"
                    onClick={() => handleRemoveItem(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 3: Ads Cost & Metadata */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4">3. Biaya Iklan & Lainnya</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="space-y-2">
            <Label>Total Orders Keseluruhan</Label>
            <Input
              type="text"
              inputMode="numeric"
              value={formData.totalOrders}
              onChange={(e) => setFormData({ ...formData, totalOrders: formatInputMoney(e.target.value) })}
              placeholder={`Auto: ${previewData.totalOrders}`}
            />
          </div>
          <div className="space-y-2">
            <Label>Total Ad Spend <span className="text-rose-500">*</span></Label>
            <Input
              required
              type="text"
              inputMode="numeric"
              value={formData.adSpend}
              onChange={(e) => setFormData({ ...formData, adSpend: formatInputMoney(e.target.value) })}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label>Platform Fee</Label>
            <Input
              type="text"
              inputMode="numeric"
              value={formData.platformFee}
              onChange={(e) => setFormData({ ...formData, platformFee: formatInputMoney(e.target.value) })}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label>Pajak Iklan (Tax)</Label>
            <Input
              type="text"
              inputMode="numeric"
              value={formData.taxAmount}
              onChange={(e) => setFormData({ ...formData, taxAmount: formatInputMoney(e.target.value) })}
              placeholder="0"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Biaya Lainnya (Other Cost)</Label>
            <Input
              type="text"
              inputMode="numeric"
              value={formData.otherCost}
              onChange={(e) => setFormData({ ...formData, otherCost: formatInputMoney(e.target.value) })}
              placeholder="0"
            />
          </div>
          <div className="space-y-2 lg:col-span-3">
            <Label>Notes Laporan</Label>
            <Input
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Keterangan tambahan laporan..."
            />
          </div>
        </div>
      </div>

      {/* SECTION 4: Live Preview */}
      <div className="bg-indigo-50/50 rounded-2xl border border-indigo-100 p-6">
        <h2 className="text-sm font-bold text-indigo-900 mb-4 uppercase tracking-wide">Live Preview (Estimasi)</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Revenue</p>
            <p className="text-lg font-bold text-slate-900">{formatCurrency(previewData.totalRevenue)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total HPP</p>
            <p className="text-lg font-bold text-slate-900">{formatCurrency(previewData.totalHpp)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Ads Cost</p>
            <p className="text-lg font-bold text-rose-600">{formatCurrency(previewData.totalAdsCost)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Net Profit</p>
            <p className={`text-lg font-bold ${previewData.netProfit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {formatCurrency(previewData.netProfit)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">ROAS</p>
            <p className="text-lg font-bold text-slate-900">{previewData.roas.toFixed(2)}x</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Profit Margin</p>
            <p className="text-lg font-bold text-slate-900">{previewData.profitMargin.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Break-Even ROAS</p>
            <p className="text-lg font-bold text-slate-900">{previewData.breakEvenRoas.toFixed(2)}x</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Status</p>
            <p className="text-sm font-bold text-amber-600 mt-1">DRAFT</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
          Batal
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Menyimpan Draft..." : "Simpan sebagai Draft"}
        </Button>
      </div>
    </form>
  );
}
