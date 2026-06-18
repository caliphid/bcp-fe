import { Account } from "../../../types/account";
import { PaginationMeta } from "../../../types/common";
import { DataTable } from "../../../components/ui/data-table";
import { StatusBadge } from "../../../components/ui/status-badge";
import { Pencil } from "lucide-react";
import { useAccountStore } from "../store/account-store";

interface AccountTableProps {
  data: Account[];
  meta?: PaginationMeta;
  loading: boolean;
  canMutate: boolean;
  onEdit: (item: Account) => void;
  onToggleStatus: (item: Account) => void;
}

export function AccountTable({
  data,
  meta,
  loading,
  canMutate,
  onEdit,
  onToggleStatus,
}: AccountTableProps) {
  const { setFilter } = useAccountStore();

  const formatCurrency = (val: string) => {
    const num = Number(val);
    return isNaN(num) ? "0" : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(num);
  };

  const columns = [
    { header: "Name", accessorKey: "name" as keyof Account },
    { 
      header: "Business Unit", 
      cell: (item: Account) => item.businessUnit?.name || "-" 
    },
    { 
      header: "Type", 
      cell: (item: Account) => (
        <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
          {item.type}
        </span>
      )
    },
    { 
      header: "Current Balance", 
      cell: (item: Account) => formatCurrency(item.currentBalance)
    },
    {
      header: "Status",
      cell: (item: Account) => (
        <StatusBadge
          status={item.status}
          canToggle={canMutate}
          onToggle={() => onToggleStatus(item)}
        />
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (item: Account) => (
        <div className="flex justify-end gap-2">
          {canMutate && (
            <button
              onClick={() => onEdit(item)}
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
    <DataTable
      data={data}
      columns={columns}
      meta={meta}
      onPageChange={(page) => setFilter("page", page)}
      isLoading={loading}
    />
  );
}
