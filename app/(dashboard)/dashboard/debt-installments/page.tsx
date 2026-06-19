"use client";

import { useState } from "react";
import { useInstallments } from "../../../../features/debt-installments/hooks/use-installments";
import { useInstallmentSummary } from "../../../../features/debt-installments/hooks/use-installment-summary";
import { InstallmentFilterBar } from "../../../../features/debt-installments/components/installment-filter-bar";
import { InstallmentTable } from "../../../../features/debt-installments/components/installment-table";
import { InstallmentSummaryCards } from "../../../../features/debt-installments/components/installment-summary-cards";
import { OverdueInstallments } from "../../../../features/debt-installments/components/overdue-installments";
import { UpcomingInstallments } from "../../../../features/debt-installments/components/upcoming-installments";
import { InstallmentDetailDrawer } from "../../../../features/debt-installments/components/installment-detail-drawer";
import { GenerateScheduleModal } from "../../../../features/debt-installments/components/generate-schedule-modal";
import { InstallmentFormModal } from "../../../../features/debt-installments/components/installment-form-modal";
import { VoidInstallmentModal } from "../../../../features/debt-installments/components/void-installment-modal";
import { InstallmentPaymentFormModal } from "../../../../features/debt-installments/components/installment-payment-form-modal";
import { VoidInstallmentPaymentModal } from "../../../../features/debt-installments/components/void-installment-payment-modal";
import { useAuthStore } from "../../../../store/auth-store";
import { Plus, CalendarDays } from "lucide-react";
import { useInstallmentDetail } from "../../../../features/debt-installments/hooks/use-installment-detail";
import { useInstallmentPayments } from "../../../../features/debt-installments/hooks/use-installment-payments";
import { debtInstallmentsApi } from "../../../../features/debt-installments/api";
import { DebtInstallmentItem } from "../../../../types/installment";
import { useOverdueInstallments } from "../../../../features/debt-installments/hooks/use-overdue-installments";
import { useUpcomingInstallments } from "../../../../features/debt-installments/hooks/use-upcoming-installments";

export default function DebtInstallmentPage() {
  const user = useAuthStore((s) => s.user);
  const canEdit = user?.role !== "STAFF_INPUT";

  const { data, meta, loading, refetch } = useInstallments();
  const { data: summary, loading: summaryLoading, refetch: refetchSummary } = useInstallmentSummary();
  const { refetch: refetchOverdue } = useOverdueInstallments();
  const { refetch: refetchUpcoming } = useUpcomingInstallments();

  const [detailId, setDetailId] = useState<string | null>(null);
  const { data: detailData, loading: detailLoading, refetch: refetchDetail } = useInstallmentDetail(detailId);
  const { refetch: refetchPayments } = useInstallmentPayments(detailId);

  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DebtInstallmentItem | null>(null);
  
  const [isVoidOpen, setIsVoidOpen] = useState(false);
  const [voidTarget, setVoidTarget] = useState<DebtInstallmentItem | null>(null);

  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
  const [paymentTarget, setPaymentTarget] = useState<DebtInstallmentItem | null>(null);

  const [isVoidPaymentOpen, setIsVoidPaymentOpen] = useState(false);
  const [voidPaymentCode, setVoidPaymentCode] = useState("");

  const refreshAll = () => {
    refetch();
    refetchSummary();
    refetchOverdue();
    refetchUpcoming();
    if (detailId) {
      refetchDetail();
      refetchPayments();
    }
  };

  const handleOpenDetail = (item: DebtInstallmentItem) => {
    setDetailId(item.id);
  };

  const handleOpenEdit = (item: DebtInstallmentItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleOpenVoid = (item: DebtInstallmentItem) => {
    setVoidTarget(item);
    setIsVoidOpen(true);
  };

  const handleOpenPayment = (item: DebtInstallmentItem) => {
    setPaymentTarget(item);
    setIsPaymentFormOpen(true);
  };

  const handleOpenVoidPayment = (paymentCode: string) => {
    setVoidPaymentCode(paymentCode);
    setIsVoidPaymentOpen(true);
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Cicilan Hutang</h1>
          <p className="text-slate-500 mt-1">Kelola jadwal dan transaksi pembayaran hutang</p>
        </div>
        
        {canEdit && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsGenerateOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-indigo-200 text-indigo-600 rounded-xl hover:bg-indigo-50 transition-colors font-medium text-sm"
            >
              <CalendarDays className="h-4 w-4" />
              Buat Jadwal
            </button>
            <button
              onClick={() => {
                setEditingItem(null);
                setIsFormOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-colors font-medium text-sm"
            >
              <Plus className="h-4 w-4" />
              Tambah Manual
            </button>
          </div>
        )}
      </div>

      <InstallmentSummaryCards data={summary} loading={summaryLoading} />

      <div className="flex flex-col xl:flex-row gap-6">
        <div className="flex-1 min-w-0">
          <InstallmentFilterBar />
          <InstallmentTable
            data={data}
            meta={meta}
            loading={loading}
            canEdit={canEdit}
            onView={handleOpenDetail}
            onEdit={handleOpenEdit}
          />
        </div>
        
        <div className="xl:w-[350px] shrink-0 space-y-6">
          <OverdueInstallments />
          <UpcomingInstallments />
        </div>
      </div>

      {/* Modals & Drawers */}
      <InstallmentDetailDrawer
        isOpen={!!detailId}
        onClose={() => setDetailId(null)}
        installment={detailData}
        loading={detailLoading}
        onAddPayment={() => handleOpenPayment(detailData as unknown as DebtInstallmentItem)}
        onVoidPayment={handleOpenVoidPayment}
      />

      {canEdit && (
        <>
          <GenerateScheduleModal
            isOpen={isGenerateOpen}
            onClose={() => setIsGenerateOpen(false)}
            onSubmit={async (debtId, payload) => {
              await debtInstallmentsApi.generateSchedule(debtId, payload);
              refreshAll();
            }}
          />

          <InstallmentFormModal
            isOpen={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            initialData={editingItem}
            onSubmit={async (payload, isUpdate, debtId) => {
              if (isUpdate && editingItem) {
                await debtInstallmentsApi.updateInstallment(editingItem.id, payload);
              } else if (debtId) {
                await debtInstallmentsApi.createInstallment(debtId, payload);
              }
              refreshAll();
            }}
          />

          <VoidInstallmentModal
            isOpen={isVoidOpen}
            onClose={() => setIsVoidOpen(false)}
            installmentCode={voidTarget?.installmentCode || ""}
            onConfirm={async (reason) => {
              if (voidTarget) {
                await debtInstallmentsApi.voidInstallment(voidTarget.id, { voidReason: reason });
                refreshAll();
              }
            }}
          />

          <InstallmentPaymentFormModal
            isOpen={isPaymentFormOpen}
            onClose={() => setIsPaymentFormOpen(false)}
            installment={paymentTarget}
            onSubmit={async (payload) => {
              if (paymentTarget) {
                await debtInstallmentsApi.createPayment(paymentTarget.id, payload);
                refreshAll();
              }
            }}
          />

          <VoidInstallmentPaymentModal
            isOpen={isVoidPaymentOpen}
            onClose={() => setIsVoidPaymentOpen(false)}
            paymentCode={voidPaymentCode}
            onConfirm={async (reason) => {
              // Note: paymentId vs paymentCode. The API uses paymentId, but we get it from the detail which we might need to find.
              // We'll map the paymentCode back to id from the detailData's payments.
              const paymentId = detailData?.payments.find(p => p.paymentCode === voidPaymentCode)?.id;
              if (paymentId) {
                await debtInstallmentsApi.voidPayment(paymentId, { voidReason: reason });
                refreshAll();
              }
            }}
          />
        </>
      )}
    </div>
  );
}
