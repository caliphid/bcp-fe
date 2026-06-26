"use client";

import { useState } from "react";
import { useAuthStore } from "../../../../store/auth-store";
import { transactionsApi } from "../../../../features/transactions/api";
import { useTransactions } from "../../../../features/transactions/hooks/use-transactions";
import { Transaction } from "../../../../types/transaction";
import { Button } from "../../../../components/ui/button";
import { PlusCircle, HelpCircle } from "lucide-react";
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
  const [showTutorial, setShowTutorial] = useState(false);
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
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              {t("pages.transactions.title")}
            </h2>
            <Button type="button" variant="outline" size="sm" onClick={() => setShowTutorial(true)} className="bg-white hover:bg-slate-50 text-indigo-600 border-indigo-200 h-8 px-3">
              <HelpCircle className="w-4 h-4 mr-1.5" /> Panduan Jurnal Transaksi
            </Button>
          </div>
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

      <Modal isOpen={showTutorial} onClose={() => setShowTutorial(false)} title="Tutorial: Manual Journal / Cash Bank Transactions" className="max-w-3xl">
        <div className="space-y-6 text-slate-700 text-sm leading-relaxed max-h-[70vh] overflow-y-auto pr-2">
          <p className="mb-2">Halaman ini adalah tempat Anda mencatat transaksi penerimaan atau pengeluaran kas (uang) yang <strong>TIDAK BERASAL</strong> dari modul operasional standar (seperti Sales Order, Purchase Order, dsb). Misalnya: Bayar gaji karyawan, Beli ATK, Bayar Listrik, Injeksi Modal, dll.</p>
          
          <div className="space-y-4 mt-6">
            <h4 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-2">1. Konsep Cash IN vs Cash OUT</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
                <span className="font-semibold text-emerald-800 block mb-1">CASH IN (Uang Masuk)</span>
                <p className="text-xs text-emerald-700">Pilih tipe ini saat saldo rekening Bank/Kas Anda bertambah. Anda wajib memilih <strong>Kategori (COA) tipe IN</strong>. Contoh: Penerimaan Dana Investor, Setoran Modal, Bunga Bank.</p>
              </div>
              
              <div className="bg-rose-50/50 p-3 rounded-lg border border-rose-100">
                <span className="font-semibold text-rose-800 block mb-1">CASH OUT (Uang Keluar)</span>
                <p className="text-xs text-rose-700">Pilih tipe ini saat saldo rekening Anda berkurang. Anda wajib memilih <strong>Kategori (COA) tipe OUT</strong>. Contoh: Bayar Gaji, Bayar Listrik, Bayar Iklan, Biaya Transport.</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 mt-6">
            <h4 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-2">2. Void (Batal) Transaksi</h4>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <p className="text-xs text-slate-600 mb-2">Untuk mencegah kecurangan atau *fraud*, transaksi tunai di sini <strong>TIDAK BISA DIHAPUS</strong> (*Delete*). Jika Anda salah input, Anda hanya bisa men-<strong>VOID</strong> (membatalkan) transaksi tersebut.</p>
              <ul className="list-disc pl-4 text-xs text-slate-600 space-y-1">
                <li>Sistem akan mencoret (*strikethrough*) baris transaksi tersebut.</li>
                <li>Saldo Bank yang sebelumnya bertambah/berkurang akan otomatis dikembalikan (di-*reversal*) oleh sistem.</li>
                <li>Anda wajib mengisi <strong>Alasan Void</strong>, agar jejak audit tetap terpelihara.</li>
              </ul>
            </div>
          </div>

          <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 mt-6">
            <span className="font-semibold text-amber-800 block mb-1">Catatan Keamanan (Security)</span>
            <p className="text-xs text-amber-700">Setiap Jurnal Manual yang Anda buat di halaman ini akan otomatis diposting ke Buku Besar (General Ledger). Mohon pastikan memilih akun Kas/Bank (Source Account) dan Kategori Akun Tujuan (Destination Category) dengan teliti untuk menghindari selisih neraca.</p>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100 mt-4">
            <Button type="button" onClick={() => setShowTutorial(false)}>Mengerti</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
