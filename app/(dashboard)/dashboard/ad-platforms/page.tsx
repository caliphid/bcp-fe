"use client";
import { toast } from "react-hot-toast";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { PageHeader } from "../../../../components/ui/page-header";
import { useAuthStore } from "../../../../store/auth-store";
import { AdPlatformList } from "../../../../features/ad-platforms/components/ad-platform-list";
import { AdPlatformFilterBar } from "../../../../features/ad-platforms/components/ad-platform-filter-bar";
import { AdPlatformFormModal } from "../../../../features/ad-platforms/components/ad-platform-form-modal";
import { useAdPlatforms } from "../../../../features/ad-platforms/hooks/use-ad-platforms";
import { useAdPlatformStore } from "../../../../features/ad-platforms/store/ad-platform-store";
import { adPlatformsApi } from "../../../../features/ad-platforms/api";
import { AdPlatformItem } from "../../../../types/ads";

export default function AdPlatformsPage() {
  const { user } = useAuthStore();
  const { params } = useAdPlatformStore();
  const { data, meta, isLoading, mutate } = useAdPlatforms(params);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<AdPlatformItem | null>(null);

  const canMutate = user?.role === "OWNER" || user?.role === "ADMIN_FINANCE";
  const canToggleStatus = user?.role === "OWNER";

  const handleCreate = () => {
    setSelectedItem(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: AdPlatformItem) => {
    setSelectedItem(item);
    setIsFormOpen(true);
  };

  const handleToggleStatus = async (item: AdPlatformItem) => {
    if (!canToggleStatus) return;
    try {
      if (item.status === "ACTIVE") {
        await adPlatformsApi.deactivatePlatform(item.id);
      } else {
        await adPlatformsApi.activatePlatform(item.id);
      }
      mutate();
    } catch (error) {
      console.error("Failed to toggle status:", error);
      toast.error("Gagal mengubah status. Pastikan tidak ada campaign aktif yang menggunakan platform ini.");
    }
  };

  const handleSubmit = async (payload: any) => {
    if (selectedItem) {
      await adPlatformsApi.updatePlatform(selectedItem.id, payload);
    } else {
      await adPlatformsApi.createPlatform(payload);
    }
    mutate();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ad Platforms"
        description="Kelola platform periklanan (Meta, TikTok, Google, dll)"
      >
        {canMutate && (
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Platform
          </Button>
        )}
      </PageHeader>

      <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
        <div className="mb-6">
          <AdPlatformFilterBar />
        </div>

        <AdPlatformList
          data={data}
          meta={meta}
          loading={isLoading}
          canMutate={canMutate}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
        />
      </div>

      <AdPlatformFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        initialData={selectedItem}
      />
    </div>
  );
}
