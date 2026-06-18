import { Transaction } from "../../../types/transaction";
import { PaginationMeta } from "../../../types/common";
import { DataTable } from "../../../components/ui/data-table";
import { StatusBadge } from "../../../components/ui/status-badge";
import { Eye, Pencil, Ban } from "lucide-react";
import { formatDate, formatCurrency } from "../utils/formatters";
import { useTransactionStore } from "../store/transaction-store";

interface TransactionTableProps {
  data: Transaction[];
  meta?: PaginationMeta;
  loading: boolean;
  canMutate: boolean;
  onView: (item: Transaction) => void;
  onEdit: (item: Transaction) => void;
  onVoid: (item: Transaction) => void;
}

export function TransactionTable({
  data,
  meta,
  loading,
  canMutate,
  onView,
  onEdit,
  onVoid,
}: TransactionTableProps) {
  const { setFilter } = useTransactionStore();

  const columns = [
    {
      header: "Date",
      cell: (item: Transaction) => formatDate(item.transactionDate),
    },
    { header: "Trx Code", accessorKey: "transactionCode" as keyof Transaction },
    {
      header: "Business Unit",
      cell: (item: Transaction) => item.businessUnit?.name || "-",
    },
    {
      header: "Category",
      cell: (item: Transaction) => (
        <div>
          <p className="text-sm">{item.category?.name}</p>
          <p className="text-xs text-slate-500">{item.account?.name}</p>
        </div>
      ),
    },
    {
      header: "Type",
      cell: (item: Transaction) => (
        <span
          className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
            item.type === "IN"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {item.type}
        </span>
      ),
    },
    {
      header: "Amount",
      cell: (item: Transaction) => (
        <span
          className={`font-medium ${item.status === "VOID" ? "line-through text-slate-400" : item.type === "IN" ? "text-emerald-600" : "text-red-600"}`}
        >
          {formatCurrency(item.amount)}
        </span>
      ),
    },
    {
      header: "Status",
      cell: (item: Transaction) => <StatusBadge status={item.status} />,
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (item: Transaction) => (
        <div className="flex justify-end gap-1">
          <button
            onClick={() => onView(item)}
            title="View Details"
            className="inline-flex items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
          >
            <Eye className="h-4 w-4" />
          </button>

          {canMutate && item.status !== "VOID" && (
            <>
              <button
                onClick={() => onEdit(item)}
                title="Edit Transaction"
                className="inline-flex items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
              >
                <Pencil className="h-4 w-4" />
              </button>

              <button
                onClick={() => onVoid(item)}
                title="Void Transaction"
                className="inline-flex items-center justify-center rounded-lg p-2 text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <Ban className="h-4 w-4" />
              </button>
            </>
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
