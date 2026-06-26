"use client";

import { use } from "react";
import { PageHeader } from "../../../../../../components/ui/page-header";
import { MarketplaceSettlementForm } from "../../../../../../features/marketplace-settlements/components/marketplace-settlement-form";
import { useMarketplaceSettlement } from "../../../../../../features/marketplace-settlements/hooks/use-marketplace-settlements";
import { useAuthStore } from "../../../../../../store/auth-store";
import { useTranslation } from "../../../../../../hooks/use-translation";

export default function EditMarketplaceSettlementPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { data, isLoading, error } = useMarketplaceSettlement(resolvedParams.id);
  const user = useAuthStore((state) => state.user);
  const { t } = useTranslation();
  const canEdit = user?.role === "OWNER" || user?.role === "ADMIN_FINANCE";

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

  if (!canEdit || !['DRAFT', 'VALIDATING', 'NEEDS_REVIEW'].includes(data.status)) {
    return (
      <div className="text-center py-12 text-slate-500">
        This settlement cannot be edited.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title={t('marketplace.settlement.editTitle')} 
        description={`${t('marketplace.settlement.editSubtitle')} ${data.settlementCode}`}
        backHref={`/dashboard/marketplace-settlements/${resolvedParams.id}`}
      />
      <div className="w-full">
        <MarketplaceSettlementForm initialData={data} />
      </div>
    </div>
  );
}
