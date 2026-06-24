import { BalanceReconciliationResponse } from "../../../types/finance";
import { CheckCircle2, AlertTriangle, AlertCircle, Eye } from "lucide-react";
import { useState } from "react";
import { BalanceReconciliationDetailModal } from "./balance-reconciliation-detail-modal";
import { Button } from "@/components/ui/button";

interface BalanceReconciliationTableProps {
  data?: BalanceReconciliationResponse[];
  loading: boolean;
}

export function BalanceReconciliationTable({ data, loading }: BalanceReconciliationTableProps) {
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  const formatMoney = (val?: string) => {
    if (!val) return "Rp 0";
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(val));
  };

  if (loading) {
    return <div className="h-64 bg-slate-100 animate-pulse rounded-2xl border border-slate-100"></div>;
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center text-slate-500">
        Tidak ada data rekening untuk direkonsiliasi.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Account Balance Reconciliation</h3>
          <p className="text-sm text-slate-500 mt-1">
            Mendeteksi selisih antara saldo tersimpan dan saldo terhitung dari history mutasi.
          </p>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
            <tr>
              <th className="px-6 py-4">Nama Rekening</th>
              <th className="px-6 py-4 text-right">Saldo Awal</th>
              <th className="px-6 py-4 text-right">Stored Balance</th>
              <th className="px-6 py-4 text-right">Calculated Balance</th>
              <th className="px-6 py-4 text-right">Selisih</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((acc) => (
              <tr key={acc.accountId} className="hover:bg-slate-50/50 transition-colors bg-white">
                <td className="px-6 py-4 font-medium text-slate-800">
                  {acc.accountName}
                </td>
                <td className="px-6 py-4 text-right text-slate-600">
                  {formatMoney(acc.initialBalance)}
                </td>
                <td className="px-6 py-4 text-right text-slate-800 font-medium">
                  {formatMoney(acc.storedCurrentBalance)}
                </td>
                <td className="px-6 py-4 text-right text-slate-800 font-medium">
                  {formatMoney(acc.calculatedBalance)}
                </td>
                <td className={`px-6 py-4 text-right font-bold ${Number(acc.difference) !== 0 ? 'text-red-600' : 'text-slate-400'}`}>
                  {formatMoney(acc.difference)}
                </td>
                <td className="px-6 py-4 flex justify-center">
                  {acc.isBalanced ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Balanced
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-xs font-semibold border border-red-200">
                      <AlertCircle className="h-3.5 w-3.5" />
                      Discrepancy
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedAccountId(acc.accountId)} className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                    <Eye className="h-4 w-4 mr-1.5" />
                    Detail
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <BalanceReconciliationDetailModal 
        accountId={selectedAccountId}
        isOpen={!!selectedAccountId}
        onClose={() => setSelectedAccountId(null)}
      />
    </div>
  );
}
