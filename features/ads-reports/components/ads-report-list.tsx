import { AdsReportItem } from "../../../types/ads";
import { PaginationMeta } from "../../../types/common";
import { DataTable } from "../../../components/ui/data-table";
import { StatusBadge } from "../../../components/ui/status-badge";
import { ChevronRight } from "lucide-react";
import { useAdsReportStore } from "../store/ads-report-store";
import { formatCurrency, formatDate } from "../../debts/utils/formatters";
import Link from "next/link";
import { cn } from "../../../lib/utils";

interface AdsReportListProps {
  data: AdsReportItem[];
  meta?: PaginationMeta;
  loading: boolean;
}

export function AdsReportList({
  data,
  meta,
  loading,
}: AdsReportListProps) {
  const { setFilter } = useAdsReportStore();

  const columns = [
    { 
      header: "Date & Code", 
      cell: (item: AdsReportItem) => (
        <div>
          <p className="font-medium text-slate-900">{formatDate(item.reportDate)}</p>
          <p className="text-xs text-slate-500 font-mono mt-0.5">{item.reportCode}</p>
        </div>
      )
    },
    { 
      header: "Platform / Campaign", 
      cell: (item: AdsReportItem) => (
        <div>
          <p className="font-medium text-slate-900">{item.platform.name}</p>
          {item.campaign ? (
            <p className="text-xs text-slate-500 mt-0.5">{item.campaign.name}</p>
          ) : (
            <p className="text-xs text-slate-400 italic mt-0.5">No Campaign</p>
          )}
        </div>
      )
    },
    { 
      header: "Revenue", 
      cell: (item: AdsReportItem) => (
        <div>
          <p className="font-medium text-emerald-600">{formatCurrency(item.totalRevenue)}</p>
          <p className="text-xs text-slate-500 mt-0.5">{item.totalOrders} orders</p>
        </div>
      )
    },
    { 
      header: "Ad Spend", 
      cell: (item: AdsReportItem) => (
        <span className="font-medium text-rose-600">{formatCurrency(item.adSpend)}</span>
      )
    },
    { 
      header: "Net Profit", 
      cell: (item: AdsReportItem) => {
        const profit = parseFloat(item.netProfit || "0");
        const isLoss = profit < 0;
        return (
          <div>
            <p className={cn("font-medium", isLoss ? "text-rose-600" : "text-emerald-600")}>
              {formatCurrency(item.netProfit)}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Margin: {item.profitMargin}%</p>
          </div>
        );
      }
    },
    { 
      header: "ROAS", 
      cell: (item: AdsReportItem) => (
        <span className={cn(
          "inline-flex items-center rounded-md px-2 py-1 text-xs font-bold",
          item.roas >= 2 ? "bg-emerald-100 text-emerald-700" :
          item.roas >= 1 ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
        )}>
          {item.roas}x
        </span>
      )
    },
    {
      header: "Status",
      cell: (item: AdsReportItem) => (
        <StatusBadge status={item.status} />
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (item: AdsReportItem) => (
        <div className="flex justify-end gap-2">
          <Link
            href={`/dashboard/ads-reports/${item.id}`}
            className="inline-flex items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
            title="View Details"
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
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
