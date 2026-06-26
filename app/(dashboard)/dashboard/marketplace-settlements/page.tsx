"use client";

import { useState } from "react";
import { useAuthStore } from "../../../../store/auth-store";
import { Button } from "../../../../components/ui/button";
import { PlusCircle } from "lucide-react";
import { useMarketplaceSettlements } from "../../../../features/marketplace-settlements/hooks/use-marketplace-settlements";
import { MarketplaceSettlementsTable } from "../../../../features/marketplace-settlements/components/marketplace-settlements-table";
import { useRouter } from "next/navigation";
import { Input } from "../../../../components/ui/input";
import { useTranslation } from "../../../../hooks/use-translation";

export default function MarketplaceSettlementsPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const canMutate = user?.role === "OWNER" || user?.role === "ADMIN_FINANCE";

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, meta, isLoading } = useMarketplaceSettlements({
    page,
    limit: 10,
    search,
  });
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">{t('marketplace.settlement.title')}</h2>
          <p className="mt-1 text-sm text-slate-500">{t('marketplace.settlement.subtitle')}</p>
        </div>
        {canMutate && (
          <Button
            className="w-full sm:w-auto shadow-primary-500/30 shadow-md"
            onClick={() => router.push("/dashboard/marketplace-settlements/create")}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> {t('marketplace.settlement.createTitle')}
          </Button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4">
        <Input
          placeholder={t('marketplace.settlement.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Table */}
      <MarketplaceSettlementsTable
        data={data}
        meta={meta}
        loading={isLoading}
        onPageChange={setPage}
      />
    </div>
  );
}
