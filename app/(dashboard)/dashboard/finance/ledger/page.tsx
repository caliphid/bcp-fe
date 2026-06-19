"use client";

import { useAuthStore } from "@/store/auth-store";
import { PageHeader } from "@/components/ui/page-header";
import { FinanceFilterBar } from "@/features/finance/components/finance-filter-bar";
import { AccountLedgerTable } from "@/features/finance/components/account-ledger-table";
import { useFinanceStore } from "@/features/finance/store/finance-store";
import { useAccountLedger } from "@/features/finance/hooks/use-finance-analytics";

export default function AccountLedgerPage() {
  const { user } = useAuthStore();
  const { filters } = useFinanceStore();

  const isAuthorized = user?.role === "OWNER" || user?.role === "ADMIN_FINANCE" || user?.role === "STAFF_INPUT";

  const { data, isLoading } = useAccountLedger({
    accountId: filters.accountId || "",
    dateFrom: filters.dateFrom || undefined,
    dateTo: filters.dateTo || undefined,
    page: filters.page,
    limit: filters.limit,
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
        title="Account Ledger"
        description="Buku besar / riwayat transaksi spesifik untuk satu rekening bank"
      />

      {/* Note: In a real app we might want a specific ledger filter bar that focuses on accountId and dates instead of months, but we can reuse the FinanceFilterBar if it covers it. However, the user needs to select an account to see anything. */}
      <FinanceFilterBar />

      {!filters.accountId ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
          <div className="text-slate-500 font-medium">Pilih salah satu rekening pada filter di atas untuk melihat buku besar.</div>
        </div>
      ) : (
        <AccountLedgerTable data={data} loading={isLoading} />
      )}
    </div>
  );
}
