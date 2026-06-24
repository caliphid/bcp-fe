import { MonthlyOverviewResponse } from "../../../types/finance";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CashPositionSummary({ data, loading }: { data?: MonthlyOverviewResponse, loading: boolean }) {
  const formatMoney = (val?: string) => {
    if (!val) return "Rp 0";
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(val));
  };

  if (loading) {
    return <div className="h-64 bg-slate-100 animate-pulse rounded-2xl"></div>;
  }

  const c = data?.cashPosition;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <h3 className="text-lg font-bold text-slate-800 mb-4">Posisi Kas & Bank</h3>
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Saldo Awal Bulan</span>
          <span className="font-semibold text-slate-700">{formatMoney(c?.openingBalance)}</span>
        </div>
        
        <div className="flex justify-between text-sm text-emerald-600 mt-2">
          <span>Uang Masuk (In)</span>
          <span>+ {formatMoney(c?.moneyIn)}</span>
        </div>
        <div className="flex justify-between text-sm text-red-600">
          <span>Uang Keluar (Out)</span>
          <span>- {formatMoney(c?.moneyOut)}</span>
        </div>
        
        <div className="h-px bg-slate-100 my-2"></div>
        <div className="flex justify-between text-sm font-bold">
          <span className="text-slate-700">Net Cashflow</span>
          <span className="text-amber-600">{formatMoney(c?.netCashflow)}</span>
        </div>

        <div className="h-px bg-slate-100 my-2"></div>
        <div className="flex justify-between items-center">
          <span className="text-base font-bold text-slate-800">Saldo Akhir Bulan</span>
          <div className="text-lg font-bold text-blue-600">{formatMoney(c?.closingBalance)}</div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
        <Link href="/dashboard/finance/cash-position" className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-700">
          Lihat Detail Posisi Kas <ArrowRight className="h-4 w-4 ml-1" />
        </Link>
      </div>
    </div>
  );
}
