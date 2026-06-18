import { Product } from "../../../types/product";
import { PaginationMeta } from "../../../types/common";
import { DataTable } from "../../../components/ui/data-table";
import { StatusBadge } from "../../../components/ui/status-badge";
import { Pencil } from "lucide-react";
import { useProductStore } from "../store/product-store";

interface ProductTableProps {
  data: Product[];
  meta?: PaginationMeta;
  loading: boolean;
  canMutate: boolean;
  onEdit: (item: Product) => void;
  onToggleStatus: (item: Product) => void;
}

export function ProductTable({
  data,
  meta,
  loading,
  canMutate,
  onEdit,
  onToggleStatus,
}: ProductTableProps) {
  const { setFilter } = useProductStore();

  const formatCurrency = (val: string) => {
    const num = Number(val);
    return isNaN(num) ? "0" : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(num);
  };

  const columns = [
    { header: "Name", accessorKey: "name" as keyof Product },
    { header: "SKU", cell: (item: Product) => item.sku || "-" },
    { 
      header: "Business Unit", 
      cell: (item: Product) => item.businessUnit?.name || "-" 
    },
    { 
      header: "Type", 
      cell: (item: Product) => (
        <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
          {item.type.replace('_', ' ')}
        </span>
      )
    },
    { 
      header: "Price", 
      cell: (item: Product) => formatCurrency(item.defaultPrice)
    },
    {
      header: "Status",
      cell: (item: Product) => (
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
      cell: (item: Product) => (
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
