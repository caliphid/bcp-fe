import { SalesByChannelRow } from "../../../../types/order-dashboard";
import { useTranslation } from "../../../../hooks/use-translation";

interface Props {
  data?: SalesByChannelRow[];
  loading: boolean;
  meta?: { adsAllocationMethod: string };
}

export function SalesByChannelTable({ data, loading, meta }: Props) {
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
      {meta?.adsAllocationMethod && (
        <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded inline-block">
          Ads Allocation Method: {meta.adsAllocationMethod.replace(/_/g, ' ')}
        </div>
      )}
      
      <div className="overflow-x-auto rounded-md border border-slate-200">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
            <tr>
              <th className="px-4 py-3">{t("orderDashboard.drilldowns.channel")}</th>
              <th className="px-4 py-3 text-right">{t("orderDashboard.monthlyReport.orders")}</th>
              <th className="px-4 py-3 text-right">{t("orderDashboard.monthlyReport.grossSales")}</th>
              <th className="px-4 py-3 text-right text-amber-700" title="Estimated Fee">Est. Fee</th>
              <th className="px-4 py-3 text-right text-amber-700" title="Actual Fee">Act. Fee</th>
              <th className="px-4 py-3 text-right font-semibold">Effective Fee</th>
              <th className="px-4 py-3 text-right">{t("orderDashboard.monthlyReport.cogs")}</th>
              <th className="px-4 py-3 text-right">{t("orderDashboard.monthlyReport.adsCost")}</th>
              <th className="px-4 py-3 text-right">{t("orderDashboard.monthlyReport.grossProfit")}</th>
              <th className="px-4 py-3 text-right text-indigo-700">{t("orderDashboard.monthlyReport.netSalesProfit")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50/50">
                <td className="px-4 py-3 font-medium text-slate-900">{row.channel}</td>
                <td className="px-4 py-3 text-right">{row.orderCount.toLocaleString('id-ID')}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(row.grossSales)}</td>
                <td className="px-4 py-3 text-right text-slate-500">{formatCurrency(row.estimatedMarketplaceFee)}</td>
                <td className="px-4 py-3 text-right text-slate-500">{formatCurrency(row.actualMarketplaceFee)}</td>
                <td className="px-4 py-3 text-right font-medium">{formatCurrency(row.effectiveMarketplaceFee)}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(row.cogs)}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(row.adsCost)}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(row.grossProfit)}</td>
                <td className="px-4 py-3 text-right font-bold text-indigo-700">{formatCurrency(row.netSalesProfit)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
