"use client";

import { use } from "react";
import { PageHeader } from "../../../../../../components/ui/page-header";
import { MarketplaceAccountForm } from "../../../../../../features/marketplace-accounts/components/marketplace-account-form";
import { useMarketplaceAccount } from "../../../../../../features/marketplace-accounts/hooks/use-marketplace-accounts";
import { useTranslation } from "../../../../../../hooks/use-translation";

export default function EditMarketplaceAccountPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { data, isLoading, error } = useMarketplaceAccount(resolvedParams.id);
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
        Account not found or failed to load.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title={t('marketplace.account.editTitle')} 
        description={`${t('marketplace.account.editSubtitle')} ${data.name}`}
        backHref="/dashboard/marketplace-accounts"
      />
      <div className="w-full">
        <MarketplaceAccountForm initialData={data} />
      </div>
    </div>
  );
}
