"use client";

import { useState } from "react";
import { useAuthStore } from "../../../../store/auth-store";
import { Button } from "../../../../components/ui/button";
import { PlusCircle, HelpCircle } from "lucide-react";
import { Modal } from "../../../../components/ui/modal";
import { useMarketplaceSettlements } from "../../../../features/marketplace-settlements/hooks/use-marketplace-settlements";
import { MarketplaceSettlementsTable } from "../../../../features/marketplace-settlements/components/marketplace-settlements-table";
import { useRouter } from "next/navigation";
import { Input } from "../../../../components/ui/input";
import { useTranslation } from "../../../../hooks/use-translation";

export default function MarketplaceSettlementsPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const canMutate = user?.role === "OWNER" || user?.role === "ADMIN_FINANCE";

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [showTutorial, setShowTutorial] = useState(false);

  const { data, meta, isLoading } = useMarketplaceSettlements({
    page,
    limit: 10,
    search,
  });
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">{t('marketplace.settlement.title')}</h2>
            <Button type="button" variant="outline" size="sm" onClick={() => setShowTutorial(true)} className="bg-white hover:bg-slate-50 text-indigo-600 border-indigo-200 h-8 px-3">
              <HelpCircle className="w-4 h-4 mr-1.5" /> Panduan Pencairan Marketplace
            </Button>
          </div>
          <p className="mt-1 text-sm text-slate-500">{t('marketplace.settlement.subtitle')}</p>
        </div>
        {canMutate && (
          <Button
            className="w-full sm:w-auto shadow-primary-500/30 shadow-md"
            onClick={() => router.push("/dashboard/marketplace-settlements/create")}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> {t('marketplace.settlement.createTitle')}
          </Button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4">
        <Input
          placeholder={t('marketplace.settlement.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Table */}
      <MarketplaceSettlementsTable
        data={data}
        meta={meta}
        loading={isLoading}
        onPageChange={setPage}
      />

      <Modal isOpen={showTutorial} onClose={() => setShowTutorial(false)} title="Tutorial: Pencairan Marketplace (Settlements)" className="max-w-3xl">
        <div className="space-y-6 text-slate-700 text-sm leading-relaxed max-h-[70vh] overflow-y-auto pr-2">
          <p className="mb-2">Saat Anda berjualan di Shopee, Tokopedia, TikTok, atau platform lainnya, uang hasil penjualan <strong>TIDAK</strong> langsung masuk ke Rekening Bank Anda. Uang tersebut masuk dulu ke Saldo Marketplace (Piutang Marketplace). Fitur ini digunakan saat Anda me-<strong>WITHDRAW</strong> (mencairkan) uang dari saldo marketplace ke Rekening Bank Anda.</p>
          
          <div className="space-y-4 mt-6">
            <h4 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-2">Kenapa fitur ini sangat penting?</h4>
            <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
              <ul className="list-disc pl-4 text-xs text-emerald-800 space-y-2">
                <li>Banyak penjual bingung uang mereka hilang kemana. Dengan mencatat pencairan, Anda akan tahu persis berapa Saldo Mengendap di masing-masing platform.</li>
                <li>Pencairan marketplace sering kali dikenakan biaya transfer atau pemotongan lain. Di sini Anda bisa mencatat Gross Amount (Nilai Kotor) dan Net Amount (Nilai Bersih) yang masuk ke Bank.</li>
                <li>Selisih antara Gross dan Net otomatis dijurnal sebagai <strong>Biaya Layanan/Admin Marketplace</strong> ke Buku Besar.</li>
              </ul>
            </div>
          </div>

          <div className="space-y-4 mt-6">
            <h4 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-2">Cara Kerja</h4>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <ol className="list-decimal pl-4 text-xs text-slate-600 space-y-2">
                <li>Klik tombol <strong>Create New Settlement</strong> saat Anda menekan tombol Tarik Dana di Seller Center.</li>
                <li>Pilih <strong>Akun Marketplace</strong> (Contoh: Shopee - Toko A).</li>
                <li>Pilih <strong>Akun Tujuan</strong> (Contoh: Bank BCA).</li>
                <li>Masukkan nominal yang ditarik (Gross) dan nominal yang benar-benar masuk ke BCA Anda (Net).</li>
                <li>Sistem otomatis membuat jurnal: Debit (Bank BCA + Biaya Admin) dan Kredit (Piutang Shopee).</li>
              </ol>
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
