"use client";

import { useState } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { Plus } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { PageHeader } from "../../../../components/ui/page-header";
import { useAuthStore } from "../../../../store/auth-store";
import { AdCampaignList } from "../../../../features/ad-campaigns/components/ad-campaign-list";
import { AdCampaignFilterBar } from "../../../../features/ad-campaigns/components/ad-campaign-filter-bar";
import { AdCampaignFormModal } from "../../../../features/ad-campaigns/components/ad-campaign-form-modal";
import { CampaignStatusModal } from "../../../../features/ad-campaigns/components/campaign-status-modal";
import { useAdCampaigns } from "../../../../features/ad-campaigns/hooks/use-ad-campaigns";
import { useAdCampaignStore } from "../../../../features/ad-campaigns/store/ad-campaign-store";
import { adCampaignsApi } from "../../../../features/ad-campaigns/api";
import { AdCampaignItem, AdCampaignStatus } from "../../../../types/ads";

export default function AdCampaignsPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { params } = useAdCampaignStore();
  const { data, meta, isLoading, mutate } = useAdCampaigns(params);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<AdCampaignItem | null>(null);

  const canMutate = user?.role === "OWNER" || user?.role === "ADMIN_FINANCE";

  const handleCreate = () => {
    setSelectedItem(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: AdCampaignItem) => {
    setSelectedItem(item);
    setIsFormOpen(true);
  };

  const handleStatusChange = (item: AdCampaignItem) => {
    setSelectedItem(item);
    setIsStatusModalOpen(true);
  };

  const handleFormSubmit = async (payload: any) => {
    if (selectedItem) {
      await adCampaignsApi.updateCampaign(selectedItem.id, payload);
    } else {
      await adCampaignsApi.createCampaign(payload);
    }
    mutate();
  };

  const handleStatusSubmit = async (status: AdCampaignStatus) => {
    if (selectedItem) {
      await adCampaignsApi.updateCampaignStatus(selectedItem.id, { status });
      mutate();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("pages.adCampaigns.title")}
        description={t("pages.adCampaigns.subtitle")}
      >
        {canMutate && (
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            {t("pages.adCampaigns.addCampaign")}
          </Button>
        )}
      </PageHeader>

      <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
        <div className="mb-6">
          <AdCampaignFilterBar />
        </div>

        <AdCampaignList
          data={data}
          meta={meta}
          loading={isLoading}
          canMutate={canMutate}
          onEdit={handleEdit}
          onChangeStatus={handleStatusChange}
        />
      </div>

      <AdCampaignFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedItem}
      />

      <CampaignStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        campaign={selectedItem}
        onSubmit={handleStatusSubmit}
      />
    </div>
  );
}
