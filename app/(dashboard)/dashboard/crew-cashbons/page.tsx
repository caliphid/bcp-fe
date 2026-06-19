"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, BarChart3 } from "lucide-react";
import { PageHeader } from "../../../../components/ui/page-header";
import { Button } from "../../../../components/ui/button";
import { useAuthStore } from "../../../../store/auth-store";
import { useCrewCashbons } from "../../../../features/crew-cashbons/hooks/use-crew-cashbons";
import { crewCashbonsApi } from "../../../../features/crew-cashbons/api";
import { CrewCashbonItem, CreateCrewCashbonPayload } from "../../../../types/crew-cashbon";
import { CashbonTable } from "../../../../features/crew-cashbons/components/cashbon-table";
import { CashbonFilterBar } from "../../../../features/crew-cashbons/components/cashbon-filter-bar";
import { CashbonFormModal } from "../../../../features/crew-cashbons/components/cashbon-form-modal";

export default function CrewCashbonsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { data, meta, loading, refetch } = useCrewCashbons();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCashbon, setSelectedCashbon] = useState<CrewCashbonItem | null>(null);

  const role = user?.role;
  const canCreate = role === "OWNER" || role === "ADMIN_FINANCE";
  const canEdit = role === "OWNER" || role === "ADMIN_FINANCE";
  const canViewSummary = role === "OWNER" || role === "ADMIN_FINANCE";

  const handleCreate = async (payload: Partial<CreateCrewCashbonPayload>) => {
    await crewCashbonsApi.createCrewCashbon(payload as CreateCrewCashbonPayload);
    refetch();
  };

  const handleUpdate = async (payload: Partial<CreateCrewCashbonPayload>) => {
    if (!selectedCashbon) return;
    await crewCashbonsApi.updateCrewCashbon(selectedCashbon.id, payload);
    refetch();
  };

  const handleView = (item: CrewCashbonItem) => {
    router.push(`/dashboard/crew-cashbons/${item.id}`);
  };

  const handleEdit = (item: CrewCashbonItem) => {
    setSelectedCashbon(item);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Crew Cashbons"
        description="Kelola cashbon dan advance pembayaran untuk crew."
      >
        <div className="flex gap-2">
          {canViewSummary && (
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/crew-cashbons/summary")}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Summary & Analytics
            </Button>
          )}
          {canCreate && (
            <Button onClick={() => {
              setSelectedCashbon(null);
              setIsFormOpen(true);
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Buat Cashbon Baru
            </Button>
          )}
        </div>
      </PageHeader>

      <div>
        <CashbonFilterBar />
        <CashbonTable
          data={data}
          meta={meta}
          loading={loading}
          canEdit={canEdit}
          onView={handleView}
          onEdit={handleEdit}
        />
      </div>

      <CashbonFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={selectedCashbon ? handleUpdate : handleCreate}
        initialData={selectedCashbon}
      />
    </div>
  );
}
