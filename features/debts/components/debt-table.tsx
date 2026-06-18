import { DebtItem } from "../../../types/debt";
import { PaginationMeta } from "../../../types/common";
import { DataTable } from "../../../components/ui/data-table";
import { Eye, Pencil } from "lucide-react";
import { formatCurrency, formatDate, getDebtStatusColor, getDebtStatusLabel, getDebtTypeLabel } from "../utils/formatters";
import { useDebtStore } from "../store/debt-store";

interface DebtTableProps {
  data: DebtItem[];
  meta?: PaginationMeta;
  loading: boolean;
  canEdit: boolean;
  onView: (item: DebtItem) => void;
  onEdit: (item: DebtItem) => void;
}

export function DebtTable({
  data,
  meta,
  loading,
  canEdit,
  onView,
  onEdit,
}: DebtTableProps) {
  const { setFilter } = useDebtStore();

  const columns = [
    { 
      header: "Code", 
      accessorKey: "debtCode" as keyof DebtItem,
      cell: (item: DebtItem) => <span className="font-medium text-slate-700">{item.debtCode}</span>
    },
    { 
      header: "Debt Name", 
      cell: (item: DebtItem) => (
        <div>
          <p className="font-medium text-slate-900">{item.debtName}</p>
          <p className="text-xs text-slate-500">{item.lenderName}</p>
        </div>
      )
    },
    {
      header: "Business Unit",
      cell: (item: DebtItem) => <span className="text-sm">{item.businessUnit?.name || "-"}</span>,
    },
    {
      header: "Type",
      cell: (item: DebtItem) => <span className="text-sm">{getDebtTypeLabel(item.type)}</span>,
    },
    {
      header: "Nominal",
      cell: (item: DebtItem) => (
        <div className="text-right">
          <p className="font-medium text-slate-900">{formatCurrency(item.principalAmount)}</p>
          <p className="text-xs text-rose-600">Sisa: {formatCurrency(item.currentBalance)}</p>
        </div>
      ),
    },
    {
      header: "Progress",
      cell: (item: DebtItem) => (
        <div className="w-24">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-500">Terbayar</span>
            <span className="font-medium">{item.progressPercentage}%</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${item.progressPercentage === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
              style={{ width: `${Math.min(item.progressPercentage, 100)}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      header: "Tanggal",
      cell: (item: DebtItem) => (
        <div className="text-xs text-slate-600 space-y-0.5">
          <p>Mulai: {formatDate(item.startDate)}</p>
          <p>Tempo: {formatDate(item.dueDate)}</p>
        </div>
      ),
    },
    {
      header: "Status",
      cell: (item: DebtItem) => (
        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${getDebtStatusColor(item.status)}`}>
          {getDebtStatusLabel(item.status)}
        </span>
      ),
    },
    {
      header: "Aksi",
      className: "text-right",
      cell: (item: DebtItem) => (
        <div className="flex justify-end gap-1">
          <button
            onClick={() => onView(item)}
            title="Lihat Detail"
            className="inline-flex items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
          >
            <Eye className="h-4 w-4" />
          </button>

          {canEdit && (
            <button
              onClick={() => onEdit(item)}
              title="Edit Hutang"
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
