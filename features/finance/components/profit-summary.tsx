import { MonthlyOverviewResponse } from "../../../types/finance";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function ProfitSummary({ data, loading }: { data?: MonthlyOverviewResponse, loading: boolean }) {
  const formatMoney = (val?: string) => {
    if (!val) return "Rp 0";
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(val));
  };

  if (loading) {
    return <div className="h-64 bg-slate-100 animate-pulse rounded-2xl"></div>;
  }

  const p = data?.profitability;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <h3 className="text-lg font-bold text-slate-800 mb-4">Ringkasan Profitabilitas</h3>
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Total Pendapatan (Revenue)</span>
          <span className="font-semibold text-slate-700">{formatMoney(p?.revenue)}</span>
        </div>
        <div className="flex justify-between text-sm text-red-600">
          <span>Harga Pokok Penjualan (HPP)</span>
          <span>- {formatMoney(p?.costOfGoodsSold)}</span>
        </div>
        <div className="h-px bg-slate-100 my-2"></div>
        <div className="flex justify-between text-sm font-bold">
          <span className="text-slate-700">Laba Kotor</span>
          <span className="text-slate-800">{formatMoney(p?.grossProfit)}</span>
        </div>
        
        <div className="flex justify-between text-sm text-red-600 mt-2">
          <span>Beban Operasional</span>
          <span>- {formatMoney(p?.operatingExpense)}</span>
        </div>
        <div className="flex justify-between text-sm text-emerald-600">
          <span>Pendapatan Lainnya</span>
          <span>+ {formatMoney(p?.otherIncome)}</span>
        </div>
        <div className="flex justify-between text-sm text-red-600">
          <span>Beban Lainnya</span>
          <span>- {formatMoney(p?.otherExpense)}</span>
        </div>

        <div className="h-px bg-slate-100 my-2"></div>
        <div className="flex justify-between items-center">
          <span className="text-base font-bold text-slate-800">Laba Bersih</span>
          <div className="text-right">
            <div className="text-lg font-bold text-emerald-600">{formatMoney(p?.netProfit)}</div>
            {p?.profitMargin !== null && p?.profitMargin !== undefined && (
              <div className="text-xs text-slate-500 font-medium">Margin: {p.profitMargin}%</div>
            )}
          </div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
        <Link href="/dashboard/finance/profitability" className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-700">
          Lihat Detail Laba/Rugi <ArrowRight className="h-4 w-4 ml-1" />
        </Link>
      </div>
    </div>
  );
}
