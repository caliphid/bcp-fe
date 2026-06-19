import { useState, useEffect } from "react";
import { useReceivableStore } from "../../store/receivable-store";
import { useAuthStore } from "../../../../store/auth-store";
import { useBusinessUnits } from "../../../business-units/hooks/use-business-units";
import { externalMoneyApi } from "../../api";
import { ExternalParty } from "../../../../types/receivable";
import { Card, CardContent } from "../../../../components/ui/card";
import { Label } from "../../../../components/ui/label";
import { Input } from "../../../../components/ui/input";
import { Button } from "../../../../components/ui/button";
import { FilterX } from "lucide-react";
import { SearchableSelect } from "@/components/ui/searchable-select";

export function ReceivablesFilterBar() {
  const { filters, setFilter, resetFilters } = useReceivableStore();
  const user = useAuthStore((s) => s.user);
  
  const { data: businessUnits } = useBusinessUnits();
  const [parties, setParties] = useState<ExternalParty[]>([]);

  useEffect(() => {
    externalMoneyApi.getExternalParties({ limit: 100, status: "ACTIVE" }).then(res => {
      setParties(res.data || []);
    }).catch(console.error);
  }, []);

  const handleReset = () => {
    resetFilters();
  };

  const handleDateModeChange = (mode: string) => {
    setFilter("dateRangeMode", mode);
    
    if (mode === "all_time") {
      setFilter("receivableDateFrom", "");
      setFilter("receivableDateTo", "");
    } else if (mode === "today") {
      const today = new Date().toISOString().split("T")[0];
      setFilter("receivableDateFrom", today);
      setFilter("receivableDateTo", today);
    } else if (mode === "this_week") {
      const d = new Date();
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const start = new Date(d.setDate(diff));
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      setFilter("receivableDateFrom", start.toISOString().split("T")[0]);
      setFilter("receivableDateTo", end.toISOString().split("T")[0]);
    } else if (mode === "this_month") {
      const d = new Date();
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const lastDay = new Date(year, d.getMonth() + 1, 0).getDate();
      setFilter("receivableDateFrom", `${year}-${month}-01`);
      setFilter("receivableDateTo", `${year}-${month}-${String(lastDay).padStart(2, "0")}`);
    } else if (mode === "custom") {
      // Keep existing dates or clear them
    }
  };

  const statusOptions = [
    { value: "", label: "Semua Status" },
    { value: "ACTIVE", label: "Aktif" },
    { value: "PARTIALLY_PAID", label: "Dibayar Sebagian" },
    { value: "PAID_OFF", label: "Lunas" },
    { value: "OVERDUE", label: "Jatuh Tempo" },
    { value: "WRITTEN_OFF", label: "Dihapuskan" },
    { value: "VOID", label: "Batal" },
  ];

  const typeOptions = [
    { value: "", label: "Semua Tipe" },
    { value: "CUSTOMER_RECEIVABLE", label: "Piutang Pelanggan" },
    { value: "PERSONAL_LOAN", label: "Pinjaman Pribadi" },
    { value: "PARTNER_LOAN", label: "Pinjaman Mitra" },
    { value: "BUSINESS_ADVANCE", label: "Uang Muka Bisnis" },
    { value: "TEMPORARY_EXTERNAL_FUND", label: "Dana Eksternal Sementara" },
    { value: "DEPOSIT", label: "Deposit" },
    { value: "EXTERNAL_INVESTMENT", label: "Investasi Eksternal" },
    { value: "OTHER", label: "Lainnya" },
  ];

  const filteredStatusOptions = user?.role === "STAFF_INPUT"
    ? statusOptions.filter(o => o.value !== "VOID")
    : statusOptions;

  return (
    <Card className="relative z-20 border-slate-200 shadow-sm mb-6">
      <CardContent className="p-4 space-y-4">
        
        {/* Row 1: Main Filters */}
        <div className="flex flex-col xl:flex-row gap-4 items-end">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 flex-1 w-full">
            <div className="space-y-1.5 lg:col-span-2">
              <Label className="text-xs text-slate-500 mb-1.5 block">Cari</Label>
              <Input
                placeholder="Cari..."
                className="h-9"
                value={filters.search || ""}
                onChange={(e) => setFilter("search", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500 mb-1.5 block">Pihak Eksternal</Label>
              <SearchableSelect
                className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                value={filters.externalPartyId || ""}
                onChange={(e) => setFilter("externalPartyId", e.target.value)}
              >
                <option value="">Semua Pihak</option>
                {parties.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </SearchableSelect>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500 mb-1.5 block">Unit Bisnis</Label>
              <SearchableSelect
                className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                value={filters.businessUnitId || ""}
                onChange={(e) => setFilter("businessUnitId", e.target.value)}
              >
                <option value="">Semua Unit</option>
                {businessUnits?.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </SearchableSelect>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500 mb-1.5 block">Tipe</Label>
              <SearchableSelect
                className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                value={filters.receivableType || ""}
                onChange={(e) => setFilter("receivableType", e.target.value)}
              >
                {typeOptions.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </SearchableSelect>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500 mb-1.5 block">Status</Label>
              <SearchableSelect
                className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                value={filters.status || ""}
                onChange={(e) => setFilter("status", e.target.value as any)}
              >
                {filteredStatusOptions.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </SearchableSelect>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            onClick={handleReset}
            className="h-9 px-3 text-slate-500 hover:text-red-600 hover:bg-red-50 shrink-0 hidden xl:flex"
            title="Reset Filter"
          >
            <FilterX className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>

        {/* Row 2: Date Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-end p-3 bg-slate-50 rounded-md border border-slate-100">
          <div className="space-y-1.5 w-full md:w-48">
            <Label className="text-xs text-slate-500 mb-1.5 block">Periode Tanggal</Label>
            <SearchableSelect
              className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              value={filters.dateRangeMode || "this_month"}
              onChange={(e) => handleDateModeChange(e.target.value)}
            >
              <option value="today">Hari Ini</option>
              <option value="this_week">Minggu Ini</option>
              <option value="this_month">Bulan Ini</option>
              <option value="all_time">Semua Waktu</option>
              <option value="custom">Kustom</option>
            </SearchableSelect>
          </div>

          <div className="space-y-1.5 w-full md:w-40">
            <Label className="text-xs text-slate-500 mb-1.5 block">Tanggal (Dari)</Label>
            <Input
              type="date"
              className="h-9 bg-white"
              value={filters.receivableDateFrom || ""}
              onChange={(e) => {
                setFilter("receivableDateFrom", e.target.value);
                setFilter("dateRangeMode", "custom");
              }}
              disabled={filters.dateRangeMode !== "custom" && filters.dateRangeMode !== "all_time"}
            />
          </div>

          <div className="space-y-1.5 w-full md:w-40">
            <Label className="text-xs text-slate-500 mb-1.5 block">Tanggal (Sampai)</Label>
            <Input
              type="date"
              className="h-9 bg-white"
              value={filters.receivableDateTo || ""}
              onChange={(e) => {
                setFilter("receivableDateTo", e.target.value);
                setFilter("dateRangeMode", "custom");
              }}
              disabled={filters.dateRangeMode !== "custom" && filters.dateRangeMode !== "all_time"}
            />
          </div>
          
          <Button 
            variant="ghost" 
            onClick={handleReset}
            className="h-9 px-3 text-slate-500 hover:text-red-600 hover:bg-red-50 shrink-0 xl:hidden mt-2"
            title="Reset Filter"
          >
            <FilterX className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>

      </CardContent>
    </Card>
  );
}
