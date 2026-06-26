"use client";

import { useState } from "react";
import { businessUnitsApi } from "../../../../features/business-units/api";
import { BusinessUnit } from "../../../../types/business-unit";
import { useAuthStore } from "../../../../store/auth-store";
import { Button } from "../../../../components/ui/button";
import { PlusCircle } from "lucide-react";
import { Modal } from "../../../../components/ui/modal";
import { BusinessUnitForm } from "../../../../components/forms/business-unit-form";
import { ConfirmDialog } from "../../../../components/ui/confirm-dialog";
import { extractErrorMessage } from "../../../../lib/error";
import { Alert, AlertDescription } from "../../../../components/ui/alert";
import { useBusinessUnits } from "../../../../features/business-units/hooks/use-business-units";
import { BusinessUnitFilterBar } from "../../../../features/business-units/components/business-unit-filter-bar";
import { BusinessUnitTable } from "../../../../features/business-units/components/business-unit-table";
import { useTranslation } from "@/hooks/use-translation";

export default function BusinessUnitsPage() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const canMutate = user?.role === "OWNER";

  const {
    data,
    meta,
    loading,
    globalError,
    setGlobalError,
    fetchData,
  } = useBusinessUnits();

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BusinessUnit | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => Promise<void>;
  }>({
    isOpen: false,
    title: "",
    message: "",
    action: async () => {},
  });

  const handleToggleStatus = (item: BusinessUnit) => {
    const isActivating = item.status === "INACTIVE";
    setConfirmDialog({
      isOpen: true,
      title: isActivating ? t("pages.businessUnits.activateUnit") : t("pages.businessUnits.deactivateUnit"),
      message: isActivating
        ? t("pages.businessUnits.confirmActivate").replace("{name}", item.name)
        : t("pages.businessUnits.confirmDeactivate").replace("{name}", item.name),
      action: async () => {
        try {
          if (isActivating) {
            await businessUnitsApi.activateBusinessUnit(item.id);
          } else {
            await businessUnitsApi.deactivateBusinessUnit(item.id);
          }
          fetchData();
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        } catch (err) {
          setGlobalError(extractErrorMessage(err));
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">{t("pages.businessUnits.title")}</h2>
          <p className="mt-1 text-sm text-slate-500">{t("pages.businessUnits.subtitle")}</p>
        </div>
        {canMutate && (
          <Button
            className="w-full sm:w-auto shadow-primary-500/30 shadow-md"
            onClick={() => {
              setEditingItem(null);
              setIsFormOpen(true);
            }}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> {t("pages.businessUnits.createUnit")}
          </Button>
        )}
      </div>

      {globalError && (
        <Alert variant="destructive">
          <AlertDescription>{globalError}</AlertDescription>
        </Alert>
      )}

      {/* Filter Bar */}
      <BusinessUnitFilterBar />

      {/* Table */}
      <BusinessUnitTable
        data={data}
        meta={meta}
        loading={loading}
        canMutate={canMutate}
        onEdit={(item) => {
          setEditingItem(item);
          setIsFormOpen(true);
        }}
        onToggleStatus={handleToggleStatus}
      />

      {/* Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingItem ? t("pages.businessUnits.editUnit") : t("pages.businessUnits.createModal")}
        className="max-w-2xl"
      >
        <BusinessUnitForm
          initialData={editingItem || undefined}
          onSuccess={() => {
            setIsFormOpen(false);
            fetchData();
          }}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.action}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
