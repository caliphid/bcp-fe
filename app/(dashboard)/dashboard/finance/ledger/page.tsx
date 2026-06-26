"use client";

import { useTranslation } from "@/hooks/use-translation";
import { useAuthStore } from "@/store/auth-store";
import { PageHeader } from "@/components/ui/page-header";
import { FinanceFilterBar } from "@/features/finance/components/finance-filter-bar";
import { AccountLedgerTable } from "@/features/finance/components/account-ledger-table";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { useState } from "react";
import { useFinanceStore } from "@/features/finance/store/finance-store";
import { useAccountLedger } from "@/features/finance/hooks/use-finance-analytics";

export default function AccountLedgerPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { filters, setFilter } = useFinanceStore();
  const [showTutorial, setShowTutorial] = useState(false);

  const isAuthorized = user?.role === "OWNER" || user?.role === "ADMIN_FINANCE" || user?.role === "STAFF_INPUT";

  const { data, isLoading } = useAccountLedger({
    accountId: filters.accountId || "",
    dateFrom: filters.dateFrom || undefined,
    dateTo: filters.dateTo || undefined,
    page: filters.page,
    limit: filters.limit,
  });

  if (!isAuthorized) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl bg-white border border-slate-100 shadow-sm">
        <p className="text-slate-500">
          {t("pages.accountLedger.noAccess")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <PageHeader
          title={t("pages.accountLedger.title")}
          description={t("pages.accountLedger.subtitle")}
        />
        <Button type="button" variant="outline" size="sm" onClick={() => setShowTutorial(true)} className="bg-white hover:bg-slate-50 text-indigo-600 border-indigo-200 h-8 px-3">
          <HelpCircle className="w-4 h-4 mr-1.5" /> Panduan Buku Besar
        </Button>
      </div>

      {/* Note: In a real app we might want a specific ledger filter bar that focuses on accountId and dates instead of months, but we can reuse the FinanceFilterBar if it covers it. However, the user needs to select an account to see anything. */}
      <FinanceFilterBar />

      {!filters.accountId ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
          <div className="text-slate-500 font-medium">{t("pages.accountLedger.selectAccount")}</div>
        </div>
      ) : (
        <AccountLedgerTable 
          data={data} 
          loading={isLoading} 
          onPageChange={(page) => setFilter("page", page)} 
        />
      )}

      <Modal isOpen={showTutorial} onClose={() => setShowTutorial(false)} title="Tutorial: Buku Besar (General Ledger)" className="max-w-3xl">
        <div className="space-y-6 text-slate-700 text-sm leading-relaxed max-h-[70vh] overflow-y-auto pr-2">
          <p className="mb-2"><strong>Buku Besar (General Ledger)</strong> adalah pusat segala catatan transaksi keuangan Anda. Setiap aktivitas (pembelian, penjualan, penyesuaian stok, pengeluaran kas) otomatis dicatat di sini sesuai prinsip Akuntansi <i>Double Entry</i>.</p>
          
          <div className="space-y-4 mt-6">
            <h4 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-2">1. Konsep Debit (Dr) & Kredit (Cr)</h4>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <p className="text-xs text-slate-600 mb-2">Jangan bingung dengan istilah bank! Di akuntansi, aturannya baku:</p>
              <ul className="list-disc pl-4 text-xs text-slate-600 space-y-2">
                <li><strong>Harta/Aset (Kas, Bank, Piutang, Persediaan):</strong><br/>Bertambah = Debit (Dr) | Berkurang = Kredit (Cr)</li>
                <li><strong>Hutang & Modal (Hutang Usaha, Modal Disetor):</strong><br/>Bertambah = Kredit (Cr) | Berkurang = Debit (Dr)</li>
                <li><strong>Pendapatan (Penjualan Produk, Bunga):</strong><br/>Bertambah = Kredit (Cr) | Berkurang = Debit (Dr)</li>
                <li><strong>Beban/Biaya (HPP, Gaji, Listrik, Diskon):</strong><br/>Bertambah = Debit (Dr) | Berkurang = Kredit (Cr)</li>
              </ul>
            </div>
          </div>

          <div className="space-y-4 mt-6">
            <h4 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-2">2. Cara Membaca Saldo (Balance)</h4>
            <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
              <p className="text-xs text-emerald-800">Saldo Akhir dihitung secara *Running Balance*. Pilih salah satu akun dari Filter di atas untuk melihat mutasi historis akun tersebut.</p>
              <p className="text-xs text-emerald-700 mt-2"><strong>Contoh:</strong> Jika Anda memilih Akun "Kas BCA" (tipe Aset), lalu di kolom Debit tertulis Rp 1.000.000, artinya ada uang masuk. Saldo Kas akan bertambah Rp 1.000.000.</p>
            </div>
          </div>

          <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 mt-6">
            <span className="font-semibold text-amber-800 block mb-1">Catatan Audit</span>
            <p className="text-xs text-amber-700">Setiap baris jurnal (Journal Entry) selalu memiliki kolom Referensi (Reference) yang mengarah ke dokumen sumber (misal: PO-001, SO-002, atau kode manual jurnal). Ini sangat membantu saat rekonsiliasi audit.</p>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100 mt-4">
            <Button type="button" onClick={() => setShowTutorial(false)}>Mengerti</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
