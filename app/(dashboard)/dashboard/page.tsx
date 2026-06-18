"use client";

import { useAuthStore } from "../../../store/auth-store";
import { DashboardFilterBar } from "../../../features/dashboard/components/dashboard-filter-bar";
import { DashboardOverviewCards } from "../../../features/dashboard/components/dashboard-overview-cards";
import { DashboardMonthComparison } from "../../../features/dashboard/components/dashboard-month-comparison";
import { DashboardFinanceHealthCard } from "../../../features/dashboard/components/dashboard-finance-health-card";
import { DashboardMonthlyTrend } from "../../../features/dashboard/components/dashboard-monthly-trend";
import { DashboardDailyTrend } from "../../../features/dashboard/components/dashboard-daily-trend";
import { DashboardCategoryBreakdown } from "../../../features/dashboard/components/dashboard-category-breakdown";
import { DashboardTopTransactions } from "../../../features/dashboard/components/dashboard-top-transactions";
import { DashboardAccountBalances } from "../../../features/dashboard/components/dashboard-account-balances";
import { DashboardBusinessUnitPerformance } from "../../../features/dashboard/components/dashboard-business-unit-performance";
import { DashboardYearlySummary } from "../../../features/dashboard/components/dashboard-yearly-summary";
import { DashboardRecentTransactions } from "../../../features/dashboard/components/dashboard-recent-transactions";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  if (!user) return null;

  const isAdvancedRole = ["OWNER", "ADMIN_FINANCE"].includes(user.role);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Finance Dashboard</h2>
        <p className="mt-1 text-slate-500">Overview of your cashflow and business performance.</p>
      </div>

      <DashboardFilterBar />

      <div className="space-y-6">
        <DashboardOverviewCards />
        
        {isAdvancedRole && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <DashboardMonthComparison />
            </div>
            <div className="lg:col-span-1">
              <DashboardFinanceHealthCard />
            </div>
          </div>
        )}

        {isAdvancedRole && (
          <DashboardMonthlyTrend />
        )}

        {isAdvancedRole && (
          <div className="grid lg:grid-cols-2 gap-6">
            <DashboardDailyTrend />
            <DashboardCategoryBreakdown />
          </div>
        )}

        {isAdvancedRole && (
          <DashboardTopTransactions />
        )}

        {isAdvancedRole && (
          <div className="grid lg:grid-cols-2 gap-6">
            <DashboardAccountBalances />
            <DashboardBusinessUnitPerformance />
          </div>
        )}

        {isAdvancedRole && (
          <DashboardYearlySummary />
        )}

        <DashboardRecentTransactions />
      </div>
    </div>
  );
}
