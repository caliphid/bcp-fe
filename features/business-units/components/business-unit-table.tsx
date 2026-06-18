import { BusinessUnit } from "../../../types/business-unit";
import { PaginationMeta } from "../../../types/common";
import { DataTable } from "../../../components/ui/data-table";
import { StatusBadge } from "../../../components/ui/status-badge";
import { Pencil } from "lucide-react";
import { useBusinessUnitStore } from "../store/business-unit-store";

interface BusinessUnitTableProps {
  data: BusinessUnit[];
  meta?: PaginationMeta;
  loading: boolean;
  canMutate: boolean;
  onEdit: (item: BusinessUnit) => void;
  onToggleStatus: (item: BusinessUnit) => void;
}

export function BusinessUnitTable({
  data,
  meta,
  loading,
  canMutate,
  onEdit,
  onToggleStatus,
}: BusinessUnitTableProps) {
  const { setFilter } = useBusinessUnitStore();

  const columns = [
    { header: "Name", accessorKey: "name" as keyof BusinessUnit },
    { header: "Description", accessorKey: "description" as keyof BusinessUnit },
    {
      header: "Status",
      cell: (item: BusinessUnit) => (
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
      cell: (item: BusinessUnit) => (
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
