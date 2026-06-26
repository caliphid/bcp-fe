"use client";

import { use } from "react";
import { PageHeader } from "../../../../../components/ui/page-header";
import { MarketplaceSettlementDetailView } from "../../../../../features/marketplace-settlements/components/marketplace-settlement-detail-view";
import { useMarketplaceSettlement } from "../../../../../features/marketplace-settlements/hooks/use-marketplace-settlements";
import { useTranslation } from "../../../../../hooks/use-translation";

export default function MarketplaceSettlementDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { data, isLoading, error, mutate } = useMarketplaceSettlement(resolvedParams.id);
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-slate-100 rounded-2xl"></div>
        <div className="h-[400px] bg-slate-100 rounded-2xl"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12 text-slate-500">
        Settlement not found or failed to load.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title={t('marketplace.settlement.detailTitle')} 
        description={`${t('marketplace.settlement.detailSubtitle')} ${data.settlementCode}`}
        backHref="/dashboard/marketplace-settlements"
      />
      <MarketplaceSettlementDetailView data={data} onMutate={mutate} />
    </div>
  );
}
