import { AdCampaignItem } from "../../../types/ads";
import { PaginationMeta } from "../../../types/common";
import { DataTable } from "../../../components/ui/data-table";
import { StatusBadge } from "../../../components/ui/status-badge";
import { Pencil, PlayCircle } from "lucide-react";
import { useAdCampaignStore } from "../store/ad-campaign-store";
import { formatCurrency, formatDate } from "../../debts/utils/formatters"; // Reusing formatters

interface AdCampaignListProps {
  data: AdCampaignItem[];
  meta?: PaginationMeta;
  loading: boolean;
  canMutate: boolean;
  onEdit: (item: AdCampaignItem) => void;
  onChangeStatus: (item: AdCampaignItem) => void;
}

export function AdCampaignList({
  data,
  meta,
  loading,
  canMutate,
  onEdit,
  onChangeStatus,
}: AdCampaignListProps) {
  const { setFilter } = useAdCampaignStore();

  const columns = [
    { 
      header: "Campaign Code", 
      accessorKey: "campaignCode" as keyof AdCampaignItem,
      cell: (item: AdCampaignItem) => (
        <span className="font-mono text-xs text-slate-500">{item.campaignCode}</span>
      )
    },
    { 
      header: "Campaign Name", 
      cell: (item: AdCampaignItem) => (
        <div>
          <p className="font-medium text-slate-900">{item.name}</p>
          {item.externalCampaignId && (
            <p className="text-xs text-slate-500 font-mono">ID: {item.externalCampaignId}</p>
          )}
        </div>
      )
    },
    { 
      header: "Business Unit", 
      cell: (item: AdCampaignItem) => item.businessUnit.name
    },
    { 
      header: "Platform", 
      cell: (item: AdCampaignItem) => item.platform.name
    },
    { 
      header: "Period", 
      cell: (item: AdCampaignItem) => (
        <div className="text-sm">
          <div>{formatDate(item.startDate)}</div>
          {item.endDate ? (
            <div className="text-slate-500">to {formatDate(item.endDate)}</div>
          ) : (
            <div className="text-slate-500">No end date</div>
          )}
        </div>
      )
    },
    { 
      header: "Budget", 
      cell: (item: AdCampaignItem) => item.budget ? formatCurrency(item.budget) : "Unlimited"
    },
    {
      header: "Status",
      cell: (item: AdCampaignItem) => (
        <StatusBadge status={item.status} />
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (item: AdCampaignItem) => (
        <div className="flex justify-end gap-2">
          {canMutate && (
            <>
              <button
                onClick={() => onChangeStatus(item)}
                className="inline-flex items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                title="Change Status"
              >
                <PlayCircle className="h-4 w-4" />
              </button>
              <button
                onClick={() => onEdit(item)}
                className="inline-flex items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                title="Edit Campaign"
              >
                <Pencil className="h-4 w-4" />
              </button>
            </>
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
