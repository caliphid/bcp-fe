import { AlertTriangle, AlertCircle } from "lucide-react";
import Link from "next/link";

interface FinanceWarningsPanelProps {
  unmappedTransactionCount: number;
  unbalancedAccountCount: number;
}

export function FinanceWarningsPanel({
  unmappedTransactionCount,
  unbalancedAccountCount,
}: FinanceWarningsPanelProps) {
  if (unmappedTransactionCount === 0 && unbalancedAccountCount === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {unmappedTransactionCount > 0 && (
        <div className="flex items-center gap-3 rounded-xl bg-orange-50 border border-orange-200 p-4 shadow-sm">
          <div className="flex-shrink-0 bg-orange-100 p-2 rounded-full">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-orange-800">
              Transaksi Belum Terpetakan
            </h3>
            <p className="text-sm text-orange-700 mt-0.5">
              Terdapat <strong>{unmappedTransactionCount}</strong> transaksi masuk/keluar yang kategorinya belum disesuaikan. Laporan profitabilitas mungkin tidak akurat.
            </p>
          </div>
          <Link
            href="/dashboard/transactions?status=POSTED"
            className="text-sm font-semibold text-orange-700 hover:text-orange-800 bg-orange-100 hover:bg-orange-200 px-4 py-2 rounded-lg transition-colors"
          >
            Cek Transaksi
          </Link>
        </div>
      )}

      {unbalancedAccountCount > 0 && (
        <div className="flex items-center gap-3 rounded-xl bg-red-50 border border-red-200 p-4 shadow-sm">
          <div className="flex-shrink-0 bg-red-100 p-2 rounded-full">
            <AlertCircle className="h-5 w-5 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-800">
              Selisih Saldo Rekening
            </h3>
            <p className="text-sm text-red-700 mt-0.5">
              Terdapat <strong>{unbalancedAccountCount}</strong> rekening dengan saldo yang tidak sinkron antara tercatat dan terhitung.
            </p>
          </div>
          <Link
            href="/dashboard/finance/reconciliation"
            className="text-sm font-semibold text-red-700 hover:text-red-800 bg-red-100 hover:bg-red-200 px-4 py-2 rounded-lg transition-colors"
          >
            Lihat Rekonsiliasi
          </Link>
        </div>
      )}
    </div>
  );
}
