"use client";

import { useState } from "react";
import { accountsApi } from "../../../../features/accounts/api";
import { Account } from "../../../../types/account";
import { useAuthStore } from "../../../../store/auth-store";
import { Button } from "../../../../components/ui/button";
import { PlusCircle } from "lucide-react";
import { Modal } from "../../../../components/ui/modal";
import { AccountForm } from "../../../../components/forms/account-form";
import { ConfirmDialog } from "../../../../components/ui/confirm-dialog";
import { extractErrorMessage } from "../../../../lib/error";
import { Alert, AlertDescription } from "../../../../components/ui/alert";
import { useAccounts } from "../../../../features/accounts/hooks/use-accounts";
import { useTranslation } from "@/hooks/use-translation";
import { AccountFilterBar } from "../../../../features/accounts/components/account-filter-bar";
import { AccountTable } from "../../../../features/accounts/components/account-table";

export default function AccountsPage() {
  const user = useAuthStore((state) => state.user);
  const { t } = useTranslation();
  const canMutate = user?.role === "OWNER" || user?.role === "ADMIN_FINANCE";

  const {
    data,
    meta,
    loading,
    globalError,
    setGlobalError,
    businessUnits,
    fetchData,
  } = useAccounts();

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Account | null>(null);

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

  const handleToggleStatus = (item: Account) => {
    const isActivating = item.status === "INACTIVE";
    setConfirmDialog({
      isOpen: true,
      title: isActivating ? t("pages.accounts.activateAccount") : t("pages.accounts.deactivateAccount"),
      message: isActivating
        ? t("pages.accounts.confirmActivate").replace("{name}", item.name)
        : t("pages.accounts.confirmDeactivate").replace("{name}", item.name),
      action: async () => {
        try {
          if (isActivating) {
            await accountsApi.activateAccount(item.id);
          } else {
            await accountsApi.deactivateAccount(item.id);
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
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">{t("pages.accounts.title")}</h2>
          <p className="mt-1 text-sm text-slate-500">{t("pages.accounts.subtitle")}</p>
        </div>
        {canMutate && (
          <Button
            className="w-full sm:w-auto shadow-primary-500/30 shadow-md"
            onClick={() => {
              setEditingItem(null);
              setIsFormOpen(true);
            }}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> {t("pages.accounts.createAccount")}
          </Button>
        )}
      </div>

      {globalError && (
        <Alert variant="destructive">
          <AlertDescription>{globalError}</AlertDescription>
        </Alert>
      )}

      {/* Filter Bar */}
      <AccountFilterBar businessUnits={businessUnits} />

      {/* Table */}
      <AccountTable
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
        title={editingItem ? t("pages.accounts.editAccount") : t("pages.accounts.createAccount")}
        className="max-w-2xl"
      >
        <AccountForm
          initialData={editingItem || undefined}
          businessUnits={businessUnits}
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
