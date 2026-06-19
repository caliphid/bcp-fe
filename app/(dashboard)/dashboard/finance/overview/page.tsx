"use client";

import { useAuthStore } from "@/store/auth-store";
import { PageHeader } from "@/components/ui/page-header";
import { FinanceFilterBar } from "@/features/finance/components/finance-filter-bar";
import { FinanceWarningsPanel } from "@/features/finance/components/finance-warnings-panel";
import { MonthlyOverviewSummaryCards } from "@/features/finance/components/monthly-overview-summary-cards";
import { ProfitSummary } from "@/features/finance/components/profit-summary";
import { CashPositionSummary } from "@/features/finance/components/cash-position-summary";
import { useFinanceStore } from "@/features/finance/store/finance-store";
import { useMonthlyOverview } from "@/features/finance/hooks/use-finance-analytics";

export default function FinanceOverviewPage() {
  const { user } = useAuthStore();
  const { filters } = useFinanceStore();
  
  const isAuthorized = user?.role === "OWNER" || user?.role === "ADMIN_FINANCE" || user?.role === "STAFF_INPUT";

  const { data, isLoading } = useMonthlyOverview({
    month: filters.month || new Date().getMonth() + 1,
    year: filters.year || new Date().getFullYear(),
    businessUnitId: filters.businessUnitId || undefined,
    accountId: filters.accountId || undefined,
    includeNonCashEquivalent: filters.includeNonCashEquivalent,
    includeTransfersInAccountMovement: filters.includeTransfersInAccountMovement,
    includeOtherIncome: filters.includeOtherIncome,
    includeOtherExpense: filters.includeOtherExpense,
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
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Monthly Financial Overview"
        description="Ringkasan posisi keuangan, profitabilitas, dan aliran kas bulanan"
      />

      <FinanceFilterBar />

      {!isLoading && data?.warnings && (
        <FinanceWarningsPanel 
          unmappedTransactionCount={data.warnings.unmappedTransactionCount}
          unbalancedAccountCount={data.warnings.unbalancedAccountCount}
        />
      )}

      <MonthlyOverviewSummaryCards data={data} loading={isLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProfitSummary data={data} loading={isLoading} />
        <CashPositionSummary data={data} loading={isLoading} />
      </div>
    </div>
  );
}
