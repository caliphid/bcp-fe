import { MonthlyCashPositionResponse } from "../../../types/finance";

interface CashPositionTableProps {
  accounts: MonthlyCashPositionResponse['accounts'];
  loading: boolean;
}

export function CashPositionTable({ accounts, loading }: CashPositionTableProps) {
  const formatMoney = (val?: string) => {
    if (!val) return "Rp 0";
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(val));
  };

  if (loading) {
    return <div className="h-48 bg-slate-100 animate-pulse rounded-2xl"></div>;
  }

  if (!accounts || accounts.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center text-slate-500">
        Tidak ada data pergerakan kas & bank untuk bulan ini.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
            <tr>
              <th className="px-6 py-4 rounded-tl-2xl">Nama Rekening</th>
              <th className="px-6 py-4 text-right">Saldo Awal</th>
              <th className="px-6 py-4 text-right">Uang Masuk</th>
              <th className="px-6 py-4 text-right">Uang Keluar</th>
              <th className="px-6 py-4 text-right">Mutasi Bersih</th>
              <th className="px-6 py-4 text-right rounded-tr-2xl">Saldo Akhir</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {accounts.map((acc) => (
              <tr key={acc.accountId} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-800">
                  {acc.accountName}
                </td>
                <td className="px-6 py-4 text-right text-slate-600">
                  {formatMoney(acc.openingBalance)}
                </td>
                <td className="px-6 py-4 text-right text-emerald-600">
                  {formatMoney(acc.moneyIn)}
                </td>
                <td className="px-6 py-4 text-right text-red-600">
                  {formatMoney(acc.moneyOut)}
                </td>
                <td className="px-6 py-4 text-right font-medium text-slate-700">
                  {formatMoney(acc.netMovement)}
                </td>
                <td className="px-6 py-4 text-right font-bold text-slate-900">
                  {formatMoney(acc.closingBalance)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
