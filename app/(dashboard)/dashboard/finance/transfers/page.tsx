"use client";

import { useState } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { useAuthStore } from "@/store/auth-store";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { TransfersTable } from "@/features/finance/components/transfers-table";
import { TransferFormModal } from "@/features/finance/components/transfer-form-modal";
import { useAccountTransfers } from "@/features/finance/hooks/use-finance-analytics";
import { Plus } from "lucide-react";
import { AccountTransferResponse } from "@/types/finance";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { financeApi } from "@/features/finance/api";
import { toast } from "react-hot-toast";
import { extractErrorMessage } from "@/lib/error";
import { Input } from "@/components/ui/input";

export default function AccountTransfersPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [voidTarget, setVoidTarget] = useState<AccountTransferResponse | null>(
    null,
  );
  const [voidReason, setVoidReason] = useState("");
  const [voiding, setVoiding] = useState(false);

  const isAuthorized =
    user?.role === "OWNER" ||
    user?.role === "ADMIN_FINANCE" ||
    user?.role === "STAFF_INPUT";
  const isStaffInput = user?.role === "STAFF_INPUT";

  const { data, isLoading, mutate } = useAccountTransfers();

  if (!isAuthorized) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl bg-white border border-slate-100 shadow-sm">
        <p className="text-slate-500">
          {t("pages.accountTransfers.noAccess")}
        </p>
      </div>
    );
  }

  const handleVoid = async () => {
    if (!voidTarget || !voidReason) {
      toast.error(t("pages.accountTransfers.voidReasonRequired"));
      return;
    }
    setVoiding(true);
    try {
      await financeApi.voidAccountTransfer(voidTarget.id, { voidReason });
      toast.success(t("pages.accountTransfers.voidSuccess"));
      mutate();
      setVoidTarget(null);
      setVoidReason("");
    } catch (err) {
      toast.error(extractErrorMessage(err, t("pages.accountTransfers.voidFailed")));
    } finally {
      setVoiding(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <PageHeader
          title={t("pages.accountTransfers.title")}
          description={t("pages.accountTransfers.subtitle")}
        />
        {!isStaffInput && (
          <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            {t("pages.accountTransfers.newTransfer")}
          </Button>
        )}
      </div>

      <TransfersTable
        data={data}
        loading={isLoading}
        onVoidClick={(transfer) => setVoidTarget(transfer)}
        isStaffInput={isStaffInput}
      />

      {isCreateModalOpen && (
        <TransferFormModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => mutate()}
        />
      )}

      {voidTarget && (
        <ConfirmDialog
          isOpen={true}
          onCancel={() => {
            setVoidTarget(null);
            setVoidReason("");
          }}
          title={t("pages.accountTransfers.voidTransfer")}
          message={t("pages.accountTransfers.confirmVoid").replace("{code}", voidTarget.transferCode).replace("{amount}", new Intl.NumberFormat("id-ID").format(Number(voidTarget.amount)))}
          confirmText={voiding ? t("common.actions.processing") : t("pages.accountTransfers.confirmVoidBtn")}
          onConfirm={handleVoid}
          isDestructive
        >
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t("pages.accountTransfers.voidReason")}
            </label>
            <Input
              placeholder={t("pages.accountTransfers.voidReasonPh")}
              value={voidReason}
              onChange={(e) => setVoidReason(e.target.value)}
              required
            />
          </div>
        </ConfirmDialog>
      )}
    </div>
  );
}
