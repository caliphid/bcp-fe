import { useDebtStore } from "../store/debt-store";
import { useAuthStore } from "../../../store/auth-store";
import { useBusinessUnits } from "../../business-units/hooks/use-business-units";
import { Card, CardContent } from "../../../components/ui/card";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { FilterX } from "lucide-react";

export function DebtFilterBar() {
  const { filters, setFilter, resetFilters } = useDebtStore();
  const user = useAuthStore((s) => s.user);
  
  // Using limit 100 for master data
  const { data: businessUnits } = useBusinessUnits();

  const handleReset = () => {
    resetFilters();
  };

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "ACTIVE", label: "Active" },
    { value: "PAID_OFF", label: "Paid Off" },
    { value: "INACTIVE", label: "Inactive" },
    { value: "DEFAULTED", label: "Defaulted" },
  ];

  const filteredStatusOptions = user?.role === "STAFF_INPUT"
    ? statusOptions.filter(o => o.value === "" || o.value === "ACTIVE" || o.value === "PAID_OFF")
    : statusOptions;

  const typeOptions = [
    { value: "", label: "All Types" },
    { value: "BANK_LOAN", label: "Bank Loan" },
    { value: "PERSONAL_LOAN", label: "Personal Loan" },
    { value: "BUSINESS_CAPITAL", label: "Business Capital" },
    { value: "ASSET_PURCHASE", label: "Asset Purchase" },
    { value: "CREDIT_CARD", label: "Credit Card" },
    { value: "PAYABLE", label: "Payable" },
    { value: "OTHER", label: "Other" },
  ];

  return (
    <Card className="relative z-20 border-slate-200 shadow-sm mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col xl:flex-row gap-4 items-end">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 flex-1 w-full">
            
            <div className="space-y-1.5 lg:col-span-2">
              <Label className="text-xs text-slate-500 mb-1.5 block">Cari</Label>
              <Input
                placeholder="Cari hutang..."
                className="h-9"
                value={filters.search}
                onChange={(e) => setFilter("search", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500 mb-1.5 block">Status</Label>
              <select
                className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                value={filters.status || ""}
                onChange={(e) => setFilter("status", e.target.value as any)}
              >
                <option value="">Semua Status</option>
                <option value="ACTIVE">Aktif</option>
                <option value="PAID_OFF">Lunas</option>
                {user?.role !== "STAFF_INPUT" && (
                  <>
                    <option value="INACTIVE">Nonaktif</option>
                    <option value="DEFAULTED">Macet (Defaulted)</option>
                  </>
                )}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500 mb-1.5 block">Tipe</Label>
              <select
                className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                value={filters.type || ""}
                onChange={(e) => setFilter("type", e.target.value as any)}
              >
                <option value="">Semua Tipe</option>
                <option value="BANK_LOAN">Pinjaman Bank</option>
                <option value="PERSONAL_LOAN">Pinjaman Pribadi</option>
                <option value="BUSINESS_CAPITAL">Modal Usaha</option>
                <option value="ASSET_PURCHASE">Pembelian Aset</option>
                <option value="CREDIT_CARD">Kartu Kredit</option>
                <option value="PAYABLE">Hutang Usaha</option>
                <option value="OTHER">Lainnya</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500 mb-1.5 block">Unit Bisnis</Label>
              <select
                className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                value={filters.businessUnitId}
                onChange={(e) => setFilter("businessUnitId", e.target.value)}
              >
                <option value="">Semua Unit</option>
                {businessUnits?.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500 mb-1.5 block">Nama Pemberi Pinjaman</Label>
              <Input
                placeholder="Pemberi pinjaman..."
                className="h-9"
                value={filters.lenderName}
                onChange={(e) => setFilter("lenderName", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500 mb-1.5 block">Dari Tanggal</Label>
              <div className="relative">
                <Input
                  type="date"
                  className="h-9"
                  value={filters.dateFrom}
                  onChange={(e) => setFilter("dateFrom", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500 mb-1.5 block">Sampai Tanggal</Label>
              <div className="relative">
                <Input
                  type="date"
                  className="h-9"
                  value={filters.dateTo}
                  onChange={(e) => setFilter("dateTo", e.target.value)}
                />
              </div>
            </div>

          </div>

          <Button 
            variant="ghost" 
            onClick={handleReset}
            className="h-9 px-3 text-slate-500 hover:text-red-600 hover:bg-red-50 shrink-0"
            title="Reset Filters"
          >
            <FilterX className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
