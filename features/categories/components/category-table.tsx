import { Category } from "../../../types/category";
import { PaginationMeta } from "../../../types/common";
import { DataTable } from "../../../components/ui/data-table";
import { StatusBadge } from "../../../components/ui/status-badge";
import { Pencil } from "lucide-react";
import { useCategoryStore } from "../store/category-store";

interface CategoryTableProps {
  data: Category[];
  allCategories: Category[];
  meta?: PaginationMeta;
  loading: boolean;
  canMutate: boolean;
  onEdit: (item: Category) => void;
  onToggleStatus: (item: Category) => void;
}

export function CategoryTable({
  data,
  allCategories,
  meta,
  loading,
  canMutate,
  onEdit,
  onToggleStatus,
}: CategoryTableProps) {
  const { setFilter } = useCategoryStore();

  const getParentName = (parentId?: string) => {
    if (!parentId) return "-";
    const parent = allCategories.find((c) => c.id === parentId);
    return parent ? parent.name : "-";
  };

  const columns = [
    { header: "Name", accessorKey: "name" as keyof Category },
    { 
      header: "Parent Category", 
      cell: (item: Category) => getParentName(item.parentId)
    },
    { 
      header: "Type", 
      cell: (item: Category) => (
        <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
          {item.type}
        </span>
      )
    },
    { header: "Description", accessorKey: "description" as keyof Category },
    {
      header: "Status",
      cell: (item: Category) => (
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
      cell: (item: Category) => (
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
