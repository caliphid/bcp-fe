import { Modal } from "@/components/ui/modal";
import { financeApi } from "../api";
import useSWR from "swr";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface BalanceReconciliationDetailModalProps {
  accountId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BalanceReconciliationDetailModal({ accountId, isOpen, onClose }: BalanceReconciliationDetailModalProps) {
  
  const { data, error, isLoading } = useSWR(
    accountId && isOpen ? `/finance/balance-reconciliation/${accountId}` : null,
    () => financeApi.getBalanceReconciliationDetail(accountId!)
  );

  const formatMoney = (val?: string) => {
    if (!val) return "Rp 0";
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(val));
  };

  const detail = data?.data;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detail Rekonsiliasi Saldo">
      {isLoading ? (
        <div className="p-8 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : error ? (
        <div className="p-6 text-center text-red-500">
          Gagal memuat detail rekonsiliasi rekening.
        </div>
      ) : detail ? (
        <div className="space-y-6">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Rekening</h4>
            <div className="text-lg font-bold text-slate-800">{detail.accountName}</div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-600">Saldo Awal (Initial Balance)</span>
              <span className="font-medium text-slate-700">{formatMoney(detail.initialBalance)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-600">Saldo Tercatat Saat Ini (Stored Balance)</span>
              <span className="font-bold text-slate-800">{formatMoney(detail.storedCurrentBalance)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100 bg-slate-50 -mx-4 px-4">
              <span className="text-slate-600">Saldo Terhitung (Calculated Balance)</span>
              <span className="font-bold text-indigo-700">{formatMoney(detail.calculatedBalance)}</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-slate-700 font-bold">Selisih (Difference)</span>
              <span className={`text-lg font-bold ${Number(detail.difference) !== 0 ? 'text-red-600' : 'text-slate-400'}`}>
                {formatMoney(detail.difference)}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            {detail.isBalanced ? (
              <div className="flex items-center gap-3 bg-emerald-50 text-emerald-800 p-4 rounded-xl border border-emerald-200">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm">Status: Balanced</h4>
                  <p className="text-xs text-emerald-700 mt-0.5">Saldo rekening ini valid dan sinkron dengan riwayat mutasi.</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 bg-red-50 text-red-800 p-4 rounded-xl border border-red-200">
                <AlertCircle className="h-6 w-6 text-red-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm">Status: Discrepancy</h4>
                  <p className="text-xs text-red-700 mt-0.5">Terdapat selisih antara saldo tercatat dan riwayat mutasi. Hal ini perlu diinvestigasi lebih lanjut.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-6 text-center text-slate-500">Data tidak ditemukan.</div>
      )}
    </Modal>
  );
}
