import { FinancialPeriodResponse } from "../../../types/finance";
import dayjs from "dayjs";
import { Lock, LockOpen, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";


interface PeriodsTableProps {
  data?: FinancialPeriodResponse[];
  loading: boolean;
  onActionClick: (action: 'lock' | 'close' | 'reopen', period: FinancialPeriodResponse) => void;
  isOwner: boolean;
  isFinanceAdmin: boolean;
  isStaffInput: boolean;
}

export function PeriodsTable({ data, loading, onActionClick, isOwner, isFinanceAdmin, isStaffInput }: PeriodsTableProps) {
  if (loading) {
    return <div className="h-64 bg-slate-100 animate-pulse rounded-2xl border border-slate-100"></div>;
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center text-slate-500">
        Belum ada periode finansial yang tercatat.
      </div>
    );
  }

  const getMonthName = (month: number) => {
    const months = ["", "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    return months[month] || "-";
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
            <tr>
              <th className="px-6 py-4">Periode</th>
              <th className="px-6 py-4">Tgl Mulai - Akhir</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Catatan</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/50 transition-colors bg-white">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-800">{getMonthName(row.month)} {row.year}</div>
                </td>
                <td className="px-6 py-4 font-medium text-slate-600">
                  {dayjs(row.startDate).format("DD MMM YYYY")} - {dayjs(row.endDate).format("DD MMM YYYY")}
                </td>
                <td className="px-6 py-4">
                  {row.status === 'OPEN' && (
                     <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                     <LockOpen className="h-3 w-3" /> OPEN
                   </div>
                  )}
                  {row.status === 'LOCKED' && (
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                      <Lock className="h-3 w-3" /> LOCKED
                    </div>
                  )}
                  {row.status === 'CLOSED' && (
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-300">
                      <CheckCircle className="h-3 w-3" /> CLOSED
                    </div>
                  )}
                  {row.lockedAt && row.status !== 'OPEN' && (
                    <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3"/> Locked: {dayjs(row.lockedAt).format("DD MMM YYYY")}
                    </div>
                  )}
                  {row.closedAt && row.status === 'CLOSED' && (
                    <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3"/> Closed: {dayjs(row.closedAt).format("DD MMM YYYY")}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-slate-600 max-w-[200px] truncate">
                  {row.notes || "-"}
                </td>
                <td className="px-6 py-4 text-right">
                  {!isStaffInput && (
                    
                    <div className="flex justify-end gap-2">
                        {row.status === "OPEN" && (
                          <Button size="sm" variant="outline" onClick={() => onActionClick("lock", row)}>Lock</Button>
                        )}
                        {row.status === "LOCKED" && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => onActionClick("close", row)} className="text-emerald-600 border-emerald-200 hover:bg-emerald-50">Close</Button>
                            {isOwner && (
                              <Button size="sm" variant="outline" onClick={() => onActionClick("reopen", row)} className="text-amber-600 border-amber-200 hover:bg-amber-50">Reopen</Button>
                            )}
                          </>
                        )}
                        {row.status === "CLOSED" && isOwner && (
                           <Button size="sm" variant="outline" onClick={() => onActionClick("reopen", row)} className="text-amber-600 border-amber-200 hover:bg-amber-50">Reopen</Button>
                        )}
                    </div>

                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
