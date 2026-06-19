"use client";

import { useAuthStore } from "@/store/auth-store";
import { PageHeader } from "@/components/ui/page-header";
import { FinanceFilterBar } from "@/features/finance/components/finance-filter-bar";
import { CashPositionSummary } from "@/features/finance/components/cash-position-summary";
import { CashPositionTable } from "@/features/finance/components/cash-position-table";
import { useFinanceStore } from "@/features/finance/store/finance-store";
import { useMonthlyCashPosition } from "@/features/finance/hooks/use-finance-analytics";

export default function CashPositionPage() {
  const { user } = useAuthStore();
  const { filters, setFilter } = useFinanceStore();

  const isAuthorized = user?.role === "OWNER" || user?.role === "ADMIN_FINANCE" || user?.role === "STAFF_INPUT";

  const { data, isLoading } = useMonthlyCashPosition({
    month: filters.month || new Date().getMonth() + 1,
    year: filters.year || new Date().getFullYear(),
    businessUnitId: filters.businessUnitId || undefined,
    accountId: filters.accountId || undefined,
    includeNonCashEquivalent: filters.includeNonCashEquivalent,
    includeTransfersInAccountMovement: filters.includeTransfersInAccountMovement,
  });

  if (!isAuthorized) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl bg-white border border-slate-100 shadow-sm">
        <p className="text-slate-500">
          Anda tidak memiliki akses ke halaman ini.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <PageHeader
        title="Monthly Cash Position"
        description="Pergerakan kas dan bank bulanan beserta mutasi per rekening"
      />

      <FinanceFilterBar />

      <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
        <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.includeNonCashEquivalent}
            onChange={(e) => setFilter("includeNonCashEquivalent", e.target.checked)}
            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          Sertakan rekening Non-Cash Equivalent
        </label>
        
        <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.includeTransfersInAccountMovement}
            onChange={(e) => setFilter("includeTransfersInAccountMovement", e.target.checked)}
            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          Sertakan Transfer Antar Rekening
        </label>
      </div>

      {/* Reusing CashPositionSummary but casting the structure since we have `summary` instead of `cashPosition` here */}
      <CashPositionSummary data={{ cashPosition: data?.summary } as any} loading={isLoading} />

      <h3 className="text-lg font-bold text-slate-800 pt-4">Rincian Per Rekening</h3>
      <CashPositionTable accounts={data?.accounts || []} loading={isLoading} />
    </div>
  );
}
