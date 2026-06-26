"use client";
import { toast } from "react-hot-toast";
import { isAxiosError } from "axios";
import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { useAuthStore } from "../../../../store/auth-store";
import { useReceivables } from "../../../../features/external-money/hooks/use-receivables";
import { useReceivableStore } from "../../../../features/external-money/store/receivable-store";
import { externalMoneyApi } from "../../../../features/external-money/api";
import { CreateReceivablePayload } from "../../../../types/receivable";
import { ReceivablesFilterBar } from "../../../../features/external-money/components/receivables/receivables-filter-bar";
import { ReceivablesTable } from "../../../../features/external-money/components/receivables/receivables-table";
import { ReceivableFormModal } from "../../../../features/external-money/components/receivables/receivable-form-modal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

export default function ReceivablesPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const isReadonly = user?.role === "STAFF_INPUT";

  const { data, meta, loading, refetch } = useReceivables();
  const { setFilter } = useReceivableStore();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handlePageChange = (page: number) => {
    setFilter("page", page);
  };

  const handleCreate = async (payload: CreateReceivablePayload) => {
    try {
      await externalMoneyApi.createReceivable(payload);
      toast.success(t("pages.receivables.addDataSuccess"));
      refetch();
    } catch (err) {
      if (isAxiosError(err)) {
        const msg = err.response?.data?.message;
        toast.error(Array.isArray(msg) ? msg[0] : msg || t("pages.receivables.addDataFailed"));
      } else {
        toast.error(t("pages.receivables.addDataFailed"));
      }
      throw err;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title={t("pages.receivables.title")}
        description={t("pages.receivables.subtitle")}
      />

      <ReceivablesFilterBar />

      <ReceivablesTable
        data={data}
        meta={meta}
        loading={loading}
        onPageChange={handlePageChange}
        headerActions={
          !isReadonly && (
            <Button onClick={() => setIsCreateModalOpen(true)} size="sm">
              <Plus className="mr-2 h-4 w-4" /> {t("pages.receivables.addData")}
            </Button>
          )
        }
      />

      <ReceivableFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
}
