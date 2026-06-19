import { useState, useEffect } from "react";
import { useCrewCashbonStore } from "../store/crew-cashbon-store";
import { useAuthStore } from "../../../store/auth-store";
import { useBusinessUnits } from "../../business-units/hooks/use-business-units";
import { crewApi } from "../../crew/api";
import { Crew } from "../../../types/crew";
import { Card, CardContent } from "../../../components/ui/card";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { FilterX } from "lucide-react";
import { SearchableSelect } from "@/components/ui/searchable-select";

export function CashbonFilterBar() {
  const { filters, setFilter, resetFilters } = useCrewCashbonStore();
  const user = useAuthStore((s) => s.user);
  
  const { data: businessUnits } = useBusinessUnits();
  const [crews, setCrews] = useState<Crew[]>([]);

  useEffect(() => {
    crewApi.getCrew({ limit: 100 }).then(res => {
      setCrews(res.data || []);
    }).catch(console.error);
  }, []);

  const handleReset = () => {
    resetFilters();
  };

  const statusOptions = [
    { value: "", label: "Semua Status" },
    { value: "ACTIVE", label: "Aktif" },
    { value: "PARTIALLY_PAID", label: "Sebagian Terbayar" },
    { value: "PAID_OFF", label: "Lunas" },
    { value: "OVERDUE", label: "Jatuh Tempo" },
    { value: "VOID", label: "Dibatalkan" },
    { value: "INACTIVE", label: "Nonaktif" },
  ];

  const filteredStatusOptions = user?.role === "STAFF_INPUT"
    ? statusOptions.filter(o => o.value !== "VOID" && o.value !== "INACTIVE")
    : statusOptions;

  return (
    <Card className="relative z-20 border-slate-200 shadow-sm mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col xl:flex-row gap-4 items-end">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 flex-1 w-full">
            
            <div className="space-y-1.5 lg:col-span-2">
              <Label className="text-xs text-slate-500 mb-1.5 block">Cari Code / Keterangan</Label>
              <Input
                placeholder="Cari cashbon..."
                className="h-9"
                value={filters.search}
                onChange={(e) => setFilter("search", e.target.value)}
              />
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

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500 mb-1.5 block">Crew</Label>
              <SearchableSelect
                className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                value={filters.crewId || ""}
                onChange={(e) => setFilter("crewId", e.target.value)}
              >
                <option value="">Semua Crew</option>
                {crews.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
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
              <Label className="text-xs text-slate-500 mb-1.5 block">Tgl Cashbon (Dari)</Label>
              <Input
                type="date"
                className="h-9"
                value={filters.cashbonDateFrom || ""}
                onChange={(e) => setFilter("cashbonDateFrom", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500 mb-1.5 block">Tgl Cashbon (Sampai)</Label>
              <Input
                type="date"
                className="h-9"
                value={filters.cashbonDateTo || ""}
                onChange={(e) => setFilter("cashbonDateTo", e.target.value)}
              />
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
