"use client";

import { PageHeader } from "../../../../../components/ui/page-header";
import { MarketplaceAccountForm } from "../../../../../features/marketplace-accounts/components/marketplace-account-form";
import { useTranslation } from "../../../../../hooks/use-translation";

export default function CreateMarketplaceAccountPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <PageHeader 
        title={t('marketplace.account.createTitle')} 
        description={t('marketplace.account.createSubtitle')}
        backHref="/dashboard/marketplace-accounts"
      />
      <div className="w-full">
        <MarketplaceAccountForm />
      </div>
    </div>
  );
}
