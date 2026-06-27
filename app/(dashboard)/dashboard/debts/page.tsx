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
import { Plus, HelpCircle } from "lucide-react";
import { Modal } from "../../../../components/ui/modal";
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
  const [showTutorial, setShowTutorial] = useState(false);

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">{t("pages.debts.title")}</h2>
            <Button type="button" variant="outline" size="sm" onClick={() => setShowTutorial(true)} className="bg-white hover:bg-slate-50 text-indigo-600 border-indigo-200 h-8 px-3">
              <HelpCircle className="w-4 h-4 mr-1.5" /> Panduan Hutang & Piutang
            </Button>
          </div>
          <p className="mt-1 text-sm text-slate-500">{t("pages.debts.subtitle")}</p>
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

      <Modal isOpen={showTutorial} onClose={() => setShowTutorial(false)} title="Tutorial: Hutang & Piutang Non-Trade (Debts)" className="max-w-3xl">
        <div className="space-y-6 text-slate-700 text-sm leading-relaxed max-h-[70vh] overflow-y-auto pr-2">
          <p className="mb-2">Halaman ini digunakan untuk mencatat <strong>Hutang atau Piutang Non-Trade</strong>, yaitu pinjaman uang di luar siklus utama Jual/Beli barang. Contoh: Kasbon karyawan, Pinjaman modal dari Bank, Pinjaman pemegang saham ke perusahaan.</p>
          
          <div className="space-y-4 mt-6">
            <h4 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-2">1. Jenis Pinjaman (Debt Type)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                <span className="font-semibold text-blue-800 block mb-1">RECEIVABLE (Piutang)</span>
                <p className="text-xs text-blue-700">Perusahaan yang meminjamkan uang ke pihak lain. <strong>Contoh:</strong> Karyawan A pinjam kasbon Rp 1 juta. Uang keluar dari perusahaan, dicatat sebagai Piutang Karyawan (Aset).</p>
              </div>
              
              <div className="bg-orange-50/50 p-3 rounded-lg border border-orange-100">
                <span className="font-semibold text-orange-800 block mb-1">PAYABLE (Hutang)</span>
                <p className="text-xs text-orange-700">Perusahaan yang meminjam uang dari pihak luar. <strong>Contoh:</strong> Perusahaan mendapat suntikan kredit KUR Rp 100 juta. Uang masuk ke perusahaan, dicatat sebagai Hutang Bank (Kewajiban).</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 mt-6">
            <h4 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-2">2. Aktivasi (Approval) & Pembayaran</h4>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <ul className="list-disc pl-4 text-xs text-slate-600 space-y-2">
                <li><strong>Draft ➔ Active:</strong> Hanya pengguna dengan role OWNER yang bisa mengaktifkan (Approve) pinjaman ini. Setelah aktif, uang akan otomatis keluar/masuk dari Saldo Bank perusahaan.</li>
                <li><strong>Payments:</strong> Untuk membayar cicilan/pelunasan pinjaman, klik baris hutang tersebut, lalu pilih tab <strong>Payments</strong> di panel detail, lalu klik tombol "Add Payment".</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100 mt-4">
            <Button type="button" onClick={() => setShowTutorial(false)}>Mengerti</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
