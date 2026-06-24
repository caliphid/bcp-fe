import { ProfitVsCashflowResponse } from "../../../types/finance";
import { AlertCircle } from "lucide-react";

interface ProfitVsCashflowPanelProps {
  data?: ProfitVsCashflowResponse;
  loading: boolean;
}

export function ProfitVsCashflowPanel({ data, loading }: ProfitVsCashflowPanelProps) {
  const formatMoney = (val?: string) => {
    if (!val) return "Rp 0";
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(val));
  };

  if (loading) {
    return <div className="h-64 bg-slate-100 animate-pulse rounded-2xl border border-slate-100"></div>;
  }

  if (!data) return null;

  const adj = data.adjustments;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100">
        <h3 className="text-lg font-bold text-slate-800">Profit vs Cashflow Reconciliation</h3>
        <p className="text-sm text-slate-500 mt-1">
          Penjelasan perbedaan antara Laba Bersih dan Net Cashflow berdasarkan aktivitas selain operasional tunai.
        </p>
      </div>

      <div className="p-5 space-y-3 bg-slate-50">
        <div className="flex justify-between items-center pb-2 border-b border-slate-200">
          <span className="text-base font-bold text-slate-700">Laba Bersih (Net Profit)</span>
          <span className="text-lg font-bold text-emerald-600">{formatMoney(data.netProfit)}</span>
        </div>

        <div className="pt-2">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Penyesuaian (Adjustments)</h4>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Aktivitas Pendanaan (Financing)</span>
              <span className="font-medium text-slate-700">{formatMoney(adj.financing)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Aktivitas Investasi (Investing)</span>
              <span className="font-medium text-slate-700">{formatMoney(adj.investing)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Setoran/Tarikan Modal (Equity)</span>
              <span className="font-medium text-slate-700">{formatMoney(adj.equity)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Transfer Antar Rekening (In/Out)</span>
              <span className="font-medium text-slate-700">{formatMoney(adj.transfer)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Transaksi Non-Tunai (Non-Cash)</span>
              <span className="font-medium text-slate-700">{formatMoney(adj.nonCash)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Transaksi Belum Terpetakan (Unmapped)</span>
              <span className="font-medium text-slate-700">{formatMoney(adj.unmapped)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Mutasi Piutang Pelanggan</span>
              <span className="font-medium text-slate-700">{formatMoney(adj.receivables)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Mutasi Cashbon Crew</span>
              <span className="font-medium text-slate-700">{formatMoney(adj.cashbon)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Pencairan / Cicilan Hutang Pribadi</span>
              <span className="font-medium text-slate-700">{formatMoney(adj.debt)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Lainnya</span>
              <span className="font-medium text-slate-700">{formatMoney(adj.other)}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-3 mt-3 border-t border-slate-200">
          <span className="text-base font-bold text-slate-700">Net Cashflow</span>
          <span className="text-lg font-bold text-amber-600">{formatMoney(data.netCashflow)}</span>
        </div>

        {Number(data.unexplainedDifference) !== 0 && (
          <div className="mt-4 flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 p-4">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-red-800">Unexplained Difference: {formatMoney(data.unexplainedDifference)}</h4>
              <p className="text-xs text-red-700 mt-1">
                Terdapat selisih yang tidak dapat dijelaskan oleh sistem. Hal ini bisa terjadi karena adanya transaksi yang di-edit secara manual di luar workflow standar, atau transaksi yang belum dipetakan.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
