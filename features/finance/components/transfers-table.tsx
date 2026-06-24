import { AccountTransferResponse } from "../../../types/finance";
import dayjs from "dayjs";
import { ArrowRight, Ban, CheckCircle2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { TransferDetailModal } from "./transfer-detail-modal";

interface TransfersTableProps {
  data?: AccountTransferResponse[];
  loading: boolean;
  onVoidClick: (transfer: AccountTransferResponse) => void;
  isStaffInput: boolean;
}

export function TransfersTable({ data, loading, onVoidClick, isStaffInput }: TransfersTableProps) {
  const [selectedTransferId, setSelectedTransferId] = useState<string | null>(null);

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
        Tidak ada data transfer antar rekening.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
            <tr>
              <th className="px-6 py-4">Kode & Tanggal</th>
              <th className="px-6 py-4">Rekening Sumber</th>
              <th className="px-6 py-4">Rekening Tujuan</th>
              <th className="px-6 py-4 text-right">Nominal</th>
              <th className="px-6 py-4">Status & Deskripsi</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row) => (
              <tr key={row.id} className={`hover:bg-slate-50/50 transition-colors ${row.status === 'VOID' ? 'bg-slate-50/50 opacity-60' : 'bg-white'}`}>
                <td className="px-6 py-4">
                  <div className="font-bold text-indigo-600">{row.transferCode}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{dayjs(row.transferDate).format("DD MMM YYYY")}</div>
                  <div className="text-xs text-slate-400 mt-0.5">Oleh: {row.createdBy.name}</div>
                </td>
                <td className="px-6 py-4 font-medium text-slate-700">
                  {row.sourceAccount.name}
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">{row.outTransaction.transactionCode}</div>
                </td>
                <td className="px-6 py-4 font-medium text-slate-700">
                  {row.destinationAccount.name}
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">{row.inTransaction.transactionCode}</div>
                </td>
                <td className="px-6 py-4 text-right font-bold text-slate-900">
                  {formatMoney(row.amount)}
                </td>
                <td className="px-6 py-4">
                  {row.status === 'POSTED' ? (
                     <div className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mb-1 border border-emerald-200">
                     <CheckCircle2 className="h-3 w-3" /> POSTED
                   </div>
                  ) : (
                    <div className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full mb-1 border border-red-200">
                      <Ban className="h-3 w-3" /> VOID
                    </div>
                  )}
                  {row.description && (
                    <div className="text-xs text-slate-600 line-clamp-2 mt-1" title={row.description}>
                      {row.description}
                    </div>
                  )}
                  {row.status === 'VOID' && row.voidReason && (
                    <div className="text-xs text-red-500 italic mt-1">Alasan Void: {row.voidReason}</div>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedTransferId(row.id)} className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                      <Eye className="h-4 w-4 mr-1.5" />
                      Detail
                    </Button>
                    {!isStaffInput && row.status === 'POSTED' && (
                      <Button variant="outline" size="sm" onClick={() => onVoidClick(row)} className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                        Void
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <TransferDetailModal
        transferId={selectedTransferId}
        isOpen={!!selectedTransferId}
        onClose={() => setSelectedTransferId(null)}
      />
    </div>
  );
}
