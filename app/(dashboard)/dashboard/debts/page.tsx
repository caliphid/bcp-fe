"use client";

import { useState } from "react";
import { useAuthStore } from "../../../../store/auth-store";
import { useDebts } from "../../../../features/debts/hooks/use-debts";
import { useDebtSummary } from "../../../../features/debts/hooks/use-debt-summary";
import { useDebtDetail } from "../../../../features/debts/hooks/use-debt-detail";
import { debtsApi } from "../../../../features/debts/api";
import { DebtItem, DebtPaymentItem, CreateDebtPayload, UpdateDebtPayload, CreateDebtPaymentPayload } from "../../../../types/debt";

import { DebtFilterBar } from "../../../../features/debts/components/debt-filter-bar";
import { DebtSummaryCards } from "../../../../features/debts/components/debt-summary-cards";
import { DebtTable } from "../../../../features/debts/components/debt-table";
import { DebtFormModal } from "../../../../features/debts/components/debt-form-modal";
import { DebtPaymentFormModal } from "../../../../features/debts/components/debt-payment-form-modal";
import { VoidPaymentModal } from "../../../../features/debts/components/void-payment-modal";
import { DebtDetailDrawer } from "../../../../features/debts/components/debt-detail-drawer";
import { DebtLenderSummary } from "../../../../features/debts/components/debt-lender-summary";
import { DebtUnitSummary } from "../../../../features/debts/components/debt-unit-summary";
import { Button } from "../../../../components/ui/button";
import { Plus } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

export default function DebtsPage() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  
  const { data: debts, meta, loading: debtsLoading, refetch: refetchDebts } = useDebts();
  const { summary, byLender, byUnit, loading: summaryLoading, refetch: refetchSummary } = useDebtSummary();

  // State for modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<DebtItem | null>(null);

  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
  const [paymentTargetDebt, setPaymentTargetDebt] = useState<DebtItem | null>(null);

  const [isVoidModalOpen, setIsVoidModalOpen] = useState(false);
  const [voidTargetPayment, setVoidTargetPayment] = useState<DebtPaymentItem | null>(null);

  const [detailId, setDetailId] = useState<string | null>(null);
  const { data: detailData, loading: detailLoading, refetch: refetchDetail } = useDebtDetail(detailId);

  const canMutate = user?.role === "OWNER" || user?.role === "ADMIN_FINANCE";
  const canActivate = user?.role === "OWNER";

  const refreshAll = () => {
    refetchDebts();
    refetchSummary();
    if (detailId) refetchDetail();
  };

  const handleOpenCreate = () => {
    setEditingDebt(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: DebtItem) => {
    setEditingDebt(item);
    setIsFormOpen(true);
  };

  const handleSaveDebt = async (payload: Partial<CreateDebtPayload>) => {
    if (editingDebt) {
      await debtsApi.updateDebt(editingDebt.id, payload as UpdateDebtPayload);
    } else {
      await debtsApi.createDebt(payload as CreateDebtPayload);
    }
    refreshAll();
  };

  const handleOpenPayment = (item: DebtItem) => {
    setPaymentTargetDebt(item);
    setIsPaymentFormOpen(true);
  };

  const handleSavePayment = async (payload: CreateDebtPaymentPayload) => {
    if (paymentTargetDebt) {
      await debtsApi.createDebtPayment(paymentTargetDebt.id, payload);
      refreshAll();
    }
  };

  const handleOpenVoid = (payment: DebtPaymentItem) => {
    setVoidTargetPayment(payment);
    setIsVoidModalOpen(true);
  };

  const handleConfirmVoid = async (reason: string) => {
    if (voidTargetPayment) {
      await debtsApi.voidDebtPayment(voidTargetPayment.id, { voidReason: reason });
      refreshAll();
    }
  };

  const handleActivate = async () => {
    if (detailId && confirm(t("pages.debts.confirmActivate"))) {
      await debtsApi.activateDebt(detailId);
      refreshAll();
    }
  };

  const handleDeactivate = async () => {
    if (detailId && confirm(t("pages.debts.confirmDeactivate"))) {
      await debtsApi.deactivateDebt(detailId);
      refreshAll();
    }
  };

  const handleCloseDebt = async () => {
    if (detailId && confirm(t("pages.debts.confirmClose"))) {
      await debtsApi.closeDebt(detailId);
      refreshAll();
    }
  };

  const showSidebar = user?.role !== "STAFF_INPUT" && (summaryLoading || (byLender && byLender.length > 0) || (byUnit && byUnit.length > 0));

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50/50">
      <div className="flex-none p-6 pb-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t("pages.debts.title")}</h1>
            <p className="text-sm text-slate-500 mt-1">{t("pages.debts.subtitle")}</p>
          </div>
          {canMutate && (
            <Button onClick={handleOpenCreate} className="gap-2 shadow-sm">
              <Plus className="h-4 w-4" />
              {t("pages.debts.addDebt")}
            </Button>
          )}
        </div>

        <DebtSummaryCards data={summary} loading={summaryLoading} />
        <DebtFilterBar />
      </div>

      <div className="flex-1 overflow-auto p-6 pt-0">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className={showSidebar ? "xl:col-span-3" : "xl:col-span-4"}>
            <DebtTable
              data={debts}
              meta={meta}
              loading={debtsLoading}
              canEdit={canMutate}
              onView={(item) => setDetailId(item.id)}
              onEdit={handleOpenEdit}
            />
          </div>
          
          {showSidebar && (
            <div className="xl:col-span-1 space-y-6">
              <DebtLenderSummary data={byLender} loading={summaryLoading} />
              <DebtUnitSummary data={byUnit} loading={summaryLoading} />
            </div>
          )}
        </div>
      </div>

      {/* Drawers & Modals */}
      <DebtDetailDrawer
        isOpen={!!detailId}
        onClose={() => setDetailId(null)}
        debt={detailData}
        loading={detailLoading}
        onAddPayment={() => handleOpenPayment(detailData as unknown as DebtItem)}
        onVoidPayment={handleOpenVoid}
        onActivate={handleActivate}
        onDeactivate={handleDeactivate}
        onCloseDebt={handleCloseDebt}
      />

      <DebtFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialData={editingDebt}
        onSubmit={handleSaveDebt}
      />

      <DebtPaymentFormModal
        isOpen={isPaymentFormOpen}
        onClose={() => setIsPaymentFormOpen(false)}
        debt={paymentTargetDebt}
        onSubmit={handleSavePayment}
      />

      <VoidPaymentModal
        isOpen={isVoidModalOpen}
        onClose={() => setIsVoidModalOpen(false)}
        paymentCode={voidTargetPayment?.paymentCode || ""}
        onConfirm={handleConfirmVoid}
      />
    </div>
  );
}
