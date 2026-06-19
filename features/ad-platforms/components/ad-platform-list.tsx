import { AdPlatformItem } from "../../../types/ads";
import { PaginationMeta } from "../../../types/common";
import { DataTable } from "../../../components/ui/data-table";
import { StatusBadge } from "../../../components/ui/status-badge";
import { Pencil } from "lucide-react";
import { useAdPlatformStore } from "../store/ad-platform-store";

interface AdPlatformListProps {
  data: AdPlatformItem[];
  meta?: PaginationMeta;
  loading: boolean;
  canMutate: boolean;
  onEdit: (item: AdPlatformItem) => void;
  onToggleStatus: (item: AdPlatformItem) => void;
}

export function AdPlatformList({
  data,
  meta,
  loading,
  canMutate,
  onEdit,
  onToggleStatus,
}: AdPlatformListProps) {
  const { setFilter } = useAdPlatformStore();

  const columns = [
    { header: "Platform Name", accessorKey: "name" as keyof AdPlatformItem },
    { header: "Description", accessorKey: "description" as keyof AdPlatformItem },
    {
      header: "Status",
      cell: (item: AdPlatformItem) => (
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
      cell: (item: AdPlatformItem) => (
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
