import { DebtInstallmentItem } from "../../../types/installment";
import { PaginationMeta } from "../../../types/common";
import { DataTable } from "../../../components/ui/data-table";
import { Eye, Pencil } from "lucide-react";
import { formatCurrency, formatDate, getInstallmentStatusColor, getInstallmentStatusLabel } from "../utils/formatters";
import { useInstallmentStore } from "../store/installment-store";

interface InstallmentTableProps {
  data: DebtInstallmentItem[];
  meta?: PaginationMeta;
  loading: boolean;
  canEdit: boolean;
  onView: (item: DebtInstallmentItem) => void;
  onEdit: (item: DebtInstallmentItem) => void;
}

export function InstallmentTable({
  data,
  meta,
  loading,
  canEdit,
  onView,
  onEdit,
}: InstallmentTableProps) {
  const { setFilter } = useInstallmentStore();

  const columns = [
    { 
      header: "Code", 
      cell: (item: DebtInstallmentItem) => (
        <div>
          <span className="font-medium text-slate-700">{item.installmentCode}</span>
          <div className="text-xs text-slate-500">No. {item.installmentNumber}</div>
        </div>
      )
    },
    { 
      header: "Debt", 
      cell: (item: DebtInstallmentItem) => (
        <div>
          <p className="font-medium text-slate-900">{item.debt?.debtName || "-"}</p>
          <p className="text-xs text-slate-500">{item.debt?.debtCode || ""}</p>
        </div>
      )
    },
    {
      header: "Due Date",
      cell: (item: DebtInstallmentItem) => (
        <span className="text-sm font-medium text-slate-700">{formatDate(item.dueDate)}</span>
      ),
    },
    {
      header: "Amount",
      cell: (item: DebtInstallmentItem) => (
        <div className="text-right">
          <p className="font-medium text-slate-900">{formatCurrency(item.amountDue)}</p>
          {parseFloat(item.amountPaid) > 0 && (
            <p className="text-xs text-emerald-600">Paid: {formatCurrency(item.amountPaid)}</p>
          )}
          {parseFloat(item.remainingAmount) > 0 && item.status !== "VOID" && (
            <p className="text-xs text-rose-600">Rem: {formatCurrency(item.remainingAmount)}</p>
          )}
        </div>
      ),
    },
    {
      header: "Status",
      cell: (item: DebtInstallmentItem) => (
        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${getInstallmentStatusColor(item.status)}`}>
          {getInstallmentStatusLabel(item.status)}
        </span>
      ),
    },
    {
      header: "Updated At",
      cell: (item: DebtInstallmentItem) => (
        <span className="text-xs text-slate-500">{formatDate(item.updatedAt)}</span>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (item: DebtInstallmentItem) => (
        <div className="flex justify-end gap-1">
          <button
            onClick={() => onView(item)}
            title="View Details"
            className="inline-flex items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
          >
            <Eye className="h-4 w-4" />
          </button>

          {canEdit && item.status !== "VOID" && (
            <button
              onClick={() => onEdit(item)}
              title="Edit Installment"
              className="inline-flex items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <DataTable
        data={data}
        columns={columns}
        meta={meta}
        onPageChange={(page) => setFilter("page", page)}
        isLoading={loading}
      />
    </div>
  );
}
