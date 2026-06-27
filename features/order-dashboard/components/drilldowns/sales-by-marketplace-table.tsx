import { SalesByMarketplaceRow } from "../../../../types/order-dashboard";
import { useTranslation } from "../../../../hooks/use-translation";

interface Props {
  data?: SalesByMarketplaceRow[];
  loading: boolean;
}

export function SalesByMarketplaceTable({ data, loading }: Props) {
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
              <th className="px-4 py-3">Marketplace Type</th>
              <th className="px-4 py-3">Marketplace Name</th>
              <th className="px-4 py-3 text-right">{t("orderDashboard.monthlyReport.orders")}</th>
              <th className="px-4 py-3 text-right">Gross Amount</th>
              <th className="px-4 py-3 text-right">Fee Amount</th>
              <th className="px-4 py-3 text-right text-indigo-700 font-semibold">Net Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row, i) => (
              <tr key={i} className={`hover:bg-slate-50/50 ${row.marketplaceType === 'UNSETTLED' ? 'bg-amber-50/30' : ''}`}>
                <td className="px-4 py-3 font-medium text-slate-900">
                  {row.marketplaceType === 'UNSETTLED' ? (
                    <span className="text-amber-700 bg-amber-100 px-2 py-0.5 rounded text-xs">{row.marketplaceType}</span>
                  ) : (
                    row.marketplaceType
                  )}
                </td>
                <td className="px-4 py-3">{row.marketplaceName || "-"}</td>
                <td className="px-4 py-3 text-right">{row.orderCount.toLocaleString('id-ID')}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(row.grossAmount)}</td>
                <td className="px-4 py-3 text-right text-red-600">{formatCurrency(row.feeAmount)}</td>
                <td className="px-4 py-3 text-right font-bold text-indigo-700">{formatCurrency(row.netAmount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
