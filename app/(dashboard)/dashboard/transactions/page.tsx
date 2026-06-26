"use client";

import { useState } from "react";
import { useAuthStore } from "../../../../store/auth-store";
import { transactionsApi } from "../../../../features/transactions/api";
import { useTransactions } from "../../../../features/transactions/hooks/use-transactions";
import { Transaction } from "../../../../types/transaction";
import { Button } from "../../../../components/ui/button";
import { PlusCircle } from "lucide-react";
import { Alert, AlertDescription } from "../../../../components/ui/alert";
import { Modal } from "../../../../components/ui/modal";
import { TransactionForm } from "../../../../components/forms/transaction-form";
import { TransactionSummaryCards } from "../../../../features/transactions/components/transaction-summary-cards";
import { TransactionDetailModal } from "../../../../features/transactions/components/transaction-detail-modal";
import { TransactionFilterBar } from "../../../../features/transactions/components/transaction-filter-bar";
import { TransactionTable } from "../../../../features/transactions/components/transaction-table";
import { TransactionVoidModal } from "../../../../features/transactions/components/transaction-void-modal";
import { extractErrorMessage } from "../../../../lib/error";
import { useTranslation } from "@/hooks/use-translation";

export default function TransactionsPage() {
  const user = useAuthStore((state) => state.user);
  const { t } = useTranslation();

  const canMutate = user?.role === "OWNER" || user?.role === "ADMIN_FINANCE";
  const isStaffInput = user?.role === "STAFF_INPUT";

  const {
    data,
    meta,
    loading,
    globalError,
    setGlobalError,
    summaryCards,
    loadingSummaries,
    businessUnits,
    accounts,
    categories,
    fetchData,
    fetchSummaries,
  } = useTransactions();

  // Modals Local State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Transaction | null>(null);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Transaction | null>(null);

  const [isVoidOpen, setIsVoidOpen] = useState(false);
  const [voidReason, setVoidReason] = useState("");

  const handleVoid = async () => {
    if (!selectedItem || !voidReason.trim()) return;
    try {
      await transactionsApi.voidTransaction(selectedItem.id, { voidReason });
      setIsVoidOpen(false);
      setVoidReason("");
      fetchData();
      fetchSummaries();
    } catch (err) {
      setGlobalError(extractErrorMessage(err));
    }
  };

  const handleOpenNew = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleView = (item: Transaction) => {
    setSelectedItem(item);
    setIsDetailOpen(true);
  };

  const handleEdit = (item: Transaction) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleOpenVoid = (item: Transaction) => {
    setSelectedItem(item);
    setVoidReason("");
    setIsVoidOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            {t("pages.transactions.title")}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {t("pages.transactions.subtitle")}
          </p>
        </div>
        <Button
          className="w-full sm:w-auto shadow-primary-500/30 shadow-md"
          onClick={handleOpenNew}
        >
          <PlusCircle className="mr-2 h-4 w-4" /> {t("pages.transactions.newTransaction")}
        </Button>
      </div>

      {globalError && (
        <Alert variant="destructive">
          <AlertDescription>{globalError}</AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <TransactionSummaryCards
        summary={summaryCards}
        isLoading={loadingSummaries}
      />

      {/* Filter Bar */}
      <TransactionFilterBar
        isStaffInput={isStaffInput}
        businessUnits={businessUnits}
        accounts={accounts}
        categories={categories}
      />

      {/* Table */}
      <TransactionTable
        data={data}
        meta={meta}
        loading={loading}
        canMutate={canMutate}
        onView={handleView}
        onEdit={handleEdit}
        onVoid={handleOpenVoid}
      />

      {/* Transaction Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingItem ? t("pages.transactions.editTransaction") : t("pages.transactions.newTransaction")}
        className="max-w-2xl"
      >
        <TransactionForm
          initialData={editingItem || undefined}
          businessUnits={businessUnits}
          accounts={accounts}
          categories={categories}
          onSuccess={() => {
            setIsFormOpen(false);
            fetchData();
            fetchSummaries();
          }}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>

      {/* View Detail Modal */}
      <TransactionDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        transaction={selectedItem}
      />

      {/* Void Modal */}
      <TransactionVoidModal
        isOpen={isVoidOpen}
        onClose={() => setIsVoidOpen(false)}
        voidReason={voidReason}
        setVoidReason={setVoidReason}
        onConfirm={handleVoid}
      />
    </div>
  );
}
