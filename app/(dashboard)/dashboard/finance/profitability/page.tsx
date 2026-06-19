"use client";

import { useAuthStore } from "@/store/auth-store";
import { PageHeader } from "@/components/ui/page-header";
import { FinanceFilterBar } from "@/features/finance/components/finance-filter-bar";
import { ProfitSummary } from "@/features/finance/components/profit-summary";
import { useFinanceStore } from "@/features/finance/store/finance-store";
import { useMonthlyProfit } from "@/features/finance/hooks/use-finance-analytics";
import { AlertTriangle } from "lucide-react";

export default function ProfitabilityPage() {
  const { user } = useAuthStore();
  const { filters } = useFinanceStore();

  const isAuthorized = user?.role === "OWNER" || user?.role === "ADMIN_FINANCE";

  const { data, isLoading } = useMonthlyProfit({
    month: filters.month || new Date().getMonth() + 1,
    year: filters.year || new Date().getFullYear(),
    businessUnitId: filters.businessUnitId || undefined,
    accountId: filters.accountId || undefined,
    includeOtherIncome: filters.includeOtherIncome,
    includeOtherExpense: filters.includeOtherExpense,
  });

  if (!isAuthorized) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl bg-white border border-slate-100 shadow-sm">
        <p className="text-slate-500">
          Anda tidak memiliki akses ke halaman Profitabilitas. Hubungi Owner / Admin.
        </p>
      </div>
    );
  }

  const formatMoney = (val?: string) => {
    if (!val) return "Rp 0";
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(val));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Monthly Profitability"
        description="Analisa detil pendapatan, beban pokok, dan laba bersih perusahaan"
      />

      <FinanceFilterBar />

      {!isLoading && data?.unmapped && data.unmapped.transactionCount > 0 && (
        <div className="rounded-xl bg-orange-50 border border-orange-200 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-shrink-0 bg-orange-100 p-2 rounded-full">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
            <h3 className="text-sm font-semibold text-orange-800">
              Perhatian: Ada {data.unmapped.transactionCount} Transaksi Belum Terpetakan
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm mt-4 pl-12 text-orange-800">
            <div>Total Unmapped In: <strong className="text-orange-900">{formatMoney(data.unmapped.totalIn)}</strong></div>
            <div>Total Unmapped Out: <strong className="text-orange-900">{formatMoney(data.unmapped.totalOut)}</strong></div>
          </div>
          {data.unmapped.categories?.length > 0 && (
            <div className="mt-4 pl-12">
              <p className="text-xs font-semibold text-orange-700 mb-2">Kategori yang perlu disesuaikan (Map / Void):</p>
              <div className="flex flex-wrap gap-2">
                {data.unmapped.categories.map((cat, i) => (
                  <span key={i} className="px-2 py-1 bg-white border border-orange-200 rounded-md text-xs text-orange-700 font-medium">
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Note: ProfitSummary expects MonthlyOverviewResponse shape, we need to adapt it since MonthlyProfitResponse is flatter. 
          We'll map it to the expected shape inline for simplicity. */}
      <ProfitSummary 
        data={{ profitability: data } as any} 
        loading={isLoading} 
      />
    </div>
  );
}
