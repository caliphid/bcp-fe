"use client";

import { useFinanceStore } from "../store/finance-store";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useBusinessUnits } from "../../business-units/hooks/use-business-units";
import { useAccounts } from "../../accounts/hooks/use-accounts";

const MONTHS = [
  { value: 1, label: "Januari" },
  { value: 2, label: "Februari" },
  { value: 3, label: "Maret" },
  { value: 4, label: "April" },
  { value: 5, label: "Mei" },
  { value: 6, label: "Juni" },
  { value: 7, label: "Juli" },
  { value: 8, label: "Agustus" },
  { value: 9, label: "September" },
  { value: 10, label: "Oktober" },
  { value: 11, label: "November" },
  { value: 12, label: "Desember" },
];

const YEARS = Array.from({ length: 5 }, (_, i) => {
  const year = new Date().getFullYear() - 2 + i;
  return { value: year, label: year.toString() };
});

export function FinanceFilterBar() {
  const { filters, setFilter } = useFinanceStore();
  const { data: businessUnits } = useBusinessUnits();
  const { data: accounts } = useAccounts();

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-wrap gap-3 items-center">
      <span className="text-sm font-bold text-slate-700 mr-2">Filters:</span>

      <SearchableSelect
        value={filters.month.toString()}
        onChange={(e) => setFilter("month", e.target.value ? parseInt(e.target.value) : "")}
        className="h-9 w-[140px] rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
      >
        {MONTHS.map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </SearchableSelect>

      <SearchableSelect
        value={filters.year.toString()}
        onChange={(e) => setFilter("year", e.target.value ? parseInt(e.target.value) : "")}
        className="h-9 w-[120px] rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
      >
        {YEARS.map((y) => (
          <option key={y.value} value={y.value}>
            {y.label}
          </option>
        ))}
      </SearchableSelect>

      <div className="h-6 w-px bg-slate-200 mx-1"></div>

      <SearchableSelect
        value={filters.businessUnitId}
        onChange={(e) => setFilter("businessUnitId", e.target.value)}
        className="h-9 w-[200px] rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">Semua Unit Bisnis</option>
        {businessUnits?.map((bu) => (
          <option key={bu.id} value={bu.id}>
            {bu.name}
          </option>
        ))}
      </SearchableSelect>

      <SearchableSelect
        value={filters.accountId}
        onChange={(e) => setFilter("accountId", e.target.value)}
        className="h-9 w-[200px] rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">Semua Rekening</option>
        {accounts?.map((acc) => (
          <option key={acc.id} value={acc.id}>
            {acc.name}
          </option>
        ))}
      </SearchableSelect>
    </div>
  );
}
