"use client";

import { useAuthStore } from "@/store/auth-store";
import { PageHeader } from "@/components/ui/page-header";
import { FinanceFilterBar } from "@/features/finance/components/finance-filter-bar";
import { ProfitVsCashflowPanel } from "@/features/finance/components/profit-vs-cashflow-panel";
import { BalanceReconciliationTable } from "@/features/finance/components/balance-reconciliation-table";
import { useFinanceStore } from "@/features/finance/store/finance-store";
import { useProfitVsCashflow, useBalanceReconciliation } from "@/features/finance/hooks/use-finance-analytics";

export default function ReconciliationPage() {
  const { user } = useAuthStore();
  const { filters } = useFinanceStore();

  const isAuthorized = user?.role === "OWNER" || user?.role === "ADMIN_FINANCE";

  const { data: profitVsCashflowData, isLoading: loadingProfitVsCashflow } = useProfitVsCashflow({
    month: filters.month || new Date().getMonth() + 1,
    year: filters.year || new Date().getFullYear(),
    businessUnitId: filters.businessUnitId || undefined,
    accountId: filters.accountId || undefined,
  });

  const { data: balanceData, isLoading: loadingBalance } = useBalanceReconciliation({
    businessUnitId: filters.businessUnitId || undefined,
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
        title="Financial Reconciliation"
        description="Rekonsiliasi antara Laba dan Aliran Kas, serta Rekonsiliasi Saldo Bank"
      />

      <FinanceFilterBar />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <ProfitVsCashflowPanel data={profitVsCashflowData} loading={loadingProfitVsCashflow} />
        
        <div className="space-y-6">
          <BalanceReconciliationTable data={balanceData} loading={loadingBalance} />
        </div>
      </div>
    </div>
  );
}
