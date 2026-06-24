import { Modal } from "@/components/ui/modal";
import { financeApi } from "../api";
import useSWR from "swr";
import { CheckCircle2, Ban, ArrowRight, Clock } from "lucide-react";
import dayjs from "dayjs";

interface TransferDetailModalProps {
  transferId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TransferDetailModal({ transferId, isOpen, onClose }: TransferDetailModalProps) {
  
  const { data, error, isLoading } = useSWR(
    transferId && isOpen ? `/account-transfers/${transferId}` : null,
    () => financeApi.getAccountTransferById(transferId!)
  );

  const formatMoney = (val?: string) => {
    if (!val) return "Rp 0";
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(val));
  };

  const detail = data?.data;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detail Transfer Antar Rekening">
      {isLoading ? (
        <div className="p-8 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : error ? (
        <div className="p-6 text-center text-red-500">
          Gagal memuat detail transfer.
        </div>
      ) : detail ? (
        <div className="space-y-6">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-center">
            <div>
              <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Kode Transfer</h4>
              <div className="text-lg font-bold text-indigo-700">{detail.transferCode}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-500 mb-1">Status</div>
              {detail.status === 'POSTED' ? (
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
                  <CheckCircle2 className="h-4 w-4" /> POSTED
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-100 px-3 py-1 rounded-full border border-red-200">
                  <Ban className="h-4 w-4" /> VOID
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Rekening Sumber (Keluar)</h4>
              <div className="font-bold text-slate-800 text-base">{detail.sourceAccount.name}</div>
              <div className="text-xs text-slate-500 font-mono mt-1">Ref: {detail.outTransaction.transactionCode}</div>
              <div className="absolute top-1/2 -right-3 transform -translate-y-1/2 bg-white rounded-full p-1 border border-slate-200 shadow-sm z-10">
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Rekening Tujuan (Masuk)</h4>
              <div className="font-bold text-slate-800 text-base">{detail.destinationAccount.name}</div>
              <div className="text-xs text-slate-500 font-mono mt-1">Ref: {detail.inTransaction.transactionCode}</div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Nominal Transfer</span>
              <span className="text-xl font-bold text-slate-900">{formatMoney(detail.amount)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Tanggal Transfer</span>
              <span className="font-medium text-slate-800">{dayjs(detail.transferDate).format("DD MMMM YYYY")}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Deskripsi</span>
              <span className="font-medium text-slate-800 text-right max-w-[60%]">{detail.description || "-"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Catatan Internal</span>
              <span className="font-medium text-slate-800 text-right max-w-[60%]">{detail.notes || "-"}</span>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-slate-100 bg-slate-50 p-4 rounded-xl text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span>Dibuat oleh <strong>{detail.createdBy.name}</strong> pada {dayjs(detail.createdAt).format("DD MMM YYYY HH:mm")}</span>
            </div>
            {detail.status === 'VOID' && detail.voidedBy && (
              <div className="flex items-start gap-2 text-red-600 mt-2">
                <Ban className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <div>
                  <span>Di-void oleh <strong>{detail.voidedBy.name}</strong> pada {dayjs(detail.voidedAt).format("DD MMM YYYY HH:mm")}</span>
                  {detail.voidReason && (
                    <div className="mt-1 italic">&quot;Alasan: {detail.voidReason}&quot;</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-6 text-center text-slate-500">Data transfer tidak ditemukan.</div>
      )}
    </Modal>
  );
}
