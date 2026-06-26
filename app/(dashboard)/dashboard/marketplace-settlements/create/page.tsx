"use client";

import { PageHeader } from "../../../../../components/ui/page-header";
import { MarketplaceSettlementForm } from "../../../../../features/marketplace-settlements/components/marketplace-settlement-form";
import { useTranslation } from "../../../../../hooks/use-translation";

export default function CreateMarketplaceSettlementPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <PageHeader 
        title={t('marketplace.settlement.createTitle')} 
        description={t('marketplace.settlement.createSubtitle')}
        backHref="/dashboard/marketplace-settlements"
      />
      <div className="w-full">
        <MarketplaceSettlementForm />
      </div>
    </div>
  );
}
