import { AccountLedgerResponse } from "../../../types/finance";
import dayjs from "dayjs";
import { ArrowDownLeft, ArrowUpRight, Ban } from "lucide-react";

interface AccountLedgerTableProps {
  data?: AccountLedgerResponse;
  loading: boolean;
}

export function AccountLedgerTable({ data, loading }: AccountLedgerTableProps) {
  const formatMoney = (val?: string) => {
    if (!val) return "Rp 0";
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(val));
  };

  if (loading) {
    return <div className="h-64 bg-slate-100 animate-pulse rounded-2xl border border-slate-100"></div>;
  }

  if (!data || !data.rows || data.rows.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center text-slate-500">
        Tidak ada transaksi untuk rekening ini pada periode yang dipilih.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="grid grid-cols-2 bg-slate-50 border-b border-slate-100">
        <div className="p-4 border-r border-slate-100">
          <p className="text-xs text-slate-500 font-semibold uppercase">Saldo Awal</p>
          <p className="text-xl font-bold text-slate-800 mt-1">{formatMoney(data.openingBalance)}</p>
        </div>
        <div className="p-4">
          <p className="text-xs text-slate-500 font-semibold uppercase">Saldo Akhir</p>
          <p className="text-xl font-bold text-slate-800 mt-1">{formatMoney(data.closingBalance)}</p>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
            <tr>
              <th className="px-6 py-4">Tanggal</th>
              <th className="px-6 py-4">Transaksi</th>
              <th className="px-6 py-4">Kategori & Modul</th>
              <th className="px-6 py-4">Tipe</th>
              <th className="px-6 py-4 text-right">Nominal</th>
              <th className="px-6 py-4 text-right">Running Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.rows.map((row, i) => (
              <tr key={i} className={`hover:bg-slate-50/50 transition-colors ${row.status === 'VOID' ? 'bg-slate-50/50 opacity-60' : 'bg-white'}`}>
                <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                  {dayjs(row.transactionDate).format("DD MMM YYYY")}
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-800">{row.transactionCode}</div>
                  {row.description && (
                    <div className="text-xs text-slate-500 mt-0.5 line-clamp-1" title={row.description}>
                      {row.description}
                    </div>
                  )}
                  {row.status === 'VOID' && (
                    <div className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded mt-1">
                      <Ban className="h-3 w-3" /> VOID
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-700">{row.category}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{row.sourceModule}</div>
                </td>
                <td className="px-6 py-4">
                  {row.type === 'IN' ? (
                    <div className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full text-xs font-semibold">
                      <ArrowDownLeft className="h-3.5 w-3.5" /> IN
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs font-semibold">
                      <ArrowUpRight className="h-3.5 w-3.5" /> OUT
                    </div>
                  )}
                </td>
                <td className={`px-6 py-4 text-right font-bold ${row.type === 'IN' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {row.type === 'IN' ? '+' : '-'}{formatMoney(row.amount)}
                </td>
                <td className="px-6 py-4 text-right font-bold text-slate-900">
                  {formatMoney(row.runningBalance)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
