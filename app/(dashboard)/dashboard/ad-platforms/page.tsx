"use client";
import { toast } from "react-hot-toast";

import { useState } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { Plus, HelpCircle } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Modal } from "../../../../components/ui/modal";
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
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { params } = useAdPlatformStore();
  const { data, meta, isLoading, mutate } = useAdPlatforms(params);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<AdPlatformItem | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);

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
      toast.error(t("pages.adPlatforms.failedStatus"));
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <PageHeader
            title={t("pages.adPlatforms.title")}
            description={t("pages.adPlatforms.subtitle")}
          />
          <Button type="button" variant="outline" size="sm" onClick={() => setShowTutorial(true)} className="bg-white hover:bg-slate-50 text-indigo-600 border-indigo-200 h-8 px-3 mt-1">
            <HelpCircle className="w-4 h-4 mr-1.5" /> Panduan Iklan
          </Button>
        </div>
        
        {canMutate && (
          <Button onClick={handleCreate} className="shadow-sm">
            <Plus className="mr-2 h-4 w-4" />
            {t("pages.adPlatforms.addPlatform")}
          </Button>
        )}
      </div>

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

      <Modal isOpen={showTutorial} onClose={() => setShowTutorial(false)} title="Tutorial: Platform Iklan & ROAS" className="max-w-2xl">
        <div className="space-y-6 text-slate-700 text-sm leading-relaxed max-h-[70vh] overflow-y-auto pr-2">
          <p className="mb-2">Gunakan modul ini untuk mendaftarkan akun iklan Anda (Contoh: Meta Ads, TikTok Ads, Google Ads). Tujuan utamanya adalah untuk memonitor **Biaya Iklan (Ad Spend)** dan mengukur tingkat keuntungan dari iklan **(ROAS - Return on Ad Spend)**.</p>
          
          <div className="space-y-4 mt-6">
            <h4 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-2">Bagaimana Sistem Menghitung ROAS?</h4>
            <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
              <ul className="list-disc pl-4 text-xs text-indigo-800 space-y-2">
                <li>Anda perlu secara berkala menginput <strong>Daily Ad Spend</strong> (Biaya iklan harian) untuk setiap platform melalui menu detail platform.</li>
                <li>Saat Sales Order (SO) dibuat oleh pelanggan, Anda bisa menandai dari <strong>Platform Iklan mana</strong> SO tersebut berasal (UTM Tracking).</li>
                <li>Sistem akan otomatis menghitung <strong>Total Pendapatan (SO) dibagi Total Biaya Iklan</strong> untuk menghasilkan metrik ROAS (Return On Ad Spend).</li>
              </ul>
            </div>
          </div>

          <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 mt-6">
            <span className="font-semibold text-amber-800 block mb-1">Catatan Akuntansi</span>
            <p className="text-xs text-amber-700">Modul Iklan ini murni untuk metrik <strong>Marketing (ROAS)</strong>. Untuk pencatatan biaya aktual secara Akuntansi yang akan mengurangi uang dari Bank (misal top up saldo iklan), Anda tetap harus menginput pengeluaran melalui menu <strong>Finance &amp; Accounting &gt; Transactions (Cash OUT)</strong>.</p>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100 mt-4">
            <Button type="button" onClick={() => setShowTutorial(false)}>Mengerti</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
