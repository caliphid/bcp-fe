import { UnlinkedOrderRow } from "../../../../types/order-dashboard";
import { useTranslation } from "../../../../hooks/use-translation";
import { Button } from "../../../../components/ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import dayjs from "dayjs";

const SortIcon = ({ field, sortBy, sortOrder }: { field: string, sortBy?: string, sortOrder?: "asc" | "desc" }) => {
  if (sortBy !== field) return <ArrowUpDown className="ml-2 h-4 w-4" />;
  return sortOrder === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />;
};

interface Props {
  data?: UnlinkedOrderRow[];
  loading: boolean;
  meta?: { total: number; page: number; limit: number };
  page?: number;
  limit?: number;
  setPage?: (p: number) => void;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  handleSort?: (field: string) => void;
}

export function UnlinkedOrdersTable({ data, loading, meta, page, limit, setPage, sortBy, sortOrder, handleSort }: Props) {
  const { t } = useTranslation();
  if (loading) {
    return <div className="h-48 bg-slate-50 animate-pulse rounded-md" />;
  }

  if (!data || data.length === 0) {
    return <div className="text-center py-8 text-slate-500">No unlinked orders found for this period.</div>;
  }

  const formatCurrency = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-4">
      <div className="text-xs text-amber-700 bg-amber-50 p-2 rounded mb-2">
        Note: These orders are included in the total sales figures, but are not linked to any recognized customer in the database.
      </div>
      
      <div className="overflow-x-auto rounded-md border border-slate-200">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
            <tr>
              <th className="px-4 py-3">{t("orderDashboard.drilldowns.orderCode")}</th>
              <th className="px-4 py-3 cursor-pointer select-none" onClick={() => handleSort?.("orderDate")}>
                <div className="flex items-center">Date <SortIcon field="orderDate" sortBy={sortBy} sortOrder={sortOrder} /></div>
              </th>
              <th className="px-4 py-3">{t("orderDashboard.drilldowns.customerName")}</th>
              <th className="px-4 py-3">{t("orderDashboard.drilldowns.channel")}</th>
              <th className="px-4 py-3">{t("orderDashboard.drilldowns.status")}</th>
              <th className="px-4 py-3 cursor-pointer select-none" onClick={() => handleSort?.("grandTotal")}>
                <div className="flex items-center justify-end">Grand Total <SortIcon field="grandTotal" sortBy={sortBy} sortOrder={sortOrder} /></div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50/50">
                <td className="px-4 py-3 font-mono text-xs font-semibold text-indigo-600">{row.orderCode}</td>
                <td className="px-4 py-3 text-slate-600">
                  {row.orderDate ? dayjs(row.orderDate).format("DD MMM YYYY, HH:mm") : "-"}
                </td>
                <td className="px-4 py-3 font-medium text-slate-900">{row.customerName || "-"}</td>
                <td className="px-4 py-3">{row.salesChannel}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 w-fit">{row.status}</span>
                    <span className="text-[10px] text-slate-500">Pmt: {row.paymentStatus}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-medium text-slate-900">{formatCurrency(row.grandTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {meta && setPage && page && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-500">
            Showing {(page - 1) * (limit || 10) + 1} to {Math.min(page * (limit || 10), meta.total)} of {meta.total} entries
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={page * (limit || 10) >= meta.total} onClick={() => setPage(page + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}
