import { SalesByCustomerRow } from "../../../../types/order-dashboard";
import { useTranslation } from "../../../../hooks/use-translation";
import { Button } from "../../../../components/ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

const SortIcon = ({ field, sortBy, sortOrder }: { field: string, sortBy?: string, sortOrder?: "asc" | "desc" }) => {
  if (sortBy !== field) return <ArrowUpDown className="ml-2 h-4 w-4" />;
  return sortOrder === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />;
};

interface Props {
  data?: SalesByCustomerRow[];
  loading: boolean;
  meta?: { total: number; page: number; limit: number };
  page?: number;
  limit?: number;
  setPage?: (p: number) => void;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  handleSort?: (field: string) => void;
}

export function SalesByCustomerTable({ data, loading, meta, page, limit, setPage, sortBy, sortOrder, handleSort }: Props) {
  const { t } = useTranslation();
  if (loading) {
    return <div className="h-48 bg-slate-50 animate-pulse rounded-md" />;
  }

  if (!data || data.length === 0) {
    return <div className="text-center py-8 text-slate-500">No data available</div>;
  }

  const formatCurrency = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-md border border-slate-200">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
            <tr>
              <th className="px-4 py-3">{t("orderDashboard.drilldowns.customerCode")}</th>
              <th className="px-4 py-3">{t("orderDashboard.drilldowns.customerName")}</th>
              <th className="px-4 py-3 cursor-pointer select-none" onClick={() => handleSort?.("orderCount")}>
                <div className="flex items-center justify-end">Orders <SortIcon field="orderCount" sortBy={sortBy} sortOrder={sortOrder} /></div>
              </th>
              <th className="px-4 py-3 cursor-pointer select-none" onClick={() => handleSort?.("grossSales")}>
                <div className="flex items-center justify-end">Gross Sales <SortIcon field="grossSales" sortBy={sortBy} sortOrder={sortOrder} /></div>
              </th>
              <th className="px-4 py-3 cursor-pointer select-none" onClick={() => handleSort?.("paidAmount")}>
                <div className="flex items-center justify-end">Paid Amount <SortIcon field="paidAmount" sortBy={sortBy} sortOrder={sortOrder} /></div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row, i) => (
              <tr key={i} className={`hover:bg-slate-50/50 ${!row.linked ? 'bg-amber-50/30' : ''}`}>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{row.customerCode || "-"}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900 flex items-center">
                    {row.customerName}
                    {!row.linked && (
                      <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-700 font-semibold">Unlinked</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">{row.orderCount.toLocaleString('id-ID')}</td>
                <td className="px-4 py-3 text-right font-medium">{formatCurrency(row.grossSales)}</td>
                <td className="px-4 py-3 text-right text-emerald-600">{formatCurrency(row.paidAmount)}</td>
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
