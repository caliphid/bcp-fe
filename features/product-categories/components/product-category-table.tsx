import { ProductCategory } from "../../../types/product-category";
import { DataTable } from "../../../components/ui/data-table";
import { StatusBadge } from "../../../components/ui/status-badge";
import { Pencil } from "lucide-react";

interface Props {
  data: ProductCategory[];
  loading: boolean;
  canMutate: boolean;
  onEdit: (item: ProductCategory) => void;
}

export function ProductCategoryTable({ data, loading, canMutate, onEdit }: Props) {
  const columns = [
    { header: "Name", accessorKey: "name" as keyof ProductCategory },
    { header: "Description", accessorKey: "description" as keyof ProductCategory },
    {
      header: "Status",
      cell: (item: ProductCategory) => (
        <StatusBadge
          status={item.status}
          canToggle={false}
          onToggle={() => {}}
        />
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (item: ProductCategory) => (
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
      isLoading={loading}
    />
  );
}
