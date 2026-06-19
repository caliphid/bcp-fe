import { useState, useEffect } from "react";
import { useInstallmentStore } from "../store/installment-store";
import { Search, X, Filter } from "lucide-react";
import { useDebounce } from "../../../hooks/use-debounce";
import { useAuthStore } from "../../../store/auth-store";
import { debtsApi } from "../../debts/api";
import { BusinessUnit } from "../../../types/business-unit";
import api from "../../../lib/axios";
import { ListResponse } from "../../../types/common";
import { DebtItem } from "../../../types/debt";
import { SearchableSelect } from "@/components/ui/searchable-select";

export function InstallmentFilterBar() {
  const { filters, setFilter, resetFilters } = useInstallmentStore();
  const user = useAuthStore(s => s.user);
  const [searchInput, setSearchInput] = useState(filters.search);
  const debouncedSearch = useDebounce(searchInput, 500);

  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);
  const [debts, setDebts] = useState<DebtItem[]>([]);

  useEffect(() => {
    setFilter("search", debouncedSearch);
  }, [debouncedSearch, setFilter]);

  useEffect(() => {
    // Fetch master data for dropdowns
    const fetchDropdowns = async () => {
      try {
        const [buRes, debtsRes] = await Promise.all([
          api.get<ListResponse<BusinessUnit>>("/business-units?limit=100&status=ACTIVE"),
          debtsApi.getDebts({ limit: 100 })
        ]);
        setBusinessUnits(buRes.data.data);
        setDebts(debtsRes.data);
      } catch (err) {
        console.error("Failed to load dropdowns", err);
      }
    };
    fetchDropdowns();
  }, []);

  const hasFilters = filters.status || filters.businessUnitId || filters.debtId || filters.search || filters.dueDateFrom || filters.dueDateTo;

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-6 flex flex-col gap-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari cicilan..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          {hasFilters && (
            <button
              onClick={() => {
                setSearchInput("");
                resetFilters();
              }}
              className="px-4 h-10 flex items-center gap-2 text-sm font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors shrink-0"
            >
              <X className="h-4 w-4" /> Reset
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 pt-4 border-t border-slate-50">
        <div className="space-y-1.5">
          <label className="text-xs text-slate-500 mb-1.5 block">Status</label>
          <SearchableSelect
            className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            value={filters.status || ""}
            onChange={(e) => setFilter("status", e.target.value as any)}
          >
            <option value="">Semua Status</option>
            <option value="PENDING">Menunggu</option>
            <option value="PARTIAL">Sebagian</option>
            <option value="PAID">Lunas</option>
            <option value="OVERDUE">Jatuh Tempo</option>
            {user?.role !== "STAFF_INPUT" && <option value="VOID">Batal</option>}
          </SearchableSelect>
        </div>

        <div className="space-y-1.5 lg:col-span-2">
          <label className="text-xs text-slate-500 mb-1.5 block">Hutang</label>
          <SearchableSelect
            className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            value={filters.debtId || ""}
            onChange={(e) => setFilter("debtId", e.target.value)}
          >
            <option value="">Semua Hutang</option>
            {debts.map(d => (
              <option key={d.id} value={d.id}>{d.debtName} ({d.debtCode})</option>
            ))}
          </SearchableSelect>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-slate-500 mb-1.5 block">Unit Bisnis</label>
          <SearchableSelect
            className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            value={filters.businessUnitId || ""}
            onChange={(e) => setFilter("businessUnitId", e.target.value)}
          >
            <option value="">Semua Unit</option>
            {businessUnits.map(bu => (
              <option key={bu.id} value={bu.id}>{bu.name}</option>
            ))}
          </SearchableSelect>
        </div>
        
        <div className="space-y-1.5">
          <label className="text-xs text-slate-500 mb-1.5 block">Urutkan</label>
          <SearchableSelect
            className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            value={filters.sortBy}
            onChange={(e) => setFilter("sortBy", e.target.value)}
          >
            <option value="dueDate">Jatuh Tempo</option>
            <option value="installmentNumber">No. Cicilan</option>
            <option value="createdAt">Dibuat Pada</option>
          </SearchableSelect>
        </div>
      </div>
    </div>
  );
}
