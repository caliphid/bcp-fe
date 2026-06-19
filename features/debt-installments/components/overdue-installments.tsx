import { useOverdueInstallments } from "../hooks/use-overdue-installments";
import { formatCurrency, formatDate, getInstallmentStatusColor, getInstallmentStatusLabel } from "../utils/formatters";
import { AlertCircle, ArrowRight } from "lucide-react";

export function OverdueInstallments() {
  const { data, loading } = useOverdueInstallments();

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-rose-100 p-5 shadow-sm animate-pulse h-48" />
    );
  }

  if (!data || data.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-rose-200 shadow-sm overflow-hidden mb-6">
      <div className="bg-rose-50 px-5 py-4 border-b border-rose-100 flex items-center justify-between">
        <div className="flex items-center gap-2 text-rose-700">
          <AlertCircle className="h-5 w-5" />
          <h3 className="font-semibold text-sm">Overdue Installments</h3>
        </div>
      </div>
      <div className="divide-y divide-slate-100">
        {data.map((item) => (
          <div key={item.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-800 text-sm">{item.debt?.debtName}</p>
              <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                <span>{item.installmentCode}</span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="text-rose-600 font-medium">Due: {formatDate(item.dueDate)}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-rose-600">{formatCurrency(item.remainingAmount)}</p>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-medium ${getInstallmentStatusColor(item.status)}`}>
                {getInstallmentStatusLabel(item.status)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
