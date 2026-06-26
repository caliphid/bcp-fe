"use client";

import { use } from "react";
import { PageHeader } from "../../../../../components/ui/page-header";
import { MarketplaceAccountDetail } from "../../../../../features/marketplace-accounts/components/marketplace-account-detail";
import { useMarketplaceAccount } from "../../../../../features/marketplace-accounts/hooks/use-marketplace-accounts";
import { useTranslation } from "../../../../../hooks/use-translation";
import { Edit } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "../../../../../store/auth-store";

export default function MarketplaceAccountDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { data, isLoading, error } = useMarketplaceAccount(resolvedParams.id);
  const { t } = useTranslation();
  const { user } = useAuthStore();
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
        Account not found or failed to load.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Marketplace Account Details"
        description={`Viewing details for ${data.name}`}
        backHref="/dashboard/marketplace-accounts"
      >
        {canEdit && (
          <Link 
            href={`/dashboard/marketplace-accounts/${data.id}/edit`}
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm shadow-primary-600/20"
          >
            <Edit className="w-4 h-4" />
            Edit Account
          </Link>
        )}
      </PageHeader>
      <div className="w-full">
        <MarketplaceAccountDetail data={data} />
      </div>
    </div>
  );
}
