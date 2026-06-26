"use client";

import { useState } from "react";
import { categoriesApi } from "../../../../features/categories/api";
import { Category } from "../../../../types/category";
import { useAuthStore } from "../../../../store/auth-store";
import { Button } from "../../../../components/ui/button";
import { PlusCircle } from "lucide-react";
import { Modal } from "../../../../components/ui/modal";
import { CategoryForm } from "../../../../components/forms/category-form";
import { ConfirmDialog } from "../../../../components/ui/confirm-dialog";
import { extractErrorMessage } from "../../../../lib/error";
import { Alert, AlertDescription } from "../../../../components/ui/alert";
import { useCategories } from "../../../../features/categories/hooks/use-categories";
import { CategoryFilterBar } from "../../../../features/categories/components/category-filter-bar";
import { CategoryTable } from "../../../../features/categories/components/category-table";
import { useTranslation } from "@/hooks/use-translation";

export default function CategoriesPage() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const canMutate = user?.role === "OWNER" || user?.role === "ADMIN_FINANCE";

  const {
    data,
    allCategories,
    meta,
    loading,
    globalError,
    setGlobalError,
    fetchData,
    fetchAllCategories,
  } = useCategories();

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Category | null>(null);

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

  const handleToggleStatus = (item: Category) => {
    const isActivating = item.status === "INACTIVE";
    setConfirmDialog({
      isOpen: true,
      title: isActivating ? t("pages.categories.activateCategory") : t("pages.categories.deactivateCategory"),
      message: isActivating
        ? t("pages.categories.confirmActivate").replace("{name}", item.name)
        : t("pages.categories.confirmDeactivate").replace("{name}", item.name),
      action: async () => {
        try {
          if (isActivating) {
            await categoriesApi.activateCategory(item.id);
          } else {
            await categoriesApi.deactivateCategory(item.id);
          }
          fetchData();
          fetchAllCategories();
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
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">{t("pages.categories.title")}</h2>
          <p className="mt-1 text-sm text-slate-500">{t("pages.categories.subtitle")}</p>
        </div>
        {canMutate && (
          <Button
            className="w-full sm:w-auto shadow-primary-500/30 shadow-md"
            onClick={() => {
              setEditingItem(null);
              setIsFormOpen(true);
            }}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> {t("pages.categories.createCategory")}
          </Button>
        )}
      </div>

      {globalError && (
        <Alert variant="destructive">
          <AlertDescription>{globalError}</AlertDescription>
        </Alert>
      )}

      {/* Filter Bar */}
      <CategoryFilterBar />

      {/* Table */}
      <CategoryTable
        data={data}
        allCategories={allCategories}
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
        title={editingItem ? t("pages.categories.editCategory") : t("pages.categories.createCategory")}
        className="max-w-2xl"
      >
        <CategoryForm
          initialData={editingItem || undefined}
          categories={allCategories}
          onSuccess={() => {
            setIsFormOpen(false);
            fetchData();
            fetchAllCategories(); // Refresh dropdown
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
